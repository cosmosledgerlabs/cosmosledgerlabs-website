import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang } from '../lib/i18n'
import styles from '../styles/TeamPay.module.css'

/* /team-pay — INTERNAL payroll & commission calculator.
   Not linked from the nav. noindex. Data stays in THIS browser (localStorage).
   Commission: each order is credited to one agent; commission = amount x rate (default 1%).
   Monthly pay = base + commission + holiday bonus (rate x holiday days)
                 + perfect-attendance bonus + internet subsidy. */

const KEY = 'cll_teampay_v1'

/* ================================================================
   PASSCODE — CHANGE THIS LINE BEFORE UPLOADING, then keep it secret.
   Letters/numbers, no spaces. This is a privacy curtain, not bank-grade
   security: your DATA is never on the server, but a technically skilled
   person could bypass this screen. Combined with the secret URL it is
   sufficient against clients and casual visitors.
   ================================================================ */
const PASSCODE = 'COSMOS-2026'

const T = {
  title: { en: 'TEAM PAY', zh: '團隊薪酬' },
  gateHead: { en: 'ENTER PASSCODE', zh: '請輸入通行碼' },
  gateBtn: { en: 'UNLOCK', zh: '解鎖' },
  gateErr: { en: 'Wrong passcode.', zh: '通行碼錯誤。' },
  sImport: { en: '03A — IMPORT FROM EMAIL', zh: '03A — 由郵件匯入' },
  impHint: { en: 'Paste the order email body below — order number, amount and agent code are read automatically.', zh: '將訂單郵件內文貼於下方——訂單編號、金額與客服編號將自動辨識。' },
  impConfirm: { en: '✓ CONFIRM & ADD ORDER', zh: '✓ 確認並新增訂單' },
  impClear: { en: 'CLEAR', zh: '清除' },
  impNoWorker: { en: 'code has no matching worker — choose:', zh: '編號無對應人員——請選擇：' },
  impDup: { en: 'already recorded — duplicate blocked', zh: '已登記過——已阻止重複' },
  impNone: { en: 'nothing recognized yet', zh: '尚未辨識到內容' },
  wCode: { en: 'Code (e.g. CS-01)', zh: '編號（如 CS-01）' },
  metaTitle: { en: 'Team Pay — COSMOS Ledger Labs', zh: '團隊薪酬 — COSMOS Ledger Labs' },
  internal: {
    en: 'INTERNAL PAGE — data is saved only in this browser on this device. Keep this URL private.',
    zh: '內部頁面——資料僅儲存於本裝置的瀏覽器。請勿外流此網址。',
  },
  sRates: { en: '01 — RATES', zh: '01 — 費率設定' },
  commission: { en: 'Commission % per order', zh: '每單佣金 %' },
  holidayRate: { en: 'Holiday bonus / day (USD)', zh: '節假日獎金／日（美元）' },
  attendance: { en: 'Perfect attendance bonus / month (USD)', zh: '全勤獎金／月（美元）' },
  internet: { en: 'Internet subsidy / month (USD)', zh: '網路補貼／月（美元）' },
  holidayDays: { en: 'Holiday days this month', zh: '本月節假日天數' },
  sWorkers: { en: '02 — CUSTOMER SERVICE WORKERS', zh: '02 — 客服人員' },
  wName: { en: 'Name', zh: '姓名' },
  wBase: { en: 'Base / month (USD)', zh: '底薪／月（美元）' },
  wFull: { en: 'Full-time', zh: '全職' },
  wPerfect: { en: 'Perfect attendance', zh: '全勤' },
  addWorker: { en: '+ ADD WORKER', zh: '+ 新增人員' },
  remove: { en: 'REMOVE', zh: '移除' },
  sOrders: { en: '03 — ORDERS', zh: '03 — 訂單' },
  oDate: { en: 'Date', zh: '日期' },
  oWorker: { en: 'Worker', zh: '客服' },
  oAmount: { en: 'Order amount (USD)', zh: '訂單金額（美元）' },
  oRef: { en: 'Order no. (optional)', zh: '訂單編號（選填）' },
  addOrder: { en: '+ ADD ORDER', zh: '+ 新增訂單' },
  oCommission: { en: 'Commission', zh: '佣金' },
  sMonth: { en: '04 — MONTHLY SUMMARY', zh: '04 — 月度結算' },
  month: { en: 'Month', zh: '月份' },
  colOrders: { en: 'Orders', zh: '單數' },
  colSales: { en: 'Sales', zh: '銷售額' },
  colCommission: { en: 'Commission', zh: '佣金' },
  colBase: { en: 'Base', zh: '底薪' },
  colHoliday: { en: 'Holiday', zh: '節假日' },
  colAttend: { en: 'Attendance', zh: '全勤' },
  colNet: { en: 'Internet', zh: '網路' },
  colTotal: { en: 'TOTAL', zh: '合計' },
  grand: { en: 'GRAND TOTAL', zh: '總計' },
  recordPay: { en: 'RECORD PAYMENT', zh: '記錄發薪' },
  sPayments: { en: '05 — PAYMENT RECORDS', zh: '05 — 發薪紀錄' },
  paidOn: { en: 'Paid', zh: '發放日' },
  exportCsv: { en: 'EXPORT CSV', zh: '匯出 CSV' },
  noWorkers: { en: 'Add a worker to begin.', zh: '請先新增人員。' },
  noPay: { en: 'No payments recorded yet.', zh: '尚無發薪紀錄。' },
  note: {
    en: 'Part-time workers receive commission only (monthly items apply to full-time). Figures are internal references; payslips and agreements govern.',
    zh: '兼職僅計佣金（月度項目僅適用全職）。本頁數字為內部參考；以薪資單與協議為準。',
  },
}

