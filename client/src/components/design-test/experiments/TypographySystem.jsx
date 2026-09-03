import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import DrawLine from '../primitives/DrawLine'
import MotionReveal from '../primitives/MotionReveal'
import TechnicalLabel from '../primitives/TechnicalLabel'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalGrid from '../primitives/TechnicalGrid'
import { centerTransform } from '../primitives/centerTransform'
import { TYPOGRAPHY_WORDS, KINETIC_WORDS, KINETIC_RESULTS } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

function KineticWord({ word, progress }) {
  const x = useTransform(progress, [0, 0.55, 0.88], [`${word.x}%`, `${word.x}%`, '50%'])
  const y = useTransform(progress, [0, 0.55, 0.88], [`${word.y}%`, `${word.y}%`, '50%'])
  const rotate = useTransform(progress, [0, 0.55, 0.85], [word.rotate, word.rotate, 0])
  const scale = useTransform(progress, [0.6, 0.9], [1, 0.4])
  const opacity = useTransform(progress, [0, 0.6, 0.85, 0.96], [1, 1, 1, 0])

  return (
    <motion.span
      style={{ left: x, top: y, rotate, scale, opacity }}
      transformTemplate={centerTransform}
      className="absolute whitespace-nowrap font-display text-lg text-ink/60 sm:text-xl lg:text-2xl"
    >
      {word.text}
    </motion.span>
  )
}

function KineticResult({ result, progress }) {
  const opacity = useTransform(progress, [0.78, 0.94], [0, 1])
  const y = useTransform(progress, [0.78, 0.94], [14, 0])

  return (
    <motion.div
      style={{ left: `${result.x}%`, opacity, y }}
      transformTemplate={centerTransform}
      className="absolute top-1/2 w-40 rounded-lg border border-ink/10 bg-card p-4 text-center shadow-soft sm:w-48"
    >
      <TechnicalLabel dot={false} className="justify-center">
        {result.label}
      </TechnicalLabel>
      <p className="mt-2 font-display text-sm text-ink sm:text-base">{result.text}</p>
    </motion.div>
  )
}

/**
 * Words become structure, demonstrated rather than described: transcript
 * fragments scatter across a bounded canvas, then — as the user scrolls —
 * drift toward center and resolve into the two structured results ATOOPV
 * would have extracted from them. Same convergence grammar as Experiment
 * 06's fragments-into-document, giving the two experiments a shared
 * visual vocabulary rather than two unrelated tricks.
 */
function KineticTranscript() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  return (
    <div ref={sectionRef} className="relative mt-20 sm:mt-28" style={{ height: '240vh' }}>
      <div className="sticky top-20 h-[26rem] overflow-hidden rounded-2xl border border-ink/10 bg-paper sm:h-[30rem] lg:top-24 lg:h-[34rem]">
        <TechnicalGrid />
        <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
          <TechnicalLabel dot={false}>TRANSCRIPTION → STRUCTURE</TechnicalLabel>
        </div>
        {KINETIC_WORDS.map((word) => (
          <KineticWord key={word.text} word={word} progress={scrollYProgress} />
        ))}
        {KINETIC_RESULTS.map((result) => (
          <KineticResult key={result.label} result={result} progress={scrollYProgress} />
        ))}
      </div>
    </div>
  )
}

/** Reduced-motion fallback: the same words and results, statically laid out. */
function KineticTranscriptStatic() {
  return (
    <div className="relative mt-20 rounded-2xl border border-ink/10 bg-paper p-7 sm:mt-28 sm:p-9">
      <TechnicalLabel dot={false} className="mb-6">
        TRANSCRIPTION → STRUCTURE
      </TechnicalLabel>
      <p className="max-w-xl font-display text-lg leading-relaxed text-ink/50 sm:text-xl">
        {KINETIC_WORDS.map((w) => w.text).join(' · ')}
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {KINETIC_RESULTS.map((result) => (
          <div key={result.label} className="rounded-lg border border-ink/10 bg-card p-4 text-center shadow-soft">
            <TechnicalLabel dot={false} className="justify-center">
              {result.label}
            </TechnicalLabel>
            <p className="mt-2 font-display text-base text-ink sm:text-lg">{result.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Typography as the visual event: the same system (ATOOPV, PV, a delivery
 * stat, three "fields") shown at wildly different scales, each revealed by
 * masking rather than fading. Nothing is skewed or cropped illegibly —
 * scale changes, readability doesn't.
 */
export default function TypographySystem() {
  const reduceMotion = useReducedMotion()
  return (
    // A single id spanning both pieces: the navigator's IntersectionObserver
    // tracks one element per experiment, and the kinetic block below lives
    // outside the inner <section> (see the comment above it), so without
    // this wrapper scrolling through that block reads as "between
    // experiments" and the navigator falls back to a stale active state.
    <div id="experiment-04">
      <section className="relative overflow-hidden border-t border-ink/10 bg-paper pt-24 sm:pt-32">
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

      {/* Outside the section on purpose: that section's `overflow-hidden`
          (needed to clip the bleeding watermark numeral above) breaks
          `position: sticky` for any descendant, since an ancestor with
          non-visible overflow becomes the sticky containing block instead
          of the viewport. Moving this sibling out keeps the pin working. */}
      <div className="shell relative bg-paper pb-24 sm:pb-32">
        {reduceMotion ? <KineticTranscriptStatic /> : <KineticTranscript />}
      </div>
    </div>
  )
}
