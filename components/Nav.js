import { useState } from 'react'
import Link from 'next/link'
import styles from './Nav.module.css'

/* 2.0 — Nav: HOME · SERVICES · DEMO · CONTACT; no document links */
export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <>
      <div className={styles.lightbar}></div>
      <nav className={styles.nav}>
        <Link href="/#top" className={styles.logo} onClick={close}>COSMOS LEDGER LABS</Link>
        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span></span><span></span><span></span>
        </button>
        <div className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          <Link href="/#top" onClick={close}>HOME</Link>
          <Link href="/services" onClick={close}>SERVICES</Link>
          <Link href="/flow" onClick={close}>DEMO</Link>
          <Link href="/#contact" onClick={close}>CONTACT</Link>
        </div>
      </nav>
    </>
  )
}
