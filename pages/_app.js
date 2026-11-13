import '../styles/globals.css'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import ErrorBoundary from '../components/ErrorBoundary'
import { onUserLangChange } from '../lib/i18n'
import ReferralBanner, { PROMO_HEIGHT } from '../components/ReferralBanner'

// Referral bar pinned to the top of public pages (2026-11-13).
// Set PROMO_ON to false to remove it everywhere. Internal pages, the
// full-screen demo and the restricted page never show it.
const PROMO_ON = true
const PROMO_HIDDEN = ['/admin', '/manage', '/team', '/demo', '/restricted']

// Internal pages: no live chat there (2026-11-13). The chat is hidden on
// these pages and loaded / shown again on the public ones.
const NO_CHAT = ['/admin', '/manage', '/team']

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

const CRISP_REOPEN_KEY = 'cll_chat_reopen'

// Site language → Crisp chatbox language (ISO 639-1; Chinese is zh-tw).
// 2026-11-10: + Simplified Chinese and 23 more languages. A language Crisp
// does not offer falls back to English inside the chat box only.
const CRISP_LOCALE = {
  en: 'en', zh: 'zh-tw', zhs: 'zh', ar: 'ar', es: 'es', pt: 'pt', ja: 'ja',
  ko: 'ko', ms: 'ms', fr: 'fr', de: 'de', th: 'th',
  it: 'it', nl: 'nl', ca: 'ca', mt: 'mt', el: 'el', sv: 'sv', da: 'da',
  nb: 'no', fi: 'fi', is: 'is', pl: 'pl', cs: 'cs', sk: 'sk', sl: 'sl',
  hr: 'hr', hu: 'hu', ro: 'ro', bg: 'bg', et: 'et', lv: 'lv', lt: 'lt',
  he: 'he', dv: 'dv', lb: 'lb', ga: 'ga', cy: 'cy', eu: 'eu', gl: 'gl',
  tr: 'tr', ta: 'ta',
}

function loadCrisp() {
  if (!CRISP_ID || typeof window === 'undefined' || window.$crisp) return
  window.$crisp = []
  window.CRISP_WEBSITE_ID = CRISP_ID
  // Start the chat in the site language (?lang= wins, then the stored
  // language-menu choice, otherwise English). Later changes from the
  // language menu are applied immediately by App below.
  // 2026-10-28: all site languages, not only English and Chinese.
  try {
    const norm = (v) => {
      if (!v) return null
      const c = String(v).toLowerCase()
      if (c === 'zh' || c === 'zh-tw' || c === 'zh-hant' || c === 'zh-hk' || c === 'zh-mo') return 'zh'
      if (c === 'zhs' || c === 'zh-cn' || c === 'zh-hans' || c === 'zh-sg' || c === 'zh-my') return 'zhs'
      let base = c.split('-')[0]
      if (base === 'no' || base === 'nn') base = 'nb'
      if (base === 'iw') base = 'he'
      return base !== 'zh' && CRISP_LOCALE[base] ? base : null
    }
    let lang = norm(new URLSearchParams(window.location.search).get('lang'))
    if (!lang) {
      try { lang = norm(window.localStorage.getItem('cll_lang')) } catch (e) {}
    }
    window.CRISP_RUNTIME_CONFIG = { locale: CRISP_LOCALE[lang || 'en'] }
  } catch (e) {}
  // Reopen the chat if it was open before a language-change reload.
  try {
    if (window.sessionStorage.getItem(CRISP_REOPEN_KEY) === '1') {
      window.sessionStorage.removeItem(CRISP_REOPEN_KEY)
      window.$crisp.push(['do', 'chat:open'])
    }
  } catch (e) {}
  const s = document.createElement('script')
  s.src = 'https://client.crisp.chat/l.js'
  s.async = true
  document.head.appendChild(s)
}

// WeChat font lock.
// WeChat's in-app "Text Size" setting force-scales webpage fonts, which makes
// the whole site look oversized inside WeChat. The official WeixinJSBridge
// callback resets the page to normal size. Runs only inside WeChat -
// WeixinJSBridge does not exist anywhere else.
// This runs from the site's own bundled JavaScript, because the
// Content-Security-Policy blocks inline <script> tags.
function lockWeChatFontSize() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const lock = () => {
    try {
      window.WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 })
      window.WeixinJSBridge.on('menu:setfont', () => {
        window.WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 })
      })
    } catch (e) {}
  }
  if (window.WeixinJSBridge && typeof window.WeixinJSBridge.invoke === 'function') {
    lock()
  } else {
    document.addEventListener('WeixinJSBridgeReady', lock, false)
  }
}

