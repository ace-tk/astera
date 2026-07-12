import { NavLink, Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const TABS = [
  { to: '/app/admin', label: 'Dashboard', end: true },
  { to: '/app/admin/users', label: 'Users' },
  { to: '/app/admin/reports', label: 'Reports' },
]

/** Admin section shell — a small sub-nav over the review pages. */
export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-shell">
      <Reveal>
        <p className="eyebrow text-accent"><ShieldCheck className="h-3.5 w-3.5" /> Admin</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight">Review panel</h1>
      </Reveal>

      <div className="mt-6 flex gap-1 border-b border-ink/8">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  )
}
