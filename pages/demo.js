// pages/demo.js
// Full-screen showcase demo (cosmosledgerlabs.com/demo).
// A simulated playback of the /flow devnet demo, built for large screens,
// conference booths and phones. It loops on its own. No wallet, no network
// calls, no real funds. Every other page of the site is untouched.
//
// Full screen: computers, Android and iPad use the browser's real full-screen
// mode. iPhone Safari does not allow web pages to hide its bars, so the page
// shows "Add to Home Screen" instructions; opened from that icon, it runs
// without browser bars (this page points the home-screen icon at /demo via
// /demo.webmanifest while it is open).
//
// All styles are scoped under .sd-root and all JavaScript runs from this
// bundled file, so the site's Content-Security-Policy is respected.

import Head from 'next/head'
import { useEffect } from 'react'

const SCENARIOS = [
  { name: 'Everything succeeds', fail: 0 },
  { name: 'Distribution fails', fail: 3 },
  { name: 'Vesting fails', fail: 2 },
  { name: 'Approval fails', fail: 1 },
]
const STEP = ['', 'Approve', 'Vesting setup', 'Distribution']
const SPEEDS = [1, 1.5, 2, 0.75]

function Cube() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M32 5 57 19v26L32 59 7 45V19z" />
        <path d="M7 19l25 14 25-14M32 33v26" />
      </g>
    </svg>
  )
}

