/* pages/api/manage/activity.js (added 2026-11-02)
   GET (manager or owner) ?q=text — the activity log: who did what and when
   (latest 300). */

import { ensureTables, sql } from '../../../lib/db'
import { currentManager } from '../../../lib/managerAuth'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
    await ensureTables()
    const who = await currentManager(req)
    if (!who) return res.status(401).json({ error: 'unauthorized' })
    const q = String(req.query.q || '').trim().slice(0, 60)
    const like = '%' + q.replace(/[%_\\]/g, '') + '%'
    const { rows } = await sql`SELECT id, actor, action, detail,
        to_char(at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS at
      FROM audit_log
      WHERE (${q} = '' OR actor ILIKE ${like} OR action ILIKE ${like} OR detail ILIKE ${like})
      ORDER BY id DESC LIMIT 300`
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ log: rows })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
