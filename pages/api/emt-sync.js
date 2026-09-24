/* pages/api/emt-sync.js
   Automatic Interac e-Transfer matching (2026-09-24).

   Reads the Interac notification emails that arrive in the e-Transfer inbox
   (info@cosmosledgerlabs.com, Autodeposit), finds the order number
   (CLL-yymmdd-XXXX) the client typed in the transfer message, and — when
   everything matches — marks that order PAID automatically in /admin.

   An order is marked PAID automatically only when ALL of these are true:
     • the email comes from an interac.ca address and its DKIM signature from
       interac.ca passed (so a fake "Interac" email cannot mark orders paid);
     • the message contains a known order number;
     • that order is an UNPAID e-Transfer order in CAD;
     • the amount in the email equals the order amount.
   Anything else is logged as REVIEW with the reason, for a manual decision.
   Every email is processed once only (emt_log).

   Who can run it:
     • the ADMIN passcode (the "CHECK E-TRANSFERS NOW" button in /admin);
     • a scheduler calling  /api/emt-sync?key=<CRON_SECRET>  (every 10 min).

   Vercel environment variables (Settings → Environment Variables):
     EMT_IMAP_USER   the inbox address, e.g. info@cosmosledgerlabs.com
     EMT_IMAP_PASS   that inbox's password
     EMT_IMAP_HOST   optional, default mail.privateemail.com (Namecheap)
     EMT_IMAP_PORT   optional, default 993
     CRON_SECRET     a long random text used by the scheduler
     EMT_REQUIRE_DKIM optional; set to "false" ONLY if the log shows every real
                     Interac email as "REVIEW: no DKIM pass" (mail server does
                     not report DKIM) — then matches still need interac.ca
                     sender + exact order number + exact amount.            */

import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { ensureTables, sql, isAdmin } from '../../lib/db'

export const config = { maxDuration: 30 }

const ORDER_RE = /CLL-\d{6}-[A-Z0-9]{2,6}/i
const LOOKBACK_DAYS = 14
const MAX_PER_RUN = 40

function authorised(req) {
  if (isAdmin(req)) return true
  const key = String((req.query && req.query.key) || '')
  return !!process.env.CRON_SECRET && key.length >= 16 && key === process.env.CRON_SECRET
}

function firstAmount(text) {
  /* e.g. "$1,250.00", "$ 500.00", "500.00 $" (French) */
  const m = text.match(/\$\s?([\d,]+\.\d{2})/) || text.match(/([\d\s.]+,\d{2})\s?\$/)
  if (!m) return null
  let s = m[1]
  if (/,\d{2}$/.test(s) && !/\.\d{2}$/.test(s)) s = s.replace(/[\s.]/g, '').replace(',', '.')
  const n = Number(s.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function dkimPassedForInterac(parsed) {
  const raw = parsed.headers.get('authentication-results')
  const list = Array.isArray(raw) ? raw : raw ? [raw] : []
  const all = list.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ').toLowerCase()
  return /dkim=pass[^;]*header\.(d|i)=@?[a-z0-9.-]*interac\.ca/.test(all)
}

export default async function handler(req, res) {
  if (!authorised(req)) return res.status(401).json({ error: 'unauthorized' })
  const user = process.env.EMT_IMAP_USER
  const pass = process.env.EMT_IMAP_PASS
  if (!user || !pass) return res.status(500).json({ error: 'EMT_IMAP_USER / EMT_IMAP_PASS not set in Vercel' })
  const requireDkim = String(process.env.EMT_REQUIRE_DKIM || 'true').toLowerCase() !== 'false'

  const summary = { checked: 0, paid: [], review: [], skipped: 0 }
  const client = new ImapFlow({
    host: process.env.EMT_IMAP_HOST || 'mail.privateemail.com',
    port: Number(process.env.EMT_IMAP_PORT || 993),
    secure: true,
    auth: { user, pass },
    logger: false,
  })

  try {
    await ensureTables()
    await client.connect()
    const lock = await client.getMailboxLock('INBOX')
    try {
      const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000)
      const uids = (await client.search({ since, from: 'interac.ca' }, { uid: true })) || []
      for (const uid of uids.slice(-MAX_PER_RUN)) {
        const msg = await client.fetchOne(String(uid), { source: true }, { uid: true })
        if (!msg || !msg.source) continue
        const parsed = await simpleParser(msg.source)
        const messageId = String(parsed.messageId || 'uid-' + uid).slice(0, 300)

        const seen = await sql`SELECT 1 FROM emt_log WHERE message_id = ${messageId}`
        if (seen.rows.length) { summary.skipped++; continue }
        summary.checked++

        const fromAddr = ((parsed.from && parsed.from.value && parsed.from.value[0] && parsed.from.value[0].address) || '').toLowerCase()
        const text = [parsed.subject || '', parsed.text || '', parsed.html ? String(parsed.html).replace(/<[^>]+>/g, ' ') : ''].join('\n')
        const idMatch = text.match(ORDER_RE)
        const orderId = idMatch ? idMatch[0].toUpperCase() : ''
        const amount = firstAmount(text)
        const receivedAt = parsed.date || new Date()

        let result = ''
        if (!/(^|\.|@)interac\.ca$/.test(fromAddr)) {
          result = 'IGNORED: sender ' + fromAddr
        } else if (!orderId) {
          result = 'REVIEW: no order number in the message'
        } else {
          const { rows } = await sql`SELECT id, amount, currency, method, status FROM orders WHERE id = ${orderId}`
          const o = rows[0]
          if (!o) result = 'REVIEW: order not found'
          else if (o.status === 'PAID') result = 'REVIEW: order already PAID'
          else if (o.method !== 'emt') result = 'REVIEW: order is not an e-Transfer order'
          else if (o.currency !== 'CAD') result = 'REVIEW: order is not in CAD'
          else if (amount === null) result = 'REVIEW: amount not found in the email'
          else if (Math.abs(Number(o.amount) - amount) > 0.005) result = 'REVIEW: amount ' + amount.toFixed(2) + ' ≠ order ' + Number(o.amount).toFixed(2)
          else if (requireDkim && !dkimPassedForInterac(parsed)) result = 'REVIEW: no DKIM pass for interac.ca'
          else {
            await sql`UPDATE orders SET status = 'PAID', paid_via = 'e-Transfer auto', paid_at = NOW()
                      WHERE id = ${orderId} AND status = 'UNPAID'`
            result = 'PAID'
          }
        }

        await sql`INSERT INTO emt_log (message_id, received_at, sender, amount, order_id, result)
                  VALUES (${messageId}, ${receivedAt.toISOString()}, ${fromAddr.slice(0, 120)},
                          ${amount}, ${orderId}, ${result.slice(0, 200)})
                  ON CONFLICT (message_id) DO NOTHING`
        if (result === 'PAID') summary.paid.push(orderId)
        else if (result.startsWith('REVIEW')) summary.review.push((orderId || '—') + ' — ' + result)
      }
    } finally {
      lock.release()
    }
    await client.logout()

    /* last 30 log rows for the /admin panel */
    const { rows: log } = await sql`SELECT order_id, amount, sender, result,
              to_char(received_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS received
              FROM emt_log ORDER BY created_at DESC LIMIT 30`
    return res.status(200).json({ ok: true, ...summary, log })
  } catch (e) {
    try { await client.logout() } catch (x) { /* ignore */ }
    return res.status(500).json({ error: 'e-Transfer check failed: ' + String((e && e.message) || e).slice(0, 160) })
  }
}
