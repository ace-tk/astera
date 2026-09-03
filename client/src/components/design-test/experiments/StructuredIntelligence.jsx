import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import TechnicalGrid from '../primitives/TechnicalGrid'
import TechnicalLabel from '../primitives/TechnicalLabel'
import ExperimentHeader from '../primitives/ExperimentHeader'
import { STRUCTURED_STAGES } from '@/constants/designTest'

const COUNT = STRUCTURED_STAGES.length
const EASE = [0.16, 1, 0.3, 1]
const SLOT_TRANSITION = { duration: 0.7, ease: EASE }

/**
 * A single stacked numeral. All five stack in the same slot; scroll
 * position drives opacity/scale/y for each via its own motion-value
 * transform, so the "active number dominates, neighbours recede" crossfade
 * is pure transform/opacity math — no per-frame React state. Under reduced
 * motion the scale/y travel collapses to a plain crossfade.
 */
function StageNumeral({ index, progress, label, reduceMotion }) {
  const seg = 1 / COUNT
  const center = index * seg + seg / 2
  const opacity = useTransform(progress, [center - seg, center - seg * 0.35, center, center + seg * 0.35, center + seg], [0.12, 0.12, 1, 0.12, 0.12])
  const rawScale = useTransform(progress, [center - seg, center, center + seg], [0.8, 1, 0.8])
  const rawY = useTransform(progress, [center - seg, center, center + seg], [28, 0, -28])
  const scale = reduceMotion ? 1 : rawScale
  const y = reduceMotion ? 0 : rawY

  return (
    <motion.span
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex items-center font-display text-[4.5rem] leading-none text-ink sm:text-[6rem] lg:text-[7.5rem] xl:text-[9rem]"
    >
      {label}
    </motion.span>
  )
}

/** One tick of the fixed bottom tracker — the "coordinate system" that stays
 * put while the numeral/content pair travel across the canvas above it. */
function TrackerTick({ index, progress, isActive, label, isLast }) {
  const fill = useTransform(progress, [index / COUNT, (index + 1) / COUNT], [0, 1])
  return (
    <div className="flex flex-1 items-center gap-2 sm:flex-none">
      <span className={clsx('shrink-0 tabular-nums transition-colors duration-300', isActive ? 'text-ink' : 'text-muted/40')}>{label}</span>
      {!isLast && (
        <span className="relative h-px flex-1 bg-ink/10 sm:w-8 sm:flex-none">
          <motion.span className="absolute inset-y-0 left-0 w-full origin-left bg-ink" style={{ scaleX: fill }} />
        </span>
      )}
    </div>
  )
}

export default function StructuredIntelligence() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const headerScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const headerOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.62])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(COUNT - 1, Math.max(0, Math.floor(v * COUNT)))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  const stage = STRUCTURED_STAGES[active]
  const { layout } = stage

  return (
    <section id="experiment-01" ref={sectionRef} className="relative" style={{ height: `${COUNT * 100}vh` }}>
      <div className="dt-viewport sticky top-0 flex flex-col overflow-hidden bg-paper">
        <TechnicalGrid showTicks />

        <div className="shell relative flex flex-1 flex-col py-8 sm:py-10">
          <motion.div
            style={reduceMotion ? undefined : { scale: headerScale, opacity: headerOpacity }}
            className="origin-top-left"
          >
            <ExperimentHeader index="01" eyebrow="PROCESS / 01" titleLines={['STRUCTURED', 'INTELLIGENCE']} className="mb-6 lg:mb-8" />
          </motion.div>

          {/* The recomposing canvas: on lg+, the numeral and content slots are
              absolutely positioned and travel between each stage's coordinate
              (see STRUCTURED_STAGES[].layout in constants/designTest.js).
              Below lg — and always under reduced motion — they stay in normal
              document flow, stacked and stationary. */}
          <div className="relative min-h-0 flex-1 lg:min-h-[26rem]">
            <motion.div
              animate={reduceMotion ? { scale: layout.scale } : { left: `${layout.numX}%`, top: `${layout.numY}%`, scale: layout.scale }}
              transition={SLOT_TRANSITION}
              className={clsx('relative h-20 w-full sm:h-24', !reduceMotion && 'lg:absolute lg:h-32 lg:w-[6ch] xl:h-40')}
              style={{ transformOrigin: 'left center' }}
            >
              {STRUCTURED_STAGES.map((s, i) => (
                <StageNumeral key={s.id} index={i} progress={scrollYProgress} label={s.number} reduceMotion={reduceMotion} />
              ))}
            </motion.div>

            <motion.div
              animate={reduceMotion ? {} : { left: `${layout.contentX}%`, top: `${layout.contentY}%` }}
              transition={{ ...SLOT_TRANSITION, delay: 0.05 }}
              className={clsx('relative mt-6 lg:mt-0', !reduceMotion && 'lg:absolute')}
              style={!reduceMotion ? { '--content-w': layout.width } : undefined}
            >
              <div className={clsx('relative min-h-[9rem] w-full', !reduceMotion && 'lg:w-[var(--content-w)]')}>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.12, ease: 'easeIn' } }}
                    className="absolute inset-0"
                  >
                    <TechnicalLabel>{stage.meta}</TechnicalLabel>
                    <h3 className="mt-3 font-display text-3xl text-ink sm:text-4xl lg:text-5xl">{stage.name}</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">{stage.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60 sm:mt-8">
            <span className="hidden shrink-0 sm:inline">SESSION 01 / MOTION SYSTEM</span>
            <div className="flex flex-1 items-center gap-2 sm:flex-none sm:gap-3">
              {STRUCTURED_STAGES.map((s, i) => (
                <TrackerTick key={s.id} index={i} progress={scrollYProgress} isActive={i === active} label={s.number} isLast={i === COUNT - 1} />
              ))}
            </div>
            <span className="shrink-0 tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(COUNT).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
