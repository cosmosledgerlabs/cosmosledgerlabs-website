/* lib/managerAuth.js (added 2026-11-02)
   Personal manager logins for the management backend (/manage).

   - Each manager has their own username and password (8+ characters),
     created by the owner on /admin → MANAGERS. Passwords are salted and
     hashed (scrypt), never stored as typed.
   - After logging in, the browser holds a signed ticket for 12 hours
     (header x-manager-token). A staff ticket can never be used as a
     manager ticket: they are signed with different keys.
   - 5 wrong passwords in a row lock that account for 15 minutes.
   - The owner's ADMIN passcode (header x-passcode) is also accepted on every
     management request, acting as "Owner".
   - Every change a manager makes is written to the activity log. */

import crypto from 'crypto'
import { sql, isAdmin } from './db'
import { hashPin, checkPin } from './staffAuth'

const TOKEN_HOURS = 12
export const MAX_FAILED = 5
export const LOCK_MINUTES = 15
export const USERNAME_RE = /^[a-z0-9._-]{3,30}$/

function secret() {
  const base = process.env.STAFF_SECRET || process.env.ADMIN_PASSCODE || ''
  return base ? base + ':manager-ticket' : ''
}

export const hashPassword = (p) => hashPin(p)
export const checkPassword = (p, stored) => checkPin(p, stored)
export function validPassword(p) {
  const s = String(p || '')
  return s.length >= 8 && s.length <= 100
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function makeManagerToken(id) {
  const s = secret()
  if (!s) return ''
  const body = b64url(JSON.stringify({ mid: id, exp: Date.now() + TOKEN_HOURS * 3600 * 1000 }))
  const sig = b64url(crypto.createHmac('sha256', s).update(body).digest())
  return body + '.' + sig
}

export function readManagerToken(token) {
  try {
    const s = secret()
    const [body, sig] = String(token || '').split('.')
    if (!s || !body || !sig) return null
    const want = b64url(crypto.createHmac('sha256', s).update(body).digest())
    if (want.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null
    const data = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
    if (!data || !Number.isInteger(data.mid) || !(data.exp > Date.now())) return null
    return data
  } catch (e) {
    return null
  }
}

/* Who is making this management request: { id, name, role } or null.
   role is 'owner' (admin passcode) or 'manager'. */
export async function currentManager(req) {
  if (isAdmin(req)) return { id: null, name: 'Owner', role: 'owner' }
  const t = readManagerToken(req.headers['x-manager-token'])
  if (!t) return null
  const { rows } = await sql`SELECT id, name, active FROM managers WHERE id = ${t.mid}`
  if (!rows.length || !rows[0].active) return null
  return { id: rows[0].id, name: rows[0].name, role: 'manager' }
}

/* One line in the activity log. Never throws — logging must not block work. */
export async function logAction(actor, action, detail) {
  try {
    const who = actor ? (actor.role === 'owner' ? 'Owner' : actor.name) : 'system'
    await sql`INSERT INTO audit_log (actor, action, detail)
              VALUES (${String(who).slice(0, 60)}, ${String(action).slice(0, 60)}, ${String(detail || '').slice(0, 400)})`
  } catch (e) { /* ignore */ }
}
