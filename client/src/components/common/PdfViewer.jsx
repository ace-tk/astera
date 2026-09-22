import { useEffect, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * In-app PDF viewer. `load` returns the PDF as a Blob (fetched WITH the session token — the file is
 * private, there is no public URL), which is shown by the browser's own PDF viewer inside the page.
 * `load` must be stable (wrap it in useCallback) — a new function reloads the file.
 */
export default function PdfViewer({ load, title, className }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    let url = null
    setState({ status: 'loading' })
    load()
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        setState({ status: 'ready', url })
      })
      .catch((err) => {
        if (cancelled) return
        const message =
          err?.status === 404 ? 'This report is not available.'
          : err?.status === 403 ? 'You do not have access to this report.'
          : 'The report could not be loaded. Please try again.'
        setState({ status: 'error', message })
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [load])

  if (state.status === 'loading') {
    return (
      <div className={cn('grid min-h-[50vh] place-items-center rounded-2xl border border-ink/8 bg-card text-sm text-muted', className)} role="status" aria-busy="true">
        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading report…</span>
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <div className={cn('grid min-h-[30vh] place-items-center rounded-2xl border border-ink/8 bg-card px-6 text-center text-sm text-rose', className)} role="alert">
        {state.message}
      </div>
    )
  }
  return (
    <div className={className}>
      <iframe src={state.url} title={title || 'Report'} className="h-[78vh] w-full rounded-2xl border border-ink/8 bg-card" />
      <p className="mt-2 text-xs text-muted">
        Can’t see the report?{' '}
        <a href={state.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-royal hover:underline">
          Open it in a new tab <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  )
}
