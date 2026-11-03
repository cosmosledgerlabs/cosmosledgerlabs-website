/* pages/admin.js
   Owner-only page: order ledger (mark PAID / delete), the automatic
   monthly payroll, and (2026-09-24) the automatic Interac e-Transfer
   matching panel. Requires the ADMIN passcode. Not publicly linked.

   2026-11-01 — staff payroll system:
   • STAFF: add people (name, PIN, hourly rate, full-time), edit, reset PIN,
     unlock, deactivate.
   • PAYROLL: calculated automatically from clock in/out, credited PAID
     orders, Ontario statutory holidays and the month's USD→CAD rate;
     download as a spreadsheet (CSV).
   • ATTENDANCE: every shift of the month; fix a forgotten clock-out, add a
     missed shift, or delete a wrong one.
   • MANAGERS (2026-11-02): personal logins for the management backend
     /manage (orders, complaints, vouchers, staff figures, activity log).
   • DAILY CHECK: for any day, totals every order and payment (overall, per
     customer service person, per payment channel) and checks that they
     agree — with the money received and with the bank / wallet figures
     the owner types in. Problems are shown with ⚠. */

import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import DailyCheckPanel from '../components/DailyCheckPanel'
import styles from '../styles/Pay.module.css'

function thisMonth() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const WARN = '#ffb347'

