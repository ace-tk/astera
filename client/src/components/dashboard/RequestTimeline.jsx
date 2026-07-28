import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

const STAGES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
]

/**
 * A compact stage progress indicator for a Report Request — a request always
 * starts "Submitted", then walks the same pipeline as its `status`. Previous
 * stages read as done, the current one is highlighted, the rest stay muted.
 */
export default function RequestTimeline({ status, className }) {
  const currentIndex = STAGES.findIndex((s) => s.key === status)

  return (
    <div className={cn('flex items-center', className)} role="list" aria-label="Request progress">
      {STAGES.map((s, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={s.key} className="flex flex-1 items-center last:flex-none" role="listitem" aria-current={active ? 'step' : undefined}>
            <div className="flex flex-col items-center gap-1" title={s.label}>
              <span
                className={cn(
                  'grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors',
                  done && 'border-emerald bg-emerald text-white',
                  active && 'border-accent bg-accent text-white',
                  !done && !active && 'border-ink/15 bg-card',
                )}
              >
                {done && <Check className="h-2.5 w-2.5" />}
              </span>
              <span
                className={cn(
                  'hidden text-center text-[0.6rem] leading-tight sm:block',
                  active ? 'font-medium text-ink' : done ? 'text-muted' : 'text-muted/60',
                )}
                style={{ maxWidth: '3.75rem' }}
              >
                {s.label}
              </span>
              <span className="sr-only">{s.label}{active ? ' (current)' : done ? ' (done)' : ''}</span>
            </div>
            {i < STAGES.length - 1 && (
              <span className={cn('mx-1 h-0.5 flex-1 rounded-full transition-colors', i < currentIndex ? 'bg-emerald' : 'bg-ink/10')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
