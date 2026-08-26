import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from '../styles/Services.module.css'

const SERVICES = [
  {
    n: '01',
    name: 'DASHBOARDS & DATA INTERFACES',
    lead: 'Custom dashboards that bring scattered on-chain and off-chain data into one view.',
    items: [
      'Holder counts and address distribution',
      'Vesting and unlock progress',
      'Treasury balances and transaction flow',
      'Activity logs and audit trails',
      'Role-based permissions and approvals',
      'Exportable reports',
    ],
    price: 'FROM US$8,000',
    time: '4–6 WEEKS',
  },
  {
    n: '02',
    name: 'CORPORATE WEBSITES & LANDING PAGES',
    lead: 'Marketing sites, documentation and landing pages, built to be handed over to your team.',
    items: [
      'Design and front-end build',
      'Content structure and layout',
      'Documentation and whitepaper pages',
      'Deployment and full source code handover',
    ],
    price: 'FROM US$3,000',
    time: '2–3 WEEKS',
  },
  {
    n: '03',
    name: 'TOKEN DEPLOYMENT & CONFIGURATION',
    lead: 'Technical execution using established, audited tooling. We configure — we do not sell, distribute or market your token.',
    items: [
      'Token deployment (SPL / ERC-20)',
      'Metadata and on-chain identity',
      'Vesting and lock configuration',
      'Written parameter documentation',
      'Testnet rehearsal, then mainnet execution',
    ],
    price: 'FROM US$2,500',
    time: '1–2 WEEKS',
  },
  {
    n: '04',
    name: 'CLAIM PORTALS & DISTRIBUTION INTERFACES',
    lead: 'Branded interfaces where recipients connect a wallet and claim their allocation.',
    items: [
      'White-label UI under your own domain',
      'Wallet connection and claim flow',
      'Recipient list handling',
      'Testnet rehearsal before launch',
    ],
    price: 'FROM US$3,000',
    time: '2–3 WEEKS',
  },
  {
    n: '05',
    name: 'BLOCKCHAIN DATA INTEGRATION & APIs',
    lead: 'Connect on-chain data to the systems your business already runs on.',
    items: [
      'Indexing and data pipelines',
      'APIs and webhooks',
      'Reporting and internal tooling',
      'Monitoring setup',
    ],
    price: 'FROM US$8,000',
    time: '4–8 WEEKS',
  },
  {
    n: '06',
    name: 'SMART CONTRACT FRONT-ENDS',
    lead: 'Human-usable interfaces for contracts you already have.',
    items: [
      'Interface design and build',
      'Contract interaction layer',
      'Transaction handling and error states',
    ],
    price: 'FROM US$6,000',
    time: '3–5 WEEKS',
  },
]

const PROCESS = [
  { n: '01', t: 'SCOPE CALL', d: 'Thirty minutes. We define exactly what is delivered and what is not.' },
  { n: '02', t: 'FIXED QUOTE', d: 'Written scope, fixed price, fixed timeline. No hourly billing, no scope creep.' },
  { n: '03', t: 'BUILD', d: 'Weekly written updates. You see progress, not promises.' },
  { n: '04', t: 'HANDOVER', d: 'Source code in a repository you own. All credentials transferred. No vendor lock-in.' },
]

const EXCLUSIONS = [
  'Sell, distribute or market digital assets on behalf of clients',
  'Receive or hold client or investor funds',
  'Raise capital for clients or introduce investors',
  'Provide market making or liquidity services',
  'Arrange, promise or facilitate exchange listings',
  'Provide investment, legal, tax or accounting advice',
]

