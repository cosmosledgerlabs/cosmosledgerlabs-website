import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang, t } from '../lib/i18n'
import styles from '../styles/Legal.module.css'

const UPDATED = '2026-09-11'

const SECTIONS = [
  {
    h: { en: 'WHO WE ARE', zh: '我們是誰' },
    body: [
      {
        en: 'This website is operated by COSMOS Ledger Labs Inc., a digital asset technology company based in Toronto, Ontario, Canada. For anything in this policy, contact info@cosmosledgerlabs.com.',
        zh: '本網站由 COSMOS Ledger Labs Inc. 營運，是一家位於加拿大安大略省多倫多的數位資產技術公司。與本政策相關的任何事項，請聯絡 info@cosmosledgerlabs.com。',
      },
    ],
  },
  {
    h: { en: 'WHAT THIS SITE COLLECTS', zh: '本網站收集什麼' },
    body: [
      {
        en: 'Very little. This website has no user accounts, no analytics, and no advertising trackers. Apart from the live chat described below, it sets no cookies. We do not build profiles of visitors and we do not sell or share visitor data.',
        zh: '幾乎不收集。本網站沒有使用者帳號、沒有分析工具，也沒有廣告追蹤器。除下述在線聊天外，不設置任何 Cookie。我們不會建立訪客檔案，亦不會出售或分享訪客資料。',
      },
    ],
  },
  {
    h: { en: 'LANGUAGE PREFERENCE', zh: '語言偏好設定' },
    body: [
      {
        en: 'When you switch between English and Chinese, your choice is stored in a single browser localStorage entry (cll_lang) so the site remembers your language. This value stays in your browser and is never transmitted to us. You can remove it at any time by clearing your browser data for this site.',
        zh: '當您在英文與中文之間切換時，您的選擇會儲存在瀏覽器的一筆 localStorage 記錄（cll_lang）中，以便網站記住您的語言。此數值僅保留在您的瀏覽器內，絕不會傳送給我們。您隨時可透過清除本網站的瀏覽器資料將其移除。',
      },
    ],
  },
  {
    h: { en: 'HOSTING LOGS', zh: '主機日誌' },
    body: [
      {
        en: 'This website is served from Vercel Inc. infrastructure. As with virtually all web hosting, standard technical logs (such as IP address, browser type and pages requested) may be processed by the hosting provider for security and operation of the service.',
        zh: '本網站由 Vercel Inc. 的基礎設施提供服務。與幾乎所有網站託管相同，主機服務商可能為安全與營運目的處理標準技術日誌（例如 IP 位址、瀏覽器類型與所請求的頁面）。',
      },
    ],
  },
  {
    h: { en: 'EMAIL', zh: '電子郵件' },
    body: [
      {
        en: 'If you email us, we receive your email address and whatever you choose to send. We use it only to respond to you and to manage any resulting engagement. We do not add you to marketing lists and we do not share your correspondence for marketing purposes.',
        zh: '若您傳送電子郵件給我們，我們會收到您的電子郵件地址及您選擇傳送的內容。我們僅將其用於回覆您以及處理後續的委託事宜。我們不會將您加入行銷名單，亦不會為行銷目的分享您的通信內容。',
      },
    ],
  },
  {
    h: { en: 'LIVE CHAT', zh: '在線聊天' },
    body: [
      {
        en: 'The chat widget on this website is provided by Crisp IM SARL, a company based in France. When the chat is available and you use it, Crisp sets cookies to keep your conversation session and processes the information you provide (such as your email address and messages) on its servers in the European Union, under its own privacy policy. We use this information only to respond to you and to manage any resulting engagement. If you prefer not to use the chat, you can contact us by email instead.',
        zh: '本網站的聊天視窗由位於法國的 Crisp IM SARL 提供。當聊天功能開啟且您使用時，Crisp 會設置 Cookie 以維持您的對話階段，並依其自身隱私政策，在其位於歐盟的伺服器上處理您提供的資訊（例如電子郵件地址與訊息內容）。我們僅將該資訊用於回覆您及處理後續的委託事宜。若您不希望使用聊天功能，歡迎改以電子郵件與我們聯絡。',
      },
    ],
  },
  {
    h: { en: 'THE ON-CHAIN DEMO', zh: '鏈上演示' },
    body: [
      {
        en: 'The demo at /flow connects to a browser wallet that you control. Everything runs client-side in your browser: we operate no server that receives or stores your wallet address or keys. Transactions in the demo occur on the public Solana devnet and, like all blockchain transactions, are publicly visible by design.',
        zh: '/flow 頁面的演示會連接您自行控管的瀏覽器錢包。所有操作均在您的瀏覽器內以客戶端方式執行：我們不營運任何接收或儲存您錢包地址或金鑰的伺服器。演示中的交易在公開的 Solana devnet 測試網上進行，與所有區塊鏈交易相同，其設計即為公開可見。',
      },
    ],
  },
  {
    h: { en: 'YOUR CHOICES', zh: '您的選擇' },
    body: [
      {
        en: 'If you have emailed us and would like to know what correspondence we hold, or would like it deleted where we have no legal or contractual reason to keep it, contact info@cosmosledgerlabs.com.',
        zh: '若您曾與我們通信，並希望了解我們保存了哪些通信內容，或在我們無法律或合約上保存理由的情況下希望刪除該內容，請聯絡 info@cosmosledgerlabs.com。',
      },
    ],
  },
  {
    h: { en: 'CHANGES', zh: '政策變更' },
    body: [
      {
        en: 'If we change how this website handles data, we will update this page and the date shown above.',
        zh: '若本網站處理資料的方式有所變更，我們將更新本頁面及上方所示日期。',
      },
    ],
  },
]

export default function Privacy() {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <>
      <Head>
        <title>{isZh ? '隱私政策 — COSMOS Ledger Labs' : 'Privacy — COSMOS Ledger Labs'}</title>
        <meta name="description" content={isZh
          ? 'COSMOS Ledger Labs Inc. 網站隱私政策：無帳號、無分析工具、無 Cookie。說明少量處理的資料及其處理方。'
          : 'Privacy policy for the COSMOS Ledger Labs Inc. website: no accounts, no analytics, no cookies. What little is processed, and by whom.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/privacy" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content={isZh ? '隱私政策 — COSMOS Ledger Labs' : 'Privacy — COSMOS Ledger Labs'} />
        <meta property="og:description" content={isZh ? 'COSMOS Ledger Labs Inc. 網站隱私政策。' : 'Privacy policy for the COSMOS Ledger Labs Inc. website.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/privacy" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content={isZh ? 'zh_TW' : 'en_CA'} />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.main}>

          <h1 className={styles.title}>{isZh ? '隱私政策' : 'PRIVACY'}</h1>
          <div className={styles.updated}>{t('legal', 'updated', lang)} {UPDATED}</div>

          {isZh && <p className={styles.prevail}>{t('legal', 'prevail', lang)}</p>}

          {SECTIONS.map((s) => (
            <section key={s.h.en} className={styles.section}>
              <h2 className={styles.h2}>{L(s.h)}</h2>
              {s.body.map((p) => (
                <p key={p.en} className={styles.body}>{L(p)}</p>
              ))}
            </section>
          ))}

        </div>
      </main>

      <Footer />
    </>
  )
}
