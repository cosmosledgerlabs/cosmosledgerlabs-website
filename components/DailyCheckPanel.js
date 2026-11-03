/* components/DailyCheckPanel.js (added 2026-11-02)
   The DAILY CHECK panel — used on /admin (owner passcode) and /manage
   (manager login). For one day it totals every order and payment (overall,
   per customer service person and per payment channel) and checks that
   they agree, with the money received and with the bank / wallet figures
   typed in. Problems are shown with ⚠.
   props: headers    — request headers carrying the passcode or manager ticket
          refreshKey — change it to reload the day shown (e.g. after an order
                       is marked PAID elsewhere on the page) */

import { useEffect, useState } from 'react'
import styles from '../styles/Pay.module.css'

export function todayToronto() {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  } catch (e) {
    return new Date().toISOString().slice(0, 10)
  }
}

const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
/* "CAD $1,200.00 + USD $500.00" — the two currencies are never added together */
export const fmtCur = (t) => {
  const parts = []
  if (t.CAD || !t.USD) parts.push('CAD ' + fmt(t.CAD))
  if (t.USD) parts.push('USD ' + fmt(t.USD))
  return parts.join(' + ')
}
const OK = '#3ddc84'
const WARN = '#ffb347'

export default function DailyCheckPanel({ headers, refreshKey }) {
  const [day, setDay] = useState(todayToronto())
  const [daily, setDaily] = useState(null)
  const [dailyMsg, setDailyMsg] = useState('')
  const [stInput, setStInput] = useState({})       // channel → bank / wallet figure typed in
  const [busy, setBusy] = useState(false)
  const H = headers

  const showDaily = (d) => {
    setDaily(d)
    const s = {}
    ;(d.channels || []).forEach((c) => { s[c.channel] = c.statement === null ? '' : String(c.statement) })
    setStInput(s)
  }
  const loadDaily = async (d) => {
    const which = d || day
    setDailyMsg(''); setBusy(true)
    try {
      const r = await fetch('/api/daily-check?day=' + which, { headers: H })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setDailyMsg(j.error || 'Load failed — try again.'); return }
      showDaily(j)
    } catch (e) {
      setDailyMsg('Network error — try again.')
    } finally { setBusy(false) }
  }
  const saveStatement = async (channel) => {
    setDailyMsg(''); setBusy(true)
    try {
      const r = await fetch('/api/daily-check', { method: 'PUT', headers: H,
        body: JSON.stringify({ day: daily.day, channel, amount: stInput[channel] || '' }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setDailyMsg(j.error || 'Not saved — try again.'); return }
      setDailyMsg('Saved ✓')
    } catch (e) {
      setDailyMsg('Network error — try again.')
    } finally { setBusy(false) }
    await loadDaily(daily.day)
  }
  const downloadDaily = async () => {
    try {
      const r = await fetch('/api/daily-check?format=csv&day=' + daily.day, { headers: H })
      if (!r.ok) { setDailyMsg('Download failed.'); return }
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'cosmos-daily-check-' + daily.day + '.csv'
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e) { setDailyMsg('Download failed.') }
  }

  useEffect(() => { loadDaily(daily ? daily.day : day) }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={styles.section}>
      <div className={styles.stepTag}>DAILY CHECK — are the day's order count and amounts correct?</div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Day (Toronto time)</label>
          <input className={styles.input} type="date" value={day}
                 onChange={(e) => setDay(e.target.value)} />
        </div>
        <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
          <button type="button" className={styles.btnBig} disabled={busy || !day} onClick={() => loadDaily()}>
            {busy ? 'CHECKING…' : 'CHECK DAY →'}
          </button>
        </div>
      </div>
      {dailyMsg ? <div className={styles.hint}>{dailyMsg}</div> : null}

      {daily ? (
        <>
          <div className={styles.orderCard} style={{ marginTop: 14, borderColor: daily.status === 'ok' ? OK : WARN }}>
            <div className={styles.orderHead} style={{ color: daily.status === 'ok' ? OK : WARN }}>
              {daily.status === 'ok'
                ? '✅ ' + daily.day + ' — ALL CHECKS OK'
                : '⚠ ' + daily.day + ' — ' + daily.problems + ' PROBLEM' + (daily.problems === 1 ? '' : 'S') + ' FOUND'}
            </div>
            <div className={styles.orderRow}><span className={styles.orderKey}>Orders created</span>
              <span className={styles.orderId}>{daily.totals.all.count} · {fmtCur(daily.totals.all)}</span></div>
            <div className={styles.orderRow}><span className={styles.orderKey}>Paid</span>
              <span>{daily.totals.paid.count} · {fmtCur(daily.totals.paid)}</span></div>
            <div className={styles.orderRow}><span className={styles.orderKey}>Unpaid</span>
              <span>{daily.totals.unpaid.count} · {fmtCur(daily.totals.unpaid)}</span></div>
              {daily.totals.vouchers && daily.totals.vouchers.count ? (
                <div className={styles.orderRow}><span className={styles.orderKey}>Voucher discounts given</span>
                  <span>{daily.totals.vouchers.count} · {fmtCur(daily.totals.vouchers)}</span></div>
              ) : null}
          </div>

          <div className={styles.detailCard} style={{ marginTop: 12 }}>
            <p className={styles.itemStrong}>CHECKS</p>
            {daily.checks.map((c, i) => (
              <div key={i} style={{ marginTop: 6 }}>
                <p className={styles.item} style={{ color: c.ok === true ? OK : c.ok === false ? WARN : undefined }}>
                  {c.ok === true ? '✅ ' : c.ok === false ? '⚠ ' : '• '}{c.text}
                </p>
                {c.ok !== true && c.detail && c.detail.length ? (
                  <ul style={{ margin: '2px 0 0 18px', padding: 0 }}>
                    {c.detail.slice(0, 50).map((d, j) => <li key={j} className={styles.item}>{d}</li>)}
                    {c.detail.length > 50 ? <li className={styles.item}>… and {c.detail.length - 50} more (see the spreadsheet)</li> : null}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>

          <div className={styles.detailCard} style={{ marginTop: 12 }}>
            <p className={styles.itemStrong}>BY CUSTOMER SERVICE</p>
            {daily.byStaff.map((s, i) => (
              <p key={i} className={styles.item}>
                {s.name || '(no customer service)'} — {s.all.count} order{s.all.count === 1 ? '' : 's'} · {fmtCur(s.all)} · {s.paid.count} paid, {s.unpaid.count} unpaid
              </p>
            ))}
            {daily.byStaff.length === 0 ? <p className={styles.item}>No orders this day.</p> : null}
            {daily.byStaff.length ? (
              <p className={styles.itemStrong} style={{ marginTop: 6 }}>
                TOTAL — {daily.totals.all.count} orders · {fmtCur(daily.totals.all)}
              </p>
            ) : null}
          </div>

          <div className={styles.detailCard} style={{ marginTop: 12 }}>
            <p className={styles.itemStrong}>MONEY RECEIVED THIS DAY — compare with your bank / wallet</p>
            <p className={styles.item}>Type the total that arrived in your bank account or wallet for each channel, then SAVE. The system compares it with the payments it recorded.</p>
            {daily.channels.map((c) => (
              <div key={c.channel} style={{ marginTop: 10 }}>
                <p className={styles.item}>
                  <b>{c.label}</b> — {c.count} payment{c.count === 1 ? '' : 's'} · system: {c.currency} {fmt(c.received)}
                  {c.status === 'ok' ? <span style={{ color: OK }}> · ✅ matches bank / wallet</span> : null}
                  {c.status === 'mismatch' ? (
                    <span style={{ color: WARN }}> · ⚠ bank / wallet {c.currency} {fmt(c.statement)} — difference {c.difference > 0 ? '+' : '−'}{fmt(Math.abs(c.difference))}</span>
                  ) : null}
                  {c.status === 'not-entered' ? <span> · bank / wallet figure not entered</span> : null}
                </p>
                <div className={styles.row}>
                  <input className={styles.input} type="number" step="0.01" min="0" inputMode="decimal"
                         placeholder={'Bank / wallet total (' + c.currency + ')'}
                         aria-label={'Bank / wallet total for ' + c.label}
                         value={stInput[c.channel] || ''}
                         onChange={(e) => setStInput({ ...stInput, [c.channel]: e.target.value })} />
                  <button type="button" className={styles.btnGhost} disabled={busy}
                          onClick={() => saveStatement(c.channel)}>SAVE</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="button" className={styles.btnGhost} onClick={downloadDaily}>DOWNLOAD DAILY CHECK (CSV) ↓</button>
          </div>
        </>
      ) : null}
    </section>
  )
}
