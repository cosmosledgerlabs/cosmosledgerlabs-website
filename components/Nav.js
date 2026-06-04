import styles from './Nav.module.css'

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>COSMOS LEDGER LABS</div>
      <div className={styles.links}>
        <a href="#architecture" className={styles.link}>ARCHITECTURE</a>
        <a href="#workflow"     className={styles.link}>WORKFLOW</a>
        <a href="#roadmap"      className={styles.link}>ROADMAP</a>
        <a href="#team"         className={styles.link}>TEAM</a>
      </div>
      <a href="#contact" className={styles.cta}>CONTACT US</a>
    </nav>
  )
}
