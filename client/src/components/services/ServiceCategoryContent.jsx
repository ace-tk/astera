import ServiceCategoryNav from '@/components/services/ServiceCategoryNav'
import ServicePagination from '@/components/services/ServicePagination'

/** Sidebar + content grid used below a service page's hero. Generic over `navItems`. */
export default function ServiceCategoryContent({ navItems, navLabel, children }) {
  return (
    <div className="shell py-14 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-14">
        <ServiceCategoryNav items={navItems} label={navLabel} />
        <div className="min-w-0 space-y-14">
          {children}
          <ServicePagination items={navItems} />
        </div>
      </div>
    </div>
  )
}
