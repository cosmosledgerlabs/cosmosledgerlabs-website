import Head from 'next/head'
import { useEffect, useRef } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t } from '../lib/i18n'
import styles from '../styles/Services.module.css'

const SERVICES = [
  {
    n: '01',
    name: { en: 'DASHBOARDS & INTERFACES', zh: '儀表板與介面' },
    lead: {
      en: 'Custom dashboards that bring scattered on-chain and off-chain data into one view.',
      zh: '客製化儀表板，將分散的鏈上與鏈下資料整合到單一畫面。',
    },
    items: [
      { en: 'Holder counts and address distribution', zh: '持有人數量與地址分佈' },
      { en: 'Vesting and unlock progress', zh: '歸屬與解鎖進度' },
      { en: 'Treasury balances and transaction flow', zh: '金庫餘額與交易流向' },
      { en: 'Activity logs and audit trails', zh: '活動紀錄與稽核軌跡' },
      { en: 'Role-based permissions and approvals', zh: '角色權限與審批流程' },
      { en: 'Exportable reports', zh: '可匯出報表' },
    ],
    price: 'US$8,000',
    time: { en: '4–6 WEEKS', zh: '4–6 週' },
  },
  {
    n: '02',
    name: { en: 'WEBSITES & LANDING PAGES', zh: '網站與登陸頁' },
    lead: {
      en: 'Marketing sites, documentation and landing pages, built to be handed over to your team.',
      zh: '行銷網站、技術文件與登陸頁，建置後完整移交給您的團隊。',
    },
    items: [
      { en: 'Design and front-end build', zh: '設計與前端建置' },
      { en: 'Content structure and layout', zh: '內容架構與版面配置' },
      { en: 'Documentation and whitepaper pages', zh: '技術文件與白皮書頁面' },
      { en: 'Deployment and full source code handover', zh: '部署與完整原始碼移交' },
    ],
    price: 'US$3,800',
    time: { en: '4–6 WEEKS', zh: '4–6 週' },
  },
  {
    n: '03',
    name: { en: 'TOKEN DEPLOYMENT', zh: '代幣部署' },
    lead: {
      en: 'Technical execution and configuration using established, audited tooling. We configure — we do not sell, distribute or market your token.',
      zh: '使用成熟且已稽核的工具進行技術執行與設定。我們負責設定——不銷售、不分發、不行銷您的代幣。',
    },
    items: [
      { en: 'Token deployment (SPL / ERC-20)', zh: '代幣部署（SPL / ERC-20）' },
      { en: 'Metadata and on-chain identity', zh: '中繼資料與鏈上識別' },
      { en: 'Vesting and lock configuration', zh: '歸屬與鎖倉設定' },
      { en: 'Written parameter documentation', zh: '參數設定書面文件' },
      { en: 'Testnet rehearsal, then mainnet execution', zh: '測試網演練後再執行主網' },
    ],
    price: 'US$3,800',
    time: { en: '4–6 WEEKS', zh: '4–6 週' },
  },
  {
    n: '04',
    name: { en: 'CLAIM PORTALS', zh: '領取頁面' },
    lead: {
      en: 'Branded distribution interfaces where recipients connect a wallet and claim their allocation.',
      zh: '品牌化的分發介面，領取者連接錢包即可領取其配額。',
    },
    items: [
      { en: 'White-label UI under your own domain', zh: '白牌介面，架設於您自己的網域' },
      { en: 'Wallet connection and claim flow', zh: '錢包連接與領取流程' },
      { en: 'Recipient list handling', zh: '領取名單處理' },
      { en: 'Testnet rehearsal before launch', zh: '上線前測試網演練' },
    ],
    price: 'US$3,000',
    time: { en: '4–6 WEEKS', zh: '4–6 週' },
  },
  {
    n: '05',
    name: { en: 'DATA INTEGRATION & APIs', zh: '資料整合與 API' },
    lead: {
      en: 'Connect on-chain data to the systems your business already runs on.',
      zh: '將鏈上資料串接到您現有的營運系統。',
    },
    items: [
      { en: 'Indexing and data pipelines', zh: '索引與資料管線' },
      { en: 'APIs and webhooks', zh: 'API 與 webhook' },
      { en: 'Reporting and internal tooling', zh: '報表與內部工具' },
      { en: 'Monitoring setup', zh: '監控設定' },
    ],
    price: 'US$8,000',
    time: { en: '4–6 WEEKS', zh: '4–6 週' },
  },
  {
    n: '06',
    name: { en: 'CONTRACT FRONT-ENDS', zh: '合約前端介面' },
    lead: {
      en: 'Human-usable interfaces for the smart contracts you already have.',
      zh: '為您既有的智能合約打造一般人也能操作的介面。',
    },
    items: [
      { en: 'Interface design and build', zh: '介面設計與建置' },
      { en: 'Contract interaction layer', zh: '合約互動層' },
      { en: 'Transaction handling and error states', zh: '交易處理與錯誤狀態' },
    ],
    price: 'US$6,000',
    time: { en: '4–6 WEEKS', zh: '4–6 週' },
  },
  {
    n: '07',
    name: { en: 'TECHNICAL ADVISORY', zh: '技術顧問諮詢' },
    lead: {
      en: 'Direct technical consultation on your digital asset project, including website and development questions. Booked in 2-hour blocks.',
      zh: '針對您的數位資產專案提供直接技術諮詢，包括網站與開發相關問題。以 2 小時為單位預約。',
    },
    items: [
      { en: 'Architecture and technology choices', zh: '架構與技術選型' },
      { en: 'Website and development planning', zh: '網站與開發規劃' },
      { en: 'Review of existing builds and vendor work', zh: '既有成果與外包工作審閱' },
      { en: '2-hour minimum', zh: '最少 2 小時' },
    ],
    price: 'US$1,000',
    fixed: true,
    time: { en: 'PER 2 HOURS', zh: '每 2 小時' },
  },
  {
    n: '08',
    name: { en: 'UNLIMITED ADVISORY PACKAGE', zh: '無限諮詢套餐' },
    lead: {
      en: 'Unlimited technical consultation for one project, from kickoff to delivery, at a single fixed price.',
      zh: '單一專案不限次數技術諮詢，從啟動到交付，一次固定價格。',
    },
    items: [
      { en: 'No hourly limit for the covered project', zh: '所涵蓋專案不限時數' },
      { en: 'Website and development questions included', zh: '包含網站與開發相關問題' },
      { en: 'One project per package', zh: '每個套餐限一個專案' },
    ],
    price: 'US$2,000',
    fixed: true,
    time: { en: 'PER PROJECT', zh: '每個專案' },
  },
]

