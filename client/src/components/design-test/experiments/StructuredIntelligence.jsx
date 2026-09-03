import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import clsx from 'clsx'
import TechnicalGrid from '../primitives/TechnicalGrid'
import TechnicalLabel from '../primitives/TechnicalLabel'
import ExperimentHeader from '../primitives/ExperimentHeader'
import { STRUCTURED_STAGES } from '@/constants/designTest'

const COUNT = STRUCTURED_STAGES.length
const EASE = [0.16, 1, 0.3, 1]

/**
 * A single stacked numeral. All five stack in the same box; scroll position
 * drives opacity/scale/y for each via its own motion-value transform, so the
 * "active number dominates, neighbours recede" choreography is pure
 * transform/opacity math — no per-frame React state.
 */
function StageNumeral({ index, progress, label }) {
  const seg = 1 / COUNT
  const center = index * seg + seg / 2
  const opacity = useTransform(progress, [center - seg, center - seg * 0.35, center, center + seg * 0.35, center + seg], [0.1, 0.1, 1, 0.1, 0.1])
  const scale = useTransform(progress, [center - seg, center, center + seg], [0.72, 1, 0.72])
  const y = useTransform(progress, [center - seg, center, center + seg], [48, 0, -48])

  return (
    <motion.span
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex items-center font-display text-[5.5rem] leading-none text-ink sm:text-[7rem] lg:text-[9rem]"
    >
      {label}
    </motion.span>
  )
}

export default function StructuredIntelligence() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(COUNT - 1, Math.max(0, Math.floor(v * COUNT)))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  const stage = STRUCTURED_STAGES[active]

  return (
    <section id="experiment-01" ref={sectionRef} className="relative" style={{ height: `${COUNT * 100}vh` }}>
      <div className="dt-viewport sticky top-0 flex flex-col overflow-hidden bg-paper">
        <TechnicalGrid showTicks />

        <div className="shell relative flex flex-1 flex-col justify-center py-8 sm:py-10">
          <ExperimentHeader index="01" eyebrow="PROCESS / 01" titleLines={['STRUCTURED', 'INTELLIGENCE']} className="mb-8 lg:mb-12" />

          <div className="grid flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,7ch)_1fr] lg:gap-16">
            <div className="relative h-24 sm:h-28 lg:h-40">
              {STRUCTURED_STAGES.map((s, i) => (
                <StageNumeral key={s.id} index={i} progress={scrollYProgress} label={s.number} />
              ))}
            </div>

            <div className="relative border-l border-ink/10 pl-8 lg:pl-14">
              <div className="absolute -left-px top-0 h-full w-px bg-ink/10">
                <motion.div className="w-full origin-top bg-ink" style={{ scaleY: scrollYProgress }} />
              </div>

              <ol className="flex flex-col gap-2.5">
                {STRUCTURED_STAGES.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span
                      className={clsx('h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300', i === active ? 'bg-accent' : 'bg-ink/15')}
                    />
                    <span
                      className={clsx(
                        'font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-300',
                        i === active ? 'text-ink' : 'text-muted/50',
                      )}
                    >
                      {s.number} — {s.name}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="relative mt-8 min-h-[7rem] max-w-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <TechnicalLabel>{stage.meta}</TechnicalLabel>
                    <h3 className="mt-3 font-display text-2xl text-ink sm:text-3xl">{stage.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{stage.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60 sm:mt-10">
            <span>SESSION 01 / MOTION SYSTEM</span>
            <span className="tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(COUNT).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
