import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import TechnicalGrid from '../primitives/TechnicalGrid'
import DrawLine from '../primitives/DrawLine'
import MotionReveal from '../primitives/MotionReveal'
import { EDITORIAL_PROCESS_STAGES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]
const COUNT = EDITORIAL_PROCESS_STAGES.length

function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const onChange = () => setIsDesktop(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])
  return isDesktop
}

function ProcessRow({ stage }) {
  return (
    <div className="relative py-8 first:pt-0">
      <DrawLine axis="x" origin="left" duration={0.9} className="absolute left-0 top-0" />
      <div className="grid grid-cols-[3rem_1fr] gap-4 pt-8 sm:grid-cols-[4.5rem_1fr] sm:gap-8">
        <TechnicalLabel dot={false} className="pt-1 text-ink/35">
          {stage.number}
        </TechnicalLabel>
        <div>
          <MotionReveal>
            <h3 className="font-display text-xl leading-tight text-ink sm:text-2xl">{stage.title}</h3>
          </MotionReveal>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="mt-2 max-w-md text-sm leading-relaxed text-muted"
          >
            {stage.description}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

/**
 * The mobile/tablet/reduced-motion path: the original editorial two-column
 * document, unchanged. Proven, simple, and exactly what "final states,
 * minimal positional transitions" should look like under reduced motion.
 */
function VerticalEditorialProcess() {
  return (
    <section id="experiment-03" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ExperimentHeader
            index="03"
            eyebrow="EXPERIMENT / 03"
            titleLines={['THE PROCESS,', 'RECOMPOSED.']}
            titleClassName="text-4xl sm:text-5xl"
          />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            Cinq étapes, un seul document. Chaque ligne relie une décision de design à sa place dans le flux ATOOPV.
          </p>
        </div>

        <div>
          {EDITORIAL_PROCESS_STAGES.map((stage) => (
            <ProcessRow key={stage.number} stage={stage} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HorizontalStagePanel({ stage }) {
  return (
    <div className="flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-10 lg:px-24">
      <TechnicalLabel dot={false}>
        {stage.number} / {String(COUNT).padStart(2, '0')}
      </TechnicalLabel>
      <h3 className="mt-5 max-w-2xl font-display text-4xl leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {stage.title}
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{stage.description}</p>
      <DrawLine axis="x" origin="left" duration={0.8} className="mt-8 max-w-[10rem]" />
    </div>
  )
}

/**
 * The desktop path: one controlled horizontal-motion moment (brief §8).
 * Vertical scroll drives a pinned track sideways through the five stages —
 * distinct from Experiment 01's recomposing canvas and Experiment 05's
 * hover accordion, so it earns its place rather than repeating either.
 */
function HorizontalProcessTrack() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  // Each panel is exactly `100vw` (w-screen); a `%` translate would resolve
  // against the track's own (5x) width and wildly overshoot, so this must
  // be expressed in `vw` to move by exactly one panel-width per stage.
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(COUNT - 1) * 100}vw`])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(COUNT - 1, Math.max(0, Math.round(v * (COUNT - 1))))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  return (
    <section id="experiment-03" ref={sectionRef} className="relative border-t border-ink/10 bg-paper" style={{ height: `${COUNT * 85}vh` }}>
      <div className="dt-viewport sticky top-0 flex flex-col overflow-hidden">
        <TechnicalGrid showTicks />

        <div className="shell relative pt-8 sm:pt-10">
          <ExperimentHeader index="03" eyebrow="EXPERIMENT / 03" titleLines={['THE PROCESS,', 'RECOMPOSED.']} />
        </div>

        <div className="relative flex flex-1 items-center overflow-hidden">
          <motion.div className="flex h-full" style={{ x }}>
            {EDITORIAL_PROCESS_STAGES.map((stage) => (
              <HorizontalStagePanel key={stage.number} stage={stage} />
            ))}
          </motion.div>
        </div>

        <div className="shell relative flex items-center justify-center gap-3 pb-8 sm:pb-10">
          {EDITORIAL_PROCESS_STAGES.map((stage, i) => (
            <span
              key={stage.number}
              className={clsx('h-1.5 w-1.5 rounded-full transition-colors duration-300', i === active ? 'bg-accent' : 'bg-ink/15')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function EditorialProcess() {
  const isDesktop = useIsDesktop()
  const reduceMotion = useReducedMotion()
  return isDesktop && !reduceMotion ? <HorizontalProcessTrack /> : <VerticalEditorialProcess />
}