const PROCESS = [
  {
    n: '01',
    title: { en: 'SCOPE CALL', zh: '需求會議' },
    d: {
      en: 'Thirty minutes. We define exactly what is delivered and what is not.',
      zh: '三十分鐘。明確界定交付範圍與不包含的項目。',
    },
  },
  {
    n: '02',
    title: { en: 'FIXED QUOTE', zh: '固定報價' },
    d: {
      en: 'Written scope, fixed price, fixed timeline. Build work is never billed hourly, and scope does not creep.',
      zh: '書面範圍、固定價格、固定時程。建置工作不按小時計費，不擴張範圍。',
    },
  },
  {
    n: '03',
    title: { en: 'BUILD', zh: '建置' },
    d: {
      en: 'Weekly written updates. You see progress, not promises.',
      zh: '每週書面進度更新。您看到的是進度，不是承諾。',
    },
  },
  {
    n: '04',
    title: { en: 'HANDOVER', zh: '交付' },
    d: {
      en: 'Source code in a repository you own. All credentials transferred. No vendor lock-in.',
      zh: '原始碼存放於您擁有的程式碼庫。所有憑證移交。不綁定供應商。',
    },
  },
]

const EXCLUSIONS = [
  { en: 'Sell, distribute or market digital assets on behalf of clients', zh: '代客戶銷售、分發或行銷數位資產' },
  { en: 'Receive or hold client or investor funds', zh: '收取或保管客戶及投資人資金' },
  { en: 'Raise capital for clients or introduce investors', zh: '為客戶募集資金或引介投資人' },
  { en: 'Provide market making or liquidity services', zh: '提供造市或流動性服務' },
  { en: 'Arrange, promise or facilitate exchange listings', zh: '安排、承諾或促成交易所上架' },
  { en: 'Provide investment, legal, tax or accounting advice', zh: '提供投資、法律、稅務或會計建議' },
]

/* Straight right edge for the two short notes on this page (the fee box and
   the multi-chain note), English on phones only. Each line keeps its whole
   words; the leftover space at the end of a line is shared as a tiny amount
   between the letters and the rest between the words, so no gap gets large.
   Nothing else on the site is affected. */
