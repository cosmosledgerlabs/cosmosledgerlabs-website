import Head from 'next/head'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t } from '../lib/i18n'
import styles from '../styles/Legal.module.css'

const UPDATED = '2026-09-09'

const SECTIONS = [
  {
    h: { en: 'HOW PAYMENT WORKS', zh: '付款方式說明' },
    body: [
      {
        en: 'All work is performed under a written agreement and billed by official invoice issued by COSMOS Ledger Labs Inc. Fees are fixed per project and stated in writing before work begins. Payment schedules (deposit and milestones, if any) are set out in the agreement and on the invoice.',
        zh: '所有工作均依據書面協議執行，並由 COSMOS Ledger Labs Inc. 開立正式發票收款。費用依專案固定計算，並於開工前以書面確認。付款時程（如有訂金與里程碑付款）以協議及發票所載為準。',
      },
    ],
  },
  {
    h: { en: 'ACCEPTED PAYMENT METHODS', zh: '接受的付款方式' },
    boxed: true,
    body: [
      {
        en: 'We accept payment by bank wire transfer, in USDT (stablecoin), and — within Canada — by Interac e-Transfer. For your security, payment details are not displayed publicly on this website: they are provided when you generate a payment order on our Pay page, or on the official invoice you receive from\ninfo@cosmosledgerlabs.com.',
        zh: '我們接受銀行電匯與 USDT（穩定幣）付款，加拿大境內亦可使用 Interac e-Transfer（電郵轉帳）。為安全起見，本網站不公開顯示付款資料：付款資料將於您在付款下單頁面產生訂單後提供，或載於您從 info@cosmosledgerlabs.com 收到的正式發票上。',
      },
    ],
  },
]

const NEVER = [
  {
    en: 'We never send payment details through chat apps, social media, or unsolicited email.',
    zh: '我們絕不會透過聊天軟體、社群媒體或未經預期的電子郵件傳送付款資料。',
  },
  {
    en: 'We never ask you to send USDT or any cryptocurrency to a wallet address received in a chat message or social media post. A USDT address is valid only when it appears on an official invoice from\ninfo@cosmosledgerlabs.com.',
    zh: '我們絕不會要求您將 USDT 或任何加密貨幣轉入以聊天訊息或社群貼文提供的錢包地址。USDT 收款地址僅在 info@cosmosledgerlabs.com 寄出的正式發票上載明方為有效。',
  },
  {
    en: 'We never receive or hold client or investor funds, and we never charge success fees or take a percentage of funds raised.',
    zh: '我們絕不收取或保管客戶及投資人資金，絕不收取成功費，也不抽取募集資金的任何比例。',
  },
]

const VERIFY_LINES = [
  {
    en: 'Valid payment details come from only two places: a payment order you generate yourself on this website, and official invoices sent from\ninfo@cosmosledgerlabs.com.',
    zh: '有效的付款資料僅來自兩處：您親自在本網站產生的付款訂單，以及由 info@cosmosledgerlabs.com 寄出的正式發票。',
  },
  {
    en: 'Cryptocurrency transfers cannot be reversed — confirm any USDT address with us by email before sending.',
    zh: '加密貨幣轉帳無法撤銷——傳送 USDT 前請先以電子郵件向我們核對收款地址。',
  },
  {
    en: 'A payment request from any other source is fraudulent: do not pay, and forward it to info@cosmosledgerlabs.com.',
    zh: '來自任何其他來源的付款要求均屬詐騙：請勿付款，並將其轉寄至 info@cosmosledgerlabs.com。',
  },
]

/* Marked lines in the verify card (2026-09-21): on phones, justified text left
   big gaps between words. Instead of one fixed size (which only suits one screen
   width), each marked line tries its normal size and, only if needed, steps down
   a little until every line fills the width with close word spacing. Whole words
   only; nothing changes on screens 768px and wider, or in Chinese. */
const FIT_DROP = 2       // shrink at most 2px below the normal size
const FIT_STEP = 0.25
const FIT_OK = 2         // widest allowed gap = 2 normal spaces

function worstGap(el) {
  const tn = el.firstChild
  if (!tn || tn.nodeType !== 3) return 0
  const probe = document.createElement('span')
  probe.textContent = ' '
  probe.style.whiteSpace = 'pre'
  el.appendChild(probe)
  const space = probe.getBoundingClientRect().width || 1
  el.removeChild(probe)
  const rects = []
  let pos = 0
  tn.textContent.split(' ').forEach((w) => {
    if (w.length) {
      const r = document.createRange()
      r.setStart(tn, pos)
      r.setEnd(tn, pos + w.length)
      const rs = r.getClientRects()
      if (rs.length) rects.push(rs[0])
    }
    pos += w.length + 1
  })
  if (rects.length < 2) return 0
  const lastTop = rects[rects.length - 1].top
  let worst = 0
  for (let i = 1; i < rects.length; i++) {
    const sameLine = Math.abs(rects[i].top - rects[i - 1].top) < 2
    const onLastLine = Math.abs(rects[i].top - lastTop) < 2
    if (sameLine && !onLastLine) {
      worst = Math.max(worst, (rects[i].left - rects[i - 1].right) / space)
    }
  }
  return worst
}