export default function Demo() {
  useEffect(() => {
    const $ = (id) => document.getElementById(id)
    const st = { paused: false, speed: 1, skip: false, alive: true, si: 0, started: false }
    const cleanups = []
    const on = (target, ev, fn, opts) => {
      target.addEventListener(ev, fn, opts)
      cleanups.push(() => target.removeEventListener(ev, fn, opts))
    }

    document.body.classList.add('sd-body')

    // Point "Add to Home Screen" at /demo while this page is open.
    const manifest = document.querySelector('link[rel="manifest"]')
    const oldManifest = manifest ? manifest.getAttribute('href') : null
    if (manifest) manifest.setAttribute('href', '/demo.webmanifest')

    // Hide the live-chat bubble on the showcase screen.
    const crisp = (cmd) => { try { if (window.$crisp) window.$crisp.push(['do', cmd]) } catch (e) {} }
    crisp('chat:hide')
    const crispTimer = setTimeout(() => crisp('chat:hide'), 2500)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* ================= Warp background ================= */
    const cv = $('sd-warp')
    const ctx = cv.getContext('2d')
    let W = 0, H = 0, stars = [], raf = 0
    const newStar = (any) => ({ x: (Math.random() * 2 - 1) * W, y: (Math.random() * 2 - 1) * H, z: any ? Math.random() * W : W, pz: 0 })
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth; H = window.innerHeight
      cv.width = W * dpr; cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(900, (W * H) / 2200))
      stars = []
      for (let i = 0; i < count; i++) stars.push(newStar(true))
    }
    const drawWarp = () => {
      if (!st.alive) return
      ctx.fillStyle = 'rgba(0,1,10,0.38)'
      ctx.fillRect(0, 0, W, H)
      const cx = W / 2, cy = H / 2
      const v = reduce ? 0 : 7 * st.speed * (st.paused ? 0.25 : 1)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        s.pz = s.z; s.z -= v
        if (s.z < 1) { stars[i] = newStar(false); continue }
        const k = W / 4
        const x = cx + (s.x / s.z) * k, y = cy + (s.y / s.z) * k
        const px = cx + (s.x / s.pz) * k, py = cy + (s.y / s.pz) * k
        if (x < 0 || x > W || y < 0 || y > H) { stars[i] = newStar(false); continue }
        const a = 1 - s.z / W
        ctx.strokeStyle = 'rgba(' + (a > 0.7 ? '120,220,255,' : '0,162,255,') + (0.25 + a * 0.75) + ')'
        ctx.lineWidth = Math.max(0.6, a * 2.4)
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x + (reduce ? 1 : 0), y); ctx.stroke()
      }
      raf = requestAnimationFrame(drawWarp)
    }
    on(window, 'resize', resize)

    /* ================= Demo engine ================= */
    let bal = { owner: 1000000, escrow: 0, recip: 0 }

    const wait = (ms) => new Promise((res) => {
      let left = ms, last = performance.now()
      const tick = (now) => {
        if (!st.alive || st.skip) { res(); return }
        if (!st.paused) left -= (now - last) * st.speed
        last = now
        if (left <= 0) res(); else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    const fmt = (n) => n.toLocaleString('en-CA')
    const renderBal = (changed) => {
      [['sd-bOwner', 'owner'], ['sd-bEscrow', 'escrow'], ['sd-bRecip', 'recip']].forEach(([id, key]) => {
        const el = $(id); if (!el) return
        const txt = fmt(bal[key])
        if (el.textContent !== txt) {
          el.textContent = txt
          if (changed) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 900) }
        }
      })
    }
    const sig = () => {
      const a = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let s = ''
      for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]
      s += '...'
      for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]
      return s
    }
    const log = (msg, cls, label) => {
      const ol = $('sd-log'); if (!ol) return
      const li = document.createElement('li')
      const d = new Date()
      const t = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => ('0' + n).slice(-2)).join(':')
      const a = document.createElement('span'); a.className = 't'; a.textContent = t
      const b = document.createElement('span'); b.className = 'm'; b.textContent = msg
      const c = document.createElement('span'); c.className = 's ' + cls; c.textContent = label
      li.append(a, b, c)
      ol.insertBefore(li, ol.firstChild)
      while (ol.children.length > 8) ol.removeChild(ol.lastChild)
    }
    const caption = (text, cls) => {
      const c = $('sd-caption'); if (!c) return
      c.textContent = text
      c.className = 'sd-caption' + (cls ? ' ' + cls : '')
    }
    const node = (i, state, label) => {
      const n = $('sd-n' + i); if (!n) return
      n.className = 'sd-node' + (state ? ' ' + state : '')
      n.querySelector('.sd-status').textContent = label
    }
    const link = (i, dir) => {
      const l = $('sd-l' + i); if (!l) return
      l.className = 'sd-link'
      void l.offsetWidth
      if (dir) { l.style.setProperty('--dur', (0.9 / st.speed) + 's'); l.className = 'sd-link ' + dir }
    }
    const resetBoard = () => { for (let i = 1; i <= 3; i++) node(i, '', 'Waiting'); link(1); link(2) }
    const applyStep = (i) => {
      if (i === 2) { bal.owner -= 1000; bal.escrow += 1000 }
      if (i === 3) { bal.escrow -= 1000; bal.recip += 1000 }
      renderBal(true)
    }
    const undoStep = (i) => {
      if (i === 2) { bal.escrow -= 1000; bal.owner += 1000 }
      renderBal(true)
    }

    const runScenario = async (idx) => {
      const sc = SCENARIOS[idx]
      $('sd-runLabel').textContent = 'Run ' + (idx + 1) + ' of ' + SCENARIOS.length
      $('sd-scenLabel').textContent = sc.name
      resetBoard()
      caption(sc.fail ? 'Test run: a failure will be injected at step ' + sc.fail + '.' : 'Test run: all three steps should complete.')
      await wait(2200)

      for (let i = 1; i <= 3; i++) {
        if (!st.alive || st.skip) return
        if (i > 1) { link(i - 1, 'fwd'); await wait(900) }
        node(i, 'running', 'Sending')
        caption('Step ' + i + ': ' + STEP[i] + '. Sending transaction to Solana devnet.')
        await wait(1700)
        if (!st.alive || st.skip) return

        if (sc.fail === i) {
          node(i, 'failed', 'Failed')
          log(STEP[i] + ' transaction rejected', 'bad', 'FAILED')
          caption('Step ' + i + ' failed.' + (i > 1 ? ' Rolling back the completed steps.' : ' Nothing ran before it, so there is nothing to undo.'), 'bad')
          for (let k = i + 1; k <= 3; k++) node(k, 'skipped', 'Not run')
          await wait(2200)

          for (let j = i - 1; j >= 1; j--) {
            if (!st.alive || st.skip) return
            link(j, 'back'); await wait(900)
            node(j, 'compensating', 'Rolling back')
            caption('Undoing step ' + j + ': ' + (j === 2 ? 'escrow returns 1,000 tokens to the owner.' : 'approval is revoked on-chain.'), 'amber')
            await wait(1600)
            undoStep(j)
            node(j, 'compensated', 'Rolled back')
            log('Compensate ' + STEP[j] + '  ' + sig(), 'amber', 'REVERSED')
            await wait(900)
          }
          caption(i > 1 ? 'Rollback complete. Balances are exactly where they started.' : 'Stopped safely at step 1. No funds moved.', 'ok')
          await wait(3400)
          return
        }

        applyStep(i)
        node(i, 'done', 'Confirmed')
        log(STEP[i] + '  ' + sig(), 'ok', 'CONFIRMED')
        await wait(700)
      }
      caption('All three steps confirmed. The recipient received 1,000 tokens.', 'ok')
      await wait(3400)
    }

    let current = 0
    const loop = async () => {
      while (st.alive) {
        if (current === 0) {
          bal = { owner: 1000000, escrow: 0, recip: 0 }
          renderBal(false)
          log('New session started', 'info', 'READY')
        }
        st.skip = false
        await runScenario(current)
        st.skip = false
        current = (current + 1) % SCENARIOS.length
      }
    }

    /* ================= Full screen, wake lock, controls ================= */
    const isIOSPhone = /iPhone|iPod/.test(navigator.userAgent)
    const standalone = window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
    const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement
    const showHint = () => $('sd-hint').classList.add('show')
    const enterFS = () => {
      const el = document.documentElement
      const fn = el.requestFullscreen || el.webkitRequestFullscreen
      if (fn) {
        try {
          const p = fn.call(el, { navigationUI: 'hide' })
          if (p && p.catch) p.catch(() => { if (isIOSPhone) showHint() })
        } catch (e) { if (isIOSPhone) showHint() }
      } else if (!standalone) {
        showHint()
      }
    }
    const exitFS = () => { const fn = document.exitFullscreen || document.webkitExitFullscreen; if (fn) fn.call(document) }
    const toggleFS = () => { if (fsElement()) exitFS(); else enterFS() }
    const syncFsBtn = () => { $('sd-fsBtn').textContent = fsElement() ? 'Exit full screen' : 'Full screen' }
    on(document, 'fullscreenchange', syncFsBtn)
    on(document, 'webkitfullscreenchange', syncFsBtn)
    if (standalone) $('sd-fsBtn').style.display = 'none'

    let lock = null
    const keepAwake = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen')
      } catch (e) {}
    }
    on(document, 'visibilitychange', () => { if (document.visibilityState === 'visible' && st.started) keepAwake() })

    const togglePlay = () => { st.paused = !st.paused; $('sd-playBtn').textContent = st.paused ? 'Play' : 'Pause' }
    const next = () => { st.skip = true; if (st.paused) togglePlay() }
    const cycleSpeed = () => { st.si = (st.si + 1) % SPEEDS.length; st.speed = SPEEDS[st.si]; $('sd-speedBtn').textContent = 'Speed ' + st.speed + 'x' }

    on($('sd-fsBtn'), 'click', toggleFS)
    on($('sd-playBtn'), 'click', togglePlay)
    on($('sd-nextBtn'), 'click', next)
    on($('sd-speedBtn'), 'click', cycleSpeed)
    on($('sd-hintClose'), 'click', () => $('sd-hint').classList.remove('show'))

    let idleT = 0
    const wake = () => {
      document.body.classList.remove('sd-idle')
      clearTimeout(idleT)
      idleT = setTimeout(() => document.body.classList.add('sd-idle'), 3000)
    }
    ;['mousemove', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) => on(window, ev, wake, { passive: true }))

    on(document, 'keydown', (e) => {
      if (!st.started) return
      const k = (e.key || '').toLowerCase()
      if (k === 'f') toggleFS()
      else if (k === ' ') { e.preventDefault(); togglePlay() }
      else if (k === 'n' || k === 'arrowright') next()
    })

    const start = (fs) => {
      if (st.started) return
      st.started = true
      $('sd-gate').classList.add('hide')
      if (fs && !standalone) enterFS()
      keepAwake(); wake(); loop()
    }
    on($('sd-startFs'), 'click', () => start(true))
    on($('sd-startWin'), 'click', () => start(false))
    if (standalone) $('sd-startFs').textContent = 'Start demo'

    resize(); renderBal(false); drawWarp()

    return () => {
      st.alive = false
      cancelAnimationFrame(raf)
      clearTimeout(idleT)
      clearTimeout(crispTimer)
      cleanups.forEach((fn) => fn())
      try { if (lock) lock.release() } catch (e) {}
      try { if (fsElement()) exitFS() } catch (e) {}
      document.body.classList.remove('sd-body', 'sd-idle')
      if (manifest && oldManifest) manifest.setAttribute('href', oldManifest)
      crisp('chat:show')
    }
  }, [])

  return (
    <>
      <Head>
        <title>Full-screen demo | COSMOS Ledger Labs</title>
        <meta name="description" content="Simulated playback of the COSMOS Solana devnet workflow demo with automatic on-chain rollback." />
        <meta name="theme-color" content="#00010a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <div className="sd-root">
        <canvas id="sd-warp" aria-hidden="true" />
        <div className="sd-vignette" aria-hidden="true" />

        <main className="sd-app">
          <header className="sd-top">
            <div className="sd-brand"><Cube />COSMOS LEDGER LABS</div>
            <div className="sd-run" aria-live="polite">
              <b id="sd-runLabel">Run 1 of 4</b>
              <span id="sd-scenLabel">Everything succeeds</span>
            </div>
          </header>

          <h1 className="sd-h1">When one step fails, COSMOS undoes the steps before it.</h1>

          <section className="sd-pipe" aria-label="Workflow steps">
            <article className="sd-node" id="sd-n1">
              <span className="sd-num">01</span>
              <div className="sd-txt"><h2>Approve</h2><p>Operator signs off the job on-chain</p></div>
              <span className="sd-status">Waiting</span>
            </article>
            <div className="sd-link" id="sd-l1" />
            <article className="sd-node" id="sd-n2">
              <span className="sd-num">02</span>
              <div className="sd-txt"><h2>Vesting setup</h2><p>1,000 test tokens move into escrow</p></div>
              <span className="sd-status">Waiting</span>
            </article>
            <div className="sd-link" id="sd-l2" />
            <article className="sd-node" id="sd-n3">
              <span className="sd-num">03</span>
              <div className="sd-txt"><h2>Distribution</h2><p>Escrow pays the recipient</p></div>
              <span className="sd-status">Waiting</span>
            </article>
          </section>

          <p className="sd-caption" id="sd-caption" aria-live="polite">Starting workflow</p>

          <section className="sd-bottom">
            <div className="sd-panel">
              <h3>Balances</h3>
              <dl className="sd-bal">
                <dt>Owner</dt><dd id="sd-bOwner">1,000,000</dd>
                <dt>Escrow</dt><dd id="sd-bEscrow">0</dd>
                <dt>Recipient</dt><dd id="sd-bRecip">0</dd>
              </dl>
            </div>
            <div className="sd-panel sd-logp">
              <h3>Transaction log</h3>
              <ol className="sd-log" id="sd-log" />
            </div>
          </section>

          <footer className="sd-foot">
            <span>Simulated playback of our Solana devnet demo. No real funds.</span>
            <span>Run it yourself at <a href="/flow">cosmosledgerlabs.com/flow</a></span>
          </footer>
        </main>

        <div className="sd-controls" role="toolbar" aria-label="Demo controls">
          <button id="sd-fsBtn" type="button">Full screen</button>
          <button id="sd-playBtn" type="button">Pause</button>
          <button id="sd-nextBtn" type="button">Next run</button>
          <button id="sd-speedBtn" type="button">Speed 1x</button>
        </div>

        <div className="sd-gate" id="sd-gate">
          <div className="sd-brand sd-gateBrand"><Cube />COSMOS LEDGER LABS</div>
          <button className="sd-big" id="sd-startFs" type="button">Start full-screen demo</button>
          <button className="sd-small" id="sd-startWin" type="button">Start in this window</button>
          <p>Keys: F full screen, Space pause, N next run. The demo loops on its own.</p>
        </div>

        <div className="sd-hint" id="sd-hint" role="dialog" aria-label="iPhone full screen">
          iPhone Safari can&apos;t hide its bars for web pages. For true full screen: tap the Share button, choose Add to Home Screen, then open the demo from the new icon.
          <br />
          <button type="button" id="sd-hintClose">Got it</button>
        </div>
      </div>

      <style jsx global>{`
        body.sd-body { overflow: hidden; background: #00010a; }
        body.sd-idle .sd-root { cursor: none; }

        .sd-root {
          --sd-bg: #00010a; --sd-panel: rgba(7, 20, 38, 0.72); --sd-line: rgba(0, 162, 255, 0.28);
          --sd-cyan: #00e8ff; --sd-blue: #00a2ff; --sd-text: #e6f3ff; --sd-dim: #7f98b8;
          --sd-ok: #3dffa8; --sd-bad: #ff4d6a; --sd-amber: #ffb020;
          --sd-display: 'Orbitron', 'Rajdhani', system-ui, sans-serif;
          --sd-head: 'Rajdhani', 'Saira Condensed', system-ui, sans-serif;
          --sd-body: 'Saira Condensed', 'Rajdhani', system-ui, sans-serif;
          position: fixed; inset: 0; z-index: 2147483000; overflow: hidden;
          background: var(--sd-bg); color: var(--sd-text); font-family: var(--sd-body);
          text-align: left; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none;
          padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .sd-root *, .sd-root *::before, .sd-root *::after { box-sizing: border-box; }
        #sd-warp { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
        .sd-vignette { position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(0,1,10,.15) 0%, rgba(0,1,10,.78) 70%, rgba(0,1,10,.95) 100%); }

        .sd-app { position: relative; z-index: 2; height: 100%; display: grid;
          grid-template-rows: auto auto 1fr auto auto auto; gap: clamp(8px, 2.2vmin, 28px);
          padding: clamp(12px, 3vmin, 48px) max(clamp(14px, 4vmin, 64px), env(safe-area-inset-right, 0px)) clamp(10px, 2.4vmin, 36px) max(clamp(14px, 4vmin, 64px), env(safe-area-inset-left, 0px));
          max-width: 2400px; margin: 0 auto; }
        .sd-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .sd-brand { display: flex; align-items: center; gap: clamp(8px, 1.4vmin, 18px); font-family: var(--sd-display); font-weight: 800;
          font-size: clamp(13px, 2.3vmin, 34px); letter-spacing: .14em; color: var(--sd-cyan); text-shadow: 0 0 18px rgba(0,232,255,.55); }
        .sd-brand svg { width: clamp(22px, 4vmin, 56px); height: auto; flex: none; }
        .sd-run { font-family: var(--sd-head); font-weight: 700; text-align: right; line-height: 1.1; }
        .sd-run b { display: block; font-size: clamp(14px, 2.6vmin, 38px); color: var(--sd-text); }
        .sd-run span { font-size: clamp(11px, 1.8vmin, 24px); color: var(--sd-dim); }
        .sd-root .sd-h1 { margin: 0; font-family: var(--sd-head); font-weight: 700; line-height: 1.05; color: var(--sd-text);
          font-size: clamp(22px, 5.4vmin, 86px); max-width: 22ch; letter-spacing: .005em; text-align: left; }

        .sd-pipe { display: grid; grid-template-columns: 1fr clamp(40px, 8vmin, 150px) 1fr clamp(40px, 8vmin, 150px) 1fr;
          align-items: center; min-height: 0; }
        .sd-node { position: relative; border: 2px solid var(--sd-line); border-radius: clamp(10px, 1.6vmin, 22px); background: var(--sd-panel);
          padding: clamp(12px, 2.4vmin, 40px); min-height: clamp(120px, 24vmin, 380px); display: flex; flex-direction: column; justify-content: space-between;
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); transition: border-color .35s, box-shadow .35s, opacity .35s, transform .35s; }
        .sd-num { font-family: var(--sd-display); font-weight: 800; font-size: clamp(14px, 2.6vmin, 40px); color: var(--sd-blue); opacity: .8; }
        .sd-root .sd-node h2 { margin: .2em 0 .15em; font-family: var(--sd-head); font-weight: 700; font-size: clamp(20px, 4.4vmin, 72px); line-height: 1; color: var(--sd-text); }
        .sd-root .sd-node p { margin: 0; color: var(--sd-dim); font-weight: 600; font-size: clamp(12px, 2vmin, 30px); line-height: 1.2; text-align: left; }
        .sd-status { margin-top: clamp(8px, 1.6vmin, 24px); display: inline-flex; align-items: center; gap: .5em; align-self: flex-start;
          font-family: var(--sd-head); font-weight: 700; font-size: clamp(12px, 2.1vmin, 32px); padding: .2em .7em; border-radius: 999px;
          border: 1px solid var(--sd-line); color: var(--sd-dim); white-space: nowrap; }
        .sd-status::before { content: ""; width: .6em; height: .6em; border-radius: 50%; background: currentColor; }
        .sd-node.running { border-color: var(--sd-cyan); box-shadow: 0 0 0 1px var(--sd-cyan), 0 0 42px rgba(0,232,255,.35); transform: translateY(-4px); }
        .sd-node.running .sd-status { color: var(--sd-cyan); border-color: var(--sd-cyan); }
        .sd-node.running .sd-status::before { animation: sd-blink .7s infinite alternate; }
        .sd-node.done { border-color: rgba(61,255,168,.7); }
        .sd-node.done .sd-status { color: var(--sd-ok); border-color: rgba(61,255,168,.6); }
        .sd-node.failed { border-color: var(--sd-bad); box-shadow: 0 0 42px rgba(255,77,106,.35); animation: sd-shake .45s; }
        .sd-node.failed .sd-status { color: var(--sd-bad); border-color: var(--sd-bad); }
        .sd-node.compensating { border-color: var(--sd-amber); box-shadow: 0 0 42px rgba(255,176,32,.35); }
        .sd-node.compensating .sd-status { color: var(--sd-amber); border-color: var(--sd-amber); }
        .sd-node.compensating .sd-status::before { animation: sd-blink .7s infinite alternate; }
        .sd-node.compensated { border-color: rgba(255,176,32,.65); }
        .sd-node.compensated .sd-status { color: var(--sd-amber); border-color: rgba(255,176,32,.6); }
        .sd-node.skipped { opacity: .38; }

        .sd-link { position: relative; height: 3px; margin: 0 clamp(6px, 1vmin, 14px); background: var(--sd-line); border-radius: 3px; }
        .sd-link::after { content: ""; position: absolute; top: 50%; left: 0; width: clamp(10px, 1.6vmin, 22px); height: clamp(10px, 1.6vmin, 22px);
          border-radius: 50%; transform: translate(-50%, -50%); opacity: 0; }
        .sd-link.fwd { background: linear-gradient(90deg, var(--sd-cyan), var(--sd-line)); }
        .sd-link.fwd::after { background: var(--sd-cyan); box-shadow: 0 0 18px var(--sd-cyan); animation: sd-goH var(--dur, 1s) ease-in-out forwards; }
        .sd-link.back { background: linear-gradient(270deg, var(--sd-amber), var(--sd-line)); }
        .sd-link.back::after { background: var(--sd-amber); box-shadow: 0 0 18px var(--sd-amber); animation: sd-goH var(--dur, 1s) ease-in-out reverse forwards; }
        @keyframes sd-goH { 0% { left: 0; opacity: 1; } 100% { left: 100%; opacity: 1; } }
        @keyframes sd-goV { 0% { top: 0; opacity: 1; } 100% { top: 100%; opacity: 1; } }
        @keyframes sd-blink { from { opacity: .25; } to { opacity: 1; } }
        @keyframes sd-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }

        .sd-root .sd-caption { margin: 0; font-family: var(--sd-head); font-weight: 700; font-size: clamp(17px, 3.6vmin, 58px); line-height: 1.1;
          min-height: 2.25em; display: flex; align-items: center; color: var(--sd-text); transition: color .3s; text-align: left; }
        .sd-root .sd-caption.bad { color: var(--sd-bad); }
        .sd-root .sd-caption.amber { color: var(--sd-amber); }
        .sd-root .sd-caption.ok { color: var(--sd-ok); }

        .sd-bottom { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: clamp(8px, 2vmin, 28px); min-height: 0; }
        .sd-panel { background: var(--sd-panel); border: 1px solid var(--sd-line); border-radius: clamp(8px, 1.2vmin, 16px);
          padding: clamp(10px, 1.8vmin, 26px); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); min-width: 0; }
        .sd-root .sd-panel h3 { margin: 0 0 .5em; font-family: var(--sd-head); font-weight: 700; font-size: clamp(13px, 2vmin, 28px); color: var(--sd-blue); }
        .sd-bal { display: grid; grid-template-columns: auto 1fr; gap: .25em 1em; margin: 0; font-weight: 600; font-size: clamp(13px, 2.1vmin, 32px); }
        .sd-bal dt { color: var(--sd-dim); }
        .sd-bal dd { margin: 0; text-align: right; font-family: var(--sd-display); font-weight: 600; font-variant-numeric: tabular-nums; transition: color .3s; }
        .sd-bal dd.flash { color: var(--sd-cyan); }
        .sd-log { list-style: none; margin: 0; padding: 0; display: grid; gap: .3em; font-weight: 600; font-size: clamp(11px, 1.8vmin, 26px);
          max-height: calc(4 * 1.55em); overflow: hidden; }
        .sd-log li { display: grid; grid-template-columns: 5.5em 1fr auto; gap: .8em; align-items: baseline; animation: sd-in .35s ease-out; }
        .sd-log .t { color: var(--sd-dim); font-variant-numeric: tabular-nums; }
        .sd-log .m { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sd-log .s { font-family: var(--sd-head); font-weight: 700; }
        .sd-log .ok { color: var(--sd-ok); } .sd-log .bad { color: var(--sd-bad); }
        .sd-log .amber { color: var(--sd-amber); } .sd-log .info { color: var(--sd-cyan); }
        @keyframes sd-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

        .sd-foot { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; color: var(--sd-dim); font-weight: 600;
          font-size: clamp(10px, 1.6vmin, 22px); }
        .sd-foot a { color: var(--sd-cyan); font-weight: 700; text-decoration: none; }

        .sd-controls { position: absolute; z-index: 5; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 14px); transform: translateX(-50%);
          display: flex; gap: 8px; padding: 8px; border-radius: 999px; background: rgba(2,10,24,.86); border: 1px solid var(--sd-line);
          transition: opacity .4s, transform .4s; max-width: calc(100vw - 16px); }
        body.sd-idle .sd-controls { opacity: 0; pointer-events: none; transform: translate(-50%, 12px); }
        .sd-root button { font-family: var(--sd-head); font-weight: 700; font-size: 15px; color: var(--sd-text); background: transparent;
          border: 1px solid var(--sd-line); border-radius: 999px; padding: 9px 16px; cursor: pointer; white-space: nowrap; }
        .sd-controls button:hover { border-color: var(--sd-cyan); color: var(--sd-cyan); }
        .sd-root button:focus-visible { outline: 2px solid var(--sd-cyan); outline-offset: 2px; }

        .sd-gate { position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
          background: rgba(0,1,10,.82); text-align: center; padding: 24px; }
        .sd-gate.hide { display: none; }
        .sd-gateBrand { font-size: clamp(16px, 3vmin, 30px); }
        .sd-root .sd-big { font-size: clamp(18px, 3vmin, 28px); padding: 16px 34px; border: 2px solid var(--sd-cyan); color: var(--sd-cyan);
          box-shadow: 0 0 30px rgba(0,232,255,.3); }
        .sd-root .sd-small { border: none; color: var(--sd-dim); text-decoration: underline; font-size: 15px; }
        .sd-root .sd-gate p { margin: 0; max-width: 34ch; color: var(--sd-dim); font-weight: 600; font-size: 16px; line-height: 1.3; text-align: center; }
        .sd-hint { position: absolute; z-index: 11; left: 50%; top: calc(env(safe-area-inset-top, 0px) + 14px); transform: translateX(-50%);
          width: min(92vw, 440px); background: rgba(4,16,34,.96); border: 1px solid var(--sd-cyan); border-radius: 14px; padding: 14px 16px;
          font-weight: 600; font-size: 15px; line-height: 1.3; display: none; }
        .sd-hint.show { display: block; }
        .sd-root .sd-hint button { margin-top: 10px; padding: 6px 14px; font-size: 14px; }

        /* Phones held upright */
        @media (max-aspect-ratio: 1/1) {
          .sd-app { gap: clamp(8px, 1.6vh, 22px); }
          .sd-root .sd-h1 { font-size: clamp(22px, 6.4vw, 64px); }
          .sd-pipe { grid-template-columns: 1fr; grid-template-rows: 1fr clamp(18px, 3.5vh, 60px) 1fr clamp(18px, 3.5vh, 60px) 1fr; }
          .sd-node { min-height: 0; padding: clamp(10px, 2.2vw, 30px) clamp(12px, 3vw, 36px); flex-direction: row; align-items: center; gap: 12px; }
          .sd-txt { flex: 1; min-width: 0; }
          .sd-num { font-size: clamp(16px, 5vw, 40px); }
          .sd-root .sd-node h2 { font-size: clamp(20px, 5.8vw, 56px); margin: 0 0 .1em; }
          .sd-root .sd-node p { font-size: clamp(13px, 3.4vw, 28px); }
          .sd-status { margin: 0; align-self: center; font-size: clamp(12px, 3.2vw, 26px); }
          .sd-node.running { transform: none; }
          .sd-link { width: 3px; height: auto; margin: clamp(4px, .8vh, 10px) auto; }
          .sd-link.fwd { background: linear-gradient(180deg, var(--sd-cyan), var(--sd-line)); }
          .sd-link.back { background: linear-gradient(0deg, var(--sd-amber), var(--sd-line)); }
          .sd-link::after { left: 50%; top: 0; }
          .sd-link.fwd::after, .sd-link.back::after { animation-name: sd-goV; }
          .sd-root .sd-caption { font-size: clamp(17px, 4.8vw, 44px); }
          .sd-bottom { grid-template-columns: 1fr; }
          .sd-bal { font-size: clamp(13px, 3.6vw, 28px); grid-template-columns: auto 1fr auto 1fr auto 1fr; gap: .2em .6em; }
          .sd-bal dt, .sd-bal dd { white-space: nowrap; }
          .sd-log { font-size: clamp(11px, 3.1vw, 24px); max-height: calc(3 * 1.55em); }
          .sd-brand { font-size: clamp(11px, 3.4vw, 30px); letter-spacing: .1em; }
          .sd-root button { font-size: 13px; padding: 8px 12px; }
        }
        @media (max-aspect-ratio: 1/1) and (max-height: 700px) { .sd-logp { display: none; } }
        /* Phones held sideways */
        @media (min-aspect-ratio: 1/1) and (max-height: 430px) {
          .sd-root .sd-h1 { display: none; }
          .sd-node { min-height: 0; }
          .sd-logp { display: none; }
          .sd-bottom { grid-template-columns: 1fr; }
          .sd-bal { grid-template-columns: auto 1fr auto 1fr auto 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sd-node, .sd-node.failed { animation: none !important; transform: none !important; }
          .sd-status::before { animation: none !important; }
        }
      `}</style>
    </>
  )
}
