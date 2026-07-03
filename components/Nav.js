import styles from './Nav.module.css'
import Link from 'next/link'

export default function Nav() {
  return (
    <>
      <div className={styles.lightbar}></div>
      <nav className={styles.nav}>
        <Link href="#top" className={styles.logo}>COSMOS LEDGER LABS</Link>
        <div className={styles.links}>
          <a href="#problem">PROBLEM</a>
          <a href="#solution">SOLUTION</a>
          <a href="#demo">DEMO</a>
          <a href="#architecture">ARCHITECTURE</a>
          <a href="#roadmap">ROADMAP</a>
          <a href="#contact">CONTACT</a>
        </div>
      </nav>
    </>
  )
}
