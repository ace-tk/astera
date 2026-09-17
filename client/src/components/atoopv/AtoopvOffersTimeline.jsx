import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import { cn } from '@/utils/cn'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { InfoCard } from '@/components/atoopv/InfoCardSection'
import BlogTimeline from '@/components/design-test/experiments/BlogTimeline'
import { ATOOPV_OFFERS, COMPLIANCE_NAMES } from '@/constants/atoopvHome'

const EASE = [0.16, 1, 0.3, 1]

function ComplianceNode({ name, isActive, onSelect, registerRef }) {
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

/**
 * New bottom-of-homepage section — adapts the /design-test sandbox's
 * BlogTimeline "time as navigation" pattern (rail of nodes + scaleX
 * progress bar + crossfading giant watermark, all framer-motion,
 * useReducedMotion-aware) rather than reusing that component/page
 * directly. The 6 rail nodes (compliance names, replacing dates) and the
 * 3 offer cards aren't 1:1 the way BlogTimeline's 9 dates/articles were,
 * so the rail drives the watermark only; the 3 offer cards (Essentiel/
 * Scope/Premium) render simultaneously via the existing `InfoCard`
 * (exported from InfoCardSection.jsx) rather than swapping one at a time.
 */
export default function AtoopvOffersTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const nodeRefs = useRef(new Map())

  const select = (i) => {
    setActiveIndex(i)
    nodeRefs.current.get(i)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  const step = (delta) => select(Math.min(COMPLIANCE_NAMES.length - 1, Math.max(0, activeIndex + delta)))

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  const progress = activeIndex / (COMPLIANCE_NAMES.length - 1)
  const activeName = COMPLIANCE_NAMES[activeIndex]

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
              <ComplianceNode
                key={name}
                name={name}
                isActive={i === activeIndex}
                onSelect={() => select(i)}
                registerRef={(el) => {
                  if (el) nodeRefs.current.set(i, el)
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
              disabled={activeIndex === COMPLIANCE_NAMES.length - 1}
              aria-label="Suivant"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-3">
          {ATOOPV_OFFERS.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.05} className="h-full">
              <InfoCard {...item} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 sm:mt-14">
          <BlogTimeline embedded />
        </Reveal>

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