function fitLine(el, active) {
  if (!el) return
  el.style.fontSize = ''
  if (!active || window.innerWidth >= 768) return
  const base = parseFloat(window.getComputedStyle(el).fontSize)
  if (!base) return
  let best = base
  let bestGap = Infinity
  for (let size = base; size >= base - FIT_DROP - 0.001; size -= FIT_STEP) {
    el.style.fontSize = size + 'px'
    const g = worstGap(el)
    if (g <= FIT_OK) return
    if (g < bestGap) { bestGap = g; best = size }
  }
  el.style.fontSize = best + 'px'
}

const FIT_LINES = [1, 2]   // "Cryptocurrency transfers…" and "A payment request…"

const withEmailLine = (text, cls) => {
  const i = text.indexOf('\n')
  if (i === -1) return text
  return (<>{text.slice(0, i)}{'\n'}<span className={cls}>{text.slice(i + 1)}</span></>)
}

export default function Payment() {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''
  const fitRefs = useRef([])

  useEffect(() => {
    const run = () => fitRefs.current.forEach((el) => fitLine(el, !isZh))
    run()
    let t
    const onResize = () => { clearTimeout(t); t = setTimeout(run, 100) }
    window.addEventListener('resize', onResize)
    try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(run) } catch (e) {}
    const late = setTimeout(run, 600)
    return () => {
      clearTimeout(t)
      clearTimeout(late)
      window.removeEventListener('resize', onResize)
    }
  }, [isZh])

  return (
    <>
      <Head>
        <title>{isZh ? '付款 — COSMOS Ledger Labs' : 'Payment — COSMOS Ledger Labs'}</title>
        <meta name="description" content={isZh
          ? 'COSMOS Ledger Labs Inc. 的發票與收款方式說明，以及如何辨識詐騙付款要求。'
          : 'How COSMOS Ledger Labs Inc. invoices and accepts payment, and how to recognise fraudulent payment requests.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/payment" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content={isZh ? '付款 — COSMOS Ledger Labs' : 'Payment — COSMOS Ledger Labs'} />
        <meta property="og:description" content={isZh ? 'COSMOS Ledger Labs Inc. 的發票與收款方式說明。' : 'How COSMOS Ledger Labs Inc. invoices and accepts payment.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/payment" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content={isZh ? 'zh_TW' : 'en_CA'} />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.main}>

          <h1 className={styles.title}>{isZh ? '付款' : 'PAYMENT'}</h1>
          <div className={styles.updated}>{t('legal', 'updated', lang)} {UPDATED}</div>

          {isZh && <p className={styles.prevail}>{t('legal', 'prevail', lang)}</p>}

          {SECTIONS.map((s) => (
            <section key={s.h.en} className={styles.section}>
              <h2 className={styles.h2}>{L(s.h)}</h2>
              {s.boxed ? (
                <div className={styles.card}>
                  {s.body.map((p) => (
                    <p key={p.en} className={styles.body}>{withEmailLine(L(p), styles.emailLine)}</p>
                  ))}
                </div>
              ) : (
                s.body.map((p) => (
                  <p key={p.en} className={styles.body}>{withEmailLine(L(p), styles.emailLine)}</p>
                ))
              )}
            </section>
          ))}

          <section className={styles.section}>
            <div className={styles.card}>
              <p className={styles.body}>
                {isZh
                  ? '準備付款？在付款下單頁面選擇金額與付款方式，即可產生附訂單編號的付款資料。'
                  : 'Ready to pay? Generate a payment order with your amount, method and order number on the Pay page.'}
              </p>
              <p className={styles.strong}>
                <Link href="/pay" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {isZh ? '前往付款下單頁面 →' : 'GENERATE A PAYMENT ORDER →'}
                </Link>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>{isZh ? '防詐騙警示' : 'FRAUD WARNING'}</h2>
            <div className={styles.warnList}>
              {NEVER.map((p) => (
                <p key={p.en} className={styles.strong}>× {withEmailLine(L(p), styles.emailLine)}</p>
              ))}
            </div>
            <div className={styles.card}>
              {VERIFY_LINES.map((line, i) => (
                <p className={styles.body} key={i} ref={FIT_LINES.includes(i) ? (el) => { fitRefs.current[FIT_LINES.indexOf(i)] = el } : undefined}>{L(line)}</p>
              ))}
              <div className={styles.email}>✉ info@cosmosledgerlabs.com</div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
