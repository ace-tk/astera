import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import TechnicalGrid from '../primitives/TechnicalGrid'
import { centerTransform } from '../primitives/centerTransform'
import {
  CONNECTED_FRAGMENTS,
  CONNECTED_GROUPS,
  CONNECTED_LINKS,
  CONNECTED_PHASES,
  CONNECTED_ANNOTATIONS,
  CONNECTED_STATEMENT,
} from '@/constants/designTest'

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

// Six states, one shared clock every motion value below reads from:
//   0.00–0.18 STACKED     — a loose central pile (untouched raw conversation)
//   0.18–0.35 SEPARATING  — the pile visibly unfolds (interpolated, no waypoint of its own)
//   0.35–0.70 READABLE    — an editorial spread; holds here through...
//   ...0.52–0.70          — CLASSIFICATION: same positions, tags/links switch on
//   0.70–0.85 ORGANIZED   — thematic clusters, rotation settles to 0
//   0.85–1.00 CONVERGE    — each card travels toward its own place in the document
// Position/rotation/scale are transform-only and derived with useTransform,
// so nothing here triggers a React re-render as the user scrolls.
// The initial STACKED hold is deliberately brief (4%, not the 18% this
// shipped with) — measured with a live debug overlay, 18% of a 440vh
// section is ~713px of scroll that produces zero visible movement, which
// is well within a single normal scroll gesture. Users were reasonably
// concluding the section was frozen. Every other boundary is untouched.
const CP = [0, 0.04, 0.35, 0.7, 0.85, 1]
const posSeg = (stacked, readable, organized, converge) => [stacked, stacked, readable, readable, organized, converge].map((v) => `${v}%`)
const rotSeg = (stacked, readable) => [stacked, stacked, readable, readable, 0, 0]
const SCALE_SEG = [1, 1, 1, 1, 1, 0.34]
const FRAGMENT_OPACITY_CP = [0, 0.85, 0.97, 1]
const FRAGMENT_OPACITY_OUT = [1, 1, 0, 0]
const LABEL_WINDOW = [0.48, 0.56, 0.8, 0.86]
const IN_OUT = [0, 1, 1, 0]

// Quotes carry a full sentence and read as the "primary" fragments — wider.
// Tag fragments (a decision, a vote, a name) are short — compact by design,
// not just a smaller version of the same card.
const FRAGMENT_WIDTH = {
  quote: 'w-[15rem] sm:w-[16rem] lg:w-[21rem]',
  tag: 'w-[11rem] sm:w-[11.5rem] lg:w-[14.5rem]',
}

// Below `sm`, seven full multi-line cards can't fit non-overlapping in one
// pinned mobile screen (measured: 90–136px tall each vs. ~500px of canvas) —
// so mobile content is a single truncated line. From `sm` up there's room,
// and the full sentence returns exactly as on desktop.
const TRUNCATE_MOBILE = 'overflow-hidden text-ellipsis whitespace-nowrap sm:overflow-visible sm:whitespace-normal'

function Fragment({ fragment, progress, isDesktop }) {
  const readable = isDesktop ? fragment.readable : fragment.readableMobile
  // Mobile has no distinct "organized" beat (the brief merges it with
  // "readable" there), so the vertical list simply holds in place.
  const organized = isDesktop ? fragment.organized : readable

  const x = useTransform(progress, CP, posSeg(fragment.stacked.x, readable.x, organized.x, fragment.converge.x))
  const y = useTransform(progress, CP, posSeg(fragment.stacked.y, readable.y, organized.y, fragment.converge.y))
  const rotate = useTransform(progress, CP, rotSeg(fragment.stacked.rotate, readable.rotate))
  const scale = useTransform(progress, CP, SCALE_SEG)
  const opacity = useTransform(progress, FRAGMENT_OPACITY_CP, FRAGMENT_OPACITY_OUT)
  const tagOpacity = useTransform(progress, LABEL_WINDOW, IN_OUT)

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
          fragment.kind === 'quote'
            ? `mt-2 text-sm italic leading-snug text-ink sm:mt-2.5 sm:text-base lg:text-lg ${TRUNCATE_MOBILE}`
            : `mt-2 font-display text-base text-ink sm:mt-2.5 sm:text-xl lg:text-2xl ${TRUNCATE_MOBILE}`
        }
      >
        {fragment.kind === 'quote' ? `« ${fragment.text} »` : fragment.text}
      </p>
    </motion.div>
  )
}

// Desktop only — connects fragments at their READABLE spread position (the
// moment they're linked is the moment they're laid out and legible, not
// while still buried in the opening pile).
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

