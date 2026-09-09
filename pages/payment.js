import Head from 'next/head'
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
    body: [
      {
        en: 'We accept payment by bank wire transfer, in USDT (stablecoin), and — within Canada — by Interac e-Transfer. For your security, payment details are not displayed publicly on this website: they are provided when you generate a payment order on our Pay page, or on the official invoice you receive from info@cosmosledgerlabs.com.',
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
    en: 'We never ask you to send USDT or any cryptocurrency to a wallet address received in a chat message or social media post. A USDT address is valid only when it appears on an official invoice from info@cosmosledgerlabs.com.',
    zh: '我們絕不會要求您將 USDT 或任何加密貨幣轉入以聊天訊息或社群貼文提供的錢包地址。USDT 收款地址僅在 info@cosmosledgerlabs.com 寄出的正式發票上載明方為有效。',
  },
  {
    en: 'We never receive or hold client or investor funds, and we never charge success fees or take a percentage of funds raised.',
    zh: '我們絕不收取或保管客戶及投資人資金，絕不收取成功費，也不抽取募集資金的任何比例。',
  },
]

const VERIFY = {
  en: 'Valid payment details come from only two places: a payment order you generate yourself on this website, and official invoices sent from info@cosmosledgerlabs.com. Cryptocurrency transfers cannot be reversed — confirm any USDT address with us by email before sending. A payment request from any other source is fraudulent: do not pay, and forward it to info@cosmosledgerlabs.com.',
  zh: '有效的付款資料僅來自兩處：您親自在本網站產生的付款訂單，以及由 info@cosmosledgerlabs.com 寄出的正式發票。加密貨幣轉帳無法撤銷——傳送 USDT 前請先以電子郵件向我們核對收款地址。來自任何其他來源的付款要求均屬詐騙：請勿付款，並將其轉寄至 info@cosmosledgerlabs.com。',
}

export default function Payment() {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <>
      <Head>
        <title>{isZh ? '付款 — COSMOS Ledger Labs' : 'Payment — COSMOS Ledger Labs'}</title>
        <meta name="description" content="How COSMOS Ledger Labs Inc. invoices and accepts payment, and how to recognise fraudulent payment requests." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/payment" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content="Payment — COSMOS Ledger Labs" />
        <meta property="og:description" content="How COSMOS Ledger Labs Inc. invoices and accepts payment." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/payment" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
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
              {s.body.map((p) => (
                <p key={p.en} className={styles.body}>{L(p)}</p>
              ))}
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
            <div className={styles.warnCard}>
              {NEVER.map((p) => (
                <p key={p.en} className={styles.strong}>× {L(p)}</p>
              ))}
            </div>
            <div className={styles.card}>
              <p className={styles.body}>{L(VERIFY)}</p>
              <div className={styles.email}>✉ info@cosmosledgerlabs.com</div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
