import { Component } from 'react'

// Error boundary — backstop against a full white-screen crash.
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
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '14px',
          background: '#00010a', color: '#ffffff', textAlign: 'center', padding: '24px',
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          <h1 style={{ color: '#00e8ff', letterSpacing: '.08em' }}>COSMOS LEDGER LABS</h1>
          <p style={{ opacity: .85 }}>Something went wrong loading this page.</p>
          <a href="/" style={{ color: '#00e8ff', textDecoration: 'underline' }}>Reload</a>
        </div>
      )
    }
    return this.props.children
  }
}