// WeChat clean page loads (2026-09-21).
// Inside WeChat's built-in browser, switching pages without a reload sometimes
// leaves parts of the previous page on screen (e.g. the Demo page's WALLET /
// CONNECT panel showing at the bottom of the Payment page). Inside WeChat only,
// every link to another page of this site does a full, clean page load instead.
// Other browsers are unchanged. Same-page links (#contact etc.), new-tab links,
// email links and downloads are left alone.
function wechatFullPageLinks() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}
  if (!/MicroMessenger/i.test(window.navigator.userAgent || '')) return () => {}
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    let a = e.target
    while (a && a.nodeName !== 'A') a = a.parentNode
    if (!a || !a.href) return
    if (a.target && a.target !== '_self') return
    if (a.hasAttribute('download')) return
    let url
    try { url = new URL(a.href, window.location.href) } catch (err) { return }
    if (url.origin !== window.location.origin) return
    if (url.pathname === window.location.pathname && url.search === window.location.search) return
    e.preventDefault()
    e.stopPropagation()
    window.location.href = url.href
  }
  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const showPromo = PROMO_ON && !PROMO_HIDDEN.includes(router.pathname)

  // Jumping to #contact etc.: leave room for the referral bar as well as
  // the nav (the nav's own room is 64px, or 96px on phones — globals.css).
  useEffect(() => {
    const html = document.documentElement
    if (!showPromo) { html.style.scrollPaddingTop = ''; return undefined }
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => { html.style.scrollPaddingTop = ((mq.matches ? 96 : 64) + PROMO_HEIGHT) + 'px' }
    apply()
    window.addEventListener('resize', apply)
    return () => { window.removeEventListener('resize', apply); html.style.scrollPaddingTop = '' }
  }, [showPromo])

  // When the visitor picks another language in the menu, reload the page
  // once so the chat comes back fully in that language (2026-10-29).
  // Crisp builds its welcome greeting only when the chat loads — its own
  // docs say the load-time settings "cannot be changed after the chatbox
  // script has loaded" — so a reload is the one reliable way. The chosen
  // language is already saved, ?lang= in the address is updated to match,
  // and if the chat window was open it is reopened after the reload.
  // Only happens when the chat is switched on (NEXT_PUBLIC_CRISP_WEBSITE_ID),
  // and only for a menu choice — restoring the saved language on page load
  // never triggers it.
  useEffect(() => onUserLangChange((code) => {
    if (!CRISP_ID || typeof window === 'undefined' || !window.$crisp) return
    try {
      let wasOpen = false
      try { wasOpen = typeof window.$crisp.is === 'function' && window.$crisp.is('chat:opened') } catch (e) {}
      try { if (wasOpen) window.sessionStorage.setItem(CRISP_REOPEN_KEY, '1') } catch (e) {}
      const url = new URL(window.location.href)
      if (url.searchParams.has('lang')) url.searchParams.set('lang', code)
      window.location.replace(url.toString())
    } catch (e) {
      // If the reload cannot happen, at least switch the chat's own labels.
      try { window.$crisp.push(['config', 'locale', [CRISP_LOCALE[code] || 'en']]) } catch (err) {}
    }
  }), [])

  useEffect(() => {
    lockWeChatFontSize()
    return wechatFullPageLinks()
  }, [])

  const chatAllowed = !NO_CHAT.includes(router.pathname)
  useEffect(() => {
    if (chatAllowed) {
      loadCrisp()
      try { window.$crisp && window.$crisp.push(['do', 'chat:show']) } catch (e) {}
    } else {
      try { window.$crisp && window.$crisp.push(['do', 'chat:hide']) } catch (e) {}
    }
  }, [chatAllowed])

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
      <div style={{ '--promo-h': showPromo ? PROMO_HEIGHT + 'px' : '0px' }}>
        {showPromo && <ReferralBanner />}
        <Component {...pageProps} />
      </div>
    </ErrorBoundary>
  )
}
