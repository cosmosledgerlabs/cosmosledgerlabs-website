import { useLang } from '../lib/i18n'
import styles from './Sections.module.css'

const L2 = (lang) => (obj) => (obj && (obj[lang] || obj.en)) || ''

/* 2.2 — Problem: The delivery gap (client delivery pain, not platform narrative) */
export function Problem() {
  const { lang } = useLang()
  const L = L2(lang)
  const cards = [
    { t: { en: 'A CREDIBLE WEBSITE', zh: '值得信賴的網站' }, d: { en: 'A site that earns trust from users, partners, and reviewers on day one.', zh: '從第一天起就能贏得使用者、夥伴與審核者信任的網站。' } },
    { t: { en: 'AN ACCURATE DASHBOARD', zh: '精準的儀表板' }, d: { en: 'A dashboard that reflects on-chain state accurately, not approximately.', zh: '準確反映鏈上狀態的儀表板，而非「大概正確」。' } },
    { t: { en: 'A CORRECT TOKEN SETUP', zh: '正確的代幣設定' }, d: { en: 'A token deployed and configured correctly the first time.', zh: '一次到位、部署與設定皆正確的代幣。' } },
    { t: { en: 'A CLAIM PORTAL THAT HOLDS', zh: '扛得住的領取頁面' }, d: { en: 'A claim portal that holds up on launch day, under real load.', zh: '在上線日的真實流量下依然穩定的領取頁面。' } },
  ]
  return (
    <section className={styles.section} id="problem">
      <div className="sec-tag">{L({ en: '// SECTION 02 — THE DELIVERY GAP', zh: '// 第 02 節 — 交付缺口' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'THE DELIVERY GAP', zh: '交付缺口' })}</h2>
      <p className={`${styles.secBody} ${styles.gapProse}`}>{L({
        en: "Digital asset teams are strong on protocol design and community — and stretched thin on delivery. Launches stall on the unglamorous work. Generic agencies don't understand on-chain mechanics; protocol engineers don't want to build front-ends. That gap is where launches slip.",
        zh: '數位資產團隊擅長協議設計與社群經營——卻在交付上人力吃緊。專案往往卡在那些不起眼的工作上。一般代理商不懂鏈上機制；協議工程師不想做前端。專案延誤，正是卡在這個缺口。',
      })}</p>
      <div className={styles.cardGrid}>
        {cards.map((c) => (
          <div key={c.t.en} className={`${styles.card} ${styles.gapTight}`}><div className={styles.cardName}>{L(c.t)}</div><div className={`${styles.cardText} ${styles.gapProse}`}>{L(c.d)}</div></div>
        ))}
      </div>
    </section>
  )
}

/* 2.3 — Solution: COSMOS closes the delivery gap */
export function Solution() {
  const { lang } = useLang()
  const L = L2(lang)
  return (
    <section className={styles.section} id="solution">
      <div className="sec-tag">{L({ en: '// SECTION 03 — SOLUTION', zh: '// 第 03 節 — 解決方案' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'COSMOS CLOSES THE DELIVERY GAP', zh: 'COSMOS 補上交付缺口' })}</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>{L({
          en: 'COSMOS is a specialized technical delivery firm for digital asset projects. We scope, build, test, and hand over the operational infrastructure around your protocol or token — on a fixed scope, with devnet verification before anything touches mainnet, and without ever taking custody of your funds or keys. You keep control; we do the engineering.',
          zh: 'COSMOS 是專為數位資產專案而設的技術交付公司。我們為您的協議或代幣界定範圍、建置、測試並移交周邊營運基礎設施——固定範圍、上主網前一律先在 devnet 驗證、且絕不保管您的資金或金鑰。控制權在您手上；工程由我們負責。',
        })}</p>
      </div>
    </section>
  )
}

/* 2.5 — Replaces the old 9-layer architecture + execution lifecycle */
export function HowWeWork() {
  const { lang } = useLang()
  const L = L2(lang)
  const steps = [
    { t: { en: 'SCOPE', zh: '需求界定' }, d: { en: 'A call to define exactly what will be built, and what won\u2019t.', zh: '一通會議，明確定義要建什麼、不建什麼。' } },
    { t: { en: 'QUOTE', zh: '報價' }, d: { en: 'Fixed scope, written quote, milestone schedule.', zh: '固定範圍、書面報價、里程碑時程。' } },
    { t: { en: 'BUILD', zh: '建置' }, d: { en: 'Version-controlled development against the agreed specification.', zh: '依約定規格進行版本控管的開發。' } },
    { t: { en: 'VERIFY', zh: '驗證' }, d: { en: 'Everything tested on Solana devnet before any mainnet action.', zh: '任何主網操作前，一律先在 Solana devnet 完整測試。' } },
    { t: { en: 'HANDOVER', zh: '交付' }, d: { en: 'Code, credentials, and a run-book your team can operate without us.', zh: '程式碼、憑證與操作手冊，您的團隊無需我們也能營運。' } },
  ]
  return (
    <section className={styles.section} id="how-we-work">
      <div className="sec-tag">{L({ en: '// SECTION 05 — HOW WE WORK', zh: '// 第 05 節 — 合作方式' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'HOW WE WORK', zh: '我們如何合作' })}</h2>
      <div className={styles.wfList}>
        {steps.map((s, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <div className={styles.wfStep}>
              <div className={styles.wfDot}/>
              <span className={styles.wfNum}>{String(i + 1).padStart(2, '0')} //</span>
              <span className={styles.wfLabel}>{L(s.t)} — {L(s.d)}</span>
            </div>
            {i < steps.length - 1 && <div className={styles.wfLine}/>}
          </span>
        ))}
      </div>
    </section>
  )
}

