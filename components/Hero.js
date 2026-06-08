import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.ring1} />
      <div className={styles.ring2} />
      <div className={styles.ring3} />
      <div className={styles.ring4} />

      <div className={styles.badge}>// BUILT ON SOLANA</div>

      <h1 className={styles.title}>
        Workflow Infrastructure<br />
    COSMOS Ledger Labs — Building the Future of <span className={styles.accent}>Digital Asset</span> Operations
      </h1>

      <div className={styles.glowLine} />

      <div className={styles.subWrap}>
        <div className={styles.subLeft}>
          <div className={styles.subLabel}>COMPANY</div>
          <div className={`${styles.subVal} ${styles.bright}`}>COSMOS LEDGER LABS</div>
        </div>
        <div className={styles.subDivider} />
        <div className={styles.subRight}>
          <div className={styles.subLabel}>INFRASTRUCTURE</div>
          <div className={styles.subVal}>WORKFLOW AUTOMATION</div>
        </div>
      </div>

      <p className={styles.body}>
        Secure workflow orchestration, approval coordination, transaction validation,
        monitoring, and recovery infrastructure designed for modern digital asset operations.
      </p>

      <div className={styles.btns}>
        <a href="#architecture" className={styles.btnPrimary}>VIEW ARCHITECTURE</a>
        <a href="#contact"      className={styles.btnSecondary}>CONTACT US</a>
      </div>
    </section>
  )
}
