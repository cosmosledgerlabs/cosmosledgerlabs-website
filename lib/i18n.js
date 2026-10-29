/**
 * lib/i18n.js
 *
 * Multi-language support.
 *
 * English and Traditional Chinese are written side by side in the code as
 * { en: '…', zh: '…' }. The other languages (added 2026-10-28) live in
 * lib/locales/<code>.js: each file maps an English sentence to its
 * translation, so the page code does not change when a language is added.
 * A language file is downloaded only when a visitor picks that language.
 *
 * Deliberately client-side only. Adding Next.js i18n routing would change
 * how every route resolves, including /flow, and there is no reason to put
 * a working demo at risk for a feature this contained.
 *
 * How a visitor lands on a language:
 *   1. ?lang=xx in the URL  — shareable, wins over everything (?lang=ar …)
 *   2. the language menu in the nav — stored so it persists across pages
 *   3. otherwise English
 *
 * Not translated on purpose (kept in English for every language except
 * Chinese): the legal pages (Disclaimer, Terms, Privacy) and the legal
 * lines in the footer. Prices, token parameters and addresses are never
 * translated.
 *
 * If anything here fails — storage blocked, a missing key, a missing
 * translation, a locked-down in-app browser — English renders. Failure is
 * never a blank page.
 */

import { useState, useEffect, useCallback } from 'react'

export const LANGS = {
  EN: 'en', ZH: 'zh', AR: 'ar', ES: 'es', PT: 'pt', JA: 'ja',
  KO: 'ko', MS: 'ms', FR: 'fr', DE: 'de', TH: 'th',
}

/* Order shown in the language menu. Each label is in its own language.
   ready: false = translation not added yet; hidden from the menu. When its
   lib/locales/<code>.js file is added, delete ready: false. */
export const LANG_LIST = [
  { code: 'en', label: 'English', short: 'EN', html: 'en', og: 'en_CA' },
  { code: 'zh', label: '繁體中文', short: '繁體', html: 'zh-Hant', og: 'zh_TW' },
  { code: 'ar', label: 'العربية', short: 'AR', html: 'ar', og: 'ar_AR', rtl: true },
  { code: 'es', label: 'Español', short: 'ES', html: 'es', og: 'es_LA' },
  { code: 'pt', ready: false, label: 'Português', short: 'PT', html: 'pt', og: 'pt_BR' },
  { code: 'ja', ready: false, label: '日本語', short: 'JA', html: 'ja', og: 'ja_JP' },
  { code: 'ko', ready: false, label: '한국어', short: 'KO', html: 'ko', og: 'ko_KR' },
  { code: 'ms', ready: false, label: 'Bahasa Melayu', short: 'MS', html: 'ms', og: 'ms_MY' },
  { code: 'fr', ready: false, label: 'Français', short: 'FR', html: 'fr', og: 'fr_FR' },
  { code: 'de', ready: false, label: 'Deutsch', short: 'DE', html: 'de', og: 'de_DE' },
  { code: 'th', ready: false, label: 'ไทย', short: 'TH', html: 'th', og: 'th_TH' },
]
const LANG_INFO = LANG_LIST.reduce((m, l) => { m[l.code] = l; return m }, {})
export const isRtl = (lang) => !!(LANG_INFO[lang] && LANG_INFO[lang].rtl)
export const ogLocale = (lang) => (LANG_INFO[lang] ? LANG_INFO[lang].og : 'en_CA')

/* Languages whose text comes from lib/locales/<code>.js */
const DICT_LANGS = ['ar', 'es', 'pt', 'ja', 'ko', 'ms', 'fr', 'de', 'th']
const STORAGE_KEY = 'cll_lang'

/* ------------------------------------------------------------------ */
/* Translations                                                        */
/* ------------------------------------------------------------------ */

