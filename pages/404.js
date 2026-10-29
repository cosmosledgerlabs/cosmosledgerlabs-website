import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang } from '../lib/i18n'
import styles from '../styles/Legal.module.css'

export default function NotFound() {
  const { L } = useLang()
  return (
    <div className={styles.page}>
      <Head>
        <title>404 — COSMOS Ledger Labs</title>
      </Head>
      <Nav />
      <main className={styles.main} style={{ textAlign: 'center', paddingTop: '120px', paddingBottom: '120px' }}>
        <h1 style={{ fontSize: '64px', letterSpacing: '4px', marginBottom: '16px' }}>404</h1>
        <p style={{ marginBottom: '32px' }}>
          {L({ en: 'This page could not be found. The address may have changed or never existed.', zh: '找不到此頁面。網址可能已變更或不存在。' })}
        </p>
        <Link href="/">{L({ en: 'BACK TO HOME →', zh: '返回首頁 →' })}</Link>
      </main>
      <Footer />
    </div>
  )
}
