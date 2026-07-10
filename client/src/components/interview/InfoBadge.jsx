import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { useInterview } from '@/context/InterviewContext'
import { cn } from '@/utils/cn'

/**
 * A contextual "why we built it this way" badge. Renders nothing unless
 * Interview Mode is on; then it shows a pulsing ⓘ that opens an engineering
 * note — architecture, React/animation/performance decisions — for that screen.
 */
export default function InfoBadge({ title, points = [], align = 'right', className }) {
  const { enabled } = useInterview()
  const [open, setOpen] = useState(false)
  if (!enabled) return null

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen((v) => !v) }}
        className="relative grid h-6 w-6 place-items-center rounded-full bg-purple/12 text-purple transition-colors hover:bg-purple/20"
        aria-label={`Why: ${title}`}
      >
        <Info className="h-3.5 w-3.5" />
        <span className="absolute inset-0 animate-ping rounded-full bg-purple/30" style={{ animationDuration: '2.5s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false) }} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={cn('absolute top-8 z-50 w-72 rounded-2xl border border-ink/10 bg-card p-4 text-left shadow-float', align === 'right' ? 'right-0' : 'left-0')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-purple/12 text-purple"><Info className="h-3.5 w-3.5" /></span>
                  <p className="text-sm font-semibold">{title}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setOpen(false) }} className="text-muted hover:text-ink"><X className="h-3.5 w-3.5" /></button>
              </div>
              <ul className="mt-3 space-y-2">
                {points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-ink/8 pt-2 text-[0.65rem] uppercase tracking-wider text-muted">Interview mode</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  )
}
