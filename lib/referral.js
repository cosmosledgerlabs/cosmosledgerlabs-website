/* lib/referral.js (added 2026-11-13) — referral program settings and the
   referral code format. Safe to use in the browser and on the server.

   A referrer gets a personal code such as CLR-7K3PQ9 from the owner
   (/admin → REFERRERS). A client enters it on /pay (or opens the
   referrer's link cosmosledgerlabs.com/pay?ref=CLR-7K3PQ9), and the order
   is credited to that referrer. Commission is REFERRAL_RATE of the amount
   actually received for the referrer's PAID orders.

   The rules shown to the public are on /referral (pages/referral.js),
   which reads the rate from here, so the page and the report never
   disagree. */

export const REFERRAL_RATE = 0.10          // 10% commission
export const REFERRAL_WINDOW_MONTHS = 12   // agreements signed within 12 months of the introduction
export const REFERRAL_PAYOUT_DAYS = 30     // paid within 30 days after the client's payment clears
export const REFERRAL_PRIOR_CONTACT_MONTHS = 6

export const REFERRAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I
export const REFERRAL_RE = /^CLR-[A-Z2-9]{6}$/

/* Accepts what a person might type: lower case, spaces, missing dash,
   with or without the CLR prefix. Returns '' if it cannot be a code. */
export function normalizeReferral(v) {
  const raw = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  const body = raw.startsWith('CLR') && raw.length === 9 ? raw.slice(3) : raw
  if (body.length !== 6) return ''
  const code = 'CLR-' + body
  return REFERRAL_RE.test(code) ? code : ''
}