export default function Services() {
  return (
    <>
      <Head>
        <title>Digital Asset Technology Services — COSMOS Ledger Labs</title>
        <meta name="description" content="Software development for digital asset projects: dashboards, websites, deployment execution and data integration. Fixed timelines, fixed prices, full IP handover. Toronto, Canada." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/services" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <meta property="og:title" content="Digital Asset Technology Services — COSMOS Ledger Labs" />
        <meta property="og:description" content="Dashboards, websites, deployment execution and data integration for digital asset projects. Fixed timelines, fixed prices, full IP handover." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/services" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content="en_CA" />
        <meta property="og:image" content="https://cosmosledgerlabs.com/og-image.png" />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.wrap}>

          <header className={styles.hero}>
            <div className={styles.badge}>
              <span className={styles.dot}></span>
              // CLIENT SERVICES
            </div>
            <h1 className={styles.title}>
              <span className={styles.tw}>DIGITAL ASSET</span>
              <span className={styles.tw}><span className={styles.tc}>TECHNOLOGY</span> SERVICES</span>
            </h1>
            <div className={styles.subline}>
              DASHBOARDS &nbsp;|&nbsp; INTERFACES &nbsp;|&nbsp; DEPLOYMENT &nbsp;|&nbsp; INTEGRATION
            </div>
            <div className={styles.gl}></div>
            <p className={styles.lede}>
              We build the software layer for digital asset projects — dashboards,
              websites, deployment execution and data integration. Delivered on fixed
              timelines, at fixed prices, by a Canadian company.
            </p>
            <div className={styles.btns}>
              <a href="mailto:info@cosmosledgerlabs.com?subject=Service%20Enquiry" className={styles.bp}>REQUEST A QUOTE →</a>
              <a href="#services" className={styles.bs}>SEE WHAT WE BUILD</a>
            </div>
          </header>

          <hr className="divider" />

          <section className={styles.section} id="services">
            <div className="sec-tag">// SECTION 01 — SERVICES <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>WHAT WE BUILD</h2>

            <div className={styles.grid}>
              {SERVICES.map((s) => (
                <div key={s.n} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardNum}>{s.n}</span>
                    <span className={styles.cardName}>{s.name}</span>
                  </div>
                  <p className={styles.cardLead}>{s.lead}</p>
                  <div className={styles.cardList}>
                    {s.items.map((it) => (
                      <div key={it} className={styles.cardItem}>// {it}</div>
                    ))}
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.price}>{s.price}</span>
                    <span className={styles.time}>{s.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.note}>
              Multi-chain: we work across Solana and EVM-compatible networks.
              Chain selection is confirmed at the scope call.
            </p>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="process">
            <div className="sec-tag">// SECTION 02 — PROCESS <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>HOW WE WORK</h2>
            <div className={styles.processGrid}>
              {PROCESS.map((p) => (
                <div key={p.n} className={styles.processCard}>
                  <div className={styles.processNum}>{p.n}</div>
                  <div className={styles.processTitle}>{p.t}</div>
                  <div className={styles.processText}>{p.d}</div>
                </div>
              ))}
            </div>
            <div className={styles.steelCard}>
              <p className={styles.plainText}>
                COSMOS works with external development partners under company-controlled
                intellectual property and repository agreements. Product definition,
                architecture and delivery management stay in-house.
              </p>
            </div>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="scope">
            <div className="sec-tag">// SECTION 03 — SCOPE <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>WHAT WE DON&apos;T DO</h2>
            <p className={styles.secBody}>
              We are a software company. To keep that boundary clear, we do not:
            </p>
            <div className={styles.exclusionGrid}>
              {EXCLUSIONS.map((e) => (
                <div key={e} className={styles.exclusion}>
                  <span className={styles.ex}>×</span>
                  <span>{e}</span>
                </div>
              ))}
            </div>
            <div className={styles.steelCard}>
              <p className={styles.plainStrong}>
                Our fees are fixed per project. We never charge success fees or take a
                percentage of funds raised.
              </p>
            </div>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="security">
            <div className="sec-tag">// SECTION 04 — SECURITY <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>SECURITY</h2>
            <div className={styles.steelCard}>
              <p className={styles.plainText}>
                Security assessment and audit services are delivered through qualified
                external cybersecurity partners. We coordinate; we do not perform audits
                in-house. Where a project requires an independent audit, it is scoped and
                quoted separately.
              </p>
            </div>
          </section>

          <hr className="divider" />

          <section className={styles.section} id="enquiry">
            <div className="sec-tag">// SECTION 05 — CONTACT <div className="sec-tag-line" /></div>
            <h2 className={styles.secTitle}>TELL US WHAT YOU&apos;RE BUILDING</h2>
            <div className={styles.steelCard}>
              <p className={styles.plainText}>
                We&apos;ll tell you what it costs and how long it takes — usually within
                two business days.
              </p>
              <div className={styles.contactEmail}>
                <a href="mailto:info@cosmosledgerlabs.com?subject=Service%20Enquiry" style={{ color: 'inherit', textDecoration: 'none' }}>
                  ✉ info@cosmosledgerlabs.com
                </a>
              </div>
              <div className={styles.contactLocation}>📍 Toronto, Ontario, Canada · Working with clients worldwide</div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
