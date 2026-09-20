import Link from 'next/link'
import { useLang, t } from '../lib/i18n'
import styles from './Footer.module.css'

/* Footer: canonical boilerplate + required disclaimer */
export default function Footer() {
  const { lang, isZh } = useLang()

  return (
    <footer className={styles.footer}>

      <p className={styles.text}>{t('footer', 'about', lang)}</p>

      <p className={styles.legal}>{t('footer', 'legal', lang)}</p>

      <p className={styles.legal}>{t('footer', 'fraud', lang)}</p>

      <nav className={styles.links}>
        <Link href="/services" className={styles.footLink}>{t('footer', 'linkServices', lang)}</Link>
        <span className={styles.sep}>·</span>
        <Link href="/flow" className={styles.footLink}>{t('footer', 'linkDemo', lang)}</Link>
        <span className={styles.sep}>·</span>
        <Link href="/payment" className={styles.footLink}>{t('footer', 'linkPayment', lang)}</Link>
        <span className={styles.sep}>·</span>
        <Link href="/disclaimer" className={styles.footLink}>{t('footer', 'linkDisclaimer', lang)}</Link>
        <span className={styles.sep}>·</span>
        <Link href="/privacy" className={styles.footLink}>{t('footer', 'linkPrivacy', lang)}</Link>
        <span className={styles.sep}>·</span>
        <a className={styles.footLink} href="mailto:info@cosmosledgerlabs.com">{t('footer', 'linkContact', lang)}</a>
      </nav>

      <p className={styles.legal}>© 2026 COSMOS Ledger Labs Inc.</p>
    </footer>
  )
}
