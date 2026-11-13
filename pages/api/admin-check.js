/* pages/api/admin-check.js (added 2026-11-13)
   POST (header x-passcode) → 200 { ok: true } if the owner passcode is right.
   Used once by /admin before it loads everything, so a typo counts as one
   wrong try. 5 wrong tries in a row from one IP address lock it for 15
   minutes (lib/db.js → adminStatus). */

import { adminStatus, ADMIN_LOCK_MINUTES } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  res.setHeader('Cache-Control', 'no-store')
  const st = await adminStatus(req)
  if (st === 'ok') return res.status(200).json({ ok: true })
  if (st === 'locked') return res.status(429).json({ error: 'Too many wrong passcodes. Try again in ' + ADMIN_LOCK_MINUTES + ' minutes.' })
  return res.status(401).json({ error: 'Wrong passcode.' })
}
