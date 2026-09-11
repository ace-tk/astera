import ServiceCategoryNav from '@/components/services/ServiceCategoryNav'
import ServicePagination from '@/components/services/ServicePagination'
import { cn } from '@/utils/cn'

/**
 * Sidebar + content grid used below a service page's hero. Generic over
 * `navItems`. `rail` is optional and additive: every existing caller that
 * doesn't pass it keeps the exact same two-column grid/gap as before —
 * only a page that explicitly opts in (currently just modele-pv-cse-gratuit,
 * see ServiceArticle.jsx) gets the third editorial-rail column.
 *
 * `stickyColumns` is opt-in and off by default, keeping every existing
 * caller's exact current layout. `lg:items-start` sizes each grid column to
 * its OWN content height rather than the row's full height — harmless for
 * a column with no sticky child, but it leaves a short sticky sidebar/rail
 * almost no room to travel, so it just scrolls with the page instead of
 * sticking (the bug this prop fixes). À propos's own nav (AProposNav.jsx)
 * never had this bug because its grid has no `items-start` at all — passing
 * `stickyColumns` switches to that same default `stretch` alignment.
 *
 * `nav` optionally overrides the default `ServiceCategoryNav` pill list with
 * a caller-supplied nav element (Ressources/Blog pages pass the editorial
 * dashed-divider nav here) — every other caller keeps the exact same pill
 * nav it already renders.
 *
 * `compact` is opt-in and off by default, trimming the section's own
 * vertical padding and column gap a step down (Ressources/Blog pages pass
 * it); every existing caller keeps its current spacing untouched.
 */
export default function ServiceCategoryContent({ navItems, navLabel, nav, rail, stickyColumns = false, compact = false, children }) {
  return (
    <div className={cn('shell', compact ? 'py-7 sm:py-9' : 'py-10 sm:py-12')}>
      <div
        className={cn(
          'grid',
          compact ? 'gap-8' : 'gap-10',
          stickyColumns ? 'lg:items-stretch' : 'lg:items-start',
          rail
            ? cn('lg:grid-cols-[15rem_1fr]', compact ? 'lg:gap-9 xl:gap-8' : 'lg:gap-12', 'xl:grid-cols-[15rem_1fr_14rem]', !compact && 'xl:gap-10')
            : cn('lg:grid-cols-[15rem_1fr]', compact ? 'lg:gap-10' : 'lg:gap-14'),
        )}
      >
        {nav ?? <ServiceCategoryNav items={navItems} label={navLabel} />}
        <div className={cn('min-w-0', compact ? 'space-y-10' : 'space-y-14')}>
          {children}
          <ServicePagination items={navItems} />
        </div>
        {rail}
      </div>
    </div>
  )
}
