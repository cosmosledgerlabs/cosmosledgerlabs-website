/* pages/api/orders.js
   POST   (public)  — auto-record an order generated on /pay
   GET ?status=ID (public) — status only of one order ('PAID' / 'UNPAID'),
                      so the client's /pay page can show "payment received"
   GET    (admin)   — list recent orders
   PATCH  (admin)   — set an order's status: { id, status: 'PAID' | 'UNPAID' }
   DELETE (admin)   — remove an order: { id }                                */

import { ensureTables, sql, isAdmin } from '../../lib/db'

const ID_RE = /^CLL-\d{6}-[A-Z0-9]{2,6}$/
const METHODS = ['wire', 'emt', 'usdt']

export default async function handler(req, res) {
  try {
    await ensureTables()

    if (req.method === 'POST') {
      const b = req.body || {}
      const amount = Number(b.amount)
      const rep = String(b.rep || '').trim().slice(0, 40)
      const ok =
        typeof b.id === 'string' && ID_RE.test(b.id) &&
        Number.isFinite(amount) && amount > 0 && amount < 100000000 &&
        METHODS.includes(b.method) &&
        ['CAD', 'USD'].includes(b.currency)
      if (!ok) return res.status(400).json({ error: 'invalid order' })
      await sql`INSERT INTO orders (id, service, amount, currency, method, rep)
                VALUES (${b.id}, ${String(b.service || '').slice(0, 80)}, ${amount},
                        ${b.currency}, ${b.method}, ${rep})
                ON CONFLICT (id) DO NOTHING`
      return res.status(200).json({ ok: true })
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
      const { rows } = await sql`SELECT id, service, amount, currency, method, rep, status, paid_via,
                to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created,
                to_char(paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS paid
                FROM orders ORDER BY created_at DESC LIMIT 200`
      return res.status(200).json({ orders: rows })
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body || {}
      if (!ID_RE.test(String(id)) || !['PAID', 'UNPAID'].includes(status))
        return res.status(400).json({ error: 'invalid' })
      if (status === 'PAID') {
        await sql`UPDATE orders SET status = 'PAID', paid_via = 'manual', paid_at = NOW() WHERE id = ${id}`
      } else {
        await sql`UPDATE orders SET status = 'UNPAID', paid_via = '', paid_at = NULL WHERE id = ${id}`
      }
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!ID_RE.test(String(id))) return res.status(400).json({ error: 'invalid' })
      await sql`DELETE FROM orders WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
