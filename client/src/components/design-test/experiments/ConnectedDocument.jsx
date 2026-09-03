import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import TechnicalGrid from '../primitives/TechnicalGrid'
import {
  CONNECTED_FRAGMENTS,
  CONNECTED_GROUPS,
  CONNECTED_LINKS,
  CONNECTED_PHASES,
  CONNECTED_ANNOTATIONS,
  CONNECTED_STATEMENT,
} from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

// Shared timeline: A (scatter, 0–0.42) → B (labels/links fade over the tail
// of A) → C (0.42–0.68 move to grouped columns, hold to 0.78) → D (0.78–1
// converge into the document). Every motion value below reads off this same
// clock, so the whole scene stays perfectly in sync as one continuous
// scroll-driven transform — no per-fragment React state.
const CP = [0, 0.22, 0.42, 0.68, 0.78, 1]
const posSeg = (scatter, grouped, center) => [scatter, scatter, scatter, grouped, grouped, center].map((v) => `${v}%`)
const rotSeg = (scatter) => [scatter, scatter, scatter, 0, 0, 0]
const SCALE_SEG = [1, 1, 1, 1, 1, 0.32]
const FRAGMENT_OPACITY_CP = [0, 0.78, 0.95, 1]
const FRAGMENT_OPACITY_OUT = [1, 1, 0, 0]
const LABEL_WINDOW = [0.18, 0.3, 0.38, 0.44]
const GROUP_WINDOW = [0.62, 0.72, 0.9, 0.98]
const IN_OUT = [0, 1, 1, 0]

// Framer Motion owns the whole `transform` property once any of its
// transform props (rotate, scale, x, y…) are animated via `style` — it
// silently drops Tailwind's `-translate-x/y-1/2` centering classes rather
// than composing with them. `transformTemplate` is the documented way to
// fold that centering back into Framer's own generated transform string.
const centerTransform = (_props, generated) => `translate(-50%, -50%) ${generated}`

function Fragment({ fragment, progress }) {
  const x = useTransform(progress, CP, posSeg(fragment.scatter.x, fragment.grouped.x, 50))
  const y = useTransform(progress, CP, posSeg(fragment.scatter.y, fragment.grouped.y, 50))
  const rotate = useTransform(progress, CP, rotSeg(fragment.scatter.rotate))
  const scale = useTransform(progress, CP, SCALE_SEG)
  const opacity = useTransform(progress, FRAGMENT_OPACITY_CP, FRAGMENT_OPACITY_OUT)
  const tagOpacity = useTransform(progress, LABEL_WINDOW, IN_OUT)

  return (
    <motion.div
      style={{ left: x, top: y, rotate, scale, opacity }}
      transformTemplate={centerTransform}
      className="absolute w-32 rounded-lg border border-ink/10 bg-card p-3 shadow-soft sm:w-52 sm:p-4 lg:w-56"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">{fragment.role}</span>
        <motion.span
          style={{ opacity: tagOpacity }}
          className="rounded-full border border-accent/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-accent"
        >
          {fragment.tag}
        </motion.span>
      </div>
      <p
        className={
          fragment.kind === 'quote'
            ? 'mt-2 text-sm italic leading-snug text-ink sm:text-base'
            : 'mt-2 font-display text-lg text-ink sm:text-xl'
        }
      >
        {fragment.kind === 'quote' ? `« ${fragment.text} »` : fragment.text}
      </p>
    </motion.div>
  )
}

function LinkLine({ from, to, progress }) {
  const opacity = useTransform(progress, LABEL_WINDOW, IN_OUT)
  return (
    <motion.line
      x1={from.scatter.x}
      y1={from.scatter.y}
      x2={to.scatter.x}
      y2={to.scatter.y}
      stroke="rgb(var(--accent) / 0.4)"
      strokeWidth={0.25}
      vectorEffect="non-scaling-stroke"
      style={{ opacity }}
    />
  )
}

function GroupHeader({ group, progress }) {
  const opacity = useTransform(progress, GROUP_WINDOW, IN_OUT)
  return (
    <motion.div style={{ left: `${group.x}%`, opacity }} className="absolute top-[6%] -translate-x-1/2 text-center">
      <TechnicalLabel dot={false}>{group.label}</TechnicalLabel>
    </motion.div>
  )
}

function AnnotationRow({ label, index, progress }) {
  const start = 0.88 + index * 0.03
  const opacity = useTransform(progress, [start, start + 0.03], [0, 1])
  const x = useTransform(progress, [start, start + 0.03], [-8, 0])
  return (
    <motion.div style={{ opacity, x }} className="flex items-center gap-2 font-mono text-[11px] text-muted">
      <span className="text-emerald">✓</span> {label}
    </motion.div>
  )
}

function DocumentReveal({ progress }) {
  const scale = useTransform(progress, [0.76, 0.95], [0.35, 1])
  const opacity = useTransform(progress, [0.76, 0.9], [0, 1])
  return (
    <motion.div
      style={{ scale, opacity }}
      transformTemplate={centerTransform}
      className="absolute left-1/2 top-1/2 w-[min(92%,25rem)] rounded-xl border border-ink/10 bg-card p-6 shadow-float sm:w-[min(78%,30rem)] sm:p-7 lg:w-[34rem] lg:p-8"
    >
      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
        <TechnicalLabel dot={false}>PROCÈS-VERBAL</TechnicalLabel>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-2.5 w-3/4 rounded-full bg-ink/10" />
        <div className="h-2.5 w-full rounded-full bg-ink/10" />
        <div className="h-2.5 w-5/6 rounded-full bg-ink/10" />
      </div>
      <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4">
        {CONNECTED_ANNOTATIONS.map((label, i) => (
          <AnnotationRow key={label} label={label} index={i} progress={progress} />
        ))}
      </div>
    </motion.div>
  )
}

