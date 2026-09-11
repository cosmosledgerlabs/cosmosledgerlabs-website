import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang } from '../lib/i18n'
import styles from '../styles/Pay.module.css'

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const SERVICES = [
  { id: 'dashboards', name: { en: 'Dashboards & Interfaces', zh: '儀表板與介面' }, amount: 8000 },
  { id: 'websites', name: { en: 'Websites & Landing Pages', zh: '網站與登陸頁' }, amount: 3000 },
  { id: 'token', name: { en: 'Token Deployment', zh: '代幣部署' }, amount: 2500 },
  { id: 'claim', name: { en: 'Claim Portals', zh: '領取頁面' }, amount: 3000 },
  { id: 'data', name: { en: 'Data Integration & APIs', zh: '資料整合與 API' }, amount: 8000 },
  { id: 'frontends', name: { en: 'Contract Front-ends', zh: '合約前端介面' }, amount: 6000 },
  { id: 'custom', name: { en: 'Other / As quoted', zh: '其他／依報價' }, amount: 0 },
]

const METHODS = [
  { id: 'wire', name: { en: 'Bank Wire', zh: '銀行電匯' } },
  { id: 'emt', name: { en: 'Interac e-Transfer', zh: 'Interac e-Transfer' } },
  { id: 'usdt', name: { en: 'USDT', zh: 'USDT' } },
]

const PLANS = [
  { id: 'full', pct: 100, name: { en: 'Full amount', zh: '全額付款' } },
  { id: 'deposit', pct: 50, name: { en: '50% deposit', zh: '50% 訂金' } },
]

const WIRE = [
  { k: { en: 'Beneficiary', zh: '收款人' }, v: 'COSMOS LEDGER LABS INC.', copy: true },
  { k: { en: 'Beneficiary address', zh: '收款人地址' }, v: 'Suite 1400, 18 King St E, Toronto, ON M5C 1C4, Canada', copy: true },
  { k: { en: 'Bank', zh: '銀行' }, v: 'Royal Bank of Canada' },
  { k: { en: 'Bank address', zh: '銀行地址' }, v: '101 Dundas St W, Toronto, ON M5G 1C4, Canada', copy: true },
  { k: { en: 'Institution number', zh: '銀行代號' }, v: '003', copy: true },
  { k: { en: 'Transit number', zh: '分行代號' }, v: '02146', copy: true },
  { k: { en: 'Account number', zh: '帳號' }, v: '100-104-9', copy: true },
  { k: { en: 'SWIFT / BIC (international)', zh: 'SWIFT / BIC（國際匯款）' }, v: 'ROYCCAT2', copy: true },
]

