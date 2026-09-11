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
      <p className={styles.secBody}>{L({
        en: "Digital asset teams are strong on protocol design and community — and stretched thin on delivery. Launches stall on the unglamorous work. Generic agencies don't understand on-chain mechanics; protocol engineers don't want to build front-ends. That gap is where launches slip.",
        zh: '數位資產團隊擅長協議設計與社群經營——卻在交付上人力吃緊。專案往往卡在那些不起眼的工作上。一般代理商不懂鏈上機制；協議工程師不想做前端。專案延誤，正是卡在這個缺口。',
      })}</p>
      <div className={styles.cardGrid}>
        {cards.map((c) => (
          <div key={c.t.en} className={styles.card}><div className={styles.cardName}>{L(c.t)}</div><div className={styles.cardText}>{L(c.d)}</div></div>
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
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>{L({
          en: 'Solana · React / Next.js · SPL token standards · established ecosystem tooling including Streamflow, Squads, Magna, and Helius. We build against the tools our clients already use.',
          zh: 'Solana · React / Next.js · SPL 代幣標準 · 成熟的生態系工具，包括 Streamflow、Squads、Magna 與 Helius。我們以客戶已在使用的工具為基礎進行建置。',
        })}</p>
      </div>
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
      <div className={styles.steelCard}>
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
      <div className={styles.steelCard}>
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
  return (
    <section className={styles.section} id="contact">
      <div className="sec-tag">{L({ en: '// SECTION 11 — CONTACT', zh: '// 第 11 節 — 聯絡' })} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L({ en: 'CONTACT', zh: '聯絡' })}</h2>
      <div className={styles.steelCard}>
        <div className={styles.contactEmail}><a href="mailto:info@cosmosledgerlabs.com" style={{ color: 'inherit', textDecoration: 'none' }}>✉ info@cosmosledgerlabs.com</a></div>
        <div className={styles.contactLocation}>{L({ en: '📍 Toronto, Ontario, Canada', zh: '📍 加拿大安大略省多倫多' })}</div>
      </div>
    </section>
  )
}
