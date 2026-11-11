/**
 * lib/zhs.js — Simplified Chinese (简体中文), added 2026-11-10.
 *
 * The site's Chinese is written once, in Traditional characters. When a
 * visitor picks 简体中文, the page is rendered as Traditional Chinese and
 * this module converts the visible text to Simplified on the spot:
 *   1. whole sentences from lib/zhsMap.js PHRASES (mainland wording);
 *   2. anything else character by character (CHARS → SIMP).
 * New text React puts on the page later is converted as it appears.
 *
 * The conversion map is downloaded only when 简体中文 is chosen. If it
 * fails to load, the page simply stays in Traditional Chinese.
 */

const CJK = /[㐀-鿿豈-﫿]/
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt']
const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 }

let map = null
let phrases = null
let observer = null
let active = false
let loading = null

function load() {
  if (map) return Promise.resolve(true)
  if (!loading) {
    loading = import('./zhsMap.js')
      .then((m) => {
        const from = Array.from(m.CHARS)
        const to = Array.from(m.SIMP)
        const out = {}
        from.forEach((c, i) => { out[c] = to[i] })
        map = out
        phrases = m.PHRASES || {}
        return true
      })
      .catch(() => false)
  }
  return loading
}

export function toSimplified(s) {
  if (!map || typeof s !== 'string' || !CJK.test(s)) return s
  const core = s.trim()
  if (phrases[core] !== undefined) {
    const i = s.indexOf(core)
    return s.slice(0, i) + phrases[core] + s.slice(i + core.length)
  }
  let out = ''
  for (const ch of s) out += map[ch] || ch
  return out
}

/* Text that must stay as written: the language menu's own labels
   (繁體中文 must not turn into 繁体中文) and anything marked data-no-zhs. */
function keep(el) {
  try {
    return !!(el && el.closest && el.closest('[lang="zh-Hant"],[data-no-zhs]'))
  } catch (e) { return false }
}

function convertNode(node) {
  if (node.nodeType === 3) {
    const p = node.parentNode
    if (p && SKIP[p.nodeName]) return
    if (keep(p)) return
    const v = node.nodeValue
    const n = toSimplified(v)
    if (n !== v) node.nodeValue = n
  } else if (node.nodeType === 1) {
    if (SKIP[node.nodeName] || keep(node)) return
    ATTRS.forEach((a) => {
      const v = node.getAttribute && node.getAttribute(a)
      if (v) {
        const n = toSimplified(v)
        if (n !== v) node.setAttribute(a, n)
      }
    })
    const walker = document.createTreeWalker(node, 5 /* elements + text */)
    let cur = walker.nextNode()
    while (cur) {
      if (cur.nodeType === 3) convertNode(cur)
      else if (!SKIP[cur.nodeName] && !keep(cur)) {
        ATTRS.forEach((a) => {
          const v = cur.getAttribute(a)
          if (v) {
            const n = toSimplified(v)
            if (n !== v) cur.setAttribute(a, n)
          }
        })
      }
      cur = walker.nextNode()
    }
  }
}

function convertAttr(el, a) {
  try {
    if (keep(el)) return
    const v = el.getAttribute(a)
    if (v) {
      const n = toSimplified(v)
      if (n !== v) el.setAttribute(a, n)
    }
  } catch (e) {}
}

/* Turn the conversion on. Safe to call more than once. */
export function startSimplified() {
  active = true
  return load().then((ok) => {
    if (!ok || !active || typeof document === 'undefined') return
    try {
      convertNode(document.documentElement)
      if (!observer) {
        observer = new MutationObserver((list) => {
          list.forEach((m) => {
            if (m.type === 'characterData') convertNode(m.target)
            else if (m.type === 'attributes') convertAttr(m.target, m.attributeName)
            else m.addedNodes.forEach((n) => convertNode(n))
          })
        })
        observer.observe(document.documentElement, {
          subtree: true, childList: true, characterData: true,
          attributes: true, attributeFilter: ATTRS,
        })
      }
    } catch (e) {
      // Page stays in Traditional Chinese.
    }
  })
}

/* Turn the conversion off (another language was chosen). */
export function stopSimplified() {
  active = false
  if (observer) { try { observer.disconnect() } catch (e) {} observer = null }
}
