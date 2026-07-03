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

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 6; i++) {
          v += a * smoothNoise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = v_uv - 0.5;
        uv.x *= u_aspect;

        float t = u_time * 0.18;

        // 用FBM噪声生成不规则云状形态
        vec2 q = vec2(
          fbm(uv + vec2(0.0, 0.0) + t * 0.3),
          fbm(uv + vec2(5.2, 1.3) + t * 0.25)
        );

        vec2 r = vec2(
          fbm(uv + 4.0 * q + vec2(1.7, 9.2) + t * 0.2),
          fbm(uv + 4.0 * q + vec2(8.3, 2.8) + t * 0.15)
        );

        float shape = fbm(uv + 4.0 * r + t * 0.1);

        // 不规则环形 — 中空
        float dist = length(uv) + shape * 0.35 - 0.08;
        float ringRadius = 0.28;
        float ringWidth = 0.055;

        // 外层雾化泛光
        float outerGlow = exp(-pow(abs(dist - ringRadius) / (ringWidth * 2.8), 1.4)) * 0.55;

        // 主环轮廓 — 边缘荧光蓝
        float ring = exp(-pow(abs(dist - ringRadius) / ringWidth, 2.0));

        // 内层深邃蓝
        float innerGlow = exp(-pow(max(0.0, ringRadius - dist) / (ringWidth * 1.8), 1.6)) * 0.35;

        // 边缘柔化 — 流体熔融质感
        float edgeSoft = smoothstep(0.0, ringWidth * 3.0, abs(dist - ringRadius));
        float fluidEdge = ring * (1.0 - edgeSoft * 0.3);

        // 呼吸节奏
        float breathe = 0.88 + 0.12 * sin(u_time * 0.45);

        // 颜色合成
        // 外层淡蓝雾 #004466 → transparent
        vec3 outerFog = vec3(0.0, 0.22, 0.52) * outerGlow * breathe;

        // 主环荧光蓝 #00e8ff
        vec3 ringColor = vec3(0.0, 0.78, 1.0) * fluidEdge * 1.8 * breathe;

        // 内侧渐变深蓝
        vec3 innerColor = vec3(0.0, 0.35, 0.85) * innerGlow * breathe;

        // 边缘泛光叠加
        float edgePulse = 0.85 + 0.15 * sin(u_time * 0.55 + dist * 8.0);
        vec3 glowEdge = vec3(0.1, 0.55, 1.0) * ring * 0.9 * edgePulse * breathe;

        vec3 col = outerFog + ringColor + innerColor + glowEdge;

        // 整体雾化透明度
        float alpha = (outerGlow + fluidEdge * 0.9 + innerGlow) * breathe;
        alpha = clamp(alpha, 0.0, 1.0);

        // 暗角
        float vignette = 1.0 - smoothstep(0.35, 0.85, length(uv / vec2(u_aspect, 1.0) * 0.9));
        col *= vignette;

        gl_FragColor = vec4(col, 1.0);
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
      gl.clearColor(0, 0, 0, 1)
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
        <div className={styles.sub}>
          <div>
            <div className={styles.sl}>COMPANY</div>
            <div className={styles.sv}>COSMOS LEDGER LABS</div>
          </div>
          <div className={styles.sdiv}></div>
          <div>
            <div className={styles.sl}>INFRASTRUCTURE</div>
            <div className={`${styles.sv} ${styles.svd}`}>WORKFLOW AUTOMATION</div>
          </div>
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
