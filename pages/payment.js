import Head from 'next/head'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t } from '../lib/i18n'
import { lastUpdated } from '../lib/lastUpdated'
import { MailLink, linkMail } from '../lib/mail'
import styles from '../styles/Legal.module.css'

/* Backup date only. The date shown on the page is filled in automatically
   from GitHub (see lib/lastUpdated.js); this one is used only if GitHub
   cannot be reached when the site is built. */
const UPDATED = '2026-09-25'

const SECTIONS = [
  {
    h: { en: 'HOW PAYMENT WORKS', zh: '付款方式說明' },
    body: [
      {
        en: 'Project work is performed under a written agreement, with fees fixed in writing before work begins. Technical consulting is charged at the rates published on our Services page. Payment schedules (deposit and milestones, if any) are set out in the agreement, on the invoice, or in the payment order you generate.',
        zh: '專案工作依書面協議執行，費用於開工前以書面固定。技術諮詢依服務頁面公布的價格收費。付款時程（訂金與里程碑，如有）列於協議、發票或您產生的付款訂單中。',
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
    en: 'We never ask you to send USDT or any cryptocurrency to a wallet address received in a chat message or social media post. A USDT address is valid only when it is sent from\ninfo@cosmosledgerlabs.com — either in reply to your payment order, or on an official invoice.',
    zh: '我們絕不會要求您將 USDT 或任何加密貨幣轉至聊天訊息或社群貼文中取得的錢包地址。USDT 地址僅在由 info@cosmosledgerlabs.com 發出時有效——無論是回覆您的付款訂單，或列於正式發票上。',
  },
  {
    en: 'Other than fees for our own services, we never receive or hold funds for clients or investors, and we never charge success fees or take a percentage of funds raised.',
    zh: '除收取我們自身服務的費用外，我們絕不代客戶或投資人收取或保管資金，絕不收取成功費，也不抽取募集資金的任何比例。',
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
  if (!el.firstChild) return 0
  const probe = document.createElement('span')
  probe.textContent = ' '
  probe.style.whiteSpace = 'pre'
  el.appendChild(probe)
  const space = probe.getBoundingClientRect().width || 1
  el.removeChild(probe)
  const rects = []
  /* every text node, including the text inside the email link */
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let tn
  while ((tn = walker.nextNode())) {
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
  }
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
  if (i === -1) return linkMail(text)
  /* The email moves to its own line on phones only; on wider screens it stays
     on the same line as the words before it (2026-09-21). */
  const rest = linkMail(text.slice(i + 1))
  return (<>{linkMail(text.slice(0, i))} <br className={styles.phoneBr} />{cls ? <span className={cls}>{rest}</span> : rest}</>)
}

/* The two marked lines ("…official invoice from" and "…official invoices sent
   from"): on phones the email is shrunk just enough to stay on the same line
   as the words before it, so no empty gap is left at the end of the line
   (2026-09-22). */
function KeepEmail({ text, cls, phoneOnly }) {
  const prevRef = useRef(null)
  const unitRef = useRef(null)
  const mailRef = useRef(null)
  useEffect(() => {
    const fit = () => {
      const prev = prevRef.current, unit = unitRef.current, mail = mailRef.current
      if (!prev || !unit || !mail) return
      mail.style.fontSize = ''
      if (phoneOnly) {
        unit.style.whiteSpace = ''
        const para = unit.closest('p')
        if (para) para.style.fontSize = ''
      }
      if (window.innerWidth >= 768) return
      if (phoneOnly) {
        /* "from" + email stay together; this one paragraph and the email step
           down a little until no line is left with big gaps (phones only). */
        unit.style.whiteSpace = 'nowrap'
        const para = unit.closest('p')
        if (!para) return
        para.style.fontSize = ''
        const base = parseFloat(window.getComputedStyle(para).fontSize)
        let best = null
        for (let size = base; size >= base - FIT_DROP - 0.001; size -= FIT_STEP) {
          para.style.fontSize = size + 'px'
          for (let f = 1; f >= 0.8 - 0.001; f -= 0.02) {
            mail.style.fontSize = f + 'em'
            const g = worstGap(para)
            if (g <= FIT_OK) return
            if (!best || g < best.g) best = { g, size, f }
          }
        }
        para.style.fontSize = best.size + 'px'
        mail.style.fontSize = best.f + 'em'
        return
      }
      for (let f = 1; f >= 0.7; f -= 0.02) {
        mail.style.fontSize = f + 'em'
        if (Math.abs(unit.getBoundingClientRect().top - prev.getBoundingClientRect().top) < 2) return
      }
      mail.style.fontSize = ''
    }
    fit()
    window.addEventListener('resize', fit)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit)
    return () => window.removeEventListener('resize', fit)
  }, [text])
  const i = text.indexOf('\n')
  const before = text.slice(0, i)
  const w1 = before.lastIndexOf(' ')             // space before "from"
  const w2 = before.lastIndexOf(' ', w1 - 1)     // space before the word before "from"
  return (
    <>
      {linkMail(before.slice(0, w2 + 1))}
      <span ref={prevRef}>{before.slice(w2 + 1, w1)}</span>{' '}
      <span ref={unitRef} className={phoneOnly ? undefined : styles.mailKeep}>
        {before.slice(w1 + 1)}{' '}
        <span ref={mailRef} className={cls}>{linkMail(text.slice(i + 1))}</span>
      </span>
    </>
  )
}

/* phoneOnly: used for the ACCEPTED PAYMENT METHODS line ("…invoice you receive
   from"); the email is kept on the same line on phones only (WeChat, iPhone,
   Android) — on wider screens that line is left exactly as before (2026-09-22). */
const withEmailKept = (text, cls, phoneOnly) =>
  text.indexOf('\n') === -1 ? linkMail(text) : <KeepEmail text={text} cls={cls} phoneOnly={phoneOnly} />

/* "…forward it to info@cosmosledgerlabs.com." — the email is shown in cyan,
   matching the other emails in this box (English, 2026-09-22). */
const withCyanMail = (text) => {
  const i = text.indexOf('info@cosmosledgerlabs.com')
  if (i === -1) return text
  const end = i + 'info@cosmosledgerlabs.com'.length
  const dot = text.charAt(end) === '.' ? '.' : ''
  return (<>{text.slice(0, i)}<span className={styles.emailLine}><MailLink />{dot}</span>{text.slice(end + dot.length)}</>)
}

/* "Valid payment details come from only two places…" (English, 2026-09-24):
   phones only. The email on the last line is made smaller, step by step,
   until "from info@cosmosledgerlabs.com." fits on the same line as
   "…invoices sent". On narrower phones (e.g. iPhones, 390px) the paragraph
   text also steps down by up to 2px so the lines wrap the same way as on
   wider phones — same look on every phone, no big gaps. If a very small
   phone still cannot fit it, "from info@…" moves to its own line at normal
   size instead. Screens 768px and wider are unchanged. */
const MAIL_MIN = 0.7   // smallest email size allowed: 70% of the normal text
const PARA_DROP = 2    // paragraph shrinks at most 2px below its normal size
const LINE_OK = 3      // widest accepted gap in this paragraph = 3 normal spaces

function ShrinkEmailLine({ text }) {
  const prevRef = useRef(null)
  const unitRef = useRef(null)
  const mailRef = useRef(null)
  useEffect(() => {
    const fit = () => {
      const prev = prevRef.current, unit = unitRef.current, mail = mailRef.current
      if (!prev || !unit || !mail) return
      const para = unit.closest('p')
      mail.style.fontSize = ''
      unit.style.display = ''
      if (para) para.style.fontSize = ''
      if (window.innerWidth >= 768 || !para) return
      const sameLine = () => Math.abs(unit.getBoundingClientRect().top - prev.getBoundingClientRect().top) < 2
      const base = parseFloat(window.getComputedStyle(para).fontSize)
      /* Largest sizes first. Accept the first combination where the email fits
         and no line has big gaps; otherwise use the fitting combination with
         the smallest gaps. */
      let best = null
      for (let size = base; size >= base - PARA_DROP - 0.001; size -= 0.25) {
        para.style.fontSize = size + 'px'
        for (let f = 1; f >= MAIL_MIN - 0.001; f -= 0.02) {
          mail.style.fontSize = f + 'em'
          if (!sameLine()) continue
          const g = worstGap(para)
          if (g <= LINE_OK) return
          if (!best || g < best.g) best = { g, size, f }
          break
        }
      }
      if (best) {
        para.style.fontSize = best.size + 'px'
        mail.style.fontSize = best.f + 'em'
        return
      }
      para.style.fontSize = ''
      mail.style.fontSize = ''
      unit.style.display = 'block'
    }
    fit()
    window.addEventListener('resize', fit)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit)
    return () => window.removeEventListener('resize', fit)
  }, [text])
  const t = text.replace('\n', ' ')
  const k = t.lastIndexOf(' from ')
  if (k === -1) return withCyanMail(t)
  const before = t.slice(0, k)
  const w = before.lastIndexOf(' ')
  const email = t.slice(k + 6)
  return (
    <>
      {before.slice(0, w + 1)}
      <span ref={prevRef}>{before.slice(w + 1)}</span>{' '}
      <span ref={unitRef} style={{ whiteSpace: 'nowrap' }}>
        from <span ref={mailRef}>{withCyanMail(email)}</span>
      </span>
    </>
  )
}

export async function getStaticProps() {
  return { props: { updated: await lastUpdated('pages/payment.js', UPDATED) } }
}

export default function Payment({ updated }) {
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
          <div className={styles.updated}>{t('legal', 'updated', lang)} {updated || UPDATED}</div>

          {isZh && <p className={styles.prevail}>{t('legal', 'prevail', lang)}</p>}

          {SECTIONS.map((s) => (
            <section key={s.h.en} className={styles.section}>
              <h2 className={styles.h2}>{L(s.h)}</h2>
              {s.boxed ? (
                <div className={styles.card}>
                  {s.body.map((p) => (
                    <p key={p.en} className={styles.body}>{withEmailKept(L(p), styles.emailLine, true)}</p>
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
              {NEVER.map((p, n) => (
                <p key={p.en} className={styles.strong}>× {n === 1 ? withEmailKept(L(p), styles.emailLine) : withEmailLine(L(p), styles.emailLine)}</p>
              ))}
            </div>
            <div className={styles.card}>
              {VERIFY_LINES.map((line, i) => (
                <p className={styles.body} key={i} ref={FIT_LINES.includes(i) ? (el) => { fitRefs.current[FIT_LINES.indexOf(i)] = el } : undefined}>{i === 0 ? (isZh ? withEmailKept(L(line), styles.emailLine) : <ShrinkEmailLine text={L(line)} />) : (i === 2 && !isZh) ? withCyanMail(L(line)) : withEmailLine(L(line))}</p>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
