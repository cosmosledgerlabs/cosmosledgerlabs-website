/* lib/settings.js
   ONE place to edit the pay RULES that apply to every staff member.

   2026-11-01: the staff list itself (names, PINs, hourly rates, full-time
   or part-time) is no longer in this file — it is managed on the admin
   page (/admin → STAFF) and stored in the database.

   Amounts marked EXAMPLE are placeholders — set your real numbers.
   All money is in CAD. USD orders are converted to CAD with the monthly
   rate entered on the admin page. */

export const SETTINGS = {
  commissionRate: 0.01,         // 1% of each PAID order credited to a staff member
  holidayBonusPerDay: 5,        // per Ontario statutory holiday worked, full-time staff only
  attendanceAwardPerMonth: 50,  // EXAMPLE — attendance award, full-time staff only
  attendanceRequiredDays: 22,   // EXAMPLE — days worked in the month needed for the award
  internetSubsidyPerMonth: 20,  // EXAMPLE — paid to every staff member who worked that month
  minHoursForDay: 1,            // a day counts as "worked" from this many hours
  maxShiftHours: 16,            // a shift open longer than this is flagged "forgot to clock out"
  defaultUsdCad: 1.37,          // EXAMPLE — used only if no rate is entered for the month
  extraHolidays: [],            // extra paid holidays, e.g. ['2026-08-03'] (Civic Holiday)
}
