/* lib/rest.js (added 2026-11-02) — REST TIME checks
   Pure functions (no database) so they can be tested on their own.

   Staff press START BREAK / END BREAK on /team. Breaks are PAID (they stay
   in the hours worked — see SETTINGS.breaksPaid); these checks only watch
   that people actually rest, using Ontario Employment Standards Act
   minimums and the company's 30-minute break:

     • eating break  — a break of at least 30 min after no more than 5 h of
                       work in a row (a shorter break does not reset the 5 h)
     • long break    — a break longer than 30 min
     • between shifts— at least 8 h off between two shifts
     • daily rest    — at least 11 h in a row off work in each day
                       (Toronto calendar day)
     • weekly rest   — at least 24 h in a row off each week (Monday–Sunday),
                       or 48 h in a row in the two weeks around it
   A small grace (SETTINGS.breakGraceMinutes) allows for tapping the buttons.
   Shifts still open longer than maxShiftHours (forgot to clock out) are not
   judged until they are fixed. All times are epoch milliseconds. */

const MIN = 60000
const HOUR = 3600000
const DAY = 86400000

/* ---------- Toronto calendar helpers ---------- */

function tzOffset(ms) {
  // (Toronto local clock − UTC) in ms at that instant, e.g. −4 h in summer
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto', hourCycle: 'h23', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(ms))
  const g = (t) => Number(p.find((x) => x.type === t).value)
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - Math.floor(ms / 1000) * 1000
}

/* 'YYYY-MM-DD' (Toronto) → epoch ms of that day's 00:00 in Toronto */
export function torontoMidnight(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d)
  let t = guess - tzOffset(guess)
  t = guess - tzOffset(t)
  return t
}

export function torontoDate(ms) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms))
}

export function torontoTime(ms) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(ms))
  const g = (t) => p.find((x) => x.type === t).value
  return g('year') + '-' + g('month') + '-' + g('day') + ' ' + g('hour') + ':' + g('minute')
}

function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}
function weekday(ymd) { // 0 = Monday … 6 = Sunday
  const [y, m, d] = ymd.split('-').map(Number)
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
}

/* Longest stretch with no work inside [from, to). work = [[start, end], …] */
function longestFree(work, from, to) {
  const parts = work
    .map(([a, b]) => [Math.max(a, from), Math.min(b, to)])
    .filter(([a, b]) => b > a)
    .sort((x, y) => x[0] - y[0])
  let best = 0
  let cursor = from
  for (const [a, b] of parts) {
    if (a > cursor) best = Math.max(best, a - cursor)
    cursor = Math.max(cursor, b)
  }
  return Math.max(best, to - cursor)
}

const round1 = (n) => Math.round(n * 10) / 10

/* ---------- one shift ---------- */

/* When did the current run of work (without a proper eating break) start?
   Used for the reminder on /team. */
export function stretchStart(shift, breaks, S, now = Date.now()) {
  const minEat = (S.breakMinutes - S.breakGraceMinutes) * MIN
  let cursor = shift.inMs
  breaks
    .filter((b) => b.shiftId === shift.id)
    .sort((a, b) => a.startMs - b.startMs)
    .forEach((b) => {
      const end = b.endMs || now
      if (end - b.startMs >= minEat) cursor = Math.max(cursor, end)
    })
  return cursor
}

/* Work stretches between proper eating breaks in one shift, in minutes. */
function stretches(shift, end, breaks, S, now) {
  const minEat = (S.breakMinutes - S.breakGraceMinutes) * MIN
  const out = []
  let cursor = shift.inMs
  breaks
    .filter((b) => b.shiftId === shift.id)
    .sort((a, b) => a.startMs - b.startMs)
    .forEach((b) => {
      const bEnd = b.endMs || now
      if (bEnd - b.startMs >= minEat) {
        out.push({ from: cursor, to: b.startMs })
        cursor = Math.max(cursor, bEnd)
      }
    })
  out.push({ from: cursor, to: end })
  return out
}

/* ---------- the report ---------- */

/**
 * @param {object} p
 * @param {Array}  p.staff    [{ id, name }]
 * @param {Array}  p.shifts   [{ id, staffId, inMs, outMs|null }]  (include ~2 weeks before the month)
 * @param {Array}  p.breaks   [{ id, shiftId, staffId, startMs, endMs|null, edited, note }]
 * @param {object} p.settings SETTINGS
 * @param {string} p.from     first Toronto day to report, 'YYYY-MM-DD'
 * @param {string} p.to       last Toronto day to report (inclusive)
 * @param {number} [p.now]
 */
