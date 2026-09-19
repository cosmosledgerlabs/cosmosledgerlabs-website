import '../styles/globals.css'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import ErrorBoundary from '../components/ErrorBoundary'

// Crisp live chat.
//
// Controlled entirely by an environment variable, so chat can be switched on
// or off in Vercel without touching this file. Leave NEXT_PUBLIC_CRISP_WEBSITE_ID
// unset and no chat script loads at all — nothing is sent to any third party.
//
// To enable: Vercel -> Settings -> Environment Variables
//            NEXT_PUBLIC_CRISP_WEBSITE_ID = <the ID from crisp.chat>
//            then redeploy.
//
// The loader runs inside the site's own bundled JavaScript (useEffect below),
// not as an inline <script>, because the site's Content-Security-Policy
// (next.config.js) blocks inline scripts. next.config.js allows *.crisp.chat.
const CRISP_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

function loadCrisp() {
  if (!CRISP_ID || typeof window === 'undefined' || window.$crisp) return
  window.$crisp = []
  window.CRISP_WEBSITE_ID = CRISP_ID
  // Match the chat language to the site language (?lang= wins, then the
  // stored toggle choice, otherwise English). Crisp reads
  // CRISP_RUNTIME_CONFIG once at load, so a toggle after load applies on
  // the next page view.
  try {
    let lang = 'en'
    const param = new URLSearchParams(window.location.search).get('lang')
    if (param === 'zh' || param === 'zh-TW' || param === 'zh-Hant') {
      lang = 'zh'
    } else if (param !== 'en') {
      try {
        if (window.localStorage.getItem('cll_lang') === 'zh') lang = 'zh'
      } catch (e) {}
    }
    window.CRISP_RUNTIME_CONFIG = { locale: lang === 'zh' ? 'zh-tw' : 'en' }
  } catch (e) {}
  const s = document.createElement('script')
  s.src = 'https://client.crisp.chat/l.js'
  s.async = true
  document.head.appendChild(s)
}

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    loadCrisp()
  }, [])

  useEffect(() => {
    let observer

    const run = () => {
      if (observer) observer.disconnect()

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' })

      document.querySelectorAll('.fade-up').forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible')
        } else {
          observer.observe(el)
        }
      })
    }

    const timer = setTimeout(run, 50)
    router.events.on('routeChangeComplete', run)
    window.addEventListener('resize', run)

    const safety = setTimeout(() => {
      document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('visible'))
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(safety)
      if (observer) observer.disconnect()
      router.events.off('routeChangeComplete', run)
      window.removeEventListener('resize', run)
    }
  }, [router.events])

  return (
    <ErrorBoundary>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Script id="wechat-font-lock" strategy="afterInteractive">
        {`
          // WeChat's in-app "Text Size" setting force-scales webpage fonts.
          // The official WeixinJSBridge callback resets pages to normal size.
          // Runs only inside WeChat - WeixinJSBridge does not exist anywhere else.
          (function () {
            function lock() {
              try {
                WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
                WeixinJSBridge.on('menu:setfont', function () {
                  WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
                });
              } catch (e) {}
            }
            if (typeof WeixinJSBridge === 'object' && typeof WeixinJSBridge.invoke === 'function') {
              lock();
            } else {
              document.addEventListener('WeixinJSBridgeReady', lock, false);
            }
          })();
        `}
      </Script>
      <Component {...pageProps} />

    </ErrorBoundary>
  )
}
