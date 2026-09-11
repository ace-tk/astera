import { useLocation } from 'react-router-dom'
import ServiceCategoryNav from '@/components/services/ServiceCategoryNav'
import EditorialMenuItem from '@/components/landing/EditorialMenuItem'

/**
 * Sidebar nav given the editorial "title + dashed rule + arrow" treatment
 * already established for the ATOOPV mega-menu (see EditorialMenuItem)
 * instead of the filled-pill style ServiceCategoryNav renders by default.
 * Generic over `items`/`label`, so any category's own existing nav data —
 * Ressources/Blog, or Procès-verbal's drafting/by-city/tarifs-infos — can
 * reuse the exact same treatment instead of each hand-rolling its own.
 *
 * Mobile keeps the existing compact horizontal chip strip (ServiceCategoryNav
 * itself, unmodified) rather than stacking many dashed rows above the
 * article — the editorial list only takes over at `lg`, where it also picks
 * up the sticky positioning (via ServiceCategoryContent's `stickyColumns`).
 */
export default function EditorialCategoryNav({ items, label = 'Service pages' }) {
  const { pathname } = useLocation()

  return (
    <nav aria-label={label} className="min-w-0">
      <div className="lg:hidden">
        <ServiceCategoryNav items={items} label={label} />
      </div>
      <div className="hidden lg:sticky lg:top-28 lg:block">
        {items.map((item) => {
          const active = item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
          return (
            <EditorialMenuItem key={item.to} to={item.to} active={active} dense>
              {item.label}
            </EditorialMenuItem>
          )
        })}
      </div>
    </nav>
  )
}
