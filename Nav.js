.hero {
  position: relative;
  min-height: 100vh;
  background: #050505;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
  overflow: hidden;
}

/* Smooth neon-blue glow background — CSS only, no particles, no WebGL */
.glowBg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.glowA {
  position: absolute;
  top: 48%;
  left: 58%;
  width: min(78vw, 860px);
  height: min(78vw, 860px);
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at center,
    rgba(0,170,255,0.30) 0%,
    rgba(0,110,235,0.16) 34%,
    rgba(0,55,150,0.05) 58%,
    rgba(0,20,70,0) 74%);
  filter: blur(16px);
  animation: heroGlow 9s ease-in-out infinite alternate;
  will-change: transform, opacity;
}
.glowB {
  position: absolute;
  top: 34%;
  left: 50%;
  width: min(130vw, 1500px);
  height: min(70vh, 720px);
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center,
    rgba(0,130,225,0.16) 0%,
    rgba(0,70,175,0.07) 46%,
    rgba(0,25,80,0) 74%);
  filter: blur(28px);
}
@keyframes heroGlow {
  0%   { opacity: .8;  transform: translate(-50%,-50%) scale(1); }
  100% { opacity: 1;   transform: translate(-50%,-50%) scale(1.14); }
}
@media (prefers-reduced-motion: reduce) {
  .glowA { animation: none; }
}

.content {
  position: relative;
  z-index: 10;
  padding: 0 5%;
  max-width: 960px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fundingBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(9px, 1.8vw, 12px);
  font-weight: 700;
  color: #00e8ff;
  border: 1.5px solid rgba(0,220,255,.6);
  background: rgba(0,180,255,.1);
  padding: 9px 18px;
  border-radius: 4px;
  letter-spacing: .14em;
  line-height: 1.35;
  text-align: center;
  margin-bottom: 14px;
  text-shadow: 0 0 18px rgba(0,232,255,1);
  animation: fpulse 2.2s ease-in-out infinite;
  max-width: 100%;
  height: auto;
}
@keyframes fpulse {
  0%,100% { box-shadow: 0 0 18px rgba(0,200,255,.2); }
  50% { box-shadow: 0 0 36px rgba(0,220,255,.5); }
}
.fstar { color: #00e8ff; font-size: 13px; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 11px; font-weight: 700;
  color: #00e8ff;
  border: 1px solid rgba(0,200,255,.5);
  padding: 7px 18px; border-radius: 3px;
  letter-spacing: .22em; margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.badge::after {
  content: ''; position: absolute;
  top: 0; left: -60%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,220,255,.3), transparent);
  animation: bf 3s linear infinite;
}
@keyframes bf { 0%{left:-60%} 100%{left:160%} }
.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #00e8ff; box-shadow: 0 0 12px #00e8ff;
  flex-shrink: 0; animation: bk 2.2s ease-in-out infinite;
}
@keyframes bk { 0%,100%{opacity:1} 50%{opacity:.15} }

.title {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(28px, 6vw, 76px);
  font-weight: 700;
  line-height: 1.04;
  margin-bottom: 18px;
  letter-spacing: .04em;
  text-align: center;
}
.tw {
  display: block;
  color: #ffffff;
  text-shadow: 0 0 30px rgba(0,190,255,.9), 0 0 60px rgba(0,140,255,.4);
}
.tc {
  color: #00e8ff;
  text-shadow: 0 0 30px rgba(0,232,255,1), 0 0 60px rgba(0,200,255,.7);
}

.subline {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(11px, 1.8vw, 15px);
  font-weight: 600;
  color: #88ddee;
  letter-spacing: .18em;
  margin-bottom: 10px;
}

.gl {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,220,255,.75), transparent);
  width: 100%; max-width: 520px;
  margin: 12px auto;
}

.bodyTxt {
  font-family: 'Share Tech Mono', monospace;
  font-size: clamp(11px, 1.5vw, 14px);
  color: #ffffff;
  line-height: 1.9;
  max-width: 600px;
  margin-bottom: 32px;
  text-align: center;
}

.btns { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
.bp {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px; font-weight: 700;
  padding: 14px 30px; border-radius: 4px;
  background: rgba(0,80,190,.55);
  border: 1.5px solid rgba(0,215,255,.85);
  color: #00e8ff; text-decoration: none;
  letter-spacing: .15em;
  box-shadow: 0 0 28px rgba(0,160,240,.45);
}
.bs {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px; font-weight: 700;
  padding: 13px 30px; border-radius: 4px;
  background: rgba(0,50,110,.22);
  border: 1.5px solid rgba(0,175,225,.5);
  color: #88ddee; text-decoration: none;
  letter-spacing: .15em;
}

@media(max-width:767px) {
  .title { font-size: clamp(24px, 8vw, 42px); }
  .btns { flex-direction: column; align-items: center; }
  .bp, .bs { width: 100%; max-width: 280px; text-align: center; }
}
