/* pages/api/manage/rest.js (added 2026-11-02) — REST TIME (managers / owner)
   GET ?month=YYYY-MM  → every staff member's rest checks for the month
                         (missed 30-min eating break after 5 h, breaks over
                         30 min, under 8 h between shifts, under 11 h daily
                         rest, under 24 h weekly rest), who is on a break
                         now, and the month's breaks
   POST   { staffId, start, end, note }   add a forgotten break
   PATCH  { id, start, end, note }        correct a break
   DELETE { id }                          remove a wrong break
   Times are Toronto time 'YYYY-MM-DDTHH:MM'. A break must lie inside one of
   that person's shifts. Every change is written to the activity log. */

import { ensureTables, sql } from '../../../lib/db'
import { currentManager, logAction } from '../../../lib/managerAuth'
import { MONTH_RE } from '../../../lib/payrollData'
import { loadRest, monthRange, breaksForMonth } from '../../../lib/restData'

const LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

async function shiftFor(staffId, start, end) {
  const { rows } = await sql`SELECT id FROM shifts
    WHERE staff_id = ${staffId}
      AND clock_in <= (${start}::timestamp AT TIME ZONE 'America/Toronto')
      AND (clock_out IS NULL OR clock_out >= (${end}::timestamp AT TIME ZONE 'America/Toronto'))
    ORDER BY clock_in DESC LIMIT 1`
  return rows.length ? rows[0].id : null
}

export default async function handler(req, res) {
  try {
    await ensureTables()
    const who = await currentManager(req)
    if (!who) return res.status(401).json({ error: 'unauthorized' })

    if (req.method === 'GET') {
      const month = String(req.query.month || '')
      if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'invalid month' })
      const { from, to } = monthRange(month)
      const report = await loadRest(from, to)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ month, ...report, breaks: await breaksForMonth(month) })
    }

    const b = req.body || {}
    const note = String(b.note || '').slice(0, 200)

    if (req.method === 'POST' || req.method === 'PATCH') {
      const start = String(b.start || '')
      const end = String(b.end || '')
      if (!LOCAL_RE.test(start) || !LOCAL_RE.test(end)) return res.status(400).json({ error: 'Enter the break start and end as date and time.' })
      if (end <= start) return res.status(400).json({ error: 'The break must end after it starts.' })
      let staffId
      let id = null
      if (req.method === 'POST') {
        staffId = Number(b.staffId)
        if (!Number.isInteger(staffId)) return res.status(400).json({ error: 'Choose the staff member.' })
      } else {
        id = Number(b.id)
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
        const { rows } = await sql`SELECT staff_id FROM breaks WHERE id = ${id}`
        if (!rows.length) return res.status(404).json({ error: 'Break not found.' })
        staffId = rows[0].staff_id
      }
      const shiftId = await shiftFor(staffId, start, end)
      if (!shiftId) return res.status(400).json({ error: 'That time is not inside one of their shifts — fix the shift first.' })
      const { rows: st } = await sql`SELECT name FROM staff WHERE id = ${staffId}`
      const name = st.length ? st[0].name : 'staff'
      if (req.method === 'POST') {
        await sql`INSERT INTO breaks (shift_id, staff_id, start_at, end_at, edited, note)
          VALUES (${shiftId}, ${staffId}, (${start}::timestamp AT TIME ZONE 'America/Toronto'),
                  (${end}::timestamp AT TIME ZONE 'America/Toronto'), TRUE, ${note})`
        await logAction(who, 'break added', name + ' ' + start.replace('T', ' ') + ' → ' + end.slice(11) + (note ? ' — ' + note : ''))
      } else {
        await sql`UPDATE breaks SET shift_id = ${shiftId},
            start_at = (${start}::timestamp AT TIME ZONE 'America/Toronto'),
            end_at = (${end}::timestamp AT TIME ZONE 'America/Toronto'), edited = TRUE, note = ${note}
          WHERE id = ${id}`
        await logAction(who, 'break corrected', name + ' ' + start.replace('T', ' ') + ' → ' + end.slice(11) + (note ? ' — ' + note : ''))
      }
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const id = Number(b.id)
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid' })
      const { rows } = await sql`DELETE FROM breaks b USING staff st WHERE b.id = ${id} AND st.id = b.staff_id
        RETURNING st.name, to_char(b.start_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') AS start_t`
      if (!rows.length) return res.status(404).json({ error: 'Break not found.' })
      await logAction(who, 'break deleted', rows[0].name + ' ' + rows[0].start_t)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'database error' })
  }
}
