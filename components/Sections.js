import styles from './Sections.module.css'

/* 2.2 — Problem: The delivery gap (client delivery pain, not platform narrative) */
export function Problem() {
  return (
    <section className={styles.section} id="problem">
      <div className="sec-tag">// SECTION 02 — THE DELIVERY GAP <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>THE DELIVERY GAP</h2>
      <p className={styles.secBody}>Digital asset teams are strong on protocol design and community — and stretched thin on delivery. Launches stall on the unglamorous work. Generic agencies don&apos;t understand on-chain mechanics; protocol engineers don&apos;t want to build front-ends. That gap is where launches slip.</p>
      <div className={styles.cardGrid}>
        <div className={styles.card}><div className={styles.cardName}>A CREDIBLE WEBSITE</div><div className={styles.cardText}>A site that earns trust from users, partners, and reviewers on day one.</div></div>
        <div className={styles.card}><div className={styles.cardName}>AN ACCURATE DASHBOARD</div><div className={styles.cardText}>A dashboard that reflects on-chain state accurately, not approximately.</div></div>
        <div className={styles.card}><div className={styles.cardName}>A CORRECT TOKEN SETUP</div><div className={styles.cardText}>A token deployed and configured correctly the first time.</div></div>
        <div className={styles.card}><div className={styles.cardName}>A CLAIM PORTAL THAT HOLDS</div><div className={styles.cardText}>A claim portal that holds up on launch day, under real load.</div></div>
      </div>
    </section>
  )
}

/* 2.3 — Solution: COSMOS closes the delivery gap */
export function Solution() {
  return (
    <section className={styles.section} id="solution">
      <div className="sec-tag">// SECTION 03 — SOLUTION <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>COSMOS CLOSES THE DELIVERY GAP</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>COSMOS is a specialized technical delivery firm for digital asset projects. We scope, build, test, and hand over the operational infrastructure around your protocol or token — on a fixed scope, with devnet verification before anything touches mainnet, and without ever taking custody of your funds or keys. You keep control; we do the engineering.</p>
      </div>
    </section>
  )
}

/* 2.5 — Replaces the old 9-layer architecture + execution lifecycle */
export function HowWeWork() {
  const steps = [
    {t:'SCOPE', d:'A call to define exactly what will be built, and what won\u2019t.'},
    {t:'QUOTE', d:'Fixed scope, written quote, milestone schedule.'},
    {t:'BUILD', d:'Version-controlled development against the agreed specification.'},
    {t:'VERIFY', d:'Everything tested on Solana devnet before any mainnet action.'},
    {t:'HANDOVER', d:'Code, credentials, and a run-book your team can operate without us.'},
  ]
  return (
    <section className={styles.section} id="how-we-work">
      <div className="sec-tag">// SECTION 05 — HOW WE WORK <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>HOW WE WORK</h2>
      <div className={styles.wfList}>
        {steps.map((s,i) => (
          <span key={i} style={{display:'contents'}}>
            <div className={styles.wfStep}>
              <div className={styles.wfDot}/>
              <span className={styles.wfNum}>{String(i+1).padStart(2,'0')} //</span>
              <span className={styles.wfLabel}>{s.t} — {s.d}</span>
            </div>
            {i < steps.length-1 && <div className={styles.wfLine}/>}
          </span>
        ))}
      </div>
    </section>
  )
}