/**
 * The full four-phase choreography: conversation fragments scatter, ATOOPV
 * classifies and links them, they organize into three columns, then
 * converge — shrinking and fading right where the document card grows in —
 * so the cards read as becoming the document rather than an unrelated
 * cross-fade. One pinned section, one shared scroll progress value driving
 * every motion value above.
 */
function ConnectedDocumentScroll() {
  const sectionRef = useRef(null)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    let idx = 0
    if (v >= 0.78) idx = 3
    else if (v >= 0.42) idx = 2
    else if (v >= 0.18) idx = 1
    setPhaseIndex((prev) => (prev === idx ? prev : idx))
  })

  return (
    <>
      <section id="experiment-06" ref={sectionRef} className="relative" style={{ height: '380vh' }}>
        <div className="dt-viewport sticky top-0 flex flex-col overflow-hidden bg-paper">
          <TechnicalGrid showTicks />

          <div className="shell relative flex flex-1 flex-col py-8 sm:py-10">
            <ExperimentHeader
              index="06"
              eyebrow="EXPERIMENT / 06"
              titleLines={['FROM CONVERSATION', 'TO DOCUMENT.']}
              className="mb-6 lg:mb-8"
            />

            <div className="relative min-h-0 flex-1 overflow-hidden lg:min-h-[28rem]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {CONNECTED_LINKS.map(([fromId, toId]) => {
                  const from = CONNECTED_FRAGMENTS.find((f) => f.id === fromId)
                  const to = CONNECTED_FRAGMENTS.find((f) => f.id === toId)
                  return <LinkLine key={`${fromId}-${toId}`} from={from} to={to} progress={scrollYProgress} />
                })}
              </svg>

              {CONNECTED_GROUPS.map((group) => (
                <GroupHeader key={group.id} group={group} progress={scrollYProgress} />
              ))}

              {CONNECTED_FRAGMENTS.map((fragment) => (
                <Fragment key={fragment.id} fragment={fragment} progress={scrollYProgress} />
              ))}

              <DocumentReveal progress={scrollYProgress} />
            </div>

            <div className="mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60 sm:mt-8">
              <AnimatePresence mode="wait">
                <motion.span
                  key={CONNECTED_PHASES[phaseIndex]}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  PHASE / {CONNECTED_PHASES[phaseIndex]}
                </motion.span>
              </AnimatePresence>
              <span>SESSION 06 / MOTION SYSTEM</span>
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
          {CONNECTED_STATEMENT.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </motion.p>
      </div>
    </>
  )
}

/**
 * Reduced-motion fallback: the same four-phase story told as a plain static
 * sequence — grouped fragments, then the assembled document with its
 * annotations, then the closing line — with only gentle whileInView fades
 * (which Framer's reduced-motion handling collapses to an instant reveal).
 * No scroll-scrubbing, no scatter, no pinned section.
 */
function ConnectedDocumentStatic() {
  return (
    <section id="experiment-06" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader
          index="06"
          eyebrow="EXPERIMENT / 06"
          titleLines={['FROM CONVERSATION', 'TO DOCUMENT.']}
          className="mb-14 sm:mb-20"
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {CONNECTED_GROUPS.map((group) => (
            <div key={group.id}>
              <TechnicalLabel dot={false} className="mb-3">
                {group.label}
              </TechnicalLabel>
              <div className="flex flex-col gap-3">
                {CONNECTED_FRAGMENTS.filter((f) => f.group === group.id).map((f) => (
                  <div key={f.id} className="rounded-lg border border-ink/10 bg-card p-4 shadow-soft">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">{f.role}</span>
                      <span className="rounded-full border border-accent/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-accent">
                        {f.tag}
                      </span>
                    </div>
                    <p className={f.kind === 'quote' ? 'mt-2 text-sm italic leading-snug text-ink' : 'mt-2 font-display text-base text-ink'}>
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
            <TechnicalLabel dot={false}>PROCÈS-VERBAL</TechnicalLabel>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          </div>
          <div className="mt-4 space-y-2.5">
            <div className="h-2.5 w-3/4 rounded-full bg-ink/10" />
            <div className="h-2.5 w-full rounded-full bg-ink/10" />
            <div className="h-2.5 w-5/6 rounded-full bg-ink/10" />
          </div>
          <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4">
            {CONNECTED_ANNOTATIONS.map((label) => (
              <div key={label} className="flex items-center gap-2 font-mono text-[11px] text-muted">
                <span className="text-emerald">✓</span> {label}
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-14 max-w-lg text-center font-display text-2xl leading-snug text-ink sm:text-3xl">
          {CONNECTED_STATEMENT.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

export default function ConnectedDocument() {
  const reduceMotion = useReducedMotion()
  return reduceMotion ? <ConnectedDocumentStatic /> : <ConnectedDocumentScroll />
}
