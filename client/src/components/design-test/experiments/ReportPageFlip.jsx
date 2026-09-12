import { useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import { REPORT_META, REPORT_PAGES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]
const LAST = REPORT_PAGES.length - 1
const DRAG_RANGE = 220
const THRESHOLD = 70

function CornerMarks() {
  const pos = ['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3', 'right-3 bottom-3']
  return (
    <>
      {pos.map((p) => (
        <span key={p} className={clsx('pointer-events-none absolute select-none font-mono text-[10px] leading-none', p)} style={{ color: 'rgb(var(--royal) / 0.35)' }} aria-hidden="true">
          +
        </span>
      ))}
    </>
  )
}

function PageChrome({ children }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-sm bg-card p-8 shadow-[0_1px_0_rgba(17,24,39,0.04),0_20px_50px_-20px_rgba(17,24,39,0.25)] sm:p-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--royal) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--royal) / 0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />
      <CornerMarks />
      <div className="relative flex flex-1 flex-col">{children}</div>
      <div className="relative mt-6 flex items-center justify-between border-t border-ink/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/50">
        <span>ATOOPV · {REPORT_META.title} · {REPORT_META.date}</span>
      </div>
    </div>
  )
}

function PageBody({ page }) {
  return (
    <motion.div key={page.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12, ease: EASE }} className="flex flex-1 flex-col">
      {page.kind === 'cover' ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <TechnicalLabel dot={false} className="text-muted/60">
            {REPORT_META.meetingType}
          </TechnicalLabel>
          <h3 className="mt-6 font-display text-4xl leading-[0.95] tracking-tight text-ink sm:text-5xl">{REPORT_META.title}</h3>
          <p className="mt-4 font-display text-lg text-ink/70 sm:text-xl">{REPORT_META.org}</p>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-muted/60">{REPORT_META.date}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/40">{REPORT_META.generatedBy}</p>
        </div>
      ) : (
        <>
          <TechnicalLabel dot={false} className="text-muted/60">
            {page.number} / {String(REPORT_PAGES.length).padStart(2, '0')}
          </TechnicalLabel>
          <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{page.title}</h3>

          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            {page.kind === 'text' &&
              page.body.map((p, i) => (
                <p key={i} className="mb-4 max-w-md text-sm leading-relaxed text-ink/75 sm:text-base">
                  {p}
                </p>
              ))}

            {page.kind === 'list' &&
              page.items.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
                  className="flex items-center justify-between gap-4 border-b border-ink/10 py-3 text-sm"
                >
                  <div>
                    <p className="text-ink">{item.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">{item.role}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/70">{item.status}</span>
                </motion.div>
              ))}

            {page.kind === 'decisions' &&
              page.items.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 + i * 0.08 }}
                  className="mb-3 flex items-start gap-3 rounded-lg border border-ink/10 bg-paper p-4"
                >
                  <span className="mt-0.5 shrink-0 rounded-full border border-royal/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-royal">
                    {item.tag}
                  </span>
                  <p className="text-sm text-ink">{item.text}</p>
                </motion.div>
              ))}

            {page.kind === 'actions' &&
              page.items.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 + i * 0.07 }}
                  className="mb-3 border-b border-ink/10 pb-3"
                >
                  <p className="text-sm text-ink">{item.text}</p>
                  <div className="mt-1.5 flex gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
                    <span>{item.owner}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.due}</span>
                  </div>
                </motion.div>
              ))}

            {page.kind === 'votes' &&
              page.items.map((item, i) => {
                const total = item.pour + item.contre + item.abstention
                return (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 + i * 0.08 }}
                    className="mb-4"
                  >
                    <p className="text-sm text-ink">{item.subject}</p>
                    <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-ink/10">
                      <span style={{ width: `${(item.pour / total) * 100}%` }} className="bg-emerald" />
                      <span style={{ width: `${(item.contre / total) * 100}%` }} className="bg-rose" />
                      <span style={{ width: `${(item.abstention / total) * 100}%` }} className="bg-ink/20" />
                    </div>
                    <div className="mt-1.5 flex gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
                      <span>Pour {item.pour}</span>
                      <span>Contre {item.contre}</span>
                      <span>Abst. {item.abstention}</span>
                    </div>
                  </motion.div>
                )
              })}

            {page.kind === 'signatures' &&
              page.items.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 + i * 0.1 }}
                  className="mb-8"
                >
                  <p className="text-sm text-ink">{item.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">{item.role}</p>
                  <div className="mt-4 h-px w-40 bg-ink/20" />
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted/40">Signature</p>
                </motion.div>
              ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

function Minimap({ pageIndex, onJump }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Aperçu des pages">
      {REPORT_PAGES.map((page, i) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onJump(i)}
          aria-label={`Aller à la page ${page.number}`}
          aria-current={i === pageIndex}
          className={clsx(
            'h-6 w-4 shrink-0 rounded-[2px] border transition-all',
            i === pageIndex ? 'border-ink bg-ink/10' : 'border-ink/15 hover:border-ink/30',
          )}
        />
      ))}
    </div>
  )
}

