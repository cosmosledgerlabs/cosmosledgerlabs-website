import { useState, useRef, useEffect, useCallback } from 'react'
import { LANG_LIST } from '../lib/i18n'
import styles from './LangToggle.module.css'

/**
 * Language menu (2026-10-28: was two buttons, EN / 繁體).
 * 2026-10-30: custom dropdown instead of the browser's own list, so the
 * open list matches the site — dark background, fluorescent-blue text.
 *
 * Each language is listed in its own script so it reads correctly to its
 * own audience. Works with mouse, touch and keyboard (↑ ↓ Home End to move,
 * Enter / Space to choose, Esc to close); closes when tapping elsewhere.
 */
export default function LangToggle({ lang, setLang, className }) {
  const langs = LANG_LIST.filter((l) => l.ready !== false)
  const current = langs.find((l) => l.code === lang) || langs[0]
  const [open, setOpen] = useState(false)
  const [focusIdx, setFocusIdx] = useState(0)
  const rootRef = useRef(null)
  const btnRef = useRef(null)
  const itemRefs = useRef([])

  const close = useCallback((focusButton) => {
    setOpen(false)
    if (focusButton && btnRef.current) btnRef.current.focus()
  }, [])

  const openMenu = () => {
    const i = Math.max(0, langs.findIndex((l) => l.code === current.code))
    setFocusIdx(i)
    setOpen(true)
  }

  const choose = (code) => {
    close(true)
    if (code !== current.code) setLang(code)
  }

  // Close when clicking or tapping anywhere outside the menu.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open, close])

  // Keep keyboard focus on the highlighted language.
  useEffect(() => {
    if (open && itemRefs.current[focusIdx]) itemRefs.current[focusIdx].focus()
  }, [open, focusIdx])

  const onButtonKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu()
    }
  }

  const onListKey = (e) => {
    const last = langs.length - 1
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx((i) => (i >= last ? 0 : i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx((i) => (i <= 0 ? last : i - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setFocusIdx(0) }
    else if (e.key === 'End') { e.preventDefault(); setFocusIdx(last) }
    else if (e.key === 'Escape') { e.preventDefault(); close(true) }
    else if (e.key === 'Tab') { close(false) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(langs[focusIdx].code) }
  }

  return (
    <div ref={rootRef} className={`${styles.wrap} ${className || ''}`}>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onButtonKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={'Language: ' + current.label}
      >
        <span className={styles.globe} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13">
            <g fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M2.5 12h19M12 2.5c2.8 2.6 4.2 5.8 4.2 9.5s-1.4 6.9-4.2 9.5c-2.8-2.6-4.2-5.8-4.2-9.5S9.2 5.1 12 2.5z" />
            </g>
          </svg>
        </span>
        <span className={styles.current}>{current.short}</span>
        <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`} aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox" aria-label="Language" onKeyDown={onListKey}>
          {langs.map((l, i) => {
            const selected = l.code === current.code
            return (
              <li
                key={l.code}
                ref={(el) => { itemRefs.current[i] = el }}
                role="option"
                aria-selected={selected}
                tabIndex={i === focusIdx ? 0 : -1}
                lang={l.html}
                className={`${styles.item} ${selected ? styles.itemSelected : ''} ${i === focusIdx ? styles.itemFocus : ''}`}
                onClick={() => choose(l.code)}
                onMouseEnter={() => setFocusIdx(i)}
              >
                <span className={styles.check} aria-hidden="true">{selected ? '✓' : ''}</span>
                <span className={styles.label} dir={l.rtl ? 'rtl' : 'ltr'}>{l.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
