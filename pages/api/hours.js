/* pages/api/hours.js
   POST   (team or admin passcode) — record a worked day
   GET    (admin) — list a month's entries: ?month=YYYY-MM
   DELETE (admin) — remove an entry: { id }                    */

import { ensureTables, sql, isAdmin, isTeam } from '../../lib/db'
import { REPS } from '../../lib/settings'

export default async function handler(req, res) {
  try {
    await ensureTables()

    if (req.method === 'POST') {
      if (!isTeam(req)) return res.status(401).json({ error: 'unauthorized' })
      const b = req.body || {}
      const hours = Number(b.hours)
      const ok =
        REPS.includes(b.rep) &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(b.date)) &&
        Number.isFinite(hours) && hours > 0 && hours <= 24
      if (!ok) return res.status(400).json({ error: 'invalid entry' })
      await sql`INSERT INTO hours (work_date, rep, hours, holiday, note)
                VALUES (${b.date}, ${b.rep}, ${hours}, ${b.holiday === true},
                        ${String(b.note || '').slice(0, 200)})`
      return res.status(200).json({ ok: true })
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const month = String(req.query.month || '')
      if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'invalid month' })
      const { rows } = await sql`SELECT id, to_char(work_date, 'YYYY-MM-DD') AS work_date,
                rep, hours, holiday, note
                FROM hours WHERE to_char(work_date, 'YYYY-MM') = ${month}
                ORDER BY work_date, rep`
      return res.status(200).json({ hours: rows })
    }

    if (req.method === 'DELETE') {
      const id = Number((req.body || {}).id)
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
      await sql`DELETE FROM hours WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
