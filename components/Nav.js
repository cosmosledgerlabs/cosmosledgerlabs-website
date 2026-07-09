import { useState } from 'react'
import Link from 'next/link'
import styles from './Nav.module.css'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <>
      <div className={styles.lightbar}></div>
      <nav className={styles.nav}>
        <Link href="#top" className={styles.logo} onClick={close}>COSMOS LEDGER LABS</Link>
        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span></span><span></span><span></span>
        </button>
        <div className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          <a href="#problem" onClick={close}>PROBLEM</a>
          <a href="#solution" onClick={close}>SOLUTION</a>
          <a href="#demo" onClick={close}>DEMO</a>
          <a href="#architecture" onClick={close}>ARCHITECTURE</a>
          <a href="#roadmap" onClick={close}>ROADMAP</a>
          <a href="#contact" onClick={close}>CONTACT</a>
        </div>
      </nav>
    </>
  )
}
