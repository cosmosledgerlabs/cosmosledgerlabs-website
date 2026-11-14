/* pages/api/referral-check.js (added 2026-11-13) — public, used by /pay
   GET ?code=CLR-XXXXXX → { ok: true, code } if it is an active referral
   code, otherwise { ok: false }. Nothing else about the referrer is
   shown. Codes are random (about a billion possibilities), so they
   cannot be guessed. */

import { ensureTables, sql } from '../../lib/db'
import { normalizeReferral } from '../../lib/referral'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
    res.setHeader('Cache-Control', 'no-store')
    const code = normalizeReferral(req.query.code)
    if (!code) return res.status(200).json({ ok: false })
    await ensureTables()
    const { rows } = await sql`SELECT 1 FROM referrers WHERE code = ${code} AND active = TRUE`
    return res.status(200).json(rows.length ? { ok: true, code } : { ok: false })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
