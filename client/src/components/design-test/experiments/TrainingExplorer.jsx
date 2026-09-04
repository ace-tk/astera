import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import DrawLine from '../primitives/DrawLine'
import { TRAININGS, TRAINING_CATEGORIES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

const ACCENT_VAR = {
  economique: 'var(--royal)',
  tresorier: 'var(--emerald)',
  cssct: 'var(--coral)',
  juridique: 'var(--purple)',
  sante: 'var(--rose)',
  management: 'var(--sky)',
}

function categoryLabel(id) {
  return TRAINING_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

function trainingById(id) {
  return TRAININGS.find((t) => t.id === id)
}

function Thumbnail({ category, className }) {
  const colorVar = ACCENT_VAR[category]
  return (
    <span
      className={clsx('relative block overflow-hidden rounded-md', className)}
      style={{ backgroundColor: `rgb(${colorVar} / 0.07)` }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(120deg, rgb(${colorVar} / 0.22) 0px, rgb(${colorVar} / 0.22) 1px, transparent 1px, transparent 9px)`,
        }}
      />
      <span
        className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full sm:bottom-2 sm:right-2"
        style={{ backgroundColor: `rgb(${colorVar})` }}
      />
    </span>
  )
}

function CategoryNav({ active, onSelect, orientation }) {
  const isRow = orientation === 'row'
  return (
    <div
      className={clsx(isRow ? 'dt-no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1' : 'flex flex-col')}
      role="tablist"
      aria-label="Catégories de formation"
    >
      {TRAINING_CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat.id)}
            className={clsx(
              'group relative shrink-0 text-left font-mono text-[11px] uppercase tracking-[0.18em] transition-colors',
              isRow
                ? clsx(
                    'rounded-full border px-3.5 py-1.5',
                    isActive ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-muted hover:border-ink/30 hover:text-ink',
                  )
                : clsx('flex w-full items-center gap-3 border-b border-ink/10 py-3 last:border-b-0', isActive ? 'text-ink' : 'text-muted/60 hover:text-muted'),
            )}
          >
            {!isRow && (
              <span
                className={clsx('h-1 w-1 shrink-0 rounded-full transition-colors', isActive ? 'bg-accent' : 'bg-ink/15 group-hover:bg-ink/30')}
                aria-hidden="true"
              />
            )}
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

function TrainingCard({ training, index, onOpen }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={() => onOpen(training.id)}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.045, ease: EASE }}
      className="group grid w-full grid-cols-[4.5rem_1fr] items-center gap-4 border-b border-ink/10 py-5 text-left transition-colors hover:bg-card focus-visible:bg-card sm:grid-cols-[5.5rem_1fr_auto] sm:gap-6 sm:py-6"
    >
      <Thumbnail category={training.category} className="h-14 w-full sm:h-16" />

      <div className="min-w-0">
        <TechnicalLabel dot={false} className="text-muted/60">
          {categoryLabel(training.category)}
        </TechnicalLabel>
        <h3 className="mt-1.5 truncate font-display text-lg text-ink sm:text-xl">{training.title}</h3>
        <p className="mt-1 hidden max-w-md truncate text-sm text-muted sm:block">{training.description}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70 sm:hidden">
          <span>{training.duration}</span>
          <span>{training.format}</span>
        </div>
      </div>

      <div className="col-span-2 mt-1 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70 sm:col-span-1 sm:mt-0 sm:flex-col sm:items-end sm:gap-1.5 sm:text-right">
        <span className="hidden sm:inline">{training.duration}</span>
        <span className="hidden sm:inline">{training.format}</span>
        <span className="text-ink/50 transition-colors group-hover:text-accent">OUVRIR →</span>
      </div>
    </motion.button>
  )
}

function TrainingDetail({ training, onClose, onSelectRelated }) {
  const panelRef = useRef(null)

  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const related = (training.related || []).map(trainingById).filter(Boolean)

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" initial={false} animate={false}>
      <motion.button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={training.title}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24, transition: { duration: 0.2, ease: 'easeIn' } }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-ink/10 bg-paper p-7 shadow-float outline-none sm:max-h-[80vh] sm:rounded-2xl sm:p-9"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-ink/10 p-1.5 text-muted transition-colors hover:border-ink/25 hover:text-ink"
          aria-label="Fermer le détail de la formation"
        >
          <X className="h-4 w-4" />
        </button>

        <Thumbnail category={training.category} className="h-24 w-full sm:h-28" />
        <TechnicalLabel dot={false} className="mt-6 text-muted/60">
          {categoryLabel(training.category)}
        </TechnicalLabel>
        <h3 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{training.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{training.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-ink/10 py-5 font-mono text-[11px] uppercase tracking-[0.16em] sm:grid-cols-4">
          {[
            ['Durée', training.duration],
            ['Format', training.format],
            ['Organisme', training.org],
            ['Session', training.date],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted/60">{label}</dt>
              <dd className="mt-1 text-ink normal-case tracking-normal">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          className="mt-6 w-full rounded-full bg-ink py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-90 sm:w-auto sm:px-8"
        >
          S’inscrire à la session
        </button>

        {related.length > 0 && (
          <div className="mt-8 border-t border-ink/10 pt-6">
            <TechnicalLabel dot={false} className="mb-3">
              Formations liées
            </TechnicalLabel>
            <div className="flex flex-col gap-2">
              {related.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectRelated(r.id)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-ink/10 px-4 py-3 text-left text-sm text-ink transition-colors hover:border-ink/25 hover:bg-card"
                >
                  {r.title}
                  <span className="font-mono text-[10px] text-muted/60 transition-colors group-hover:text-accent">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/**
 * FORMATIONS / TRAINING EXPLORER — a Swiss/editorial catalogue: a narrow
 * fixed category rail on the left drives a `layout`-animated list of
 * horizontal cards on the right. Selecting a category doesn't swap a
 * dataset silently — it visibly recomposes the remaining cards into their
 * new positions (framer-motion `layout` + `AnimatePresence popLayout`),
 * which is the concept's whole motion identity: rearrangement, not fade.
 */
export default function TrainingExplorer() {
  const [category, setCategory] = useState('all')
  const [openId, setOpenId] = useState(null)
  const reduceMotion = useReducedMotion()

  const visible = useMemo(
    () => (category === 'all' ? TRAININGS : TRAININGS.filter((t) => t.category === category)),
    [category],
  )

  const openTraining = openId ? trainingById(openId) : null

  return (
    <section id="experiment-07" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader index="07" eyebrow="EXPERIMENT / 07" titleLines={['FORMATIONS /', 'TRAINING.']} className="mb-4" />
        <TechnicalLabel dot={false} className="mb-14 text-muted/50 sm:mb-20">
          FILTER
        </TechnicalLabel>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted">
              Sept parcours conçus pour les élus du CSE, de la prise de mandat à la maîtrise du dialogue social.
            </p>
            <div className="hidden lg:block">
              <DrawLine axis="x" origin="left" duration={0.8} className="mb-4" />
              <CategoryNav active={category} onSelect={setCategory} orientation="column" />
            </div>
            <div className="lg:hidden">
              <CategoryNav active={category} onSelect={setCategory} orientation="row" />
            </div>
          </div>

          <LayoutGroup id="training-cards">
            <motion.div layout className="border-t border-ink/10">
              <AnimatePresence mode={reduceMotion ? 'wait' : 'popLayout'} initial={false}>
                {visible.map((training, i) => (
                  <TrainingCard key={training.id} training={training} index={i} onOpen={setOpenId} />
                ))}
              </AnimatePresence>
              {visible.length === 0 && <p className="py-10 text-sm text-muted">Aucune formation dans cette catégorie.</p>}
            </motion.div>
          </LayoutGroup>
        </div>
      </div>

      <AnimatePresence>
        {openTraining && (
          <TrainingDetail
            key={openTraining.id}
            training={openTraining}
            onClose={() => setOpenId(null)}
            onSelectRelated={setOpenId}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
