import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import HashAwareLink from '@/components/landing/HashAwareLink'
import { cn } from '@/utils/cn'

/**
 * One horizontal editorial-style menu link: label on the left, a small
 * diagonal arrow on the right, a thin dashed rule underneath acting as the
 * separator instead of a generic list divider. Used inside MegaMenuPanel's
 * columns (desktop hover flyouts), Navbar's mobile accordion rows, and
 * NavDropdown's Story panel, so every navbar dropdown/mega-menu shares the
 * exact same hover language (ATOOPV blue text, arrow nudge, rule
 * brightening) without duplicating the treatment. Purely presentational —
 * every label/href it renders comes from the existing nav data, unchanged.
 *
 * `active` is opt-in and off by default (mega-menu/mobile-accordion callers
 * never pass it, so their rendering is unchanged) — a persistent sidebar nav
 * (Ressources/Blog) passes it for whichever item matches the current route,
 * giving it the resting blue/marker state this same hover language implies
 * rather than a large filled block.
 *
 * Pass `to` for a real route (plain react-router `Link`, every existing
 * caller) or `href` for a Story-style entry that might be a same-page
 * `#anchor` (routed through HashAwareLink instead, so its Lenis-scroll
 * behavior on the homepage keeps working under this same visual treatment).
 */
export default function EditorialMenuItem({ to, href, onClick, children, className, dense = false, active = false }) {
  const LinkComponent = href !== undefined ? HashAwareLink : Link
  const linkProps = href !== undefined ? { href } : { to }
  return (
    <LinkComponent
      {...linkProps}
      onClick={onClick}
      className={cn(
        'group/item flex items-center justify-between gap-3 border-b border-dashed transition-colors duration-200',
        active ? 'border-royal/40' : 'border-ink/12 hover:border-royal/40',
        dense ? 'py-2.5' : 'py-3',
        className,
      )}
    >
      <span className={cn('flex items-center gap-2 text-sm leading-snug transition-colors duration-200', active ? 'font-medium text-royal' : 'text-ink/80 group-hover/item:text-royal')}>
        {active && <span className="h-1 w-1 shrink-0 rounded-full bg-royal" aria-hidden="true" />}
        {children}
      </span>
      <ArrowUpRight
        className={cn(
          'h-3.5 w-3.5 shrink-0 transition-all duration-200',
          active ? 'text-royal' : 'text-ink/25 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-royal',
        )}
      />
    </LinkComponent>
  )
}
