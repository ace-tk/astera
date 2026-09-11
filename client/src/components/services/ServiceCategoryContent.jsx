import ServiceCategoryNav from '@/components/services/ServiceCategoryNav'
import ServicePagination from '@/components/services/ServicePagination'
import { cn } from '@/utils/cn'

/**
 * Sidebar + content grid used below a service page's hero. Generic over
 * `navItems`. `rail` is optional and additive: every existing caller that
 * doesn't pass it keeps the exact same two-column grid/gap as before —
 * only a page that explicitly opts in (currently just modele-pv-cse-gratuit,
 * see ServiceArticle.jsx) gets the third editorial-rail column.
 */
export default function ServiceCategoryContent({ navItems, navLabel, rail, children }) {
  return (
    <div className="shell py-10 sm:py-12">
      <div
        className={cn(
          'grid gap-10 lg:items-start',
          rail ? 'lg:grid-cols-[15rem_1fr] lg:gap-12 xl:grid-cols-[15rem_1fr_14rem] xl:gap-10' : 'lg:grid-cols-[15rem_1fr] lg:gap-14',
        )}
      >
        <ServiceCategoryNav items={navItems} label={navLabel} />
        <div className="min-w-0 space-y-14">
          {children}
          <ServicePagination items={navItems} />
        </div>
        {rail}
      </div>
    </div>
  )
}