export default function Admin() {
  const [code, setCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [month, setMonth] = useState(thisMonth())
  const [orders, setOrders] = useState([])
  const [hoursList, setHoursList] = useState([])
  const [settle, setSettle] = useState(null)
  const [staff, setStaff] = useState([])
  const [shifts, setShifts] = useState([])
  const [fxInput, setFxInput] = useState('')
  const [newStaff, setNewStaff] = useState({ name: '', pin: '', rate: '', fullTime: true })
  const [edit, setEdit] = useState({})          // staff id → { rate, pin }
  const [shiftEdit, setShiftEdit] = useState({}) // shift id → { clockIn, clockOut, note }
  const [newShift, setNewShift] = useState({ staffId: '', clockIn: '', clockOut: '', note: '' })
  const [staffMsg, setStaffMsg] = useState('')
  const [shiftMsg, setShiftMsg] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [emt, setEmt] = useState(null)
  const [managers, setManagers] = useState([])
  const [newMgr, setNewMgr] = useState({ username: '', name: '', password: '' })
  const [mgrPass, setMgrPass] = useState({})     // manager id → new password typed
  const [mgrMsg, setMgrMsg] = useState('')
  const [version, setVersion] = useState(0)        // bumps after each reload → Daily Check refreshes
  const [recvInput, setRecvInput] = useState({})   // order id → amount received

  const H = { 'Content-Type': 'application/json', 'x-passcode': code }

  const loadAll = async () => {
    setMsg(''); setBusy(true)
    try {
      const [ro, rs, rh, rst, rsh, rfx, rmg] = await Promise.all([
        fetch('/api/orders', { headers: H }),
        fetch('/api/settle?month=' + month, { headers: H }),
        fetch('/api/hours?month=' + month, { headers: H }),
        fetch('/api/staff', { headers: H }),
        fetch('/api/attendance?month=' + month, { headers: H }),
        fetch('/api/fx?month=' + month, { headers: H }),
        fetch('/api/managers', { headers: H }),
      ])
      const all = [ro, rs, rh, rst, rsh, rfx, rmg]
      if (all.some((r) => r.status === 401)) { setUnlocked(false); setMsg('Wrong passcode.'); return }
      if (all.some((r) => !r.ok)) { setMsg('Load failed — try again.'); return }
      setOrders((await ro.json()).orders || [])
      setSettle(await rs.json())
      setHoursList((await rh.json()).hours || [])
      setStaff((await rst.json()).staff || [])
      setShifts((await rsh.json()).shifts || [])
      const fx = await rfx.json()
      setFxInput(fx.usdCad ? String(fx.usdCad) : '')
      setManagers((await rmg.json()).managers || [])
      setVersion((v) => v + 1)
      setUnlocked(true)
    } catch (e) {
      setMsg('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  /* received = the amount that actually arrived (blank = exactly the order amount) */
  const setStatus = async (id, status) => {
    setBusy(true)
    try {
      const received = status === 'PAID' ? (recvInput[id] || '') : ''
      const r = await fetch('/api/orders', { method: 'PATCH', headers: H, body: JSON.stringify({ id, status, received }) })
      if (r.ok) {
        setRecvInput({ ...recvInput, [id]: '' })
        await loadAll()
      } else {
        const j = await r.json().catch(() => ({}))
        setMsg(j.error || 'Not saved — try again.')
      }
    } finally { setBusy(false) }
  }

  const removeOrder = async (id) => {
    if (!confirm('Delete order ' + id + '? This cannot be undone.')) return
    setBusy(true)
    try {
      const r = await fetch('/api/orders', { method: 'DELETE', headers: H, body: JSON.stringify({ id }) })
      if (r.ok) await loadAll()
    } finally { setBusy(false) }
  }

  /* Reads the Interac notification emails now and marks matching e-Transfer
     orders PAID (the scheduler also runs this every 10 minutes). */
  const checkEmt = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/emt-sync', { headers: H })
      const j = await r.json().catch(() => ({}))
      setEmt(r.ok ? j : { error: j.error || 'Check failed.' })
      if (r.ok) await loadAll()
    } catch (e) {
      setEmt({ error: 'Network error — try again.' })
    } finally { setBusy(false) }
  }

  /* ---------- staff ---------- */
  const callApi = async (url, method, body, setNote) => {
    setBusy(true)
    try {
      const r = await fetch(url, { method, headers: H, body: JSON.stringify(body) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setNote(j.error || 'Not saved — check and try again.'); return false }
      setNote('Saved ✓')
      await loadAll()
      return true
    } catch (e) {
      setNote('Network error — try again.')
      return false
    } finally { setBusy(false) }
  }

  const addStaff = async () => {
    const ok = await callApi('/api/staff', 'POST', {
      name: newStaff.name, pin: newStaff.pin, hourlyRate: Number(newStaff.rate), fullTime: newStaff.fullTime,
    }, setStaffMsg)
    if (ok) setNewStaff({ name: '', pin: '', rate: '', fullTime: true })
  }
  const patchStaff = (body) => callApi('/api/staff', 'PATCH', body, setStaffMsg)
  const setEditField = (id, k, v) => setEdit({ ...edit, [id]: { ...(edit[id] || {}), [k]: v } })

  const saveFx = () => callApi('/api/fx', 'PUT', { month, usdCad: Number(fxInput) }, setMsg)

  /* Payroll spreadsheet — fetched with the passcode, then saved as a file. */
  const downloadCsv = async () => {
    try {
      const r = await fetch('/api/settle?format=csv&month=' + month, { headers: H })
      if (!r.ok) { setMsg('Download failed.'); return }
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'cosmos-payroll-' + month + '.csv'
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e) { setMsg('Download failed.') }
  }

  /* ---------- managers (2026-11-02) ---------- */
  const addManager = async () => {
    const ok = await callApi('/api/managers', 'POST', newMgr, setMgrMsg)
    if (ok) setNewMgr({ username: '', name: '', password: '' })
  }
  const patchManager = (body) => callApi('/api/managers', 'PATCH', body, setMgrMsg)

  /* ---------- attendance ---------- */
  const setShiftField = (s, k, v) => setShiftEdit({
    ...shiftEdit,
    [s.id]: { clockIn: s.clockIn || '', clockOut: s.clockOut || '', note: s.note || '', ...(shiftEdit[s.id] || {}), [k]: v },
  })
  const saveShift = (s) => {
    const e = { clockIn: s.clockIn || '', clockOut: s.clockOut || '', note: s.note || '', ...(shiftEdit[s.id] || {}) }
    return callApi('/api/attendance', 'PATCH', { id: s.id, clockIn: e.clockIn, clockOut: e.clockOut || null, note: e.note }, setShiftMsg)
  }
  const removeShift = (s) => {
    if (!confirm('Delete this shift (' + s.name + ', ' + s.clockIn.replace('T', ' ') + ')? This cannot be undone.')) return
    return callApi('/api/attendance', 'DELETE', { id: s.id }, setShiftMsg)
  }
  const addShift = async () => {
    const ok = await callApi('/api/attendance', 'POST', {
      staffId: Number(newShift.staffId), clockIn: newShift.clockIn, clockOut: newShift.clockOut || null, note: newShift.note,
    }, setShiftMsg)
    if (ok) setNewShift({ staffId: '', clockIn: '', clockOut: '', note: '' })
  }

  const removeHours = async (id) => {
    if (!confirm('Delete this hours entry? This cannot be undone.')) return
    setBusy(true)
    try {
      const r = await fetch('/api/hours', { method: 'DELETE', headers: H, body: JSON.stringify({ id }) })
      if (r.ok) await loadAll()
    } finally { setBusy(false) }
  }

  return (
    <>
      <Head>
        <title>Admin — COSMOS Ledger Labs</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Nav />
      <main className={styles.page}>
        <div className={styles.main}>
          <h1 className={styles.title}>ADMIN — DAILY CHECK, PAYROLL, STAFF & ORDERS</h1>

          {!unlocked ? (
            <section className={styles.section}>
              <label className={styles.label}>Admin passcode</label>
              <input className={styles.input} type="password" value={code}
                     onChange={(e) => setCode(e.target.value)} placeholder="passcode" />
              <div style={{ marginTop: 14 }}>
                <button type="button" className={styles.btnBig} disabled={busy} onClick={loadAll}>
                  {busy ? 'LOADING…' : 'ENTER →'}
                </button>
              </div>
              {msg ? <div className={styles.hint}>{msg}</div> : null}
            </section>
          ) : (
            <>
              {/* ---------- daily check (shared with /manage) ---------- */}
              <DailyCheckPanel headers={H} refreshKey={version} />

              {/* ---------- payroll (automatic) ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>MONTHLY PAYROLL — calculated automatically (CAD)</div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Month</label>
                    <input className={styles.input} type="month" value={month}
                           onChange={(e) => setMonth(e.target.value)} />
                  </div>
                  <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
                    <button type="button" className={styles.btnBig} disabled={busy} onClick={loadAll}>
                      {busy ? 'LOADING…' : 'LOAD MONTH →'}
                    </button>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>USD → CAD rate for {month} (used for USD orders)</label>
                    <input className={styles.input} type="number" step="0.0001" min="0.5" max="3" value={fxInput}
                           placeholder={settle ? String(settle.usdCad) : '1.37'}
                           onChange={(e) => setFxInput(e.target.value)} />
                  </div>
                  <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
                    <button type="button" className={styles.btnGhost} disabled={busy || !fxInput} onClick={saveFx}>SAVE RATE</button>
                  </div>
                </div>
                {msg ? <div className={styles.hint}>{msg}</div> : null}

                {settle ? (
                  <>
                    {!settle.usdCadEntered ? (
                      <div className={styles.hint} style={{ color: '#ffb347' }}>
                        No rate saved for {settle.month} — using the default {settle.usdCad}. Save the real rate before paying salaries.
                      </div>
                    ) : null}
                    <div className={styles.orderCard} style={{ marginTop: 14 }}>
                      <div className={styles.orderHead}>{settle.month} TOTALS (CAD)</div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Paid orders received</span><span>{fmt(settle.paidOrdersCad)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Hours pay ({Number(settle.totals.hours).toFixed(2)} h)</span><span>{fmt(settle.totals.hoursPay)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Commission</span><span>{fmt(settle.totals.commission)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Holiday bonus</span><span>{fmt(settle.totals.holidayBonus)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Attendance awards</span><span>{fmt(settle.totals.attendanceAward)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Internet subsidy</span><span>{fmt(settle.totals.internetSubsidy)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Complaint fines deducted</span><span>−{fmt(settle.totals.fines)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>TOTAL PAYOUT</span>
                        <span className={styles.orderId}>{fmt(settle.totals.totalPay)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>COSMOS net (paid − payout)</span><span>{fmt(settle.net)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Statutory holidays</span>
                        <span>{Object.keys(settle.holidays || {}).length
                          ? Object.entries(settle.holidays).map(([d, n]) => n + ' ' + d.slice(5)).join(', ')
                          : 'none this month'}</span></div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button type="button" className={styles.btnGhost} onClick={downloadCsv}>DOWNLOAD PAYROLL (CSV) ↓</button>
                    </div>

                    {settle.staff.map((p) => (
                      <div key={p.staffId} className={styles.detailCard} style={{ marginTop: 12 }}>
                        <p className={styles.itemStrong}>{p.name}{p.fullTime ? ' (full-time)' : ' (part-time)'} — TOTAL PAY: {fmt(p.totalPay)}</p>
                        <p className={styles.item}>Hours: {Number(p.hours).toFixed(2)} h × {fmt(p.hourlyRate)} = {fmt(p.hoursPay)} · {p.daysWorked} days worked</p>
                        <p className={styles.item}>Orders: {p.ordersCredited} credited, {p.paidOrders} paid ({fmt(p.paidAmountCad)}) → commission {fmt(p.commission)}</p>
                        <p className={styles.item}>Holiday days worked: {p.holidayDaysWorked.length ? p.holidayDaysWorked.join(', ') : 'none'} → bonus {fmt(p.holidayBonus)}</p>
                        <p className={styles.item}>Attendance award: {fmt(p.attendanceAward)} · Internet subsidy: {fmt(p.internetSubsidy)}</p>
                        {p.complaints && p.complaints.length ? (
                          <p className={styles.item} style={{ color: '#ffb347' }}>
                            Valid complaints: {p.complaints.length} · fines {fmt(p.fines)} → deducted {fmt(p.finesDeducted)} (gross {fmt(p.grossPay)})
                          </p>
                        ) : null}
                        {p.openShifts ? (
                          <p className={styles.item} style={{ color: '#ffb347' }}>
                            ⚠ {p.openShifts} shift{p.openShifts > 1 ? 's' : ''} without a valid clock-out (counted as 0 h) — fix below in ATTENDANCE.
                          </p>
                        ) : null}
                      </div>
                    ))}
                    {settle.staff.length === 0 ? <div className={styles.hint}>No staff yet — add people in STAFF below.</div> : null}
                  </>
                ) : null}
              </section>

              {/* ---------- staff ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>STAFF — each person logs in on /team with their own name and PIN</div>
                {staff.map((s) => {
                  const e = edit[s.id] || {}
                  return (
                    <div key={s.id} className={styles.detailCard} style={{ marginBottom: 10, opacity: s.active ? 1 : 0.55 }}>
                      <p className={styles.itemStrong}>
                        {s.name} — {fmt(s.hourly_rate)}/h — {s.full_time ? 'full-time' : 'part-time'}
                        {s.active ? '' : ' — INACTIVE'}{s.locked ? ' — LOCKED (wrong PINs)' : ''}
                      </p>
                      <div className={styles.row}>
                        <input className={styles.input} type="number" step="0.01" min="0" placeholder="New hourly rate"
                               value={e.rate || ''} onChange={(ev) => setEditField(s.id, 'rate', ev.target.value)} />
                        <button type="button" className={styles.btnGhost} disabled={busy || !e.rate}
                                onClick={() => patchStaff({ id: s.id, hourlyRate: Number(e.rate) }).then((ok) => ok && setEditField(s.id, 'rate', ''))}>SAVE RATE</button>
                      </div>
                      <div className={styles.row}>
                        <input className={styles.input} type="password" inputMode="numeric" maxLength={8} placeholder="New PIN (4–8 digits)"
                               value={e.pin || ''} onChange={(ev) => setEditField(s.id, 'pin', ev.target.value.replace(/\D/g, ''))} />
                        <button type="button" className={styles.btnGhost} disabled={busy || !e.pin}
                                onClick={() => patchStaff({ id: s.id, pin: e.pin }).then((ok) => ok && setEditField(s.id, 'pin', ''))}>RESET PIN</button>
                      </div>
                      <div className={styles.row}>
                        <button type="button" className={styles.btnGhost} disabled={busy}
                                onClick={() => patchStaff({ id: s.id, fullTime: !s.full_time })}>
                          MAKE {s.full_time ? 'PART-TIME' : 'FULL-TIME'}
                        </button>
                        {s.locked ? (
                          <button type="button" className={styles.btnGhost} disabled={busy}
                                  onClick={() => patchStaff({ id: s.id, unlock: true })}>UNLOCK</button>
                        ) : null}
                        <button type="button" className={styles.btnGhost} disabled={busy}
                                onClick={() => {
                                  if (s.active && !confirm('Deactivate ' + s.name + '? They can no longer log in or be chosen on orders. Past pay records stay.')) return
                                  patchStaff({ id: s.id, active: !s.active })
                                }}>
                          {s.active ? 'DEACTIVATE' : 'REACTIVATE'}
                        </button>
                      </div>
                    </div>
                  )
                })}
                {staff.length === 0 ? <div className={styles.hint}>No staff yet.</div> : null}

                <div className={styles.detailCard} style={{ marginTop: 14 }}>
                  <p className={styles.itemStrong}>ADD A STAFF MEMBER</p>
                  <label className={styles.label}>Name (as customers will see it in the list)</label>
                  <input className={styles.input} maxLength={40} value={newStaff.name} placeholder="e.g. Lily"
                         onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>PIN (4–8 digits — tell them privately)</label>
                      <input className={styles.input} type="password" inputMode="numeric" maxLength={8} value={newStaff.pin}
                             onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value.replace(/\D/g, '') })} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Hourly rate (CAD)</label>
                      <input className={styles.input} type="number" step="0.01" min="0" value={newStaff.rate} placeholder="20"
                             onChange={(e) => setNewStaff({ ...newStaff, rate: e.target.value })} />
                    </div>
                  </div>
                  <label className={styles.label} style={{ marginTop: 10 }}>Employment</label>
                  <div className={styles.segmented}>
                    <button type="button" className={newStaff.fullTime ? styles.segOn : styles.seg}
                            onClick={() => setNewStaff({ ...newStaff, fullTime: true })}>FULL-TIME</button>
                    <button type="button" className={!newStaff.fullTime ? styles.segOn : styles.seg}
                            onClick={() => setNewStaff({ ...newStaff, fullTime: false })}>PART-TIME</button>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <button type="button" className={styles.btnBig} disabled={busy} onClick={addStaff}>ADD STAFF MEMBER →</button>
                  </div>
                </div>
                {staffMsg ? <div className={styles.hint}>{staffMsg}</div> : null}
              </section>

              {/* ---------- managers ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>MANAGERS — personal logins for the management backend at /manage</div>
                {managers.map((m) => (
                  <div key={m.id} className={styles.detailCard} style={{ marginBottom: 10, opacity: m.active ? 1 : 0.55 }}>
                    <p className={styles.itemStrong}>
                      {m.name} — username: {m.username}{m.active ? '' : ' — INACTIVE'}{m.locked ? ' — LOCKED (wrong passwords)' : ''}
                    </p>
                    <div className={styles.row}>
                      <input className={styles.input} type="password" placeholder="New password (8+ characters)" autoComplete="new-password"
                             value={mgrPass[m.id] || ''} onChange={(e) => setMgrPass({ ...mgrPass, [m.id]: e.target.value })} />
                      <button type="button" className={styles.btnGhost} disabled={busy || !mgrPass[m.id]}
                              onClick={() => patchManager({ id: m.id, password: mgrPass[m.id] }).then((ok) => ok && setMgrPass({ ...mgrPass, [m.id]: '' }))}>RESET PASSWORD</button>
                    </div>
                    <div className={styles.row}>
                      {m.locked ? (
                        <button type="button" className={styles.btnGhost} disabled={busy}
                                onClick={() => patchManager({ id: m.id, unlock: true })}>UNLOCK</button>
                      ) : null}
                      <button type="button" className={styles.btnGhost} disabled={busy}
                              onClick={() => {
                                if (m.active && !confirm('Deactivate ' + m.name + '? They can no longer log in to /manage.')) return
                                patchManager({ id: m.id, active: !m.active })
                              }}>
                        {m.active ? 'DEACTIVATE' : 'REACTIVATE'}
                      </button>
                    </div>
                  </div>
                ))}
                {managers.length === 0 ? <div className={styles.hint}>No managers yet.</div> : null}
                <div className={styles.detailCard} style={{ marginTop: 14 }}>
                  <p className={styles.itemStrong}>ADD A MANAGER</p>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Name</label>
                      <input className={styles.input} maxLength={40} value={newMgr.name} placeholder="e.g. Lisa Chen"
                             onChange={(e) => setNewMgr({ ...newMgr, name: e.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Username (for logging in)</label>
                      <input className={styles.input} maxLength={30} value={newMgr.username} placeholder="e.g. lisa" autoCapitalize="none"
                             onChange={(e) => setNewMgr({ ...newMgr, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })} />
                    </div>
                  </div>
                  <label className={styles.label}>Password (8+ characters — tell them privately)</label>
                  <input className={styles.input} type="password" autoComplete="new-password" value={newMgr.password}
                         onChange={(e) => setNewMgr({ ...newMgr, password: e.target.value })} />
                  <div style={{ marginTop: 14 }}>
                    <button type="button" className={styles.btnBig} disabled={busy} onClick={addManager}>ADD MANAGER →</button>
                  </div>
                </div>
                {mgrMsg ? <div className={styles.hint}>{mgrMsg}</div> : null}
                <div className={styles.hint}>Managers log in at cosmosledgerlabs.com/manage. They can see all orders and figures, record and decide complaints, issue vouchers and mark orders paid. They cannot change pay rules, staff PINs or delete orders. Everything they change is in the activity log there.</div>
              </section>

              {/* ---------- attendance ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>ATTENDANCE ({month}) — every clock in / out; times are Toronto time</div>
                {shifts.map((s) => {
                  const e = { clockIn: s.clockIn || '', clockOut: s.clockOut || '', note: s.note || '', ...(shiftEdit[s.id] || {}) }
                  const flag = s.open ? 'NO CLOCK-OUT' : s.tooLong ? 'TOO LONG — check' : ''
                  return (
                    <div key={s.id} className={styles.detailCard} style={{ marginBottom: 10 }}>
                      <p className={styles.itemStrong}>
                        {s.name} — {s.clockIn.replace('T', ' ')} → {s.clockOut ? s.clockOut.replace('T', ' ') : '…'} — {s.hours === null ? '0 h (not counted)' : Number(s.hours).toFixed(2) + ' h'}
                        {flag ? ' — ⚠ ' + flag : ''}{s.edited ? ' — edited' : ''}
                      </p>
                      {s.breaks && s.breaks.length ? (
                        <p className={styles.item}>Breaks: {s.breaks.map((b) => b.start + '–' + (b.end || 'now') + ' (' + b.minutes + ' min)').join(', ')} — correct breaks on /manage → REST</p>
                      ) : null}
                      <div className={styles.row}>
                        <input className={styles.input} type="datetime-local" value={e.clockIn}
                               onChange={(ev) => setShiftField(s, 'clockIn', ev.target.value)} aria-label="Clock in" />
                        <input className={styles.input} type="datetime-local" value={e.clockOut}
                               onChange={(ev) => setShiftField(s, 'clockOut', ev.target.value)} aria-label="Clock out" />
                      </div>
                      <div className={styles.row}>
                        <input className={styles.input} maxLength={200} placeholder="Note (reason for change)" value={e.note}
                               onChange={(ev) => setShiftField(s, 'note', ev.target.value)} />
                        <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => saveShift(s)}>SAVE</button>
                        <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => removeShift(s)}>DELETE</button>
                      </div>
                    </div>
                  )
                })}
                {shifts.length === 0 ? <div className={styles.hint}>No shifts recorded this month.</div> : null}

                <div className={styles.detailCard} style={{ marginTop: 14 }}>
                  <p className={styles.itemStrong}>ADD A MISSED SHIFT</p>
                  <select className={styles.input} value={newShift.staffId}
                          onChange={(e) => setNewShift({ ...newShift, staffId: e.target.value })}>
                    <option value="">Choose staff member…</option>
                    {staff.filter((s) => s.active).map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                  </select>
                  <div className={styles.row}>
                    <input className={styles.input} type="datetime-local" value={newShift.clockIn} aria-label="Clock in"
                           onChange={(e) => setNewShift({ ...newShift, clockIn: e.target.value })} />
                    <input className={styles.input} type="datetime-local" value={newShift.clockOut} aria-label="Clock out"
                           onChange={(e) => setNewShift({ ...newShift, clockOut: e.target.value })} />
                  </div>
                  <input className={styles.input} maxLength={200} placeholder="Note (e.g. forgot to clock in)" value={newShift.note}
                         onChange={(e) => setNewShift({ ...newShift, note: e.target.value })} />
                  <div style={{ marginTop: 12 }}>
                    <button type="button" className={styles.btnBig} disabled={busy} onClick={addShift}>ADD SHIFT →</button>
                  </div>
                </div>
                {shiftMsg ? <div className={styles.hint}>{shiftMsg}</div> : null}
              </section>

              {/* ---------- e-Transfer auto-match ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>E-TRANSFER AUTO-MATCH — reads Interac emails, marks matching orders PAID</div>
                <button type="button" className={styles.btnBig} disabled={busy} onClick={checkEmt}>
                  {busy ? 'CHECKING…' : 'CHECK E-TRANSFERS NOW →'}
                </button>
                {emt && emt.error ? <div className={styles.hint}>{emt.error}</div> : null}
                {emt && !emt.error ? (
                  <>
                    <div className={styles.hint}>
                      New emails checked: {emt.checked} · Marked PAID: {emt.paid.length ? emt.paid.join(', ') : 'none'} · Need review: {emt.review.length}
                    </div>
                    {(emt.log || []).map((l, i) => (
                      <div key={i} className={styles.detailCard} style={{ marginTop: 8 }}>
                        <p className={styles.itemStrong}>{l.result}</p>
                        <p className={styles.item}>{l.received} · {l.order_id || 'no order #'} · {l.amount !== null ? fmt(l.amount) : 'no amount'} · {l.sender}</p>
                      </div>
                    ))}
                    {(emt.log || []).length === 0 ? <div className={styles.hint}>No Interac emails found in the last 14 days.</div> : null}
                  </>
                ) : null}
              </section>

              {/* ---------- hours entries ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>OLD TYPED HOURS ({month}) — from before the clock-in system; still counted when the name matches a staff member</div>
                {hoursList.map((h) => (
                  <div key={h.id} className={styles.detailCard} style={{ marginBottom: 10 }}>
                    <p className={styles.itemStrong}>{h.work_date} — {h.rep} — {Number(h.hours).toFixed(1)}h{h.holiday ? ' — HOLIDAY' : ''}</p>
                    {h.note ? <p className={styles.item}>{h.note}</p> : null}
                    <div className={styles.row}>
                      <button type="button" className={styles.btnGhost} disabled={busy}
                              onClick={() => removeHours(h.id)}>DELETE</button>
                    </div>
                  </div>
                ))}
                {hoursList.length === 0 ? <div className={styles.hint}>None.</div> : null}
              </section>

              {/* ---------- orders ledger ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>ORDERS (LATEST {orders.length}) — mark PAID when money arrives (type the amount received if it is different); commission counts PAID orders, in the month they are paid</div>
                {orders.map((o) => (
                  <div key={o.id} className={styles.detailCard} style={{ marginBottom: 10 }}>
                    <p className={styles.itemStrong}>{o.id} — {o.currency} {fmt(o.amount)} — {o.status}</p>
                    <p className={styles.item}>{o.created} · {o.method.toUpperCase()} · rep: {o.rep || '—'} · {o.service || 'custom'}</p>
                    {o.voucher_code ? <p className={styles.item}>Voucher {o.voucher_code}: −{o.currency} {fmt(o.voucher_amount)} (amount above is after the voucher)</p> : null}
                    {o.status === 'PAID' && o.paid_via ? <p className={styles.item}>Paid: {o.paid_via}{o.paid ? ' · ' + o.paid : ''}</p> : null}
                    {o.status === 'PAID' && o.amount_received !== null && o.amount_received !== undefined &&
                      Math.round(Number(o.amount_received) * 100) !== Math.round(Number(o.amount) * 100) ? (
                      <p className={styles.item} style={{ color: WARN }}>⚠ Received {o.currency} {fmt(o.amount_received)} — order is {o.currency} {fmt(o.amount)}</p>
                    ) : null}
                    {o.status === 'UNPAID' ? (
                      <div className={styles.row}>
                        <input className={styles.input} type="number" step="0.01" min="0" inputMode="decimal"
                               placeholder={'Amount received (blank = ' + Number(o.amount).toFixed(2) + ')'}
                               aria-label={'Amount received for ' + o.id}
                               value={recvInput[o.id] || ''}
                               onChange={(e) => setRecvInput({ ...recvInput, [o.id]: e.target.value })} />
                      </div>
                    ) : null}
                    <div className={styles.row}>
                      {o.status === 'UNPAID' ? (
                        <button type="button" className={styles.btnBig} disabled={busy}
                                onClick={() => setStatus(o.id, 'PAID')}>MARK PAID ✓</button>
                      ) : (
                        <button type="button" className={styles.btnGhost} disabled={busy}
                                onClick={() => setStatus(o.id, 'UNPAID')}>UNDO PAID</button>
                      )}
                      <button type="button" className={styles.btnGhost} disabled={busy}
                              onClick={() => removeOrder(o.id)}>DELETE</button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 ? <div className={styles.hint}>No orders recorded yet.</div> : null}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
