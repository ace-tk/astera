import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

/**
 * Secondary navigation for a service category — a sticky column on desktop,
 * a horizontal scroll of chips on mobile. Generic over `items`, so every
 * category (drafting, training, communication, ...) can reuse it.
 */
export default function ServiceCategoryNav({ items, label = 'Service pages' }) {
  const linkClass = ({ isActive }) =>
    cn(
      'block shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
      isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/[0.05] hover:text-ink',
    )

  return (
    <nav
      aria-label={label}
      className="flex gap-2 overflow-x-auto rounded-2xl border border-ink/8 bg-card/70 p-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1 lg:overflow-visible"
    >
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
