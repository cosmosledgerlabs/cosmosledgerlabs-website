/* pages/api/manage/dashboard.js (added 2026-11-02) — management dashboard
   GET (manager or owner) → everything for the TODAY screen of /manage:
     • today (Toronto): orders created / paid / unpaid, money received by
       channel, and the DAILY CHECK result (✅ / ⚠)
     • this month: orders, paid orders and amounts, vouchers, complaints
     • who is clocked in right now, and who is on a break (2026-11-02)
     • rest-time problems this month (missed breaks, short rest)
     • the latest orders */

import { ensureTables, sql } from '../../../lib/db'
import { currentManager } from '../../../lib/managerAuth'
import { loadDailyCheck } from '../../../lib/dailyCheckData'
import { loadRest, monthRange } from '../../../lib/restData'
import { SETTINGS } from '../../../lib/settings'

const r2 = (n) => Math.round(Number(n || 0) * 100) / 100
const byCur = (rows, field) => {
  const t = { CAD: 0, USD: 0 }
  rows.forEach((x) => { t[x.currency === 'USD' ? 'USD' : 'CAD'] += Number(x[field] || 0) })
  return { CAD: r2(t.CAD), USD: r2(t.USD) }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
    await ensureTables()
    const who = await currentManager(req)
    if (!who) return res.status(401).json({ error: 'unauthorized' })

    const { rows: [now] } = await sql`SELECT
        to_char(NOW() AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS day,
        to_char(NOW() AT TIME ZONE 'America/Toronto', 'YYYY-MM') AS month,
        to_char(NOW() AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS time`
    const day = now.day
    const month = now.month

    const today = await loadDailyCheck(day)

    // This month: orders created, and orders PAID (by payment date).
    const { rows: created } = await sql`SELECT currency, amount FROM orders
      WHERE to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}`
    const { rows: paid } = await sql`SELECT currency, amount FROM orders
      WHERE status = 'PAID' AND to_char(paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}`
    const { rows: vIssued } = await sql`SELECT currency, amount FROM vouchers
      WHERE to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}`
    const { rows: vUsed } = await sql`SELECT currency, amount FROM vouchers
      WHERE used_at IS NOT NULL AND to_char(used_at AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}`
    const { rows: comp } = await sql`SELECT status, COUNT(*)::int AS n, COALESCE(SUM(fine_amount), 0) AS fines
      FROM complaints
      WHERE status = 'open'
         OR to_char(COALESCE(decided_at, created_at) AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}
      GROUP BY status`
    const cs = { open: 0, valid: 0, rejected: 0, fines: 0 }
    comp.forEach((c) => { cs[c.status] = c.n; if (c.status === 'valid') cs.fines = r2(c.fines) })

    const { rows: onShift } = await sql`SELECT st.name,
        to_char(sh.clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS since,
        ROUND((EXTRACT(EPOCH FROM (NOW() - sh.clock_in)) / 3600.0)::numeric, 1) AS hours,
        to_char(b.start_at AT TIME ZONE 'America/Toronto', 'HH24:MI') AS break_since,
        FLOOR(EXTRACT(EPOCH FROM (NOW() - b.start_at)) / 60.0) AS break_minutes
      FROM shifts sh JOIN staff st ON st.id = sh.staff_id
      LEFT JOIN breaks b ON b.shift_id = sh.id AND b.end_at IS NULL
      WHERE sh.clock_out IS NULL ORDER BY sh.clock_in`

    const { from, to } = monthRange(month)
    const rest = await loadRest(from, to)
    const restToday = rest.staff.map((s) => ({ name: s.name,
      missedEating: s.missedEating.filter((x) => x.date === day).length,
      longBreaks: s.longBreaks.filter((x) => x.date === day).length,
      shortGaps: s.shortGaps.filter((x) => x.date === day).length }))
      .filter((s) => s.missedEating + s.longBreaks + s.shortGaps > 0)

    const { rows: latest } = await sql`SELECT id, amount, currency, method, rep, status, voucher_code,
        to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created
      FROM orders ORDER BY created_at DESC LIMIT 10`

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      you: who.name,
      now: now.time,
      day,
      month,
      today,
      monthTotals: {
        ordersCreated: created.length,
        createdAmount: byCur(created, 'amount'),
        ordersPaid: paid.length,
        paidAmount: byCur(paid, 'amount'),
        vouchersIssued: vIssued.length,
        vouchersIssuedAmount: byCur(vIssued, 'amount'),
        vouchersUsed: vUsed.length,
        vouchersUsedAmount: byCur(vUsed, 'amount'),
        complaints: cs,
      },
      onShift: onShift.map((s) => ({ name: s.name, since: s.since, hours: Number(s.hours),
        onBreak: s.break_since ? { since: s.break_since, minutes: Number(s.break_minutes) } : null })),
      breakMinutes: SETTINGS.breakMinutes,
      restIssuesMonth: rest.issues,
      restToday,
      latest: latest.map((o) => ({ ...o, amount: Number(o.amount) })),
    })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
