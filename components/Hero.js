import Link from 'next/link'
import { useLang } from '../lib/i18n'
import styles from './Hero.module.css'

/* 2.1 — Hero: technical delivery narrative; no funding language, no deck links.
   2026-09-24: headline now reads "Infrastructure & technical delivery for
   digital asset projects" (EN) / 為數位資產專案提供基礎設施與技術交付 (繁體),
   matching the page title. */

const T = {
  badge: { en: '// TRY THE LIVE DEMO', zh: '// 體驗線上演示' },
  title0: { en: 'INFRASTRUCTURE &', zh: '為數位資產專案提供' },
  title1: { en: 'TECHNICAL DELIVERY FOR', zh: '基礎設施與技術交付' },
  title2a: { en: 'DIGITAL ASSET', zh: '' },
  title2b: { en: ' PROJECTS', zh: '' },
  subline: {
    en: 'COSMOS LEDGER LABS \u00A0|\u00A0 DIGITAL ASSET TECHNOLOGY SERVICES \u00A0|\u00A0 TORONTO',
    zh: 'COSMOS LEDGER LABS \u00A0|\u00A0 數位資產技術服務 \u00A0|\u00A0 多倫多',
  },
  body: {
    en: 'COSMOS builds the websites, dashboards, token infrastructure, claim portals, and integrations that digital asset teams need to launch and operate — engineered with the same discipline we apply to our own on-chain work.',
    zh: 'COSMOS 為數位資產團隊建置啟動與營運所需的網站、儀表板、代幣基礎設施、領取頁面與系統整合——以我們對待自身鏈上工作的同等工程紀律打造。',
  },
  btnServices: { en: 'VIEW SERVICES →', zh: '查看服務 →' },
  btnQuote: { en: 'REQUEST A QUOTE', zh: '索取報價' },
}

export default function Hero() {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <section className={styles.hero} id="top">
      <div className={styles.content}>
        {/* Hero badge = link to the live demo page (/flow) */}
        <Link
          href="/flow"
          className={styles.badge}
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <span className={styles.dot}></span>
          {L(T.badge)}
        </Link>
        <h1 className={styles.title}>
          {isZh ? (
            <>
              <span className={styles.tw}>為<span className={styles.tc}>數位資產</span>專案提供</span>
              <span className={styles.tw}>基礎設施與技術交付</span>
            </>
          ) : (
            <>
              <span className={styles.tw}>{T.title0.en}</span>
              <span className={styles.tw}>{T.title1.en}</span>
              <span className={styles.tw}><span className={styles.tc}>{T.title2a.en}</span>{T.title2b.en}</span>
            </>
          )}
        </h1>
        <div className={styles.subline}>{L(T.subline)}</div>
        <div className={styles.gl}></div>
        <p className={styles.bodyTxt}>{L(T.body)}</p>
      </div>
    </section>
  )
}
