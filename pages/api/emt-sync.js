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
   2026-11-01: the amount in the email is saved as orders.amount_received,
   used by the DAILY CHECK.

   Who can run it:
     • the ADMIN passcode (the "CHECK E-TRANSFERS NOW" button in /admin);
     • a scheduler sending the header  Authorization: Bearer <CRON_SECRET>
       (Vercel Cron sends exactly this), or — older setups — calling
       /api/emt-sync?key=<CRON_SECRET>. The header is safer: a key in the
       address ends up in server logs.

   2026-11-13 — DKIM check hardened: only the TOP Authentication-Results
   header is trusted. That is the one added by our own mail server when the
   email arrived; any Authentication-Results lines further down were written
   by whoever sent the email and could be faked. If EMT_AUTHSERV_ID is set
   (the name our mail server writes at the start of that header, e.g.
   mta-01.privateemail.com — copy it from a real Interac email's headers),
   only a header from that server is trusted.

   Vercel environment variables (Settings → Environment Variables):
     EMT_IMAP_USER   the inbox address, e.g. info@cosmosledgerlabs.com
     EMT_IMAP_PASS   that inbox's password
     EMT_IMAP_HOST   optional, default mail.privateemail.com (Namecheap)
     EMT_IMAP_PORT   optional, default 993
     CRON_SECRET     a long random text used by the scheduler
     EMT_AUTHSERV_ID optional, recommended (see 2026-11-13 above)
     EMT_REQUIRE_DKIM optional; set to "false" ONLY if the log shows every real
                     Interac email as "REVIEW: no DKIM pass" (mail server does
                     not report DKIM) — then matches still need interac.ca
                     sender + exact order number + exact amount.            */

import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import crypto from 'crypto'
import { ensureTables, sql, isAdmin } from '../../lib/db'
import { logAction } from '../../lib/managerAuth'

export const config = { maxDuration: 30 }

const ORDER_RE = /CLL-\d{6}-[A-Z0-9]{2,6}/i
const LOOKBACK_DAYS = 14
const MAX_PER_RUN = 40

function sameText(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest()
  const y = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(x, y)
}

/* 'owner', 'scheduler' or null */
async function authorised(req) {
  if (await isAdmin(req)) return 'owner'
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 16) return null
  const auth = String(req.headers.authorization || '')
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const key = bearer || String((req.query && req.query.key) || '')
  return key && sameText(key, secret) ? 'scheduler' : null
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

/* Every Authentication-Results header of the raw email, top first.
   Read from the raw source (not the parser) so the order is exact. */
function authResults(source) {
  const text = Buffer.isBuffer(source) ? source.toString('latin1') : String(source || '')
  const end = text.search(/\r?\n\r?\n/)
  const head = (end >= 0 ? text.slice(0, end) : text).replace(/\r?\n[ \t]+/g, ' ') // unfold
  return head.split(/\r?\n/)
    .filter((line) => /^authentication-results\s*:/i.test(line))
    .map((line) => line.replace(/^authentication-results\s*:/i, '').trim())
}

/* DKIM passed for interac.ca, according to OUR mail server only. */
function dkimPassedForInterac(source) {
  const list = authResults(source)
  const want = String(process.env.EMT_AUTHSERV_ID || '').trim().toLowerCase()
  const ours = want
    ? list.find((h) => h.split(';')[0].trim().toLowerCase().split(/\s+/)[0] === want)
    : list[0]
  if (!ours) return false
  return ours.toLowerCase().split(';').some((part) =>
    /^\s*dkim=pass\b/.test(part) && /header\.(d|i)=@?([a-z0-9-]+\.)*interac\.ca\b/.test(part))
}

export default async function handler(req, res) {
  const who = await authorised(req)
  if (!who) return res.status(401).json({ error: 'unauthorized' })
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
          else if (requireDkim && !dkimPassedForInterac(msg.source)) result = 'REVIEW: no DKIM pass for interac.ca'
          else {
            await sql`UPDATE orders SET status = 'PAID', paid_via = 'e-Transfer auto', paid_at = NOW(),
                      amount_received = ${amount}
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
    if (summary.paid.length) {
      await logAction({ role: 'manager', name: who === 'owner' ? 'Owner (e-Transfer check)' : 'e-Transfer auto' },
        'orders auto-marked PAID', summary.paid.join(' '))
    }

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
