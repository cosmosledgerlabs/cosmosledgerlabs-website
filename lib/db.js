/* lib/db.js
   Database helpers for the order / hours ledger (Vercel Postgres). */

import { sql } from '@vercel/postgres'

let ready = false

export async function ensureTables() {
  if (ready) return
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    service TEXT NOT NULL DEFAULT '',
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    method TEXT NOT NULL,
    rep TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`CREATE TABLE IF NOT EXISTS hours (
    id SERIAL PRIMARY KEY,
    work_date DATE NOT NULL,
    rep TEXT NOT NULL,
    hours NUMERIC NOT NULL,
    holiday BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  ready = true
}

export function isAdmin(req) {
  const code = req.headers['x-passcode'] || ''
  return !!process.env.ADMIN_PASSCODE && code === process.env.ADMIN_PASSCODE
}

export function isTeam(req) {
  const code = req.headers['x-passcode'] || ''
  return (
    (!!process.env.TEAM_PASSCODE && code === process.env.TEAM_PASSCODE) ||
    isAdmin(req)
  )
}

export { sql }
