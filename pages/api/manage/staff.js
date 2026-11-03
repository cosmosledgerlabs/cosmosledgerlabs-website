/* pages/api/manage/staff.js (added 2026-11-02)
   GET ?month=YYYY-MM (manager or owner) — every staff member's month:
   hours, days worked, orders, paid orders, valid complaints, fines and pay
   (same calculation as the owner's payroll), plus the active staff list
   for the complaint form. Managers can view but not change pay rules. */

import { ensureTables, sql } from '../../../lib/db'
import { currentManager } from '../../../lib/managerAuth'
import { loadPayroll, MONTH_RE } from '../../../lib/payrollData'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
    await ensureTables()
    const who = await currentManager(req)
    if (!who) return res.status(401).json({ error: 'unauthorized' })
    const month = String(req.query.month || '')
    if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })
    const p = await loadPayroll(month)
    const { rows: active } = await sql`SELECT id, name FROM staff WHERE active = TRUE ORDER BY name`
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ month, usdCad: p.usdCad, usdCadEntered: p.usdCadEntered,
      staff: p.staff, totals: p.totals, paidOrdersCad: p.paidOrdersCad, activeStaff: active })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
