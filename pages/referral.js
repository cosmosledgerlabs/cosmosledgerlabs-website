import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t, isRtl } from '../lib/i18n'
import { lastUpdated } from '../lib/lastUpdated'
import styles from '../styles/Legal.module.css'

/* pages/referral.js — Referral Program terms (added 2026-11-13).
   Linked from the referral bar pinned to the top of every public page
   (components/ReferralBanner.js).

   Legal page: kept in English for every language except Chinese, like
   /terms. The program settings below (rate, window, payout days) are the
   only numbers to change if the program changes — they appear in the
   text automatically.

   DRAFT — have counsel review before relying on it. */

const RATE = 10            // % of eligible fees
const WINDOW_MONTHS = 12   // agreements signed within this many months of the introduction
const PAYOUT_DAYS = 30     // days after the client's payment has cleared
const PRIOR_CONTACT_MONTHS = 6

/* Backup date only — the date shown is filled in from GitHub at build time
   (see lib/lastUpdated.js). */
const UPDATED = '2026-11-13'

const SECTIONS = [
  {
    h: { en: 'THE PROGRAM', zh: '計劃內容' },
    body: [
      {
        en: `Introduce a new client to COSMOS Ledger Labs Inc. ("COSMOS") and receive a commission of ${RATE}% of the eligible fees that client pays us for our technical services under agreements signed within ${WINDOW_MONTHS} months of your introduction.`,
        zh: `向 COSMOS Ledger Labs Inc.（「COSMOS」）介紹新客戶，即可就該客戶在您介紹後 ${WINDOW_MONTHS} 個月內簽訂之協議、為我們的技術服務實際支付的合資格費用，獲得 ${RATE}% 佣金。`,
      },
      {
        en: 'Eligible fees are the fees for our services actually received and cleared, excluding sales taxes (such as GST/HST), third-party and pass-through costs, and any amount later refunded, credited or reversed.',
        zh: '合資格費用指我們實際收到並已入帳的服務費用，不包括銷售稅（例如 GST/HST）、第三方及代付成本，以及其後退款、抵扣或撤回的任何金額。',
      },
      {
        en: 'There is no fee to join. Commission is paid only on clients you introduce yourself — not on clients introduced by anyone you referred.',
        zh: '參加無須任何費用。佣金僅就您親自介紹的客戶支付——不包括由您所介紹之人再介紹的客戶。',
      },
    ],
  },
  {
    h: { en: 'TOKENS AND INVESTMENTS ARE EXCLUDED', zh: '代幣與投資不在範圍內' },
    body: [
      {
        en: 'Commission is paid only on fees for our technical services (websites, dashboards, deployment, integrations, front-ends and advisory). No commission or other reward is paid for introducing anyone who buys, sells, subscribes for or invests in any token, digital asset or security — including any token sale connected with COSMOS or its partners. Do not present this program as an investment opportunity.',
        zh: '佣金僅就我們技術服務（網站、儀表板、部署、整合、前端及顧問）的費用支付。介紹任何人購買、出售、認購或投資任何代幣、數位資產或證券——包括與 COSMOS 或其合作夥伴相關的任何代幣銷售——均不支付佣金或其他獎勵。請勿將本計劃描述為投資機會。',
      },
    ],
  },
  {
    h: { en: 'HOW TO REGISTER A REFERRAL', zh: '如何登記推薦' },
    body: [
      {
        en: 'Before the client signs an agreement with us, email info@cosmosledgerlabs.com with your name and contact details and the client\'s name and contact details, copying the client. A referral counts once we confirm it in writing and the client confirms in writing that you introduced them and that they know you will receive this commission.',
        zh: '在客戶與我們簽訂協議之前，請以電子郵件寄至 info@cosmosledgerlabs.com，列明您的姓名與聯絡方式，以及客戶的名稱與聯絡方式，並副本抄送該客戶。經我們書面確認，且客戶書面確認由您介紹並知悉您將獲得此佣金後，推薦方屬有效。',
      },
      {
        en: `A referral does not count if the client was already in contact with us in the ${PRIOR_CONTACT_MONTHS} months before your introduction. If more than one person introduces the same client, the first referral we receive in writing counts.`,
        zh: `若該客戶在您介紹前 ${PRIOR_CONTACT_MONTHS} 個月內已與我們聯繫，該推薦不予計算。若多於一人介紹同一客戶，以我們最先收到的書面推薦為準。`,
      },
    ],
  },
  {
    h: { en: 'WHO CAN TAKE PART', zh: '參加資格' },
    body: [
      {
        en: 'You must be at least 18 (or the age of majority where you live) and able to enter into a contract. COSMOS staff and managers cannot take part.',
        zh: '您須年滿 18 歲（或您所在地的成年年齡）並具備訂立合約的能力。COSMOS 員工及管理人員不得參加。',
      },
      {
        en: 'If you are an employee, officer, director, adviser or other agent of the client, you may receive commission only if the client has agreed to it in writing. We do not pay commission to public officials or to anyone acting on behalf of a government body, and we cannot pay anyone subject to sanctions.',
        zh: '若您是客戶的僱員、高級職員、董事、顧問或其他代理人，須經客戶書面同意方可收取佣金。我們不向公職人員或代表政府機構行事的任何人支付佣金，亦不能向受制裁的任何人支付款項。',
      },
      {
        en: 'The program is not available where it is prohibited by law.',
        zh: '本計劃在法律禁止的地區不適用。',
      },
    ],
  },
  {
    h: { en: 'HOW YOU MAY PROMOTE US', zh: '推廣守則' },
    body: [
      {
        en: 'Whenever you recommend COSMOS, clearly tell people that you receive a commission if they become our client. Describe our services accurately, make no promises on our behalf, and do not send spam or unsolicited bulk messages.',
        zh: '每當您推薦 COSMOS 時，須清楚告知對方：若其成為我們的客戶，您將獲得佣金。請如實描述我們的服務，不得代表我們作出任何承諾，亦不得發送垃圾訊息或未經同意的大量訊息。',
      },
      {
        en: 'You are an independent referrer, not an employee, partner or agent of COSMOS, and you cannot sign anything or accept payment on our behalf. Clients always pay COSMOS directly, using the payment details on our website or in an email from info@cosmosledgerlabs.com.',
        zh: '您是獨立推薦人，並非 COSMOS 的僱員、合夥人或代理人，不得代表我們簽署任何文件或收取款項。客戶一律直接向 COSMOS 付款，並使用本網站或 info@cosmosledgerlabs.com 來信所提供的付款資料。',
      },
    ],
  },
  {
    h: { en: 'PAYMENT OF COMMISSION', zh: '佣金支付' },
    body: [
      {
        en: `Commission is paid by bank transfer, or another method agreed in writing, within ${PAYOUT_DAYS} days after the client's payment to us has cleared. Before the first payment we will ask you to confirm your identity and give the details we need for our records and tax reporting.`,
        zh: `佣金於客戶付款入帳後 ${PAYOUT_DAYS} 天內，以銀行轉帳或其他書面約定方式支付。首次付款前，我們會請您確認身分，並提供我們紀錄及稅務申報所需的資料。`,
      },
      {
        en: 'If a client\'s payment is later refunded, credited or reversed, the commission on that amount is deducted from your next commission or must be repaid. You are responsible for any taxes on the commission you receive.',
        zh: '若客戶的付款其後被退款、抵扣或撤回，該金額的佣金將從您下一筆佣金中扣除，或須退還。您須自行負責所收佣金的相關稅項。',
      },
    ],
  },
  {
    h: { en: 'CHANGES', zh: '變更' },
    body: [
      {
        en: 'We may change or end this program at any time by updating this page. Commission for referrals we have already confirmed in writing will be paid on the terms in effect when we confirmed them. These terms are governed by the laws of Ontario and the federal laws of Canada that apply there.',
        zh: '我們可隨時更新本頁以變更或終止本計劃。已經我們書面確認的推薦，將按確認當時有效的條款支付佣金。本條款受安大略省法律及適用於該省的加拿大聯邦法律管轄。',
      },
    ],
  },
]

export async function getStaticProps() {
  return { props: { updated: await lastUpdated('pages/referral.js', UPDATED) } }
}

export default function Referral({ updated }) {
  const { lang: siteLang, choice, isZh } = useLang()
  /* Legal page: English for every language except Chinese, like /terms. */
  const lang = isZh ? 'zh' : 'en'
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  const title = isZh ? '推薦計劃 — COSMOS Ledger Labs' : 'Referral Program — COSMOS Ledger Labs'
  const desc = isZh
    ? `向 COSMOS Ledger Labs 介紹新客戶，可獲得其服務費用 ${RATE}% 的佣金。`
    : `Introduce a new client to COSMOS Ledger Labs and earn ${RATE}% commission on the fees they pay for our services.`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/referral" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/referral" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content={isZh ? 'zh_TW' : 'en_CA'} />
      </Head>

      <Nav />

      <main className={styles.page} dir="ltr" lang={isZh ? (choice === 'zhs' ? 'zh-Hans' : 'zh-Hant') : 'en'}>
        <div className={styles.main}>

          <h1 className={styles.title}>{isZh ? '推薦計劃' : 'REFERRAL PROGRAM'}</h1>
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
