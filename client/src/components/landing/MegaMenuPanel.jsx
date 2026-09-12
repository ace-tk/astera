import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import MegaMenuVisual from '@/components/landing/MegaMenuVisual'
import EditorialMenuItem from '@/components/landing/EditorialMenuItem'
import MegaMenuCategory from '@/components/landing/MegaMenuCategory'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

/**
 * The shared panel for the ATOOPV mega-nav (Procès-verbal, Formations,
 * Ressources, Blog) — same visual family as NavDropdown's flyout (bg-card,
 * border-ink/10, shadow-float, rounded corners) just wide enough for several
 * columns side by side. One instance is reused for whichever top-level item
 * is currently open (see MegaMenuPanel's caller in Navbar.jsx), so switching
 * between items swaps this panel's content instead of closing/reopening a
 * new one — that's what keeps the hover/focus transition between top-level
 * entries flicker-free.
 */
export default function MegaMenuPanel({ item, onNavigate, ...handlers }) {
  const { columns, cta, cities } = item.mega
  const a = accent(item.color)
  const trailingCount = cta || cities ? 1 : 0
  const { pathname } = useLocation()

  return (
    <div
      id={`mega-panel-${item.key}`}
      role="region"
      aria-label={item.label}
      className="relative w-[min(58rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-ink/10 bg-card shadow-float"
      {...handlers}
    >
      {/* Extremely low-contrast technical grid behind the columns — same
          bg-grid-faint utility AmbientBackground uses, just tighter and
          fainter here so it reads as an editorial layout guide rather than
          decoration competing with the links. */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40 [background-size:28px_28px]" aria-hidden="true" />

      <div
        className="relative grid divide-x divide-ink/8"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))${trailingCount ? ' 17rem' : ''}` }}
      >
        {columns.map((col) => (
          <div key={col.heading} className="p-6">
            <MegaMenuCategory>{col.heading}</MegaMenuCategory>
            <div className="mt-3">
              {col.items.map((link) => (
                <EditorialMenuItem key={link.label} to={link.href} onClick={onNavigate} active={pathname === link.href} dense>
                  {link.label}
                </EditorialMenuItem>
              ))}
            </div>
          </div>
        ))}

        {cta && (
          <div className={cn('flex h-full flex-col p-6', cta.tone === 'dark' ? 'bg-ink text-paper' : a.softBg)}>
            <div>
              <span className={cn('text-xs font-semibold uppercase tracking-[0.16em]', cta.tone === 'dark' ? 'text-paper/60' : a.text)}>
                {cta.eyebrow}
              </span>
              <p className={cn('mt-3 text-base font-medium leading-snug', cta.tone === 'dark' ? 'text-paper' : 'text-ink')}>{cta.title}</p>
            </div>
            {/* Fills what used to be dead space between the text and the
                button — the column is stretched to match its taller link-list
                siblings (CSS Grid's default row stretch), so this flex-1
                middle child naturally absorbs exactly that leftover height. */}
            <div className="my-4 flex-1">
              <MegaMenuVisual variant={item.key} color={item.color} />
            </div>
            <Button as={Link} to={cta.buttonHref} onClick={onNavigate} size="sm" variant={cta.tone === 'dark' ? 'soft' : 'primary'} className="w-full">
              {cta.buttonLabel}
            </Button>
          </div>
        )}

        {cities && (
          <div className={cn('flex h-full flex-col p-6', a.softBg)}>
            <MegaMenuCategory>{cities.heading}</MegaMenuCategory>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">{cities.label}</p>
            <Link to={cities.href} onClick={onNavigate} className={cn('group/cities mt-4 inline-flex items-center gap-1.5 text-sm font-medium', a.text)}>
              {cities.linkLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cities:translate-x-0.5" />
            </Link>
            <div className="mt-4 flex-1">
              <MegaMenuVisual variant={item.key} color={item.color} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
