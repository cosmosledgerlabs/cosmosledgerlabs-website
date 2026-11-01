/* pages/api/hours.js
   2026-11-01: hours are now recorded by clock in / clock out on /team
   (pages/api/attendance.js). New typed-name entries are no longer accepted,
   so nobody can log hours under someone else's name. Old entries can still
   be listed and deleted, and still count in payroll when the name matches.
   POST   — closed (returns 410)
   GET    (admin) — list a month's entries: ?month=YYYY-MM
   DELETE (admin) — remove an entry: { id }                    */

import { ensureTables, sql, isAdmin } from '../../lib/db'

export default async function handler(req, res) {
  try {
    await ensureTables()

    if (req.method === 'POST') {
      return res.status(410).json({ error: 'Hours are recorded by clocking in and out on the Team page.' })
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
