/* pages/api/settle.js
   GET (admin) ?month=YYYY-MM — full monthly settlement.
   Rep names come from the month's recorded orders and hours.
   Rates/full-time status come from REP_INFO in lib/settings.js;
   names without an entry there get hourlyRate 0 and no full-time
   bonuses until you add them.                                     */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { SETTINGS, REP_INFO } from '../../lib/settings'

export default async function handler(req, res) {
  try {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
    await ensureTables()

    const month = String(req.query.month || '')
    if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'invalid month' })

    const orders = (await sql`SELECT rep, amount, currency, status FROM orders
      WHERE to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}`).rows
    const hours = (await sql`SELECT rep, hours, holiday, work_date FROM hours
      WHERE to_char(work_date, 'YYYY-MM') = ${month}`).rows

    const per = {}
    const ensure = (r) => {
      if (!per[r]) {
        per[r] = { rep: r, orders: 0, paidOrders: 0, orderAmount: 0, commission: 0,
                   hours: 0, hoursPay: 0, holidayDays: 0, holidayBonus: 0,
                   daysWorked: 0, attendanceAward: 0, internetSubsidy: 0, totalPay: 0 }
      }
      return per[r]
    }

    let totalOrderAmount = 0, paidOrderAmount = 0, ordersCount = orders.length
    for (const o of orders) {
      const amt = Number(o.amount)
      totalOrderAmount += amt
      if (o.status === 'PAID') paidOrderAmount += amt
      if (o.rep) {
        const p = ensure(o.rep)
        p.orders += 1
        if (o.status === 'PAID') {
          p.paidOrders += 1
          p.orderAmount += amt
          p.commission += amt * SETTINGS.commissionRate
        }
      }
    }

    const seenDays = {}
    for (const h of hours) {
      if (!h.rep) continue
      const p = ensure(h.rep)
      const info = REP_INFO[h.rep] || { hourlyRate: 0, fullTime: false }
      p.hours += Number(h.hours)
      p.hoursPay += Number(h.hours) * info.hourlyRate
      const key = h.rep + '|' + h.work_date
      if (!seenDays[key]) { seenDays[key] = true; p.daysWorked += 1 }
      if (h.holiday && info.fullTime) {
        p.holidayDays += 1
        p.holidayBonus += SETTINGS.holidayBonusPerDay
      }
    }

    const names = Object.keys(per).sort()
    let totals = { commission: 0, hoursPay: 0, holidayBonus: 0,
                   attendanceAwards: 0, internetSubsidy: 0, totalPayout: 0 }
    for (const r of names) {
      const p = per[r]
      const info = REP_INFO[r] || { fullTime: false }
      if (info.fullTime && p.daysWorked >= SETTINGS.attendanceRequiredDays)
        p.attendanceAward = SETTINGS.attendanceAwardPerMonth
      if (p.daysWorked > 0) p.internetSubsidy = SETTINGS.internetSubsidyPerMonth
      p.totalPay = p.commission + p.hoursPay + p.holidayBonus + p.attendanceAward + p.internetSubsidy
      totals.commission += p.commission
      totals.hoursPay += p.hoursPay
      totals.holidayBonus += p.holidayBonus
      totals.attendanceAwards += p.attendanceAward
      totals.internetSubsidy += p.internetSubsidy
      totals.totalPayout += p.totalPay
    }

    return res.status(200).json({
      month,
      settings: SETTINGS,
      ordersCount,
      totalOrderAmount,
      paidOrderAmount,
      totals,
      net: paidOrderAmount - totals.totalPayout,
      perRep: names.map((r) => per[r]),
    })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
