import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Previous/next footer nav between sibling pages in a service category's
 * own nav list — so browsing Drafting, Communication, Training or Guides
 * never dead-ends at a page with no way to keep going.
 */
export default function ServicePagination({ items }) {
  const { pathname } = useLocation()
  const index = items.findIndex((item) => item.to === pathname)
  if (index === -1) return null

  const prev = items[index - 1]
  const next = items[index + 1]
  if (!prev && !next) return null

  return (
    <nav aria-label="Category pages" className="grid gap-3 border-t border-ink/8 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          to={prev.to}
          className="group flex items-center gap-3 rounded-2xl border border-ink/8 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/8 text-muted transition-colors group-hover:border-ink/20 group-hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-muted">Previous</span>
            <span className="block truncate font-medium text-ink">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          to={next.to}
          className={cn(
            'group flex items-center justify-end gap-3 rounded-2xl border border-ink/8 bg-card p-5 text-right shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift',
          )}
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted">Next</span>
            <span className="block truncate font-medium text-ink">{next.label}</span>
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/8 text-muted transition-colors group-hover:border-ink/20 group-hover:text-ink">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}
    </nav>
  )
}
