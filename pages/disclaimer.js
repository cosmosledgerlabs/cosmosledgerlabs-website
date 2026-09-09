import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t } from '../lib/i18n'
import styles from '../styles/Legal.module.css'

const UPDATED = '2026-09-09'

const SECTIONS = [
  {
    h: { en: 'GENERAL', zh: '一般聲明' },
    body: [
      {
        en: 'The content of this website is provided for general information only. While we keep it as accurate as we can, we make no representation or warranty that it is complete, current or error-free, and it may change without notice.',
        zh: '本網站內容僅供一般資訊參考。我們盡力維持內容正確，但不保證其完整、最新或無誤，且內容可能隨時變更，恕不另行通知。',
      },
    ],
  },
  {
    h: { en: 'NO OFFER', zh: '不構成要約' },
    body: [
      {
        en: 'COSMOS Ledger Labs Inc. has not issued and does not offer any token or digital asset. Nothing on this website is an offer to sell, or a solicitation of an offer to buy, any security or digital asset, in any jurisdiction.',
        zh: 'COSMOS Ledger Labs Inc. 未發行亦不提供任何代幣或數位資產。本網站的任何內容，在任何司法管轄區內，均不構成出售任何證券或數位資產的要約，亦不構成購買的要約邀請。',
      },
    ],
  },
  {
    h: { en: 'NO ADVICE', zh: '不構成建議' },
    body: [
      {
        en: 'Nothing on this website is investment, legal, tax or accounting advice, and it should not be relied on as such. Obtain your own professional advice before making any decision.',
        zh: '本網站的任何內容均不構成投資、法律、稅務或會計建議，亦不應作為此類建議加以依賴。做出任何決定前，請自行諮詢專業人士。',
      },
    ],
  },
  {
    h: { en: 'SCOPE OF SERVICES', zh: '服務範圍' },
    body: [
      {
        en: 'COSMOS Ledger Labs Inc. is a software company providing technical delivery services. We do not sell, distribute or market digital assets on behalf of clients; we do not receive or hold client or investor funds; we do not raise capital for clients or introduce investors; we do not provide market making or liquidity services; and we do not arrange, promise or facilitate exchange listings.',
        zh: 'COSMOS Ledger Labs Inc. 是一家提供技術交付服務的軟體公司。我們不代客戶銷售、分發或行銷數位資產；不收取或保管客戶及投資人資金；不為客戶募集資金或引介投資人；不提供造市或流動性服務；亦不安排、承諾或促成交易所上架。',
      },
    ],
  },
  {
    h: { en: 'DEMONSTRATIONS', zh: '演示說明' },
    body: [
      {
        en: 'All demonstrations on this website run on the Solana devnet test network. Devnet tokens have no monetary value. Demonstrations exist to show how our software works; they are not a promise of production performance or of any particular result.',
        zh: '本網站所有演示均在 Solana devnet 測試網上執行。測試網代幣不具任何金錢價值。演示僅用於展示我們軟體的運作方式，不構成對正式環境效能或任何特定結果的承諾。',
      },
    ],
  },
  {
    h: { en: 'THIRD PARTIES', zh: '第三方聲明' },
    body: [
      {
        en: 'Third-party tools and networks named on this website are technologies we build with; their mention does not imply partnership or endorsement in either direction. External links are provided for convenience only, and we are not responsible for the content of external sites.',
        zh: '本網站提及的第三方工具與網路為我們使用的技術，提及不代表任何一方的合作或背書關係。外部連結僅為方便而提供，我們對外部網站的內容不承擔任何責任。',
      },
    ],
  },
  {
    h: { en: 'LIMITATION OF LIABILITY', zh: '責任限制' },
    body: [
      {
        en: 'To the maximum extent permitted by law, COSMOS Ledger Labs Inc. is not liable for any loss or damage arising from the use of, or reliance on, this website or its content. Services we provide to clients are governed by the written agreement for those services, not by this website.',
        zh: '在法律允許的最大範圍內，COSMOS Ledger Labs Inc. 對因使用或依賴本網站及其內容而產生的任何損失或損害不承擔責任。我們向客戶提供的服務以該服務的書面協議為準，而非本網站。',
      },
    ],
  },
  {
    h: { en: 'GOVERNING JURISDICTION', zh: '管轄聲明' },
    body: [
      {
        en: 'COSMOS Ledger Labs Inc. is incorporated in Ontario, Canada. This website is operated from Ontario, Canada.',
        zh: 'COSMOS Ledger Labs Inc. 於加拿大安大略省註冊成立。本網站自加拿大安大略省營運。',
      },
    ],
  },
]

export default function Disclaimer() {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <>
      <Head>
        <title>{isZh ? '免責聲明 — COSMOS Ledger Labs' : 'Disclaimer — COSMOS Ledger Labs'}</title>
        <meta name="description" content="Disclaimer for the COSMOS Ledger Labs Inc. website: no offer, no advice, scope of services, and demonstration terms." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/disclaimer" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content="Disclaimer — COSMOS Ledger Labs" />
        <meta property="og:description" content="Disclaimer for the COSMOS Ledger Labs Inc. website." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/disclaimer" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.main}>

          <h1 className={styles.title}>{isZh ? '免責聲明' : 'DISCLAIMER'}</h1>
          <div className={styles.updated}>{t('legal', 'updated', lang)} {UPDATED}</div>

          {isZh && <p className={styles.prevail}>{t('legal', 'prevail', lang)}</p>}

          {SECTIONS.map((s) => (
            <section key={s.h.en} className={styles.section}>
              <h2 className={styles.h2}>{L(s.h)}</h2>
              {s.body.map((p) => (
                <p key={p.en} className={styles.body}>{L(p)}</p>
              ))}
            </section>
          ))}

        </div>
      </main>

      <Footer />
    </>
  )
}
