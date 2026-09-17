import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import clsx from 'clsx'
import { cn } from '@/utils/cn'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import TechnicalLabel from '@/components/design-test/primitives/TechnicalLabel'
import { ATOOPV_OFFERS, COMPLIANCE_NAMES } from '@/constants/atoopvHome'
import { BLOG_ARTICLES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

function RailNode({ name, isActive, onSelect, registerRef }) {
  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      aria-current={isActive}
      className="group relative flex shrink-0 snap-center flex-col items-center gap-3 px-6 first:pl-1 last:pr-1 sm:px-8"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted/50 transition-colors group-hover:text-muted">
        {name}
      </span>
      <span
        className={cn(
          'relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-all duration-300',
          isActive ? 'scale-125 border-accent bg-accent' : 'border-ink/25 bg-paper group-hover:border-ink/50',
        )}
      >
        <span className={cn('h-1 w-1 rounded-full transition-colors', isActive ? 'bg-paper' : 'bg-ink/30')} />
      </span>
    </button>
  )
}

function CarouselCard({ item, isActive, onSelect, registerRef }) {
  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      className={clsx(
        'flex w-64 shrink-0 snap-center flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-400 sm:w-72',
        isActive ? 'border-ink/15 bg-card shadow-soft' : 'border-ink/10 bg-transparent opacity-55 hover:opacity-80',
      )}
      style={{ transform: isActive ? 'scale(1)' : 'scale(0.94)' }}
    >
      <TechnicalLabel dot={false} className="text-muted/60">
        {item.topic}
      </TechnicalLabel>
      <h3 className="font-display text-lg leading-snug text-ink sm:text-xl">{item.title}</h3>
      <p className="text-sm leading-relaxed text-muted">{item.excerpt}</p>
      {item.meta && (
        <div className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
          <span>{item.meta}</span>
        </div>
      )}
    </button>
  )
}

/**
 * "Nos formats" — a single carousel/timeline, not two. This used to be two
 * separate widgets stacked on top of each other: a compliance rail (6 nodes
 * driving a watermark, decoupled from any cards) sitting above a static
 * Essentiel/Scope/Premium grid, followed by a second, independent
 * date-rail + article-carousel (adapted from /design-test's BlogTimeline).
 * Consolidated here into one rail + one card carousel:
 *
 * - The rail shows exactly the 6 compliance names (unchanged content/order)
 *   and is now the carousel's actual navigation (click a name, jump to its
 *   card) instead of a decorative watermark-only control.
 * - The card carousel is the 3 existing offers (Essentiel/Scope/Premium —
 *   exact copy from `ATOOPV_OFFERS`) followed by the 9 existing
 *   `BLOG_ARTICLES` (Juridique/Budget/Procès-verbal/…, exact copy), so the
 *   first three swipes land on the offers and the rest continue into the
 *   pre-existing article content — nothing invented on either side.
 * - Only the first 6 of the 12 cards have a 1:1 rail node (offers + the
 *   first three articles); the remaining articles are reachable by drag or
 *   the prev/next arrows, same as before, with the rail simply holding on
 *   its last node (QVCT) rather than gaining phantom nodes 7–12.
 *
 * The per-topic filter dropdown the old article carousel had is dropped:
 * it would let the list reorder/hide the offers, which breaks the required
 * "offers first, then the existing articles" order — everything else
 * (drag/snap, keyboard/arrow nav, active-card scaling, crossfading
 * watermark, progress bar) is preserved.
 */
export default function AtoopvOffersTimeline() {
  const items = useMemo(
    () => [
      ...ATOOPV_OFFERS.items.map((item) => ({ id: item.title, topic: item.tag, title: item.title, excerpt: item.body })),
      ...BLOG_ARTICLES.map((a) => ({ id: a.id, topic: a.topic, title: a.title, excerpt: a.excerpt, meta: `${a.readingTime} · ${a.author}` })),
    ],
    [],
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const nodeRefs = useRef(new Map())
  const cardRefs = useRef(new Map())

  const railIndex = Math.min(activeIndex, COMPLIANCE_NAMES.length - 1)

  const select = (i) => {
    setActiveIndex(i)
    nodeRefs.current.get(i)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
    cardRefs.current.get(i)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  const step = (delta) => select(Math.min(items.length - 1, Math.max(0, activeIndex + delta)))

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  const progress = railIndex / (COMPLIANCE_NAMES.length - 1)
  const activeName = COMPLIANCE_NAMES[railIndex]

  return (
    <section className="relative overflow-hidden border-t border-ink/10 bg-paper py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeName}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -40 }}
            transition={{ duration: reduceMotion ? 0.2 : 1.1, ease: EASE }}
            className="select-none whitespace-nowrap font-display leading-none text-ink/[0.045]"
            style={{ fontSize: 'min(28vw, 20rem)' }}
          >
            {activeName}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shell relative">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">{ATOOPV_OFFERS.eyebrow}</span>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-balance text-ink sm:text-4xl">
            {ATOOPV_OFFERS.heading}
          </h2>
        </Reveal>

        <div role="group" aria-label="Instances couvertes" onKeyDown={onKeyDown} className="relative mt-12 sm:mt-16">
          <div className="relative mb-1 h-px w-full bg-ink/10">
            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left bg-accent"
              animate={{ scaleX: progress }}
              initial={false}
              transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: EASE }}
            />
          </div>

          <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto pb-2 pt-6">
            {COMPLIANCE_NAMES.map((name, i) => (
              <RailNode
                key={name}
                name={name}
                isActive={i === railIndex}
                onSelect={() => select(i)}
                registerRef={(el) => {
                  if (el) nodeRefs.current.set(i, el)
                }}
              />
            ))}
          </div>

          <TechnicalLabel dot={false} className="mt-6 text-muted/50">
            DRAG / SCROLL
          </TechnicalLabel>

          <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-1 py-2">
            {items.map((item, i) => (
              <CarouselCard
                key={item.id}
                item={item}
                isActive={i === activeIndex}
                onSelect={() => select(i)}
                registerRef={(el) => {
                  if (el) cardRefs.current.set(i, el)
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={activeIndex === 0}
              aria-label="Précédent"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={activeIndex === items.length - 1}
              aria-label="Suivant"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <p className="ml-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60">
              {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} — {items[activeIndex].title}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/atoopv/tarification" variant="soft" size="md" magnetic={false}>
            <Eye className="h-4 w-4" /> Live preview
          </Button>
          {/* No "Download sample report" destination exists in the reference
              index.html (confirmed by search) — visually implemented,
              intentionally inert rather than linking to an invented URL. */}
          <Button as="button" type="button" variant="soft" size="md" magnetic={false} disabled className="pointer-events-none opacity-50">
            <Download className="h-4 w-4" /> Download sample report
          </Button>
        </div>
      </div>
    </section>
  )
}
