import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import ReaderPageContent from './ReaderPageContent'

const EASE = [0.16, 1, 0.3, 1]
const DRAG_RANGE = 220
const THRESHOLD = 70

function CornerMarks() {
  const pos = ['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3', 'right-3 bottom-3']
  return (
    <>
      {pos.map((p) => (
        <span
          key={p}
          className={clsx('pointer-events-none absolute select-none font-mono text-[10px] leading-none', p)}
          style={{ color: 'rgb(var(--royal) / 0.35)' }}
          aria-hidden="true"
        >
          +
        </span>
      ))}
    </>
  )
}

function PageChrome({ book, children }) {
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
        <span>ATOOPV · {book.title} · Extrait</span>
      </div>
    </div>
  )
}

function Minimap({ total, pageIndex, onJump }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Aperçu des pages">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onJump(i)}
          aria-label={`Aller à la page ${i + 1}`}
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

/** Real drag-driven paper physics — ported from the Design Lab's proven
 * Report Page Flip mechanic (/design-test, Experiment 10), parameterized by
 * the selected book's own `previewPages` rather than a fixed page list, so
 * page count is never hardcoded. */
function InteractiveFlip({ book, onGetBook, onBackToShop }) {
  const pages = book.previewPages
  const last = pages.length - 1
  const [pageIndex, setPageIndex] = useState(0)
  const dragX = useMotionValue(0)
  const busyRef = useRef(false)

  const canForward = pageIndex < last
  const canBack = pageIndex > 0

  const forwardRotate = useTransform(dragX, [-DRAG_RANGE, 0], [-170, 0], { clamp: true })
  const backwardRotate = useTransform(dragX, [0, DRAG_RANGE], [-180, -10], { clamp: true })
  const forwardShadow = useTransform(forwardRotate, [0, -170], [0, 0.4])
  const backwardShadow = useTransform(backwardRotate, [-180, -10], [0.4, 0])
  const liftShadow = useTransform(dragX, [-DRAG_RANGE, 0, DRAG_RANGE], [0.28, 0, 0.28])

  const settle = (dir) => {
    busyRef.current = false
    setPageIndex((i) => Math.min(last, Math.max(0, i + dir)))
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

  const nextPage = pages[pageIndex + 1]
  const prevPage = pages[pageIndex - 1]
  const currentPage = pages[pageIndex]

  // The invisible drag layer sits above the page content by design (a
  // gesture should start from anywhere on the page, not just its edges),
  // which normally never conflicts with anything since every other page
  // kind is read-only. The "end" page is the one exception — it has real
  // buttons — so pointer events are let through to them there; Previous/
  // ArrowLeft/keyboard remain the way back off this page instead of drag.
  const currentHasInteractiveContent = currentPage.kind === 'end'

  const renderPage = (page, index) => (
    <PageChrome book={book}>
      <ReaderPageContent page={page} book={book} pageNumber={index + 1} totalPages={pages.length} onGetBook={onGetBook} onBackToShop={onBackToShop} />
    </PageChrome>
  )

  return (
    <div>
      <div
        role="group"
        tabIndex={0}
        aria-label="Lecteur — flèches pour tourner les pages"
        onKeyDown={onKeyDown}
        className="group/flip relative mx-auto w-full max-w-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:max-w-md"
        style={{ aspectRatio: '3 / 4', height: 'min(70vh, 42rem)', perspective: 1800 }}
      >
        {nextPage && (
          <div className="absolute inset-0 z-0">{renderPage(nextPage, pageIndex + 1)}</div>
        )}

        <motion.div className="absolute inset-0 z-20" style={{ transformOrigin: '0% 50%', rotateY: forwardRotate, backfaceVisibility: 'hidden' }}>
          {renderPage(currentPage, pageIndex)}
          <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent" style={{ opacity: forwardShadow }} aria-hidden="true" />
        </motion.div>

        {prevPage && (
          <motion.div className="absolute inset-0 z-30" style={{ transformOrigin: '0% 50%', rotateY: backwardRotate, backfaceVisibility: 'hidden' }}>
            {renderPage(prevPage, pageIndex - 1)}
            <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-ink/40 via-transparent to-transparent" style={{ opacity: backwardShadow }} aria-hidden="true" />
          </motion.div>
        )}

        <motion.div className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-ink blur-xl" style={{ opacity: liftShadow }} aria-hidden="true" />

        {!currentHasInteractiveContent && (
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
        )}

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

      <div className="mx-auto mt-6 flex w-full max-w-sm items-center justify-between gap-4 sm:max-w-md">
        <button type="button" onClick={() => triggerFlip(-1)} disabled={!canBack} aria-label="Page précédente" className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/70">
          {String(pageIndex + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
        </span>
        <button type="button" onClick={() => triggerFlip(1)} disabled={!canForward} aria-label="Page suivante" className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <Minimap total={pages.length} pageIndex={pageIndex} onJump={jumpTo} />
      </div>
    </div>
  )
}

/** Reduced-motion fallback: instant crossfade, no rotation/perspective, same functionality. */
function StaticFlip({ book, onGetBook, onBackToShop }) {
  const pages = book.previewPages
  const last = pages.length - 1
  const [pageIndex, setPageIndex] = useState(0)
  const currentPage = pages[pageIndex]

  return (
    <div>
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md" style={{ aspectRatio: '3 / 4', height: 'min(70vh, 42rem)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={pageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0">
            <PageChrome book={book}>
              <ReaderPageContent page={currentPage} book={book} pageNumber={pageIndex + 1} totalPages={pages.length} onGetBook={onGetBook} onBackToShop={onBackToShop} />
            </PageChrome>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-sm items-center justify-between gap-4 sm:max-w-md">
        <button type="button" onClick={() => setPageIndex((i) => Math.max(0, i - 1))} disabled={pageIndex === 0} aria-label="Page précédente" className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/70">
          {String(pageIndex + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
        </span>
        <button type="button" onClick={() => setPageIndex((i) => Math.min(last, i + 1))} disabled={pageIndex === last} aria-label="Page suivante" className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <Minimap total={pages.length} pageIndex={pageIndex} onJump={setPageIndex} />
      </div>
    </div>
  )
}

/**
 * The full-screen book reader — opened from the Shop's book detail view via
 * "LIRE UN EXTRAIT →". Rendered as one of Boutique.jsx's three
 * mutually-exclusive views (shelf | detail | reader), not a modal stacked
 * on top of the detail view — that's what lets the shared `layoutId` cover
 * (see BookCover.jsx) travel continuously from the detail view into this
 * reader's opening page, and back, rather than an abrupt modal fade.
 */
export default function BookReader({ book, onClose, onGetBook }) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper"
    >
      <div className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à la boutique
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted/60">{book.title}</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-10">
        {reduceMotion ? (
          <StaticFlip book={book} onGetBook={onGetBook} onBackToShop={onClose} />
        ) : (
          <InteractiveFlip book={book} onGetBook={onGetBook} onBackToShop={onClose} />
        )}
      </div>
    </motion.div>
  )
}
