import styles from './Nav.module.css'
export default function Nav() {
  return (
    <>
      <div className={styles.lightbar}><div className={styles.lightbarInner}/></div>
      <nav className={styles.nav}>
        <div className={styles.logo}>COSMOS LEDGER LABS</div>
        <div className={styles.links}>
          <a href="#architecture">ARCHITECTURE</a>
          <a href="#roadmap">ROADMAP</a>
          <a href="#team">TEAM</a>
        </div>
        <a href="#contact" className={styles.cta}>CONTACT US</a>
      </nav>
    </>
  )
}
