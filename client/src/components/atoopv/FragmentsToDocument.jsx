import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import SectionNumber from '@/components/design-test/primitives/SectionNumber'
import TechnicalLabel from '@/components/design-test/primitives/TechnicalLabel'
import TechnicalGrid from '@/components/design-test/primitives/TechnicalGrid'
import MotionReveal from '@/components/design-test/primitives/MotionReveal'
import { centerTransform } from '@/components/design-test/primitives/centerTransform'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Production version of the Design Lab's Experiment 06 ("Connected
 * Document") motion system: real page content fragments scatter, spread
 * into a readable layout, cluster, then converge into an assembled document
 * card built from that same content. The lab's own ConnectedDocument.jsx
 * (src/components/design-test/experiments/) is untouched and keeps its own
 * demo "PROCÈS-VERBAL"/fragment content exactly as before -- this is a
 * separate, content-driven component so pages outside the lab (Formation
 * économique, Communication) can reuse the same visual/motion system with
 * their own real copy instead.
 *
 * Every piece of copy is a prop -- nothing here is hard-coded content, only
 * the choreography. `fragments` support a `kind` of 'quote' (dialogue,
 * shown in guillemets), 'tag' (a short compact label) or 'topic' (a real
 * heading/phrase from the source page -- same width as 'quote' so a full
 * sentence fits, but rendered plainly, no guillemets, since it's a heading
 * being quoted verbatim, not something someone said).
 */
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

const CP = [0, 0.04, 0.28, 0.68, 0.84, 1]
const posSeg = (stacked, readable, organized, converge) => [stacked, stacked, readable, readable, organized, converge].map((v) => `${v}%`)
const rotSeg = (stacked, readable) => [stacked, stacked, readable, readable, 0, 0]
const SCALE_SEG = [0.94, 0.94, 1.04, 1.04, 1, 0.34]
const FRAGMENT_OPACITY_CP = [0, 0.84, 0.96, 1]
const FRAGMENT_OPACITY_OUT = [1, 1, 0, 0]
const LABEL_WINDOW = [0.46, 0.54, 0.8, 0.88]
const IN_OUT = [0, 1, 1, 0]

const FRAGMENT_WIDTH = {
  quote: 'w-[15rem] sm:w-[16rem] lg:w-[21rem]',
  topic: 'w-[15rem] sm:w-[16rem] lg:w-[21rem]',
  tag: 'w-[11rem] sm:w-[11.5rem] lg:w-[14.5rem]',
}

const TRUNCATE_MOBILE = 'overflow-hidden text-ellipsis whitespace-nowrap sm:overflow-visible sm:whitespace-normal'

