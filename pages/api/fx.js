/* pages/api/fx.js (added 2026-11-01) — monthly USD → CAD rate (admin)
   GET ?month=YYYY-MM          → { month, usdCad | null }
   PUT { month, usdCad }       → saves the rate used to convert that month's
                                 USD orders to CAD for commission. */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { MONTH_RE } from '../../lib/payrollData'

export default async function handler(req, res) {
  try {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
    await ensureTables()

    if (req.method === 'GET') {
      const month = String(req.query.month || '')
      if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })
      const { rows } = await sql`SELECT usd_cad FROM fx_rates WHERE month = ${month}`
      return res.status(200).json({ month, usdCad: rows.length ? Number(rows[0].usd_cad) : null })
    }

    if (req.method === 'PUT') {
      const b = req.body || {}
      const month = String(b.month || '')
      const rate = Number(b.usdCad)
      if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })
      if (!Number.isFinite(rate) || rate < 0.5 || rate > 3) return res.status(400).json({ error: 'Enter a rate such as 1.37.' })
      await sql`INSERT INTO fx_rates (month, usd_cad) VALUES (${month}, ${rate})
                ON CONFLICT (month) DO UPDATE SET usd_cad = ${rate}, updated_at = NOW()`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
