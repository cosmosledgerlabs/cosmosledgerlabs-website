/* components/ReferralBanner.js (added 2026-11-13)
   Thin bar pinned to the very top of every public page, above the nav:
   "Refer a client — earn 10% commission", linking to /referral.

   How it fits with the fixed nav: pages/_app.js wraps the site in a <div>
   that sets the CSS variable --promo-h to this bar's height, and
   Nav.module.css moves the nav (and the phone menu) down by --promo-h.
   A spacer of the same height pushes the page content down, so nothing
   is hidden under the bar.

   To change the text: edit TEXT below. To switch the bar off everywhere:
   set PROMO_ON to false in pages/_app.js. Languages other than English
   and Chinese show the English text. */

import Link from 'next/link'
import { useLang } from '../lib/i18n'
import styles from './ReferralBanner.module.css'

export const PROMO_HEIGHT = 34 // px — keep in step with ReferralBanner.module.css

const TEXT = {
  main: { en: 'REFER A CLIENT — EARN 10% COMMISSION', zh: '推薦客戶 — 賺取 10% 佣金' },
  link: { en: 'HOW IT WORKS →', zh: '了解詳情 →' },
}

export default function ReferralBanner() {
  const { L } = useLang()
  return (
    <>
      <div className={styles.bar} role="region" aria-label={L({ en: 'Referral program', zh: '推薦計劃' })}>
        <Link href="/referral" className={styles.link}>
          <span className={styles.main}>{L(TEXT.main)}</span>
          <span className={styles.more}>{L(TEXT.link)}</span>
        </Link>
      </div>
      <div className={styles.spacer} aria-hidden="true" />
    </>
  )
}
