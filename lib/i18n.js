/**
 * lib/i18n.js
 *
 * Lightweight bilingual support: English and Traditional Chinese.
 *
 * Deliberately client-side only. Adding Next.js i18n routing would change
 * how every route resolves, including /flow, and there is no reason to put
 * a working demo at risk for a feature this contained.
 *
 * How a visitor lands on Chinese:
 *   1. ?lang=zh in the URL  — shareable, wins over everything
 *   2. the toggle in the nav — stored so it persists across pages
 *   3. otherwise English
 *
 * If anything here fails — storage blocked, a missing key, a locked-down
 * in-app browser — English renders. Failure is never a blank page.
 */

import { useState, useEffect, useCallback } from 'react'

export const LANGS = { EN: 'en', ZH: 'zh' }
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
      en: 'COSMOS Ledger Labs Inc. · Ontario, Canada. Demonstrations run on Solana devnet. Devnet tokens have no monetary value. Nothing on this site is an offer to sell or a solicitation to buy any security or digital asset. Third-party tools named on this site are technologies we build with; their mention does not imply partnership or endorsement.',
      zh: 'COSMOS Ledger Labs Inc. · 加拿大安大略省。所有演示均在 Solana devnet 測試網上執行。測試網代幣不具任何金錢價值。本網站的任何內容均不構成出售要約，亦不構成購買任何證券或數位資產的要約邀請。本網站提及的第三方工具為我們使用的技術，提及不代表任何合作或背書關係。',
    },
    fraud: {
      en: 'We never send payment addresses through chat, social media or unsolicited email.',
      zh: '我們絕不會透過聊天、社群媒體或未經預期的電子郵件傳送收款地址。',
    },
    linkServices: { en: 'Services', zh: '服務' },
    linkDemo: { en: 'Demo', zh: '演示' },
    linkPayment: { en: 'Payment', zh: '付款' },
    linkDisclaimer: { en: 'Disclaimer', zh: '免責聲明' },
    linkPrivacy: { en: 'Privacy', zh: '隱私政策' },
    linkContact: { en: 'Contact', zh: '聯絡我們' },
  },

  services: {
    metaTitle: {
      en: 'Digital Asset Technology Services — COSMOS Ledger Labs',
      zh: '數位資產技術服務 — COSMOS Ledger Labs',
    },
    badge: { en: '// CLIENT SERVICES', zh: '// 客戶服務' },
    title1: { en: 'DIGITAL ASSET', zh: '數位資產' },
    title2a: { en: 'TECHNOLOGY', zh: '技術' },
    title2b: { en: 'SERVICES', zh: '服務' },
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
      en: 'COSMOS works with external development partners under company-controlled intellectual property and repository agreements. Product definition, architecture and delivery management stay in-house.',
      zh: 'COSMOS 與外部開發夥伴合作，並以公司控管的智慧財產權與程式碼庫協議為基礎。產品定義、架構設計與交付管理由公司內部負責。',
    },

    tagScope: { en: '// SECTION 03 — SCOPE', zh: '// 第 03 節 — 業務範圍' },
    headScope: { en: "WHAT WE DON'T DO", zh: '我們不做什麼' },
    scopeIntro: {
      en: 'We are a software company. To keep that boundary clear, we do not:',
      zh: '我們是一家軟體公司。為了保持界線清楚，我們不：',
    },
    feeNote: {
      en: 'Our fees are fixed per project. We never charge success fees or take a percentage of funds raised.',
      zh: '我們的收費依專案固定計算。我們絕不收取成功費，也不抽取募集資金的任何比例。',
    },

    tagSecurity: { en: '// SECTION 04 — SECURITY', zh: '// 第 04 節 — 資安' },
    headSecurity: { en: 'SECURITY', zh: '資訊安全' },
    securityText: {
      en: 'Security assessment and audit services are delivered through qualified external cybersecurity partners. We coordinate; we do not perform audits in-house. Where a project requires an independent audit, it is scoped and quoted separately.',
      zh: '資安評估與稽核服務由合格的外部資安夥伴提供。我們負責協調，不在公司內部執行稽核。若專案需要獨立稽核，將另行界定範圍並報價。',
    },

    tagContact: { en: '// SECTION 05 — CONTACT', zh: '// 第 05 節 — 聯絡' },
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
      zh: '本頁為英文翻譯，僅供參考；如有歧異，以英文版為準。',
    },
    updated: { en: 'LAST UPDATED —', zh: '最後更新 —' },
  },
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
    return entry[lang] || entry.en || key
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
export function useLang() {
  const [lang, setLangState] = useState(LANGS.EN)

  useEffect(() => {
    let resolved = LANGS.EN

    try {
      const param = new URLSearchParams(window.location.search).get('lang')
      if (param === 'zh' || param === 'zh-TW' || param === 'zh-Hant') {
        resolved = LANGS.ZH
        try { window.localStorage.setItem(STORAGE_KEY, LANGS.ZH) } catch (e) {}
      } else if (param === 'en') {
        resolved = LANGS.EN
        try { window.localStorage.setItem(STORAGE_KEY, LANGS.EN) } catch (e) {}
      } else {
        // No parameter — use the stored choice if there is one.
        try {
          const stored = window.localStorage.getItem(STORAGE_KEY)
          if (stored === LANGS.ZH) resolved = LANGS.ZH
        } catch (e) {
          // Storage can be blocked in private mode or a restricted in-app
          // browser. English is the correct answer in that case.
        }
      }
    } catch (e) {
      // Leave English.
    }

    if (resolved !== LANGS.EN) setLangState(resolved)
  }, [])

  const setLang = useCallback((next) => {
    setLangState(next)
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch (e) {}
    try {
      document.documentElement.lang = next === LANGS.ZH ? 'zh-Hant' : 'en'
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      document.documentElement.lang = lang === LANGS.ZH ? 'zh-Hant' : 'en'
    } catch (e) {}
  }, [lang])

  return { lang, setLang, isZh: lang === LANGS.ZH }
}