export const T = {
  nav: {
    services: { en: 'SERVICES', zh: '服務' },
    demo: { en: 'DEMO', zh: '演示' },
    payment: { en: 'PAYMENT', zh: '付款' },
    problem: { en: 'PROBLEM', zh: '問題' },
    about: { en: 'ABOUT US', zh: '關於我們' },
    solution: { en: 'SOLUTION', zh: '方案' },
    architecture: { en: 'ARCHITECTURE', zh: '架構' },
    roadmap: { en: 'ROADMAP', zh: '路線圖' },
    contact: { en: 'CONTACT', zh: '聯絡' },
  },

  footer: {
    about: {
      en: 'COSMOS Ledger Labs Inc. is a Toronto-based digital asset technology company. We design, build, and hand over the technical infrastructure that digital asset projects need to launch and operate: corporate websites, operations dashboards, token deployment and configuration, claim portals, data integrations and APIs, and smart contract front-ends.',
      zh: 'COSMOS Ledger Labs Inc. 是一家位於多倫多的數位資產技術公司。我們設計、建置並交付數位資產專案啟動與營運所需的技術基礎：企業網站、營運儀表板、代幣部署與設定、領取頁面、資料整合與 API，以及智能合約前端介面。',
    },
    legal: {
      en: 'COSMOS Ledger Labs Inc. · Ontario, Canada. Demonstrations run on Solana devnet. Devnet tokens have no monetary value. Nothing on this site is an offer to sell or a solicitation to buy any security or digital asset. Except where expressly identified as a partner, third-party tools mentioned on this site are technologies we use; mention does not imply any partnership or endorsement.',
      zh: 'COSMOS Ledger Labs Inc. · 加拿大安大略省。所有演示均在 Solana devnet 測試網上執行。測試網代幣不具任何金錢價值。本網站的任何內容均不構成出售要約，亦不構成購買任何證券或數位資產的要約邀請。除本網站明確標示為合作夥伴者外，本網站提及的第三方工具為我們使用的技術，提及不代表任何合作或背書關係。',
    },
    fraud: {
      en: 'We never send payment addresses through chat, social media or unsolicited email.',
      zh: '我們絕不會透過聊天、社群媒體或未經預期的電子郵件傳送收款地址。',
    },
    linkServices: { en: 'Services', zh: '服務' },
    linkDemo: { en: 'Demo', zh: '演示' },
    linkAbout: { en: 'About Us', zh: '關於我們' },
    linkPayment: { en: 'Payment', zh: '付款' },
    linkDisclaimer: { en: 'Disclaimer', zh: '免責聲明' },
    linkPrivacy: { en: 'Privacy', zh: '隱私政策' },
    linkTerms: { en: 'Terms', zh: '服務條款' },
    linkContact: { en: 'Contact', zh: '聯絡我們' },
  },

  services: {
    metaTitle: {
      en: 'Digital Asset Technology Services — COSMOS Ledger Labs',
      zh: '數位資產技術服務 — COSMOS Ledger Labs',
    },
    badge: { en: '// CLIENT SERVICES', zh: '// 客戶服務' },
    /* 2026-09-25: headline matches the homepage —
       "Infrastructure & technical delivery for digital asset projects" */
    title0: { en: 'INFRASTRUCTURE &', zh: '為數位資產專案提供' },
    title1: { en: 'TECHNICAL DELIVERY FOR', zh: '基礎設施與技術交付' },
    title2a: { en: 'DIGITAL ASSET', zh: '數位資產' },
    title2b: { en: 'PROJECTS', zh: '專案' },
    subline: {
      en: 'DASHBOARDS  |  INTERFACES  |  DEPLOYMENT  |  INTEGRATION',
      zh: '儀表板  |  介面  |  部署  |  整合',
    },
    lede: {
      en: 'We build the software layer for digital asset projects — dashboards, websites, deployment execution and data integration. Delivered on fixed timelines, at fixed prices, by a Canadian company.',
      zh: '我們為數位資產專案建置軟體層——儀表板、網站、部署執行與資料整合。由加拿大公司交付，固定時程、固定價格。',
    },
    btnQuote: { en: 'REQUEST A QUOTE →', zh: '索取報價 →' },
    btnSee: { en: 'SEE WHAT WE BUILD', zh: '查看我們的服務' },

    tagServices: { en: '// SECTION 01 — SERVICES', zh: '// 第 01 節 — 服務' },
    headServices: { en: 'WHAT WE BUILD', zh: '我們建置什麼' },
    note: {
      en: 'Multi-chain: we work across Solana and EVM-compatible networks. Chain selection is confirmed at the scope call.',
      zh: '多鏈支援：我們支援 Solana 與 EVM 相容網路。使用哪條鏈於需求會議中確認。',
    },

    tagProcess: { en: '// SECTION 02 — PROCESS', zh: '// 第 02 節 — 流程' },
    headProcess: { en: 'HOW WE WORK', zh: '我們如何合作' },
    partnerNote: {
      en: 'COSMOS works with external development partners; their work product is assigned to the company under written agreements and transferred to you in full at delivery. Product definition, architecture and delivery management are handled in-house.',
      zh: 'COSMOS 與外部開發夥伴合作；其工作成果依書面協議歸屬本公司，交付時再完整移交給您。產品定義、架構設計與交付管理由公司內部負責。',
    },

    tagScope: { en: '// SECTION 03 — SCOPE', zh: '// 第 03 節 — 業務範圍' },
    headScope: { en: "WHAT WE DON'T DO", zh: '我們不做什麼' },
    scopeIntro: {
      en: 'We are a software company. To keep that boundary clear, we do not:',
      zh: '我們是一家軟體公司。為了保持界線清楚，我們不：',
    },
    feeNote: {
      en: 'Build fees are fixed per project, and advisory is billed at the rates above. We never charge success fees or take a percentage of funds raised.',
      zh: '建置費用依專案固定計算，諮詢依上列價格收費。我們絕不收取成功費，也不抽取募集資金的任何比例。',
    },

    tagSecurity: { en: '// SECTION 04 — SECURITY', zh: '// 第 04 節 — 資安' },
    headSecurity: { en: 'SECURITY', zh: '資訊安全' },
    securityText: {
      en: 'Where a project requires a security assessment or audit, we refer you to qualified independent audit firms; the audit is scoped and contracted directly between you and the auditor. COSMOS does not perform audits.',
      zh: '若專案需要資安評估或稽核，我們會轉介合格的獨立稽核機構；稽核範圍與合約由您與稽核機構直接議定。COSMOS 不執行稽核。',
    },

    /* 2026-10-28: countries and regions served (website-building services) */
    tagAreas: { en: '// SECTION 05 — SERVICE AREAS', zh: '// 第 05 節 — 服務地區' },
    headAreas: { en: 'WHERE WE SERVE', zh: '服務地區' },
    areasIntro: {
      en: 'Our website-building services are available to clients in the following {n} countries and regions:',
      zh: '我們的網站建置服務適用於以下 {n} 個國家及地區的客戶：',
    },

    tagContact: { en: '// SECTION 06 — CONTACT', zh: '// 第 06 節 — 聯絡' },
    headContact: { en: "TELL US WHAT YOU'RE BUILDING", zh: '告訴我們您在建置什麼' },
    contactText: {
      en: "We'll tell you what it costs and how long it takes — usually within two business days.",
      zh: '我們會告知費用與所需時間——通常在兩個工作天內回覆。',
    },
    contactLocation: {
      en: '📍 Toronto, Ontario, Canada · Working with clients worldwide',
      zh: '📍 加拿大安大略省多倫多 · 服務全球客戶',
    },
    priceFrom: { en: 'FROM', zh: '起價' },
    weeks: { en: 'WEEKS', zh: '週' },
  },

  legal: {
    prevail: {
      en: '',
      zh: '本頁為英文版之中文翻譯，僅供參考；如有歧異，以英文版為準。',
    },
    updated: { en: 'LAST UPDATED —', zh: '最後更新 —' },
    /* shown on translated (non-legal) pages in the other languages */
    translated: {
      en: 'This page is a translation of the English version, for reference only. If there is any difference, the English version prevails.',
      zh: '本頁為英文版之中文翻譯，僅供參考；如有歧異，以英文版為準。',
    },
    /* shown above the English text of a legal page in the other languages */
    englishOnly: {
      en: 'This page is available in English only.',
      zh: '本頁僅提供英文版。',
    },
  },
}

