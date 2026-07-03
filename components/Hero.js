import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const CONFIG = {
      ringWidth: 0.02,
      flowSpeed: 0.15,
      distortionAmount: 1.2,
      innerColor: { r: 0.3, g: 0.75, b: 1.0 },
      midColor: { r: 0.0, g: 0.3, b: 0.85 },
      outerColor: { r: 0.0, g: 0.02, b: 0.15 },
      torusGlowStrength: 0.65,
      torusGlowWidthMultiplier: 9.0,
      radiusMaxBoost: 1.12,
      speedFactor: 0.857
    }

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true }) ||
      canvas.getContext('webgl', { alpha: false, antialias: true })

    if (!gl) return

    const VERT = `attribute vec2 a_position; varying vec2 v_uv; void main() { v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`

    const FRAG = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_aspectRatio;
      uniform float u_ringWidth;
      uniform float u_distortionAmount;
      uniform vec3 u_innerColor;
      uniform vec3 u_midColor;
      uniform vec3 u_outerColor;
      uniform float u_torusGlowStrength;
      uniform float u_torusGlowWidthMultiplier;
      uniform float u_radiusMaxBoost;

      float getDistortion(float angle, float time) {
        float d = 0.0;
        d += sin(angle * 3.0 + time * 1.20) * 0.026;
        d += sin(angle * 5.0 + time * 0.78) * 0.019;
        d += cos(angle * 7.0 + time * 1.53) * 0.015;
        d += sin(angle * 11.0 + time * 0.61) * 0.011;
        d += cos(angle * 2.0 + time * 1.74) * 0.021;
        d += sin(angle * 8.0 + time * 1.08) * 0.013;
        d += cos(angle * 13.0 + time * 0.87) * 0.008;
        d += sin(angle * 2.0 + time * 0.35) * 0.018;
        return d * u_distortionAmount;
      }

      void main() {
        vec2 centered = v_uv - 0.5;
        centered.x *= u_aspectRatio;
        float distGlobal = length(centered);
        float angle = atan(centered.y, centered.x);
        float cycle = fract(u_time * 0.3333);
        float easeOut = smoothstep(0.1, 0.5, cycle);
        float d = getDistortion(angle, u_time * 0.8) * (1.0 + cycle * 2.0) * u_distortionAmount;
        float currentRadius = 0.06 + easeOut * u_radiusMaxBoost + d;
        float gridSize = 200.0;
        vec2 gridCoord = v_uv * vec2(gridSize * u_aspectRatio, gridSize);
        vec2 gridFrac = abs(fract(gridCoord) - 0.5);
        vec2 gridCentered = (floor(gridCoord) + 0.5) / vec2(gridSize * u_aspectRatio, gridSize) - 0.5;
        gridCentered.x *= u_aspectRatio;
        float distGrid = length(gridCentered);
        float angleGrid = atan(gridCentered.y, gridCentered.x);
        float dGrid = getDistortion(angleGrid, u_time * 0.8) * (1.0 + cycle * 2.0) * u_distortionAmount;
        float radiusGrid = 0.06 + easeOut * u_radiusMaxBoost + dGrid;
        float localDistGrid = distGrid - radiusGrid;
        float localWidth = u_ringWidth * (1.0 + abs(dGrid) * 1.5);
        float ringBright = exp(-pow(abs(localDistGrid), 2.0) / (2.0 * pow(localWidth, 2.0)));
        float dotMask = 1.0 - smoothstep(0.0, 0.35, gridFrac.x);
        dotMask *= 1.0 - smoothstep(0.0, 0.35, gridFrac.y);
        float wave1 = exp(-pow(abs(distGlobal - currentRadius * 1.1), 2.0) / 0.005) * 0.4;
        float wave2 = exp(-pow(abs(distGlobal - currentRadius * 1.2), 2.0) / 0.01) * 0.2;
        float waveInt = (wave1 + wave2) * dotMask;
        float blastPower = 1.0 + 0.8 * exp(-pow((cycle - 0.74) * 28.0, 2.0));
        float fadeOut = 1.0 - smoothstep(0.86, 1.0, cycle);
        float intensity = (ringBright + waveInt) * blastPower * fadeOut;
        float colorBlend = clamp(localDistGrid / localWidth + 0.5, 0.0, 1.0);
        vec3 color = mix(u_innerColor, u_midColor, smoothstep(0.0, 0.5, colorBlend));
        color = mix(color, u_outerColor, smoothstep(0.5, 1.0, colorBlend));
        vec3 finalColor = color * intensity;
        float torusSigma = u_ringWidth * u_torusGlowWidthMultiplier * (1.0 + abs(d) * 1.8);
        float torusGlow = exp(-pow(abs(distGlobal - currentRadius), 2.0) / (2.0 * pow(torusSigma, 2.0)));
        float innerGlow = exp(-pow(abs(distGlobal - currentRadius * 0.88), 2.0) / (2.0 * pow(torusSigma * 1.15, 2.0)));
        float innerGlowMask = smoothstep(currentRadius, currentRadius - torusSigma * 2.5, distGlobal);
        float combinedGlow = torusGlow + innerGlow * 0.45 * innerGlowMask;
        float lightAngle = u_time * 0.22;
        float angleLighting = 0.55 + 0.45 * cos(angle - lightAngle);
        float fillLight = 0.35 + 0.25 * cos(angle - lightAngle + 2.4);
        float combinedLighting = clamp(angleLighting + fillLight, 0.25, 1.5);
        float radialBias = 1.0 + 0.22 * smoothstep(-0.08, 0.08, distGlobal - currentRadius);
        combinedLighting *= radialBias;
        vec3 shadowBlue = vec3(0.02, 0.08, 0.25);
        vec3 midBlue = vec3(0.08, 0.20, 0.50);
        vec3 brightBlue = vec3(0.20, 0.40, 0.80);
        float lightNorm = clamp(combinedLighting / 1.5, 0.0, 1.0);
        vec3 glowColor = mix(shadowBlue, midBlue, lightNorm);
        glowColor = mix(glowColor, brightBlue, pow(lightNorm, 2.5) * 0.9);
        float glowPulse = 1.0 + 0.14 * sin(u_time * 0.55) * (1.0 + cycle * 0.5);
        float glowIntensity = combinedGlow * u_torusGlowStrength * glowPulse * fadeOut;
        glowIntensity *= (1.0 + (blastPower - 1.0) * 0.5);
        finalColor += glowColor * glowIntensity;
        float edgeDist = min(min(v_uv.x, 1.0 - v_uv.x), min(v_uv.y, 1.0 - v_uv.y));
        float edgeMain = exp(-edgeDist / 0.0115);
        float edgeGlow = exp(-edgeDist / 0.048) * 0.28;
        float edgeIntensity = (edgeMain + edgeGlow) * (1.0 + 0.10 * sin(u_time * 0.55) * (1.0 + cycle * 0.4));
        vec3 edgeColorBright = mix(u_innerColor, u_midColor, 0.12);
        vec3 edgeColorDark = mix(u_midColor, u_outerColor, 0.45);
        vec3 edgeColor = mix(edgeColorDark, edgeColorBright, clamp(edgeMain, 0.0, 1.0));
        finalColor += edgeColor * edgeIntensity * 0.78;
        float vignette = 1.0 - smoothstep(0.4, 0.9, distGlobal) * 0.15;
        finalColor *= vignette;
        gl_FragColor = vec4(max(finalColor, 0.0), 1.0);
      }
    `

    const compileShader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)

    const uniforms = {}
    ;['u_time','u_aspectRatio','u_ringWidth','u_distortionAmount','u_innerColor','u_midColor','u_outerColor','u_torusGlowStrength','u_torusGlowWidthMultiplier','u_radiusMaxBoost'].forEach(n => {
      uniforms[n] = gl.getUniformLocation(prog, n)
    })

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

    const startTime = performance.now()
    let rafId

    const render = (ts) => {
      const elapsed = (ts - startTime) / 1000 * CONFIG.speedFactor
      const ar = canvas.width / Math.max(canvas.height, 1)
      gl.useProgram(prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
      gl.uniform1f(uniforms.u_time, elapsed)
      gl.uniform1f(uniforms.u_aspectRatio, ar)
      gl.uniform1f(uniforms.u_ringWidth, CONFIG.ringWidth)
      gl.uniform1f(uniforms.u_distortionAmount, CONFIG.distortionAmount)
      gl.uniform3f(uniforms.u_innerColor, CONFIG.innerColor.r, CONFIG.innerColor.g, CONFIG.innerColor.b)
      gl.uniform3f(uniforms.u_midColor, CONFIG.midColor.r, CONFIG.midColor.g, CONFIG.midColor.b)
      gl.uniform3f(uniforms.u_outerColor, CONFIG.outerColor.r, CONFIG.outerColor.g, CONFIG.outerColor.b)
      gl.uniform1f(uniforms.u_torusGlowStrength, CONFIG.torusGlowStrength)
      gl.uniform1f(uniforms.u_torusGlowWidthMultiplier, CONFIG.torusGlowWidthMultiplier)
      gl.uniform1f(uniforms.u_radiusMaxBoost, CONFIG.radiusMaxBoost)
      gl.clearColor(0,0,0,1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(render)
    }

    window.addEventListener('resize', resize)
    resize()
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
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
          <a href="#deck" className={styles.bp}>VIEW ARCHITECTURE</a>
          <a href="#contact" className={styles.bs}>CONTACT US</a>
        </div>
      </div>
    </section>
  )
}
