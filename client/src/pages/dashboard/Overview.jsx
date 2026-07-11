import { Link } from 'react-router-dom'
import { UploadCloud } from 'lucide-react'
import { useReports } from '@/hooks/useReports'
import ReportCard from '@/components/dashboard/ReportCard'
import EmptyState from '@/components/common/EmptyState'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const SUMMARY = [
  { label: 'Reports this month', value: '18', accent: 'text-royal', bar: 'bg-royal' },
  { label: 'Decisions captured', value: '214', accent: 'text-purple', bar: 'bg-purple' },
  { label: 'Open commitments', value: '7', accent: 'text-golden', bar: 'bg-golden' },
  { label: 'Follow-through', value: '87%', accent: 'text-emerald', bar: 'bg-emerald' },
]

export default function Overview() {
  const { data: reports = [], isLoading } = useReports()
  const [featured, ...rest] = reports

  if (!isLoading && reports.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-shell place-items-center">
        <EmptyState
          color="coral"
          icon={UploadCloud}
          title="No conversations yet."
          description="Every great report starts with one discussion. Drop in a recording and watch Astera bring it to life."
          action={<Button as={Link} to="/app/upload" variant="accent">Create intelligence</Button>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-shell">
      <Reveal>
        <p className="eyebrow">Good afternoon, Maya</p>
        <h1 className="mt-3 max-w-2xl font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Every conversation, understood.
        </h1>
      </Reveal>

      {/* Summary tiles */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SUMMARY.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <div className={cn('font-display text-4xl font-semibold tracking-tight', s.accent)}>{s.value}</div>
              <p className="mt-2 text-sm text-muted">{s.label}</p>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-ink/8">
                <div className={cn('h-full rounded-full', s.bar)} style={{ width: `${60 + i * 10}%` }} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Featured report */}
      <div className="mt-12 flex items-end justify-between">
        <h2 className="font-display text-2xl font-medium tracking-tight">Latest report</h2>
        <span className="text-sm text-muted">Auto-generated 2 hours ago</span>
      </div>
      <Reveal className="mt-5">
        {featured ? (
          <ReportCard report={featured} featured />
        ) : (
          <div className="h-72 animate-pulse rounded-3xl border border-ink/8 bg-card" />
        )}
      </Reveal>
      {isLoading && <p className="mt-4 text-sm text-muted">Gathering your intelligence…</p>}

      {/* Recent reports */}
      <h2 className="mt-14 font-display text-2xl font-medium tracking-tight">Recent</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {rest.map((r, i) => (
          <Reveal key={r.id} delay={i * 0.08}>
            <ReportCard report={r} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
