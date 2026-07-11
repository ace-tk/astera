import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform, animate as fmAnimate } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { deriveConfidence } from '@/utils/confidence'
import { accent } from '@/utils/accent'
import { useThemeHex } from '@/hooks/useThemeHex'
import { cn } from '@/utils/cn'

/** A single animated confidence gauge. */
function Gauge({ value, color, delay = 0, size = 84 }) {
  const hex = useThemeHex()
  const r = size / 2 - 7
  const c = 2 * Math.PI * r
  const mv = useMotionValue(0)
  const dash = useTransform(mv, (v) => c * (1 - v / 100))
  const [n, setN] = useState(0)

  useEffect(() => {
    const controls = fmAnimate(mv, value, { duration: 1.3, delay, ease: [0.16, 1, 0.3, 1] })
    const unsub = mv.on('change', (v) => setN(Math.round(v)))
    return () => { controls.stop(); unsub() }
  }, [mv, value, delay])

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line) / 0.1)" strokeWidth="6" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={hex(color)} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} style={{ strokeDashoffset: dash }} />
      </svg>
      <span className={cn('absolute font-display text-lg font-semibold', accent(color).text)}>{n}%</span>
    </div>
  )
}

/**
 * Confidence Details — the premium interaction behind the AI-confidence ring.
 * Breaks the composite score into six grounded categories, each with an
 * animated radial gauge and a one-line explanation.
 */
export default function ConfidenceDetails({ report, open, onClose }) {
  const cats = deriveConfidence(report)
  const overall = cats[0]

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          onMouseDown={onClose}
        >
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="AI confidence details"
            className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-ink/10 bg-card shadow-float"
          >
            {/* header */}
            <div className="flex items-start justify-between gap-4 border-b border-ink/8 p-6">
              <div className="flex items-center gap-4">
                <Gauge value={overall.value} color="purple" size={72} />
                <div>
                  <span className="eyebrow text-purple"><Sparkles className="h-3.5 w-3.5" /> AI confidence</span>
                  <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">How sure is Astra?</h2>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">{overall.note}</p>
                </div>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:text-ink" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>

            {/* per-category gauges */}
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
              {cats.slice(1).map((c, i) => (
                <div key={c.key} className="flex items-center gap-4 rounded-2xl bg-paper p-4">
                  <Gauge value={c.value} color={c.color} delay={0.1 + i * 0.08} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="border-t border-ink/8 px-6 py-3 text-center text-[0.7rem] text-muted">
              Confidence is derived from transcription quality, attribution, and decision certainty.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
