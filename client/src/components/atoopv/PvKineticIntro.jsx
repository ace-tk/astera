import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import DrawLine from '@/components/design-test/primitives/DrawLine'
import MotionReveal from '@/components/design-test/primitives/MotionReveal'
import TechnicalLabel from '@/components/design-test/primitives/TechnicalLabel'
import SectionNumber from '@/components/design-test/primitives/SectionNumber'
import { centerTransform } from '@/components/design-test/primitives/centerTransform'

/**
 * Kinetic brand intro for the "Rédaction PV CSE" page — the same motion
 * system as the Design Lab's Experiment 04 (Typographic System), rebuilt
 * here with this page's own real content instead of the lab's generic demo
 * copy: the hero's own eyebrow/lead, the real "48 à 72h" delivery stat, and
 * three of the page's own instance-ticker words as the closing fields.
 * Experiment 04 itself (src/components/design-test/experiments/
 * TypographySystem.jsx) is untouched -- this is a separate component so the
 * lab keeps rendering its own demo content exactly as before.
 */
const WORDS = { brand: 'AtooPV', document: 'PV' }

const DOCUMENT_CAPTION = 'PROCÈS-VERBAL / Un PV fidèle, conforme et opposable, livré pendant que la réunion est encore fraîche.'
const STAT = '48–72H'
const STAT_CAPTION = 'DÉLAI DE LIVRAISON'
const FIELDS = [
  { word: 'CSE', caption: 'INSTANCE / 01' },
  { word: 'CSSCT', caption: 'INSTANCE / 02' },
  { word: 'CÉCO', caption: 'INSTANCE / 03' },
]

// Real vocabulary pulled from this page's own hero/body copy, scattered
// then resolved -- same geometry (x/y/rotate) as Experiment 04's word set,
// only the words themselves are this page's, not the lab's demo transcript.
const KINETIC_WORDS = [
  { text: 'preuve', x: 12, y: 20, rotate: -6 },
  { text: 'vote', x: 78, y: 14, rotate: 5 },
  { text: 'réserve', x: 46, y: 8, rotate: -3 },
  { text: 'secrétaire', x: 8, y: 62, rotate: 4 },
  { text: 'conforme', x: 84, y: 58, rotate: -5 },
  { text: 'opposable', x: 30, y: 80, rotate: 6 },
  { text: 'fidèle', x: 62, y: 78, rotate: -4 },
  { text: 'avis', x: 20, y: 42, rotate: 3 },
  { text: 'délibération', x: 68, y: 36, rotate: -2 },
]

const KINETIC_RESULTS = [
  { label: 'FIDÉLITÉ', text: 'Retranscrire sans trahir.', x: 32 },
  { label: 'DÉLAI', text: 'Livré sous 48 à 72h.', x: 68 },
]

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

function KineticTranscript() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  return (
    <div ref={sectionRef} className="relative mt-20 sm:mt-28" style={{ height: '240vh' }}>
      <div className="sticky top-20 h-[26rem] overflow-hidden rounded-2xl border border-ink/10 bg-paper sm:h-[30rem] lg:top-24 lg:h-[34rem]">
        <div
          className="pointer-events-none absolute inset-0 mask-fade-b"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(var(--line) / 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line) / 0.055) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden="true"
        />
        <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
          <TechnicalLabel dot={false}>PREUVE → DOCUMENT</TechnicalLabel>
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

function KineticTranscriptStatic() {
  return (
    <div className="relative mt-20 rounded-2xl border border-ink/10 bg-paper p-7 sm:mt-28 sm:p-9">
      <TechnicalLabel dot={false} className="mb-6">
        PREUVE → DOCUMENT
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

export default function PvKineticIntro() {
  const reduceMotion = useReducedMotion()
  return (
    // No `overflow-hidden` on this outer wrapper -- only the <section> below
    // needs it (to clip the bleeding watermark numeral), and the sticky
    // kinetic transcript block must sit outside any overflow-hidden
    // ancestor or `position: sticky` breaks (see KineticTranscript below).
    <div className="relative bg-paper">
      <section className="relative overflow-hidden pt-16 sm:pt-20">
        <span
          className="pointer-events-none absolute -left-6 top-8 select-none font-display text-[16rem] leading-none text-ink/[0.03] sm:text-[22rem]"
          aria-hidden="true"
        >
          01
        </span>

        <div className="shell relative">
          <header className="relative mb-16 sm:mb-24">
            <div className="flex items-end justify-between gap-6">
              <SectionNumber value="01" size="lg" />
              <TechnicalLabel className="mb-2 hidden sm:inline-flex">SERVICE PHARE — DEPUIS 2017</TechnicalLabel>
            </div>
            <h2 className="mt-4 font-display leading-[0.96] tracking-tight text-ink text-display-sm sm:text-display">
              {['RÉDACTION DU PV', 'DE CSE.'].map((line, i) => (
                <MotionReveal key={line} delay={i * 0.08}>
                  <span className="block">{line}</span>
                </MotionReveal>
              ))}
            </h2>
          </header>

          <MotionReveal duration={1.1} className="border-b border-ink/10 pb-4">
            <h3 className="font-display text-[16vw] leading-[0.85] tracking-tight text-ink sm:text-[13vw] lg:text-[10vw]">{WORDS.brand}</h3>
          </MotionReveal>

          <div className="mt-14 grid grid-cols-1 items-end gap-8 border-b border-ink/10 pb-14 sm:mt-20 sm:pb-20 lg:grid-cols-[auto_1fr] lg:gap-16">
            <div className="relative">
              <DrawLine axis="x" origin="left" duration={1} className="absolute bottom-[0.22em] left-0 -z-10 w-[120%]" />
              <MotionReveal duration={1}>
                <span className="font-display text-[9rem] leading-none text-ink sm:text-[11rem] lg:text-[13rem]">{WORDS.document}</span>
              </MotionReveal>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-sm"
            >
              <TechnicalLabel dot={false}>{DOCUMENT_CAPTION}</TechnicalLabel>
            </motion.div>
          </div>

          <div className="mt-14 flex flex-col gap-4 sm:mt-20 sm:flex-row sm:items-baseline sm:justify-between">
            <MotionReveal duration={1}>
              <span className="font-display text-6xl tracking-tight text-accent sm:text-7xl lg:text-8xl">{STAT}</span>
            </MotionReveal>
            <TechnicalLabel dot={false} className="sm:pb-2">
              {STAT_CAPTION}
            </TechnicalLabel>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-10 border-t border-ink/10 pt-10 sm:mt-24 sm:grid-cols-3 sm:gap-6 sm:pt-14">
            {FIELDS.map((field, i) => (
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

      <div className="shell relative bg-paper pb-16 sm:pb-20">{reduceMotion ? <KineticTranscriptStatic /> : <KineticTranscript />}</div>
    </div>
  )
}
