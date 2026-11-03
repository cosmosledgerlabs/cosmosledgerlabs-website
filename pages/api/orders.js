/* pages/api/orders.js
   POST   (public)  — auto-record an order generated on /pay
   GET ?status=ID (public) — status only of one order ('PAID' / 'UNPAID'),
                      so the client's /pay page can show "payment received"
   GET    (admin)   — list recent orders
   PATCH  (admin)   — set an order's status: { id, status: 'PAID' | 'UNPAID',
                      received } — received = the amount that actually
                      arrived (optional; blank = exactly the order amount).
                      Used by the DAILY CHECK (2026-11-01).
   DELETE (admin)   — remove an order: { id }
   2026-11-01: the customer picks the staff member who helped them from a
   list (repId). The name stored is the one in the staff list, so commission
   is always credited to exactly the right person.
   2026-11-02: customer vouchers — POST may include voucherCode. The
   voucher is checked and used in one step (it can never be used twice);
   the order is saved with the amount AFTER the voucher, and the response
   says the final amount: { ok, amount, voucher: { code, amount } }.
   If the voucher cannot be used the order is not saved (409) so the
   customer never sees a discount that was not given. Deleting an order
   frees its voucher again.                                                 */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { normalizeCode } from '../../lib/vouchers'

const ID_RE = /^CLL-\d{6}-[A-Z0-9]{2,6}$/
const METHODS = ['wire', 'emt', 'usdt']

export default async function handler(req, res) {
  try {
    await ensureTables()

    if (req.method === 'POST') {
      const b = req.body || {}
      const amount = Number(b.amount)
      let rep = ''
      let repId = null
      const wantId = Number(b.repId)
      if (Number.isInteger(wantId) && wantId > 0) {
        const st = await sql`SELECT id, name FROM staff WHERE id = ${wantId} AND active = TRUE`
        if (st.rows.length) { repId = st.rows[0].id; rep = st.rows[0].name }
      }
      const ok =
        typeof b.id === 'string' && ID_RE.test(b.id) &&
        Number.isFinite(amount) && amount > 0 && amount < 100000000 &&
        METHODS.includes(b.method) &&
        ['CAD', 'USD'].includes(b.currency)
      if (!ok) return res.status(400).json({ error: 'invalid order' })

      let net = Math.round(amount * 100) / 100
      let voucher = null
      if (b.voucherCode) {
        const code = normalizeCode(b.voucherCode)
        if (!code) return res.status(409).json({ error: 'voucher', reason: 'invalid' })
        const used = await sql`UPDATE vouchers SET used_order_id = ${b.id}, used_at = NOW()
          WHERE code = ${code} AND cancelled = FALSE AND used_order_id IS NULL AND expires_at > NOW()
            AND currency = ${b.currency} AND amount < ${net}
          RETURNING amount`
        if (!used.rows.length) return res.status(409).json({ error: 'voucher', reason: 'invalid' })
        voucher = { code, amount: Number(used.rows[0].amount) }
        net = Math.round((net - voucher.amount) * 100) / 100
      }

      const ins = await sql`INSERT INTO orders (id, service, amount, currency, method, rep, rep_id, voucher_code, voucher_amount)
                VALUES (${b.id}, ${String(b.service || '').slice(0, 80)}, ${net},
                        ${b.currency}, ${b.method}, ${rep}, ${repId},
                        ${voucher ? voucher.code : ''}, ${voucher ? voucher.amount : null})
                ON CONFLICT (id) DO NOTHING RETURNING id`
      if (!ins.rows.length && voucher) {
        // Order number already existed — give the voucher back.
        await sql`UPDATE vouchers SET used_order_id = NULL, used_at = NULL WHERE code = ${voucher.code} AND used_order_id = ${b.id}`
        return res.status(409).json({ error: 'duplicate order' })
      }
      return res.status(200).json({ ok: true, amount: net, voucher })
    }

    /* Public status check for one order — returns nothing else. */
    if (req.method === 'GET' && req.query && req.query.status) {
      const id = String(req.query.status)
      if (!ID_RE.test(id)) return res.status(400).json({ error: 'invalid' })
      const { rows } = await sql`SELECT status FROM orders WHERE id = ${id}`
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ status: rows.length ? rows[0].status : 'UNKNOWN' })
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT id, service, amount, currency, method, rep, rep_id, status, paid_via, amount_received,
                voucher_code, voucher_amount,
                to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created,
                to_char(paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS paid
                FROM orders ORDER BY created_at DESC LIMIT 200`
      return res.status(200).json({ orders: rows })
    }

    if (req.method === 'PATCH') {
      const { id, status, received } = req.body || {}
      if (!ID_RE.test(String(id)) || !['PAID', 'UNPAID'].includes(status))
        return res.status(400).json({ error: 'invalid' })
      if (status === 'PAID') {
        let got = null
        if (received !== undefined && received !== null && String(received).trim() !== '') {
          got = Number(received)
          if (!Number.isFinite(got) || got < 0 || got >= 100000000)
            return res.status(400).json({ error: 'Enter the amount received, e.g. 1250.00' })
          got = Math.round(got * 100) / 100
        }
        await sql`UPDATE orders SET status = 'PAID', paid_via = 'manual', paid_at = NOW(),
                  amount_received = COALESCE(${got}::numeric, amount) WHERE id = ${id}`
      } else {
        await sql`UPDATE orders SET status = 'UNPAID', paid_via = '', paid_at = NULL, amount_received = NULL WHERE id = ${id}`
      }
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!ID_RE.test(String(id))) return res.status(400).json({ error: 'invalid' })
      await sql`DELETE FROM orders WHERE id = ${id}`
      await sql`UPDATE vouchers SET used_order_id = NULL, used_at = NULL WHERE used_order_id = ${id}`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
