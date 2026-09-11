import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

/**
 * Secondary navigation for a service category — a sticky column on desktop,
 * a horizontal scroll of chips on mobile. Generic over `items`, so every
 * category (drafting, training, communication, ...) can reuse it.
 *
 * The `sticky` lives on an INNER div, not on `<nav>` itself: when a caller's
 * grid stretches its columns to the row's full height (ServiceCategoryContent's
 * `stickyColumns`), `nav` — as the direct grid item — would stretch to that
 * same full height too, and a sticky element that already spans its entire
 * available travel range has no room left to actually move, so it just sits
 * at its static position and scrolls with the page. Wrapping the sticky part
 * one level in means `nav` can stretch (invisibly) while the actual pill
 * list, sized to its own short content, is the one that sticks and travels.
 * Harmless where the parent grid doesn't stretch columns (nav's height
 * already matches its content there, so the extra wrapper changes nothing).
 *
 * `min-w-0` on `nav`: the mobile pill row's `overflow-x-auto` used to sit
 * directly on the grid/flex item (`nav`), which gets the special "shrink
 * below content size" allowance scrollable boxes need. Moved one level in,
 * `nav` itself is a plain block again, so without `min-w-0` its own
 * automatic min-width reverts to matching the pill row's full unwrapped
 * width (an unrelated ~1150px on mobile) and drags the whole page wider
 * instead of letting the inner row scroll.
 */
export default function ServiceCategoryNav({ items, label = 'Service pages' }) {
  const linkClass = ({ isActive }) =>
    cn(
      'block shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
      isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/[0.05] hover:text-ink',
    )

  return (
    <nav aria-label={label} className="min-w-0">
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-ink/8 bg-card/70 p-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1 lg:overflow-visible">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
