/* lib/settings.js
   ONE place to edit pay settings and the customer-service team.
   Amounts marked EXAMPLE are placeholders — set your real numbers. */

export const REPS = ['Amy', 'Andy'] // add people here, e.g. ['Amy', 'Andy', 'Ben']

export const SETTINGS = {
  commissionRate: 0.01,      // 1% of each PAID order to the assigned rep
  holidayBonusPerDay: 5,     // paid per holiday day worked, full-time reps only
  attendanceAwardPerMonth: 50, // EXAMPLE — perfect attendance award, full-time only
  attendanceRequiredDays: 22,  // EXAMPLE — worked days needed for the award
  internetSubsidyPerMonth: 20, // EXAMPLE — paid to any rep who worked that month
}

/* Per-rep hourly rate and full-time status.
   Every name in REPS should have an entry here. Rates are EXAMPLES. */
export const REP_INFO = {
  Amy: { hourlyRate: 20, fullTime: true },
  Andy: { hourlyRate: 20, fullTime: true },
}
