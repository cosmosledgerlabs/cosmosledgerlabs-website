import styles from './Footer.module.css'

/* Footer: canonical boilerplate + required disclaimer */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
        <a className={styles.socialLink} href="https://x.com/CosmosLedgerLab" target="_blank" rel="noopener noreferrer" aria-label="X">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.9l-4.8-6.28L4.3 22H1.04l8.02-9.17L1.5 2h7.07l4.34 5.74L18.244 2Zm-1.21 18h1.83L7.05 3.9H5.09L17.034 20Z"/></svg>
        </a>
        <a className={styles.socialLink} href="https://t.me/cosmosledgerlabs" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.3 18.9 19.03c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.95.46l.34-4.78 8.7-7.86c.38-.34-.08-.53-.59-.19L6.72 13.02l-4.64-1.45c-1.01-.32-1.03-1.01.21-1.5l18.14-6.99c.84-.31 1.58.2 1.31 1.22Z"/></svg>
        </a>
        <a className={styles.socialLink} href="mailto:info@cosmosledgerlabs.com" aria-label="Email">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
        </a>
      </div>
      <p className={styles.text}>
        COSMOS Ledger Labs Inc. is a Toronto-based digital asset technology company. We design, build, and hand over the technical infrastructure that digital asset projects need to launch and operate: corporate websites, operations dashboards, token deployment and configuration, claim portals, data integrations and APIs, and smart contract front-ends.
      </p>
      <p className={styles.legal}>
        COSMOS Ledger Labs Inc. · Ontario, Canada. Demonstrations run on Solana devnet. Devnet tokens have no monetary value. Nothing on this site is an offer to sell or a solicitation to buy any security or digital asset. Third-party tools named on this site are technologies we build with; their mention does not imply partnership or endorsement.
      </p>
      <p className={styles.legal}>© 2026 COSMOS Ledger Labs Inc.</p>
    </footer>
  )
}
