import { useSearchParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/** Shared building blocks for the "New Development" admin area (design preview only — mock data, no API). */

export function PageHeader({ icon: Icon, section, title, lead, action }) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent"><Icon className="h-3.5 w-3.5" /> New Development · {section}</p>
          <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">{title}</h1>
          {lead && <p className="mt-2 max-w-2xl text-sm text-muted">{lead}</p>}
        </div>
        {action}
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-card px-2.5 py-1 text-[11px] text-muted">
        <Info className="h-3 w-3" /> Design preview — sample data, nothing is saved.
      </p>
    </Reveal>
  )
}

/** Tab row whose active tab lives in ?tab= so a tab can be linked to / reloaded. */
export function useTab(tabs) {
  const [params, setParams] = useSearchParams()
  const active = tabs.find((t) => t.id === params.get('tab'))?.id || tabs[0].id
  return [active, (id) => setParams({ tab: id }, { replace: true })]
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="mt-6 flex gap-1 overflow-x-auto border-b border-ink/10">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            '-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors',
            active === t.id ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Card({ className, children }) {
  return <div className={cn('rounded-2xl border border-ink/8 bg-card p-5 shadow-soft', className)}>{children}</div>
}

export function Stat({ label, value, hint }) {
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  )
}

const TONES = {
  green: 'bg-emerald/15 text-emerald',
  amber: 'bg-golden/15 text-golden',
  blue: 'bg-sky/15 text-sky',
  grey: 'bg-ink/8 text-muted',
  red: 'bg-rose/15 text-rose',
}
export function Chip({ tone = 'grey', children }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', TONES[tone])}>{children}</span>
}

export function Table({ head, rows, empty = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/8 bg-card shadow-soft">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
          <tr>{head.map((h) => <th key={h} className="px-5 py-3.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
              {r.map((c, j) => <td key={j} className={cn('px-5 py-3.5', j > 0 && 'text-muted')}>{c}</td>)}
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={head.length} className="px-5 py-8 text-center text-muted">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block text-xs font-medium text-muted">
      {label}
      <div className="mt-1.5 text-sm text-ink">{children}</div>
    </label>
  )
}
export const inputCls = 'h-10 w-full rounded-md border border-ink/12 bg-paper px-3 text-sm text-ink outline-none transition-colors focus:border-accent'
