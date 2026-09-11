import { Component } from 'react'

// Error boundary — backstop against a full white-screen crash.
//
// This renders when everything else has failed, so it cannot rely on the
// i18n hook. It reads the language directly (?lang= first, then the stored
// toggle choice) inside try/catch — if even that fails, English renders.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (typeof console !== 'undefined') console.error('[app] render error:', error)
  }

  render() {
    if (this.state.hasError) {
      let zh = false
      try {
        if (typeof window !== 'undefined') {
          const p = new URLSearchParams(window.location.search).get('lang')
          if (p === 'zh' || p === 'zh-TW' || p === 'zh-Hant') {
            zh = true
          } else if (p !== 'en') {
            try {
              if (window.localStorage.getItem('cll_lang') === 'zh') zh = true
            } catch (e) {}
          }
        }
      } catch (e) {}

      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '14px',
          background: '#00010a', color: '#ffffff', textAlign: 'center', padding: '24px',
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          <h1 style={{ color: '#00e8ff', letterSpacing: '.08em' }}>COSMOS LEDGER LABS</h1>
          <p style={{ opacity: .85 }}>
            {zh ? '頁面載入時發生錯誤。' : 'Something went wrong loading this page.'}
          </p>
          <a href="/" style={{ color: '#00e8ff', textDecoration: 'underline' }}>
            {zh ? '重新載入' : 'Reload'}
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
