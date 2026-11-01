/* pages/api/staff-login.js (added 2026-11-01)
   POST { staffId, pin } → { token, name }
   5 wrong PINs in a row lock the account for 15 minutes (the admin can
   unlock it sooner on the admin page). */

import { ensureTables, sql } from '../../lib/db'
import { checkPin, makeToken, validPin, MAX_FAILED, LOCK_MINUTES } from '../../lib/staffAuth'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
    await ensureTables()
    const b = req.body || {}
    const id = Number(b.staffId)
    if (!Number.isInteger(id) || !validPin(b.pin)) return res.status(400).json({ error: 'Choose your name and enter your PIN.' })

    const { rows } = await sql`SELECT id, name, pin_hash, active, failed_logins,
        (locked_until IS NOT NULL AND locked_until > NOW()) AS locked FROM staff WHERE id = ${id}`
    if (!rows.length || !rows[0].active) return res.status(401).json({ error: 'Wrong name or PIN.' })
    const s = rows[0]
    if (s.locked) return res.status(423).json({ error: 'Too many wrong PINs. Try again in ' + LOCK_MINUTES + ' minutes or ask the admin.' })

    if (!checkPin(b.pin, s.pin_hash)) {
      const fails = Number(s.failed_logins) + 1
      if (fails >= MAX_FAILED) {
        await sql`UPDATE staff SET failed_logins = 0,
                  locked_until = NOW() + make_interval(mins => ${LOCK_MINUTES}::int) WHERE id = ${id}`
        return res.status(423).json({ error: 'Too many wrong PINs. Try again in ' + LOCK_MINUTES + ' minutes or ask the admin.' })
      }
      await sql`UPDATE staff SET failed_logins = ${fails} WHERE id = ${id}`
      return res.status(401).json({ error: 'Wrong name or PIN.' })
    }

    await sql`UPDATE staff SET failed_logins = 0, locked_until = NULL WHERE id = ${id}`
    const token = makeToken(s.id)
    if (!token) return res.status(500).json({ error: 'Login is not set up — ADMIN_PASSCODE is missing.' })
    return res.status(200).json({ token, name: s.name })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
