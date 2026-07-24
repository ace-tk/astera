import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate as fmAnimate } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import AstraOrb from '@/components/assistant/AstraOrb'
import MeshBackground from '@/components/common/MeshBackground'
import Button from '@/components/ui/Button'
import { useSound } from '@/context/SoundContext'
import { accent } from '@/utils/accent'
import { useThemeHex } from '@/hooks/useThemeHex'
import { markCovered } from '@/utils/coverSession'
import { cn } from '@/utils/cn'

// Words rise + un-blur into place — the "paper assembling" title.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }
const word = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

function ConfidenceRing({ value, color }) {
  const hex = useThemeHex()
  const r = 34
  const c = 2 * Math.PI * r
  const mv = useMotionValue(0)
  const dash = useTransform(mv, (v) => c * (1 - v / 100))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = fmAnimate(mv, value, { duration: 1.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] })
    const unsub = mv.on('change', (v) => setDisplay(Math.round(v)))
    return () => { controls.stop(); unsub() }
  }, [mv, value])

  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgb(var(--line) / 0.1)" strokeWidth="6" />
        <motion.circle cx="48" cy="48" r={r} fill="none" stroke={hex(color)} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} style={{ strokeDashoffset: dash }} />
      </svg>
      <div className="absolute text-center">
        <div className={cn('font-display text-xl font-semibold', accent(color).text)}>{display}%</div>
        <div className="text-[0.55rem] uppercase tracking-wider text-muted">Confidence</div>
      </div>
    </div>
  )
}


export default function ReportCover({ report, onReveal }) {
  const a = accent(report.color)
  const { play } = useSound()

  useEffect(() => {
    play('paper')
    const t = setTimeout(reveal, 3200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reveal = () => {
    markCovered(report.id)
    play('open')
    onReveal()
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-paper"
    >
      <MeshBackground mood="reports" />

      {/* assembling paper sheets */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 60, rotate: (i - 1) * 8, scale: 0.9 }}
          animate={{ opacity: 0.5, y: (i - 1) * 10, rotate: (i - 1) * 4, scale: 1 }}
          transition={{ delay: i * 0.12, type: 'spring', stiffness: 90, damping: 15 }}
          className="absolute h-[62%] w-[min(30rem,80vw)] rounded-[2rem] border border-ink/8 bg-card shadow-float"
          style={{ zIndex: -1 }}
        />
      ))}

      <motion.div variants={container} initial="hidden" animate="show" className="relative w-full max-w-xl px-8 text-center">
        <motion.div variants={word} className="flex justify-center">
          <span className={cn('eyebrow', a.text)}><Sparkles className="h-3.5 w-3.5" /> ATOOPV Intelligence Report</span>
        </motion.div>

        <h1 className="mt-6 font-display text-display-sm font-semibold leading-[1.03] tracking-tight text-balance">
          {report.title.split(' ').map((w, i) => (
            <motion.span key={i} variants={word} className="mr-[0.25em] inline-block">{w}</motion.span>
          ))}
        </h1>

        <motion.p variants={word} className="mt-5 text-sm text-muted">
          {new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {report.duration} · {report.participants.length} participants
        </motion.p>

        {report.dna && (
          <motion.div variants={word} className="mt-8 flex justify-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('astera:confidence'))}
              className="rounded-full transition-transform hover:scale-105"
              aria-label="View confidence analysis"
              title="View confidence analysis"
            >
              <ConfidenceRing value={report.dna.aiConfidence} color={report.color} />
            </button>
          </motion.div>
        )}

        <motion.div variants={word} className="mt-8 flex items-center justify-center gap-2.5 text-sm text-muted">
          <AstraOrb size={28} breathing state="completed" />
          <span>Prepared by <span className="font-medium text-ink">ASTRA</span> · Generated just now</span>
        </motion.div>

        <motion.div variants={word} className="mt-8">
          <Button variant="accent" onClick={reveal}>Open report <ArrowRight className="h-4 w-4" /></Button>
        </motion.div>
        <motion.p variants={word} className="mt-4 text-xs text-muted">Assembling your report…</motion.p>
      </motion.div>
    </motion.div>
  )
}
