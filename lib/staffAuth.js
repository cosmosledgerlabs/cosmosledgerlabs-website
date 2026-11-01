/* lib/staffAuth.js (added 2026-11-01)
   Personal staff login: each staff member has their own PIN, so the website
   always knows exactly who is clocking in, clocking out or viewing pay.

   - PINs are never stored as typed: they are salted and hashed (scrypt).
   - After a correct PIN the browser receives a signed ticket valid for 14
     hours; every staff request carries it (header x-staff-token).
   - 5 wrong PINs in a row lock that account for 15 minutes.

   The ticket is signed with the STAFF_SECRET environment variable if it is
   set in Vercel (recommended: any long random text), otherwise with
   ADMIN_PASSCODE. Changing that value logs every staff member out. */

import crypto from 'crypto'
import { sql } from './db'

const TOKEN_HOURS = 14
export const MAX_FAILED = 5
export const LOCK_MINUTES = 15

function secret() {
  return process.env.STAFF_SECRET || process.env.ADMIN_PASSCODE || ''
}

export function validPin(pin) {
  return /^\d{4,8}$/.test(String(pin || ''))
}

export function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(pin), salt, 32).toString('hex')
  return salt + ':' + hash
}

export function checkPin(pin, stored) {
  try {
    const [salt, hash] = String(stored || '').split(':')
    if (!salt || !hash) return false
    const test = crypto.scryptSync(String(pin), salt, 32)
    const want = Buffer.from(hash, 'hex')
    return want.length === test.length && crypto.timingSafeEqual(want, test)
  } catch (e) {
    return false
  }
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function makeToken(staffId) {
  const s = secret()
  if (!s) return ''
  const body = b64url(JSON.stringify({ id: staffId, exp: Date.now() + TOKEN_HOURS * 3600 * 1000 }))
  const sig = b64url(crypto.createHmac('sha256', s).update(body).digest())
  return body + '.' + sig
}

export function readToken(token) {
  try {
    const s = secret()
    const [body, sig] = String(token || '').split('.')
    if (!s || !body || !sig) return null
    const want = b64url(crypto.createHmac('sha256', s).update(body).digest())
    if (want.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null
    const data = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
    if (!data || !Number.isInteger(data.id) || !(data.exp > Date.now())) return null
    return data
  } catch (e) {
    return null
  }
}

/* The logged-in, still-active staff member for this request, or null. */
export async function currentStaff(req) {
  const t = readToken(req.headers['x-staff-token'])
  if (!t) return null
  const { rows } = await sql`SELECT id, name, hourly_rate, full_time, active FROM staff WHERE id = ${t.id}`
  if (!rows.length || !rows[0].active) return null
  return rows[0]
}