/** Interactive desktop/touch experience: real drag-driven paper physics. */
function InteractiveFlip() {
  const [pageIndex, setPageIndex] = useState(0)
  const dragX = useMotionValue(0)
  const busyRef = useRef(false)

  const canForward = pageIndex < LAST
  const canBack = pageIndex > 0

  // A single gesture value drives two independent leaves: dragging left
  // (negative) rotates the *current* leaf away from 0° toward -170° around
  // its left edge (advancing); dragging right (positive) rotates the
  // *previous* leaf — which rests hidden at -180° — back toward 0°,
  // sweeping it over the current page (going back). Each transform is
  // clamped to its own half of the domain, so a drag in one direction
  // never disturbs the other leaf.
  const forwardRotate = useTransform(dragX, [-DRAG_RANGE, 0], [-170, 0], { clamp: true })
  const backwardRotate = useTransform(dragX, [0, DRAG_RANGE], [-180, -10], { clamp: true })
  const forwardShadow = useTransform(forwardRotate, [0, -170], [0, 0.4])
  const backwardShadow = useTransform(backwardRotate, [-180, -10], [0.4, 0])
  const liftShadow = useTransform(dragX, [-DRAG_RANGE, 0, DRAG_RANGE], [0.28, 0, 0.28])

  const settle = (dir) => {
    busyRef.current = false
    setPageIndex((i) => Math.min(LAST, Math.max(0, i + dir)))
    dragX.set(0)
  }

  const commit = (dir) => {
    if (busyRef.current) return
    busyRef.current = true
    animate(dragX, dir === 1 ? -DRAG_RANGE * 1.5 : DRAG_RANGE * 1.5, {
      duration: 0.38,
      ease: EASE,
      onComplete: () => settle(dir),
    })
  }

  const snapBack = () => {
    animate(dragX, 0, { type: 'spring', stiffness: 340, damping: 32 })
  }

  const triggerFlip = (dir) => {
    if (busyRef.current) return
    if (dir === 1 && !canForward) return
    if (dir === -1 && !canBack) return
    commit(dir)
  }

  const jumpTo = (i) => {
    if (busyRef.current || i === pageIndex) return
    dragX.set(0)
    setPageIndex(i)
  }

  const onDragEnd = () => {
    const x = dragX.get()
    if (x <= -THRESHOLD && canForward) commit(1)
    else if (x >= THRESHOLD && canBack) commit(-1)
    else snapBack()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      triggerFlip(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      triggerFlip(-1)
    }
  }

  const nextPage = REPORT_PAGES[pageIndex + 1]
  const prevPage = REPORT_PAGES[pageIndex - 1]
  const currentPage = REPORT_PAGES[pageIndex]

  return (
    <div>
      <div
        role="group"
        tabIndex={0}
        aria-label="Lecteur du procès-verbal — flèches pour tourner les pages"
        onKeyDown={onKeyDown}
        className="group/flip relative mx-auto aspect-[3/4] w-full max-w-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:max-w-md"
        style={{ perspective: 1800 }}
      >
        {/* Static base: the next page, revealed as the current leaf lifts away. */}
        {nextPage && (
          <div className="absolute inset-0 z-0">
            <PageChrome>
              <PageBody page={nextPage} />
            </PageChrome>
          </div>
        )}

        {/* Current leaf: flips forward around its left edge. */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{ transformOrigin: '0% 50%', rotateY: forwardRotate, backfaceVisibility: 'hidden' }}
        >
          <PageChrome>
            <PageBody page={currentPage} />
          </PageChrome>
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent"
            style={{ opacity: forwardShadow }}
            aria-hidden="true"
          />
        </motion.div>

        {/* Previous leaf: rests hidden at -180°, sweeps back to 0° to go back. */}
        {prevPage && (
          <motion.div
            className="absolute inset-0 z-30"
            style={{ transformOrigin: '0% 50%', rotateY: backwardRotate, backfaceVisibility: 'hidden' }}
          >
            <PageChrome>
              <PageBody page={prevPage} />
            </PageChrome>
            <motion.div
              className="pointer-events-none absolute inset-0 bg-gradient-to-l from-ink/40 via-transparent to-transparent"
              style={{ opacity: backwardShadow }}
              aria-hidden="true"
            />
          </motion.div>
        )}

        {/* Ambient shadow cast onto the whole spread while a drag is active. */}
        <motion.div className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-ink blur-xl" style={{ opacity: liftShadow }} aria-hidden="true" />

        {/* Invisible gesture-capture layer: repurposes the drag offset as the
            shared rotation input above rather than moving anything itself. */}
        <motion.div
          drag="x"
          dragConstraints={{ left: canForward ? -DRAG_RANGE : 0, right: canBack ? DRAG_RANGE : 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          style={{ x: dragX }}
          className="absolute inset-0 z-40 cursor-grab active:cursor-grabbing"
          aria-hidden="true"
        />

        {/* Corner-curl hints: decorative only, reveal on hover/focus. */}
        {canForward && (
          <div
            className="pointer-events-none absolute bottom-0 right-0 z-40 h-10 w-10 opacity-0 transition-opacity duration-300 group-hover/flip:opacity-100"
            style={{ background: 'linear-gradient(135deg, transparent 50%, rgb(var(--royal) / 0.18) 50%)' }}
            aria-hidden="true"
          />
        )}
        {canBack && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 z-40 h-10 w-10 opacity-0 transition-opacity duration-300 group-hover/flip:opacity-100"
            style={{ background: 'linear-gradient(225deg, transparent 50%, rgb(var(--royal) / 0.18) 50%)' }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mx-auto mt-8 flex max-w-sm items-center justify-between gap-4 sm:max-w-md">
        <button
          type="button"
          onClick={() => triggerFlip(-1)}
          disabled={!canBack}
          aria-label="Page précédente"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/70">
          {currentPage.number} / {String(REPORT_PAGES.length).padStart(2, '0')}
        </span>

        <button
          type="button"
          onClick={() => triggerFlip(1)}
          disabled={!canForward}
          aria-label="Page suivante"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex justify-center">
        <Minimap pageIndex={pageIndex} onJump={jumpTo} />
      </div>
    </div>
  )
}

/** Reduced-motion fallback: instant crossfade, no rotation/perspective. */
function StaticFlip() {
  const [pageIndex, setPageIndex] = useState(0)
  const currentPage = REPORT_PAGES[pageIndex]

  return (
    <div>
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm sm:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0">
            <PageChrome>
              <PageBody page={currentPage} />
            </PageChrome>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto mt-8 flex max-w-sm items-center justify-between gap-4 sm:max-w-md">
        <button
          type="button"
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
          aria-label="Page précédente"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/70">
          {currentPage.number} / {String(REPORT_PAGES.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => setPageIndex((i) => Math.min(LAST, i + 1))}
          disabled={pageIndex === LAST}
          aria-label="Page suivante"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex justify-center">
        <Minimap pageIndex={pageIndex} onJump={setPageIndex} />
      </div>
    </div>
  )
}

/**
 * REPORT PREVIEW / PAGE FLIP — a real drag-driven paper-physics page turn
 * (not a carousel): a single shared drag value maps to two independent
 * leaf rotations (current page flipping forward, previous page sweeping
 * back), both hinged at the same left edge like a bound document, with a
 * dynamic shadow overlay standing in for the paper's own shading as it
 * turns. See `InteractiveFlip` above for the full mechanic.
 *
 * `hideEyebrow` is opt-in and off by default (the /design-test lab itself
 * never passes it, so its own "EXPERIMENT / 10" label is unchanged) — the
 * production Shop page (Boutique.jsx), which reuses this component, passes
 * it true to drop just that internal-lab label without touching the
 * chapter numeral or the "THE PAPER IS TURNING." title.
 */
export default function ReportPageFlip({ hideEyebrow = false }) {
  const reduceMotion = useReducedMotion()

  return (
    <section id="experiment-10" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <ExperimentHeader index="10" eyebrow="EXPERIMENT / 10" hideEyebrow={hideEyebrow} titleLines={['THE PAPER', 'IS TURNING.']} />
          <TechnicalLabel dot={false} className="text-muted/50">
            {reduceMotion ? 'CLICK' : 'DRAG / SWIPE / FLÈCHES'}
          </TechnicalLabel>
        </div>
        <p className="mb-14 max-w-md text-sm leading-relaxed text-muted sm:mb-20">
          Un procès-verbal de démonstration, page par page — glissez un coin de page, ou utilisez les flèches du clavier.
        </p>

        {reduceMotion ? <StaticFlip /> : <InteractiveFlip />}
      </div>
    </section>
  )
}
