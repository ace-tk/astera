import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Bookmark, Download, Home, Menu, Search, BookOpen } from 'lucide-react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import { LIBRARY_BOOKS, LIBRARY_LAST_READ } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

const ACCENT_VAR = {
  royal: 'var(--royal)',
  coral: 'var(--coral)',
  golden: 'var(--golden)',
  emerald: 'var(--emerald)',
  sky: 'var(--sky)',
}

const NAV_ICONS = [
  { icon: Home, label: 'Accueil' },
  { icon: BookOpen, label: 'Ressources' },
  { icon: Bookmark, label: 'Enregistrés' },
  { icon: Download, label: 'Téléchargements' },
]

/** An original, in-app "cover" — colored spine + title, no external artwork —
 * shared via `layoutId` between the shelf and the detail spread so Framer
 * Motion animates the exact same element traveling and scaling between
 * them, rather than crossfading two unrelated layouts. */
function BookCover({ book, layoutId, big }) {
  const colorVar = ACCENT_VAR[book.accent]
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ duration: 0.6, ease: EASE }}
      className={clsx(
        'relative shrink-0 overflow-hidden rounded-lg',
        big ? 'h-64 w-48 sm:h-80 sm:w-60' : 'h-40 w-28 sm:h-48 sm:w-32',
      )}
      style={{ backgroundColor: `rgb(${colorVar} / 0.14)` }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: `rgb(${colorVar})` }} aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `repeating-linear-gradient(122deg, rgb(${colorVar} / 0.14) 0px, rgb(${colorVar} / 0.14) 1px, transparent 1px, transparent 11px)`,
        }}
        aria-hidden="true"
      />
      <div className={clsx('absolute inset-x-0 bottom-0 p-3', big && 'p-5')}>
        <p className={clsx('font-display leading-tight text-ink', big ? 'text-xl' : 'text-sm')}>{book.title}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted/70">{book.author}</p>
      </div>
    </motion.div>
  )
}

function StarRating({ rating }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted">
      <span className="text-ink">★ {rating}</span>
    </span>
  )
}

function BookCard({ book, onOpen, reduceMotion }) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(book.id)}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.03 }}
      transition={{ type: 'tween', duration: 0.25, ease: EASE }}
      className="group flex shrink-0 snap-start flex-col items-start gap-2.5 rounded-xl p-2 text-left transition-shadow duration-300 hover:shadow-[0_18px_36px_-20px_rgba(17,24,39,0.35)]"
    >
      <BookCover book={book} layoutId={`cover-${book.id}`} />
      <div className="max-w-[7rem] sm:max-w-[8rem]">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">{book.title}</p>
        <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted/70">{book.meta}</p>
        <div className="mt-1 flex items-center gap-2">
          <StarRating rating={book.rating} />
          <span className="truncate text-[10px] text-muted/60">{book.reviews}</span>
        </div>
      </div>
    </motion.button>
  )
}

