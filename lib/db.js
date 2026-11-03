/* lib/db.js
   Database helpers for the order / hours ledger (Vercel Postgres).
   2026-11-02: rest time — breaks table.
   2026-11-02: management backend — managers, complaints, vouchers,
   audit_log; orders.voucher_code / orders.voucher_amount.
   2026-11-01: DAILY CHECK — orders.amount_received (the money actually
   received for a PAID order) and daily_received (the owner's bank / wallet
   figure for each payment channel and day).
   2026-11-01: adds the staff payroll tables (staff, shifts, fx_rates) and
   orders.rep_id. All tables are created automatically on first use.
   2026-09-24: adds automatic Interac e-Transfer matching —
   orders.paid_via / orders.paid_at, and the emt_log table (one row per
   Interac notification email read, so no email is ever processed twice). */

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
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_via TEXT NOT NULL DEFAULT ''`
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`
  await sql`CREATE TABLE IF NOT EXISTS hours (
    id SERIAL PRIMARY KEY,
    work_date DATE NOT NULL,
    rep TEXT NOT NULL,
    hours NUMERIC NOT NULL,
    holiday BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`CREATE TABLE IF NOT EXISTS emt_log (
    message_id TEXT PRIMARY KEY,
    received_at TIMESTAMPTZ,
    sender TEXT NOT NULL DEFAULT '',
    amount NUMERIC,
    order_id TEXT NOT NULL DEFAULT '',
    result TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  /* 2026-11-01: staff payroll — personal PIN login, clock in/out,
     orders credited to a staff member, monthly USD→CAD rate. */
  await sql`CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    pin_hash TEXT NOT NULL,
    hourly_rate NUMERIC NOT NULL DEFAULT 0,
    full_time BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_logins INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`CREATE TABLE IF NOT EXISTS shifts (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staff(id),
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    edited BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`CREATE INDEX IF NOT EXISTS shifts_staff_in ON shifts (staff_id, clock_in)`
  // A person can have only one open (not clocked-out) shift at a time.
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS shifts_one_open ON shifts (staff_id) WHERE clock_out IS NULL`
  await sql`CREATE TABLE IF NOT EXISTS fx_rates (
    month TEXT PRIMARY KEY,
    usd_cad NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rep_id INTEGER`
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_received NUMERIC`
  await sql`CREATE TABLE IF NOT EXISTS daily_received (
    day DATE NOT NULL,
    channel TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (day, channel)
  )`
  /* 2026-11-02: management backend (/manage) — personal manager logins,
     customer complaints (with a flexible fine and voucher decided per
     complaint), customer vouchers usable on /pay, and an activity log. */
  await sql`CREATE TABLE IF NOT EXISTS managers (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    pass_hash TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_logins INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    order_id TEXT NOT NULL DEFAULT '',
    staff_id INTEGER REFERENCES staff(id),
    customer TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'other',
    details TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    fine_amount NUMERIC,
    voucher_code TEXT NOT NULL DEFAULT '',
    decision_note TEXT NOT NULL DEFAULT '',
    created_by TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_by TEXT NOT NULL DEFAULT '',
    decided_at TIMESTAMPTZ
  )`
  await sql`CREATE TABLE IF NOT EXISTS vouchers (
    code TEXT PRIMARY KEY,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CAD',
    customer TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    complaint_id INTEGER,
    created_by TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    used_order_id TEXT,
    used_at TIMESTAMPTZ
  )`
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT NOT NULL DEFAULT ''`
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_amount NUMERIC`
  await sql`CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL DEFAULT '',
    detail TEXT NOT NULL DEFAULT ''
  )`
  /* 2026-11-02: rest time — breaks taken during a shift (START / END BREAK
     on /team). A person can have only one open break at a time. */
  await sql`CREATE TABLE IF NOT EXISTS breaks (
    id SERIAL PRIMARY KEY,
    shift_id INTEGER NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    staff_id INTEGER NOT NULL REFERENCES staff(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    edited BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`CREATE INDEX IF NOT EXISTS breaks_staff_start ON breaks (staff_id, start_at)`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS breaks_one_open ON breaks (staff_id) WHERE end_at IS NULL`
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
