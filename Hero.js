import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    let animId
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')

    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    // 深蓝大光晕 — 右侧更亮，像截图
    const blobs = [
      { x:.75, y:.45, r:.80, c:[0,80,200],  ph:0,   sp:.00008 }, // 主右侧大光晕
      { x:.85, y:.60, r:.60, c:[0,60,180],  ph:1.5, sp:.00006 },
      { x:.60, y:.50, r:.50, c:[0,40,160],  ph:3.0, sp:.00009 },
      { x:.90, y:.30, r:.40, c:[0,100,220], ph:4.5, sp:.00007 },
      { x:.50, y:.70, r:.35, c:[0,30,140],  ph:2.0, sp:.00005 },
    ]

    // 脉冲环
    const rings = Array.from({length:4}, (_,i) => ({age:i*2, max:8}))

    let t = 0

    function draw() {
      const W = cv.width, H = cv.height
      ctx.clearRect(0, 0, W, H)

      // 深蓝大光晕 — 右侧集中，像截图
      blobs.forEach((b, bi) => {
        const px = b.x*W + Math.sin(t*b.sp*6000+b.ph)*W*.06
        const py = b.y*H + Math.cos(t*b.sp*4000+b.ph)*H*.05
        const r  = b.r * Math.min(W,H)
        const breath = .25 + Math.sin(t*(Math.PI/1.1)+b.ph)*.10

        const g = ctx.createRadialGradient(px,py,0,px,py,r)
        if (bi===0) {
          // 主光晕最亮
          g.addColorStop(0,   `rgba(${b.c},.50)`)
          g.addColorStop(.18, `rgba(${b.c},.30)`)
          g.addColorStop(.45, `rgba(${b.c},.12)`)
          g.addColorStop(.72, `rgba(${b.c},.03)`)
          g.addColorStop(1,   `rgba(${b.c},0)`)
        } else {
          g.addColorStop(0,   `rgba(${b.c},${breath.toFixed(2)})`)
          g.addColorStop(.4,  `rgba(${b.c},${(breath*.3).toFixed(2)})`)
          g.addColorStop(.8,  `rgba(${b.c},${(breath*.06).toFixed(2)})`)
          g.addColorStop(1,   `rgba(${b.c},0)`)
        }
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill()
      })

      // 脉冲扩散环
      const cx = W*.75, cy = H*.45
      rings.forEach(r => {
        r.age += .010; if(r.age>r.max) r.age=0
        const e = 1-Math.pow(1-r.age/r.max,3)
        const rad = e*Math.min(W,H)*.55
        const a = (1-e)*.28
        if(a<.005) return
        const g = ctx.createRadialGradient(cx,cy,rad*.8,cx,cy,rad)
        g.addColorStop(0, 'rgba(0,120,220,0)')
        g.addColorStop(.7,`rgba(0,160,255,${(a*.3).toFixed(2)})`)
        g.addColorStop(.9,`rgba(0,200,255,${a.toFixed(2)})`)
        g.addColorStop(1, 'rgba(0,120,220,0)')
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.fill()
      })

      ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'
      t+=.016; animId=requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize',resize) }
  }, [])

  return (
    <section className={styles.hero} id="top">
      {/* CSS底层光晕 — 即时显示无黑屏 */}
      <div className={styles.auroraBase}>
        <div className={styles.b1}/><div className={styles.b2}/>
        <div className={styles.b3}/><div className={styles.b4}/>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true"/>

      <div className={styles.content}>
        {/* 全息标签 — 像截图 */}
        <div className={styles.badge}>
          <span className={styles.badgeLight}/>
          <span className={styles.dot}/>
          // BUILT ON SOLANA
        </div>

        {/* 钢铁金属大标题 — 像截图 */}
        <h1 className={styles.title}>
          <span className={styles.tw}>Workflow Infrastructure for</span>
          <span className={styles.tw}><span className={styles.tc}>Digital Asset</span> Operations</span>
        </h1>

        <div className={styles.glow}/>

        <div className={styles.sub}>
          <div>
            <div className={styles.subLbl}>COMPANY</div>
            <div className={styles.subVal}>COSMOS LEDGER LABS</div>
          </div>
          <div className={styles.subDiv}/>
          <div>
            <div className={styles.subLbl}>INFRASTRUCTURE</div>
            <div className={`${styles.subVal} ${styles.dim}`}>WORKFLOW AUTOMATION</div>
          </div>
        </div>

        <p className={styles.body}>
          Secure workflow orchestration, approval coordination, transaction validation, monitoring, and recovery infrastructure for modern digital asset operations.
        </p>

        <div className={styles.btns}>
          <a href="#architecture" className={styles.btnP}>VIEW ARCHITECTURE</a>
          <a href="#contact"      className={styles.btnS}>CONTACT US</a>
        </div>
      </div>
    </section>
  )
}
