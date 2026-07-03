import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true }) ||
      canvas.getContext('webgl', { alpha: false, antialias: true })

    if (!gl) return

    const VERT = `attribute vec2 a_position; varying vec2 v_uv; void main() { v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`

    const FRAG = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_aspect;

      // Hash function
      vec2 hash2(vec2 p) {
        p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(dot(hash2(i+vec2(0,0)),f-vec2(0,0)),
                       dot(hash2(i+vec2(1,0)),f-vec2(1,0)),u.x),
                   mix(dot(hash2(i+vec2(0,1)),f-vec2(0,1)),
                       dot(hash2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        mat2 rot = mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
        for(int i=0;i<5;i++){
          v += a * noise(p);
          p = rot * p * 2.1;
          a *= 0.5;
        }
        return v;
      }

      // 粒子星点
      float particle(vec2 uv, vec2 pos, float size) {
        float d = length(uv - pos);
        return size / (d * d + size * 0.01);
      }

      void main() {
        vec2 uv = v_uv - 0.5;
        uv.x *= u_aspect;

        float t = u_time * 0.12;

        // 深海军蓝背景
        vec3 bgColor = vec3(0.004, 0.008, 0.028);

        // FBM旋涡星云
        vec2 q = vec2(fbm(uv*1.8 + t*0.3), fbm(uv*1.8 + vec2(5.2,1.3) + t*0.25));
        vec2 r = vec2(fbm(uv*2.2 + 4.0*q + vec2(1.7,9.2) + t*0.2),
                      fbm(uv*2.2 + 4.0*q + vec2(8.3,2.8) + t*0.15));
        float nebula = fbm(uv*1.5 + 4.0*r + t*0.08);

        // 星云形状 — 中心聚焦
        float distCenter = length(uv);
        float nebulaShape = nebula * exp(-distCenter * 1.8) * 2.2;

        // 旋涡能量环
        float angle = atan(uv.y, uv.x);
        float swirl = sin(angle * 3.0 + t * 1.5 + nebula * 4.0) * 0.5 + 0.5;
        float ring1 = exp(-pow(abs(distCenter - 0.22 + nebula*0.06), 2.0) / 0.004) * swirl;
        float ring2 = exp(-pow(abs(distCenter - 0.35 + nebula*0.08), 2.0) / 0.006) * (1.0-swirl);
        float ring3 = exp(-pow(abs(distCenter - 0.14 + nebula*0.04), 2.0) / 0.003) * 0.6;

        // 粒子效果
        vec2 p1 = vec2(0.18*cos(t*0.8), 0.12*sin(t*1.1));
        vec2 p2 = vec2(-0.15*cos(t*0.6+1.0), 0.20*sin(t*0.9+2.0));
        vec2 p3 = vec2(0.22*cos(t*1.2+3.0), -0.16*sin(t*0.7+1.5));
        vec2 p4 = vec2(-0.20*sin(t*0.5+2.0), -0.18*cos(t*1.0+0.5));
        float particles = particle(uv, p1, 0.00008)
                        + particle(uv, p2, 0.00006)
                        + particle(uv, p3, 0.00007)
                        + particle(uv, p4, 0.00005);
        particles = clamp(particles, 0.0, 1.5);

        // 扫描线纹理
        float scanline = sin(v_uv.y * 800.0) * 0.012 + 0.988;

        // 呼吸发光
        float breathe = 0.85 + 0.15 * sin(u_time * 0.4);

        // 颜色合成
        // 外层深蓝雾
        vec3 outerNebula = vec3(0.0, 0.15, 0.45) * nebulaShape * 0.6;

        // 中层青蓝旋涡
        vec3 midSwirl = vec3(0.0, 0.55, 0.95) * (ring1 + ring2) * 1.4;

        // 内层亮荧光青
        vec3 innerGlow = vec3(0.05, 0.85, 1.0) * ring3 * 2.0;

        // 粒子白蓝
        vec3 particleColor = vec3(0.4, 0.85, 1.0) * particles;

        // 中心核心辉光
        float core = exp(-distCenter * distCenter * 8.0) * 0.35;
        vec3 coreColor = vec3(0.1, 0.6, 1.0) * core;

        vec3 col = bgColor + outerNebula + midSwirl + innerGlow + particleColor + coreColor;

        // 扫描线叠加
        col *= scanline;

        // 呼吸
        col = bgColor + (col - bgColor) * breathe;

        // 暗角渐变
        float vignette = 1.0 - smoothstep(0.3, 0.9, distCenter * 1.2);
        col = mix(bgColor * 0.5, col, vignette * 0.9 + 0.1);

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uAspect = gl.getUniformLocation(prog, 'u_aspect')

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_position')

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const start = performance.now()
    let raf

    const render = ts => {
      const elapsed = (ts - start) / 1000
      const ar = canvas.width / Math.max(canvas.height, 1)
      gl.useProgram(prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
      gl.uniform1f(uTime, elapsed)
      gl.uniform1f(uAspect, ar)
      gl.clearColor(0.004, 0.008, 0.028, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(render)
    }

    window.addEventListener('resize', resize)
    resize()
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className={styles.hero} id="top">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>
        <div className={styles.fundingBadge}>
          <span className={styles.fstar}>★</span>
          ECOSYSTEM PLATFORM HAS SECURED EXTERNAL FUNDING
          <span className={styles.fstar}>★</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.dot}></span>
          // BUILT ON SOLANA
        </div>
        <h1 className={styles.title}>
          <span className={styles.tw}>WORKFLOW INFRASTRUCTURE FOR</span>
          <span className={styles.tw}><span className={styles.tc}>DIGITAL ASSET</span> OPERATIONS</span>
        </h1>
        <div className={styles.subline}>
          COSMOS LEDGER LABS &nbsp;|&nbsp; DIGITAL INFRASTRUCTURE &nbsp;|&nbsp; AUTOMATION
        </div>
        <div className={styles.gl}></div>
        <p className={styles.bodyTxt}>Secure workflow orchestration, approval coordination, transaction validation, monitoring, and recovery infrastructure for modern digital asset operations.</p>
        <div className={styles.btns}>
          <a href="/architecture-diagram.pdf" target="_blank" className={styles.bp}>VIEW ARCHITECTURE</a>
          <a href="#contact" className={styles.bs}>CONTACT US</a>
        </div>
      </div>
    </section>
  )
}
