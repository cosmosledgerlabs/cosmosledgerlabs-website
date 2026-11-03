/* pages/api/managers.js (added 2026-11-02) — manager accounts (OWNER only,
   admin passcode). Managers log in on /manage with their own username and
   password.
   GET                                       → list
   POST  { username, name, password }        → add a manager
   PATCH { id, name?, password?, active?, unlock? } → edit, reset password,
         deactivate / reactivate, unlock after wrong passwords.
   Managers are never deleted, so the activity log stays readable. */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { hashPassword, validPassword, USERNAME_RE, logAction } from '../../lib/managerAuth'

const OWNER = { role: 'owner', name: 'Owner' }
const cleanName = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 40)

export default async function handler(req, res) {
  try {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
    await ensureTables()

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT id, username, name, active,
          (locked_until IS NOT NULL AND locked_until > NOW()) AS locked,
          to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS created
        FROM managers ORDER BY active DESC, name`
      return res.status(200).json({ managers: rows })
    }

    if (req.method === 'POST') {
      const b = req.body || {}
      const username = String(b.username || '').trim().toLowerCase()
      const name = cleanName(b.name)
      if (!USERNAME_RE.test(username)) return res.status(400).json({ error: 'Username: 3–30 characters, letters, numbers, dot, dash or underscore.' })
      if (!name) return res.status(400).json({ error: 'Enter the manager\'s name.' })
      if (!validPassword(b.password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
      const dup = await sql`SELECT id FROM managers WHERE username = ${username}`
      if (dup.rows.length) return res.status(400).json({ error: 'That username is already used.' })
      await sql`INSERT INTO managers (username, name, pass_hash) VALUES (${username}, ${name}, ${hashPassword(b.password)})`
      await logAction(OWNER, 'manager added', name + ' (' + username + ')')
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'PATCH') {
      const b = req.body || {}
      const id = Number(b.id)
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
      const { rows } = await sql`SELECT name FROM managers WHERE id = ${id}`
      if (!rows.length) return res.status(404).json({ error: 'not found' })
      const who = rows[0].name
      if (b.name !== undefined) {
        const name = cleanName(b.name)
        if (!name) return res.status(400).json({ error: 'Enter the manager\'s name.' })
        await sql`UPDATE managers SET name = ${name} WHERE id = ${id}`
      }
      if (b.password !== undefined) {
        if (!validPassword(b.password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
        await sql`UPDATE managers SET pass_hash = ${hashPassword(b.password)}, failed_logins = 0, locked_until = NULL WHERE id = ${id}`
        await logAction(OWNER, 'manager password reset', who)
      }
      if (b.active !== undefined) {
        await sql`UPDATE managers SET active = ${b.active === true} WHERE id = ${id}`
        await logAction(OWNER, b.active === true ? 'manager reactivated' : 'manager deactivated', who)
      }
      if (b.unlock === true) await sql`UPDATE managers SET failed_logins = 0, locked_until = NULL WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
