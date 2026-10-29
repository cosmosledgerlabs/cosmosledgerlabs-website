import { LANG_LIST } from '../lib/i18n'
import styles from './LangToggle.module.css'

/**
 * Language menu (2026-10-28: was two buttons, EN / 繁體; now a dropdown
 * with every language). Each language is listed in its own script so it
 * reads correctly to its own audience. A native <select> is used on
 * purpose: it works with phones' own pickers and with screen readers.
 */
export default function LangToggle({ lang, setLang, className }) {
  const current = LANG_LIST.find((l) => l.code === lang) || LANG_LIST[0]
  return (
    <label className={`${styles.toggle} ${className || ''}`}>
      <span className={styles.globe} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="13" height="13">
          <g fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9.5" />
            <path d="M2.5 12h19M12 2.5c2.8 2.6 4.2 5.8 4.2 9.5s-1.4 6.9-4.2 9.5c-2.8-2.6-4.2-5.8-4.2-9.5S9.2 5.1 12 2.5z" />
          </g>
        </svg>
      </span>
      <span className={styles.current} aria-hidden="true">{current.short}</span>
      <select
        className={styles.select}
        value={current.code}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Language"
      >
        {LANG_LIST.filter((l) => l.ready !== false).map((l) => (
          <option key={l.code} value={l.code} lang={l.html}>{l.label}</option>
        ))}
      </select>
      <span className={styles.caret} aria-hidden="true">▾</span>
    </label>
  )
}
