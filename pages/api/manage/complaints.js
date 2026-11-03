/* pages/api/manage/complaints.js (added 2026-11-02) — customer complaints
   GET ?status=open|valid|rejected|all            → list (latest 300)
   POST { orderId?, staffId?, customer, kind, details }
        → record a complaint (status "open"). If an order number is given
          and no staff member is chosen, the order's customer service person
          is used.
   PATCH { id, action: 'decide', decision: 'valid' | 'rejected', note,
           fineAmount?, voucherAmount?, voucherCurrency?, voucherDays? }
        → decide an open complaint. VALID: the fine (any amount, or blank for
          none) is deducted in that staff member's payroll for the month it
          was decided; if a voucher amount is given, a voucher is created for
          the customer and its code returned. REJECTED: nothing else happens.
   PATCH { id, action: 'reopen' }
        → back to "open" (fine removed, unused voucher cancelled). Not
          possible once the customer has used the voucher.
   Managers and the owner; every change is in the activity log. */

import { ensureTables, sql } from '../../../lib/db'
import { currentManager, logAction } from '../../../lib/managerAuth'
import { makeVoucherCode, cleanAmount, DEFAULT_DAYS, MAX_DAYS } from '../../../lib/vouchers'

const KINDS = ['slow-reply', 'wrong-info', 'rude', 'no-follow-up', 'other']
const ID_RE = /^CLL-\d{6}-[A-Z0-9]{2,6}$/
const clip = (v, n) => String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n)

async function list(status) {
  const { rows } = await sql`SELECT c.id, c.order_id, c.staff_id, st.name AS staff, c.customer, c.kind, c.details,
      c.status, c.fine_amount, c.voucher_code, c.decision_note, c.created_by, c.decided_by,
      to_char(c.created_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS created,
      to_char(c.decided_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS decided,
      v.amount AS voucher_amount, v.currency AS voucher_currency, v.used_order_id AS voucher_used_by,
      v.cancelled AS voucher_cancelled,
      to_char(v.expires_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS voucher_expires
    FROM complaints c
    LEFT JOIN staff st ON st.id = c.staff_id
    LEFT JOIN vouchers v ON v.code = c.voucher_code AND c.voucher_code <> ''
    WHERE (${status} = 'all' OR c.status = ${status})
    ORDER BY (c.status = 'open') DESC, c.id DESC LIMIT 300`
  return rows.map((r) => ({ ...r,
    fine_amount: r.fine_amount === null ? null : Number(r.fine_amount),
    voucher_amount: r.voucher_amount === null ? null : Number(r.voucher_amount) }))
}

