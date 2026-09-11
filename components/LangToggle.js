import { LANGS } from '../lib/i18n'
import styles from './LangToggle.module.css'

/**
 * Language switcher. Two buttons, current one highlighted.
 *
 * Labelled in each language's own script so it reads correctly to either
 * audience without needing to know the other.
 */
export default function LangToggle({ lang, setLang, className }) {
  return (
    <div className={`${styles.toggle} ${className || ''}`} role="group" aria-label={lang === LANGS.ZH ? '語言' : 'Language'}>
      <button
        type="button"
        className={lang === LANGS.EN ? styles.active : styles.btn}
        onClick={() => setLang(LANGS.EN)}
        aria-pressed={lang === LANGS.EN}
      >
        EN
      </button>
      <span className={styles.divider} aria-hidden="true">/</span>
      <button
        type="button"
        className={lang === LANGS.ZH ? styles.active : styles.btn}
        onClick={() => setLang(LANGS.ZH)}
        aria-pressed={lang === LANGS.ZH}
      >
        繁體
      </button>
    </div>
  )
}
