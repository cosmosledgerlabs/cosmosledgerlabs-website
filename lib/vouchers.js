/* lib/vouchers.js (added 2026-11-02)
   Customer vouchers: a code worth a fixed amount, chosen by management for
   each voucher, that the customer types on /pay to reduce their next
   payment. One use only, has an expiry date, and is in one currency.

   Codes look like CLV-7K3P-Q9WD (no 0/O or 1/I, so they are easy to read
   out loud). They are random, so they cannot be guessed. */

import crypto from 'crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const CODE_RE = /^CLV-[A-Z2-9]{4}-[A-Z2-9]{4}$/
export const DEFAULT_DAYS = 90
export const MAX_DAYS = 3650

export function makeVoucherCode() {
  const bytes = crypto.randomBytes(8)
  let s = ''
  for (let i = 0; i < 8; i++) s += ALPHABET[bytes[i] % ALPHABET.length]
  return 'CLV-' + s.slice(0, 4) + '-' + s.slice(4)
}

/* Accepts what a customer might type: lower case, spaces, missing dashes. */
export function normalizeCode(v) {
  const raw = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  const body = raw.startsWith('CLV') ? raw.slice(3) : raw
  if (body.length !== 8) return ''
  const code = 'CLV-' + body.slice(0, 4) + '-' + body.slice(4)
  return CODE_RE.test(code) ? code : ''
}

/* 'active' | 'used' | 'expired' | 'cancelled' */
export function voucherStatus(v, now = Date.now()) {
  if (v.cancelled) return 'cancelled'
  if (v.used_order_id) return 'used'
  if (new Date(v.expires_at).getTime() <= now) return 'expired'
  return 'active'
}

/* Checks an amount typed by management: > 0, at most 2 decimals. */
export function cleanAmount(v, max = 100000) {
  if (v === null || v === undefined || String(v).trim() === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0 || n > max) return NaN
  return Math.round(n * 100) / 100
}
