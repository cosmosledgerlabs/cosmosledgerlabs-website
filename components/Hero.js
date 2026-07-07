import { useEffect } from 'react'
import styles from './Hero.module.css'

export default function Hero() {
  useEffect(() => {
    // Cosmos background effect — self-hosted three.js
    const container = document.getElementById('cosmos-bg-container')
    if (!container) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let THREE, renderer, rafId, running = false, resizeTimer = null

    const isMobile = window.matchMedia('(max-width: 768px)').matches

    const CONFIG = {
      edgeGlow: 1.2,
      edgeWidth: 0.05,
      gridRes: isMobile ? 90 : 140,
      voxelSize: 0.2,
      glowInt: 1.2,
      cycle: 1.4,
      distortion: 1.0,
      blendZone: 0.02,
    }

    const vertexShader = `varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }`

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uGridResolution;
      uniform float u_cycle;
      uniform float u_glow_intensity;
      uniform float u_voxel_size;
      uniform float u_edge_glow;
      uniform float u_edge_width;
      uniform float u_distortion;
      uniform float u_blend_zone;
      varying vec2 vUv;

      const vec3 color_bright = vec3(0.1, 0.4, 1.0);
      const vec3 color_dim = vec3(0.0, 0.06, 0.25);

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 a0 = x - floor(x + 0.5);
        vec3 gr = a0 * vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw));
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float voxelSDF(vec2 p, float size, float radius) {
        vec2 q = abs(p) - size + radius;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
      }

      void main() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 dist_to_corners = min(vUv, 1.0 - vUv) * aspect;
        float d_edge = min(dist_to_corners.x, dist_to_corners.y);
        vec2 center_uv = (vUv * 2.0 - 1.0) * aspect;
        float time = uTime * 0.3;
        float noise = snoise(center_uv * 1.5 + vec2(time * 0.2));
        float noise2 = snoise(center_uv * 0.8 - vec2(time * 0.15));
        float flow = (noise * 0.6 + noise2 * 0.4) * u_distortion * 0.1;
        vec2 distorted_uv = center_uv + center_uv * flow;
        float dist_from_center = length(distorted_uv);
        float max_radius = length(aspect) * 1.1;
        float progress = fract(time / u_cycle);
        float current_radius = progress * max_radius;
        float d_ring = abs(dist_from_center - current_radius);
        float edge_proximity = smoothstep(u_blend_zone, 0.0, d_edge);
        float wave_proximity = smoothstep(u_blend_zone, 0.0, d_ring);
        float dynamic_edge_width = u_edge_width * (1.0 + wave_proximity * 1.5);
        float edge_energy = exp(-d_edge / dynamic_edge_width) * u_edge_glow;
        edge_energy *= (0.9 + 0.1 * sin(uTime * 1.2));
        edge_energy *= (1.0 + wave_proximity * 1.2);
        float dynamic_wave_width = 0.01 + (edge_proximity * 0.04);
        float wave_energy = exp(-pow(d_ring, 2.0) / dynamic_wave_width) * u_glow_intensity;
        float lifecycle = smoothstep(0.0, 0.1, progress);
        wave_energy *= lifecycle;
        float final_brightness = wave_energy + edge_energy;
        final_brightness -= (wave_energy * edge_energy * 0.4);
        vec2 grid_uv = vUv * vec2(uGridResolution * aspect.x, uGridResolution);
        vec2 cell_local_uv = fract(grid_uv);
        vec2 voxel_local_uv = cell_local_uv - 0.5;
        float voxel_sdf = voxelSDF(voxel_local_uv, u_voxel_size, 0.05);
        float voxel_shape = 1.0 - smoothstep(-0.05, 0.05, voxel_sdf);
        float final_intensity = final_brightness * voxel_shape;
        vec3 final_color = mix(color_dim, color_bright, final_intensity);
        final_color *= final_intensity;
        gl_FragColor = vec4(final_color, 1.0);
      }
    `

    async function init() {
      try {
        THREE = await import('three')
      } catch (err) {
        console.warn('[cosmos-bg] three.js failed to load; effect skipped.', err)
        return
      }

      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      } catch (err) {
        console.warn('[cosmos-bg] WebGL unavailable; effect skipped.', err)
        return
      }

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
      const initW = container.clientWidth || window.innerWidth
      const initH = container.clientHeight || window.innerHeight
      renderer.setSize(initW, initH)
      container.appendChild(renderer.domElement)

      const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(initW, initH) },
        uGridResolution: { value: CONFIG.gridRes },
        u_voxel_size: { value: CONFIG.voxelSize },
        u_cycle: { value: CONFIG.cycle },
        u_glow_intensity: { value: CONFIG.glowInt },
        u_edge_glow: { value: CONFIG.edgeGlow },
        u_edge_width: { value: CONFIG.edgeWidth },
        u_distortion: { value: CONFIG.distortion },
        u_blend_zone: { value: CONFIG.blendZone },
      }

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
      })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
      scene.add(mesh)

      function resize() {
        const w = container.clientWidth || window.innerWidth
        const h = container.clientHeight || window.innerHeight
        renderer.setSize(w, h)
        uniforms.uResolution.value.set(w, h)
      }

      function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(resize, 150)
      }
      window.addEventListener('resize', onResize, { passive: true })

      function frame(now) {
        if (!running) return
        uniforms.uTime.value = now * 0.001
        renderer.render(scene, camera)
        rafId = requestAnimationFrame(frame)
      }

      function start() {
        if (running) return
        running = true
        rafId = requestAnimationFrame(frame)
      }
      function stop() {
        running = false
        if (rafId) cancelAnimationFrame(rafId)
        rafId = null
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop()
        else if (!reduceMotion) start()
      })

      if (reduceMotion) {
        renderer.render(scene, camera)
      } else {
        start()
      }

      const canvasEl = renderer.domElement
      canvasEl.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop() }, false)
      canvasEl.addEventListener('webglcontextrestored', () => { if (!reduceMotion) start() }, false)

      return () => {
        stop()
        window.removeEventListener('resize', onResize)
        material.dispose()
        mesh.geometry.dispose()
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
    }

    let cleanup
    init().then(fn => { cleanup = fn })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <section className={styles.hero} id="top">
      <div id="cosmos-bg-container" aria-hidden="true"></div>
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
          <a href="mailto:info@cosmosledgerlabs.com?subject=Full%20Deck%20Request" className={styles.bp}>REQUEST FULL DECK →</a>
          <a href="/architecture-diagram.pdf" target="_blank" rel="noopener noreferrer" className={styles.bp}>VIEW ARCHITECTURE</a>
          <a href="#contact" className={styles.bs}>CONTACT US</a>
        </div>
      </div>
    </section>
  )
}
