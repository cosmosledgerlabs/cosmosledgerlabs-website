/* pages/api/daily-check.js (added 2026-11-01) — DAILY CHECK (admin)
   GET ?day=YYYY-MM-DD            → the day's order and payment totals, per
                                    customer service person and per payment
                                    channel, with every check ✅ / ⚠
   GET ?day=YYYY-MM-DD&format=csv → the same as a spreadsheet
   PUT { day, channel, amount }   → save the owner's bank / wallet figure for
                                    one channel that day (amount blank =
                                    remove). channel e.g. 'wire-CAD', 'emt-CAD'
   Days are Toronto days. See lib/dailyCheck.js for what is checked. */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { computeDailyCheck, STALE_HOURS } from '../../lib/dailyCheck'

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const CHANNEL_RE = /^(wire|emt|usdt)-(CAD|USD)$/

function validDay(d) {
  if (!DAY_RE.test(d)) return false
  const t = new Date(d + 'T12:00:00Z')
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d
}

function csvCell(v) {
  const s = String(v === null || v === undefined ? '' : v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

async function loadDailyCheck(day) {
  const { rows: orders } = await sql`
    SELECT id, amount, currency, method, rep, rep_id, status, paid_via, amount_received,
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
      amount_received: o.amount_received === null ? null : Number(o.amount_received) })),
    stale: stale.map((o) => ({ ...o, amount: Number(o.amount) })),
    emtLog: emtLog.map((l) => ({ ...l, amount: l.amount === null ? null : Number(l.amount) })),
    statements,
  })
}

function toCsv(r) {
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
  L.push('')
  row(['CUSTOMER SERVICE', 'Orders', 'CAD', 'USD', 'Paid orders', 'Unpaid orders'])
  r.byStaff.forEach((s) => row([s.name || '(none)', s.all.count, s.all.CAD, s.all.USD, s.paid.count, s.unpaid.count]))
  L.push('')
  row(['PAYMENTS RECEIVED', 'Currency', 'Payments', 'Order amounts', 'Received (system)', 'Bank / wallet', 'Difference'])
  r.channels.forEach((c) => row([c.label, c.currency, c.count, c.expected, c.received,
    c.statement === null ? '' : c.statement, c.difference === null ? '' : c.difference]))
  L.push('')
  row(['ORDER', 'Created', 'Customer service', 'Method', 'Currency', 'Amount', 'Status', 'Paid', 'Received'])
  r.orders.forEach((o) => row([o.id, o.created, o.rep || '(none)', o.method, o.currency, o.amount, o.status, o.paid,
    o.received === null ? '' : o.received]))
  return '\uFEFF' + L.join('\r\n')
}

export default async function handler(req, res) {
  try {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })
    await ensureTables()

    if (req.method === 'GET') {
      const day = String(req.query.day || '')
      if (!validDay(day)) return res.status(400).json({ error: 'invalid day' })
      const r = await loadDailyCheck(day)
      res.setHeader('Cache-Control', 'no-store')
      if (req.query.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', 'attachment; filename="cosmos-daily-check-' + day + '.csv"')
        return res.status(200).send(toCsv(r))
      }
      return res.status(200).json(r)
    }

    if (req.method === 'PUT') {
      const b = req.body || {}
      const day = String(b.day || '')
      const channel = String(b.channel || '')
      if (!validDay(day) || !CHANNEL_RE.test(channel)) return res.status(400).json({ error: 'invalid' })
      if (b.amount === null || b.amount === undefined || String(b.amount).trim() === '') {
        await sql`DELETE FROM daily_received WHERE day = ${day}::date AND channel = ${channel}`
        return res.status(200).json({ ok: true })
      }
      const amount = Number(b.amount)
      if (!Number.isFinite(amount) || amount < 0 || amount >= 1000000000)
        return res.status(400).json({ error: 'Enter the total received, e.g. 1250.00' })
      const a = Math.round(amount * 100) / 100
      await sql`INSERT INTO daily_received (day, channel, amount) VALUES (${day}::date, ${channel}, ${a})
                ON CONFLICT (day, channel) DO UPDATE SET amount = ${a}, updated_at = NOW()`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