/* Footer lines kept in English in every language except Chinese (legal) */
const KEEP_ENGLISH = { footer: { legal: true, fraud: true } }

/* ------------------------------------------------------------------ */
/* Language files (lib/locales/<code>.js)                              */
/* ------------------------------------------------------------------ */

const DICTS = {}

function loadDict(lang) {
  if (!DICT_LANGS.includes(lang)) return Promise.resolve(null)
  if (DICTS[lang]) return Promise.resolve(DICTS[lang])
  return import(`./locales/${lang}.js`)
    .then((m) => { DICTS[lang] = (m && m.default) || {}; return DICTS[lang] })
    .catch(() => { DICTS[lang] = {}; return DICTS[lang] })
}

/* Translate one English string. Leading/trailing spaces are kept. If the
   exact sentence is missing, numbers are tried as placeholders
   ("// SECTION 05 — CONTACT" matches "// SECTION {#} — CONTACT").
   Anything not found stays English. */
export function tr(text, lang) {
  const dict = DICTS[lang]
  if (!dict || typeof text !== 'string' || !text.trim()) return text
  const lead = text.match(/^\s*/)[0]
  const tail = text.match(/\s*$/)[0]
  const core = text.trim()
  let out = dict[core]
  if (out === undefined && /\d/.test(core)) {
    const pattern = dict[core.replace(/\d+/g, '{#}')]
    if (pattern !== undefined) {
      const nums = core.match(/\d+/g)
      let i = 0
      out = pattern.replace(/\{#\}/g, () => (i < nums.length ? nums[i++] : ''))
    }
  }
  if (out === undefined) {
    // English kept on a right-to-left page: isolate it (Unicode LRI … PDI)
    // so its punctuation stays at the correct end.
    return isRtl(lang) && /[A-Za-z]/.test(core) ? lead + '⁦' + core + '⁩' + tail : text
  }
  return lead + out + tail
}

/* Entries written as functions, e.g. { en: (n) => 'FAIL AT ' + n }. The
   language file holds the sentence with {0}, {1}… where the values go. */
function trFn(fn, lang) {
  const holes = Array.from({ length: fn.length }, (_, i) => '{' + i + '}')
  let key
  try { key = fn(...holes) } catch (e) { return fn }
  const dict = DICTS[lang]
  const core = typeof key === 'string' ? key.trim() : key
  if (!dict || typeof core !== 'string' || dict[core] === undefined) return fn
  const lead = key.match(/^\s*/)[0]
  const tail = key.match(/\s*$/)[0]
  const pattern = lead + dict[core] + tail
  return (...args) => pattern.replace(/\{(\d+)\}/g, (m, i) => (args[i] !== undefined ? args[i] : m))
}

/* Pick the right text out of { en, zh } for any language. English and
   Chinese behave exactly as before. */
export function pick(obj, lang) {
  if (!obj) return ''
  if (lang === LANGS.EN || !lang) return obj.en
  if (lang === LANGS.ZH) return obj.zh || obj.en
  if (obj[lang]) return obj[lang]
  if (typeof obj.en === 'function') return trFn(obj.en, lang)
  return tr(obj.en, lang)
}

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

/**
 * Read a translation. Always returns a string.
 *
 * A missing key falls back to English, and a missing English string falls
 * back to the key itself, so a typo shows as odd text rather than crashing
 * the page.
 */
export function t(section, key, lang) {
  try {
    const entry = T[section] && T[section][key]
    if (!entry) return key
    if (lang !== LANGS.ZH && KEEP_ENGLISH[section] && KEEP_ENGLISH[section][key]) return entry.en || key
    return pick(entry, lang) || entry.en || key
  } catch (e) {
    return key
  }
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Current language, plus a setter.
 *
 * Renders English on the server and on first paint, then switches on the
 * client. That order avoids a React hydration mismatch — the alternative
 * produces console errors and, in some browsers, flickering text.
 */
/* Shared language state (2026-10-04 fix). Every component that calls
   useLang() subscribes to the same value, so choosing a language updates the
   whole page at once — previously each component kept its own copy and the
   rest of the page only changed after moving to another page. */
let currentLang = null
const langListeners = new Set()

const VALID = LANG_LIST.map((l) => l.code)
function normalize(code) {
  if (!code) return null
  const c = String(code).toLowerCase()
  if (c === 'zh' || c === 'zh-tw' || c === 'zh-hant') return LANGS.ZH
  const base = c.split('-')[0]
  return VALID.includes(base) && base !== 'zh' ? base : null
}

function resolveInitialLang() {
  let resolved = LANGS.EN
  try {
    const param = normalize(new URLSearchParams(window.location.search).get('lang'))
    if (param) {
      resolved = param
      try { window.localStorage.setItem(STORAGE_KEY, param) } catch (e) {}
    } else {
      // No parameter — use the stored choice if there is one.
      try {
        const stored = normalize(window.localStorage.getItem(STORAGE_KEY))
        if (stored) resolved = stored
      } catch (e) {
        // Storage can be blocked in private mode or a restricted in-app
        // browser. English is the correct answer in that case.
      }
    }
  } catch (e) {
    // Leave English.
  }
  return resolved
}

/* <html lang> and, for Arabic, right-to-left layout (dir="rtl"). */
function applyDocumentLang(lang) {
  try {
    const info = LANG_INFO[lang] || LANG_INFO.en
    document.documentElement.lang = info.html
    document.documentElement.dir = info.rtl ? 'rtl' : 'ltr'
  } catch (e) {}
}

function announce(next) {
  currentLang = next
  applyDocumentLang(next)
  langListeners.forEach((fn) => { try { fn(next) } catch (e) {} })
}

let initStarted = false

export function useLang() {
  const [lang, setLangState] = useState(() => (currentLang && (!DICT_LANGS.includes(currentLang) || DICTS[currentLang]) ? currentLang : LANGS.EN))

  useEffect(() => {
    const listener = (next) => setLangState(next)
    langListeners.add(listener)
    if (!initStarted) {
      initStarted = true
      const first = resolveInitialLang()
      // The language file is loaded before switching, so the page never
      // shows half-translated text.
      loadDict(first).then(() => announce(first))
    } else if (currentLang && currentLang !== lang && (!DICT_LANGS.includes(currentLang) || DICTS[currentLang])) {
      setLangState(currentLang)
    }
    return () => { langListeners.delete(listener) }
  }, [])

  const setLang = useCallback((next) => {
    const code = normalize(next) || LANGS.EN
    try { window.localStorage.setItem(STORAGE_KEY, code) } catch (e) {}
    loadDict(code).then(() => announce(code))
  }, [])

  const L = useCallback((obj) => {
    const v = pick(obj, lang)
    return v === undefined || v === null ? '' : v
  }, [lang])

  return { lang, setLang, isZh: lang === LANGS.ZH, isRtl: isRtl(lang), L }
}