function Fragment({ fragment, progress, isDesktop }) {
  const readable = isDesktop ? fragment.readable : fragment.readableMobile
  const organized = isDesktop ? fragment.organized : readable

  const x = useTransform(progress, CP, posSeg(fragment.stacked.x, readable.x, organized.x, fragment.converge.x))
  const y = useTransform(progress, CP, posSeg(fragment.stacked.y, readable.y, organized.y, fragment.converge.y))
  const rotate = useTransform(progress, CP, rotSeg(fragment.stacked.rotate, readable.rotate))
  const scale = useTransform(progress, CP, SCALE_SEG)
  const opacity = useTransform(progress, FRAGMENT_OPACITY_CP, FRAGMENT_OPACITY_OUT)
  const tagOpacity = useTransform(progress, LABEL_WINDOW, IN_OUT)

  const isQuote = fragment.kind === 'quote'
  const isCompact = fragment.kind === 'tag'

  return (
    <motion.div
      style={{ left: x, top: y, rotate, scale, opacity }}
      transformTemplate={centerTransform}
      className={`absolute rounded-lg border border-ink/10 bg-card p-3 shadow-soft sm:p-4 ${FRAGMENT_WIDTH[fragment.kind]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50 sm:text-[11px]">{fragment.role}</span>
        <motion.span
          style={{ opacity: tagOpacity }}
          className="shrink-0 rounded-full border border-accent/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-accent"
        >
          {fragment.tag}
        </motion.span>
      </div>
      <p
        className={
          isCompact
            ? `mt-2 font-display text-base text-ink sm:mt-2.5 sm:text-xl lg:text-2xl ${TRUNCATE_MOBILE}`
            : `mt-2 text-sm leading-snug text-ink sm:mt-2.5 sm:text-base lg:text-lg ${isQuote ? 'italic' : ''} ${TRUNCATE_MOBILE}`
        }
      >
        {isQuote ? `« ${fragment.text} »` : fragment.text}
      </p>
    </motion.div>
  )
}

function LinkLine({ from, to, progress }) {
  const opacity = useTransform(progress, LABEL_WINDOW, IN_OUT)
  return (
    <motion.line
      x1={from.readable.x}
      y1={from.readable.y}
      x2={to.readable.x}
      y2={to.readable.y}
      stroke="rgb(var(--accent) / 0.4)"
      strokeWidth={0.25}
      vectorEffect="non-scaling-stroke"
      style={{ opacity }}
    />
  )
}

function DocumentRow({ label, text, index, progress }) {
  const start = 0.87 + index * 0.025
  const opacity = useTransform(progress, [start, start + 0.03], [0, 1])
  const y = useTransform(progress, [start, start + 0.03], [8, 0])
  return (
    <motion.div style={{ opacity, y }} className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:text-[11px]">{label}</span>
      <span className="text-right font-display text-sm text-ink sm:text-base lg:text-lg">{text}</span>
    </motion.div>
  )
}

function AnnotationRow({ label, index, progress }) {
  const start = 0.955 + index * 0.011
  const opacity = useTransform(progress, [start, start + 0.011], [0, 1])
  const x = useTransform(progress, [start, start + 0.011], [-8, 0])
  return (
    <motion.div style={{ opacity, x }} className="flex items-center gap-2 font-mono text-[11px] text-muted">
      <span className="text-emerald">✓</span> {label}
    </motion.div>
  )
}

function RegistrationMark({ className }) {
  return <span className={`absolute h-2.5 w-2.5 border-ink/25 ${className}`} aria-hidden="true" />
}

function DocumentReveal({ progress, documentLabel, documentRows, annotations, documentMeta }) {
  const scale = useTransform(progress, [0.84, 0.96], [0.32, 1])
  const opacity = useTransform(progress, [0.84, 0.9], [0, 1])
  return (
    <motion.div
      style={{ scale, opacity }}
      transformTemplate={centerTransform}
      className="absolute left-1/2 top-1/2 w-[min(92%,27rem)] sm:w-[min(82%,34rem)] lg:w-[40rem]"
    >
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border border-ink/10 bg-card/70" aria-hidden="true" />

      <div className="relative rounded-xl border border-ink/10 bg-card p-6 shadow-float sm:p-7 lg:p-9">
        <RegistrationMark className="left-2 top-2 border-l border-t" />
        <RegistrationMark className="right-2 top-2 border-r border-t" />
        <RegistrationMark className="bottom-2 left-2 border-b border-l" />
        <RegistrationMark className="bottom-2 right-2 border-b border-r" />

        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <TechnicalLabel dot={false}>{documentLabel}</TechnicalLabel>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
        </div>
        <div className="mt-2 divide-y divide-ink/10">
          {documentRows.map((row, i) => (
            <DocumentRow key={row.label} label={row.label} text={row.text} index={i} progress={progress} />
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4">
          {annotations.map((label, i) => (
            <AnnotationRow key={label} label={label} index={i} progress={progress} />
          ))}
        </div>
        {documentMeta && (
          <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted/50">
            <span>{documentMeta}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const PHASE_THRESHOLDS = [0.04, 0.28, 0.48, 0.68, 0.84]

function FragmentsScroll({ eyebrow, titleLines, fragments, links, phases, documentLabel, documentRows, annotations, documentMeta, statement }) {
  const sectionRef = useRef(null)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const isDesktop = useIsDesktop()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = PHASE_THRESHOLDS.filter((t) => v >= t).length
    setPhaseIndex((prev) => (prev === idx ? prev : idx))
  })

  return (
    <>
      <section ref={sectionRef} className="relative" style={{ height: '440vh' }}>
        <div className="dt-viewport sticky top-0 flex flex-col overflow-hidden bg-paper">
          <TechnicalGrid showTicks />

          <div className="shell relative flex flex-1 flex-col py-8 sm:py-10">
            <header className="relative mb-6 lg:mb-8">
              <div className="flex items-end justify-between gap-6">
                <SectionNumber value="01" size="lg" />
                {eyebrow && <TechnicalLabel className="mb-2 hidden sm:inline-flex">{eyebrow}</TechnicalLabel>}
              </div>
              <h2 className="mt-4 font-display leading-[0.96] tracking-tight text-ink text-display-sm sm:text-display">
                {titleLines.map((line, i) => (
                  <MotionReveal key={line} delay={i * 0.08}>
                    <span className="block">{line}</span>
                  </MotionReveal>
                ))}
              </h2>
            </header>

            <div className="relative min-h-[24rem] flex-1 overflow-hidden lg:min-h-[32rem]">
              {isDesktop && links.length > 0 && (
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {links.map(([fromId, toId]) => {
                    const from = fragments.find((f) => f.id === fromId)
                    const to = fragments.find((f) => f.id === toId)
                    return from && to ? <LinkLine key={`${fromId}-${toId}`} from={from} to={to} progress={scrollYProgress} /> : null
                  })}
                </svg>
              )}

              {fragments.map((fragment) => (
                <Fragment key={fragment.id} fragment={fragment} progress={scrollYProgress} isDesktop={isDesktop} />
              ))}

              <DocumentReveal progress={scrollYProgress} documentLabel={documentLabel} documentRows={documentRows} annotations={annotations} documentMeta={documentMeta} />
            </div>

            <div className="mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60 sm:mt-8">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phases[phaseIndex]}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.3 }}
                >
                  {phases[phaseIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <div className="shell relative border-t border-ink/10 bg-paper py-16 text-center sm:py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-lg font-display text-2xl leading-snug text-ink sm:text-3xl"
        >
          {statement.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </motion.p>
      </div>
    </>
  )
}

function FragmentsStatic({ eyebrow, titleLines, fragments, groups, documentLabel, documentRows, annotations, statement }) {
  return (
    <section className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <header className="relative mb-14 sm:mb-20">
          <div className="flex items-end justify-between gap-6">
            <SectionNumber value="01" size="lg" />
            {eyebrow && <TechnicalLabel className="mb-2 hidden sm:inline-flex">{eyebrow}</TechnicalLabel>}
          </div>
          <h2 className="mt-4 font-display leading-[0.96] tracking-tight text-ink text-display-sm sm:text-display">
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id}>
              <TechnicalLabel dot={false} className="mb-3">
                {group.label}
              </TechnicalLabel>
              <div className="flex flex-col gap-3">
                {fragments
                  .filter((f) => f.group === group.id)
                  .map((f) => (
                    <div key={f.id} className="rounded-lg border border-ink/10 bg-card p-4 shadow-soft">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">{f.role}</span>
                        <span className="rounded-full border border-accent/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-accent">
                          {f.tag}
                        </span>
                      </div>
                      <p className={f.kind === 'tag' ? 'mt-2 font-display text-base text-ink' : 'mt-2 text-sm leading-snug text-ink'}>
                        {f.kind === 'quote' ? `« ${f.text} »` : f.text}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-lg rounded-xl border border-ink/10 bg-card p-6 shadow-soft sm:mt-20">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <TechnicalLabel dot={false}>{documentLabel}</TechnicalLabel>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          </div>
          <div className="mt-2 divide-y divide-ink/10">
            {documentRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:text-[11px]">{row.label}</span>
                <span className="text-right font-display text-sm text-ink sm:text-base lg:text-lg">{row.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4">
            {annotations.map((label) => (
              <div key={label} className="flex items-center gap-2 font-mono text-[11px] text-muted">
                <span className="text-emerald">✓</span> {label}
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-14 max-w-lg text-center font-display text-2xl leading-snug text-ink sm:text-3xl">
          {statement.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

export default function FragmentsToDocument({
  eyebrow,
  titleLines,
  fragments,
  groups,
  links = [],
  phases,
  documentLabel,
  documentRows,
  annotations,
  documentMeta,
  statement,
}) {
  const reduceMotion = useReducedMotion()
  const props = { eyebrow, titleLines, fragments, groups, links, phases, documentLabel, documentRows, annotations, documentMeta, statement }
  return reduceMotion ? <FragmentsStatic {...props} /> : <FragmentsScroll {...props} />
}
