import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

/**
 * Wraps an article template while its content source resolves (see useCmsArticle):
 * loading placeholder, redirects, "not found", and the admin-preview banner + noindex.
 * Renders `children(page)` — the template's own, unchanged design — once ready.
 */
export default function CmsArticleGate({ source, missingTo, children }) {
  const previewing = Boolean(source.preview)

  // A preview is a draft: keep it out of search engines.
  useEffect(() => {
    if (!previewing) return undefined
    const tag = document.createElement('meta')
    tag.setAttribute('name', 'robots')
    tag.setAttribute('content', 'noindex, nofollow')
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [previewing])

  if (source.status === 'loading') return <div className="min-h-[60vh]" aria-busy="true" />
  if (source.status === 'redirect') return <Navigate to={source.redirectTo} replace />
  if (source.status !== 'ready') return <Navigate to={missingTo} replace />

  return (
    <>
      {previewing && (
        <div className="fixed inset-x-0 top-0 z-[100] bg-ink px-4 py-1.5 text-center text-xs font-medium text-paper" role="status">
          Preview — this is an unpublished draft. Visitors cannot see it.
        </div>
      )}
      {children(source.page)}
    </>
  )
}