/* 2.6 — Security: COSMOS's own delivery practices only; no audit-execution parties named */
export function Security() {
  const items = [
    {t:'LEAST-PRIVILEGE ACCESS', d:'Least-privilege access on every engagement; no custody of client keys or funds.'},
    {t:'DEVNET VERIFICATION', d:'Everything is verified on Solana devnet before any mainnet action.'},
    {t:'AUTHORITIES TO SPEC', d:'Token authorities configured only to the client\u2019s written specification.'},
    {t:'VERSION-CONTROLLED HANDOVER', d:'Version-controlled code with a documented handover.'},
    {t:'INDEPENDENT AUDIT REFERRAL', d:'Where an audit is required, we refer clients to qualified independent audit firms — COSMOS does not perform audits.'},
  ]
  return (
    <section className={styles.section} id="security">
      <div className="sec-tag">// SECTION 06 — SECURITY <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>SECURITY AS A DELIVERY PRACTICE</h2>
      <p className={styles.secBody}>Security on every engagement is procedural, not promotional: least-privilege access and no custody of client keys or funds; devnet verification before any mainnet action; token authorities configured only to the client&apos;s written specification; version-controlled code with a documented handover; and referral to qualified independent audit firms where an audit is required — COSMOS does not perform audits.</p>
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

/* 2.7 — Replaces the old Ecosystem positioning */
export function Technology() {
  return (
    <section className={styles.section} id="technology">
      <div className="sec-tag">// SECTION 07 — TECHNOLOGY <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>TECHNOLOGY WE BUILD WITH</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>Solana · React / Next.js · SPL token standards · established ecosystem tooling including Streamflow, Squads, Magna, and Helius. We build against the tools our clients already use.</p>
      </div>
    </section>
  )
}

/* 2.8 — Where We Are: no dates, no commitments */
export function WhereWeAre() {
  const items = [
    {t:'NOW', d:'Delivering client engagements across our six service lines, with a live on-chain engineering demo on Solana devnet.'},
    {t:'NEXT', d:'Expanding our vetted engineering partner network and publishing delivery case studies.'},
    {t:'LATER', d:'Productizing the internal workflow-orchestration tooling behind our demo.'},
  ]
  return (
    <section className={styles.section} id="where-we-are">
      <div className="sec-tag">// SECTION 08 — WHERE WE ARE <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>WHERE WE ARE</h2>
      <div className={styles.cardGrid}>
        {items.map((item,i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardName}>{item.t}</div>
            <div className={styles.cardText}>{item.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* 2.10 — Aladdin strategic cooperation: retained */
export function Partners() {
  return (
    <section className={styles.section} id="partners">
      <div className="sec-tag">// SECTION 09 — STRATEGIC COOPERATION <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>STRATEGIC COOPERATION</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>COSMOS Ledger Labs has signed a strategic-cooperation agreement with Aladdin Cyber Security (Dubai, UAE) — a leading UAE cybersecurity and cloud provider with proprietary technology, founded in 2023 and based in Dubai Internet City. Aladdin brings front-line experience on major security incidents for enterprises and government agencies, spanning smart-contract auditing, full-stack penetration testing, and 24/7 multi-chain incident response.</p>
        <p className={styles.ecoText}><em>Aladdin Cyber Security — strategic partner.</em></p>
      </div>
    </section>
  )
}

/* 2.11 — Team: founder + contracted engineering network; no equity numbers */
export function Team() {
  return (
    <section className={styles.section} id="team">
      <div className="sec-tag">// SECTION 10 — TEAM <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>TEAM</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>COSMOS was founded by V. Zheng, a repeat founder based in Toronto. She designed the company&apos;s service model, shipped its website and its on-chain devnet demonstration, and leads client engagements directly. Delivery is carried out with contracted engineering teams vetted by COSMOS; audit and other specialist work is referred to qualified independent firms.</p>
      </div>
      <div className={`${styles.steelCard} ${styles.teamBlock}`}>
        <div className={styles.teamHead}>We&apos;re Hiring</div>
        <p className={styles.ecoText}>A technical co-founder / senior full-stack engineer (React/Next.js + Solana) to lead client delivery.</p>
        <p className={styles.ecoText}>Write to <a href="mailto:info@cosmosledgerlabs.com?subject=Technical%20Co-founder%20Inquiry" className={styles.inlineLink}>info@cosmosledgerlabs.com</a></p>
      </div>
    </section>
  )
}

/* 2.12 — Contact: unchanged */
export function Contact() {
  return (
    <section className={styles.section} id="contact">
      <div className="sec-tag">// SECTION 11 — CONTACT <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>CONTACT</h2>
      <div className={styles.steelCard}>
        <div className={styles.contactEmail}><a href="mailto:info@cosmosledgerlabs.com" style={{color:'inherit',textDecoration:'none'}}>✉ info@cosmosledgerlabs.com</a></div>
        <div className={styles.contactLocation}>📍 Toronto, Ontario, Canada</div>
      </div>
    </section>
  )
}
