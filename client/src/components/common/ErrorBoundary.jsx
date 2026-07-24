import { Component } from 'react'

/**
 * Catches render-time errors and shows a calm, on-brand recovery screen instead
 * of a white page. Offers a reload and a way back home. Logs to the console for
 * debugging (would be a Sentry hook in production).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Astera caught an error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="bg-canvas grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-rose/10 text-rose">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">A thread came loose.</h1>
          <p className="mt-3 text-muted">
            Something unexpected happened while rendering this view. Your work is safe — let’s try again.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-lift transition-transform hover:-translate-y-0.5"
            >
              Reload ATOOPV
            </button>
            <a
              href="/app"
              className="rounded-full border border-ink/12 px-6 py-3 text-sm font-medium transition-colors hover:bg-ink/[0.03]"
            >
              Back to workspace
            </a>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-6 overflow-auto rounded-xl bg-card p-4 text-left text-xs text-muted">
              {String(this.state.error?.message || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