function LibraryView({ onOpen, reduceMotion }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <h3 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Most Popular Picks</h3>
      <div className="dt-no-scrollbar mt-6 flex snap-x gap-5 overflow-x-auto pb-2 sm:mt-8 sm:gap-7">
        {LIBRARY_BOOKS.map((book) => (
          <BookCard key={book.id} book={book} onOpen={onOpen} reduceMotion={reduceMotion} />
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4 rounded-xl border border-ink/8 bg-ink/[0.025] p-4 sm:mt-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">Votre dernière lecture</p>
          <p className="truncate text-sm text-ink">
            {LIBRARY_LAST_READ.book} — {LIBRARY_LAST_READ.chapter}
          </p>
        </div>
        <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-ink/10 sm:w-24">
          <div className="h-full rounded-full bg-ink" style={{ width: `${LIBRARY_LAST_READ.progress * 100}%` }} />
        </div>
      </div>
    </motion.div>
  )
}

function DetailView({ book, onBack, saved, onToggleSave }) {
  const [expanded, setExpanded] = useState(false)
  const [added, setAdded] = useState(false)
  const colorVar = ACCENT_VAR[book.accent]

  const handleGetBook = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr] lg:gap-12"
    >
      <div className="relative mx-auto lg:mx-0">
        {/* Original decorative layer standing in for the reference's
            illustration — an abstract soft shape, not copied artwork. */}
        <div
          className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] opacity-60 sm:-inset-12"
          style={{ background: `radial-gradient(circle, rgb(${colorVar} / 0.16) 0%, transparent 70%)` }}
          aria-hidden="true"
        />
        <BookCover book={book} layoutId={`cover-${book.id}`} big />
      </div>

      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25, ease: EASE }} className="mt-5">
          <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{book.title}</h3>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted/70">
            {book.author} · {book.meta}
          </p>

          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted/70">
            <div className="flex items-center gap-1.5">
              <span className="text-ink">★ {book.rating}</span>
              <span>({book.reviews})</span>
            </div>
            <span>{book.pages} pages</span>
            <span>{book.format}</span>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-colors',
                saved ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink hover:border-ink/30',
              )}
            >
              <Bookmark className={clsx('h-3.5 w-3.5', saved && 'fill-current')} />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:border-ink/30"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleGetBook}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-paper transition-opacity hover:opacity-90"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={added ? 'added' : 'get'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {added ? 'Added ✓' : 'Get Book'}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.38, ease: EASE }} className="mt-8 border-t border-ink/10 pt-6">
          <TechnicalLabel dot={false} className="mb-3">
            Extrait
          </TechnicalLabel>
          <p className="text-sm leading-relaxed text-ink/80">{book.excerpt}</p>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  {book.excerptMore.map((p, i) => (
                    <p key={i} className="mb-2 text-sm leading-relaxed text-ink/80">
                      {p}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
            >
              Voir l’extrait
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

/**
 * The reproduced interface: a thin icon rail, a top bar (menu+label in the
 * library, back-only in detail), and the library/detail swap itself. Not
 * wrapped in AnimatePresence at the top level — same reasoning as
 * Experiment 09's book shop: the shared `layoutId` cover needs both its old
 * and new position measured across one commit, which a direct conditional
 * render gives it "for free" (Framer's documented shared-layout pattern).
 */
function LibraryFrame() {
  const [view, setView] = useState('library')
  const [selectedId, setSelectedId] = useState(null)
  const [saved, setSaved] = useState(() => new Set())
  const [searchOpen, setSearchOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  const book = LIBRARY_BOOKS.find((b) => b.id === selectedId)

  const open = (id) => {
    setSelectedId(id)
    setView('detail')
  }
  const close = () => setView('library')
  const toggleSave = () => {
    if (!book) return
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(book.id)) next.delete(book.id)
      else next.add(book.id)
      return next
    })
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#EDE6DA] p-3 sm:p-6">
      <LayoutGroup id="interactive-library">
        <div className="relative flex overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-[0_1px_2px_rgba(17,24,39,0.04),0_30px_70px_-30px_rgba(17,24,39,0.25)]">
          <div className="hidden w-16 shrink-0 flex-col items-center gap-6 border-r border-ink/8 py-6 sm:flex">
            {NAV_ICONS.map(({ icon: Icon, label }, i) => (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  i === 1 ? 'bg-ink text-paper' : 'text-muted/50 hover:bg-ink/[0.05] hover:text-ink',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between sm:mb-8">
              {view === 'library' ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <Menu className="h-4 w-4 text-ink/60 sm:hidden" />
                    <TechnicalLabel dot={false} className="text-muted/60">
                      ATOOPV / RESSOURCES
                    </TechnicalLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {searchOpen && (
                        <motion.input
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 140, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          type="search"
                          placeholder="Rechercher…"
                          aria-label="Rechercher une ressource"
                          className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs outline-none"
                        />
                      )}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={() => setSearchOpen((v) => !v)}
                      aria-label="Rechercher"
                      aria-expanded={searchOpen}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted/60 transition-colors hover:bg-ink/[0.05] hover:text-ink"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <span className="h-8" aria-hidden="true" />
              )}
            </div>

            {view === 'library' ? (
              <LibraryView onOpen={open} reduceMotion={reduceMotion} />
            ) : (
              book && <DetailView book={book} onBack={close} saved={saved.has(book.id)} onToggleSave={toggleSave} />
            )}
          </div>
        </div>
      </LayoutGroup>
    </div>
  )
}

/**
 * INTERACTIVE LIBRARY (Experiment 12) — an editorial book collection whose
 * selected cover physically transforms into a full detail spread via a
 * shared `layoutId`, modeled on a supplied reference storyboard (frame
 * sequence: library → selected book → detail + excerpt → back). Original
 * ATOOPV covers/content throughout — no third-party artwork or branding.
 */
export default function InteractiveLibrary() {
  return (
    <section id="experiment-12" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader index="12" eyebrow="EXPERIMENT / 12" titleLines={['INTERACTIVE', 'LIBRARY']} className="mb-14 sm:mb-20" />
        <TechnicalLabel dot={false} className="mb-6 text-muted/50">
          OPEN / SAVE / PREVIEW
        </TechnicalLabel>
        <LibraryFrame />
      </div>
    </section>
  )
}
