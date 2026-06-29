import styles from './Sections.module.css'

/* ── PROBLEM ── */
export function Problem() {
  const cards = [
    { name: 'APPROVAL FRAGMENTATION', text: 'No unified approval coordination layer across digital asset operations.' },
    { name: 'EXECUTION COMPLEXITY',   text: 'Coordination gaps across workflow execution steps.' },
    { name: 'MONITORING LIMITS',      text: 'Limited visibility into live workflow status and execution.' },
    { name: 'RECOVERY RISKS',         text: 'No standardized rollback and recovery mechanisms.' },
  ]
  return (
    <section className="section" id="problem">
      <div className="sec-tag">// SECTION 02 — PROBLEM <div className="sec-tag-line" /></div>
      <h2 className="sec-title">The Problem</h2>
      <p className="sec-body">
        Managing digital asset operations across approvals, execution workflows, monitoring,
        and recovery processes remains fragmented and operationally complex.
      </p>
      <div className={styles.probGrid}>
        {cards.map((c, i) => (
          <div key={i} className={styles.probCard}>
            <div className={`${styles.pc} ${styles.pcTL}`} />
            <div className={`${styles.pc} ${styles.pcBR}`} />
            <div className={styles.probName}>{c.name}</div>
            <div className={styles.probText}>{c.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── SOLUTION ── */
export function Solution() {
  return (
    <section className="section" id="solution">
      <div className="sec-tag">// SECTION 03 — SOLUTION <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Solution</h2>
      <div className="steel-card">
        <p className="sec-body">
          COSMOS Ledger Labs is building workflow automation infrastructure designed to
          streamline approval workflows, execution coordination, transaction validation,
          monitoring systems, and operational recovery mechanisms.
        </p>
      </div>
    </section>
  )
}

/* ── WORKFLOW ── */
export function Workflow() {
  const steps = [
    { n: '01', label: 'User Creates Workflow',  on: true  },
    { n: '02', label: 'Approval Validation',    on: true  },
    { n: '03', label: 'Execution Queue',        on: false },
    { n: '04', label: 'Transaction Builder',    on: false },
    { n: '05', label: 'On-Chain Validation',    on: false },
    { n: '06', label: 'Transaction Execution',  on: false },
    { n: '07', label: 'Execution Monitoring',   on: false },
    { n: '08', label: 'Audit Logging',          on: false },
    { n: '09', label: 'Rollback Recovery',      on: false, fin: true },
  ]
  return (
    <section className="section" id="workflow">
      <div className="sec-tag">// SECTION 05 — WORKFLOW LIFECYCLE <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Execution Workflow Lifecycle</h2>
      <div className={styles.wf}>
        {steps.map((s, i) => (
          <div key={i}>
            <div className={styles.wfStep}>
              <div className={`${styles.wfDot} ${s.on ? styles.dotOn : s.fin ? styles.dotFin : styles.dotOff}`} />
              <span className={styles.wfNum}>{s.n} //</span>
              <span className={`${styles.wfLabel} ${s.on ? styles.labelOn : s.fin ? styles.labelFin : styles.labelOff}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={styles.wfLine} />}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── SECURITY ── */
export function Security() {
  const items = [
    'Approval Validation', 'Permission Controls', 'Transaction Validation',
    'Monitoring Systems',  'Rollback Recovery',   'Execution Integrity',
  ]
  return (
    <section className="section" id="security">
      <div className="sec-tag">// SECTION 06 — SECURITY &amp; RECOVERY <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Operational Security &amp; Recovery</h2>
      <div className={styles.secGrid}>
        {items.map((item, i) => (
          <div key={i} className={styles.secItem}>
            <div className={styles.secDot} />
            <span className={styles.secText}>{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── ECOSYSTEM ── */
export function Ecosystem() {
  return (
    <section className="section" id="ecosystem">
      <div className="sec-tag">// SECTION 07 — ECOSYSTEM &amp; EXPERIENCE <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Ecosystem &amp; Experience</h2>
      <div className="steel-card">
        <p className={styles.ecoP}>
          The founding team brings experience from startup development, ecosystem building,
          and ventures that have successfully secured external funding and institutional support.
        </p>
        <p className={styles.ecoP} style={{marginTop:'16px'}}>
          This experience is being applied to the development of COSMOS Ledger Labs and
          its long-term infrastructure vision.
        </p>
      </div>
    </section>
  )
}

/* ── ROADMAP ── */
export function Roadmap() {
  const phases = [
    { ph: '// PHASE 1', title: 'ARCHITECTURE', items: ['Architecture', 'MVP', 'Core Infrastructure'] },
    { ph: '// PHASE 2', title: 'EXECUTION',    items: ['Approval Engine', 'Workflow Coordination', 'Transaction Validation'] },
    { ph: '// PHASE 3', title: 'MONITORING',   items: ['Monitoring', 'Recovery Layer', 'Operational Automation'] },
    { ph: '// PHASE 4', title: 'SCALE',        items: ['Scalability', 'Ecosystem Integrations', 'Multi-Chain Expansion'], hi: true },
  ]
  return (
    <section className="section" id="roadmap">
      <div className="sec-tag">// SECTION 08 — TECHNICAL ROADMAP <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Technical Roadmap</h2>
      <div className={styles.rmGrid}>
        {phases.map((p, i) => (
          <div key={i} className={`${styles.rmCard} ${p.hi ? styles.rmCardHi : ''}`}>
            <div className={styles.rmPh}>{p.ph}</div>
            <div className={styles.rmTitle}>{p.title}</div>
            <div className={styles.rmItems}>
              {p.items.map((item, j) => <div key={j}>{item}</div>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── ONE PAGER ── */
export function OnePager() {
  return (
    <section className="section" id="onepager">
      <div className="sec-tag">// SECTION 09 — ONE PAGER <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Download One Pager</h2>
      <div className={styles.opWrap}>
        <p className={styles.opText}>
          Learn more about the platform vision, architecture, roadmap, and development strategy.
        </p>
        {/* Replace href="#" with "/onepager.pdf" once the file is uploaded to /public */}
        <a href="#" className={styles.btnDl}>⬇ DOWNLOAD ONE PAGER</a>
      </div>
    </section>
  )
}

/* ── TEAM ── */
export function Team() {
  return (
    <section className="section" id="team">
      <div className="sec-tag">// SECTION 10 — TEAM <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Team</h2>
      <div className="steel-card">
        <div className={styles.teamName}>COSMOS LEDGER LABS</div>
        <div className={styles.teamLoc}>📍 Toronto, Canada</div>
        <p className={styles.teamDesc}>Building workflow infrastructure for digital asset operations.</p>
      </div>
    </section>
  )
}

/* ── CONTACT ── */
export function Contact() {
  return (
    <section className="section" id="contact">
      <div className="sec-tag">// SECTION 11 — CONTACT <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Contact</h2>
      <div className={`steel-card ${styles.contactCard}`}>
        <div className={styles.contactEmail}>
          ✉ <a href="mailto:info@cosmosledgerlabs.com" className={styles.emailLink}>info@cosmosledgerlabs.com</a>
        </div>
        <div className={styles.contactLoc}>📍 Toronto, Canada</div>
      </div>
    </section>
  )
}
