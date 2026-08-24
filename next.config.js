/** @type {import('next').NextConfig} */
// Content-Security-Policy tuned for this static marketing site:
// - scripts: same-origin only (three.js and @solana/web3.js are bundled, not from a CDN) → no 'unsafe-inline'
// - styles: 'unsafe-inline' required because the UI uses inline style={{…}} attributes;
//   Google Fonts stylesheet is allowed explicitly
// - fonts: Google Fonts file host
// - connect: same-origin plus the Solana devnet RPC nodes (HTTPS + websocket) used by /flow:
//   the public node and Helius (set via NEXT_PUBLIC_SOLANA_RPC)
// - frame-ancestors 'none' mirrors X-Frame-Options: DENY (clickjacking)
const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self'",
  "connect-src 'self' https://api.devnet.solana.com wss://api.devnet.solana.com https://devnet.helius-rpc.com wss://devnet.helius-rpc.com",
  "upgrade-insecure-requests",
].join('; ')
const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
module.exports = nextConfig
