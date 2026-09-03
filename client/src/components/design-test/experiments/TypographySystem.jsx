import { motion } from 'framer-motion'
import DrawLine from '../primitives/DrawLine'
import MotionReveal from '../primitives/MotionReveal'
import TechnicalLabel from '../primitives/TechnicalLabel'
import ExperimentHeader from '../primitives/ExperimentHeader'
import { TYPOGRAPHY_WORDS } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Typography as the visual event: the same system (ATOOPV, PV, a delivery
 * stat, three "fields") shown at wildly different scales, each revealed by
 * masking rather than fading. Nothing is skewed or cropped illegibly —
 * scale changes, readability doesn't.
 */
export default function TypographySystem() {
  return (
    <section id="experiment-04" className="relative overflow-hidden border-t border-ink/10 bg-paper py-24 sm:py-32">
      <span
        className="pointer-events-none absolute -left-6 top-8 select-none font-display text-[16rem] leading-none text-ink/[0.03] sm:text-[22rem]"
        aria-hidden="true"
      >
        {TYPOGRAPHY_WORDS.watermark}
      </span>

      <div className="shell relative">
        <ExperimentHeader index="04" eyebrow="EXPERIMENT / 04" titleLines={['WORDS BECOME', 'STRUCTURE.']} className="mb-16 sm:mb-24" />

        <MotionReveal duration={1.1} className="border-b border-ink/10 pb-4">
          <h3 className="font-display text-[16vw] leading-[0.85] tracking-tight text-ink sm:text-[13vw] lg:text-[10vw]">
            {TYPOGRAPHY_WORDS.brand}
          </h3>
        </MotionReveal>

        <div className="mt-14 grid grid-cols-1 items-end gap-8 border-b border-ink/10 pb-14 sm:mt-20 sm:pb-20 lg:grid-cols-[auto_1fr] lg:gap-16">
          <div className="relative">
            <DrawLine axis="x" origin="left" duration={1} className="absolute bottom-[0.22em] left-0 -z-10 w-[120%]" />
            <MotionReveal duration={1}>
              <span className="font-display text-[9rem] leading-none text-ink sm:text-[11rem] lg:text-[13rem]">
                {TYPOGRAPHY_WORDS.document}
              </span>
            </MotionReveal>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="max-w-sm"
          >
            <TechnicalLabel dot={false}>{TYPOGRAPHY_WORDS.documentCaption}</TechnicalLabel>
          </motion.div>
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:mt-20 sm:flex-row sm:items-baseline sm:justify-between">
          <MotionReveal duration={1}>
            <span className="font-display text-6xl tracking-tight text-accent sm:text-7xl lg:text-8xl">{TYPOGRAPHY_WORDS.stat}</span>
          </MotionReveal>
          <TechnicalLabel dot={false} className="sm:pb-2">
            {TYPOGRAPHY_WORDS.statCaption}
          </TechnicalLabel>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-ink/10 pt-10 sm:mt-24 sm:grid-cols-3 sm:gap-6 sm:pt-14">
          {TYPOGRAPHY_WORDS.fields.map((field, i) => (
            <div key={field.word}>
              <MotionReveal delay={i * 0.1} duration={0.8}>
                <span className="block font-display text-4xl tracking-tight text-ink sm:text-5xl">{field.word}</span>
              </MotionReveal>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="mt-3"
              >
                <TechnicalLabel dot={false}>{field.caption}</TechnicalLabel>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