/* 2.6 — Security: COSMOS's own delivery practices only; no audit-execution parties named */
export function Security() {
  const { lang } = useLang()
  const L = L2(lang)
  const items = [
    { t: { en: 'LEAST-PRIVILEGE ACCESS', zh: '最小權限存取' }, d: { en: 'Least-privilege access on every engagement; no custody of client keys or funds.', zh: '每個專案皆採最小權限存取；絕不保管客戶金鑰或資金。' } },
    { t: { en: 'DEVNET VERIFICATION', zh: 'DEVNET 驗證' }, d: { en: 'Everything is verified on Solana devnet before any mainnet action.', zh: '任何主網操作前，一律先在 Solana devnet 驗證。' } },
    { t: { en: 'AUTHORITIES TO SPEC', zh: '權限依規格設定' }, d: { en: 'Token authorities configured only to the client\u2019s written specification.', zh: '代幣權限僅依客戶書面規格設定。' } },
    { t: { en: 'VERSION-CONTROLLED HANDOVER', zh: '版本控管交付' }, d: { en: 'Version-controlled code with a documented handover.', zh: '版本控管的程式碼，附完整交付文件。' } },
    { t: { en: 'INDEPENDENT AUDIT REFERRAL', zh: '獨立稽核轉介' }, d: { en: 'Where an audit is required, we refer clients to qualified independent audit firms — COSMOS does not perform audits.', zh: '需要稽核時，轉介合格的獨立稽核機構——COSMOS 不自行執行稽核。' } },
  ]
  return (
    <section className={styles.section} id="security">
      <div className="sec-tag">{L({ en: '// SECTION 06 — SECURITY', zh: '// 第 06 節 — 資安' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'SECURITY AS A DELIVERY PRACTICE', zh: '資安是交付的日常實踐' })}</h2>
      <p className={styles.secBody}>{L({
        en: "Security on every engagement is procedural, not promotional: least-privilege access and no custody of client keys or funds; devnet verification before any mainnet action; token authorities configured only to the client's written specification; version-controlled code with a documented handover; and referral to qualified independent audit firms where an audit is required — COSMOS does not perform audits.",
        zh: '每個專案的資安都是程序性的，而非宣傳性的：最小權限存取，絕不保管客戶金鑰或資金；任何主網操作前先於 devnet 驗證；代幣權限僅依客戶書面規格設定；版本控管的程式碼與書面交付紀錄；需要稽核時，轉介合格的獨立稽核機構——COSMOS 不自行執行稽核。',
      })}</p>
      <div className={styles.secGrid}>
        {items.map((item, i) => (
          <div key={i} className={styles.secCard}>
            <div className={styles.secCardTitle}>{L(item.t)}</div>
            <div className={styles.secCardText}>{L(item.d)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* 2.7 — Replaces the old Ecosystem positioning */
export function Technology() {
  const { lang } = useLang()
  const L = L2(lang)
  return (
    <section className={styles.section} id="technology">
      <div className="sec-tag">{L({ en: '// SECTION 07 — TECHNOLOGY', zh: '// 第 07 節 — 技術' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'TECHNOLOGY WE BUILD WITH', zh: '我們使用的技術' })}</h2>
      <p className={`${styles.ecoText} ${styles.techCenter}`}>{L({
        en: 'Solana · React / Next.js · SPL token standards · established ecosystem tooling including Streamflow, Squads, Magna, and Helius. We build against the tools our clients already use.',
        zh: 'Solana · React / Next.js · SPL 代幣標準 · 成熟的生態系工具，包括 Streamflow、Squads、Magna 與 Helius。我們以客戶已在使用的工具為基礎進行建置。',
      })}</p>
    </section>
  )
}

/* 2.8 — Where We Are: no dates, no commitments */
export function WhereWeAre() {
  const { lang } = useLang()
  const L = L2(lang)
  const items = [
    { t: { en: 'NOW', zh: '現在' }, d: { en: 'Delivering client engagements across our six service lines, with a live on-chain engineering demo on Solana devnet.', zh: '正在六大服務線上交付客戶專案，並於 Solana devnet 提供可實際操作的鏈上工程演示。' } },
    { t: { en: 'NEXT', zh: '接下來' }, d: { en: 'Expanding our vetted engineering partner network and publishing delivery case studies.', zh: '擴大經審核的工程夥伴網絡，並發佈交付案例。' } },
    { t: { en: 'LATER', zh: '之後' }, d: { en: 'Productizing the internal workflow-orchestration tooling behind our demo.', zh: '將演示背後的內部工作流編排工具產品化。' } },
  ]
  return (
    <section className={styles.section} id="where-we-are">
      <div className="sec-tag">{L({ en: '// SECTION 08 — WHERE WE ARE', zh: '// 第 08 節 — 現況' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'WHERE WE ARE', zh: '我們的現況' })}</h2>
      <div className={styles.cardGrid}>
        {items.map((item, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardName}>{L(item.t)}</div>
            <div className={styles.cardText}>{L(item.d)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* 2.10 — Aladdin strategic cooperation: retained */
export function Partners() {
  const { lang } = useLang()
  const L = L2(lang)
  return (
    <section className={styles.section} id="partners">
      <div className="sec-tag">{L({ en: '// SECTION 09 — STRATEGIC COOPERATION', zh: '// 第 09 節 — 策略合作' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'STRATEGIC COOPERATION', zh: '策略合作' })}</h2>
      <div className={`${styles.steelCard} ${styles.tightCard}`}>
        <p className={styles.ecoText}>{L({
          en: 'COSMOS Ledger Labs has signed a strategic-cooperation agreement with Aladdin Cyber Security (Dubai, UAE) — a leading UAE cybersecurity and cloud provider with proprietary technology, founded in 2023 and based in Dubai Internet City. Aladdin brings front-line experience on major security incidents for enterprises and government agencies, spanning smart-contract auditing, full-stack penetration testing, and 24/7 multi-chain incident response.',
          zh: 'COSMOS Ledger Labs 已與 Aladdin Cyber Security（阿聯杜拜）簽署策略合作協議——該公司為阿聯領先的資安與雲端服務商，擁有自主技術，成立於 2023 年，總部位於杜拜網際網路城。Aladdin 具備處理企業與政府機構重大資安事件的一線經驗，涵蓋智能合約稽核、全端滲透測試與 7×24 多鏈事件應變。',
        })}</p>
        <p className={styles.ecoText}><em>{L({ en: 'Aladdin Cyber Security — strategic partner.', zh: 'Aladdin Cyber Security — 策略合作夥伴。' })}</em></p>
      </div>
    </section>
  )
}

/* 2.11 — Team: founder + contracted engineering network; no equity numbers */
export function Team() {
  const { lang } = useLang()
  const L = L2(lang)
  return (
    <section className={styles.section} id="team">
      <div className="sec-tag">{L({ en: '// SECTION 10 — TEAM', zh: '// 第 10 節 — 團隊' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'TEAM', zh: '團隊' })}</h2>
      <div className={`${styles.steelCard} ${styles.tightCard}`}>
        <p className={styles.ecoText}>{L({
          en: "COSMOS was founded by V. Zheng, a repeat founder based in Toronto. She designed the company's service model, shipped its website and its on-chain devnet demonstration, and leads client engagements directly. Delivery is carried out with contracted engineering teams vetted by COSMOS; audit and other specialist work is referred to qualified independent firms.",
          zh: 'COSMOS 由 V. Zheng 創立，她是常駐多倫多的連續創業者。她設計了公司的服務模式，親自完成網站與鏈上 devnet 演示的交付，並直接主導客戶專案。交付工作由 COSMOS 審核的特約工程團隊執行；稽核與其他專業工作則轉介合格的獨立機構。',
        })}</p>
      </div>
      <div className={`${styles.steelCard} ${styles.teamBlock}`}>
        <div className={styles.teamHead}>{L({ en: "We're Hiring", zh: '我們正在招募' })}</div>
        <p className={styles.ecoText}>{L({
          en: 'A technical co-founder / senior full-stack engineer (React/Next.js + Solana) to lead client delivery.',
          zh: '徵求技術共同創辦人／資深全端工程師（React/Next.js + Solana），主導客戶交付。',
        })}</p>
        <p className={styles.ecoText}>{L({ en: 'Write to ', zh: '來信：' })}<a href={lang === 'zh'
          ? 'mailto:info@cosmosledgerlabs.com?subject=%E6%8A%80%E8%A1%93%E5%85%B1%E5%90%8C%E5%89%B5%E8%BE%A6%E4%BA%BA%E6%B4%BD%E8%A9%A2'
          : 'mailto:info@cosmosledgerlabs.com?subject=Technical%20Co-founder%20Inquiry'} className={styles.inlineLink}>info@cosmosledgerlabs.com</a></p>
      </div>
    </section>
  )
}

/* 2.12 — Contact */
export function Contact() {
  const { lang } = useLang()
  const L = L2(lang)

  /* Contact channels shown as round buttons. To change a link or add a
     channel, edit this list. */
  const CHANNELS = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366',
      href: 'https://wa.me/16476369568',
      path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' },
    { key: 'telegram', label: 'Telegram', color: '#00e8ff', fg: '#001018',
      href: 'https://t.me/cosmosledgerlabs',
      path: 'M21.94 4.3 18.9 19.03c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.95.46l.34-4.78 8.7-7.86c.38-.34-.08-.53-.59-.19L6.72 13.02l-4.64-1.45c-1.01-.32-1.03-1.01.21-1.5l18.14-6.99c.84-.31 1.58.2 1.31 1.22Z' },
    { key: 'email', label: 'Email', color: '#00B8D4',
      href: 'mailto:info@cosmosledgerlabs.com',
      path: 'M3 5h18c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1Zm9 8.1 7.4-5.1H4.6L12 13.1Zm0 2.4L4 10v7h16v-7l-8 5.5Z' },
    { key: 'x', label: 'X', color: '#1d1d1f',
      href: 'https://x.com/CosmosLedgerLab',
      path: 'M18.244 2H21.5l-7.5 8.57L22.5 22h-6.9l-4.8-6.28L4.3 22H1.04l8.02-9.17L1.5 2h7.07l4.34 5.74L18.244 2Zm-1.21 18h1.83L7.05 3.9H5.09L17.034 20Z' },
    { key: 'instagram', label: 'Instagram', color: '#E1306C',
      href: 'https://www.instagram.com/cosmosledgerlabs/',
      path: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077' },
    { key: 'tiktok', label: 'TikTok', color: '#000000',
      href: 'https://www.tiktok.com/@cosmosledgerlabs',
      path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2',
      href: 'https://www.facebook.com/profile.php?id=61594352917370',
      path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z' },
    { key: 'reddit', label: 'Reddit', color: '#FF4500',
      href: 'https://www.reddit.com/user/Pitiful_Medicine_957/',
      path: 'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z' },
    { key: 'truth', label: 'Truth', color: '#5448EE',
      href: 'https://truthsocial.com/@CosmosLedgerlab',
      path: 'M4 3h16v4.2h-5.9V21H9.9V7.2H4z' },
  ]

  return (
    <section className={styles.section} id="contact">
      <div className="sec-tag">{L({ en: '// SECTION 11 — CONTACT', zh: '// 第 11 節 — 聯絡' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'CONTACT', zh: '聯絡' })}</h2>
      <div className={styles.steelCard}>

        <div className="channelRow">
          {CHANNELS.map((c) => (
            <a
              key={c.key}
              className="channelBtn"
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={c.label}
              title={c.label}
            >
              <span className="channelDot">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={c.path}/></svg>
              </span>
              <span className="channelLabel">{c.label}</span>
            </a>
          ))}
        </div>

        <div className={styles.contactEmail} style={{ marginTop: '22px', textAlign: 'center' }}>
          <a href="mailto:info@cosmosledgerlabs.com" style={{ color: 'inherit', textDecoration: 'none' }}>✉ info@cosmosledgerlabs.com</a>
        </div>
        <div className={styles.contactLocation} style={{ textAlign: 'center' }}>{L({ en: '📍 Toronto, Ontario, Canada', zh: '📍 加拿大安大略省多倫多' })}</div>
      </div>

      <style jsx>{`
        .channelRow {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 18px 22px;
          margin: 4px 0 6px;
        }
        .channelBtn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          width: 76px;
        }
        .channelDot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          color: var(--cyan-soft);
          border: 1px solid rgba(0, 160, 210, .25);
          background: rgba(0, 10, 25, .4);
          transition: transform .18s ease, color .2s, border-color .2s, box-shadow .2s;
        }
        .channelDot svg { width: 26px; height: 26px; }
        .channelBtn:hover .channelDot {
          transform: translateY(-3px);
          color: var(--cyan);
          border-color: rgba(0, 215, 255, .6);
          box-shadow: 0 0 14px rgba(0, 180, 220, .35);
        }
        .channelLabel {
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: center;
        }
        .channelBtn:hover .channelLabel { color: var(--cyan); }
        @media (max-width: 480px) {
          .channelRow { gap: 14px 16px; }
          .channelBtn { width: 64px; }
          .channelDot { width: 50px; height: 50px; }
          .channelDot svg { width: 22px; height: 22px; }
          .channelLabel { font-size: 10.5px; }
        }
      `}</style>
    </section>
  )
}
