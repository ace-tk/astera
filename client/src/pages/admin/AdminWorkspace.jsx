import { Link } from 'react-router-dom'
import { LayoutGrid, FileText, Building2, Users, BarChart3, ArrowRight, FileClock, Ban } from 'lucide-react'
import { ADMIN_STATS, RECENT_REPORTS, MOCK_CUSTOMERS } from '@/services/mockAdminData'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const QUICK_ACTIONS = [
  { to: '/app/admin/reports', label: 'Review reports', desc: `${ADMIN_STATS.draftReports} drafts waiting`, icon: FileText, color: 'sky' },
  { to: '/app/admin/customers', label: 'Manage customers', desc: `${ADMIN_STATS.totalCustomers} total accounts`, icon: Building2, color: 'golden' },
  { to: '/app/admin/users', label: 'Manage users', desc: 'Roles & access', icon: Users, color: 'coral' },
  { to: '/app/admin/analytics', label: 'View analytics', desc: 'Trends & growth', icon: BarChart3, color: 'emerald' },
]

/**
 * Admin Workspace — a lighter, action-oriented landing view (distinct from
 * the Dashboard's KPI focus): quick jumps into the other admin sections plus
 * a short "needs attention" triage list built from the same placeholder data
 * as Dashboard/Reports/Customers.
 */
export default function AdminWorkspace() {
  const drafts = RECENT_REPORTS.filter((r) => r.status === 'draft')
  const flagged = MOCK_CUSTOMERS.filter((c) => c.status === 'disabled')

  return (
    <div>
      <Reveal>
        <p className="eyebrow text-accent">
          <LayoutGrid className="h-3.5 w-3.5" /> Admin · Workspace
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Your daily operating view.
        </h1>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a, i) => {
          const acc = accent(a.color)
          return (
            <Reveal key={a.to} delay={i * 0.06}>
              <Link
                to={a.to}
                className="group flex h-full items-center gap-3 rounded-2xl border border-ink/8 bg-card p-5 shadow-soft transition-colors hover:border-ink/20"
              >
                <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', acc.softBg, acc.text)}>
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{a.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{a.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          )
        })}
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <section className="h-full rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-medium tracking-tight">Needs attention</h2>
            <p className="mt-1 text-sm text-muted">Drafts and flagged accounts worth a look.</p>
            <div className="mt-5 space-y-2.5">
              {drafts.map((r) => (
                <Link
                  key={r.id}
                  to={`/app/admin/reports/${r.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3 transition-colors hover:border-ink/20"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-golden/10 text-golden"><FileClock className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    <span className="text-xs text-muted">Draft · {r.owner}</span>
                  </span>
                </Link>
              ))}
              {flagged.map((c) => (
                <Link
                  key={c.id}
                  to="/app/admin/customers"
                  className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3 transition-colors hover:border-ink/20"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose/10 text-rose"><Ban className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.company}</span>
                    <span className="text-xs text-muted">Account disabled</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.06}>
          <section className="h-full rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-medium tracking-tight">This week</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'New customers', value: '6', color: 'royal' },
                { label: 'Reports published', value: '24', color: 'emerald' },
                { label: 'Reports drafted', value: '9', color: 'golden' },
                { label: 'Support tickets', value: '3', color: 'rose' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4">
                  <p className={cn('font-display text-2xl font-semibold tracking-tight', accent(s.color).text)}>{s.value}</p>
                  <p className="mt-1 text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  )
}
