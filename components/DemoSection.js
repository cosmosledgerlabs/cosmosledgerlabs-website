import { useEffect, useRef, useState, Fragment } from 'react'
import styles from './DemoSection.module.css'

/* ── 审批引擎(可交互)────────────────────────────────
   发起审批 → 待审批(PENDING)→ 点 APPROVE → 已通过(APPROVED)
   每次操作向下方 ACTIVITY LOG 写一条反馈。数据全部为前端模拟。 */
function ApprovalEngine() {
  const [approvals, setApprovals] = useState([
    { id: 'WF_2026_001', desc: 'Multi-sig treasury transfer', s: 'APPROVED',   cls: 'ap', ast: 'aps' },
    { id: 'WF_2026_002', desc: 'Smart contract execution',    s: 'PENDING',    cls: 'pe', ast: 'pes' },
    { id: 'WF_2026_003', desc: 'Cross-chain validation',      s: 'VALIDATING', cls: 'va', ast: 'vas' },
    { id: 'WF_2026_004', desc: 'Batch settlement process',    s: 'QUEUED',     cls: 'qu', ast: 'qus' },
  ])
  const nextId = useRef(5)

  // 把一条反馈写进现有的 ACTIVITY LOG(与页面其它日志同款样式)
  const pushLog = (msg, kind) => {
    const wrap = document.getElementById('dd_log')
    if (!wrap) return
    const ts = new Date().toISOString().split('T')[1].substring(0, 8)
    const color = kind === 'ok' ? '#00cc88' : '#00e8ff'
    const div = document.createElement('div'); div.className = styles.logitem
    const t = document.createElement('span'); t.className = styles.ltime; t.textContent = ts
    const d = document.createElement('div'); d.className = styles.ldot; d.style.background = color
    const x = document.createElement('span')
    x.className = styles.ltext + ' ' + (kind === 'ok' ? styles.ok : styles.hi)
    x.textContent = msg
    div.append(t, d, x)
    wrap.insertBefore(div, wrap.firstChild)
    if (wrap.children.length > 4 && wrap.lastChild) wrap.removeChild(wrap.lastChild)
  }

  const approve = (id) => {
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, s: 'APPROVED', cls: 'ap', ast: 'aps' } : a
    ))
    pushLog(id + ' approved — 3/3 signers (simulated)', 'ok')
  }

  const newRequest = () => {
    const n = nextId.current++
    const id = 'WF_2026_' + String(n).padStart(3, '0')
    setApprovals(prev => [...prev, {
      id, desc: 'New workflow — awaiting approval', s: 'PENDING', cls: 'pe', ast: 'pes',
    }])
    pushLog('New approval request created — ' + id, 'hi')
  }

  return (
    <div className={styles.card}>
      <div className={styles.ct}>// APPROVAL ENGINE — INTERACTIVE</div>
      {approvals.map((a) => (
        <div key={a.id} className={`${styles.ai} ${styles[a.cls]}`}>
          <div>
            <div className={styles.aid}>{a.id}</div>
            <div className={styles.adesc}>{a.desc}</div>
          </div>
          <div className={styles.airight}>
            <span className={`${styles.ast} ${styles[a.ast]}`}>{a.s}</span>
            {a.s === 'PENDING' && (
              <button type="button" className={styles.approveBtn} onClick={() => approve(a.id)}>CLICK TO TEST</button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className={styles.newBtn} onClick={newRequest}>
        + NEW REQUEST (CLICK TO TEST)
      </button>
    </div>
  )
}

export default function Demo() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let block = 284729441, tpsVal = 2847, txIdx = 0, logIdx = 0

    const txIds = ['TX_P9Q8R7','TX_S6T5U4','TX_V3W2X1','TX_Y0Z9A8','TX_B7C6D5']
    const amts  = ['88,500 USDC','1,250 SOL','320,000 USDC','445 SOL','15,750 USDC']
    const logData = [
      {c:'#00e8ff',cls:'hi',m:'Workflow signature validated (simulated)'},
      {c:'#00cc88',cls:'ok',m:'Transaction batch confirmed — 3 txs (simulated)'},
      {c:'#2288aa',cls:'',m:'Approval threshold 3/3 reached'},
      {c:'#00cc88',cls:'ok',m:'Settlement simulated — customer-signed'},
      {c:'#00e8ff',cls:'hi',m:'Execution queued (simulated)'},
      {c:'#00cc88',cls:'ok',m:'Audit log entry recorded (simulated)'},
    ]
    const $ = id => el.querySelector("#dd_" + id)

    const timers = [
      setInterval(() => {
        const n = new Date()
        const e = $('clk'); if(e) e.textContent = n.toISOString().replace('T',' // ').split('.')[0]+' UTC'
      }, 1000),
      setInterval(() => {
        block += Math.floor(Math.random()*2+1)
        const bs = block.toLocaleString()
        const b=$('blk'); if(b) b.textContent=bs
        const bb=$('bb'); if(bb) bb.textContent='#'+bs
        const sn=$('sn'); if(sn) sn.textContent=bs
      }, 400),
      setInterval(() => {
        tpsVal = Math.floor(2600+Math.random()*500)
        const t=$('tps'); if(t) t.textContent=tpsVal.toLocaleString()
        const bt=$('bt'); if(bt) bt.textContent=tpsVal.toLocaleString()
      }, 800),
      setInterval(() => {
        const e=$('lat'); if(e) e.textContent=Math.floor(8+Math.random()*12)+'ms'
      }, 1200),
      setInterval(() => {
        const e=$('slt'); if(e) e.textContent=Math.floor(380+Math.random()*80)+'ms'
      }, 600),
      setInterval(() => {
        const list=$('txlist'); if(!list) return
        const ok = Math.random()>.15
        const color = ok ? '#00cc88' : '#00e8ff'
        const div=document.createElement('div'); div.className=styles.txitem
        const dot=document.createElement('div'); dot.className=styles.txd
        dot.style.background=color; dot.style.boxShadow=`0 0 8px ${color}`
        const idEl=document.createElement('span'); idEl.className=styles.txid; idEl.textContent=txIds[txIdx%5]
        const amtEl=document.createElement('span'); amtEl.className=styles.txamt; amtEl.textContent=amts[txIdx%5]
        const chEl=document.createElement('span'); chEl.className=styles.txch; chEl.textContent='SOL'
        div.append(dot, idEl, amtEl, chEl)
        list.insertBefore(div,list.firstChild)
        if(list.children.length>5 && list.lastChild) list.removeChild(list.lastChild)
        txIdx++
      }, 2500),
      setInterval(() => {
        const wrap=$('log'); if(!wrap) return
        const n=new Date(); const ts=n.toISOString().split('T')[1].substring(0,8)
        const lg=logData[logIdx%logData.length]
        const div=document.createElement('div'); div.className=styles.logitem
        const timeEl=document.createElement('span'); timeEl.className=styles.ltime; timeEl.textContent=ts
        const dot=document.createElement('div'); dot.className=styles.ldot; dot.style.background=lg.c
        const txtEl=document.createElement('span')
        txtEl.className=styles.ltext + (lg.cls==='hi' ? ' '+styles.hi : lg.cls==='ok' ? ' '+styles.ok : '')
        txtEl.textContent=lg.m
        div.append(timeEl, dot, txtEl)
        wrap.insertBefore(div,wrap.firstChild)
        if(wrap.children.length>4 && wrap.lastChild) wrap.removeChild(wrap.lastChild)
        logIdx++
      }, 1800),
      setInterval(() => {
        const bw=$('bw'); if(bw) bw.textContent=String(Math.floor(10+Math.random()*6))
        const bp=$('bp'); if(bp) bp.textContent=String(Math.floor(1+Math.random()*5))
      }, 3000),
    ]
    return () => timers.forEach(t => clearInterval(t))
  }, [])

  return (
    <section className="section" id="demo">
      <div className="sec-tag">// SECTION 04 — PLATFORM DEMO <div className="sec-tag-line"/></div>
      <h2 className="sec-title">Interactive Platform Demo</h2>
      <p className="sec-body">Interactive prototype of COSMOS Ledger Labs workflow automation — approval coordination, transaction validation, execution monitoring and recovery. All data shown is simulated; not yet running on-chain.</p>

      <div ref={ref} className={styles.wrap}>
        {/* 顶部栏 */}
        <div className={styles.topbar}>
          <div className={styles.logo}>COSMOS LEDGER LABS // WORKFLOW AUTOMATION INFRASTRUCTURE</div>
          <div className={styles.statuses}>
            <span className={styles.st}><span className={styles.dg}/><span style={{color:'#00ff88',fontSize:'9px'}}>DEMO MODE</span></span>
            <span className={styles.st}><span className={styles.db}/><span style={{color:'#00e8ff',fontSize:'9px'}}>SIMULATED ENV</span></span>
          </div>
          <div className={styles.clk} id="dd_clk">2026-07-01 // 00:00:00 UTC</div>
        </div>

        {/* 合规标注:如实说明这是可交互原型、数据模拟、未上链 */}
        <div className={styles.simbar}>
          <span className={styles.simdot}/>
          INTERACTIVE PROTOTYPE · SIMULATED DATA · NOT YET ON-CHAIN
        </div>

        {/* 工作流节点图 */}
        <div className={styles.nodemap} style={{marginBottom:'10px'}}>
          <div className={styles.ct}>// WORKFLOW EXECUTION MAP — WF_2026_003 — CROSS-CHAIN VALIDATION</div>
          <div className={styles.nodes}>
            {[
              {label:'CREATE',state:'done'},
              {label:'APPROVE',state:'done'},
              {label:'QUEUE',state:'done'},
              {label:'BUILD',state:'active'},
              {label:'VALIDATE',state:'wait'},
              {label:'SETTLE',state:'wait'},
              {label:'MONITOR',state:'wait'},
              {label:'AUDIT',state:'wait'},
              {label:'RECOVER',state:'wait'},
            ].map((n,i) => (
              <div key={i} className={styles.nd}>
                <div className={`${styles.nc} ${styles[n.state]}`}>{n.state==='done'?'✓':String(i+1).padStart(2,'0')}</div>
                <div className={`${styles.nl} ${styles[n.state]}`}>{n.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 主网格 */}
        <div className={styles.grid}>
          {/* 审批引擎 — 可交互 */}
          <ApprovalEngine />

          {/* 交易监控 */}
          <div className={styles.card}>
            <div className={styles.ct}>// TRANSACTION MONITOR · AUTO</div>
            <div id="dd_txlist">
              {[
                {id:'TX_A1B2C3D4',amt:'125,000 USDC',ok:true},
                {id:'TX_E5F6G7H8',amt:'890.5 SOL',ok:true},
                {id:'TX_I9J0K1L2',amt:'45,000 USDC',ok:null},
                {id:'TX_M3N4O5P6',amt:'2,100 SOL',ok:null},
                {id:'TX_Q7R8S9T0',amt:'500 USDC',ok:false},
              ].map((tx,i)=>(
                <div key={i} className={styles.txitem}>
                  <div className={styles.txd} style={{background:tx.ok===true?'#00cc88':tx.ok===false?'#ff4455':'#00e8ff',boxShadow:`0 0 8px ${tx.ok===true?'#00cc88':tx.ok===false?'#ff4455':'#00e8ff'}`}}/>
                  <span className={styles.txid}>{tx.id}</span>
                  <span className={styles.txamt}>{tx.amt}</span>
                  <span className={styles.txch}>SOL</span>
                </div>
              ))}
            </div>
          </div>

          {/* 执行流程 */}
          <div className={styles.card}>
            <div className={styles.ct}>// EXECUTION PIPELINE · AUTO</div>
            <div className={styles.pipeline}>
              {[
                {n:'01',label:'User Creates Workflow',state:'done'},
                {n:'02',label:'Approval Validation',state:'done'},
                {n:'03',label:'Execution Queue',state:'done'},
                {n:'04',label:'Unsigned-Tx Builder',state:'active'},
                {n:'05',label:'On-Chain Validation',state:'wait',badge:'SIM'},
                {n:'06',label:'Settlement — customer-signed',state:'wait'},
                {n:'07',label:'Execution Monitoring',state:'wait'},
                {n:'08',label:'Audit Logging',state:'wait'},
                {n:'09',label:'Rollback Recovery',state:'wait'},
              ].map((s,i,arr)=>(
                <Fragment key={i}>
                  <div className={styles.pstep}>
                    <div className={`${styles.pnum} ${styles[s.state]}`}>{s.state==='done'?'✓':s.n}</div>
                    <div className={`${styles.pname} ${styles[s.state]}`}>{s.label}</div>
                    {s.badge && <div className={styles.pbadge}>{s.badge}</div>}
                  </div>
                  {i<arr.length-1 && <div className={`${styles.pbar} ${styles[s.state]}`}/>}
                </Fragment>
              ))}
            </div>
          </div>

          {/* 监控Dashboard */}
          <div className={styles.card}>
            <div className={styles.ct}>// RECOVERY MONITOR & NETWORK · AUTO</div>
            <div className={styles.mg}>
              <div className={styles.m}><div className={styles.ml}>UPTIME</div><div className={`${styles.mv} ${styles.g}`}>99.98%</div><div className={styles.msub}>30-day avg</div></div>
              <div className={styles.m}><div className={styles.ml}>LATENCY</div><div className={`${styles.mv} ${styles.b}`} id="dd_lat">12ms</div><div className={styles.msub}>Avg response</div></div>
              <div className={styles.m}><div className={styles.ml}>RECOVERED</div><div className={`${styles.mv} ${styles.w}`}>4/4</div><div className={styles.msub}>This session</div></div>
              <div className={styles.m}><div className={styles.ml}>ALERTS</div><div className={`${styles.mv} ${styles.d}`}>0</div><div className={styles.msub}>Active</div></div>
              <div className={styles.m}><div className={styles.ml}>BLOCK</div><div className={`${styles.mv} ${styles.b}`} id="dd_blk" style={{fontSize:'12px'}}>284,729,441</div><div className={styles.msub}>Height</div></div>
              <div className={styles.m}><div className={styles.ml}>TPS</div><div className={`${styles.mv} ${styles.g}`} id="dd_tps">2,847</div><div className={styles.msub}>Transactions/s</div></div>
              <div className={styles.m}><div className={styles.ml}>SLOT TIME</div><div className={`${styles.mv} ${styles.w}`} id="dd_slt">400ms</div><div className={styles.msub}>Avg</div></div>
              <div className={styles.m}><div className={styles.ml}>VALIDATORS</div><div className={`${styles.mv} ${styles.b}`} style={{fontSize:'16px'}}>1,926</div><div className={styles.msub}>Active</div></div>
            </div>
            {/* 实时日志 */}
            <div className={styles.ct} style={{marginTop:'4px'}}>// ACTIVITY LOG</div>
            <div id="dd_log">
              <div className={styles.logitem}><span className={styles.ltime}>14:25:12</span><div className={styles.ldot} style={{background:'#00e8ff'}}/><span className={`${styles.ltext} ${styles.hi}`}>Validation simulated for WF_003</span></div>
              <div className={styles.logitem}><span className={styles.ltime}>14:24:38</span><div className={styles.ldot} style={{background:'#00cc88'}}/><span className={`${styles.ltext} ${styles.ok}`}>WF_001 approval confirmed — 3/3 signers</span></div>
              <div className={styles.logitem}><span className={styles.ltime}>14:23:55</span><div className={styles.ldot} style={{background:'#2288aa'}}/><span className={styles.ltext}>System health check passed</span></div>
              <div className={styles.logitem}><span className={styles.ltime}>14:23:01</span><div className={styles.ldot} style={{background:'#00cc88'}}/><span className={`${styles.ltext} ${styles.ok}`}>TX_A1B2 settlement simulated</span></div>
            </div>
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className={styles.bb}>
          <span>ENV <span className={styles.bv}>SIMULATED</span></span>
          <span>BLOCK <span className={styles.bv} id="dd_bb">#284,729,441</span></span>
          <span>SLOT <span className={styles.bv} id="dd_sn">284,729,441</span></span>
          <span>TPS <span className={styles.bv} id="dd_bt">2,847</span></span>
          <span>ACTIVE WF <span className={styles.bv} id="dd_bw">12</span></span>
          <span>PENDING TX <span className={styles.bv} id="dd_bp">3</span></span>
          <span>VERSION <span className={styles.bv}>v1.0.0-alpha</span></span>
          <span>BUILT FOR <span className={styles.bv}>SOLANA</span></span>
        </div>
      </div>
    </section>
  )
}
