import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * A numbered control panel for the Studio's right rail ("01 — Mode").
 * Pure presentation: the panel owns only its own open/closed state, never any
 * Studio data — everything inside is driven by the page's existing state.
 */
export default function StudioPanel({ index, title, aside, children, defaultOpen = true, className }) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()

  return (
    <section className={cn('rounded-lg border border-ink/10 bg-card', className)}>
      <h2 className="m-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
        >
          <span className="font-mono text-[11px] tabular-nums text-ink/40">{index}</span>
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">{title}</span>
          {aside}
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200', !open && '-rotate-90')} />
        </button>
      </h2>
      <div id={bodyId} hidden={!open} className="border-t border-ink/8 px-3.5 py-3.5">
        {children}
      </div>
    </section>
  )
}
