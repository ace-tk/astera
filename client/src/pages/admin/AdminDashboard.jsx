import { Link } from 'react-router-dom'
import { ShieldCheck, Users, FileText, FileClock, FileCheck2, UserCheck, ArrowRight } from 'lucide-react'
import { ADMIN_STATS, RECENT_REPORTS, CUSTOMER_ACTIVITY, LATEST_UPDATES } from '@/services/mockAdminData'
import Reveal from '@/components/ui/Reveal'
import StatusChip from '@/components/admin/StatusChip'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const CARDS = [
  { key: 'totalCustomers', label: 'Total customers', icon: Users, color: 'text-royal' },
  { key: 'totalReports', label: 'Total reports', icon: FileText, color: 'text-purple' },
  { key: 'draftReports', label: 'Draft reports', icon: FileClock, color: 'text-golden' },
  { key: 'publishedReports', label: 'Published reports', icon: FileCheck2, color: 'text-emerald' },
  { key: 'activeUsers', label: 'Active users', icon: UserCheck, color: 'text-sky' },
]

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/**
 * Admin Portal landing page — frontend-only placeholder data (see
 * services/mockAdminData.js). Same KPI-tile grammar as the customer
 * Overview page / the original AdminDashboard, extended with three
 * below-the-fold panels (Recent Reports, Customer Activity, Latest Updates).
 */
export default function AdminDashboard() {
  return (
    <div>
      <Reveal>
        <p className="eyebrow text-accent">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin · Dashboard
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          A clear view of every customer, report, and account.
        </h1>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.06}>
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <c.icon className={cn('h-5 w-5', c.color)} />
              <div className="mt-3 font-display text-4xl font-semibold tracking-tight">{ADMIN_STATS[c.key]}</div>
              <p className="mt-1 text-sm text-muted">{c.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <Reveal>
          <section className="h-full rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium tracking-tight">Recent reports</h2>
              <Link to="/app/admin/reports" className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-ink">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {RECENT_REPORTS.slice(0, 4).map((r) => (
                <div key={r.id} className="rounded-2xl border border-ink/8 bg-paper px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-medium">{r.title}</span>
                    <StatusChip status={r.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{r.owner} · {fmt(r.updatedAt)}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.06}>
          <section className="h-full rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-medium tracking-tight">Customer activity</h2>
            <div className="mt-4 space-y-4">
              {CUSTOMER_ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', accent(a.color).dot)} />
                  <div className="min-w-0">
                    <p className="text-sm"><span className="font-medium">{a.company}</span> — {a.action}</p>
                    <p className="mt-0.5 text-xs text-muted">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <section className="h-full rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-medium tracking-tight">Latest updates</h2>
            <div className="mt-4 space-y-4">
              {LATEST_UPDATES.map((u) => (
                <div key={u.id} className="border-b border-ink/8 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{u.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{u.description}</p>
                  <p className="mt-1.5 text-xs text-muted/70">{u.time}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  )
}
