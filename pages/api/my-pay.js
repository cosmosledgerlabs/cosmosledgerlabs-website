/* pages/api/my-pay.js (added 2026-11-01)
   GET ?month=YYYY-MM (staff, header x-staff-token)
   The logged-in staff member's own pay for the month — never anyone
   else's. Same calculation as the admin settlement (lib/payroll.js). */

import { ensureTables } from '../../lib/db'
import { currentStaff } from '../../lib/staffAuth'
import { loadPayroll, MONTH_RE } from '../../lib/payrollData'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
    await ensureTables()
    const me = await currentStaff(req)
    if (!me) return res.status(401).json({ error: 'Please log in again.' })
    const month = String(req.query.month || '')
    if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })

    const p = await loadPayroll(month)
    const mine = p.staff.find((s) => s.staffId === me.id) || null
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      month,
      usdCad: p.usdCad,
      usdCadEntered: p.usdCadEntered,
      holidays: p.holidays,
      rules: {
        commissionRate: p.settings.commissionRate,
        holidayBonusPerDay: p.settings.holidayBonusPerDay,
        attendanceAwardPerMonth: p.settings.attendanceAwardPerMonth,
        attendanceRequiredDays: p.settings.attendanceRequiredDays,
        internetSubsidyPerMonth: p.settings.internetSubsidyPerMonth,
        minHoursForDay: p.settings.minHoursForDay,
      },
      pay: mine,
    })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
