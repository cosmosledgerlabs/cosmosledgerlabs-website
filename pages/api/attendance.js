/* pages/api/attendance.js (added 2026-11-01) — clock in / clock out.

   Staff (header x-staff-token, from /api/staff-login):
     GET                       — am I clocked in? + my shifts this month
     POST { action: 'in' }     — clock in  (time is taken from the server)
     POST { action: 'out' }    — clock out (ends a break still running)
     POST { action: 'break-start' } / { action: 'break-end' }
                               — 2026-11-02: START BREAK / END BREAK (paid
                                 breaks; times from the server)
   Admin (header x-passcode):
     GET  ?month=YYYY-MM       — every shift that month
     POST  { staffId, clockIn, clockOut, note }  — add a missed shift
     PATCH { id, clockIn, clockOut, note }       — correct a shift
     DELETE { id }                                — remove a shift
   Admin times are entered in Toronto time as 'YYYY-MM-DDTHH:MM'.
   Each shift now lists its breaks. Breaks are corrected by managers on
   /manage → REST. */

import { ensureTables, sql, isAdmin } from '../../lib/db'
import { currentStaff } from '../../lib/staffAuth'
import { SETTINGS } from '../../lib/settings'
import { MONTH_RE } from '../../lib/payrollData'
import { stretchStart } from '../../lib/rest'

const LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

const SHIFT_FIELDS = (rows) => rows.map((r) => ({
  id: r.id,
  staffId: r.staff_id,
  name: r.name,
  clockIn: r.clock_in_local,
  clockOut: r.clock_out_local,
  hours: r.hours === null ? null : Number(r.hours),
  open: r.open,
  tooLong: r.too_long,
  edited: r.edited,
  note: r.note,
}))

async function shiftsFor(month, staffId) {
  const maxHours = Number(SETTINGS.maxShiftHours) || 16
  const { rows } = staffId
    ? await sql`SELECT s.id, s.staff_id, st.name, s.edited, s.note,
          to_char(s.clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD"T"HH24:MI') AS clock_in_local,
          to_char(s.clock_out AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD"T"HH24:MI') AS clock_out_local,
          CASE WHEN s.clock_out IS NULL THEN NULL
               ELSE ROUND((EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 3600.0)::numeric, 2) END AS hours,
          (s.clock_out IS NULL) AS open,
          (s.clock_out IS NOT NULL AND s.clock_out - s.clock_in > make_interval(hours => ${maxHours}::int)) AS too_long
        FROM shifts s JOIN staff st ON st.id = s.staff_id
        WHERE s.staff_id = ${staffId}
          AND to_char(s.clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}
        ORDER BY s.clock_in DESC`
    : await sql`SELECT s.id, s.staff_id, st.name, s.edited, s.note,
          to_char(s.clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD"T"HH24:MI') AS clock_in_local,
          to_char(s.clock_out AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD"T"HH24:MI') AS clock_out_local,
          CASE WHEN s.clock_out IS NULL THEN NULL
               ELSE ROUND((EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 3600.0)::numeric, 2) END AS hours,
          (s.clock_out IS NULL) AS open,
          (s.clock_out IS NOT NULL AND s.clock_out - s.clock_in > make_interval(hours => ${maxHours}::int)) AS too_long
        FROM shifts s JOIN staff st ON st.id = s.staff_id
        WHERE to_char(s.clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}
        ORDER BY s.clock_in DESC`
  const list = SHIFT_FIELDS(rows)
  // Breaks of these shifts (2026-11-02)
  const { rows: br } = await sql`SELECT b.shift_id,
      to_char(b.start_at AT TIME ZONE 'America/Toronto', 'HH24:MI') AS start_t,
      to_char(b.end_at AT TIME ZONE 'America/Toronto', 'HH24:MI') AS end_t,
      ROUND((EXTRACT(EPOCH FROM (COALESCE(b.end_at, NOW()) - b.start_at)) / 60.0)::numeric) AS minutes
    FROM breaks b JOIN shifts s ON s.id = b.shift_id
    WHERE to_char(s.clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM') = ${month}
      AND (${staffId || 0} = 0 OR s.staff_id = ${staffId || 0})
    ORDER BY b.start_at`
  const byShift = {}
  br.forEach((b) => { (byShift[b.shift_id] = byShift[b.shift_id] || []).push({ start: b.start_t, end: b.end_t, minutes: Number(b.minutes) }) })
  list.forEach((x) => { x.breaks = byShift[x.id] || [] })
  return list
}

