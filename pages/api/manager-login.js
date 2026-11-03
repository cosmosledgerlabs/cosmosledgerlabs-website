/* pages/api/manager-login.js (added 2026-11-02)
   POST { username, password } → { token, name }
   5 wrong passwords in a row lock the account for 15 minutes (the owner can
   unlock it sooner on /admin → MANAGERS). */

import { ensureTables, sql } from '../../lib/db'
import { checkPassword, makeManagerToken, MAX_FAILED, LOCK_MINUTES, logAction } from '../../lib/managerAuth'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
    await ensureTables()
    const b = req.body || {}
    const username = String(b.username || '').trim().toLowerCase()
    const password = String(b.password || '')
    if (!username || !password) return res.status(400).json({ error: 'Enter your username and password.' })

    const { rows } = await sql`SELECT id, name, pass_hash, active, failed_logins,
        (locked_until IS NOT NULL AND locked_until > NOW()) AS locked FROM managers WHERE username = ${username}`
    if (!rows.length || !rows[0].active) return res.status(401).json({ error: 'Wrong username or password.' })
    const m = rows[0]
    const lockedMsg = 'Too many wrong passwords. Try again in ' + LOCK_MINUTES + ' minutes or ask the owner.'
    if (m.locked) return res.status(423).json({ error: lockedMsg })

    if (!checkPassword(password, m.pass_hash)) {
      const fails = Number(m.failed_logins) + 1
      if (fails >= MAX_FAILED) {
        await sql`UPDATE managers SET failed_logins = 0,
                  locked_until = NOW() + make_interval(mins => ${LOCK_MINUTES}::int) WHERE id = ${m.id}`
        await logAction({ role: 'manager', name: m.name }, 'login locked', 'too many wrong passwords')
        return res.status(423).json({ error: lockedMsg })
      }
      await sql`UPDATE managers SET failed_logins = ${fails} WHERE id = ${m.id}`
      return res.status(401).json({ error: 'Wrong username or password.' })
    }

    await sql`UPDATE managers SET failed_logins = 0, locked_until = NULL WHERE id = ${m.id}`
    const token = makeManagerToken(m.id)
    if (!token) return res.status(500).json({ error: 'Login is not set up — ADMIN_PASSCODE is missing.' })
    await logAction({ role: 'manager', name: m.name }, 'logged in', '')
    return res.status(200).json({ token, name: m.name })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
