import styles from './Architecture.module.css'

const layers = [
  {
    id: 'INTERFACE LAYER',
    nodes: [
      { id: 'SYS.01', title: 'Workflow Builder',     sub: 'Create & configure'    },
      { id: 'SYS.02', title: 'Approval Console',     sub: 'Review & authorize'    },
      { id: 'SYS.03', title: 'Monitoring Dashboard', sub: 'Track & observe'       },
    ],
    bright: true,
    arrow: true,
  },
  {
    id: 'ORCHESTRATION LAYER',
    nodes: [
      { id: 'ORC.01', title: 'Approval Engine',   sub: 'Permission validation' },
      { id: 'ORC.02', title: 'Execution Queue',   sub: 'Ordered dispatch'      },
      { id: 'ORC.03', title: 'Validation Layer',  sub: 'Pre-execution checks'  },
    ],
    bright: true,
    arrow: true,
  },
  {
    id: 'EXECUTION LAYER',
    nodes: [
      { id: 'EXE.01', title: 'Transaction Builder',  sub: 'Construct tx payload' },
      { id: 'EXE.02', title: 'On-Chain Validation',  sub: 'Verify before submit' },
      { id: 'EXE.03', title: 'Audit Logger',         sub: 'Immutable event log'  },
    ],
    bright: true,
    arrow: true,
    centerArrow: true,
  },
  {
    id: 'RECOVERY LAYER',
    nodes: [
      { id: 'REC.01', title: 'Rollback Engine',   sub: 'Revert on failure' },
      { id: 'REC.02', title: 'Recovery Monitor',  sub: 'Health & status'   },
      { id: 'REC.03', title: 'Alert System',      sub: 'Notify & escalate' },
    ],
    bright: false,
    arrow: false,
    sep: true,
  },
]

export default function Architecture() {
  return (
    <section className="section" id="architecture">
      <div className="sec-tag">// SECTION 04 — ARCHITECTURE <div className="sec-tag-line" /></div>
      <h2 className="sec-title">Platform Architecture</h2>
      <p className="sec-body">
        A modular infrastructure architecture designed for secure workflow automation,
        operational coordination, and digital asset execution.
      </p>

      <div className={styles.embed}>
        {/* inner grid bg */}
        <div className={styles.innerGrid} />

        {/* Header */}
        <div className={styles.archHd}>
          <div className={styles.archDot} />
          <span className={styles.archHdTitle}>PLATFORM ARCHITECTURE</span>
          <div className={styles.archHdLine} />
        </div>

        {layers.map((layer, li) => (
          <div key={li}>
            {layer.sep && <div className={styles.sep} />}
            <div className={styles.layerRow}>
              <div className={styles.layerLbl}>
                <span>{`// ${layer.id.replace(' ', '\n// ').split('//')[0]}`}</span>
                <span className={styles.lblSmall}>{layer.id}</span>
              </div>
              <div className={styles.nodes}>
                {layer.nodes.map((n, ni) => (
                  <div key={ni} className={`${styles.node} ${layer.bright ? styles.nodeBright : ''}`}>
                    <div className={`${styles.c} ${styles.ctlNode}`} />
                    <div className={`${styles.c} ${styles.ctrNode}`} />
                    <div className={`${styles.c} ${styles.cblNode}`} />
                    <div className={`${styles.c} ${styles.cbrNode}`} />
                    <div className={styles.nodeId}>{n.id}</div>
                    <div className={styles.nodeTitle}>{n.title}</div>
                    <div className={styles.nodeSub}>{n.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            {layer.arrow && (
              <div className={styles.connRow}>
                <div className={styles.connSp} />
                <div className={styles.connLines}>
                  {layer.centerArrow
                    ? [<div key={0} className={styles.connEmpty}/>, <div key={1} className={styles.connCell}><div className={styles.tick}/><div className={styles.arr}/></div>, <div key={2} className={styles.connEmpty}/>]
                    : layer.nodes.map((_, i) => (
                        <div key={i} className={styles.connCell}>
                          <div className={styles.tick} />
                          <div className={styles.arr} />
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Chain layer */}
        <div className={styles.layerRow}>
          <div className={styles.layerLbl}>
            <span className={styles.lblSmall}>// BLOCKCHAIN LAYER</span>
          </div>
          <div className={styles.nodes}>
            <div className={`${styles.node} ${styles.nodeSolana}`} style={{flex:'1.4'}}>
              <div className={`${styles.c} ${styles.ctlNode}`} />
              <div className={`${styles.c} ${styles.ctrNode}`} />
              <div className={`${styles.c} ${styles.cblNode}`} />
              <div className={`${styles.c} ${styles.cbrNode}`} />
              <div className={styles.nodeId}>CHN.01</div>
              <div className={styles.nodeTitle}>Solana</div>
              <div className={styles.nodeSub}>High-throughput layer-1</div>
            </div>
            <div className={`${styles.node} ${styles.nodeDash}`}>
              <div className={styles.nodeId}>CHN.02</div>
              <div className={`${styles.nodeTitle} ${styles.nodeTitleDash}`}>Multi-Chain</div>
              <div className={styles.phase4}>PHASE 4</div>
            </div>
          </div>
        </div>

        <div className={styles.archFt}>
          <div className={styles.archFtLine} />
          <span className={styles.archFtText}>COSMOS LEDGER LABS // TORONTO, CA // BUILT ON SOLANA</span>
          <div className={styles.archFtLine} />
        </div>
      </div>
    </section>
  )
}
