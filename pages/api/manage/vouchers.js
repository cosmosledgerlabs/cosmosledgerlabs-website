/* pages/api/manage/vouchers.js (added 2026-11-02) — customer vouchers
   GET ?status=active|used|expired|cancelled|all&q=text  → list (latest 500)
   POST { amount, currency, days, customer, note }
        → a voucher without a complaint (e.g. goodwill). Management decides
          the amount each time.
   PATCH { code, action: 'cancel' }  → cancel a voucher that is not used yet.
   Vouchers made from a complaint are created on the complaint itself.
   Managers and the owner; every change is in the activity log. */

import { ensureTables, sql } from '../../../lib/db'
import { currentManager, logAction } from '../../../lib/managerAuth'
import { makeVoucherCode, normalizeCode, voucherStatus, cleanAmount, DEFAULT_DAYS, MAX_DAYS } from '../../../lib/vouchers'

const clip = (v, n) => String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n)

export default async function handler(req, res) {
  try {
    await ensureTables()
    const who = await currentManager(req)
    if (!who) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const want = String(req.query.status || 'all')
      const q = clip(req.query.q, 60)
      const like = '%' + q.replace(/[%_\\]/g, '') + '%'
      const { rows } = await sql`SELECT code, amount, currency, customer, note, complaint_id, created_by, cancelled,
          used_order_id, expires_at,
          to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created,
          to_char(expires_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS expires,
          to_char(used_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS used
        FROM vouchers
        WHERE (${q} = '' OR code ILIKE ${like} OR customer ILIKE ${like} OR used_order_id ILIKE ${like} OR note ILIKE ${like})
        ORDER BY created_at DESC LIMIT 500`
      const now = Date.now()
      const list = rows.map((v) => ({ code: v.code, amount: Number(v.amount), currency: v.currency,
        customer: v.customer, note: v.note, complaintId: v.complaint_id, createdBy: v.created_by,
        created: v.created, expires: v.expires, used: v.used, usedOrder: v.used_order_id || '',
        status: voucherStatus(v, now) }))
        .filter((v) => want === 'all' || v.status === want)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ vouchers: list })
    }

    if (req.method === 'POST') {
      const b = req.body || {}
      const amount = cleanAmount(b.amount)
      if (amount === null || Number.isNaN(amount)) return res.status(400).json({ error: 'Enter the voucher amount, e.g. 30.' })
      const currency = b.currency === 'USD' ? 'USD' : 'CAD'
      const days = b.days === undefined || b.days === '' || b.days === null ? DEFAULT_DAYS : Number(b.days)
      if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) return res.status(400).json({ error: 'Valid for: enter a number of days (1–' + MAX_DAYS + ').' })
      const customer = clip(b.customer, 120)
      const note = clip(b.note, 300)
      let code = ''
      for (let i = 0; i < 5 && !code; i++) {
        const tryCode = makeVoucherCode()
        const ins = await sql`INSERT INTO vouchers (code, amount, currency, customer, note, created_by, expires_at)
          VALUES (${tryCode}, ${amount}, ${currency}, ${customer}, ${note}, ${who.name}, NOW() + make_interval(days => ${days}::int))
          ON CONFLICT (code) DO NOTHING RETURNING code`
        if (ins.rows.length) code = tryCode
      }
      if (!code) return res.status(500).json({ error: 'Could not create a code — try again.' })
      await logAction(who, 'voucher created', code + ' — ' + currency + ' ' + amount.toFixed(2) + (customer ? ' — ' + customer : '') + (note ? ' — ' + note : ''))
      return res.status(200).json({ ok: true, voucher: { code, amount, currency, days } })
    }

    if (req.method === 'PATCH') {
      const b = req.body || {}
      const code = normalizeCode(b.code)
      if (!code || b.action !== 'cancel') return res.status(400).json({ error: 'invalid' })
      const { rows } = await sql`UPDATE vouchers SET cancelled = TRUE
        WHERE code = ${code} AND cancelled = FALSE AND used_order_id IS NULL RETURNING code`
      if (!rows.length) return res.status(409).json({ error: 'Only an unused voucher can be cancelled.' })
      await logAction(who, 'voucher cancelled', code)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
