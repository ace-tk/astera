import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * One horizontal editorial-style menu link: label on the left, a small
 * diagonal arrow on the right, a thin dashed rule underneath acting as the
 * separator instead of a generic list divider. Used inside MegaMenuPanel's
 * columns (desktop hover flyouts) and Navbar's mobile accordion rows, so
 * both surfaces share the exact same hover language (ATOOPV blue text,
 * arrow nudge, rule brightening) without duplicating the treatment.
 * Purely presentational — every label/href it renders comes from the
 * existing ATOOPV_NAV data, unchanged.
 */
export default function EditorialMenuItem({ to, onClick, children, className, dense = false }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'group/item flex items-center justify-between gap-3 border-b border-dashed border-ink/12',
        'transition-colors duration-200 hover:border-royal/40',
        dense ? 'py-2.5' : 'py-3',
        className,
      )}
    >
      <span className="text-sm leading-snug text-ink/80 transition-colors duration-200 group-hover/item:text-royal">{children}</span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink/25 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-royal" />
    </Link>
  )
}
