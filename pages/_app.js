import '../styles/globals.css'
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
const CRISP_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

export default function App({ Component, pageProps }) {
  const router = useRouter()

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
      <Component {...pageProps} />

      {CRISP_ID ? (
        <Script id="crisp-widget" strategy="afterInteractive">
          {`
            window.$crisp = [];
            window.CRISP_WEBSITE_ID = "${CRISP_ID}";
            // Match the chat language to the site language (?lang= wins,
            // then the stored toggle choice, otherwise English). Crisp reads
            // CRISP_RUNTIME_CONFIG once at load, so a toggle after load
            // applies on the next page view.
            try {
              var cllLang = "en";
              var cllParam = new URLSearchParams(window.location.search).get("lang");
              if (cllParam === "zh" || cllParam === "zh-TW" || cllParam === "zh-Hant") {
                cllLang = "zh";
              } else if (cllParam !== "en") {
                try {
                  if (window.localStorage.getItem("cll_lang") === "zh") cllLang = "zh";
                } catch (e) {}
              }
              window.CRISP_RUNTIME_CONFIG = { locale: cllLang === "zh" ? "zh-tw" : "en" };
            } catch (e) {}
            (function () {
              var d = document, s = d.createElement("script");
              s.src = "https://client.crisp.chat/l.js";
              s.async = 1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
      ) : null}
    </ErrorBoundary>
  )
}