const todayStr = () => new Date().toISOString().slice(0, 10)
const thisMonth = () => todayStr().slice(0, 7)
const money = (n) => 'US$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase()

const DEFAULTS = {
  rates: { commissionPct: 1, holidayPerDay: 5, attendanceBonus: 50, internetSubsidy: 30, holidayDays: 0 },
  workers: [],
  orders: [],
  payments: [],
}

export default function TeamPay() {
  const { lang } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  const [db, setDb] = useState(DEFAULTS)
  const [loaded, setLoaded] = useState(false)
  const [month, setMonth] = useState(thisMonth())
  const [nw, setNw] = useState({ name: '', code: '', base: '', fullTime: true })
  const [pass, setPass] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [gateErr, setGateErr] = useState(false)
  const [paste, setPaste] = useState('')
  const [impWorker, setImpWorker] = useState('')
  const [no, setNo] = useState({ date: todayStr(), workerId: '', amount: '', ref: '' })

  useEffect(() => {
    try { if (window.sessionStorage.getItem(KEY + '_ok') === '1') setUnlocked(true) } catch (e) { /* ignore */ }
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) setDb({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch (e) { /* fresh start */ }
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (!loaded) return
    try { window.localStorage.setItem(KEY, JSON.stringify(db)) } catch (e) { /* storage unavailable */ }
  }, [db, loaded])

  const setRate = (k, v) => setDb((d) => ({ ...d, rates: { ...d.rates, [k]: v === '' ? '' : Number(v) } }))
  const r = (k) => Number(db.rates[k]) || 0

  const addWorker = () => {
    const name = nw.name.trim()
    if (!name) return
    setDb((d) => ({ ...d, workers: [...d.workers, { id: uid(), name, code: (nw.code || '').trim().toUpperCase(), base: Number(nw.base) || 0, fullTime: !!nw.fullTime, perfect: {} }] }))
    setNw({ name: '', code: '', base: '', fullTime: true })
  }
  const removeWorker = (id) => setDb((d) => ({ ...d, workers: d.workers.filter((w) => w.id !== id) }))
  const togglePerfect = (id) => setDb((d) => ({
    ...d,
    workers: d.workers.map((w) => w.id === id ? { ...w, perfect: { ...w.perfect, [month]: !w.perfect[month] } } : w),
  }))

  const addOrder = () => {
    const amt = Number(no.amount)
    if (!no.workerId || !amt || amt <= 0 || !no.date) return
    setDb((d) => ({ ...d, orders: [{ id: uid(), date: no.date, workerId: no.workerId, amount: amt, ref: no.ref.trim() }, ...d.orders] }))
    setNo({ date: no.date, workerId: no.workerId, amount: '', ref: '' })
  }
  const removeOrder = (id) => setDb((d) => ({ ...d, orders: d.orders.filter((o) => o.id !== id) }))

  const monthOrders = useMemo(() => db.orders.filter((o) => o.date.slice(0, 7) === month), [db.orders, month])

  const summary = useMemo(() => db.workers.map((w) => {
    const mine = monthOrders.filter((o) => o.workerId === w.id)
    const sales = mine.reduce((s, o) => s + o.amount, 0)
    const commission = sales * r('commissionPct') / 100
    const holiday = w.fullTime ? r('holidayDays') * r('holidayPerDay') : 0
    const attend = w.fullTime && w.perfect[month] ? r('attendanceBonus') : 0
    const net = w.fullTime ? r('internetSubsidy') : 0
    const base = w.fullTime ? w.base : 0
    return { w, count: mine.length, sales, commission, holiday, attend, net, base, total: base + commission + holiday + attend + net }
  }), [db.workers, monthOrders, db.rates, month])

  const grand = summary.reduce((s, x) => s + x.total, 0)

  const recordPayment = (row) => {
    setDb((d) => ({ ...d, payments: [{ id: uid(), month, workerId: row.w.id, name: row.w.name, amount: Math.round(row.total * 100) / 100, paidOn: todayStr() }, ...d.payments] }))
  }
  const removePayment = (id) => setDb((d) => ({ ...d, payments: d.payments.filter((p) => p.id !== id) }))

  const tryUnlock = () => {
    if (pass === PASSCODE) {
      setUnlocked(true)
      setGateErr(false)
      try { window.sessionStorage.setItem(KEY + '_ok', '1') } catch (e) { /* ignore */ }
    } else {
      setGateErr(true)
    }
  }

  const parsed = useMemo(() => {
    const t = paste || ''
    const ref = (t.match(/Order number:\s*([A-Z0-9-]+)/i) || [])[1] || ''
    const amtM = t.match(/Amount payable:\s*(USD|CAD)?\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/i)
    const currency = amtM && amtM[1] ? amtM[1].toUpperCase() : 'USD'
    const amount = amtM ? Number(amtM[2].replace(/,/g, '')) : 0
    const code = ((t.match(/Customer service code:\s*([A-Z0-9-]+)/i) || [])[1] || '').toUpperCase()
    const matched = code ? db.workers.find((w) => (w.code || '').toUpperCase() === code) : null
    const dup = ref ? db.orders.some((o) => o.ref === ref) : false
    return { ref, amount, currency, code, matched, dup, any: !!(ref || amount || code) }
  }, [paste, db.workers, db.orders])

  const confirmImport = () => {
    const workerId = parsed.matched ? parsed.matched.id : impWorker
    if (!workerId || !parsed.amount || parsed.dup) return
    setDb((d) => ({ ...d, orders: [{ id: uid(), date: todayStr(), workerId, amount: parsed.amount, ref: parsed.ref + (parsed.currency === 'CAD' ? ' (CAD)' : '') }, ...d.orders] }))
    setPaste('')
    setImpWorker('')
  }

  const exportCsv = () => {
    const head = 'month,worker,orders,sales_usd,commission_usd,base_usd,holiday_usd,attendance_usd,internet_usd,total_usd'
    const rows = summary.map((x) => [month, x.w.name, x.count, x.sales, x.commission.toFixed(2), x.base, x.holiday, x.attend, x.net, x.total.toFixed(2)].join(','))
    const pays = ['', 'payments:', 'month,worker,amount_usd,paid_on', ...db.payments.map((p) => [p.month, p.name, p.amount, p.paidOn].join(','))]
    const blob = new Blob([[head, ...rows, ...pays].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'cosmos-team-pay-' + month + '.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const workerName = (id) => (db.workers.find((w) => w.id === id) || {}).name || '—'

  return (
    <>
      <Head>
        <title>{L(T.metaTitle)}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Nav />
      <main className={styles.main}>
        <h1 className={styles.title}>{L(T.title)}</h1>
        {!unlocked ? (
          <div className={styles.gate}>
            <div className={styles.tag}>{L(T.gateHead)}</div>
            <div>
              <input className={styles.gateInput} type="password" value={pass} autoFocus
                     onChange={(e) => { setPass(e.target.value); setGateErr(false) }}
                     onKeyDown={(e) => { if (e.key === 'Enter') tryUnlock() }} />
            </div>
            <div className={styles.gateErr}>{gateErr ? L(T.gateErr) : ''}</div>
            <button className={styles.btn} onClick={tryUnlock}>{L(T.gateBtn)}</button>
          </div>
        ) : (
        <>
        <p className={styles.internal}>{L(T.internal)}</p>

        <div className={styles.tag}>{L(T.sRates)}</div>
        <div className={styles.rateGrid}>
          {[['commissionPct', T.commission], ['holidayPerDay', T.holidayRate], ['attendanceBonus', T.attendance], ['internetSubsidy', T.internet], ['holidayDays', T.holidayDays]].map(([k, label]) => (
            <label key={k} className={styles.rateItem}>
              <span className={styles.rateLabel}>{L(label)}</span>
              <input className={styles.input} type="number" min="0" step="any" value={db.rates[k]}
                     onChange={(e) => setRate(k, e.target.value)} />
            </label>
          ))}
        </div>

        <div className={styles.tag}>{L(T.sWorkers)}</div>
        <div className={styles.row}>
          <input className={styles.input} placeholder={L(T.wName)} value={nw.name}
                 onChange={(e) => setNw({ ...nw, name: e.target.value })} />
          <input className={styles.input} placeholder={L(T.wCode)} value={nw.code}
                 onChange={(e) => setNw({ ...nw, code: e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase() })} />
          <input className={styles.input} type="number" min="0" placeholder={L(T.wBase)} value={nw.base}
                 onChange={(e) => setNw({ ...nw, base: e.target.value })} />
          <label className={styles.check}><input type="checkbox" checked={nw.fullTime}
                 onChange={(e) => setNw({ ...nw, fullTime: e.target.checked })} /> {L(T.wFull)}</label>
          <button className={styles.btn} onClick={addWorker}>{L(T.addWorker)}</button>
        </div>
        {db.workers.length === 0 && <p className={styles.muted}>{L(T.noWorkers)}</p>}
        {db.workers.map((w) => (
          <div key={w.id} className={styles.kv}>
            <span className={styles.kvKey}>{w.name}{w.code ? ' · ' + w.code : ''}{w.fullTime ? '' : ' · PT'}</span>
            <span className={styles.kvVal}>
              {w.fullTime ? money(w.base) + ' / mo' : L(T.oCommission) + ' only'}
              <label className={styles.check}><input type="checkbox" checked={!!w.perfect[month]}
                     onChange={() => togglePerfect(w.id)} /> {L(T.wPerfect)} ({month})</label>
              <button className={styles.btnSmall} onClick={() => removeWorker(w.id)}>{L(T.remove)}</button>
            </span>
          </div>
        ))}

        <div className={styles.tag}>{L(T.sImport)}</div>
        <div className={styles.importBox}>
          <p className={styles.muted} style={{ margin: '0 0 8px' }}>{L(T.impHint)}</p>
          <textarea className={styles.textarea} value={paste} onChange={(e) => setPaste(e.target.value)}
                    placeholder={'Order number: CLL-...'} />
          <div className={styles.chips}>
            {!parsed.any ? <span className={styles.muted}>{L(T.impNone)}</span> : null}
            {parsed.ref ? <span className={styles.chip}>{L(T.oRef)} <b>{parsed.ref}</b></span> : null}
            {parsed.amount ? <span className={styles.chip}>{L(T.oAmount).replace(' (USD)', '')} <b>{parsed.currency} ${parsed.amount.toLocaleString('en-US')}</b></span> : null}
            {parsed.code ? (
              parsed.matched
                ? <span className={styles.chip}>{L(T.oWorker)} <b>{parsed.code} → {parsed.matched.name}</b></span>
                : <span className={styles.chipWarn}>{parsed.code} — {L(T.impNoWorker)}
                    <select className={styles.input} style={{ marginLeft: 8, padding: '4px 8px' }} value={impWorker}
                            onChange={(e) => setImpWorker(e.target.value)}>
                      <option value="">{L(T.oWorker)}…</option>
                      {db.workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </span>
            ) : null}
            {parsed.any && !parsed.code && !parsed.matched ? (
              <span className={styles.chipWarn}>{L(T.impNoWorker)}
                <select className={styles.input} style={{ marginLeft: 8, padding: '4px 8px' }} value={impWorker}
                        onChange={(e) => setImpWorker(e.target.value)}>
                  <option value="">{L(T.oWorker)}…</option>
                  {db.workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </span>
            ) : null}
            {parsed.dup ? <span className={styles.chipWarn}>{parsed.ref} — {L(T.impDup)}</span> : null}
          </div>
          <button className={styles.btn} disabled={!parsed.amount || parsed.dup || (!parsed.matched && !impWorker)}
                  onClick={confirmImport}>{L(T.impConfirm)}</button>
          <button className={styles.btnSmall} onClick={() => { setPaste(''); setImpWorker('') }}>{L(T.impClear)}</button>
        </div>
        <div className={styles.tag}>{L(T.sOrders)}</div>
        <div className={styles.row}>
          <input className={styles.input} type="date" value={no.date}
                 onChange={(e) => setNo({ ...no, date: e.target.value })} />
          <select className={styles.input} value={no.workerId}
                  onChange={(e) => setNo({ ...no, workerId: e.target.value })}>
            <option value="">{L(T.oWorker)}…</option>
            {db.workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <input className={styles.input} type="number" min="0" placeholder={L(T.oAmount)} value={no.amount}
                 onChange={(e) => setNo({ ...no, amount: e.target.value })} />
          <input className={styles.input} placeholder={L(T.oRef)} value={no.ref}
                 onChange={(e) => setNo({ ...no, ref: e.target.value })} />
          <button className={styles.btn} onClick={addOrder}>{L(T.addOrder)}</button>
        </div>
        {monthOrders.map((o) => (
          <div key={o.id} className={styles.kv}>
            <span className={styles.kvKey}>{o.date} · {workerName(o.workerId)}{o.ref ? ' · ' + o.ref : ''}</span>
            <span className={styles.kvVal}>
              {money(o.amount)} → {L(T.oCommission)} {money(o.amount * r('commissionPct') / 100)}
              <button className={styles.btnSmall} onClick={() => removeOrder(o.id)}>×</button>
            </span>
          </div>
        ))}

        <div className={styles.tag}>{L(T.sMonth)}</div>
        <div className={styles.row}>
          <label className={styles.rateLabel}>{L(T.month)}</label>
          <input className={styles.input} type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <button className={styles.btn} onClick={exportCsv}>{L(T.exportCsv)}</button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>{L(T.wName)}</th><th>{L(T.colOrders)}</th><th>{L(T.colSales)}</th><th>{L(T.colCommission)}</th>
              <th>{L(T.colBase)}</th><th>{L(T.colHoliday)}</th><th>{L(T.colAttend)}</th><th>{L(T.colNet)}</th>
              <th>{L(T.colTotal)}</th><th></th>
            </tr></thead>
            <tbody>
              {summary.map((x) => (
                <tr key={x.w.id}>
                  <td>{x.w.name}</td><td>{x.count}</td><td>{money(x.sales)}</td><td>{money(x.commission)}</td>
                  <td>{money(x.base)}</td><td>{money(x.holiday)}</td><td>{money(x.attend)}</td><td>{money(x.net)}</td>
                  <td className={styles.strong}>{money(x.total)}</td>
                  <td><button className={styles.btnSmall} onClick={() => recordPayment(x)}>{L(T.recordPay)}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.grand}><span>{L(T.grand)} — {month}</span><span>{money(grand)}</span></div>
        <p className={styles.muted}>{L(T.note)}</p>

        <div className={styles.tag}>{L(T.sPayments)}</div>
        {db.payments.length === 0 && <p className={styles.muted}>{L(T.noPay)}</p>}
        {db.payments.map((p) => (
          <div key={p.id} className={styles.kv}>
            <span className={styles.kvKey}>{p.month} · {p.name}</span>
            <span className={styles.kvVal}>{money(p.amount)} · {L(T.paidOn)} {p.paidOn}
              <button className={styles.btnSmall} onClick={() => removePayment(p.id)}>×</button></span>
          </div>
        ))}
      </>
        )}
      </main>
      <Footer />
    </>
  )
}