function fitLines(el) {
  if (!el) return
  // If React has replaced the text (e.g. after a language switch), the plain
  // text is the new original; otherwise use the text saved before splitting.
  const fitted = el.dataset.fitText !== undefined && el.querySelector('span')
  const original = fitted ? el.dataset.fitText : el.textContent
  el.textContent = original
  delete el.dataset.fitText
  if (window.innerWidth > 480) return
  const cs = getComputedStyle(el)
  const fs = parseFloat(cs.fontSize)
  const words = original.replace(/\s+/g, ' ').trim().split(' ')
  el.dataset.fitText = original
  el.textContent = ''
  const spans = words.map((w, i) => {
    const s = document.createElement('span')
    s.textContent = w
    s.style.whiteSpace = 'nowrap' // keep words like "EVM-compatible" whole
    el.appendChild(s)
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '))
    return s
  })
  const lines = []
  let cur = []
  let top = null
  spans.forEach((s) => {
    const t = s.offsetTop
    if (top === null || Math.abs(t - top) < 3) cur.push(s.textContent)
    else { lines.push(cur); cur = [s.textContent] }
    top = t
  })
  lines.push(cur)
  const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
  const baseLs = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0
  el.textContent = ''
  lines.forEach((ln, i) => {
    const line = document.createElement('span')
    line.textContent = ln.join(' ')
    line.style.display = 'block'
    el.appendChild(line)
    if (i === lines.length - 1 || ln.length < 2) return
    line.style.display = 'inline-block'
    line.style.whiteSpace = 'nowrap'
    const natural = line.getBoundingClientRect().width
    const chars = line.textContent.length
    const ls = Math.max(0, Math.min(((avail - natural) * 0.65) / chars, 0.07 * fs))
    line.style.display = 'block'
    line.style.letterSpacing = (baseLs + ls).toFixed(3) + 'px'
    line.style.textAlign = 'justify'
    line.style.textAlignLast = 'justify'
  })
}

/* 2026-09-24: multi-chain note — English, phones only.
   Shown on exactly TWO lines with both edges straight: the note is split at
   the word boundary that gives the two most even lines, the text size is set
   so the longer line exactly fills the width, and the shorter line is spread
   to the same width (a little between the letters, the rest between the
   words). Words are never split. If the text would have to go below 9px,
   the note is simply shown as normal left-aligned text instead. */
function fitTwoLines(el) {
  if (!el) return
  if (el.dataset.fitText === undefined) el.dataset.fitText = el.textContent
  const original = el.dataset.fitText
  el.textContent = original
  el.style.fontSize = ''
  el.style.letterSpacing = ''
  el.style.wordSpacing = ''
  if (window.innerWidth > 480) return
  const words = original.replace(/\s+/g, ' ').trim().split(' ')
  if (words.length < 4) return
  const avail = el.clientWidth
  const probe = document.createElement('span')
  probe.style.whiteSpace = 'nowrap'
  el.textContent = ''
  el.appendChild(probe)
  const width = (str) => { probe.textContent = str; return probe.getBoundingClientRect().width }
  let best = null
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(' ')
    const b = words.slice(k).join(' ')
    const m = Math.max(width(a), width(b))
    if (!best || m < best.m) best = { a, b, m }
  }
  const fs0 = parseFloat(getComputedStyle(el).fontSize)
  const fs = Math.floor(fs0 * Math.min(1, (avail / best.m) * 0.985) * 10) / 10
  if (fs < 9) { el.textContent = original; return }
  el.style.fontSize = fs + 'px'
  el.textContent = ''
  ;[best.a, best.b].forEach((txt) => {
    const line = document.createElement('span')
    line.textContent = txt
    line.style.display = 'inline-block'
    line.style.whiteSpace = 'nowrap'
    el.appendChild(line)
    const natural = line.getBoundingClientRect().width
    const ls = Math.max(0, ((avail - natural) * 0.6) / txt.length)
    line.style.display = 'block'
    line.style.letterSpacing = ls.toFixed(3) + 'px'
    line.style.textAlign = 'justify'
    line.style.textAlignLast = 'justify'
  })
}

