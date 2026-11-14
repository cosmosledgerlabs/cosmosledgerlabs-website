/* pages/api/referrers.js (added 2026-11-13) — referral program (OWNER only,
   admin passcode). See /referral for the public rules.

   GET  ?month=YYYY-MM
        → { referrers: [...], orders: [...], totals: {...}, rate }
          referrers: every referrer with their code, link and order counts
          orders:    PAID orders credited to a referrer, paid in that month
                     (Toronto time), with the commission on each
          totals:    commission per referrer per currency for that month
        Commission = rate × the amount actually received (or the order
        amount if no different amount was recorded). Check each order
        against the rules on /referral (12-month window, client confirmed,
        taxes and refunds excluded) before paying.
   GET  ?month=YYYY-MM&format=csv → the month's orders as a spreadsheet
   POST  { name, email, note }                       → add a referrer (code made automatically)
   PATCH { id, name?, email?, note?, active? }       → edit or deactivate
   Referrers are never deleted, so old orders keep their referrer. */

import crypto from 'crypto'
import { ensureTables, sql, isAdmin } from '../../lib/db'
import { logAction } from '../../lib/managerAuth'
import { REFERRAL_RATE, REFERRAL_ALPHABET } from '../../lib/referral'
import { MONTH_RE } from '../../lib/payrollData'

const OWNER = { role: 'owner', name: 'Owner' }
const clip = (v, n) => String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

function makeCode() {
  const bytes = crypto.randomBytes(6)
  let s = ''
  for (let i = 0; i < 6; i++) s += REFERRAL_ALPHABET[bytes[i] % REFERRAL_ALPHABET.length]
  return 'CLR-' + s
}

function csvCell(v) {
  const s = String(v === null || v === undefined ? '' : v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export default async function handler(req, res) {
  try {
    if (!(await isAdmin(req))) return res.status(401).json({ error: 'unauthorized' })
    await ensureTables()

    if (req.method === 'GET') {
      const month = String(req.query.month || '')
      if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })

      const { rows: refs } = await sql`SELECT r.id, r.code, r.name, r.email, r.note, r.active,
          to_char(r.created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS created,
          COUNT(o.id)::int AS orders,
          COUNT(o.id) FILTER (WHERE o.status = 'PAID')::int AS paid_orders
        FROM referrers r LEFT JOIN orders o ON o.referrer_id = r.id
        GROUP BY r.id ORDER BY r.active DESC, r.name`

      const { rows: paid } = await sql`SELECT o.id, o.referrer_id, r.name AS referrer, r.code, o.currency,
          o.amount, o.amount_received, o.service,
          to_char(o.created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS created,
          to_char(o.paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS paid
        FROM orders o JOIN referrers r ON r.id = o.referrer_id
        WHERE o.status = 'PAID' AND to_char(o.paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}
        ORDER BY r.name, o.paid_at`

      const orders = paid.map((o) => {
        const base = o.amount_received === null || o.amount_received === undefined ? Number(o.amount) : Number(o.amount_received)
        return { id: o.id, referrerId: o.referrer_id, referrer: o.referrer, code: o.code, currency: o.currency,
          amount: Number(o.amount), received: r2(base), commission: r2(base * REFERRAL_RATE),
          service: o.service, created: o.created, paid: o.paid }
      })
      const totals = {}
      orders.forEach((o) => {
        const t = totals[o.referrerId] || (totals[o.referrerId] = { referrer: o.referrer, code: o.code, CAD: 0, USD: 0, orders: 0 })
        t.orders += 1
        t[o.currency === 'USD' ? 'USD' : 'CAD'] = r2(t[o.currency === 'USD' ? 'USD' : 'CAD'] + o.commission)
      })

      if (req.query.format === 'csv') {
        const lines = [['Referrer', 'Code', 'Order', 'Service', 'Created', 'Paid', 'Currency', 'Order amount',
          'Amount received', 'Commission (' + Math.round(REFERRAL_RATE * 100) + '%)'].map(csvCell).join(',')]
        orders.forEach((o) => lines.push([o.referrer, o.code, o.id, o.service, o.created, o.paid, o.currency,
          o.amount.toFixed(2), o.received.toFixed(2), o.commission.toFixed(2)].map(csvCell).join(',')))
        lines.push('')
        Object.values(totals).forEach((t) => lines.push([csvCell('TOTAL ' + t.referrer), t.code, t.orders + ' orders', '', '', '',
          '', '', 'CAD ' + t.CAD.toFixed(2), 'USD ' + t.USD.toFixed(2)].join(',')))
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', 'attachment; filename="cosmos-referrals-' + month + '.csv"')
        return res.status(200).send('﻿' + lines.join('\r\n'))
      }

      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({
        month,
        rate: REFERRAL_RATE,
        referrers: refs,
        orders,
        totals: Object.values(totals),
      })
    }

    if (req.method === 'POST') {
      const b = req.body || {}
      const name = clip(b.name, 80)
      const email = clip(b.email, 120).toLowerCase()
      const note = clip(b.note, 300)
      if (!name) return res.status(400).json({ error: 'Enter the referrer\'s name.' })
      if (email && !EMAIL_RE.test(email)) return res.status(400).json({ error: 'That email address looks wrong.' })
      let code = ''
      for (let i = 0; i < 5 && !code; i++) {
        const tryCode = makeCode()
        const ins = await sql`INSERT INTO referrers (code, name, email, note) VALUES (${tryCode}, ${name}, ${email}, ${note})
          ON CONFLICT (code) DO NOTHING RETURNING code`
        if (ins.rows.length) code = tryCode
      }
      if (!code) return res.status(500).json({ error: 'Could not create a code — try again.' })
      await logAction(OWNER, 'referrer added', name + ' — ' + code)
      return res.status(200).json({ ok: true, code })
    }

    if (req.method === 'PATCH') {
      const b = req.body || {}
      const id = Number(b.id)
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
      const cur = await sql`SELECT name, code FROM referrers WHERE id = ${id}`
      if (!cur.rows.length) return res.status(404).json({ error: 'not found' })
      const changes = []
      if (b.name !== undefined) {
        const name = clip(b.name, 80)
        if (!name) return res.status(400).json({ error: 'Enter the referrer\'s name.' })
        await sql`UPDATE referrers SET name = ${name} WHERE id = ${id}`
        changes.push('name ' + name)
      }
      if (b.email !== undefined) {
        const email = clip(b.email, 120).toLowerCase()
        if (email && !EMAIL_RE.test(email)) return res.status(400).json({ error: 'That email address looks wrong.' })
        await sql`UPDATE referrers SET email = ${email} WHERE id = ${id}`
        changes.push('email')
      }
      if (b.note !== undefined) {
        await sql`UPDATE referrers SET note = ${clip(b.note, 300)} WHERE id = ${id}`
        changes.push('note')
      }
      if (b.active !== undefined) {
        await sql`UPDATE referrers SET active = ${b.active === true} WHERE id = ${id}`
        changes.push(b.active === true ? 'reactivated' : 'deactivated')
      }
      if (changes.length) await logAction(OWNER, 'referrer changed', cur.rows[0].name + ' (' + cur.rows[0].code + ') — ' + changes.join(', '))
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
