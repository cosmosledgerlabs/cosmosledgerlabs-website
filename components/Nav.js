import { useState } from 'react'
import Link from 'next/link'
import { useLang, t } from '../lib/i18n'
import LangToggle from './LangToggle'
import styles from './Nav.module.css'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { lang, setLang, isZh } = useLang()
  const close = () => setOpen(false)

  return (
    <>
      <div className={styles.lightbar}></div>
      <nav className={styles.nav}>
        <Link href="/#top" className={styles.logo} onClick={close}>COSMOS LEDGER LABS</Link>
        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? (isZh ? '關閉選單' : 'Close menu') : (isZh ? '開啟選單' : 'Open menu')}
          aria-expanded={open}
        >
          <span></span><span></span><span></span>
        </button>
        <div className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          <Link href="/services" onClick={close}>{t('nav', 'services', lang)}</Link>
          <Link href="/flow" onClick={close}>{t('nav', 'demo', lang)}</Link>
          <Link href="/payment" onClick={close}>{t('nav', 'payment', lang)}</Link>
          <Link href="/#problem" onClick={close}>{t('nav', 'problem', lang)}</Link>
          <Link href="/#contact" onClick={close}>{t('nav', 'contact', lang)}</Link>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </nav>
    </>
  )
}
