import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t } from '../lib/i18n'
import { lastUpdated } from '../lib/lastUpdated'
import { linkMail } from '../lib/mail'
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
    h: { en: 'ACCEPTANCE OF TERMS', zh: '接受條款' },
    body: [
      {
        en: 'These Terms of Service apply to all services provided by COSMOS Ledger Labs Inc. ("COSMOS", "we", "us"). By generating a payment order, making a payment, or engaging us for any service, you agree to these terms.',
        zh: '本服務條款適用於 COSMOS Ledger Labs Inc.（「COSMOS」、「我們」）提供的所有服務。當您產生付款訂單、付款或委託我們提供任何服務時，即表示您同意本條款。',
      },
      {
        en: 'Where we have signed a separate written agreement or quote with you for a project, that agreement governs the project, and these terms apply to anything it does not cover.',
        zh: '若我們已就某項專案與您另行簽訂書面協議或報價單，該專案以該協議為準；協議未涵蓋的事項則適用本條款。',
      },
    ],
  },
  {
    h: { en: 'SERVICES', zh: '服務內容' },
    body: [
      {
        en: 'We provide the technical services described on our Services page and in your quote. Scope, price and delivery timeline are confirmed in writing before work begins.',
        zh: '我們提供「服務」頁面及您的報價單中所述的技術服務。工作範圍、價格與交付時程將於開工前以書面確認。',
      },
    ],
  },
  {
    h: { en: 'DISCLAIMER', zh: '免責聲明' },
    body: [
      {
        en: 'COSMOS Ledger Labs Inc. provides technical execution services only. Our services do not constitute financial advice, investment advice, securities offerings, token issuance, capital raising, or financial intermediary services of any kind. Clients are solely responsible for ensuring their own regulatory compliance in their respective jurisdictions.',
        zh: 'COSMOS Ledger Labs Inc. 僅提供技術執行服務。我們的服務不構成任何形式的財務建議、投資建議、證券發行、代幣發行、資金募集或金融中介服務。客戶須自行負責確保其在各自所在司法管轄區的法規遵循。',
      },
    ],
  },
  {
    h: { en: 'LIMITATION OF LIABILITY', zh: '責任限制' },
    body: [
      {
        en: 'To the maximum extent permitted by law, COSMOS Ledger Labs Inc. is not liable for any indirect, incidental or consequential loss, or for any loss arising from how a client uses or operates the software we deliver. Our total liability for any engagement is limited to the fees paid to us for that engagement.',
        zh: '在法律允許的最大範圍內，COSMOS Ledger Labs Inc. 對任何間接、附帶或衍生性損失，以及因客戶使用或操作我們所交付軟體而產生的任何損失，均不承擔責任。我們就任何委託所負的全部責任，以該委託已支付予我們的費用為上限。',
      },
    ],
  },
  {
    h: { en: 'PRIVACY', zh: '隱私' },
    body: [
      {
        en: 'How we handle personal information is described in our Privacy Policy (cosmosledgerlabs.com/privacy).',
        zh: '我們處理個人資料的方式，詳見隱私政策（cosmosledgerlabs.com/privacy）。',
      },
    ],
  },
  {
    h: { en: 'GOVERNING LAW', zh: '準據法' },
    body: [
      {
        en: 'These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Questions about these terms can be sent to info@cosmosledgerlabs.com.',
        zh: '本條款受安大略省法律及其適用之加拿大聯邦法律管轄。關於本條款的任何問題，請寄至 info@cosmosledgerlabs.com。',
      },
    ],
  },
]

export async function getStaticProps() {
  return { props: { updated: await lastUpdated('pages/terms.js', UPDATED) } }
}

export default function Terms({ updated }) {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <>
      <Head>
        <title>{isZh ? '服務條款 — COSMOS Ledger Labs' : 'Terms of Service — COSMOS Ledger Labs'}</title>
        <meta name="description" content={isZh
          ? 'COSMOS Ledger Labs Inc. 服務條款：服務內容、免責聲明、責任限制與準據法。'
          : 'Terms of Service for COSMOS Ledger Labs Inc.: services, disclaimer, limitation of liability and governing law.'} />
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

      <main className={styles.page}>
        <div className={styles.main}>

          <h1 className={styles.title}>{isZh ? '服務條款' : 'TERMS OF SERVICE'}</h1>
          <div className={styles.updated}>{t('legal', 'updated', lang)} {updated || UPDATED}</div>

          {isZh && <p className={styles.prevail}>{t('legal', 'prevail', lang)}</p>}

          {SECTIONS.map((s) => (
            <section key={s.h.en} className={styles.section}>
              <h2 className={styles.h2}>{L(s.h)}</h2>
              {s.body.map((p) => (
                <p key={p.en} className={styles.body}>{linkMail(L(p))}</p>
              ))}
            </section>
          ))}

        </div>
      </main>

      <Footer />
    </>
  )
}