export default function Services() {
  const { lang, isZh } = useLang()
  const noteRef = useRef(null)
  const feeRef = useRef(null)

  useEffect(() => {
    const fit = () => {
      /* 2026-09-24: the multi-chain note (noteRef) is no longer stretched to
         the right edge on phones — it keeps normal word spacing. Only the
         fee note is still fitted. */
      if (!isZh) { try { fitTwoLines(noteRef.current) } catch (e) {} }
      ;[feeRef.current].forEach((el) => {
        if (!el) return
        if (isZh) {
          if (el.dataset.fitText !== undefined && el.querySelector('span')) el.textContent = el.dataset.fitText
          delete el.dataset.fitText
          return
        }
        try { fitLines(el) } catch (e) {}
      })
    }
    fit()
    let timer
    const onResize = () => { clearTimeout(timer); timer = setTimeout(fit, 150) }
    window.addEventListener('resize', onResize)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
  }, [lang, isZh])
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <>
      <Head>
        <title>{t('services', 'metaTitle', lang)}</title>
        <meta name="description" content={isZh
          ? '數位資產專案軟體開發：儀表板、網站、部署執行與資料整合。固定時程、固定價格、完整智慧財產權移交。加拿大多倫多。'
          : 'Software development for digital asset projects: dashboards, websites, deployment execution and data integration. Fixed timelines, fixed prices, full IP handover. Toronto, Canada.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/services" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <meta property="og:title" content={isZh ? '數位資產技術服務 — COSMOS Ledger Labs' : 'Digital Asset Technology Services — COSMOS Ledger Labs'} />
        <meta property="og:description" content={isZh
          ? '為數位資產專案提供儀表板、網站、部署執行與資料整合。固定時程、固定價格、完整智慧財產權移交。'
          : 'Dashboards, websites, deployment execution and data integration for digital asset projects. Fixed timelines, fixed prices, full IP handover.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/services" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content={isZh ? 'zh_TW' : 'en_CA'} />
        <meta property="og:image" content="https://cosmosledgerlabs.com/og-image.png" />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.wrap}>

          <header className={styles.hero}>
            <div className={styles.badge}>
              <span className={styles.dot}></span>
              {t('services', 'badge', lang)}
            </div>
            <h1 className={styles.title}>
              <span className={styles.tw}>{t('services', 'title1', lang)}</span>
              <span className={styles.tw}>
                <span className={styles.tc}>{t('services', 'title2a', lang)}</span>
                {isZh ? '' : ' '}
                {t('services', 'title2b', lang)}
              </span>
            </h1>
            <div className={styles.subline}>{t('services', 'subline', lang)}</div>
            <div className={styles.gl}></div>
            <p className={styles.lede}>{t('services', 'lede', lang)}</p>
          </header>

          <hr className="divider" />

          <section className={styles.section} id="services">
            <div className="sec-tag">{t('services', 'tagServices', lang)} <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>{t('services', 'headServices', lang)}</h2>

            <div className={styles.ledger}>
              {SERVICES.map((s) => (
                <div key={s.n} className={styles.row}>
                  <div className={styles.rowHead}>
                    <span className={styles.rowNum}>{s.n}</span>
                    <span className={styles.rowName}>{L(s.name)}</span>
                  </div>
                  <div className={styles.rowText}>
                    {L(s.lead)} {s.items.map((it) => L(it)).join(' // ')}
                  </div>
                  <div className={styles.rowMeta}>
                    <span className={styles.price}>
                      {s.fixed ? '' : t('services', 'priceFrom', lang) + ' '}{s.price}
                    </span>
                    <span className={styles.time}>{L(s.time)}</span>
                  </div>
                </div>
              ))}
            </div>

            <p key={lang} ref={noteRef} className={styles.note} style={isZh ? undefined : { textAlign: 'left', textAlignLast: 'left' }}>{t('services', 'note', lang)}</p>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="process">
            <div className="sec-tag">{t('services', 'tagProcess', lang)} <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>{t('services', 'headProcess', lang)}</h2>
            <div className={styles.processGrid}>
              {PROCESS.map((p) => (
                <div key={p.n} className={styles.processCard}>
                  <div className={styles.processNum}>{p.n}</div>
                  <div className={styles.processTitle}>{L(p.title)}</div>
                  <div className={styles.processText}>{L(p.d)}</div>
                </div>
              ))}
            </div>
            <div className={styles.steelCard}>
              <p className={styles.plainText}>{t('services', 'partnerNote', lang)}</p>
            </div>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="scope">
            <div className="sec-tag">{t('services', 'tagScope', lang)} <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>{t('services', 'headScope', lang)}</h2>
            <p className={styles.secBody}>{t('services', 'scopeIntro', lang)}</p>
            <div className={styles.exclusionGrid}>
              {EXCLUSIONS.map((e) => (
                <div key={e.en} className={styles.exclusion}>
                  <span className={styles.ex}>×</span>
                  <span>{L(e)}</span>
                </div>
              ))}
            </div>
            <div className={styles.steelCard}>
              <p ref={feeRef} className={styles.plainStrong}>{t('services', 'feeNote', lang)}</p>
            </div>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="security">
            <div className="sec-tag">{t('services', 'tagSecurity', lang)} <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>{t('services', 'headSecurity', lang)}</h2>
            <div className={styles.steelCard}>
              <p className={styles.plainText}>{t('services', 'securityText', lang)}</p>
            </div>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="enquiry">
            <div className="sec-tag">{t('services', 'tagContact', lang)} <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>{t('services', 'headContact', lang)}</h2>
            <div className={styles.steelCard}>
              <p className={styles.plainText}>{t('services', 'contactText', lang)}</p>
              <div className={styles.contactEmail}>
                <a href={isZh ? 'mailto:info@cosmosledgerlabs.com?subject=%E6%9C%8D%E5%8B%99%E6%B4%BD%E8%A9%A2' : 'mailto:info@cosmosledgerlabs.com?subject=Service%20Enquiry'} style={{ color: 'inherit', textDecoration: 'none' }}>
                  ✉ info@cosmosledgerlabs.com
                </a>
              </div>
              <div className={styles.contactLocation}>{t('services', 'contactLocation', lang)}</div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
