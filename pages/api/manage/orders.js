/* pages/api/manage/orders.js (added 2026-11-02) — orders for managers
   GET ?day=YYYY-MM-DD        orders created that day (Toronto)
   GET ?q=text                search by order number, customer service name
                              or voucher code (latest 300)
       &status=PAID|UNPAID    optional filter
   PATCH { id, status, received }  mark PAID (received = amount that arrived,
                              blank = the order amount) or back to UNPAID.
   Managers cannot delete orders (owner only, on /admin). Every change is
   written to the activity log. */

import { ensureTables, sql } from '../../../lib/db'
import { currentManager, logAction } from '../../../lib/managerAuth'
import { validDay } from '../../../lib/dailyCheckData'

const ID_RE = /^CLL-\d{6}-[A-Z0-9]{2,6}$/

export default async function handler(req, res) {
  try {
    await ensureTables()
    const who = await currentManager(req)
    if (!who) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const status = ['PAID', 'UNPAID'].includes(req.query.status) ? req.query.status : ''
      const day = String(req.query.day || '')
      const q = String(req.query.q || '').trim().slice(0, 60)
      let rows
      if (day) {
        if (!validDay(day)) return res.status(400).json({ error: 'invalid day' })
        rows = (await sql`SELECT id, service, amount, currency, method, rep, status, paid_via, amount_received,
            voucher_code, voucher_amount,
            to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created,
            to_char(paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS paid
          FROM orders
          WHERE (created_at AT TIME ZONE 'America/Toronto')::date = ${day}::date
            AND (${status} = '' OR status = ${status})
          ORDER BY created_at DESC LIMIT 1000`).rows
      } else {
        const like = '%' + q.replace(/[%_\\]/g, '') + '%'
        rows = (await sql`SELECT id, service, amount, currency, method, rep, status, paid_via, amount_received,
            voucher_code, voucher_amount,
            to_char(created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created,
            to_char(paid_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS paid
          FROM orders
          WHERE (${q} = '' OR id ILIKE ${like} OR rep ILIKE ${like} OR voucher_code ILIKE ${like})
            AND (${status} = '' OR status = ${status})
          ORDER BY created_at DESC LIMIT 300`).rows
      }
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ orders: rows })
    }

    if (req.method === 'PATCH') {
      const { id, status, received } = req.body || {}
      if (!ID_RE.test(String(id)) || !['PAID', 'UNPAID'].includes(status))
        return res.status(400).json({ error: 'invalid' })
      const { rows } = await sql`SELECT amount, currency, status FROM orders WHERE id = ${id}`
      if (!rows.length) return res.status(404).json({ error: 'Order not found.' })
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
        await logAction(who, 'order marked PAID', id + ' — ' + rows[0].currency + ' ' + Number(rows[0].amount).toFixed(2) +
          (got !== null ? ' — received ' + got.toFixed(2) : ''))
      } else {
        await sql`UPDATE orders SET status = 'UNPAID', paid_via = '', paid_at = NULL, amount_received = NULL WHERE id = ${id}`
        await logAction(who, 'order set back to UNPAID', id)
      }
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
