/* lib/payroll.js (added 2026-11-01)
   The salary calculation. Pure functions only — no database — so the same
   maths is used for the admin settlement and for each staff member's own
   "My pay" view, and it can be tested on its own.

   Pay for one staff member for one month (all in CAD):
     hours pay        = hours worked × their hourly rate
     commission       = commissionRate × their PAID orders (USD × monthly rate)
     holiday bonus    = holidayBonusPerDay × Ontario statutory holidays worked
                        (full-time only)
     attendance award = attendanceAwardPerMonth if days worked ≥ required days
                        (full-time only)
     internet subsidy = internetSubsidyPerMonth if they worked at least one day
   A "day worked" is a calendar day (Toronto time) with at least
   minHoursForDay hours. A shift belongs to the day it started.
   A shift with no clock-out counts 0 hours and is flagged for the admin. */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

/* ---------- Ontario statutory (public) holidays ---------- */

function pad(n) { return String(n).padStart(2, '0') }
function ymd(y, m, d) { return y + '-' + pad(m) + '-' + pad(d) }

// Day of week (0 = Sunday) for a calendar date, independent of time zone.
function dow(y, m, d) { return new Date(Date.UTC(y, m - 1, d)).getUTCDay() }

// The n-th given weekday of a month (n = 1 → first).
function nthWeekday(y, m, weekday, n) {
  const first = dow(y, m, 1)
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7
}

// Easter Sunday (Gregorian calendar, anonymous algorithm).
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

/* Ontario's nine public holidays under the Employment Standards Act. */
export function ontarioHolidays(year) {
  const y = Number(year)
  const e = easter(y)
  const goodFriday = new Date(Date.UTC(y, e.month - 1, e.day - 2))
  // Victoria Day: the Monday before May 25.
  let victoria = 24
  while (dow(y, 5, victoria) !== 1) victoria -= 1
  return {
    [ymd(y, 1, 1)]: "New Year's Day",
    [ymd(y, 2, nthWeekday(y, 2, 1, 3))]: 'Family Day',
    [ymd(y, goodFriday.getUTCMonth() + 1, goodFriday.getUTCDate())]: 'Good Friday',
    [ymd(y, 5, victoria)]: 'Victoria Day',
    [ymd(y, 7, 1)]: 'Canada Day',
    [ymd(y, 9, nthWeekday(y, 9, 1, 1))]: 'Labour Day',
    [ymd(y, 10, nthWeekday(y, 10, 1, 2))]: 'Thanksgiving Day',
    [ymd(y, 12, 25)]: 'Christmas Day',
    [ymd(y, 12, 26)]: 'Boxing Day',
  }
}

export function holidaysForMonth(month, extra) {
  const y = Number(String(month).slice(0, 4))
  const all = Object.assign({}, ontarioHolidays(y))
  ;(extra || []).forEach((d) => { if (!all[d]) all[d] = 'Extra holiday' })
  const out = {}
  Object.keys(all).forEach((d) => { if (d.slice(0, 7) === month) out[d] = all[d] })
  return out
}

/* ---------- monthly payroll ---------- */

/**
 * @param {object} p
 * @param {string} p.month          'YYYY-MM'
 * @param {object} p.settings       SETTINGS from lib/settings.js
 * @param {number} p.usdCad         CAD per 1 USD for this month
 * @param {Array}  p.staff          [{ id, name, hourly_rate, full_time, active }]
 * @param {Array}  p.shifts         [{ id, staff_id, work_date:'YYYY-MM-DD', hours|null, open:boolean, too_long:boolean }]
 * @param {Array}  p.orders         [{ id, rep_id|null, rep:'name', amount, currency, status }]
 *                                  — the month's orders (by payment date for PAID ones)
 * @param {Array}  [p.legacyHours]  old typed-name entries [{ rep, work_date, hours }]
 */
