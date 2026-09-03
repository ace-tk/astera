import { motion } from 'framer-motion'
import DrawLine from './DrawLine'

const EASE = [0.16, 1, 0.3, 1]

/**
 * The connective tissue between experiments — two restrained, alternating
 * languages (never more, per the brief) so six sections read as one
 * curated journey instead of six fades stitched end to end.
 *
 * `grid`: a hairline draws outward from center and a small "01 → 02"
 * coordinate label sits on top of it, like a rule cutting through a printed
 * page. `number`: the outgoing chapter number recedes, a short line draws
 * between them, and the incoming number arrives at full weight — a quiet
 * typographic handoff rather than a generic scroll reveal.
 */
export default function SectionSeam({ from, to, variant = 'grid' }) {
  if (variant === 'number') {
    return (
      <div className="relative border-t border-ink/10 bg-paper py-10 sm:py-14" aria-hidden="true">
        <div className="shell flex items-center justify-center gap-5 sm:gap-8">
          <motion.span
            initial={{ opacity: 0.35 }}
            whileInView={{ opacity: 0.12 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-display text-2xl text-ink sm:text-3xl"
          >
            {from}
          </motion.span>
          <div className="relative h-px w-14 overflow-hidden bg-ink/10 sm:w-20">
            <DrawLine axis="x" origin="left" duration={0.7} />
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="font-display text-2xl text-ink sm:text-3xl"
          >
            {to}
          </motion.span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative border-t border-ink/10 bg-paper py-10 sm:py-14" aria-hidden="true">
      <div className="shell relative flex items-center justify-center">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <DrawLine axis="x" origin="center" duration={1} />
        </div>
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="relative z-10 bg-paper px-4 font-mono text-[10px] uppercase tracking-[0.24em] text-muted/60"
        >
          {from} → {to}
        </motion.span>
      </div>
    </div>
  )
}
