/* pages/admin.js
   Owner-only page: order ledger (mark PAID / delete) and the automatic
   monthly settlement. Requires the ADMIN passcode. Not publicly linked. */

import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/Pay.module.css'

function thisMonth() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Admin() {
  const [code, setCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [month, setMonth] = useState(thisMonth())
  const [orders, setOrders] = useState([])
  const [settle, setSettle] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const H = { 'Content-Type': 'application/json', 'x-passcode': code }

  const loadAll = async () => {
    setMsg(''); setBusy(true)
    try {
      const [ro, rs] = await Promise.all([
        fetch('/api/orders', { headers: H }),
        fetch('/api/settle?month=' + month, { headers: H }),
      ])
      if (ro.status === 401 || rs.status === 401) { setUnlocked(false); setMsg('Wrong passcode.'); return }
      if (!ro.ok || !rs.ok) { setMsg('Load failed — try again.'); return }
      setOrders((await ro.json()).orders || [])
      setSettle(await rs.json())
      setUnlocked(true)
    } catch (e) {
      setMsg('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  const setStatus = async (id, status) => {
    setBusy(true)
    try {
      const r = await fetch('/api/orders', { method: 'PATCH', headers: H, body: JSON.stringify({ id, status }) })
      if (r.ok) await loadAll()
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
          <h1 className={styles.title}>ADMIN — ORDERS & SETTLEMENT</h1>

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
              {/* ---------- settlement ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>MONTHLY SETTLEMENT</div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Month</label>
                    <input className={styles.input} type="month" value={month}
                           onChange={(e) => setMonth(e.target.value)} />
                  </div>
                  <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
                    <button type="button" className={styles.btnBig} disabled={busy} onClick={loadAll}>
                      {busy ? 'LOADING…' : 'RELOAD →'}
                    </button>
                  </div>
                </div>

                {settle ? (
                  <>
                    <div className={styles.orderCard} style={{ marginTop: 14 }}>
                      <div className={styles.orderHead}>{settle.month} TOTALS</div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Orders (all / paid amount)</span>
                        <span>{settle.ordersCount} / {fmt(settle.paidOrderAmount)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Commission</span><span>{fmt(settle.totals.commission)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Hours pay</span><span>{fmt(settle.totals.hoursPay)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Holiday bonus</span><span>{fmt(settle.totals.holidayBonus)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Attendance awards</span><span>{fmt(settle.totals.attendanceAwards)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>Internet subsidy</span><span>{fmt(settle.totals.internetSubsidy)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>TOTAL PAYOUT</span>
                        <span className={styles.orderId}>{fmt(settle.totals.totalPayout)}</span></div>
                      <div className={styles.orderRow}><span className={styles.orderKey}>COSMOS net (paid − payout)</span><span>{fmt(settle.net)}</span></div>
                    </div>

                    {settle.perRep.map((p) => (
                      <div key={p.rep} className={styles.detailCard} style={{ marginTop: 12 }}>
                        <p className={styles.itemStrong}>{p.rep} — TOTAL PAY: {fmt(p.totalPay)}</p>
                        <p className={styles.item}>Paid orders: {p.paidOrders}/{p.orders} ({fmt(p.orderAmount)}) → commission {fmt(p.commission)}</p>
                        <p className={styles.item}>Hours: {Number(p.hours).toFixed(1)}h over {p.daysWorked} days → {fmt(p.hoursPay)}</p>
                        <p className={styles.item}>Holiday days: {p.holidayDays} → bonus {fmt(p.holidayBonus)}</p>
                        <p className={styles.item}>Attendance award: {fmt(p.attendanceAward)} · Internet subsidy: {fmt(p.internetSubsidy)}</p>
                      </div>
                    ))}
                  </>
                ) : null}
              </section>

              {/* ---------- orders ledger ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>ORDERS (LATEST {orders.length}) — mark PAID when money arrives; commission counts PAID orders only</div>
                {orders.map((o) => (
                  <div key={o.id} className={styles.detailCard} style={{ marginBottom: 10 }}>
                    <p className={styles.itemStrong}>{o.id} — {o.currency} {fmt(o.amount)} — {o.status}</p>
                    <p className={styles.item}>{o.created} · {o.method.toUpperCase()} · rep: {o.rep || '—'} · {o.service || 'custom'}</p>
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
