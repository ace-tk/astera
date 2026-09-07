import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import clsx from 'clsx'
import { HOMEPAGE_PROCESS } from '@/constants/atoopvHome'

const EASE = [0.16, 1, 0.3, 1]

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

/** The faint technical grid shared by both new editorial sections — same
 * recipe as the Design Lab's TechnicalGrid, reproduced locally (not
 * imported from design-test) since `--line` is a global theme token and
 * this is production code that shouldn't depend on the sandbox. */
function TechnicalGrid({ size = 56 }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgb(var(--line) / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line) / 0.06) 1px, transparent 1px)',
        backgroundSize: `${size}px ${size}px`,
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Mask reveal for the headline: the outer span stays in normal flow,
 * untransformed, and always fully visible, so IntersectionObserver
 * (`whileInView`) can reliably see it and fire — the inner span is the one
 * that actually translates from below into place. Collapsing these into one
 * element (animating `y` on the same node that also clips via
 * `overflow-hidden`) would just slide the whole box into position with no
 * masking at all, since overflow only clips a node's children, never the
 * node's own rendered position.
 */
function SectionHeading({ eyebrow, heading, reveal = true }) {
  return (
    <div>
      <motion.span
        initial={reveal ? { opacity: 0, y: 8 } : false}
        whileInView={reveal ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
      >
        {eyebrow}
      </motion.span>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {heading.map((line, i) => (
          <span key={line} className="block overflow-hidden">
            <motion.span
              initial={reveal ? { y: '100%' } : false}
              whileInView={reveal ? { y: '0%' } : undefined}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
              className="block"
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h2>
    </div>
  )
}

function StageRow({ stage }) {
  return (
    <div className="relative py-7 first:pt-0">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ transformOrigin: 'left' }}
        className="absolute left-0 top-0 h-px w-full bg-ink/10"
        aria-hidden="true"
      />
      <div className="grid grid-cols-[3rem_1fr] gap-4 pt-7 sm:grid-cols-[4.5rem_1fr] sm:gap-8">
        <span className="pt-1 font-mono text-xs text-ink/35">{stage.number}</span>
        <div>
          <h3 className="font-display text-xl leading-tight text-ink sm:text-2xl">{stage.title}</h3>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-2 max-w-md text-sm leading-relaxed text-muted"
          >
            {stage.description}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

/** Mobile/tablet/reduced-motion path: the same content in normal document
 * flow, no pin, no horizontal drive — the storytelling comes from reading
 * order rather than scroll choreography. */
function VerticalProcess({ data }) {
  return (
    <section className="relative overflow-hidden border-t border-ink/10 bg-paper py-20 sm:py-28">
      <TechnicalGrid />
      <div className="shell relative grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
        </div>
        <div>
          {data.stages.map((s) => (
            <StageRow key={s.number} stage={s} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HorizontalStagePanel({ stage, count }) {
  return (
    <div className="flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-10 lg:px-24">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        {stage.number} / {String(count).padStart(2, '0')}
      </span>
      <h3 className="mt-5 max-w-2xl font-display text-4xl leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-6xl">{stage.title}</h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{stage.description}</p>
      <div className="mt-8 h-px w-32 bg-ink/20" aria-hidden="true" />
    </div>
  )
}

/** Desktop path: vertical scroll drives a pinned track sideways through the
 * stages, exactly the "process being constructed" feeling from the
 * reference — ported from the Design Lab's proven Editorial Process
 * mechanic (useScroll + a `vw`-based x transform, not `%`, since panels are
 * `w-screen` and a `%` translate would resolve against the track's own
 * multiplied width). */
function HorizontalProcess({ data }) {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const count = data.stages.length
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(count - 1) * 100}vw`])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(count - 1, Math.max(0, Math.round(v * (count - 1))))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  return (
    <section ref={sectionRef} className="relative border-t border-ink/10 bg-paper" style={{ height: `${count * 85}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-20">
        <TechnicalGrid />

        <div className="shell relative">
          <SectionHeading eyebrow={data.eyebrow} heading={data.heading} reveal={false} />
        </div>

        <div className="relative mt-8 flex flex-1 items-center overflow-hidden">
          <motion.div className="flex h-full" style={{ x }}>
            {data.stages.map((stage) => (
              <HorizontalStagePanel key={stage.number} stage={stage} count={count} />
            ))}
          </motion.div>
        </div>

        <div className="shell relative flex items-center justify-center gap-3 pb-10">
          {data.stages.map((stage, i) => (
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

/**
 * "THE PROCESS, RECOMPOSED." — new ATOOPV homepage section. Desktop pins a
 * horizontal track through each stage as the user scrolls; mobile, tablet,
 * and reduced-motion get the same content as a normal vertical, two-column
 * editorial list. All copy comes from `data` (default `HOMEPAGE_PROCESS`,
 * explicitly placeholder) — nothing here is hardcoded from the reference.
 */
export default function ProcessRecomposed({ data = HOMEPAGE_PROCESS }) {
  const isDesktop = useIsDesktop(1024)
  const reduceMotion = useReducedMotion()
  return isDesktop && !reduceMotion ? <HorizontalProcess data={data} /> : <VerticalProcess data={data} />
}
