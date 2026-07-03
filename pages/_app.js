import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // 滚动入场动画 — 分层延迟上浮
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    const animate = () => {
      document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
    }

    if (document.readyState === 'complete') animate()
    else window.addEventListener('load', animate)

    return () => observer.disconnect()
  }, [])

  return <Component {...pageProps} />
}
