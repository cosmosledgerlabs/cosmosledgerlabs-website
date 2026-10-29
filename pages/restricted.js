import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, pick } from '../lib/i18n'
import { linkMail } from '../lib/mail'
import styles from '../styles/Legal.module.css'

/* pages/restricted.js (added 2026-10-28)
   Shown instead of /pay and /payment to visitors from countries listed in
   middleware.js (BLOCKED_COUNTRIES). Not linked anywhere; not indexed. */

const TEXT = {
  title: { en: 'SERVICE NOT AVAILABLE', zh: '服務暫不提供' },
  body: {
    en: 'Payments and orders are not available in your country or region. Under the sanctions and other laws that apply to COSMOS Ledger Labs Inc., we are unable to accept orders or payments from your location.',
    zh: '您所在的國家或地區無法使用付款與訂單功能。依適用於 COSMOS Ledger Labs Inc. 的制裁及其他相關法律，我們無法接受來自您所在地的訂單或付款。',
  },
  contact: {
    en: 'If you believe this is an error, contact info@cosmosledgerlabs.com.',
    zh: '若您認為此為誤判，請聯絡 info@cosmosledgerlabs.com。',
  },
  home: { en: '← BACK TO HOME', zh: '← 返回首頁' },
}

export default function Restricted() {
  const { lang, isZh } = useLang()
  const L = (obj) => { const v = pick(obj, lang); return v == null ? '' : v }

  return (
    <>
      <Head>
        <title>{L({ en: 'Service not available — COSMOS Ledger Labs', zh: '服務暫不提供 — COSMOS Ledger Labs' })}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#000005" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.main}>
          <h1 className={styles.title}>{L(TEXT.title)}</h1>
          <section className={styles.section}>
            <p className={styles.body}>{L(TEXT.body)}</p>
            <p className={styles.body}>{linkMail(L(TEXT.contact))}</p>
          </section>
          <Link href="/" className={styles.contactLine}>{L(TEXT.home)}</Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
