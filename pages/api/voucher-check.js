/* pages/api/voucher-check.js (added 2026-11-02) — public, used by /pay
   GET ?code=CLV-XXXX-XXXX&currency=CAD|USD&amount=123.45
   → { ok: true, code, amount, currency }   the voucher can be used
   → { ok: false, reason }                  'invalid' (wrong, used, expired
       or cancelled), 'currency' (voucher is in the other currency) or
       'too-big' (the payment must be larger than the voucher)
   Only checks — the voucher is used for real when the order is created
   (/api/orders), so it can never be used twice. */

import { ensureTables, sql } from '../../lib/db'
import { normalizeCode } from '../../lib/vouchers'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
    await ensureTables()
    res.setHeader('Cache-Control', 'no-store')
    const code = normalizeCode(req.query.code)
    if (!code) return res.status(200).json({ ok: false, reason: 'invalid' })
    const { rows } = await sql`SELECT amount, currency FROM vouchers
      WHERE code = ${code} AND cancelled = FALSE AND used_order_id IS NULL AND expires_at > NOW()`
    if (!rows.length) return res.status(200).json({ ok: false, reason: 'invalid' })
    const v = { amount: Number(rows[0].amount), currency: rows[0].currency }
    if (req.query.currency && req.query.currency !== v.currency) return res.status(200).json({ ok: false, reason: 'currency', currency: v.currency })
    const amount = Number(req.query.amount)
    if (Number.isFinite(amount) && amount > 0 && !(amount > v.amount)) return res.status(200).json({ ok: false, reason: 'too-big', amount: v.amount, currency: v.currency })
    return res.status(200).json({ ok: true, code, amount: v.amount, currency: v.currency })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
