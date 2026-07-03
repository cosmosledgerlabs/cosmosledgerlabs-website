import styles from './Sections.module.css'

export function Problem() {
  return (
    <section className={styles.section} id="problem">
      <div className="sec-tag">// SECTION 02 — PROBLEM <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>THE PROBLEM</h2>
      <p className={styles.secBody}>Managing digital asset operations across approvals, execution workflows, monitoring, and recovery processes remains fragmented and operationally complex.</p>
      <div className={styles.cardGrid}>
        <div className={styles.card}><div className={styles.cardName}>APPROVAL FRAGMENTATION</div><div className={styles.cardText}>No unified approval coordination layer across digital asset operations.</div></div>
        <div className={styles.card}><div className={styles.cardName}>EXECUTION COMPLEXITY</div><div className={styles.cardText}>Coordination gaps across workflow execution steps cause operational failures.</div></div>
        <div className={styles.card}><div className={styles.cardName}>MONITORING LIMITS</div><div className={styles.cardText}>Limited visibility into live workflow status and real-time execution.</div></div>
        <div className={styles.card}><div className={styles.cardName}>RECOVERY RISKS</div><div className={styles.cardText}>No standardized rollback and recovery mechanisms for failed workflows.</div></div>
      </div>
    </section>
  )
}

export function Solution() {
  return (
    <section className={styles.section} id="solution">
      <div className="sec-tag">// SECTION 03 — SOLUTION <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>THE SOLUTION</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>COSMOS Ledger Labs builds a unified workflow automation infrastructure layer for digital asset operations — combining approval coordination, secure execution, real-time monitoring, and atomic recovery into one integrated platform built on Solana.</p>
        <div className={styles.fundingInline}>
          <div className={styles.fundingTag}>★ ECOSYSTEM PLATFORM HAS SECURED EXTERNAL FUNDING ★</div>
        </div>
      </div>
    </section>
  )
}

