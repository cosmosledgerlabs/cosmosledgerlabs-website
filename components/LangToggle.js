import { useState, useRef, useEffect, useCallback } from 'react'
import { LANG_LIST } from '../lib/i18n'
import styles from './LangToggle.module.css'

/**
 * Language menu.
 *
 * 2026-10-28: was two buttons, EN / 繁體.
 * 2026-10-30: dropdown in the site's own colours (dark background,
 *             fluorescent-blue text).
 * 2026-10-30 (b): touch-friendly for every device —
 *   • Phones and small tablets (the ☰ menu, ≤ 767 px wide): the languages are a
 *     grid of large buttons shown directly in the menu. One tap switches;
 *     there is no pop-up list that a phone browser could block.
 *   • Laptops and desktops: a dropdown. Every language is a real <button>,
 *     focus only moves when the keyboard is used, and closing on an outside
 *     click uses pointer events, which every current browser supports.
 *
 * Each language is written in its own script so its own readers find it.
 * Keyboard (desktop): ↑ ↓ Home End to move, Enter / Space to choose, Esc
 * to close.
 */
export default function LangToggle({ lang, setLang, className, onChosen }) {
  const langs = LANG_LIST.filter((l) => l.ready !== false)
  const current = langs.find((l) => l.code === lang) || langs[0]
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const btnRef = useRef(null)
  const itemRefs = useRef([])

  const close = useCallback((focusButton) => {
    setOpen(false)
    if (focusButton && btnRef.current) btnRef.current.focus()
  }, [])

  const choose = (code) => {
    setOpen(false)
    if (code !== current.code) setLang(code)
    if (onChosen) onChosen(code)
  }

  // Close when pressing anywhere outside the dropdown.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Keyboard only: open with ↑ / ↓ and put focus on the current language.
  const focusItem = (i) => {
    const n = langs.length
    const el = itemRefs.current[((i % n) + n) % n]
    if (el) el.focus()
  }
  const onButtonKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      const i = Math.max(0, langs.findIndex((l) => l.code === current.code))
      setTimeout(() => focusItem(i), 0)
    }
  }
  const onListKey = (e) => {
    const i = itemRefs.current.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(i + 1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(i - 1) }
    else if (e.key === 'Home') { e.preventDefault(); focusItem(0) }
    else if (e.key === 'End') { e.preventDefault(); focusItem(langs.length - 1) }
    else if (e.key === 'Escape') { e.preventDefault(); close(true) }
    else if (e.key === 'Tab') { setOpen(false) }
  }

  return (
    <div ref={rootRef} className={`${styles.wrap} ${className || ''}`}>

      {/* ---------- Laptops and desktops: dropdown ---------- */}
      <div className={styles.desktop}>
        <button
          ref={btnRef}
          type="button"
          className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onButtonKey}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={'Language: ' + current.label}
        >
          <Globe />
          <span className={styles.current}>{current.short}</span>
          <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`} aria-hidden="true">▾</span>
        </button>

        {open && (
          <div className={styles.menu} role="menu" aria-label="Language" onKeyDown={onListKey}>
            {langs.map((l, i) => {
              const selected = l.code === current.code
              return (
                <button
                  key={l.code}
                  ref={(el) => { itemRefs.current[i] = el }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  lang={l.html}
                  className={`${styles.item} ${selected ? styles.itemSelected : ''}`}
                  onClick={() => choose(l.code)}
                >
                  <span className={styles.check} aria-hidden="true">{selected ? '✓' : ''}</span>
                  <span className={styles.label} dir={l.rtl ? 'rtl' : 'ltr'}>{l.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ---------- Phones and tablets: buttons right in the ☰ menu ---------- */}
      <div className={styles.mobile} role="group" aria-label="Language">
        <div className={styles.mobileHead}>
          <Globe />
          <span>LANGUAGE</span>
        </div>
        <div className={styles.grid}>
          {langs.map((l) => {
            const selected = l.code === current.code
            return (
              <button
                key={l.code}
                type="button"
                lang={l.html}
                aria-pressed={selected}
                className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
                onClick={() => choose(l.code)}
              >
                <span className={styles.label} dir={l.rtl ? 'rtl' : 'ltr'}>{l.label}</span>
                {selected ? <span className={styles.chipCheck} aria-hidden="true">✓</span> : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Globe() {
  return (
    <span className={styles.globe} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="13" height="13">
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19M12 2.5c2.8 2.6 4.2 5.8 4.2 9.5s-1.4 6.9-4.2 9.5c-2.8-2.6-4.2-5.8-4.2-9.5S9.2 5.1 12 2.5z" />
        </g>
      </svg>
    </span>
  )
}
