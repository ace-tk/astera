import { motion } from 'framer-motion'
import TechnicalGrid from './primitives/TechnicalGrid'
import DrawLine from './primitives/DrawLine'
import TechnicalLabel from './primitives/TechnicalLabel'
import MotionReveal from './primitives/MotionReveal'
import { LAB_META } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

/**
 * The opening screen. Deliberately not a centered SaaS hero: a structural
 * frame draws in first, metadata arrives in the corners, then the headline
 * masks itself into view line by line — the whole thing choreographed to
 * read as "this is a design document," not "this is a landing page."
 */
export default function DesignTestIntro() {
  return (
    <section className="dt-viewport relative flex flex-col justify-between overflow-hidden border-b border-ink/10 bg-paper">
      <TechnicalGrid showTicks fade={false} />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.025]" aria-hidden="true" />

      {/* Frame rules draw in first */}
      <DrawLine axis="x" origin="left" duration={1.4} className="absolute left-0 top-16 sm:top-20" />
      <DrawLine axis="x" origin="right" duration={1.4} delay={0.1} className="absolute bottom-24 left-0 sm:bottom-28" />
      <DrawLine axis="y" origin="top" duration={1.2} delay={0.2} className="absolute left-6 top-16 h-[calc(100%-6.5rem)] sm:left-8" />
      <DrawLine axis="y" origin="top" duration={1.2} delay={0.2} className="absolute right-6 top-16 h-[calc(100%-6.5rem)] sm:right-8" />

      <div className="shell relative flex flex-1 flex-col justify-center pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
        >
          <TechnicalLabel coordinate="43.2N / 5.4E">{LAB_META.eyebrow}</TechnicalLabel>
        </motion.div>

        <h1 className="mt-6 font-display text-display-lg leading-[0.9] tracking-tight text-ink">
          {LAB_META.titleLines.map((line, i) => (
            <MotionReveal key={line} delay={0.65 + i * 0.12} duration={1}>
              <span className="block">{line}</span>
            </MotionReveal>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.15, ease: EASE }}
          className="mt-8 max-w-md text-pretty text-base text-muted sm:text-lg"
        >
          {LAB_META.lead}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4, ease: EASE }}
        className="shell relative flex flex-wrap items-center justify-between gap-3 pb-24 lg:pb-12"
      >
        <TechnicalLabel dot={false}>{LAB_META.count}</TechnicalLabel>
        <TechnicalLabel dot={false} className="order-first w-full justify-center sm:order-none sm:w-auto">
          {LAB_META.scrollCue}
        </TechnicalLabel>
        <TechnicalLabel dot={false}>{LAB_META.year}</TechnicalLabel>
      </motion.div>
    </section>
  )
}
