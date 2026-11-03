/* pages/manage.js (added 2026-11-02) — MANAGEMENT BACKEND
   For managers only (personal username + password, created by the owner on
   /admin → MANAGERS). Not linked anywhere and not indexed.

   TODAY       orders created / completed (paid) today, money received,
               the Daily Check result, this month's totals, who is clocked
               in now, latest orders
   ORDERS      any day or search; mark PAID (with the amount received)
   COMPLAINTS  record a customer complaint, decide it VALID (with a fine for
               the staff member and/or a voucher for the customer — both
               amounts decided each time) or REJECTED
   VOUCHERS    all vouchers; create one (e.g. goodwill) or cancel an unused one
   STAFF       each staff member's month: hours, orders, complaints, fines, pay
   REST        (2026-11-02) who is on a break now; each person's rest checks
               for the month (30-min break after 5 h, breaks over 30 min,
               8 h between shifts, 11 h daily rest, 24 h weekly rest); add or
               correct breaks
   DAILY CHECK are the day's order count and amounts correct?
   ACTIVITY    who did what and when

   Managers cannot change pay rules, staff PINs or delete orders — that
   stays with the owner on /admin. */

import { useEffect, useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import DailyCheckPanel, { todayToronto, fmtCur } from '../components/DailyCheckPanel'
import styles from '../styles/Pay.module.css'

const TOKEN_KEY = 'cll_manager_token'
const OK = '#3ddc84'
const WARN = '#ffb347'
const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const KIND_LABELS = {
  'slow-reply': 'Slow / delayed reply',
  'wrong-info': 'Wrong information',
  'rude': 'Rude or unprofessional',
  'no-follow-up': 'No follow-up',
  'other': 'Other',
}
const TABS = [
  ['today', 'TODAY'], ['orders', 'ORDERS'], ['complaints', 'COMPLAINTS'], ['vouchers', 'VOUCHERS'],
  ['staff', 'STAFF'], ['rest', 'REST'], ['check', 'DAILY CHECK'], ['activity', 'ACTIVITY'],
]
const thisMonth = () => todayToronto().slice(0, 7)

/* The message a manager can paste into chat or email for the customer. */
function voucherMessage(v) {
  return 'We are sorry for the trouble. Here is a voucher for your next payment with COSMOS Ledger Labs:\n' +
    'Voucher code: ' + v.code + '\n' +
    'Value: ' + v.currency + ' ' + fmt(v.amount) + (v.expires ? '\nValid until: ' + v.expires : v.days ? '\nValid for ' + v.days + ' days' : '') + '\n' +
    'Enter the code in "Voucher code" on https://cosmosledgerlabs.com/pay — it is taken off the amount to pay. ' +
    'It can be used once, for a payment in ' + v.currency + ' larger than the voucher.'
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch (e) { return false }
}

export default function Manage() {
  const [token, setToken] = useState('')
  const [me, setMe] = useState('')
  const [login, setLogin] = useState({ username: '', password: '' })
  const [loginMsg, setLoginMsg] = useState('')
  const [tab, setTab] = useState('today')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [version, setVersion] = useState(0)
  const [copied, setCopied] = useState('')

  const [dash, setDash] = useState(null)
  const [orders, setOrders] = useState([])
  const [oq, setOq] = useState({ day: todayToronto(), q: '', status: '' })
  const [recv, setRecv] = useState({})
  const [complaints, setComplaints] = useState([])
  const [cFilter, setCFilter] = useState('open')
  const [newC, setNewC] = useState({ orderId: '', staffId: '', customer: '', kind: '', details: '' })
  const [decide, setDecide] = useState({})   // complaint id → { fine, voucher, currency, days, note }
  const [vouchers, setVouchers] = useState([])
  const [vFilter, setVFilter] = useState({ status: 'all', q: '' })
  const [newV, setNewV] = useState({ amount: '', currency: 'CAD', days: '90', customer: '', note: '' })
  const [lastVoucher, setLastVoucher] = useState(null)
  const [staffMonth, setStaffMonth] = useState(thisMonth())
  const [staffData, setStaffData] = useState(null)
  const [activeStaff, setActiveStaff] = useState([])
  const [restMonth, setRestMonth] = useState(thisMonth())
  const [restData, setRestData] = useState(null)
  const [brEdit, setBrEdit] = useState({})      // break id → { start, end, note }
  const [newBr, setNewBr] = useState({ staffId: '', start: '', end: '', note: '' })
  const [log, setLog] = useState([])
  const [logQ, setLogQ] = useState('')

  const H = { 'Content-Type': 'application/json', 'x-manager-token': token }

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY)
      const n = sessionStorage.getItem(TOKEN_KEY + '_name')
      if (t) { setToken(t); setMe(n || '') }
    } catch (e) { /* ignore */ }
  }, [])

  const logout = () => {
    try { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY + '_name') } catch (e) { /* ignore */ }
    setToken(''); setMe(''); setDash(null)
  }

  /* GET / send helper: logs out on 401, shows errors in `setNote`. */
  const api = async (url, opts, setNote) => {
    const r = await fetch(url, { ...(opts || {}), headers: H, cache: 'no-store' })
    if (r.status === 401) { logout(); setLoginMsg('Please log in again.'); return null }
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { (setNote || setMsg)(j.error || 'Something went wrong — try again.'); return null }
    return j
  }

  const doLogin = async () => {
    setLoginMsg(''); setBusy(true)
    try {
      const r = await fetch('/api/manager-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setLoginMsg(j.error || 'Login failed.'); return }
      try { sessionStorage.setItem(TOKEN_KEY, j.token); sessionStorage.setItem(TOKEN_KEY + '_name', j.name) } catch (e) { /* ignore */ }
      setToken(j.token); setMe(j.name); setLogin({ username: '', password: '' })
    } catch (e) {
      setLoginMsg('Network error — try again.')
    } finally { setBusy(false) }
  }

  /* ---------- loaders ---------- */
  const loadDash = async () => { const j = await api('/api/manage/dashboard'); if (j) { setDash(j); setMe(j.you) } }
  const loadOrders = async (q) => {
    const f = q || oq
    const url = f.q.trim()
      ? '/api/manage/orders?q=' + encodeURIComponent(f.q.trim()) + (f.status ? '&status=' + f.status : '')
      : '/api/manage/orders?day=' + f.day + (f.status ? '&status=' + f.status : '')
    const j = await api(url); if (j) setOrders(j.orders || [])
  }
  const loadComplaints = async (st) => { const j = await api('/api/manage/complaints?status=' + (st || cFilter)); if (j) setComplaints(j.complaints || []) }
  const loadVouchers = async (f) => {
    const v = f || vFilter
    const j = await api('/api/manage/vouchers?status=' + v.status + '&q=' + encodeURIComponent(v.q)); if (j) setVouchers(j.vouchers || [])
  }
  const loadStaff = async (m) => {
    const j = await api('/api/manage/staff?month=' + (m || staffMonth))
    if (j) { setStaffData(j); setActiveStaff(j.activeStaff || []) }
  }
  const loadRest = async (m) => {
    const j = await api('/api/manage/rest?month=' + (m || restMonth)); if (j) setRestData(j)
    if (!activeStaff.length) { const st = await api('/api/manage/staff?month=' + thisMonth()); if (st) setActiveStaff(st.activeStaff || []) }
  }
  const loadLog = async (q) => { const j = await api('/api/manage/activity?q=' + encodeURIComponent(q === undefined ? logQ : q)); if (j) setLog(j.log || []) }

  const loadTab = async (t) => {
    setMsg(''); setBusy(true)
    try {
      if (t === 'today') await loadDash()
      if (t === 'orders') await loadOrders()
      if (t === 'complaints') { await loadComplaints(); if (!activeStaff.length) await loadStaff(thisMonth()) }
      if (t === 'vouchers') await loadVouchers()
      if (t === 'staff') await loadStaff()
      if (t === 'activity') await loadLog()
      if (t === 'rest') await loadRest()
      if (t === 'check') setVersion((v) => v + 1)
    } catch (e) {
      setMsg('Network error — try again.')
    } finally { setBusy(false) }
  }

  useEffect(() => { if (token) loadTab(tab) }, [token, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- actions ---------- */
  const run = async (fn) => { setMsg(''); setBusy(true); try { await fn() } catch (e) { setMsg('Network error — try again.') } finally { setBusy(false) } }

  const setOrderStatus = (id, status) => run(async () => {
    const j = await api('/api/manage/orders', { method: 'PATCH', body: JSON.stringify({ id, status, received: status === 'PAID' ? (recv[id] || '') : '' }) })
    if (j) { setRecv({ ...recv, [id]: '' }); setMsg(id + (status === 'PAID' ? ' marked PAID ✓' : ' set back to UNPAID')); await loadOrders() }
  })

  const addComplaint = () => run(async () => {
    const j = await api('/api/manage/complaints', { method: 'POST', body: JSON.stringify(newC) })
    if (j) { setNewC({ orderId: '', staffId: '', customer: '', kind: '', details: '' }); setMsg('Complaint #' + j.id + ' recorded ✓ — decide it below.'); setCFilter('open'); await loadComplaints('open') }
  })
  const setD = (id, k, v) => setDecide({ ...decide, [id]: { currency: 'CAD', days: '90', ...(decide[id] || {}), [k]: v } })
  const decideComplaint = (c, decision) => run(async () => {
    const d = { currency: 'CAD', days: '90', ...(decide[c.id] || {}) }
    if (decision === 'valid') {
      const parts = []
      parts.push(d.fine ? 'fine ' + fmt(d.fine) + ' for ' + (c.staff || 'the staff member') : 'no fine')
      parts.push(d.voucher ? 'voucher ' + d.currency + ' ' + fmt(d.voucher) + ' for the customer' : 'no voucher')
      if (!confirm('Complaint #' + c.id + ' is VALID: ' + parts.join(', ') + '. Continue?')) return
    } else if (!confirm('Reject complaint #' + c.id + '?')) return
    const j = await api('/api/manage/complaints', { method: 'PATCH', body: JSON.stringify({
      id: c.id, action: 'decide', decision, note: d.note || '',
      fineAmount: d.fine || '', voucherAmount: d.voucher || '', voucherCurrency: d.currency, voucherDays: d.days === '' ? '' : Number(d.days),
    }) })
    if (j) {
      setMsg('Complaint #' + c.id + (decision === 'valid' ? ' decided VALID ✓' : ' rejected ✓') + (j.voucher ? ' — voucher ' + j.voucher.code + ' created' : ''))
      if (j.voucher) setLastVoucher(j.voucher)
      await loadComplaints()
    }
  })
  const reopenComplaint = (c) => run(async () => {
    if (!confirm('Reopen complaint #' + c.id + '? The fine is removed and an unused voucher is cancelled.')) return
    const j = await api('/api/manage/complaints', { method: 'PATCH', body: JSON.stringify({ id: c.id, action: 'reopen' }) })
    if (j) { setMsg('Complaint #' + c.id + ' reopened.'); await loadComplaints() }
  })

  const addVoucher = () => run(async () => {
    const j = await api('/api/manage/vouchers', { method: 'POST', body: JSON.stringify({ ...newV, days: newV.days === '' ? '' : Number(newV.days) }) })
    if (j) { setLastVoucher(j.voucher); setNewV({ amount: '', currency: 'CAD', days: '90', customer: '', note: '' }); setMsg('Voucher ' + j.voucher.code + ' created ✓'); await loadVouchers() }
  })
  const cancelVoucher = (code) => run(async () => {
    if (!confirm('Cancel voucher ' + code + '? The customer can no longer use it.')) return
    const j = await api('/api/manage/vouchers', { method: 'PATCH', body: JSON.stringify({ code, action: 'cancel' }) })
    if (j) { setMsg('Voucher ' + code + ' cancelled.'); await loadVouchers() }
  })

  const saveBreak = (b) => run(async () => {
    const e = { start: b.start, end: b.end || '', note: b.note || '', ...(brEdit[b.id] || {}) }
    const j = await api('/api/manage/rest', { method: 'PATCH', body: JSON.stringify({ id: b.id, ...e }) })
    if (j) { setMsg('Break corrected ✓'); await loadRest() }
  })
  const deleteBreak = (b) => run(async () => {
    if (!confirm('Delete this break (' + b.name + ', ' + b.start.replace('T', ' ') + ')?')) return
    const j = await api('/api/manage/rest', { method: 'DELETE', body: JSON.stringify({ id: b.id }) })
    if (j) { setMsg('Break deleted.'); await loadRest() }
  })
  const addBreak = () => run(async () => {
    const j = await api('/api/manage/rest', { method: 'POST', body: JSON.stringify({ ...newBr, staffId: Number(newBr.staffId) }) })
    if (j) { setNewBr({ staffId: '', start: '', end: '', note: '' }); setMsg('Break added ✓'); await loadRest() }
  })

  const copy = async (key, text) => { const ok = await copyText(text); setCopied(ok ? key : ''); if (ok) setTimeout(() => setCopied(''), 1800) }

  const VoucherBox = ({ v, k }) => (
    <div className={styles.detailCard} style={{ marginTop: 10, borderColor: OK }}>
      <p className={styles.itemStrong} style={{ color: OK }}>VOUCHER {v.code} — {v.currency} {fmt(v.amount)}</p>
      <p className={styles.item}>Send this code to the customer. They enter it on cosmosledgerlabs.com/pay.</p>
      <div className={styles.row}>
        <button type="button" className={styles.btnGhost} onClick={() => copy(k + 'code', v.code)}>{copied === k + 'code' ? 'COPIED ✓' : 'COPY CODE'}</button>
        <button type="button" className={styles.btnGhost} onClick={() => copy(k + 'msg', voucherMessage(v))}>{copied === k + 'msg' ? 'COPIED ✓' : 'COPY MESSAGE FOR CUSTOMER'}</button>
      </div>
    </div>
  )

  /* ---------- views ---------- */
  const todayView = () => {
    if (!dash) return null
    const t = dash.today
    const received = { count: 0, CAD: 0, USD: 0 }
    t.channels.forEach((c) => { received.count += c.count; received[c.currency] += c.received })
    const mt = dash.monthTotals
    return (
      <>
        <div className={styles.orderCard} style={{ borderColor: t.status === 'ok' ? OK : WARN }}>
          <div className={styles.orderHead} style={{ color: t.status === 'ok' ? OK : WARN }}>
            TODAY {dash.day} — {t.status === 'ok' ? '✅ ALL CHECKS OK' : '⚠ ' + t.problems + ' PROBLEM' + (t.problems === 1 ? '' : 'S')}
          </div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Orders created today</span>
            <span className={styles.orderId}>{t.totals.all.count} · {fmtCur(t.totals.all)}</span></div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Completed (paid) today</span>
            <span>{received.count} · {fmtCur(received)}</span></div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Today's orders still unpaid</span>
            <span>{t.totals.unpaid.count} · {fmtCur(t.totals.unpaid)}</span></div>
          {t.totals.vouchers && t.totals.vouchers.count ? (
            <div className={styles.orderRow}><span className={styles.orderKey}>Voucher discounts today</span>
              <span>{t.totals.vouchers.count} · {fmtCur(t.totals.vouchers)}</span></div>
          ) : null}
          {t.status !== 'ok' ? (
            <div style={{ marginTop: 10 }}>
              <button type="button" className={styles.btnGhost} onClick={() => setTab('check')}>SEE WHAT IS WRONG →</button>
            </div>
          ) : null}
        </div>

        <div className={styles.detailCard} style={{ marginTop: 12 }}>
          <p className={styles.itemStrong}>BY CUSTOMER SERVICE — TODAY</p>
          {t.byStaff.map((s, i) => (
            <p key={i} className={styles.item}>{s.name || '(no customer service)'} — {s.all.count} order{s.all.count === 1 ? '' : 's'} · {fmtCur(s.all)} · {s.paid.count} paid</p>
          ))}
          {t.byStaff.length === 0 ? <p className={styles.item}>No orders yet today.</p> : null}
        </div>

        <div className={styles.orderCard} style={{ marginTop: 12 }}>
          <div className={styles.orderHead}>THIS MONTH ({dash.month})</div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Orders created</span><span>{mt.ordersCreated} · {fmtCur(mt.createdAmount)}</span></div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Orders paid (income)</span><span className={styles.orderId}>{mt.ordersPaid} · {fmtCur(mt.paidAmount)}</span></div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Vouchers issued</span><span>{mt.vouchersIssued} · {fmtCur(mt.vouchersIssuedAmount)}</span></div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Vouchers used</span><span>{mt.vouchersUsed} · {fmtCur(mt.vouchersUsedAmount)}</span></div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Complaints</span>
            <span>{mt.complaints.open} open · {mt.complaints.valid} valid · {mt.complaints.rejected} rejected</span></div>
          <div className={styles.orderRow}><span className={styles.orderKey}>Complaint fines set</span><span>{fmt(mt.complaints.fines)}</span></div>
        </div>
        {mt.complaints.open ? (
          <div style={{ marginTop: 10 }}>
            <button type="button" className={styles.btnGhost} onClick={() => { setCFilter('open'); setTab('complaints') }}>
              {mt.complaints.open} COMPLAINT{mt.complaints.open === 1 ? '' : 'S'} WAITING FOR A DECISION →
            </button>
          </div>
        ) : null}

        <div className={styles.detailCard} style={{ marginTop: 12 }}>
          <p className={styles.itemStrong}>CLOCKED IN NOW ({dash.onShift.length}) · ON BREAK ({dash.onShift.filter((s) => s.onBreak).length})</p>
          {dash.onShift.map((s, i) => (
            <p key={i} className={styles.item} style={{ color: s.hours > 12 || (s.onBreak && s.onBreak.minutes > dash.breakMinutes) ? WARN : undefined }}>
              {s.name} — since {s.since} ({s.hours} h){s.hours > 12 ? ' ⚠ forgot to clock out?' : ''}
              {s.onBreak ? ' — ☕ ON BREAK since ' + s.onBreak.since + ' (' + s.onBreak.minutes + ' min' + (s.onBreak.minutes > dash.breakMinutes ? ' ⚠ over ' + dash.breakMinutes : '') + ')' : ''}
            </p>
          ))}
          {dash.onShift.length === 0 ? <p className={styles.item}>Nobody is clocked in.</p> : null}
        </div>

        <div className={styles.detailCard} style={{ marginTop: 12, borderColor: dash.restToday.length ? WARN : undefined }}>
          <p className={styles.itemStrong}>REST TIME</p>
          {dash.restToday.map((r, i) => (
            <p key={i} className={styles.item} style={{ color: WARN }}>
              ⚠ {r.name} today: {[r.missedEating ? r.missedEating + ' missed 30-min break' : '', r.longBreaks ? r.longBreaks + ' break over 30 min' : '', r.shortGaps ? 'under 8 h rest before the shift' : ''].filter(Boolean).join(' · ')}
            </p>
          ))}
          {dash.restToday.length === 0 ? <p className={styles.item}>✅ No rest problems today.</p> : null}
          <p className={styles.item}>This month: {dash.restIssuesMonth} rest problem{dash.restIssuesMonth === 1 ? '' : 's'}.{' '}
            <button type="button" className={styles.btnCopyMini} onClick={() => setTab('rest')}>SEE REST →</button></p>
        </div>

        <div className={styles.detailCard} style={{ marginTop: 12 }}>
          <p className={styles.itemStrong}>LATEST ORDERS</p>
          {dash.latest.map((o) => (
            <p key={o.id} className={styles.item}>
              {o.created} · {o.id} · {o.currency} {fmt(o.amount)} · {o.method.toUpperCase()} · {o.rep || 'no rep'} · <b style={{ color: o.status === 'PAID' ? OK : undefined }}>{o.status}</b>
              {o.voucher_code ? ' · voucher' : ''}
            </p>
          ))}
          {dash.latest.length === 0 ? <p className={styles.item}>No orders yet.</p> : null}
        </div>
        <p className={styles.hint}>Updated {dash.now} (Toronto). <button type="button" className={styles.btnCopyMini} onClick={() => loadTab('today')}>REFRESH</button></p>
      </>
    )
  }

  const ordersView = () => {
    const tot = { count: 0, CAD: 0, USD: 0 }
    orders.forEach((o) => { tot.count += 1; tot[o.currency === 'USD' ? 'USD' : 'CAD'] += Number(o.amount) })
    return (
      <>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Day created</label>
            <input className={styles.input} type="date" value={oq.day} onChange={(e) => setOq({ ...oq, day: e.target.value, q: '' })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>…or search (order no., staff name, voucher)</label>
            <input className={styles.input} value={oq.q} placeholder="e.g. CLL-2611 or Amy" onChange={(e) => setOq({ ...oq, q: e.target.value })}
                   onKeyDown={(e) => { if (e.key === 'Enter') run(() => loadOrders()) }} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select className={styles.input} value={oq.status} onChange={(e) => setOq({ ...oq, status: e.target.value })}>
              <option value="">All</option><option value="UNPAID">Unpaid</option><option value="PAID">Paid</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="button" className={styles.btnBig} disabled={busy} onClick={() => run(() => loadOrders())}>{busy ? 'LOADING…' : 'SHOW ORDERS →'}</button>
        </div>
        <p className={styles.hint}>{tot.count} order{tot.count === 1 ? '' : 's'} · {fmtCur(tot)}</p>
        {orders.map((o) => {
          const diff = o.status === 'PAID' && o.amount_received !== null && o.amount_received !== undefined &&
            Math.round(Number(o.amount_received) * 100) !== Math.round(Number(o.amount) * 100)
          return (
            <div key={o.id} className={styles.detailCard} style={{ marginBottom: 10 }}>
              <p className={styles.itemStrong}>{o.id} — {o.currency} {fmt(o.amount)} — <span style={{ color: o.status === 'PAID' ? OK : undefined }}>{o.status}</span></p>
              <p className={styles.item}>{o.created} · {o.method.toUpperCase()} · customer service: {o.rep || '—'} · {o.service || 'custom'}</p>
              {o.voucher_code ? <p className={styles.item}>Voucher {o.voucher_code}: −{o.currency} {fmt(o.voucher_amount)} (amount above is after the voucher)</p> : null}
              {o.status === 'PAID' ? <p className={styles.item}>Paid {o.paid} · {o.paid_via}</p> : null}
              {diff ? <p className={styles.item} style={{ color: WARN }}>⚠ Received {o.currency} {fmt(o.amount_received)} — order is {o.currency} {fmt(o.amount)}</p> : null}
              {o.status === 'UNPAID' ? (
                <div className={styles.row}>
                  <input className={styles.input} type="number" step="0.01" min="0" inputMode="decimal"
                         placeholder={'Amount received (blank = ' + Number(o.amount).toFixed(2) + ')'} aria-label={'Amount received for ' + o.id}
                         value={recv[o.id] || ''} onChange={(e) => setRecv({ ...recv, [o.id]: e.target.value })} />
                  <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => setOrderStatus(o.id, 'PAID')}>MARK PAID ✓</button>
                </div>
              ) : (
                <div className={styles.row}>
                  <button type="button" className={styles.btnGhost} disabled={busy}
                          onClick={() => { if (confirm('Set ' + o.id + ' back to UNPAID?')) setOrderStatus(o.id, 'UNPAID') }}>UNDO PAID</button>
                </div>
              )}
            </div>
          )
        })}
        {orders.length === 0 ? <div className={styles.hint}>No orders found.</div> : null}
      </>
    )
  }

  const complaintsView = () => (
    <>
      <div className={styles.detailCard}>
        <p className={styles.itemStrong}>RECORD A COMPLAINT</p>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Order number (if any)</label>
            <input className={styles.input} value={newC.orderId} placeholder="CLL-261102-AB12" autoCapitalize="characters"
                   onChange={(e) => setNewC({ ...newC, orderId: e.target.value.toUpperCase() })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Customer service person</label>
            <select className={styles.input} value={newC.staffId} onChange={(e) => setNewC({ ...newC, staffId: e.target.value })}>
              <option value="">{newC.orderId ? 'From the order' : 'Choose…'}</option>
              {activeStaff.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Customer (name, email or chat ID)</label>
            <input className={styles.input} maxLength={120} value={newC.customer} onChange={(e) => setNewC({ ...newC, customer: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Type of problem</label>
            <select className={styles.input} value={newC.kind} onChange={(e) => setNewC({ ...newC, kind: e.target.value })}>
              <option value="">Choose…</option>
              {Object.entries(KIND_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
        <label className={styles.label}>What happened</label>
        <textarea className={styles.input} rows={3} maxLength={1000} value={newC.details} style={{ resize: 'vertical' }}
                  placeholder="e.g. Customer waited 6 hours for a reply in chat on 2 Nov; screenshot received."
                  onChange={(e) => setNewC({ ...newC, details: e.target.value })} />
        <div style={{ marginTop: 12 }}>
          <button type="button" className={styles.btnBig} disabled={busy} onClick={addComplaint}>RECORD COMPLAINT →</button>
        </div>
      </div>

      {lastVoucher ? <VoucherBox v={lastVoucher} k="lastc" /> : null}

      <div className={styles.segmented} style={{ marginTop: 16 }}>
        {[['open', 'OPEN'], ['valid', 'VALID'], ['rejected', 'REJECTED'], ['all', 'ALL']].map(([k, l]) => (
          <button key={k} type="button" className={cFilter === k ? styles.segOn : styles.seg}
                  onClick={() => { setCFilter(k); run(() => loadComplaints(k)) }}>{l}</button>
        ))}
      </div>

      {complaints.map((c) => {
        const d = { currency: 'CAD', days: '90', ...(decide[c.id] || {}) }
        return (
          <div key={c.id} className={styles.detailCard} style={{ marginTop: 10, borderColor: c.status === 'open' ? WARN : undefined }}>
            <p className={styles.itemStrong}>
              #{c.id} — {KIND_LABELS[c.kind] || c.kind} — {c.staff || '—'} — <span style={{ color: c.status === 'valid' ? WARN : c.status === 'rejected' ? OK : undefined }}>{c.status.toUpperCase()}</span>
            </p>
            <p className={styles.item}>{c.created} · recorded by {c.created_by}{c.order_id ? ' · order ' + c.order_id : ''}{c.customer ? ' · customer: ' + c.customer : ''}</p>
            <p className={styles.item}>{c.details}</p>

            {c.status === 'open' ? (
              <>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Fine for {c.staff || 'staff'} (CAD) — blank = no fine</label>
                    <input className={styles.input} type="number" step="0.01" min="0" inputMode="decimal" value={d.fine || ''}
                           onChange={(e) => setD(c.id, 'fine', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Voucher for the customer — blank = none</label>
                    <input className={styles.input} type="number" step="0.01" min="0" inputMode="decimal" value={d.voucher || ''}
                           onChange={(e) => setD(c.id, 'voucher', e.target.value)} />
                  </div>
                </div>
                {d.voucher ? (
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Voucher currency</label>
                      <div className={styles.segmented}>
                        {['CAD', 'USD'].map((cur) => (
                          <button key={cur} type="button" className={d.currency === cur ? styles.segOn : styles.seg} onClick={() => setD(c.id, 'currency', cur)}>{cur}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Valid for (days)</label>
                      <input className={styles.input} type="number" min="1" step="1" value={d.days} onChange={(e) => setD(c.id, 'days', e.target.value)} />
                    </div>
                  </div>
                ) : null}
                <input className={styles.input} maxLength={500} placeholder="Decision note (why)" value={d.note || ''}
                       onChange={(e) => setD(c.id, 'note', e.target.value)} />
                <div className={styles.row} style={{ marginTop: 10 }}>
                  <button type="button" className={styles.btnBig} disabled={busy} onClick={() => decideComplaint(c, 'valid')}>VALID — APPLY ✓</button>
                  <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => decideComplaint(c, 'rejected')}>REJECT</button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.item}>
                  Decided {c.decided} by {c.decided_by}
                  {c.status === 'valid' ? ' · fine: ' + (c.fine_amount ? fmt(c.fine_amount) : 'none') : ''}
                  {c.decision_note ? ' · ' + c.decision_note : ''}
                </p>
                {c.voucher_code ? (
                  <p className={styles.item}>
                    Voucher {c.voucher_code} — {c.voucher_currency} {fmt(c.voucher_amount)} — {c.voucher_used_by ? 'USED on ' + c.voucher_used_by : c.voucher_cancelled ? 'cancelled' : 'valid until ' + c.voucher_expires}
                    {!c.voucher_used_by && !c.voucher_cancelled ? (
                      <> <button type="button" className={styles.btnCopyMini}
                                 onClick={() => copy('c' + c.id, voucherMessage({ code: c.voucher_code, amount: c.voucher_amount, currency: c.voucher_currency, expires: c.voucher_expires }))}>
                        {copied === 'c' + c.id ? 'COPIED ✓' : 'COPY MESSAGE'}
                      </button></>
                    ) : null}
                  </p>
                ) : null}
                {!c.voucher_used_by ? (
                  <div className={styles.row}>
                    <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => reopenComplaint(c)}>REOPEN</button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )
      })}
      {complaints.length === 0 ? <div className={styles.hint}>No complaints here.</div> : null}
      <div className={styles.hint}>
        A fine is taken off that staff member's pay in the month the complaint is decided (never below $0) and they see it in MY PAY on /team.
      </div>
    </>
  )

  const vouchersView = () => (
    <>
      <div className={styles.detailCard}>
        <p className={styles.itemStrong}>CREATE A VOUCHER (without a complaint, e.g. goodwill)</p>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Amount</label>
            <input className={styles.input} type="number" step="0.01" min="0" inputMode="decimal" value={newV.amount} placeholder="30"
                   onChange={(e) => setNewV({ ...newV, amount: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Currency</label>
            <div className={styles.segmented}>
              {['CAD', 'USD'].map((cur) => (
                <button key={cur} type="button" className={newV.currency === cur ? styles.segOn : styles.seg} onClick={() => setNewV({ ...newV, currency: cur })}>{cur}</button>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Valid for (days)</label>
            <input className={styles.input} type="number" min="1" step="1" value={newV.days} onChange={(e) => setNewV({ ...newV, days: e.target.value })} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Customer (name, email or chat ID)</label>
            <input className={styles.input} maxLength={120} value={newV.customer} onChange={(e) => setNewV({ ...newV, customer: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Note (reason)</label>
            <input className={styles.input} maxLength={300} value={newV.note} onChange={(e) => setNewV({ ...newV, note: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" className={styles.btnBig} disabled={busy} onClick={addVoucher}>CREATE VOUCHER →</button>
        </div>
      </div>
      {lastVoucher ? <VoucherBox v={lastVoucher} k="lastv" /> : null}

      <div className={styles.row} style={{ marginTop: 16 }}>
        <div className={styles.field}>
          <label className={styles.label}>Show</label>
          <select className={styles.input} value={vFilter.status} onChange={(e) => { const f = { ...vFilter, status: e.target.value }; setVFilter(f); run(() => loadVouchers(f)) }}>
            <option value="all">All</option><option value="active">Not used yet</option><option value="used">Used</option>
            <option value="expired">Expired</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Search (code, customer, order)</label>
          <input className={styles.input} value={vFilter.q} onChange={(e) => setVFilter({ ...vFilter, q: e.target.value })}
                 onKeyDown={(e) => { if (e.key === 'Enter') run(() => loadVouchers()) }} />
        </div>
      </div>
      {vouchers.map((v) => (
        <div key={v.code} className={styles.detailCard} style={{ marginTop: 10, opacity: v.status === 'cancelled' || v.status === 'expired' ? 0.6 : 1 }}>
          <p className={styles.itemStrong}>{v.code} — {v.currency} {fmt(v.amount)} — <span style={{ color: v.status === 'active' ? OK : undefined }}>{
            v.status === 'active' ? 'NOT USED YET' : v.status.toUpperCase()}</span></p>
          <p className={styles.item}>
            Created {v.created} by {v.createdBy}{v.customer ? ' · customer: ' + v.customer : ''}{v.complaintId ? ' · complaint #' + v.complaintId : ''}{v.note && !v.complaintId ? ' · ' + v.note : ''}
          </p>
          <p className={styles.item}>{v.usedOrder ? 'Used ' + v.used + ' on order ' + v.usedOrder : 'Valid until ' + v.expires}</p>
          {v.status === 'active' ? (
            <div className={styles.row}>
              <button type="button" className={styles.btnGhost} onClick={() => copy('v' + v.code, voucherMessage(v))}>{copied === 'v' + v.code ? 'COPIED ✓' : 'COPY MESSAGE'}</button>
              <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => cancelVoucher(v.code)}>CANCEL VOUCHER</button>
            </div>
          ) : null}
        </div>
      ))}
      {vouchers.length === 0 ? <div className={styles.hint}>No vouchers here.</div> : null}
    </>
  )

  const staffView = () => (
    <>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Month</label>
          <input className={styles.input} type="month" value={staffMonth} onChange={(e) => setStaffMonth(e.target.value)} />
        </div>
        <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
          <button type="button" className={styles.btnBig} disabled={busy} onClick={() => run(() => loadStaff())}>{busy ? 'LOADING…' : 'SHOW MONTH →'}</button>
        </div>
      </div>
      {staffData ? (
        <>
          <div className={styles.orderCard} style={{ marginTop: 12 }}>
            <div className={styles.orderHead}>{staffData.month} — ALL STAFF (CAD)</div>
            <div className={styles.orderRow}><span className={styles.orderKey}>Paid orders (income)</span><span>{fmt(staffData.paidOrdersCad)}</span></div>
            <div className={styles.orderRow}><span className={styles.orderKey}>Hours</span><span>{Number(staffData.totals.hours).toFixed(2)} h</span></div>
            <div className={styles.orderRow}><span className={styles.orderKey}>Complaint fines</span><span>−{fmt(staffData.totals.fines)}</span></div>
            <div className={styles.orderRow}><span className={styles.orderKey}>Total pay</span><span className={styles.orderId}>{fmt(staffData.totals.totalPay)}</span></div>
          </div>
          {!staffData.usdCadEntered ? <div className={styles.hint} style={{ color: WARN }}>The owner has not saved this month's USD→CAD rate yet — the default {staffData.usdCad} is used.</div> : null}
          {staffData.staff.map((p) => (
            <div key={p.staffId} className={styles.detailCard} style={{ marginTop: 10 }}>
              <p className={styles.itemStrong}>{p.name} ({p.fullTime ? 'full-time' : 'part-time'}) — pay {fmt(p.totalPay)}</p>
              <p className={styles.item}>Hours {Number(p.hours).toFixed(2)} · {p.daysWorked} days worked{p.openShifts ? ' · ⚠ ' + p.openShifts + ' shift(s) without clock-out' : ''}</p>
              <p className={styles.item}>Orders {p.ordersCredited} · paid {p.paidOrders} ({fmt(p.paidAmountCad)}) · commission {fmt(p.commission)}</p>
              <p className={styles.item} style={{ color: p.complaints.length ? WARN : undefined }}>
                Valid complaints: {p.complaints.length}{p.complaints.length ? ' · fines ' + fmt(p.fines) + ' · deducted ' + fmt(p.finesDeducted) : ''}
              </p>
            </div>
          ))}
        </>
      ) : null}
    </>
  )

  const restView = () => (
    <>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Month</label>
          <input className={styles.input} type="month" value={restMonth} onChange={(e) => setRestMonth(e.target.value)} />
        </div>
        <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
          <button type="button" className={styles.btnBig} disabled={busy} onClick={() => run(() => loadRest())}>{busy ? 'LOADING…' : 'CHECK REST →'}</button>
        </div>
      </div>
      {restData ? (
        <>
          <div className={styles.orderCard} style={{ marginTop: 12, borderColor: restData.issues ? WARN : OK }}>
            <div className={styles.orderHead} style={{ color: restData.issues ? WARN : OK }}>
              {restData.month} — {restData.issues ? '⚠ ' + restData.issues + ' REST PROBLEM' + (restData.issues === 1 ? '' : 'S') : '✅ ALL REST RULES MET'}
            </div>
            <p className={styles.item}>
              Rules: a {restData.rules.breakMinutes}-minute break after no more than {restData.rules.eatingBreakAfterHours} h of work in a row ·
              breaks over {restData.rules.breakMinutes} min are flagged · at least {restData.rules.minHoursBetweenShifts} h between shifts ·
              {' '}{restData.rules.minDailyRestHours} h in a row off each day · {restData.rules.minWeeklyRestHours} h in a row off each week
              (or {restData.rules.minWeeklyRestHours * 2} h over two weeks). Breaks are {restData.rules.breaksPaid ? 'paid' : 'unpaid'}.
            </p>
          </div>

          {restData.staff.map((r) => (
            <div key={r.staffId} className={styles.detailCard} style={{ marginTop: 10, borderColor: r.issues ? WARN : undefined }}>
              <p className={styles.itemStrong}>
                {r.name} — {r.shifts} shift{r.shifts === 1 ? '' : 's'} · {r.breaks} break{r.breaks === 1 ? '' : 's'} ({r.breakMinutes} min)
                {r.onBreakNow ? ' · ☕ on break now (' + r.onBreakNow.minutes + ' min)' : ''}
                {r.issues ? <span style={{ color: WARN }}> · ⚠ {r.issues}</span> : <span style={{ color: OK }}> · ✅</span>}
              </p>
              {r.missedEating.map((x, i) => (
                <p key={'m' + i} className={styles.item} style={{ color: WARN }}>
                  ⚠ {x.date}: worked {x.hours} h in a row from {x.from.slice(11)} without a {restData.rules.breakMinutes}-min break{x.stillWorking ? ' (still working)' : ''}
                </p>
              ))}
              {r.longBreaks.map((x, i) => (
                <p key={'l' + i} className={styles.item} style={{ color: WARN }}>⚠ {x.start}: break of {x.minutes} min{x.open ? ' (still on break)' : ''}</p>
              ))}
              {r.shortGaps.map((x, i) => (
                <p key={'g' + i} className={styles.item} style={{ color: WARN }}>⚠ {x.date}: only {x.hours} h off between shifts ({x.from} → {x.to.slice(11)})</p>
              ))}
              {r.dailyRest.map((x, i) => (
                <p key={'d' + i} className={styles.item} style={{ color: WARN }}>⚠ {x.date}: longest rest that day {x.longestRestHours} h (needs {restData.rules.minDailyRestHours} h)</p>
              ))}
              {r.weeklyRest.map((x, i) => (
                <p key={'w' + i} className={styles.item} style={{ color: WARN }}>⚠ Week of {x.weekStart}: longest rest {x.longestRestHours} h (needs {restData.rules.minWeeklyRestHours} h)</p>
              ))}
            </div>
          ))}
          {restData.staff.length === 0 ? <div className={styles.hint}>No staff yet.</div> : null}

          <div className={styles.detailCard} style={{ marginTop: 16 }}>
            <p className={styles.itemStrong}>ADD A FORGOTTEN BREAK</p>
            <select className={styles.input} value={newBr.staffId} onChange={(e) => setNewBr({ ...newBr, staffId: e.target.value })}>
              <option value="">Choose staff member…</option>
              {activeStaff.map((st) => <option key={st.id} value={String(st.id)}>{st.name}</option>)}
            </select>
            <div className={styles.row}>
              <input className={styles.input} type="datetime-local" aria-label="Break start" value={newBr.start} onChange={(e) => setNewBr({ ...newBr, start: e.target.value })} />
              <input className={styles.input} type="datetime-local" aria-label="Break end" value={newBr.end} onChange={(e) => setNewBr({ ...newBr, end: e.target.value })} />
            </div>
            <input className={styles.input} maxLength={200} placeholder="Note (e.g. forgot to press START BREAK)" value={newBr.note}
                   onChange={(e) => setNewBr({ ...newBr, note: e.target.value })} />
            <div style={{ marginTop: 12 }}>
              <button type="button" className={styles.btnBig} disabled={busy} onClick={addBreak}>ADD BREAK →</button>
            </div>
          </div>

          <p className={styles.itemStrong} style={{ marginTop: 16 }}>ALL BREAKS — {restData.month}</p>
          {restData.breaks.map((b) => {
            const e = { start: b.start, end: b.end || '', note: b.note || '', ...(brEdit[b.id] || {}) }
            const set = (k, v) => setBrEdit({ ...brEdit, [b.id]: { ...e, [k]: v } })
            return (
              <div key={b.id} className={styles.detailCard} style={{ marginTop: 8 }}>
                <p className={styles.item} style={{ color: b.minutes > restData.rules.breakMinutes ? WARN : undefined }}>
                  <b>{b.name}</b> — {b.start.replace('T', ' ')} → {b.end ? b.end.slice(11) : 'now'} — {b.minutes} min{b.edited ? ' — corrected' : ''}{b.note ? ' — ' + b.note : ''}
                </p>
                {!b.open ? (
                  <div className={styles.row}>
                    <input className={styles.input} type="datetime-local" aria-label="Break start" value={e.start} onChange={(ev) => set('start', ev.target.value)} />
                    <input className={styles.input} type="datetime-local" aria-label="Break end" value={e.end} onChange={(ev) => set('end', ev.target.value)} />
                    <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => saveBreak(b)}>SAVE</button>
                    <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => deleteBreak(b)}>DELETE</button>
                  </div>
                ) : null}
              </div>
            )
          })}
          {restData.breaks.length === 0 ? <div className={styles.hint}>No breaks recorded this month.</div> : null}
        </>
      ) : null}
    </>
  )

  const activityView = () => (
    <>
      <div className={styles.row}>
        <input className={styles.input} value={logQ} placeholder="Search (name, order no., action)" onChange={(e) => setLogQ(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') run(() => loadLog()) }} />
        <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => run(() => loadLog())}>SEARCH</button>
      </div>
      {log.map((l) => (
        <p key={l.id} className={styles.item} style={{ marginTop: 6 }}>{l.at} · <b>{l.actor}</b> · {l.action}{l.detail ? ' — ' + l.detail : ''}</p>
      ))}
      {log.length === 0 ? <div className={styles.hint}>Nothing yet.</div> : null}
    </>
  )

  return (
    <>
      <Head>
        <title>Management — COSMOS Ledger Labs</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Nav />
      <main className={styles.page}>
        <div className={styles.main}>
          <h1 className={styles.title}>MANAGEMENT</h1>

          {!token ? (
            <section className={styles.section}>
              <label className={styles.label}>Username</label>
              <input className={styles.input} value={login.username} autoCapitalize="none" autoComplete="username"
                     onChange={(e) => setLogin({ ...login, username: e.target.value })} />
              <label className={styles.label} style={{ marginTop: 10 }}>Password</label>
              <input className={styles.input} type="password" value={login.password} autoComplete="current-password"
                     onChange={(e) => setLogin({ ...login, password: e.target.value })}
                     onKeyDown={(e) => { if (e.key === 'Enter') doLogin() }} />
              <div style={{ marginTop: 14 }}>
                <button type="button" className={styles.btnBig} disabled={busy} onClick={doLogin}>{busy ? 'LOGGING IN…' : 'LOG IN →'}</button>
              </div>
              {loginMsg ? <div className={styles.hint}>{loginMsg}</div> : null}
            </section>
          ) : (
            <>
              <p className={styles.hint}>
                Logged in as <b>{me}</b>{' '}
                <button type="button" className={styles.btnCopyMini} onClick={logout}>LOG OUT</button>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0 6px' }}>
                {TABS.map(([k, l]) => (
                  <button key={k} type="button" className={tab === k ? styles.chipOn : styles.chip} onClick={() => setTab(k)}>{l}</button>
                ))}
              </div>
              {msg ? <div className={styles.hint} style={{ color: 'var(--cyan)' }}>{msg}</div> : null}

              {tab === 'check' ? (
                <DailyCheckPanel headers={H} refreshKey={version} />
              ) : (
                <section className={styles.section}>
                  {tab === 'today' ? todayView() : null}
                  {tab === 'orders' ? ordersView() : null}
                  {tab === 'complaints' ? complaintsView() : null}
                  {tab === 'vouchers' ? vouchersView() : null}
                  {tab === 'staff' ? staffView() : null}
                  {tab === 'rest' ? restView() : null}
                  {tab === 'activity' ? activityView() : null}
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
