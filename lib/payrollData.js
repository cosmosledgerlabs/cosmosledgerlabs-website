/* lib/payrollData.js (added 2026-11-01)
   Loads one month of data from the database and runs the pay calculation
   in lib/payroll.js. Used by /api/settle (admin, everyone) and
   /api/my-pay (one staff member, only their own figures).
   Months and days are in Toronto time. */

import { sql } from './db'
import { SETTINGS } from './settings'
import { computePayroll } from './payroll'

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

export async function loadPayroll(month) {
  const staff = (await sql`SELECT id, name, hourly_rate, full_time, active FROM staff ORDER BY name`).rows

  const maxHours = Number(SETTINGS.maxShiftHours) || 16
  const shifts = (await sql`
    SELECT id, staff_id,
      to_char(clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD') AS work_date,
      CASE WHEN clock_out IS NULL THEN NULL
           ELSE ROUND((EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600.0)::numeric, 2) END AS hours,
      (clock_out IS NULL) AS open,
      (clock_out IS NOT NULL AND clock_out - clock_in > make_interval(hours => ${maxHours}::int)) AS too_long
    FROM shifts
    WHERE to_char(clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}`).rows

  // PAID orders count in the month they were paid; unpaid ones in the month created.
  const orders = (await sql`
    SELECT id, rep_id, rep, amount, currency, status FROM orders
    WHERE to_char(COALESCE(CASE WHEN status = 'PAID' THEN paid_at END, created_at)
                  AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}`).rows

  // Hours typed by name on the old /team page (before 2026-11-01).
  const legacyHours = (await sql`
    SELECT rep, to_char(work_date, 'YYYY-MM-DD') AS work_date, hours FROM hours
    WHERE to_char(work_date, 'YYYY-MM') = ${month}`).rows

  const fx = (await sql`SELECT usd_cad FROM fx_rates WHERE month = ${month}`).rows
  const usdCad = fx.length ? Number(fx[0].usd_cad) : null

  const result = computePayroll({ month, settings: SETTINGS, usdCad, staff, shifts, orders, legacyHours })
  result.usdCadEntered = usdCad !== null
  result.settings = SETTINGS
  return result
}
