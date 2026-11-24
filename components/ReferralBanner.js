/* components/ReferralBanner.js (added 2026-11-13)
   The bar pinned to the very top of every public page, above the nav.

   2026-11-24: it can show either
     • a NOTICE — "Please follow social media for updates. The website is
       temporarily unavailable." (NOTICE_ON = true). Tapping it goes to the
       social media buttons in the Contact section of the home page; or
     • the REFERRAL bar — "Refer a client — earn 10% commission" (NOTICE_ON
       = false), linking to /referral.
   To go back to the referral bar: set NOTICE_ON to false below.
   To switch the bar off everywhere: set PROMO_ON to false in pages/_app.js.

   How it fits with the fixed nav: pages/_app.js wraps the site in a <div>
   with the class from promoWrapClass, which sets the CSS variable
   --promo-h to this bar's height (the notice is two lines on phones, so it
   is taller there). Nav.module.css moves the nav (and the phone menu) down
   by --promo-h, and a spacer of the same height pushes the page content
   down, so nothing is hidden under the bar.

   Other languages: the texts are translated in lib/locales/<code>.js (the
   referral % has {#} where the number goes). */

import Link from 'next/link'
import { useLang } from '../lib/i18n'
import { REFERRAL_RATE } from '../lib/referral'
import styles from './ReferralBanner.module.css'

export const NOTICE_ON = true

/* Class for the wrapper in pages/_app.js — sets --promo-h for this bar. */
export const promoWrapClass = NOTICE_ON ? styles.wrapNotice : styles.wrapPromo

const PCT = Math.round(REFERRAL_RATE * 100) // from lib/referral.js
const TEXT = {
  main: { en: 'REFER A CLIENT — EARN ' + PCT + '% COMMISSION', zh: '推薦客戶 — 賺取 ' + PCT + '% 佣金' },
  link: { en: 'HOW IT WORKS →', zh: '了解詳情 →' },
  notice: {
    en: 'Please follow social media for updates. The website is temporarily unavailable.',
    zh: '請關注我們的社交媒體以獲取最新消息。網站暫時無法使用。',
  },
}

export default function ReferralBanner() {
  const { L } = useLang()
  if (NOTICE_ON) {
    return (
      <>
        <div className={`${styles.bar} ${styles.noticeBar}`} role="status" data-promo-bar="">
          <Link href="/#contact" className={styles.noticeLink}>{L(TEXT.notice)}</Link>
        </div>
        <div className={styles.spacer} aria-hidden="true" />
      </>
    )
  }
  return (
    <>
      <div className={styles.bar} role="region" aria-label={L({ en: 'Referral program', zh: '推薦計劃' })} data-promo-bar="">
        <Link href="/referral" className={styles.link}>
          <span className={styles.main}>{L(TEXT.main)}</span>
          <span className={styles.more}>{L(TEXT.link)}</span>
        </Link>
      </div>
      <div className={styles.spacer} aria-hidden="true" />
    </>
  )
}
