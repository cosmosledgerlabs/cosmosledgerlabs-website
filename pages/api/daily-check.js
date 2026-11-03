/* pages/api/daily-check.js (added 2026-11-01) — DAILY CHECK (admin)
   GET ?day=YYYY-MM-DD            → the day's order and payment totals, per
                                    customer service person and per payment
                                    channel, with every check ✅ / ⚠
   GET ?day=YYYY-MM-DD&format=csv → the same as a spreadsheet
   PUT { day, channel, amount }   → save the owner's bank / wallet figure for
                                    one channel that day (amount blank =
                                    remove). channel e.g. 'wire-CAD', 'emt-CAD'
   Days are Toronto days. See lib/dailyCheck.js for what is checked.
   2026-11-02: managers (/manage login) can use it too; changes are logged. */

import { ensureTables, sql } from '../../lib/db'
import { currentManager, logAction } from '../../lib/managerAuth'
import { loadDailyCheck, dailyCheckCsv, validDay } from '../../lib/dailyCheckData'

const CHANNEL_RE = /^(wire|emt|usdt)-(CAD|USD)$/

export default async function handler(req, res) {
  try {
    await ensureTables()
    const who = await currentManager(req)   // owner passcode or a manager login
    if (!who) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const day = String(req.query.day || '')
      if (!validDay(day)) return res.status(400).json({ error: 'invalid day' })
      const r = await loadDailyCheck(day)
      res.setHeader('Cache-Control', 'no-store')
      if (req.query.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', 'attachment; filename="cosmos-daily-check-' + day + '.csv"')
        return res.status(200).send(dailyCheckCsv(r))
      }
      return res.status(200).json(r)
    }

    if (req.method === 'PUT') {
      const b = req.body || {}
      const day = String(b.day || '')
      const channel = String(b.channel || '')
      if (!validDay(day) || !CHANNEL_RE.test(channel)) return res.status(400).json({ error: 'invalid' })
      if (b.amount === null || b.amount === undefined || String(b.amount).trim() === '') {
        await sql`DELETE FROM daily_received WHERE day = ${day}::date AND channel = ${channel}`
        await logAction(who, 'bank figure removed', day + ' ' + channel)
        return res.status(200).json({ ok: true })
      }
      const amount = Number(b.amount)
      if (!Number.isFinite(amount) || amount < 0 || amount >= 1000000000)
        return res.status(400).json({ error: 'Enter the total received, e.g. 1250.00' })
      const a = Math.round(amount * 100) / 100
      await sql`INSERT INTO daily_received (day, channel, amount) VALUES (${day}::date, ${channel}, ${a})
                ON CONFLICT (day, channel) DO UPDATE SET amount = ${a}, updated_at = NOW()`
      await logAction(who, 'bank figure saved', day + ' ' + channel + ' = ' + a.toFixed(2))
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
