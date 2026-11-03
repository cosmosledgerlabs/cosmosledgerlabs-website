/* lib/dailyCheckData.js (added 2026-11-02)
   Loads one day of orders, payments and Interac emails from the database
   and runs the DAILY CHECK (lib/dailyCheck.js). Shared by /api/daily-check
   (owner and managers) and the management dashboard. Days are Toronto days. */

import { sql } from './db'
import { computeDailyCheck, STALE_HOURS } from './dailyCheck'

export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

export function validDay(d) {
  if (!DAY_RE.test(d)) return false
  const t = new Date(d + 'T12:00:00Z')
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d
}

function csvCell(v) {
  const s = String(v === null || v === undefined ? '' : v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export async function loadDailyCheck(day) {
  const { rows: orders } = await sql`
    SELECT id, amount, currency, method, rep, rep_id, status, paid_via, amount_received, voucher_code, voucher_amount,
      to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS created_day,
      to_char(paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS paid_day,
      to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created,
      to_char(paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS paid
    FROM orders
    WHERE (created_at AT TIME ZONE 'America/Toronto')::date = ${day}::date
       OR (paid_at AT TIME ZONE 'America/Toronto')::date = ${day}::date
    ORDER BY created_at`
  const { rows: stale } = await sql`
    SELECT id, amount, currency, method, rep,
      to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created
    FROM orders
    WHERE status = 'UNPAID'
      AND (created_at AT TIME ZONE 'America/Toronto')::date = ${day}::date
      AND created_at < NOW() - make_interval(hours => ${STALE_HOURS}::int)
    ORDER BY created_at LIMIT 200`
  const { rows: emtLog } = await sql`
    SELECT order_id, amount, result, sender,
      to_char(COALESCE(received_at, created_at) AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS received
    FROM emt_log
    WHERE (COALESCE(received_at, created_at) AT TIME ZONE 'America/Toronto')::date = ${day}::date
    ORDER BY COALESCE(received_at, created_at)`
  const { rows: st } = await sql`SELECT channel, amount FROM daily_received WHERE day = ${day}::date`
  const statements = {}
  st.forEach((r) => { statements[r.channel] = Number(r.amount) })
  return computeDailyCheck({
    day,
    orders: orders.map((o) => ({ ...o, amount: Number(o.amount),
      amount_received: o.amount_received === null ? null : Number(o.amount_received),
      voucher_amount: o.voucher_amount === null || o.voucher_amount === undefined ? null : Number(o.voucher_amount) })),
    stale: stale.map((o) => ({ ...o, amount: Number(o.amount) })),
    emtLog: emtLog.map((l) => ({ ...l, amount: l.amount === null ? null : Number(l.amount) })),
    statements,
  })
}

export function dailyCheckCsv(r) {
  const L = []
  const row = (a) => L.push(a.map(csvCell).join(','))
  row(['COSMOS DAILY CHECK', r.day, r.status === 'ok' ? 'ALL CHECKS OK' : r.problems + ' PROBLEM(S)'])
  L.push('')
  row(['CHECK', 'RESULT', 'DETAILS'])
  r.checks.forEach((c) => row([c.text, c.ok === true ? 'OK' : c.ok === false ? 'PROBLEM' : 'TO DO', (c.detail || []).join(' | ')]))
  L.push('')
  row(['ORDERS CREATED', 'Count', 'CAD', 'USD'])
  row(['Total', r.totals.all.count, r.totals.all.CAD, r.totals.all.USD])
  row(['Paid', r.totals.paid.count, r.totals.paid.CAD, r.totals.paid.USD])
  row(['Unpaid', r.totals.unpaid.count, r.totals.unpaid.CAD, r.totals.unpaid.USD])
  row(['Voucher discounts given', r.totals.vouchers.count, r.totals.vouchers.CAD, r.totals.vouchers.USD])
  L.push('')
  row(['CUSTOMER SERVICE', 'Orders', 'CAD', 'USD', 'Paid orders', 'Unpaid orders'])
  r.byStaff.forEach((s) => row([s.name || '(none)', s.all.count, s.all.CAD, s.all.USD, s.paid.count, s.unpaid.count]))
  L.push('')
  row(['PAYMENTS RECEIVED', 'Currency', 'Payments', 'Order amounts', 'Received (system)', 'Bank / wallet', 'Difference'])
  r.channels.forEach((c) => row([c.label, c.currency, c.count, c.expected, c.received,
    c.statement === null ? '' : c.statement, c.difference === null ? '' : c.difference]))
  L.push('')
  row(['ORDER', 'Created', 'Customer service', 'Method', 'Currency', 'Amount', 'Status', 'Paid', 'Received', 'Voucher', 'Voucher amount'])
  r.orders.forEach((o) => row([o.id, o.created, o.rep || '(none)', o.method, o.currency, o.amount, o.status, o.paid,
    o.received === null ? '' : o.received, o.voucher || '', o.voucherAmount === null ? '' : o.voucherAmount]))
  return '\uFEFF' + L.join('\r\n')
}

