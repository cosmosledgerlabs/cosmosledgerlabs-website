import styles from './Sections.module.css'

export function Problem() {
  return (
    <section className="section" id="problem">
      <div className="sec-tag">// SECTION 02 — PROBLEM <div className="sec-tag-line"/></div>
      <h2 className="sec-title">The Problem</h2>
      <p className="sec-body">Managing digital asset operations across approvals, execution workflows, monitoring, and recovery processes remains fragmented and operationally complex.</p>
      <div className={styles.cg}>
        {[
          ['APPROVAL FRAGMENTATION','No unified approval coordination layer across digital asset operations.'],
          ['EXECUTION COMPLEXITY','Coordination gaps across workflow execution steps.'],
          ['MONITORING LIMITS','Limited visibility into live workflow status and execution.'],
          ['RECOVERY RISKS','No standardized rollback and recovery mechanisms.'],
        ].map(([n,t],i)=>(
          <div key={i} className={styles.card}>
            <div className={styles.cn}>{n}</div>
            <div className={styles.ct}>{t}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Solution() {
  return (
    <section className="section" id="solution">
      <div className="sec-tag">// SECTION 03 — SOLUTION <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Solution</h2>
      <div className="steel"><p className="sec-body">COSMOS Ledger Labs is building workflow automation infrastructure designed to streamline approval workflows, execution coordination, transaction validation, monitoring systems, and operational recovery mechanisms.</p></div>
    </section>
  )
}

export function Architecture() {
  const layers = [
    {label:'INTERFACE LAYER',nodes:[{id:'SYS.01',t:'Workflow Builder',s:'Create & configure'},{id:'SYS.02',t:'Approval Console',s:'Review & authorize'},{id:'SYS.03',t:'Monitoring Dashboard',s:'Track & observe'}],hi:true,arrow:true},
    {label:'ORCHESTRATION LAYER',nodes:[{id:'ORC.01',t:'Approval Engine',s:'Permission validation'},{id:'ORC.02',t:'Execution Queue',s:'Ordered dispatch'},{id:'ORC.03',t:'Validation Layer',s:'Pre-execution checks'}],hi:true,arrow:true},
    {label:'EXECUTION LAYER',nodes:[{id:'EXE.01',t:'Transaction Builder',s:'Construct tx payload'},{id:'EXE.02',t:'On-Chain Validation',s:'Verify before submit'},{id:'EXE.03',t:'Audit Logger',s:'Immutable event log'}],hi:true,arrow:true,center:true},
    {label:'RECOVERY LAYER',nodes:[{id:'REC.01',t:'Rollback Engine',s:'Revert on failure'},{id:'REC.02',t:'Recovery Monitor',s:'Health & status'},{id:'REC.03',t:'Alert System',s:'Notify & escalate'}],hi:false,sep:true},
  ]
  return (
    <section className="section" id="architecture">
      <div className="sec-tag">// SECTION 04 — ARCHITECTURE <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Platform Architecture</h2>
      <p className="sec-body">A modular infrastructure architecture designed for secure workflow automation, operational coordination, and digital asset execution.</p>
      <div className={styles.arch}>
        <div className={styles.archHd}><div className={styles.archDot}/><span className={styles.archT}>PLATFORM ARCHITECTURE</span><div className={styles.archL}/></div>
        {layers.map((layer,li)=>(
          <div key={li}>
            {layer.sep && <div className={styles.archSep}/>}
            <div className={styles.lbl}>{`// ${layer.label}`}</div>
            <div className={styles.nodes}>
              {layer.nodes.map((n,ni)=>(
                <div key={ni} className={`${styles.node} ${layer.hi?styles.hi:''}`}>
                  <div className={styles.nid}>{n.id}</div>
                  <div className={styles.nt}>{n.t}</div>
                  <div className={styles.ns}>{n.s}</div>
                </div>
              ))}
            </div>
            {layer.arrow && (
              <div className={styles.conn}>
                {layer.center
                  ? <><div className={styles.ce}/><div className={styles.cc}><div className={styles.tk}/><div className={styles.ar}/></div><div className={styles.ce}/></>
                  : [0,1,2].map(i=><div key={i} className={styles.cc}><div className={styles.tk}/><div className={styles.ar}/></div>)
                }
              </div>
            )}
          </div>
        ))}
        <div className={styles.archSep}/>
        <div className={styles.lbl}>// BLOCKCHAIN LAYER</div>
        <div className={styles.nodes} style={{gridTemplateColumns:'1.4fr 1fr'}}>
          <div className={`${styles.node} ${styles.sol}`}><div className={styles.nid}>CHN.01</div><div className={styles.nt}>Solana</div><div className={styles.ns}>High-throughput layer-1</div></div>
          <div className={`${styles.node} ${styles.dsh}`}><div className={styles.nid}>CHN.02</div><div className={`${styles.nt} ${styles.ntDsh}`}>Multi-Chain</div><span className={styles.ph4}>PHASE 4</span></div>
        </div>
        <div className={styles.archFt}><div className={styles.archFL}/><span className={styles.archFT}>COSMOS LEDGER LABS // TORONTO, CA // BUILT ON SOLANA</span><div className={styles.archFL}/></div>
      </div>
    </section>
  )
}

export function Workflow() {
  const steps=['User Creates Workflow','Approval Validation','Execution Queue','Transaction Builder','On-Chain Validation','Transaction Execution','Execution Monitoring','Audit Logging','Rollback Recovery']
  return (
    <section className="section" id="workflow">
      <div className="sec-tag">// SECTION 05 — WORKFLOW LIFECYCLE <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Execution Workflow Lifecycle</h2>
      <div className={styles.wf}>
        {steps.map((s,i)=>(
          <div key={i}>
            <div className={styles.ws}><div className={styles.wd}/><span className={styles.wn}>{String(i+1).padStart(2,'0')} //</span><span className={styles.wl}>{s}</span></div>
            {i<steps.length-1 && <div className={styles.wline}/>}
          </div>
        ))}
      </div>
    </section>
  )
}

export function Security() {
  return (
    <section className="section" id="security">
      <div className="sec-tag">// SECTION 06 — SECURITY &amp; RECOVERY <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Operational Security &amp; Recovery</h2>
      <div className={styles.sg}>
        {['Approval Validation','Permission Controls','Transaction Validation','Monitoring Systems','Rollback Recovery','Execution Integrity'].map((t,i)=>(
          <div key={i} className={styles.si}><div className={styles.sd}/><span className={styles.st}>{t}</span></div>
        ))}
      </div>
    </section>
  )
}

export function Ecosystem() {
  return (
    <section className="section" id="ecosystem">
      <div className="sec-tag">// SECTION 07 — ECOSYSTEM &amp; EXPERIENCE <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Ecosystem &amp; Experience</h2>
      <div className="steel">
        <p className="sec-body">The founding team brings experience from startup development, ecosystem building, and ventures that have successfully secured external funding and institutional support.</p>
        <p className="sec-body" style={{marginTop:'12px'}}>This experience is being applied to the development of COSMOS Ledger Labs and its long-term infrastructure vision.</p>
      </div>
    </section>
  )
}

export function Roadmap() {
  const phases = [
    {n:'01',ph:'PHASE 1',t:'ARCHITECTURE',items:['Architecture','MVP','Core Infrastructure'],s:'CURRENT',sc:'sa',prog:'100%'},
    {n:'02',ph:'PHASE 2',t:'EXECUTION',items:['Approval Engine','Workflow Coordination','Transaction Validation'],s:'NEXT',sc:'sn',prog:'55%'},
    {n:'03',ph:'PHASE 3',t:'MONITORING',items:['Monitoring','Recovery Layer','Operational Automation'],s:'PLANNED',sc:'sp',prog:'25%',dim:true},
    {n:'04',ph:'PHASE 4',t:'SCALE',items:['Scalability','Ecosystem Integrations','Multi-Chain Expansion'],s:'FUTURE',sc:'sf',prog:'8%',dark:true},
  ]
  return (
    <section className="section" id="roadmap">
      <div className="sec-tag">// SECTION 08 — TECHNICAL ROADMAP <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Technical Roadmap</h2>
      <div className={styles.rm}>
        {phases.map((p,i)=>(
          <div key={i} className={styles.rmc} style={{'--prog':p.prog}}>
            <div className={styles.rmTop}>
              <div className={styles.rmL}>
                <div className={styles.rmN}>{p.n}</div>
                <div>
                  <div className={styles.rmPh}>{`// ${p.ph}`}</div>
                  <div className={`${styles.rmT} ${p.dim?styles.rmDim:''} ${p.dark?styles.rmDark:''}`}>{p.t}</div>
                </div>
              </div>
              <div className={`${styles.rms} ${styles[p.sc]}`}>{p.s}</div>
            </div>
            <div className={styles.rmI}>
              {p.items.map((item,j)=>(
                <div key={j} className={styles.ri}><span className={styles.rs}>//</span>{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Downloads() {
  return (
    <section className="section" id="deck">
      <div className="sec-tag">// SECTION 09 — DOCUMENTS <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Download Documents</h2>
      <div className={styles.dlBox}>
        <p className={styles.dlText}>Access the platform vision, architecture design, roadmap, and development strategy. Both documents available for download.</p>
        <div className={styles.dlBtns}>
          <a href="/investor-deck.pdf" className={styles.bdl}>⬇ INVESTOR DECK</a>
          <a href="/architecture-diagram.pdf" className={styles.bdl2}>⬇ ARCHITECTURE DIAGRAM</a>
        </div>
      </div>
    </section>
  )
}

export function Team() {
  return (
    <section className="section" id="team">
      <div className="sec-tag">// SECTION 10 — TEAM <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Team</h2>
      <div className="steel">
        <div className={styles.tn}>COSMOS LEDGER LABS</div>
        <div className={styles.tl}>📍 Toronto, Canada</div>
        <p className={styles.td}>Building workflow infrastructure for digital asset operations.</p>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="section" id="contact">
      <div className="sec-tag">// SECTION 11 — CONTACT <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Contact</h2>
      <div className={`steel ${styles.contactCard}`}>
        <div className={styles.cemail}><span>✉</span><a href="mailto:info@cosmosledgerlabs.com">info@cosmosledgerlabs.com</a></div>
        <div className={styles.cloc}>📍 Toronto, Canada</div>
      </div>
    </section>
  )
}
