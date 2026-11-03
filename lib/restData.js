/* lib/restData.js (added 2026-11-02)
   Loads shifts and breaks from the database and runs the REST TIME checks
   (lib/rest.js). Used by /api/manage/rest and the management dashboard. */

import { sql } from './db'
import { SETTINGS } from './settings'
import { computeRest } from './rest'

const num = (v) => (v === null || v === undefined ? null : Number(v))

/* from / to: Toronto days 'YYYY-MM-DD' (inclusive). Shifts from 15 days
   before are loaded too, so rest before the first day is known. */
export async function loadRest(from, to) {
  const staff = (await sql`SELECT id, name FROM staff WHERE active = TRUE
    OR id IN (SELECT staff_id FROM shifts WHERE clock_in >= (${from}::date - 15)) ORDER BY name`).rows
  const shifts = (await sql`SELECT id, staff_id,
      (EXTRACT(EPOCH FROM clock_in) * 1000)::bigint AS in_ms,
      (EXTRACT(EPOCH FROM clock_out) * 1000)::bigint AS out_ms
    FROM shifts
    WHERE clock_in >= ((${from}::date - 15)::timestamp AT TIME ZONE 'America/Toronto')
      AND clock_in < (((${to}::date + 1)::timestamp) AT TIME ZONE 'America/Toronto')`).rows
  const breaks = (await sql`SELECT id, shift_id, staff_id,
      (EXTRACT(EPOCH FROM start_at) * 1000)::bigint AS start_ms,
      (EXTRACT(EPOCH FROM end_at) * 1000)::bigint AS end_ms
    FROM breaks
    WHERE start_at >= ((${from}::date - 15)::timestamp AT TIME ZONE 'America/Toronto')
      AND start_at < (((${to}::date + 1)::timestamp) AT TIME ZONE 'America/Toronto')`).rows
  return computeRest({
    staff,
    shifts: shifts.map((s) => ({ id: s.id, staffId: s.staff_id, inMs: num(s.in_ms), outMs: num(s.out_ms) })),
    breaks: breaks.map((b) => ({ id: b.id, shiftId: b.shift_id, staffId: b.staff_id, startMs: num(b.start_ms), endMs: num(b.end_ms) })),
    settings: SETTINGS,
    from,
    to,
  })
}

export function monthRange(month) {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { from: month + '-01', to: month + '-' + String(last).padStart(2, '0') }
}

/* Breaks of a month for the REST list (Toronto times). */
export async function breaksForMonth(month) {
  const { rows } = await sql`SELECT b.id, b.shift_id, b.staff_id, st.name, b.edited, b.note,
      to_char(b.start_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD"T"HH24:MI') AS start_local,
      to_char(b.end_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD"T"HH24:MI') AS end_local,
      ROUND((EXTRACT(EPOCH FROM (COALESCE(b.end_at, NOW()) - b.start_at)) / 60.0)::numeric) AS minutes
    FROM breaks b JOIN staff st ON st.id = b.staff_id
    WHERE to_char(b.start_at AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}
    ORDER BY b.start_at DESC`
  return rows.map((r) => ({ id: r.id, shiftId: r.shift_id, staffId: r.staff_id, name: r.name, edited: r.edited, note: r.note,
    start: r.start_local, end: r.end_local, minutes: Number(r.minutes), open: r.end_local === null }))
}
