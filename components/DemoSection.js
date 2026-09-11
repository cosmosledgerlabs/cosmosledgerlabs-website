import Link from 'next/link'
import { useLang } from '../lib/i18n'
import styles from './Sections.module.css'

/* 2.4 — Engineering Showcase
   pointing to the real /flow devnet demo. */

const T = {
  tag: { en: '// SECTION 04 — ENGINEERING SHOWCASE', zh: '// 第 04 節 — 工程實例' },
  title: { en: 'SEE HOW WE ENGINEER', zh: '見證我們的工程方式' },
  body: {
    en: 'Our public demo runs a three-step token workflow on Solana devnet — approval, vesting setup, distribution — with automatic on-chain compensation when a step fails. Every transaction is verifiable on-chain. It is a working sample of the engineering standard we bring to client delivery.',
    zh: '我們的公開演示在 Solana devnet 測試網上執行三步代幣工作流——審批、歸屬設定、分發——步驟失敗時自動執行鏈上補償。每筆交易皆可在鏈上驗證。這是我們為客戶交付時所秉持工程標準的實際範例。',
  },
  btn: { en: 'OPEN THE DEMO →', zh: '開啟演示 →' },
  legal: {
    en: 'Solana devnet, test tokens only. Not a product and not connected to mainnet funds.',
    zh: 'Solana devnet 測試網，僅限測試代幣。非產品，亦不涉及主網資金。',
  },
}

export default function Demo() {
  const { lang } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  return (
    <section className={styles.section} id="demo">
      <div className="sec-tag">{L(T.tag)} <div className="sec-tag-line"/></div>
      <h2 className={styles.secTitle}>{L(T.title)}</h2>
      <div className={styles.steelCard}>
        <p className={styles.ecoText}>{L(T.body)}</p>
        <div className={styles.dlButtons}>
          <Link href="/flow" className={styles.dlBtn1}>{L(T.btn)}</Link>
        </div>
        <p className={styles.legalNote}>{L(T.legal)}</p>
      </div>
    </section>
  )
}