const T2 = {
  metaTitle: { en: 'Pay — COSMOS Ledger Labs', zh: '付款下單 — COSMOS Ledger Labs' },
  title: { en: 'PAY', zh: '付款下單' },
  intro: {
    en: 'Generate a payment order in three steps: choose the service and amount, choose how you want to pay, and get the exact payment details with your order number.',
    zh: '三步產生付款訂單：選擇服務與金額、選擇付款方式，即可取得附訂單編號的完整付款資料。',
  },
  s1: { en: '01 — SERVICE & AMOUNT', zh: '01 — 服務與金額' },
  service: { en: 'Service', zh: '服務項目' },
  amount: { en: 'Project amount', zh: '專案金額' },
  currency: { en: 'Currency', zh: '幣別' },
  plan: { en: 'Payment', zh: '付款方案' },
  planHint: {
    en: 'Deposit and milestone percentages are set in your written agreement — use the split that matches your quote.',
    zh: '訂金與里程碑比例以您的書面協議為準——請依您的報價選擇對應的付款比例。',
  },
  payNow: { en: 'AMOUNT PAYABLE NOW', zh: '本次應付金額' },
  ofTotal: {
    en: (pct, total) => pct + '% of project amount ' + total,
    zh: (pct, total) => '為專案金額 ' + total + ' 的 ' + pct + '%',
  },
  s2: { en: '02 — PAYMENT METHOD', zh: '02 — 付款方式' },
  emtCadOnly: {
    en: 'Interac e-Transfer is available in CAD only. Switch the currency to CAD to use it.',
    zh: 'Interac e-Transfer 僅支援加幣（CAD）。請將幣別切換為 CAD 後使用。',
  },
  s3: { en: '03 — GENERATE ORDER', zh: '03 — 產生訂單' },
  btnGenerate: { en: 'GENERATE ORDER →', zh: '產生訂單 →' },
  needAmount: { en: 'Enter an amount above zero and choose a payment method first.', zh: '請先輸入大於零的金額並選擇付款方式。' },
  orderHead: { en: 'PAYMENT ORDER', zh: '付款訂單' },
  orderNo: { en: 'Order number', zh: '訂單編號' },
  orderService: { en: 'Service', zh: '服務項目' },
  orderPlan: { en: 'Payment', zh: '付款方案' },
  orderAmount: { en: 'Amount payable', zh: '應付金額' },
  orderMethod: { en: 'Method', zh: '付款方式' },
  wireHead: { en: 'PAY BY BANK WIRE', zh: '以銀行電匯付款' },
  wireNote: {
    en: 'Send the wire from your bank using the details below, and quote the order number in the wire reference / payment details field. Incoming international wires can take 1–5 business days.',
    zh: '請於您的銀行依下列資料辦理電匯，並在匯款附言／參考欄位註明訂單編號。國際電匯入帳可能需要 1–5 個工作天。',
  },
  wireRef: { en: 'Wire reference', zh: '匯款附言' },
  emtHead: { en: 'PAY BY INTERAC E-TRANSFER', zh: '以 Interac e-Transfer 付款' },
  emtNote: {
    en: 'In your Canadian online banking, send an Interac e-Transfer for the order amount to the email below, and put the order number in the transfer message. Autodeposit is enabled — no security question is needed and the payment is deposited automatically.',
    zh: '請在您的加拿大網路銀行中，將訂單金額以 Interac e-Transfer 傳送至下方電子郵件，並在轉帳留言中註明訂單編號。我們已啟用自動存入（Autodeposit）——無需設定安全問題，款項將自動入帳。',
  },
  emtTo: { en: 'Send to', zh: '收款電郵' },
  emtMsg: { en: 'Transfer message', zh: '轉帳留言' },
  usdtHead: { en: 'PAY IN USDT', zh: '以 USDT 付款' },
  usdtNote: {
    en: 'For your security, USDT deposit addresses are issued per order by email — never published on this website. Click the button below to request the address; we reply with the address and network. Verify the address by email before sending: cryptocurrency transfers cannot be reversed.',
    zh: '為了您的安全，USDT 收款地址依訂單以電子郵件提供——絕不公佈於本網站。請點擊下方按鈕索取地址，我們將回覆收款地址與鏈別。傳送前請以電子郵件核對地址：加密貨幣轉帳無法撤銷。',
  },
  amountLbl: { en: 'Amount', zh: '金額' },
  btnNotify: { en: '✉ EMAIL US THIS ORDER', zh: '✉ 以電子郵件通知我們此訂單' },
  btnUsdt: { en: '✉ REQUEST USDT ADDRESS', zh: '✉ 索取 USDT 收款地址' },
  btnCopy: { en: 'COPY', zh: '複製' },
  copied: { en: 'COPIED ✓', zh: '已複製 ✓' },
  btnCopyOrder: { en: 'COPY ORDER NUMBER', zh: '複製訂單編號' },
  btnReset: { en: 'START A NEW ORDER', zh: '建立新訂單' },
  help: {
    en: 'Questions about your order or payment? Email us and we reply directly:',
    zh: '對訂單或付款有任何疑問？歡迎來信，我們將直接回覆：',
  },
  legal: {
    en: 'An order number is a payment reference only — it is not an invoice or a contract. Work is performed under a written agreement, and final pricing is confirmed by written quote. If you do not yet have a quote, contact info@cosmosledgerlabs.com first.',
    zh: '訂單編號僅作為付款參考——不構成發票或合約。所有工作均依書面協議執行，最終價格以書面報價為準。若您尚未取得報價，請先聯絡 info@cosmosledgerlabs.com。',
  },
  prevail: {
    en: '',
    zh: '本頁為英文翻譯，僅供參考；如有歧異，以英文版為準。',
  },
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function makeOrderId() {
  const d = new Date()
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let tail = ''
  for (let i = 0; i < 4; i++) tail += chars[Math.floor(Math.random() * chars.length)]
  return 'CLL-' + ymd + '-' + tail
}

function fmtAmount(amount, currency) {
  const n = Number(amount) || 0
  const opts = Number.isInteger(n)
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  return currency + ' $' + n.toLocaleString('en-CA', opts)
}

/* Round to cents so 50% of odd amounts settles cleanly. */
function payable(amount, pct) {
  return Math.round((Number(amount) || 0) * pct) / 100
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (e) { /* fall through */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch (e) {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Pay() {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  const [serviceId, setServiceId] = useState('custom')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('CAD')
  const [planId, setPlanId] = useState('full')
  const [method, setMethod] = useState('')
  const [order, setOrder] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')

  const service = SERVICES.find((s) => s.id === serviceId) || SERVICES[SERVICES.length - 1]
  const plan = PLANS.find((p) => p.id === planId) || PLANS[0]
  const payNow = payable(amount, plan.pct)

  const pickService = (id) => {
    setServiceId(id)
    const s = SERVICES.find((x) => x.id === id)
    if (s && s.amount > 0) {
      setAmount(String(s.amount))
      setCurrency('USD')
      if (method === 'emt') setMethod('')
    }
  }

  const pickCurrency = (c) => {
    setCurrency(c)
    if (c === 'USD' && method === 'emt') setMethod('')
  }

  const canGenerate = payNow > 0 && !!method

  const generate = () => {
    if (!canGenerate) return
    setCopiedKey('')
    setOrder({
      id: makeOrderId(),
      serviceId,
      serviceName: service.name,
      baseAmount: Number(amount),
      planId: plan.id,
      planPct: plan.pct,
      planName: plan.name,
      amount: payable(amount, plan.pct),
      currency,
      method,
    })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    setOrder(null)
    setCopiedKey('')
    setMethod('')
  }

  const copy = async (key, text) => {
    const ok = await copyText(text)
    setCopiedKey(ok ? key : '')
    if (ok) setTimeout(() => setCopiedKey(''), 1800)
  }

  const CopyBtn = ({ id, text }) => (
    <button type="button" className={styles.btnCopyMini} onClick={() => copy(id, text)}>
      {copiedKey === id ? L(T2.copied) : L(T2.btnCopy)}
    </button>
  )

  const mailto = (subjectPrefix) => {
    if (!order) return '#'
    const methodName = (METHODS.find((m) => m.id === order.method) || {}).name
    const subject = subjectPrefix + ' ' + order.id + ' — ' + fmtAmount(order.amount, order.currency)
    const body = [
      'Order number: ' + order.id,
      'Service: ' + (order.serviceName ? order.serviceName.en : ''),
      'Payment: ' + (order.planName ? order.planName.en : '') + ' (' + order.planPct + '% of ' + fmtAmount(order.baseAmount, order.currency) + ')',
      'Amount payable: ' + fmtAmount(order.amount, order.currency),
      'Payment method: ' + (methodName ? methodName.en : order.method),
      '',
      'Sent from cosmosledgerlabs.com/pay',
    ].join('\n')
    return (
      'mailto:info@cosmosledgerlabs.com?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body)
    )
  }

  return (
    <>
      <Head>
        <title>{L(T2.metaTitle)}</title>
        <meta name="description" content={isZh
          ? '產生付款訂單，以銀行電匯、Interac e-Transfer 或 USDT 支付 COSMOS Ledger Labs Inc.。'
          : 'Generate a payment order and pay COSMOS Ledger Labs Inc. by bank wire, Interac e-Transfer or USDT.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/pay" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content={isZh ? '付款下單 — COSMOS Ledger Labs' : 'Pay — COSMOS Ledger Labs'} />
        <meta property="og:description" content={isZh ? '產生付款訂單，以銀行電匯、Interac e-Transfer 或 USDT 付款。' : 'Generate a payment order and pay by bank wire, Interac e-Transfer or USDT.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/pay" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content={isZh ? 'zh_TW' : 'en_CA'} />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.main}>

          <h1 className={styles.title}>{L(T2.title)}</h1>
          {isZh && <p className={styles.prevail}>{L(T2.prevail)}</p>}
          <p className={styles.intro}>{L(T2.intro)}</p>

          {!order ? (
            <>
              {/* ---------- step 1: service, amount & plan ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>{L(T2.s1)}</div>

                <label className={styles.label}>{L(T2.service)}</label>
                <div className={styles.serviceGrid}>
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={serviceId === s.id ? styles.chipOn : styles.chip}
                      onClick={() => pickService(s.id)}
                    >
                      {L(s.name)}
                      {s.amount > 0 ? <span className={styles.chipPrice}>US${s.amount.toLocaleString('en-CA')}</span> : null}
                    </button>
                  ))}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{L(T2.amount)}</label>
                    <div className={styles.amountWrap}>
                      <span className={styles.amountPrefix}>{currency === 'USD' ? 'US$' : 'C$'}</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="1"
                        step="1"
                        inputMode="decimal"
                        placeholder="6000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{L(T2.currency)}</label>
                    <div className={styles.segmented}>
                      {['CAD', 'USD'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={currency === c ? styles.segOn : styles.seg}
                          onClick={() => pickCurrency(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{L(T2.plan)}</label>
                    <div className={styles.segmented}>
                      {PLANS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={planId === p.id ? styles.segOn : styles.seg}
                          onClick={() => setPlanId(p.id)}
                        >
                          {L(p.name)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.totalCard}>
                  <span className={styles.totalLabel}>{L(T2.payNow)}</span>
                  <span className={styles.totalValue}>{payNow > 0 ? fmtAmount(payNow, currency) : '—'}</span>
                  {payNow > 0 && plan.pct < 100 ? (
                    <span className={styles.totalSub}>
                      {T2.ofTotal[lang] ? T2.ofTotal[lang](plan.pct, fmtAmount(amount, currency)) : T2.ofTotal.en(plan.pct, fmtAmount(amount, currency))}
                    </span>
                  ) : null}
                </div>
                {plan.pct < 100 ? <div className={styles.hint}>{L(T2.planHint)}</div> : null}
              </section>

              {/* ---------- step 2: method ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>{L(T2.s2)}</div>
                <div className={styles.methodGrid}>
                  {METHODS.map((m) => {
                    const disabled = m.id === 'emt' && currency === 'USD'
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={method === m.id ? styles.methodOn : styles.method}
                        disabled={disabled}
                        onClick={() => setMethod(m.id)}
                      >
                        {L(m.name)}
                      </button>
                    )
                  })}
                </div>
                {currency === 'USD' ? <div className={styles.hint}>{L(T2.emtCadOnly)}</div> : null}
              </section>

              {/* ---------- step 3: generate ---------- */}
              <section className={styles.section}>
                <div className={styles.stepTag}>{L(T2.s3)}</div>
                <button type="button" className={styles.btnBig} disabled={!canGenerate} onClick={generate}>
                  {L(T2.btnGenerate)}
                </button>
                {!canGenerate ? <div className={styles.hint}>{L(T2.needAmount)}</div> : null}
              </section>
            </>
          ) : (
            <>
              {/* ---------- order summary ---------- */}
              <section className={styles.section}>
                <div className={styles.orderCard}>
                  <div className={styles.orderHead}>{L(T2.orderHead)}</div>
                  <div className={styles.kvRow}>
                    <span className={styles.kvKey}>{L(T2.orderNo)}</span>
                    <span className={styles.kvVal + ' ' + styles.kvStrong}>
                      {order.id}
                      <CopyBtn id="orderNo" text={order.id} />
                    </span>
                  </div>
                  <div className={styles.kvRow}>
                    <span className={styles.kvKey}>{L(T2.orderService)}</span>
                    <span className={styles.kvVal}>{L(order.serviceName)}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span className={styles.kvKey}>{L(T2.orderPlan)}</span>
                    <span className={styles.kvVal}>
                      {L(order.planName)}
                      {order.planPct < 100 ? ' · ' + order.planPct + '% × ' + fmtAmount(order.baseAmount, order.currency) : ''}
                    </span>
                  </div>
                  <div className={styles.kvRow}>
                    <span className={styles.kvKey}>{L(T2.orderAmount)}</span>
                    <span className={styles.kvVal + ' ' + styles.kvStrong}>{fmtAmount(order.amount, order.currency)}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span className={styles.kvKey}>{L(T2.orderMethod)}</span>
                    <span className={styles.kvVal}>{L((METHODS.find((m) => m.id === order.method) || {}).name)}</span>
                  </div>
                </div>
              </section>

              {/* ---------- payment view ---------- */}
              {order.method === 'wire' ? (
                <section className={styles.section}>
                  <h2 className={styles.h2}>{L(T2.wireHead)}</h2>
                  <p className={styles.body}>{L(T2.wireNote)}</p>
                  <div className={styles.detailCard}>
                    {WIRE.map((r) => (
                      <div key={r.k.en} className={styles.kvRow}>
                        <span className={styles.kvKey}>{L(r.k)}</span>
                        <span className={styles.kvVal}>
                          {r.v}
                          {r.copy ? <CopyBtn id={'wire-' + r.k.en} text={r.v} /> : null}
                        </span>
                      </div>
                    ))}
                    <div className={styles.kvRow}>
                      <span className={styles.kvKey}>{L(T2.wireRef)}</span>
                      <span className={styles.kvVal + ' ' + styles.kvStrong}>
                        {order.id}
                        <CopyBtn id="wireRef" text={order.id} />
                      </span>
                    </div>
                  </div>
                  <a className={styles.btnBig} href={mailto('Wire payment order')}>{L(T2.btnNotify)}</a>
                </section>
              ) : null}

              {order.method === 'emt' ? (
                <section className={styles.section}>
                  <h2 className={styles.h2}>{L(T2.emtHead)}</h2>
                  <p className={styles.body}>{L(T2.emtNote)}</p>
                  <div className={styles.detailCard}>
                    <div className={styles.kvRow}>
                      <span className={styles.kvKey}>{L(T2.emtTo)}</span>
                      <span className={styles.kvVal}>
                        info@cosmosledgerlabs.com
                        <CopyBtn id="emtTo" text="info@cosmosledgerlabs.com" />
                      </span>
                    </div>
                    <div className={styles.kvRow}>
                      <span className={styles.kvKey}>{L(T2.amountLbl)}</span>
                      <span className={styles.kvVal}>{fmtAmount(order.amount, order.currency)}</span>
                    </div>
                    <div className={styles.kvRow}>
                      <span className={styles.kvKey}>{L(T2.emtMsg)}</span>
                      <span className={styles.kvVal + ' ' + styles.kvStrong}>
                        {order.id}
                        <CopyBtn id="emtMsg" text={order.id} />
                      </span>
                    </div>
                  </div>
                  <a className={styles.btnBig} href={mailto('e-Transfer payment order')}>{L(T2.btnNotify)}</a>
                </section>
              ) : null}

              {order.method === 'usdt' ? (
                <section className={styles.section}>
                  <h2 className={styles.h2}>{L(T2.usdtHead)}</h2>
                  <p className={styles.body}>{L(T2.usdtNote)}</p>
                  <div className={styles.detailCard}>
                    <div className={styles.kvRow}>
                      <span className={styles.kvKey}>{L(T2.amountLbl)}</span>
                      <span className={styles.kvVal}>{fmtAmount(order.amount, order.currency)}</span>
                    </div>
                    <div className={styles.kvRow}>
                      <span className={styles.kvKey}>{L(T2.orderNo)}</span>
                      <span className={styles.kvVal + ' ' + styles.kvStrong}>
                        {order.id}
                        <CopyBtn id="usdtNo" text={order.id} />
                      </span>
                    </div>
                  </div>
                  <a className={styles.btnBig} href={mailto('USDT address request — order')}>{L(T2.btnUsdt)}</a>
                </section>
              ) : null}

              <section className={styles.section}>
                <button type="button" className={styles.btnGhost} onClick={reset}>{L(T2.btnReset)}</button>
              </section>
            </>
          )}

          <p className={styles.help}>
            {L(T2.help)}{' '}
            <a href="mailto:info@cosmosledgerlabs.com">info@cosmosledgerlabs.com</a>
          </p>
          <p className={styles.legal}>{L(T2.legal)}</p>

        </div>
      </main>

      <Footer />
    </>
  )
}