export default async function handler(req, res) {
  try {
    await ensureTables()
    const who = await currentManager(req)
    if (!who) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const st = String(req.query.status || 'all')
      const status = ['open', 'valid', 'rejected', 'all'].includes(st) ? st : 'all'
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ complaints: await list(status), kinds: KINDS })
    }

    if (req.method === 'POST') {
      const b = req.body || {}
      const orderId = clip(b.orderId, 40).toUpperCase()
      const kind = KINDS.includes(b.kind) ? b.kind : ''
      const details = clip(b.details, 1000)
      const customer = clip(b.customer, 120)
      let staffId = b.staffId === '' || b.staffId === null || b.staffId === undefined ? null : Number(b.staffId)
      if (!kind) return res.status(400).json({ error: 'Choose the type of complaint.' })
      if (!details) return res.status(400).json({ error: 'Describe what happened.' })
      if (orderId) {
        if (!ID_RE.test(orderId)) return res.status(400).json({ error: 'Order number looks wrong — e.g. CLL-261102-AB12.' })
        const o = await sql`SELECT rep_id FROM orders WHERE id = ${orderId}`
        if (!o.rows.length) return res.status(400).json({ error: 'Order ' + orderId + ' not found.' })
        if (staffId === null && o.rows[0].rep_id) staffId = Number(o.rows[0].rep_id)
      }
      if (staffId !== null) {
        if (!Number.isInteger(staffId)) return res.status(400).json({ error: 'invalid staff' })
        const s = await sql`SELECT id FROM staff WHERE id = ${staffId}`
        if (!s.rows.length) return res.status(400).json({ error: 'invalid staff' })
      }
      if (staffId === null) return res.status(400).json({ error: 'Choose the customer service person (or enter an order number that has one).' })
      const { rows } = await sql`INSERT INTO complaints (order_id, staff_id, customer, kind, details, created_by)
        VALUES (${orderId}, ${staffId}, ${customer}, ${kind}, ${details}, ${who.name}) RETURNING id`
      await logAction(who, 'complaint recorded', '#' + rows[0].id + (orderId ? ' ' + orderId : '') + ' — ' + kind)
      return res.status(200).json({ ok: true, id: rows[0].id })
    }

    if (req.method === 'PATCH') {
      const b = req.body || {}
      const id = Number(b.id)
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
      const { rows } = await sql`SELECT c.*, st.name AS staff FROM complaints c
        LEFT JOIN staff st ON st.id = c.staff_id WHERE c.id = ${id}`
      if (!rows.length) return res.status(404).json({ error: 'Complaint not found.' })
      const c = rows[0]

      if (b.action === 'decide') {
        if (c.status !== 'open') return res.status(409).json({ error: 'This complaint was already decided. Reopen it first.' })
        const note = clip(b.note, 500)
        if (b.decision === 'rejected') {
          await sql`UPDATE complaints SET status = 'rejected', decision_note = ${note}, fine_amount = NULL,
                    decided_by = ${who.name}, decided_at = NOW() WHERE id = ${id} AND status = 'open'`
          await logAction(who, 'complaint rejected', '#' + id + (note ? ' — ' + note : ''))
          return res.status(200).json({ ok: true })
        }
        if (b.decision !== 'valid') return res.status(400).json({ error: 'invalid decision' })
        const fine = cleanAmount(b.fineAmount)
        if (Number.isNaN(fine)) return res.status(400).json({ error: 'Fine: enter an amount such as 20, or leave it blank for no fine.' })
        const vAmount = cleanAmount(b.voucherAmount)
        if (Number.isNaN(vAmount)) return res.status(400).json({ error: 'Voucher: enter an amount such as 30, or leave it blank for no voucher.' })
        const vCur = b.voucherCurrency === 'USD' ? 'USD' : 'CAD'
        const days = b.voucherDays === undefined || b.voucherDays === '' || b.voucherDays === null ? DEFAULT_DAYS : Number(b.voucherDays)
        if (vAmount !== null && (!Number.isInteger(days) || days < 1 || days > MAX_DAYS))
          return res.status(400).json({ error: 'Voucher valid for: enter a number of days (1–' + MAX_DAYS + ').' })

        // Claim the complaint first so two managers cannot decide it twice.
        const claimed = await sql`UPDATE complaints SET status = 'valid', decision_note = ${note}, fine_amount = ${fine},
                  decided_by = ${who.name}, decided_at = NOW() WHERE id = ${id} AND status = 'open' RETURNING id`
        if (!claimed.rows.length) return res.status(409).json({ error: 'This complaint was already decided.' })

        let code = ''
        if (vAmount !== null) {
          for (let i = 0; i < 5 && !code; i++) {
            const tryCode = makeVoucherCode()
            const ins = await sql`INSERT INTO vouchers (code, amount, currency, customer, note, complaint_id, created_by, expires_at)
              VALUES (${tryCode}, ${vAmount}, ${vCur}, ${c.customer}, ${'Complaint #' + id}, ${id}, ${who.name},
                      NOW() + make_interval(days => ${days}::int))
              ON CONFLICT (code) DO NOTHING RETURNING code`
            if (ins.rows.length) code = tryCode
          }
          if (code) await sql`UPDATE complaints SET voucher_code = ${code} WHERE id = ${id}`
        }
        await logAction(who, 'complaint VALID', '#' + id + ' — ' + (c.staff || 'staff') +
          ' — fine ' + (fine === null ? 'none' : fine.toFixed(2)) +
          ' — voucher ' + (code ? code + ' ' + vCur + ' ' + vAmount.toFixed(2) : 'none') + (note ? ' — ' + note : ''))
        return res.status(200).json({ ok: true, voucher: code ? { code, amount: vAmount, currency: vCur, days } : null })
      }

      if (b.action === 'reopen') {
        if (c.status === 'open') return res.status(200).json({ ok: true })
        if (c.voucher_code) {
          const v = await sql`SELECT used_order_id FROM vouchers WHERE code = ${c.voucher_code}`
          if (v.rows.length && v.rows[0].used_order_id)
            return res.status(409).json({ error: 'The customer already used the voucher (order ' + v.rows[0].used_order_id + ') — this complaint can no longer be reopened.' })
          await sql`UPDATE vouchers SET cancelled = TRUE WHERE code = ${c.voucher_code} AND used_order_id IS NULL`
        }
        await sql`UPDATE complaints SET status = 'open', fine_amount = NULL, voucher_code = '', decision_note = '',
                  decided_by = '', decided_at = NULL WHERE id = ${id}`
        await logAction(who, 'complaint reopened', '#' + id + (c.voucher_code ? ' — voucher ' + c.voucher_code + ' cancelled' : ''))
        return res.status(200).json({ ok: true })
      }

      return res.status(400).json({ error: 'invalid action' })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