function restRules() {
  return {
    breakMinutes: SETTINGS.breakMinutes,
    eatingBreakAfterHours: SETTINGS.eatingBreakAfterHours,
    breakReminderMinutes: SETTINGS.breakReminderMinutes,
    breaksPaid: !!SETTINGS.breaksPaid,
  }
}

function torontoMonthNow() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit' }).formatToParts(new Date())
  return p.find((x) => x.type === 'year').value + '-' + p.find((x) => x.type === 'month').value
}

export default async function handler(req, res) {
  try {
    await ensureTables()
    res.setHeader('Cache-Control', 'no-store')

    /* ---------- admin ---------- */
    if (isAdmin(req)) {
      if (req.method === 'GET') {
        const month = String(req.query.month || '')
        if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })
        return res.status(200).json({ shifts: await shiftsFor(month, null) })
      }
      const b = req.body || {}
      if (req.method === 'POST' || req.method === 'PATCH') {
        if (!LOCAL_RE.test(String(b.clockIn)) || (b.clockOut && !LOCAL_RE.test(String(b.clockOut))))
          return res.status(400).json({ error: 'Enter the times as date and time.' })
        if (b.clockOut && String(b.clockOut) <= String(b.clockIn))
          return res.status(400).json({ error: 'Clock-out must be after clock-in.' })
        const note = String(b.note || '').slice(0, 200)
        const out = b.clockOut ? String(b.clockOut) : null
        if (req.method === 'POST') {
          const sid = Number(b.staffId)
          if (!Number.isInteger(sid)) return res.status(400).json({ error: 'Choose a staff member.' })
          await sql`INSERT INTO shifts (staff_id, clock_in, clock_out, edited, note)
                    VALUES (${sid},
                            (${String(b.clockIn)}::timestamp AT TIME ZONE 'America/Toronto'),
                            (${out}::timestamp AT TIME ZONE 'America/Toronto'),
                            TRUE, ${note})`
        } else {
          const id = Number(b.id)
          if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
          await sql`UPDATE shifts SET
                      clock_in = (${String(b.clockIn)}::timestamp AT TIME ZONE 'America/Toronto'),
                      clock_out = (${out}::timestamp AT TIME ZONE 'America/Toronto'),
                      edited = TRUE, note = ${note}
                    WHERE id = ${id}`
        }
        return res.status(200).json({ ok: true })
      }
      if (req.method === 'DELETE') {
        const id = Number(b.id)
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
        await sql`DELETE FROM shifts WHERE id = ${id}`
        return res.status(200).json({ ok: true })
      }
      return res.status(405).json({ error: 'method not allowed' })
    }

    /* ---------- staff ---------- */
    const me = await currentStaff(req)
    if (!me) return res.status(401).json({ error: 'Please log in again.' })

    const openShift = async () => (await sql`SELECT id,
        to_char(clock_in AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS since
        FROM shifts WHERE staff_id = ${me.id} AND clock_out IS NULL
        ORDER BY clock_in DESC LIMIT 1`).rows[0] || null

    /* Break status of the open shift, for the buttons and the reminder. */
    const restInfo = async (open) => {
      const nowMs = Date.now()
      if (!open) return { nowMs, onBreak: null, stretchStartMs: null, breaks: [], rules: restRules() }
      const { rows: sh } = await sql`SELECT (EXTRACT(EPOCH FROM clock_in) * 1000)::bigint AS in_ms FROM shifts WHERE id = ${open.id}`
      const { rows: br } = await sql`SELECT id,
          (EXTRACT(EPOCH FROM start_at) * 1000)::bigint AS start_ms,
          (EXTRACT(EPOCH FROM end_at) * 1000)::bigint AS end_ms,
          to_char(start_at AT TIME ZONE 'America/Toronto', 'HH24:MI') AS start_t,
          to_char(end_at AT TIME ZONE 'America/Toronto', 'HH24:MI') AS end_t
        FROM breaks WHERE shift_id = ${open.id} ORDER BY start_at`
      const breaks = br.map((b) => ({ id: b.id, shiftId: open.id, startMs: Number(b.start_ms),
        endMs: b.end_ms === null ? null : Number(b.end_ms), start: b.start_t, end: b.end_t }))
      const running = breaks.find((b) => b.endMs === null) || null
      return {
        nowMs,
        onBreak: running ? { since: running.start, startMs: running.startMs } : null,
        stretchStartMs: stretchStart({ id: open.id, inMs: Number(sh[0].in_ms) }, breaks, SETTINGS, nowMs),
        breaks: breaks.map((b) => ({ start: b.start, end: b.end, minutes: Math.round(((b.endMs || nowMs) - b.startMs) / 60000) })),
        rules: restRules(),
      }
    }

    if (req.method === 'GET') {
      const month = MONTH_RE.test(String(req.query.month || '')) ? String(req.query.month) : torontoMonthNow()
      const open = await openShift()
      return res.status(200).json({ name: me.name, open, rest: await restInfo(open), shifts: await shiftsFor(month, me.id) })
    }

    if (req.method === 'POST') {
      const action = (req.body || {}).action
      const open = await openShift()
      if (action === 'in') {
        if (open) return res.status(409).json({ error: 'You are already clocked in since ' + open.since + '.', open })
        try {
          await sql`INSERT INTO shifts (staff_id, clock_in) VALUES (${me.id}, NOW())`
        } catch (err) {
          // Two taps at once: the database allows only one open shift.
          const again = await openShift()
          if (again) return res.status(200).json({ ok: true, open: again })
          throw err
        }
        return res.status(200).json({ ok: true, open: await openShift() })
      }
      if (action === 'out') {
        if (!open) return res.status(409).json({ error: 'You are not clocked in.' })
        await sql`UPDATE breaks SET end_at = NOW() WHERE staff_id = ${me.id} AND end_at IS NULL`
        await sql`UPDATE shifts SET clock_out = NOW() WHERE id = ${open.id} AND clock_out IS NULL`
        return res.status(200).json({ ok: true, open: null })
      }
      if (action === 'break-start') {
        if (!open) return res.status(409).json({ error: 'Clock in first.' })
        const running = await sql`SELECT 1 FROM breaks WHERE staff_id = ${me.id} AND end_at IS NULL`
        if (running.rows.length) return res.status(409).json({ error: 'You are already on a break.' })
        try {
          await sql`INSERT INTO breaks (shift_id, staff_id, start_at) VALUES (${open.id}, ${me.id}, NOW())`
        } catch (err) {
          // Two taps at once: the database allows only one open break.
          const again = await sql`SELECT 1 FROM breaks WHERE staff_id = ${me.id} AND end_at IS NULL`
          if (!again.rows.length) throw err
        }
        return res.status(200).json({ ok: true, rest: await restInfo(open) })
      }
      if (action === 'break-end') {
        const { rows } = await sql`UPDATE breaks SET end_at = NOW() WHERE staff_id = ${me.id} AND end_at IS NULL RETURNING id`
        if (!rows.length) return res.status(409).json({ error: 'You are not on a break.' })
        return res.status(200).json({ ok: true, rest: await restInfo(open) })
      }
      return res.status(400).json({ error: 'invalid action' })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
