/* pages/api/settle.js
   GET (admin) ?month=YYYY-MM — the full monthly payroll for every staff
   member, calculated automatically (2026-11-01) from:
     • clock in / clock out shifts           (/team)
     • orders credited to them, PAID only    (staff picked on /pay)
     • Ontario statutory holidays            (worked out automatically)
     • the month's USD → CAD rate             (/admin)
     • pay rules in lib/settings.js
   Add ?format=csv to download it as a spreadsheet. All money in CAD. */

import { ensureTables, isAdmin } from '../../lib/db'
import { loadPayroll, MONTH_RE } from '../../lib/payrollData'

function csvCell(v) {
  const s = String(v === null || v === undefined ? '' : v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export default async function handler(req, res) {
  try {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
    await ensureTables()
    const month = String(req.query.month || '')
    if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })

    const p = await loadPayroll(month)

    if (req.query.format === 'csv') {
      const head = ['Staff', 'Full-time', 'Hourly rate', 'Hours', 'Days worked', 'Hours pay',
        'Orders credited', 'Paid orders', 'Paid amount (CAD)', 'Commission',
        'Holiday days worked', 'Holiday bonus', 'Attendance award', 'Internet subsidy',
        'Gross pay', 'Valid complaints', 'Complaint fines deducted',
        'TOTAL PAY (CAD)', 'Shifts missing clock-out']
      const lines = [head.map(csvCell).join(',')]
      p.staff.forEach((s) => {
        lines.push([s.name, s.fullTime ? 'yes' : 'no', s.hourlyRate, s.hours, s.daysWorked, s.hoursPay,
          s.ordersCredited, s.paidOrders, s.paidAmountCad, s.commission,
          s.holidayDaysWorked.join(' '), s.holidayBonus, s.attendanceAward, s.internetSubsidy,
          s.grossPay, s.complaints.length, s.finesDeducted,
          s.totalPay, s.openShifts].map(csvCell).join(','))
      })
      lines.push(['TOTAL', '', '', p.totals.hours, '', p.totals.hoursPay, '', '', '', p.totals.commission,
        '', p.totals.holidayBonus, p.totals.attendanceAward, p.totals.internetSubsidy,
        p.totals.grossPay, '', p.totals.fines, p.totals.totalPay, '']
        .map(csvCell).join(','))
      lines.push('')
      lines.push(csvCell('USD to CAD rate used') + ',' + p.usdCad + (p.usdCadEntered ? '' : ' (default — not entered)'))
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="cosmos-payroll-' + month + '.csv"')
      return res.status(200).send('\uFEFF' + lines.join('\r\n'))
    }

    return res.status(200).json(p)
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
