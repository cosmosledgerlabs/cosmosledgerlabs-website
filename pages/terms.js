import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t, isRtl } from '../lib/i18n'
import { lastUpdated } from '../lib/lastUpdated'
import styles from '../styles/Legal.module.css'

/* pages/terms.js — Terms of Service (added 2026-10-28).
   A client agrees to these terms when generating an order on /pay
   (the notice under the GENERATE ORDER button links here). */

/* Backup date only. The date shown on the page is filled in automatically
   from GitHub (see lib/lastUpdated.js); this one is used only if GitHub
   cannot be reached when the site is built. */
const UPDATED = '2026-10-28'

const SECTIONS = [
  {
    h: { en: 'DISCLAIMER', zh: '免責聲明' },
    body: [
      {
        en: 'COSMOS Ledger Labs Inc. provides technical execution services only. Our services do not constitute financial advice, investment advice, securities offerings, token issuance, capital raising, or financial intermediary services of any kind. Clients are solely responsible for ensuring their own regulatory compliance in their respective jurisdictions.',
        zh: 'COSMOS Ledger Labs Inc. 僅提供技術執行服務。我們的服務不構成任何形式的財務建議、投資建議、證券發行、代幣發行、資金募集或金融中介服務。客戶須自行負責確保其在各自所在司法管轄區的法規遵循。',
      },
    ],
  },
]

export async function getStaticProps() {
  return { props: { updated: await lastUpdated('pages/terms.js', UPDATED) } }
}

export default function Terms({ updated }) {
  const { lang: siteLang, isZh } = useLang()
  /* Legal page: kept in English for every language except Chinese
     (2026-10-28, Osler requirement). */
  const lang = isZh ? 'zh' : 'en'
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <>
      <Head>
        <title>{isZh ? '服務條款 — COSMOS Ledger Labs' : 'Terms of Service — COSMOS Ledger Labs'}</title>
        <meta name="description" content={isZh
          ? 'COSMOS Ledger Labs Inc. 服務條款與免責聲明。'
          : 'Terms of Service and disclaimer for COSMOS Ledger Labs Inc.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/terms" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content={isZh ? '服務條款 — COSMOS Ledger Labs' : 'Terms of Service — COSMOS Ledger Labs'} />
        <meta property="og:description" content={isZh ? 'COSMOS Ledger Labs Inc. 服務條款。' : 'Terms of Service for COSMOS Ledger Labs Inc.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/terms" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content={isZh ? 'zh_TW' : 'en_CA'} />
      </Head>

      <Nav />

      <main className={styles.page} dir="ltr" lang={isZh ? 'zh-Hant' : 'en'}>
        <div className={styles.main}>

          <h1 className={styles.title}>{isZh ? '服務條款' : 'TERMS OF SERVICE'}</h1>
          <div className={styles.updated}>{t('legal', 'updated', lang)} {updated || UPDATED}</div>

          {isZh && <p className={styles.prevail}>{t('legal', 'prevail', lang)}</p>}
          {siteLang !== 'en' && !isZh && <p className={styles.prevail} style={{ whiteSpace: 'normal' }} dir={isRtl(siteLang) ? 'rtl' : 'ltr'}>{t('legal', 'englishOnly', siteLang)}</p>}

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
