/* pages/api/orders.js
   POST   (public)  — auto-record an order generated on /pay
   GET    (admin)   — list recent orders
   PATCH  (admin)   — set an order's status: { id, status: 'PAID' | 'UNPAID' }
   DELETE (admin)   — remove an order: { id }                                */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { REPS } from '../../lib/settings'

const ID_RE = /^CLL-\d{6}-[A-Z0-9]{2,6}$/
const METHODS = ['wire', 'emt', 'usdt']

export default async function handler(req, res) {
  try {
    await ensureTables()

    if (req.method === 'POST') {
      const b = req.body || {}
      const amount = Number(b.amount)
      const ok =
        typeof b.id === 'string' && ID_RE.test(b.id) &&
        Number.isFinite(amount) && amount > 0 && amount < 100000000 &&
        METHODS.includes(b.method) &&
        ['CAD', 'USD'].includes(b.currency) &&
        (b.rep === '' || REPS.includes(b.rep))
      if (!ok) return res.status(400).json({ error: 'invalid order' })
      await sql`INSERT INTO orders (id, service, amount, currency, method, rep)
                VALUES (${b.id}, ${String(b.service || '').slice(0, 80)}, ${amount},
                        ${b.currency}, ${b.method}, ${b.rep})
                ON CONFLICT (id) DO NOTHING`
      return res.status(200).json({ ok: true })
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT id, service, amount, currency, method, rep, status,
                to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created
                FROM orders ORDER BY created_at DESC LIMIT 200`
      return res.status(200).json({ orders: rows })
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body || {}
      if (!ID_RE.test(String(id)) || !['PAID', 'UNPAID'].includes(status))
        return res.status(400).json({ error: 'invalid' })
      await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`
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