export function computeRest(p) {
  const S = p.settings
  const now = p.now || Date.now()
  const grace = (S.breakGraceMinutes || 0) * MIN
  const maxOpen = (Number(S.maxShiftHours) || 16) * HOUR
  const fromMs = torontoMidnight(p.from)
  const toMs = torontoMidnight(addDays(p.to, 1))
  const inRange = (ms) => ms >= fromMs && ms < toMs

  const byStaff = {}
  ;(p.staff || []).forEach((s) => {
    byStaff[s.id] = {
      staffId: s.id, name: s.name, shifts: 0, breaks: 0, breakMinutes: 0, onBreakNow: null,
      longBreaks: [], missedEating: [], shortGaps: [], dailyRest: [], weeklyRest: [], issues: 0,
    }
  })

  const staffIds = Object.keys(byStaff).map(Number)
  for (const sid of staffIds) {
    const r = byStaff[sid]
    // Shifts that can be judged: closed, or open but not forgotten.
    const shifts = (p.shifts || []).filter((s) => s.staffId === sid)
      .map((s) => ({ ...s, endMs: s.outMs || now, forgotten: !s.outMs && now - s.inMs > maxOpen }))
      .filter((s) => !s.forgotten)
      .sort((a, b) => a.inMs - b.inMs)
    const breaks = (p.breaks || []).filter((b) => b.staffId === sid)
    const work = shifts.map((s) => [s.inMs, s.endMs])

    // breaks: count, minutes, too long
    breaks.forEach((b) => {
      const end = b.endMs || now
      if (!b.endMs) r.onBreakNow = { since: torontoTime(b.startMs), minutes: Math.floor((now - b.startMs) / MIN) }
      if (!inRange(b.startMs)) return
      const mins = (end - b.startMs) / MIN
      r.breaks += 1
      r.breakMinutes += mins
      if (end - b.startMs > S.breakMinutes * MIN + grace) {
        r.longBreaks.push({ id: b.id, date: torontoDate(b.startMs), start: torontoTime(b.startMs), minutes: Math.round(mins), open: !b.endMs })
      }
    })
    r.breakMinutes = Math.round(r.breakMinutes)

    // eating break after 5 h
    const limit = S.eatingBreakAfterHours * HOUR + grace
    shifts.forEach((s) => {
      if (!inRange(s.inMs)) return
      r.shifts += 1
      stretches(s, s.endMs, breaks, S, now).forEach((st) => {
        if (st.to - st.from > limit) {
          r.missedEating.push({ shiftId: s.id, date: torontoDate(s.inMs), from: torontoTime(st.from),
            hours: round1((st.to - st.from) / HOUR), stillWorking: !s.outMs && st.to === s.endMs })
        }
      })
    })

    // time off between shifts
    for (let i = 1; i < shifts.length; i++) {
      const prev = shifts[i - 1]
      const next = shifts[i]
      if (!inRange(next.inMs) || !prev.outMs) continue
      const gap = next.inMs - prev.outMs
      if (gap < S.minHoursBetweenShifts * HOUR - grace) {
        r.shortGaps.push({ date: torontoDate(next.inMs), from: torontoTime(prev.outMs), to: torontoTime(next.inMs), hours: round1(Math.max(0, gap) / HOUR) })
      }
    }

    // daily rest: each Toronto day with work, once the day is over
    const days = new Set(shifts.filter((s) => inRange(s.inMs)).map((s) => torontoDate(s.inMs)))
    ;[...days].sort().forEach((d) => {
      const a = torontoMidnight(d)
      const b = torontoMidnight(addDays(d, 1))
      if (b > now) return
      const free = longestFree(work, a, b)
      if (free < S.minDailyRestHours * HOUR - grace) r.dailyRest.push({ date: d, longestRestHours: round1(free / HOUR) })
    })

    // weekly rest: Monday-to-Sunday weeks that start in the range and are over
    let d = p.from
    while (weekday(d) !== 0) d = addDays(d, 1)
    for (; d <= p.to; d = addDays(d, 7)) {
      const a = torontoMidnight(d)
      const b = torontoMidnight(addDays(d, 7))
      if (b > now) break
      if (!work.some(([x, y]) => y > a && x < b)) continue
      const free = longestFree(work, a, b)
      if (free >= S.minWeeklyRestHours * HOUR - grace) continue
      // ESA alternative: 48 h in a row within the two-week period
      const two = S.minWeeklyRestHours * 2 * HOUR - grace
      const prevOk = longestFree(work, torontoMidnight(addDays(d, -7)), b) >= two
      const nextEnd = torontoMidnight(addDays(d, 14))
      const nextOk = nextEnd <= now && longestFree(work, a, nextEnd) >= two
      if (!prevOk && !nextOk) r.weeklyRest.push({ weekStart: d, longestRestHours: round1(free / HOUR) })
    }

    r.issues = r.longBreaks.length + r.missedEating.length + r.shortGaps.length + r.dailyRest.length + r.weeklyRest.length
  }

  const staff = Object.values(byStaff).sort((a, b) => a.name.localeCompare(b.name))
  return {
    from: p.from,
    to: p.to,
    rules: {
      breakMinutes: S.breakMinutes, eatingBreakAfterHours: S.eatingBreakAfterHours,
      minHoursBetweenShifts: S.minHoursBetweenShifts, minDailyRestHours: S.minDailyRestHours,
      minWeeklyRestHours: S.minWeeklyRestHours, breaksPaid: !!S.breaksPaid,
    },
    staff,
    issues: staff.reduce((n, s) => n + s.issues, 0),
  }
}

export const restInternals = { longestFree, addDays, weekday, stretches }