export function Architecture() {
  const layers = [
    {n:'L1', t:'ADMIN DASHBOARD & WORKFLOW BUILDER', s:'Control UI'},
    {n:'L2', t:'APPROVAL ENGINE', s:'Multi-sig / RBAC'},
    {n:'L3', t:'WORKFLOW ORCHESTRATOR', s:'Scheduling / Routing'},
    {n:'L4', t:'TOKEN ISSUANCE / VESTING / DISTRIBUTION', s:'Smart Contracts'},
    {n:'L5', t:'SOLANA SMART CONTRACT LAYER', s:'PDA / CPI / Tx Logic'},
    {n:'L6', t:'MONITORING & RECOVERY LAYER', s:'Retry / Rollback'},
    {n:'L7', t:'SECURITY LAYER', s:'Permissions / Audit'},
    {n:'L8', t:'BACKEND INFRASTRUCTURE', s:'API / Queue / DB'},
    {n:'L9', t:'DATA & LOGGING', s:'Analytics / Records'},
  ]
  return (
    <section className={styles.section} id="architecture">
      <div className="sec-tag">// SECTION 05 — ARCHITECTURE <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>PLATFORM ARCHITECTURE</h2>
      <div className={styles.archList}>
        {layers.map((l,i) => (
          <div key={i} className={styles.archLayer}>
            <span className={styles.archNum}>{l.n}</span>
            <span className={styles.archTitle}>{l.t}</span>
            <span className={styles.archSub}>{l.s}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Workflow() {
  const steps = ['User Creates Workflow','Approval Validation','Execution Queue','Transaction Builder','On-Chain Validation','Transaction Execution','Execution Monitoring','Audit Logging','Rollback Recovery']
  return (
    <section className={styles.section} id="workflow">
      <div className="sec-tag">// SECTION 06 — WORKFLOW <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>EXECUTION WORKFLOW LIFECYCLE</h2>
      <div className={styles.wfList}>
        {steps.map((s,i) => (
          <span key={i} style={{display:'contents'}}>
            <div className={styles.wfStep}>
              <div className={styles.wfDot}/>
              <span className={styles.wfNum}>{String(i+1).padStart(2,'0')} //</span>
              <span className={styles.wfLabel}>{s}</span>
            </div>
            {i < steps.length-1 && <div className={styles.wfLine}/>}
          </span>
        ))}
      </div>
    </section>
  )
}

export function Security() {
  const items = [
    {t:'PERMISSION CONTROLS', d:'Role-based access control across all workflow operations.'},
    {t:'AUDIT LOGGING', d:'Complete immutable audit trail for every workflow execution.'},
    {t:'ATOMIC ROLLBACK', d:'Automatic rollback protection prevents partial execution failures.'},
    {t:'MULTI-SIG APPROVAL', d:'Multi-step approval gates before any transaction execution.'},
    {t:'EXECUTION VERIFICATION', d:'On-chain validation before and after every transaction.'},
    {t:'REPLAY PROTECTION', d:'Prevents double execution and replay attacks on workflows.'},
  ]
  return (
    <section className={styles.section} id="security">
      <div className="sec-tag">// SECTION 07 — SECURITY <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>SECURITY INFRASTRUCTURE</h2>
      <div className={styles.secGrid}>
        {items.map((item,i) => (
          <div key={i} className={styles.secCard}>
            <div className={styles.secCardTitle}>{item.t}</div>
            <div className={styles.secCardText}>{item.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Ecosystem() {
  return (
    <section className={styles.section} id="ecosystem">
      <div className="sec-tag">// SECTION 08 — ECOSYSTEM <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>ECOSYSTEM</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>COSMOS Ledger Labs is built on Solana — leveraging its high-performance infrastructure for fast, low-cost transaction execution. Designed to integrate with the broader Solana ecosystem, supporting institutional digital asset operations at scale.</p>
      </div>
    </section>
  )
}

export function Roadmap() {
  const phases = [
    {n:'01', phase:'PHASE 1', title:'ARCHITECTURE', cls:'rm1', titleCls:'rmTitle1', badge:'CURRENT', badgeCls:'badgeCurrent', tags:['Architecture Design','MVP Planning','Core Infrastructure']},
    {n:'02', phase:'PHASE 2', title:'EXECUTION',   cls:'rm2', titleCls:'rmTitle2', badge:'NEXT',    badgeCls:'badgeNext',    tags:['Approval Engine','Workflow Coordination','Transaction Validation']},
    {n:'03', phase:'PHASE 3', title:'MONITORING',  cls:'rm3', titleCls:'rmTitle3', badge:'PLANNED', badgeCls:'badgePlanned', tags:['Live Monitoring','Recovery Layer','Operational Automation']},
    {n:'04', phase:'PHASE 4', title:'SCALE',       cls:'rm4', titleCls:'rmTitle4', badge:'FUTURE',  badgeCls:'badgeFuture',  tags:['Scalability','Ecosystem Integrations','Multi-Chain Expansion']},
  ]
  return (
    <section className={styles.section} id="roadmap">
      <div className="sec-tag">// SECTION 09 — ROADMAP <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>TECHNICAL ROADMAP</h2>
      <div className={styles.roadmapList}>
        {phases.map((p,i) => (
          <div key={i} className={`${styles.rmItem} ${styles[p.cls]}`}>
            <div className={styles.rmRow}>
              <div className={styles.rmLeft}>
                <div className={styles.rmNum}>{p.n}</div>
                <div className={styles.rmInfo}>
                  <div className={styles.rmPhase}>// {p.phase}</div>
                  <div className={styles[p.titleCls]}>{p.title}</div>
                </div>
              </div>
              <div className={`${styles.rmBadge} ${styles[p.badgeCls]}`}>{p.badge}</div>
            </div>
            <div className={styles.rmTags}>
              {p.tags.map((tag,j) => <div key={j} className={styles.rmTag}>// {tag}</div>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Downloads() {
  return (
    <section className={styles.section} id="deck">
      <div className="sec-tag">// SECTION 10 — DOCUMENTS <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>DOWNLOAD DOCUMENTS</h2>
      <div className={styles.steelCard}>
        <p className={styles.secBody}>Access the platform vision, architecture design, roadmap, and development strategy.</p>
        <div className={styles.dlButtons}>
          <a href="/investor-deck.pdf" target="_blank" className={styles.dlBtn1}>⬇ INVESTOR DECK</a>
          <a href="/architecture-diagram.pdf" target="_blank" className={styles.dlBtn2}>⬇ ARCHITECTURE DIAGRAM</a>
        </div>
      </div>
    </section>
  )
}

export function Team() {
  return (
    <section className={styles.section} id="team">
      <div className="sec-tag">// SECTION 11 — TEAM <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>TEAM</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>COSMOS Ledger Labs is founded and led by Su Hua Zheng, CEO & Founder, driving platform strategy, operations, and business development. Currently recruiting a technical co-founder with Solana / Rust / Anchor experience based in Ontario, Canada.</p>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className={styles.section} id="contact">
      <div className="sec-tag">// SECTION 12 — CONTACT <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>CONTACT</h2>
      <div className={styles.steelCard}>
        <div className={styles.contactEmail}>✉ info@cosmosledgerlabs.com</div>
        <div className={styles.contactLocation}>📍 Toronto, Ontario, Canada</div>
      </div>
    </section>
  )
}