export function computePayroll(p) {
  const S = p.settings
  const usdCad = Number(p.usdCad) > 0 ? Number(p.usdCad) : S.defaultUsdCad
  const holidays = holidaysForMonth(p.month, S.extraHolidays)

  const byId = {}
  const byName = {}
  ;(p.staff || []).forEach((s) => {
    byId[s.id] = s
    byName[String(s.name).trim().toLowerCase()] = s
  })

  const rows = {}
  const row = (s) => {
    if (!rows[s.id]) {
      rows[s.id] = {
        staffId: s.id,
        name: s.name,
        fullTime: !!s.full_time,
        hourlyRate: Number(s.hourly_rate) || 0,
        hours: 0,
        days: {},              // 'YYYY-MM-DD' → hours that day
        openShifts: 0,         // shifts still missing a clock-out
        ordersCredited: 0,
        paidOrders: 0,
        paidAmountCad: 0,
        commission: 0,
        hoursPay: 0,
        daysWorked: 0,
        holidayDaysWorked: [],
        holidayBonus: 0,
        attendanceAward: 0,
        internetSubsidy: 0,
        totalPay: 0,
      }
    }
    return rows[s.id]
  }

  // Everyone active appears on the payroll, even with nothing this month.
  ;(p.staff || []).forEach((s) => { if (s.active !== false) row(s) })

  // Attendance from clock in / clock out.
  ;(p.shifts || []).forEach((sh) => {
    const s = byId[sh.staff_id]
    if (!s) return
    const r = row(s)
    if (sh.open || sh.too_long || sh.hours === null || sh.hours === undefined) {
      r.openShifts += 1
      return
    }
    const h = Math.max(0, Number(sh.hours) || 0)
    r.hours += h
    r.days[sh.work_date] = (r.days[sh.work_date] || 0) + h
  })

  // Old entries typed by name before 2026-11-01 (matched to staff by name).
  ;(p.legacyHours || []).forEach((lh) => {
    const s = byName[String(lh.rep || '').trim().toLowerCase()]
    if (!s) return
    const r = row(s)
    const h = Math.max(0, Number(lh.hours) || 0)
    r.hours += h
    r.days[lh.work_date] = (r.days[lh.work_date] || 0) + h
  })

  // Orders credited to a staff member.
  let paidTotalCad = 0
  ;(p.orders || []).forEach((o) => {
    const amtCad = Number(o.amount) * (o.currency === 'USD' ? usdCad : 1)
    if (o.status === 'PAID') paidTotalCad += amtCad
    const s = (o.rep_id && byId[o.rep_id]) || byName[String(o.rep || '').trim().toLowerCase()]
    if (!s) return
    const r = row(s)
    r.ordersCredited += 1
    if (o.status === 'PAID') {
      r.paidOrders += 1
      r.paidAmountCad += amtCad
    }
  })

  const totals = { hoursPay: 0, commission: 0, holidayBonus: 0, attendanceAward: 0,
                   internetSubsidy: 0, totalPay: 0, hours: 0 }

  const out = Object.values(rows).map((r) => {
    const workedDays = Object.keys(r.days).filter((d) => r.days[d] >= S.minHoursForDay).sort()
    r.daysWorked = workedDays.length
    r.holidayDaysWorked = workedDays.filter((d) => holidays[d])
    r.hours = round2(r.hours)
    r.hoursPay = round2(r.hours * r.hourlyRate)
    r.paidAmountCad = round2(r.paidAmountCad)
    r.commission = round2(r.paidAmountCad * S.commissionRate)
    r.holidayBonus = r.fullTime ? round2(r.holidayDaysWorked.length * S.holidayBonusPerDay) : 0
    r.attendanceAward = r.fullTime && r.daysWorked >= S.attendanceRequiredDays ? round2(S.attendanceAwardPerMonth) : 0
    r.internetSubsidy = r.daysWorked > 0 ? round2(S.internetSubsidyPerMonth) : 0
    r.totalPay = round2(r.hoursPay + r.commission + r.holidayBonus + r.attendanceAward + r.internetSubsidy)
    r.workedDays = workedDays
    delete r.days
    totals.hours += r.hours
    totals.hoursPay += r.hoursPay
    totals.commission += r.commission
    totals.holidayBonus += r.holidayBonus
    totals.attendanceAward += r.attendanceAward
    totals.internetSubsidy += r.internetSubsidy
    totals.totalPay += r.totalPay
    return r
  }).sort((a, b) => a.name.localeCompare(b.name))

  Object.keys(totals).forEach((k) => { totals[k] = round2(totals[k]) })

  return {
    month: p.month,
    usdCad,
    holidays,
    staff: out,
    totals,
    paidOrdersCad: round2(paidTotalCad),
    net: round2(paidTotalCad - totals.totalPay),
  }
}
