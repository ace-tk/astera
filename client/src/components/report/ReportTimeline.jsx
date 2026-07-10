import { useState } from 'react'
import { motion } from 'framer-motion'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const KIND = {
  decision: 'Decision',
  risk: 'Risk',
  commitment: 'Commitment',
  topic: 'Topic',
}

/** Convert mm:ss to a 0..100 position given the meeting's total duration. */
const toSeconds = (t) => {
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}

/**
 * A scrubbable meeting timeline. Hovering a marker lifts its label; the whole
 * track reads like a filmstrip of the conversation's key moments.
 */
export default function ReportTimeline({ timeline, duration }) {
  const total = toSeconds(duration)
  const [active, setActive] = useState(null)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between text-xs text-muted">
        <span>00:00</span>
        <span className="uppercase tracking-widest">Conversation timeline</span>
        <span>{duration}</span>
      </div>

      <div className="relative h-24">
        {/* base track */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink/8" />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 right-0 top-1/2 h-1.5 origin-left -translate-y-1/2 rounded-full bg-gradient-to-r from-coral via-purple to-sky"
        />

        {timeline.map((m, i) => {
          const a = accent(m.color)
          const pos = (toSeconds(m.at) / total) * 100
          const up = i % 2 === 0
          const isActive = active === i
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos}%` }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {/* connector + label */}
              <div
                className={cn(
                  'absolute left-1/2 w-max -translate-x-1/2 transition-all duration-300',
                  up ? 'bottom-4' : 'top-4',
                  isActive ? 'opacity-100' : 'opacity-70',
                )}
              >
                <div
                  className={cn(
                    'rounded-xl border bg-card px-2.5 py-1.5 text-xs shadow-soft',
                    isActive ? a.border : 'border-ink/8',
                  )}
                >
                  <div className={cn('font-medium', a.text)}>{KIND[m.kind]}</div>
                  <div className="whitespace-nowrap text-ink/70">{m.label}</div>
                  <div className="text-[0.65rem] text-muted">{m.at}</div>
                </div>
              </div>

              <motion.span
                whileHover={{ scale: 1.35 }}
                className={cn('block h-4 w-4 rounded-full ring-4 ring-paper', a.bg)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