// The document's own content, pulled from the same fragments that just
// converged into it — the PV visibly inherits what the cards said, rather
// than displaying unrelated placeholder copy.
const DOCUMENT_ROWS = [
  { label: 'Décisions', fragmentId: 'decision' },
  { label: 'Actions', fragmentId: 'action2' },
  { label: 'Responsable', fragmentId: 'owner' },
  { label: 'Vote', fragmentId: 'vote' },
]

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

// Registration-mark corner ticks — a printed-document cue, kept graphic
// (thin border strokes) rather than any photorealistic paper texture.
function RegistrationMark({ className }) {
  return <span className={`absolute h-2.5 w-2.5 border-ink/25 ${className}`} aria-hidden="true" />
}

function DocumentReveal({ progress }) {
  const scale = useTransform(progress, [0.83, 0.96], [0.32, 1])
  const opacity = useTransform(progress, [0.83, 0.9], [0, 1])
  return (
    <motion.div
      style={{ scale, opacity }}
      transformTemplate={centerTransform}
      className="absolute left-1/2 top-1/2 w-[min(92%,27rem)] sm:w-[min(82%,34rem)] lg:w-[40rem]"
    >
      {/* A second sheet peeking out behind — the document reads as an
          assembled artifact, not a single flat SaaS card. */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border border-ink/10 bg-card/70" aria-hidden="true" />

      <div className="relative rounded-xl border border-ink/10 bg-card p-6 shadow-float sm:p-7 lg:p-9">
        <RegistrationMark className="left-2 top-2 border-l border-t" />
        <RegistrationMark className="right-2 top-2 border-r border-t" />
        <RegistrationMark className="bottom-2 left-2 border-b border-l" />
        <RegistrationMark className="bottom-2 right-2 border-b border-r" />

        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <TechnicalLabel dot={false}>PROCÈS-VERBAL</TechnicalLabel>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
        </div>
        <div className="mt-2 divide-y divide-ink/10">
          {DOCUMENT_ROWS.map((row, i) => {
            const fragment = CONNECTED_FRAGMENTS.find((f) => f.id === row.fragmentId)
            return <DocumentRow key={row.label} label={row.label} text={fragment.text} index={i} progress={progress} />
          })}
        </div>
        <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4">
          {CONNECTED_ANNOTATIONS.map((label, i) => (
            <AnnotationRow key={label} label={label} index={i} progress={progress} />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted/50">
          <span>ATOOPV / PV-2026-001</span>
          <span>PAGE 1 / 1</span>
        </div>
      </div>
    </motion.div>
  )
}

const PHASE_THRESHOLDS = [0.04, 0.35, 0.52, 0.7, 0.85]

/**
 * The full six-state choreography (stacked → separating → readable →
 * classification → organized → converge). Conversation fragments open as a
 * loose central pile, unfold into an editorial spread where every card can
 * be read at once, show their semantic roles, drift into thematic
 * clusters, then travel toward — and shrink into — the assembled document.
 * One pinned section, one shared scroll progress value driving every
 * motion value above; only the phase label and the desktop/mobile branch
 * are React state, and both change only a handful of times per scroll.
 */
function ConnectedDocumentScroll() {
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
      <section id="experiment-06" ref={sectionRef} className="relative" style={{ height: '440vh' }}>
        <div className="dt-viewport sticky top-0 flex flex-col overflow-hidden bg-paper">
          <TechnicalGrid showTicks />

          <div className="shell relative flex flex-1 flex-col py-8 sm:py-10">
            <ExperimentHeader
              index="06"
              eyebrow="EXPERIMENT / 06"
              titleLines={['FROM CONVERSATION', 'TO DOCUMENT.']}
              className="mb-6 lg:mb-8"
            />

            <div className="relative min-h-[24rem] flex-1 overflow-hidden lg:min-h-[32rem]">
              {isDesktop && (
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {CONNECTED_LINKS.map(([fromId, toId]) => {
                    const from = CONNECTED_FRAGMENTS.find((f) => f.id === fromId)
                    const to = CONNECTED_FRAGMENTS.find((f) => f.id === toId)
                    return <LinkLine key={`${fromId}-${toId}`} from={from} to={to} progress={scrollYProgress} />
                  })}
                </svg>
              )}

              {CONNECTED_FRAGMENTS.map((fragment) => (
                <Fragment key={fragment.id} fragment={fragment} progress={scrollYProgress} isDesktop={isDesktop} />
              ))}

              <DocumentReveal progress={scrollYProgress} />
            </div>

            <div className="mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60 sm:mt-8">
              <AnimatePresence mode="wait">
                <motion.span
                  key={CONNECTED_PHASES[phaseIndex]}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
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
 * Reduced-motion fallback: the same story simplified to its meaningful end
 * states — grouped fragments, then the assembled document with its
 * annotations, then the closing line — with only gentle whileInView fades
 * (which Framer's reduced-motion handling collapses to an instant reveal).
 * No scroll-scrubbing, no six-state trajectory, no pinned section.
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
