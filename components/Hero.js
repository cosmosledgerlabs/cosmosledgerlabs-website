import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.content}>
        <div className={styles.fundingBadge}>
          <span className={styles.fstar}>★</span>
          <span>ARCHITECTURE COMPLETE · CLICKABLE MVP LIVE</span>
          <span className={styles.fstar}>★</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.dot}></span>
          // BUILT ON SOLANA
        </div>
        <h1 className={styles.title}>
          <span className={styles.tw}>WORKFLOW INFRASTRUCTURE FOR</span>
          <span className={styles.tw}><span className={styles.tc}>DIGITAL ASSET</span> OPERATIONS</span>
        </h1>
        <div className={styles.subline}>
          COSMOS LEDGER LABS &nbsp;|&nbsp; DIGITAL INFRASTRUCTURE &nbsp;|&nbsp; AUTOMATION
        </div>
        <div className={styles.gl}></div>
        <p className={styles.bodyTxt}>Secure workflow orchestration, approval coordination, transaction validation, monitoring, and recovery infrastructure for modern digital asset operations.</p>
        <p className={styles.founderLine}>Founder is a repeat operator whose prior ventures were built with non-dilutive financing.</p>
        <div className={styles.btns}>
          <a href="mailto:info@cosmosledgerlabs.com?subject=Full%20Deck%20Request" className={styles.bp}>REQUEST FULL DECK →</a>
          <a href="/architecture-diagram.pdf" target="_blank" rel="noopener noreferrer" className={styles.bp}>VIEW ARCHITECTURE</a>
          <a href="mailto:info@cosmosledgerlabs.com?subject=Contact%20COSMOS%20Ledger%20Labs" className={styles.bs}>CONTACT US</a>
        </div>
        <p className={styles.discreet}>Detailed materials shared with eligible investors on request.</p>
      </div>
    </section>
  )
}
