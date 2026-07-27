import { Outlet } from 'react-router-dom'

/**
 * Admin section shell. Navigation between admin pages lives in
 * DashboardLayout's sidebar (it swaps to ADMIN_NAV under /app/admin/*), so
 * this is just the shared page container — each admin page renders its own
 * eyebrow/heading, same convention as Overview/Settings on the customer side.
 */
export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-shell">
      <Outlet />
    </div>
  )
}
