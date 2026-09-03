import Link from 'next/link'
import styles from './Hero.module.css'

/* 2.1 — Hero: technical delivery narrative; no funding language, no deck links */
export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot}></span>
          // BUILT ON SOLANA
        </div>
        <h1 className={styles.title}>
          <span className={styles.tw}>TECHNICAL DELIVERY FOR</span>
          <span className={styles.tw}><span className={styles.tc}>DIGITAL ASSET</span> PROJECTS</span>
        </h1>
        <div className={styles.subline}>
          COSMOS LEDGER LABS &nbsp;|&nbsp; DIGITAL ASSET TECHNOLOGY SERVICES &nbsp;|&nbsp; TORONTO
        </div>
        <div className={styles.gl}></div>
        <p className={styles.bodyTxt}>COSMOS builds the websites, dashboards, token infrastructure, claim portals, and integrations that digital asset teams need to launch and operate — engineered with the same discipline we apply to our own on-chain work.</p>
        <div className={styles.btns}>
          <Link href="/services" className={styles.bp}>VIEW SERVICES →</Link>
          <a href="mailto:info@cosmosledgerlabs.com?subject=Quote%20Request" className={styles.bs}>REQUEST A QUOTE</a>
        </div>
      </div>
    </section>
  )
}
