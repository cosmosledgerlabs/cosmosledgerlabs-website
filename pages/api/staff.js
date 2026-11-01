/* pages/api/staff.js (added 2026-11-01)
   GET  ?public=1          (anyone)  — active staff names for the order page
                                      dropdown and the /team login: [{ id, name }]
   GET                     (admin)   — full staff list
   POST  { name, pin, hourlyRate, fullTime }            (admin) — add a person
   PATCH { id, name?, pin?, hourlyRate?, fullTime?, active? } (admin) — edit,
         reset PIN, or deactivate (people are never deleted, so past pay
         records stay correct). */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { hashPin, validPin } from '../../lib/staffAuth'

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,38}[\p{L}\p{M}.]?$/u

function cleanName(v) {
  return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 40)
}

export default async function handler(req, res) {
  try {
    await ensureTables()

    if (req.method === 'GET' && req.query && req.query.public) {
      const { rows } = await sql`SELECT id, name FROM staff WHERE active = TRUE ORDER BY name`
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ staff: rows })
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT id, name, hourly_rate, full_time, active,
          (locked_until IS NOT NULL AND locked_until > NOW()) AS locked,
          to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS created
        FROM staff ORDER BY active DESC, name`
      return res.status(200).json({ staff: rows })
    }

    if (req.method === 'POST') {
      const b = req.body || {}
      const name = cleanName(b.name)
      const rate = Number(b.hourlyRate)
      if (!NAME_RE.test(name)) return res.status(400).json({ error: 'Enter a name (letters only, up to 40).' })
      if (!validPin(b.pin)) return res.status(400).json({ error: 'PIN must be 4 to 8 digits.' })
      if (!Number.isFinite(rate) || rate < 0 || rate > 1000) return res.status(400).json({ error: 'Enter an hourly rate.' })
      const dup = await sql`SELECT id FROM staff WHERE lower(name) = lower(${name})`
      if (dup.rows.length) return res.status(400).json({ error: 'That name is already used — add a surname initial.' })
      await sql`INSERT INTO staff (name, pin_hash, hourly_rate, full_time)
                VALUES (${name}, ${hashPin(b.pin)}, ${rate}, ${b.fullTime === true})`
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'PATCH') {
      const b = req.body || {}
      const id = Number(b.id)
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
      if (b.name !== undefined) {
        const name = cleanName(b.name)
        if (!NAME_RE.test(name)) return res.status(400).json({ error: 'Enter a name (letters only, up to 40).' })
        const dup = await sql`SELECT id FROM staff WHERE lower(name) = lower(${name}) AND id <> ${id}`
        if (dup.rows.length) return res.status(400).json({ error: 'That name is already used.' })
        await sql`UPDATE staff SET name = ${name} WHERE id = ${id}`
        await sql`UPDATE orders SET rep = ${name} WHERE rep_id = ${id}`
      }
      if (b.pin !== undefined) {
        if (!validPin(b.pin)) return res.status(400).json({ error: 'PIN must be 4 to 8 digits.' })
        await sql`UPDATE staff SET pin_hash = ${hashPin(b.pin)}, failed_logins = 0, locked_until = NULL WHERE id = ${id}`
      }
      if (b.hourlyRate !== undefined) {
        const rate = Number(b.hourlyRate)
        if (!Number.isFinite(rate) || rate < 0 || rate > 1000) return res.status(400).json({ error: 'Enter an hourly rate.' })
        await sql`UPDATE staff SET hourly_rate = ${rate} WHERE id = ${id}`
      }
      if (b.fullTime !== undefined) await sql`UPDATE staff SET full_time = ${b.fullTime === true} WHERE id = ${id}`
      if (b.active !== undefined) await sql`UPDATE staff SET active = ${b.active === true} WHERE id = ${id}`
      if (b.unlock === true) await sql`UPDATE staff SET failed_logins = 0, locked_until = NULL WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
