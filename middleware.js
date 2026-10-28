/* middleware.js — country blocking for payments (added 2026-10-28)

   Visitors from the countries below cannot open the payment pages (/pay,
   /payment) or create an order (POST /api/orders). They see the
   /restricted page instead. Every other page of the site stays open.

   The visitor's country comes from Vercel, which detects it from the
   visitor's IP address (header x-vercel-ip-country). If the country cannot
   be detected (for example when running locally), nothing is blocked.

   To change the list, edit BLOCKED_COUNTRIES (two-letter ISO country codes)
   and redeploy. */

import { NextResponse } from 'next/server'

export const BLOCKED_COUNTRIES = [
  'CA', // Canada
  'US', // United States
  'KP', // North Korea
  'IR', // Iran
  'CU', // Cuba
  'SY', // Syria
]

export function middleware(req) {
  const country = String(
    (req.geo && req.geo.country) || req.headers.get('x-vercel-ip-country') || ''
  ).toUpperCase()

  if (!country || !BLOCKED_COUNTRIES.includes(country)) return NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Only creating an order is blocked; the admin page's own requests
    // (list / mark paid / delete, which need the admin passcode) still work.
    if (req.method !== 'POST') return NextResponse.next()
    return NextResponse.json(
      { error: 'This service is not available in your region.' },
      { status: 451 }
    )
  }

  const url = req.nextUrl.clone()
  url.pathname = '/restricted'
  url.search = ''
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/pay', '/payment', '/api/orders'],
}
