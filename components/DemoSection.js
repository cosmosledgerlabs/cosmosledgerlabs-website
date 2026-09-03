import Link from 'next/link'
import styles from './Sections.module.css'

/* 2.4 — Engineering Showcase
   pointing to the real /flow devnet demo. */
export default function Demo() {
  return (
    <section className={styles.section} id="demo">
      <div className="sec-tag">// SECTION 04 — ENGINEERING SHOWCASE <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>SEE HOW WE ENGINEER</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>Our public demo runs a three-step token workflow on Solana devnet — approval, vesting setup, distribution — with automatic on-chain compensation when a step fails. Every transaction is verifiable on-chain. It is a working sample of the engineering standard we bring to client delivery.</p>
        <div className={styles.dlButtons}>
          <Link href="/flow" className={styles.dlBtn1}>OPEN THE DEMO →</Link>
        </div>
        <p className={styles.legalNote}>Solana devnet, test tokens only. Not a product and not connected to mainnet funds.</p>
      </div>
    </section>
  )
}
