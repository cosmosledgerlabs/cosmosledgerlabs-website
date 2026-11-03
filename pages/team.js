/* pages/team.js
   Internal page for customer-service staff. Not linked from the public
   nav/footer; not indexed.

   2026-11-01 — rebuilt:
   • Each person logs in with their own name + PIN (set on /admin), so the
     website always knows exactly who is working — no typing names.
   • CLOCK IN / CLOCK OUT records the exact times (from the server clock);
     hours are added up automatically.
   • MY PAY shows only their own hours, credited orders and estimated pay
     for the month, using the same calculation as the admin payroll.

   2026-11-02 — rest time:
   • START BREAK / END BREAK during a shift (breaks are paid; the 30-minute
     break is due after no more than 5 hours of work in a row).
   • A reminder appears 30 minutes before the break is due, and a warning
     when it is overdue or when a break runs over 30 minutes. */

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/Pay.module.css'

const TOKEN_KEY = 'cll_staff_token'

function torontoMonth() {
  try {
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit' }).formatToParts(new Date())
    return p.find((x) => x.type === 'year').value + '-' + p.find((x) => x.type === 'month').value
  } catch (e) {
    const d = new Date()
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
  }
}

const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtH = (h) => (h === null || h === undefined ? '—' : Number(h).toFixed(2) + ' h')

// "2026-11-01 09:02" (Toronto) → elapsed "3 h 14 min"
function elapsedSince(since, now) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(now))
    const g = (t) => parts.find((x) => x.type === t).value
    const nowLocal = Date.UTC(+g('year'), +g('month') - 1, +g('day'), +g('hour'), +g('minute'))
    const [d, t] = since.split(' ')
    const [Y, M, D] = d.split('-').map(Number)
    const [h, m] = t.split(':').map(Number)
    const mins = Math.max(0, Math.round((nowLocal - Date.UTC(Y, M - 1, D, h, m)) / 60000))
    return Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min'
  } catch (e) {
    return ''
  }
}

