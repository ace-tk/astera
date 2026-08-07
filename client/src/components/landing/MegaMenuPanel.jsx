import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const itemClass = 'block rounded-xl px-3 py-2 text-sm leading-snug text-ink/80 transition-colors hover:bg-ink/[0.04] hover:text-ink'

/**
 * The shared panel for the ATOOPV mega-nav (Procès-verbal, Formations,
 * Ressources, Blog) — same visual family as NavDropdown's flyout (bg-card,
 * border-ink/10, shadow-float, rounded corners, .eyebrow headings) just
 * wide enough for several columns side by side. One instance is reused for
 * whichever top-level item is currently open (see MegaMenuPanel's caller in
 * Navbar.jsx), so switching between items swaps this panel's content
 * instead of closing/reopening a new one — that's what keeps the
 * hover/focus transition between top-level entries flicker-free.
 */
export default function MegaMenuPanel({ item, onNavigate, ...handlers }) {
  const { columns, cta, cities } = item.mega
  const a = accent(item.color)
  const trailingCount = cta || cities ? 1 : 0

  return (
    <div
      id={`mega-panel-${item.key}`}
      role="region"
      aria-label={item.label}
      className="w-[min(58rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-ink/10 bg-card shadow-float"
      {...handlers}
    >
      <div
        className="grid divide-x divide-ink/8"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))${trailingCount ? ' 17rem' : ''}` }}
      >
        {columns.map((col) => (
          <div key={col.heading} className="p-6">
            <span className="eyebrow">
              <span className="h-px w-6 bg-ink/25" /> {col.heading}
            </span>
            <div className="mt-4 space-y-0.5">
              {col.items.map((link) => (
                <Link key={link.label} to={link.href} onClick={onNavigate} className={itemClass}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {cta && (
          <div className={cn('flex flex-col justify-between p-6', cta.tone === 'dark' ? 'bg-ink text-paper' : a.softBg)}>
            <div>
              <span className={cn('text-xs font-semibold uppercase tracking-[0.16em]', cta.tone === 'dark' ? 'text-paper/60' : a.text)}>
                {cta.eyebrow}
              </span>
              <p className={cn('mt-3 text-base font-medium leading-snug', cta.tone === 'dark' ? 'text-paper' : 'text-ink')}>{cta.title}</p>
            </div>
            <Button as={Link} to={cta.buttonHref} onClick={onNavigate} size="sm" variant={cta.tone === 'dark' ? 'soft' : 'primary'} className="mt-6 w-full">
              {cta.buttonLabel}
            </Button>
          </div>
        )}

        {cities && (
          <div className={cn('p-6', a.softBg)}>
            <span className="eyebrow">
              <span className="h-px w-6 bg-ink/25" /> {cities.heading}
            </span>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">{cities.label}</p>
            <Link to={cities.href} onClick={onNavigate} className={cn('mt-4 inline-flex items-center gap-1.5 text-sm font-medium', a.text)}>
              {cities.linkLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