export default function Team() {
  const [staffList, setStaffList] = useState([])
  const [staffId, setStaffId] = useState('')
  const [pin, setPin] = useState('')
  const [token, setToken] = useState('')
  const [name, setName] = useState('')
  const [open, setOpen] = useState(null)
  const [shifts, setShifts] = useState([])
  const [month, setMonth] = useState(torontoMonth())
  const [pay, setPay] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [rest, setRest] = useState(null)       // break status from the server
  const [skew, setSkew] = useState(0)          // server clock − this device's clock

  // Staff names for the login list; restore a login from this browser tab.
  useEffect(() => {
    fetch('/api/staff?public=1', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { staff: [] }))
      .then((j) => setStaffList(Array.isArray(j.staff) ? j.staff : []))
      .catch(() => {})
    try {
      const t = window.sessionStorage.getItem(TOKEN_KEY)
      if (t) setToken(t)
    } catch (e) { /* ignore */ }
  }, [])

  // Live timer while clocked in.
  useEffect(() => {
    if (!open) return undefined
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [open])

  const logout = useCallback((why) => {
    try { window.sessionStorage.removeItem(TOKEN_KEY) } catch (e) { /* ignore */ }
    setToken(''); setName(''); setOpen(null); setShifts([]); setPay(null); setPin(''); setRest(null)
    setMsg(why || '')
  }, [])

  const authed = useCallback(async (url, opts) => {
    const r = await fetch(url, {
      ...(opts || {}),
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'x-staff-token': token },
    })
    if (r.status === 401) { logout('Your login has ended — please log in again.'); return null }
    return r
  }, [token, logout])

  const load = useCallback(async () => {
    if (!token) return
    setBusy(true)
    try {
      const [ra, rp] = await Promise.all([
        authed('/api/attendance?month=' + month),
        authed('/api/my-pay?month=' + month),
      ])
      if (!ra || !rp) return
      if (ra.ok) {
        const j = await ra.json()
        setName(j.name); setOpen(j.open); setShifts(j.shifts || [])
        setRest(j.rest || null)
        if (j.rest && j.rest.nowMs) setSkew(j.rest.nowMs - Date.now())
      }
      if (rp.ok) setPay(await rp.json())
      if (!ra.ok || !rp.ok) setMsg('Could not load everything — try again.')
    } catch (e) {
      setMsg('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }, [token, month, authed])

  useEffect(() => { load() }, [load])

  const login = async () => {
    setMsg('')
    if (!staffId || !/^\d{4,8}$/.test(pin)) { setMsg('Choose your name and enter your 4–8 digit PIN.'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: Number(staffId), pin }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg(j.error || 'Login failed.'); return }
      try { window.sessionStorage.setItem(TOKEN_KEY, j.token) } catch (e) { /* ignore */ }
      setPin(''); setName(j.name); setToken(j.token)
    } catch (e) {
      setMsg('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  const clock = async (action) => {
    setMsg(''); setBusy(true)
    try {
      const r = await authed('/api/attendance', { method: 'POST', body: JSON.stringify({ action }) })
      if (!r) return
      const j = await r.json().catch(() => ({}))
      if (!r.ok) setMsg(j.error || 'Not saved — try again.')
      else setMsg({ in: 'CLOCKED IN ✓', out: 'CLOCKED OUT ✓', 'break-start': 'BREAK STARTED ☕ — enjoy your break', 'break-end': 'BREAK ENDED ✓ — welcome back' }[action] || 'Saved ✓')
      await load()
    } catch (e) {
      setMsg('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  const p = pay && pay.pay
  const missing = shifts.filter((s) => s.open && !(open && s.id === open.id))

  /* ---------- rest time ---------- */
  const R = rest && rest.rules
  const nowServer = now + skew
  const onBreak = open && rest && rest.onBreak
  const breakMin = onBreak ? Math.max(0, Math.floor((nowServer - rest.onBreak.startMs) / 60000)) : 0
  const workedMin = open && rest && !onBreak && rest.stretchStartMs ? Math.max(0, Math.floor((nowServer - rest.stretchStartMs) / 60000)) : 0
  const dueMin = R ? R.eatingBreakAfterHours * 60 : 300
  const remindMin = R ? dueMin - R.breakReminderMinutes : 270
  const breakLong = onBreak && R && breakMin > R.breakMinutes
  const breakDue = open && !onBreak && R && workedMin >= remindMin
  const breakOverdue = open && !onBreak && R && workedMin >= dueMin
  const hm = (m) => Math.floor(m / 60) + ' h ' + (m % 60) + ' min'

  // The reminder also shows in the browser tab title.
  const pageTitle = breakOverdue ? '⏰ Break overdue — Team' : breakDue ? '⏰ Break due soon — Team'
    : breakLong ? '⏰ End your break — Team' : 'Team — COSMOS Ledger Labs'

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Nav />
      <main className={styles.page}>
        <div className={styles.main}>
          <h1 className={styles.title}>TEAM — ATTENDANCE & PAY</h1>

          {!token ? (
            <section className={styles.section}>
              <label className={styles.label}>Your name</label>
              <select className={styles.input} value={staffId} onChange={(e) => setStaffId(e.target.value)}>
                <option value="">Choose your name…</option>
                {staffList.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
              </select>
              <label className={styles.label} style={{ marginTop: 14 }}>Your PIN</label>
              <input className={styles.input} type="password" inputMode="numeric" autoComplete="current-password"
                     maxLength={8} value={pin} placeholder="••••"
                     onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                     onKeyDown={(e) => { if (e.key === 'Enter') login() }} />
              <div style={{ marginTop: 16 }}>
                <button type="button" className={styles.btnBig} disabled={busy} onClick={login}>
                  {busy ? 'CHECKING…' : 'LOG IN →'}
                </button>
              </div>
              {msg ? <div className={styles.hint}>{msg}</div> : null}
              {staffList.length === 0 ? (
                <div className={styles.hint}>No staff accounts yet — the admin adds them on the admin page.</div>
              ) : null}
            </section>
          ) : (
            <>
              {/* ---------- clock in / out ---------- */}
              <section className={styles.section}>
                <div className={styles.orderCard}>
                  <div className={styles.orderHead}>{name ? name.toUpperCase() : '…'}</div>
                  <div className={styles.orderRow}>
                    <span className={styles.orderKey}>Status</span>
                    <span className={styles.orderId}>{onBreak ? 'ON BREAK ☕' : open ? 'CLOCKED IN' : 'NOT CLOCKED IN'}</span>
                  </div>
                  {open ? (
                    <>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Since</span><span>{open.since}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Shift so far</span><span>{elapsedSince(open.since, now)}</span></div>
                      {onBreak ? (
                        <div className={styles.orderRow}>
                          <span className={styles.orderKey}>Break since {rest.onBreak.since}</span>
                          <span style={{ color: breakLong ? '#ffb347' : '#3dffa8' }}>{breakMin} min of {R.breakMinutes}</span>
                        </div>
                      ) : rest && rest.stretchStartMs ? (
                        <div className={styles.orderRow}>
                          <span className={styles.orderKey}>Working without a {R ? R.breakMinutes : 30}-min break</span>
                          <span style={{ color: breakDue ? '#ffb347' : undefined }}>{hm(workedMin)}</span>
                        </div>
                      ) : null}
                      {rest && rest.breaks && rest.breaks.length ? (
                        <div className={styles.orderRow}>
                          <span className={styles.orderKey}>Breaks this shift</span>
                          <span>{rest.breaks.map((b) => b.start + '–' + (b.end || 'now') + ' (' + b.minutes + ' min)').join(', ')}</span>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>

                {breakOverdue ? (
                  <div className={styles.detailCard} style={{ marginTop: 14, borderColor: '#ff6b6b' }}>
                    <p className={styles.itemStrong} style={{ color: '#ff6b6b', margin: 0 }}>
                      ⏰ Your {R.breakMinutes}-minute break is overdue — you have worked {hm(workedMin)} without it. Please press START BREAK now.
                    </p>
                  </div>
                ) : breakDue ? (
                  <div className={styles.detailCard} style={{ marginTop: 14, borderColor: '#ffb347' }}>
                    <p className={styles.itemStrong} style={{ color: '#ffb347', margin: 0 }}>
                      ⏰ You have worked {hm(workedMin)} without a break. Please take your {R.breakMinutes}-minute break within {Math.max(0, dueMin - workedMin)} min.
                    </p>
                  </div>
                ) : null}
                {breakLong ? (
                  <div className={styles.detailCard} style={{ marginTop: 14, borderColor: '#ffb347' }}>
                    <p className={styles.itemStrong} style={{ color: '#ffb347', margin: 0 }}>
                      Your break is over {R.breakMinutes} minutes ({breakMin} min). Please press END BREAK when you are back.
                    </p>
                  </div>
                ) : null}

                <div className={styles.row} style={{ marginTop: 16 }}>
                  {open ? (
                    <>
                      {onBreak ? (
                        <button type="button" className={styles.btnBig} disabled={busy} onClick={() => clock('break-end')}>
                          {busy ? 'SAVING…' : 'END BREAK ▶'}
                        </button>
                      ) : (
                        <button type="button" className={styles.btnBig} disabled={busy} onClick={() => clock('break-start')}>
                          {busy ? 'SAVING…' : 'START BREAK ☕'}
                        </button>
                      )}
                      <button type="button" className={styles.btnGhost} disabled={busy}
                              onClick={() => { if (!onBreak || confirm('You are on a break. Clock out now? (The break ends too.)')) clock('out') }}>
                        CLOCK OUT ■
                      </button>
                    </>
                  ) : (
                    <button type="button" className={styles.btnBig} disabled={busy} onClick={() => clock('in')}>
                      {busy ? 'SAVING…' : 'CLOCK IN ▶'}
                    </button>
                  )}
                </div>
                {open && R ? (
                  <div className={styles.hint}>
                    Breaks are {R.breaksPaid ? 'paid' : 'unpaid'}. Take your {R.breakMinutes}-minute break before you have worked {R.eatingBreakAfterHours} hours in a row — press START BREAK when you go and END BREAK when you are back.
                  </div>
                ) : null}
                {msg ? <div className={styles.hint}>{msg}</div> : null}
                {missing.length ? (
                  <div className={styles.hint} style={{ color: '#ffb347' }}>
                    {missing.length} earlier shift{missing.length > 1 ? 's have' : ' has'} no clock-out and count{missing.length > 1 ? '' : 's'} 0 hours until the admin fixes {missing.length > 1 ? 'them' : 'it'}. Tell the admin your real finishing time.
                  </div>
                ) : null}
              </section>

              {/* ---------- my pay ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>MY PAY</div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Month</label>
                    <input className={styles.input} type="month" value={month}
                           onChange={(e) => e.target.value && setMonth(e.target.value)} />
                  </div>
                </div>

                {p ? (
                  <div className={styles.orderCard} style={{ marginTop: 14 }}>
                    <div className={styles.orderHead}>{pay.month} — ESTIMATED PAY (CAD)</div>
                    <div className={styles.orderRow}><span className={styles.orderKey}>Hours worked</span>
                      <span>{p.hours.toFixed(2)} h × {fmt(p.hourlyRate)} = {fmt(p.hoursPay)}</span></div>
                    <div className={styles.orderRow}><span className={styles.orderKey}>Days worked</span><span>{p.daysWorked}</span></div>
                    <div className={styles.orderRow}><span className={styles.orderKey}>Orders credited to you</span>
                      <span>{p.ordersCredited} ({p.paidOrders} paid)</span></div>
                    <div className={styles.orderRow}><span className={styles.orderKey}>Commission</span>
                      <span>{(pay.rules.commissionRate * 100).toFixed(1)}% × {fmt(p.paidAmountCad)} = {fmt(p.commission)}</span></div>
                    <div className={styles.orderRow}><span className={styles.orderKey}>Holiday bonus</span>
                      <span>{p.fullTime
                        ? p.holidayDaysWorked.length + ' × ' + fmt(pay.rules.holidayBonusPerDay) + ' = ' + fmt(p.holidayBonus)
                        : 'full-time only'}</span></div>
                    <div className={styles.orderRow}><span className={styles.orderKey}>Attendance award</span>
                      <span>{p.fullTime
                        ? (p.attendanceAward ? fmt(p.attendanceAward) : p.daysWorked + ' / ' + pay.rules.attendanceRequiredDays + ' days')
                        : 'full-time only'}</span></div>
                    <div className={styles.orderRow}><span className={styles.orderKey}>Internet subsidy</span><span>{fmt(p.internetSubsidy)}</span></div>
                    {p.complaints && p.complaints.length ? (
                      <div className={styles.orderRow}>
                        <span className={styles.orderKey}>Complaint deductions ({p.complaints.length})</span>
                        <span style={{ color: '#ffb347' }}>−{fmt(p.finesDeducted)}</span>
                      </div>
                    ) : null}
                    <div className={styles.orderRow}><span className={styles.orderKey}>TOTAL</span>
                      <span className={styles.orderId}>{fmt(p.totalPay)}</span></div>
                    {p.complaints && p.complaints.length ? p.complaints.map((c) => (
                      <div key={c.id} className={styles.orderRow}>
                        <span className={styles.orderKey}>⚠ Complaint {c.decided}{c.orderId ? ' · ' + c.orderId : ''} · {c.kind}</span>
                        <span>{c.fine ? '−' + fmt(c.fine) : 'no fine'}</span>
                      </div>
                    )) : null}
                  </div>
                ) : (
                  <div className={styles.hint}>{busy ? 'Loading…' : 'Nothing recorded for this month yet.'}</div>
                )}
                {pay ? (
                  <div className={styles.hint}>
                    Estimate only — final pay is confirmed by the admin. USD orders are converted at {pay.usdCad} CAD per USD
                    {pay.usdCadEntered ? '' : ' (provisional rate)'}. A day counts as worked from {pay.rules.minHoursForDay} h.
                    {Object.keys(pay.holidays || {}).length
                      ? ' Statutory holidays this month: ' + Object.entries(pay.holidays).map(([d, n]) => n + ' (' + d + ')').join(', ') + '.'
                      : ''}
                  </div>
                ) : null}
              </section>

              {/* ---------- my shifts ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>MY SHIFTS — {month}</div>
                {shifts.map((s) => (
                  <div key={s.id} className={styles.detailCard} style={{ marginBottom: 8 }}>
                    <p className={styles.itemStrong}>
                      {s.clockIn.replace('T', ' ')} → {s.clockOut ? s.clockOut.replace('T', ' ').slice(11) : (open && s.id === open.id ? 'now' : 'no clock-out')}
                      {'  ·  '}{fmtH(s.hours)}
                    </p>
                    {s.breaks && s.breaks.length ? (
                      <p className={styles.item}>Breaks: {s.breaks.map((b) => b.start + '–' + (b.end || 'now') + ' (' + b.minutes + ' min)').join(', ')}</p>
                    ) : null}
                    {s.edited || s.tooLong || (s.open && !(open && s.id === open.id)) || s.note ? (
                      <p className={styles.item}>
                        {s.edited ? 'Corrected by admin. ' : ''}
                        {s.tooLong ? 'Over the maximum shift length — counts 0 h until checked. ' : ''}
                        {s.open && !(open && s.id === open.id) ? 'Missing clock-out — counts 0 h until fixed. ' : ''}
                        {s.note}
                      </p>
                    ) : null}
                  </div>
                ))}
                {shifts.length === 0 ? <div className={styles.hint}>No shifts this month.</div> : null}
                <div style={{ marginTop: 16 }}>
                  <button type="button" className={styles.btnGhost} onClick={() => logout('Logged out.')}>LOG OUT</button>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
