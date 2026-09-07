import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell, BookmarkCheck, Clock, Heart, Home, LayoutGrid, PlayCircle, Search, ShoppingBag, Star, User, ChevronLeft, ChevronRight, X } from 'lucide-react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import { RESOURCE_CATEGORIES, RESOURCE_LIBRARY_BOOKS, RESOURCE_FEATURED, RESOURCE_RECOMMENDATIONS } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

const ACCENT_VAR = {
  royal: 'var(--royal)',
  coral: 'var(--coral)',
  golden: 'var(--golden)',
  emerald: 'var(--emerald)',
  sky: 'var(--sky)',
  purple: 'var(--purple)',
  rose: 'var(--rose)',
  mint: 'var(--mint)',
  orange: 'var(--orange)',
}

function bookById(id) {
  return RESOURCE_LIBRARY_BOOKS.find((b) => b.id === id)
}

/** An original, in-app cover — colored header band + title/author — no
 * external artwork, reused at two sizes (shelf / featured). */
function BookCover({ book, size = 'sm' }) {
  const colorVar = ACCENT_VAR[book.accent]
  const big = size === 'lg'
  return (
    <div className={clsx('relative shrink-0 overflow-hidden rounded-md bg-white shadow-sm', big ? 'h-56 w-40 sm:h-64 sm:w-44' : 'h-36 w-24 sm:h-40 sm:w-28')}>
      <div className="absolute inset-x-0 top-0 h-2/5" style={{ backgroundColor: `rgb(${colorVar})` }} aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col justify-between p-2.5">
        <span className={clsx('font-display font-semibold leading-tight text-white', big ? 'text-lg' : 'text-[11px]')}>{book.title}</span>
        <span className={clsx('font-mono uppercase tracking-[0.08em] text-ink/45', big ? 'text-xs' : 'text-[8px]')}>{book.author}</span>
      </div>
    </div>
  )
}

const SIDEBAR_ICONS = [
  { icon: Home, label: 'Accueil' },
  { icon: LayoutGrid, label: 'Bibliothèque', active: true },
  { icon: Star, label: 'Favoris' },
  { icon: Clock, label: 'Consultés récemment' },
  { icon: PlayCircle, label: 'Médias' },
  { icon: BookmarkCheck, label: 'Enregistrés' },
]

function Sidebar() {
  return (
    <div className="hidden w-[70px] shrink-0 flex-col items-center justify-between border-r border-ink/8 bg-[#FBF8F2] py-5 sm:flex">
      <div className="flex flex-col items-center gap-5">
        <button type="button" aria-label="Profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/[0.06] text-ink/60">
          <User className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center gap-2">
          {SIDEBAR_ICONS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              aria-current={active}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                active ? 'bg-ink text-paper' : 'text-muted/50 hover:bg-ink/[0.05] hover:text-ink',
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full text-muted/50 hover:bg-ink/[0.05] hover:text-ink">
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-24 w-8 items-center justify-center rounded-full bg-sky text-paper transition-opacity hover:opacity-90"
          style={{ writingMode: 'vertical-rl' }}
        >
          <span className="rotate-180 text-[10px] font-medium uppercase tracking-[0.14em]">Abonnez-vous</span>
        </button>
      </div>
    </div>
  )
}

function TopSearch({ query, onQueryChange, cartCount, onCartClick }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Rechercher un guide…"
          aria-label="Rechercher un guide"
          className="w-full rounded-full border border-ink/10 bg-[#FBF8F2] py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/50 focus-visible:border-sky"
        />
      </div>
      <button
        type="button"
        className="hidden shrink-0 rounded-full bg-gradient-to-r from-sky to-royal px-5 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 sm:inline-flex"
      >
        Rechercher
      </button>
      <button
        type="button"
        onClick={onCartClick}
        aria-label="Votre sélection"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-ink/25"
      >
        <ShoppingBag className="h-4 w-4" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-semibold text-white">{cartCount}</span>
        )}
      </button>
    </div>
  )
}

function CategoryStrip({ active, onSelect }) {
  return (
    <div className="dt-no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Catégories de ressources">
      {RESOURCE_CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat.id)}
            className={clsx(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              isActive ? 'border-ink bg-ink text-paper' : 'border-ink/10 bg-[#FBF8F2] text-muted hover:border-ink/25 hover:text-ink',
            )}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

function BookCard({ book, isSelected, isFavorite, onSelect, onToggleFavorite, reduceMotion }) {
  return (
    <motion.div
      layout
      className="group relative shrink-0 snap-start"
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.03 }}
      transition={{ type: 'tween', duration: 0.25, ease: EASE }}
    >
      <button
        type="button"
        onClick={() => onSelect(book.id)}
        className={clsx(
          'block rounded-lg p-1 text-left transition-shadow duration-300',
          isSelected ? 'ring-2 ring-sky ring-offset-2 ring-offset-paper' : 'hover:shadow-[0_14px_28px_-18px_rgba(17,24,39,0.35)]',
        )}
      >
        <BookCover book={book} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(book.id)
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <Heart className={clsx('h-3 w-3', isFavorite ? 'fill-coral text-coral' : 'text-ink/50')} />
      </button>
      <div className="mt-2 max-w-[6rem] sm:max-w-[7rem]">
        <p className="line-clamp-1 text-xs font-medium text-ink">{book.title}</p>
        <p className="truncate text-[10px] text-muted/70">{book.author}</p>
      </div>
    </motion.div>
  )
}

function PopularSection({ books, selectedId, favorites, onSelect, onToggleFavorite, viewAll, onToggleViewAll, reduceMotion }) {
  const scrollerRef = useRef(null)
  const scrollByAmount = (dx) => scrollerRef.current?.scrollBy({ left: dx, behavior: reduceMotion ? 'auto' : 'smooth' })

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">Popular</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onToggleViewAll} className="rounded-full border border-ink/10 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink/25">
            {viewAll ? 'Voir moins' : 'View All'}
          </button>
          {!viewAll && (
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => scrollByAmount(-220)} aria-label="Précédent" className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-ink/25">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => scrollByAmount(220)} aria-label="Suivant" className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-ink/25">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {books.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Aucune ressource ne correspond à cette recherche.</p>
      ) : viewAll ? (
        <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} isSelected={selectedId === book.id} isFavorite={favorites.has(book.id)} onSelect={onSelect} onToggleFavorite={onToggleFavorite} reduceMotion={reduceMotion} />
          ))}
        </div>
      ) : (
        <div ref={scrollerRef} className="dt-no-scrollbar mt-6 flex snap-x gap-5 overflow-x-auto pb-2">
          {books.map((book) => (
            <BookCard key={book.id} book={book} isSelected={selectedId === book.id} isFavorite={favorites.has(book.id)} onSelect={onSelect} onToggleFavorite={onToggleFavorite} reduceMotion={reduceMotion} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuickActionChip({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[11px] font-medium text-ink transition-colors hover:border-ink/25"
    >
      {children}
    </button>
  )
}

function FeaturedSection({ selectedBook, isFavorite, onToggleFavorite, onOpenPreview, onSummarize, onRequest, onFilterCategory }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-6 rounded-2xl border border-ink/8 bg-[#FBF8F2] p-6 sm:flex-row sm:items-center sm:p-7">
        <BookCover book={selectedBook} size="lg" />
        <div className="min-w-0">
          <TechnicalLabel dot={false} className="text-muted/60">
            {RESOURCE_FEATURED.year} — Vous consultez
          </TechnicalLabel>
          <h4 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{selectedBook.title}</h4>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{RESOURCE_FEATURED.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <QuickActionChip onClick={onOpenPreview}>Voir l’extrait</QuickActionChip>
            <QuickActionChip onClick={onSummarize}>Résumer</QuickActionChip>
            <QuickActionChip onClick={onToggleFavorite}>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</QuickActionChip>
            <button
              type="button"
              onClick={onRequest}
              className="rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-medium text-paper transition-opacity hover:opacity-90"
            >
              Demander ce guide
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {RESOURCE_RECOMMENDATIONS.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} onFilter={onFilterCategory} />
        ))}
      </div>
    </div>
  )
}

function RecommendationCard({ rec, onFilter }) {
  const colors = { 'top-cse': 'golden', 'top-outils': 'emerald', 'top-conformite': 'sky' }
  const colorVar = ACCENT_VAR[colors[rec.id] || 'sky']
  return (
    <button
      type="button"
      onClick={() => onFilter?.(rec.filter)}
      className="flex items-center gap-3 rounded-xl border border-ink/8 bg-white p-3.5 text-left transition-colors hover:border-ink/20"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `rgb(${colorVar} / 0.14)` }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `rgb(${colorVar})` }} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{rec.title}</span>
        <span className="block truncate text-xs text-muted">{rec.description}</span>
      </span>
    </button>
  )
}

function PreviewModal({ book, onClose }) {
  const panelRef = useRef(null)
  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" initial={false} animate={false}>
      <motion.button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Extrait — ${book.title}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative w-full max-w-md rounded-t-2xl border border-ink/10 bg-white p-6 shadow-float outline-none sm:rounded-2xl sm:p-8"
      >
        <button type="button" onClick={onClose} aria-label="Fermer l’extrait" className="absolute right-4 top-4 rounded-full border border-ink/10 p-1.5 text-muted transition-colors hover:border-ink/25 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4">
          <BookCover book={book} />
          <div>
            <TechnicalLabel dot={false} className="text-muted/60">
              Extrait
            </TechnicalLabel>
            <h4 className="mt-1 font-display text-lg font-semibold text-ink">{book.title}</h4>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-ink/80">{book.excerpt}</p>
      </motion.div>
    </motion.div>
  )
}

function CartPanel({ items, onClose, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={false} animate={false}>
      <motion.button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Votre sélection"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-float sm:p-7"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-display text-lg font-semibold text-ink">Votre sélection</h4>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full border border-ink/10 p-1.5 text-muted transition-colors hover:border-ink/25 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
          {items.length === 0 && <p className="text-sm text-muted">Aucune ressource demandée pour l’instant.</p>}
          {items.map((book) => (
            <div key={book.id} className="flex items-center gap-3 rounded-xl border border-ink/8 p-2.5">
              <BookCover book={book} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{book.title}</p>
                <p className="truncate text-xs text-muted">{book.author}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={items.length === 0}
            className="rounded-full bg-ink py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Demander les ressources
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-ink/15 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/30">
            Continuer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-x-0 bottom-6 z-[60] mx-auto w-fit rounded-full bg-ink px-5 py-2.5 text-sm text-paper shadow-float"
      role="status"
    >
      {message}
    </motion.div>
  )
}

/**
 * ATOOPV RESOURCE LIBRARY (Experiment 13) — an application-shell resource
 * platform modeled on a supplied reference screenshot: icon rail, search,
 * category strip, a working carousel, and a featured/recommendations pair.
 * The reference has no chat panel, so none was built — scope follows the
 * screenshot, not assumptions about what a "resource platform" usually has.
 */
export default function ResourceLibrary() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('tous')
  const [selectedId, setSelectedId] = useState(RESOURCE_LIBRARY_BOOKS[0].id)
  const [favorites, setFavorites] = useState(() => new Set())
  const [requested, setRequested] = useState(() => new Set())
  const [viewAll, setViewAll] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const reduceMotion = useReducedMotion()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return RESOURCE_LIBRARY_BOOKS.filter((b) => {
      const matchesCategory = activeCategory === 'tous' || b.categories.includes(activeCategory)
      const matchesQuery = !q || b.title.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query])

  const selectedBook = bookById(selectedId) || RESOURCE_LIBRARY_BOOKS[0]

  const showToast = (message) => {
    setToast(message)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(null), 2000)
  }

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const requestBook = (id) => {
    setRequested((prev) => new Set(prev).add(id))
    showToast('Ajouté à votre sélection')
  }

  return (
    <section id="experiment-13" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader index="13" eyebrow="EXPERIMENT / 13" titleLines={['ATOOPV RESOURCE', 'LIBRARY']} className="mb-14 sm:mb-20" />
        <TechnicalLabel dot={false} className="mb-6 text-muted/50">
          SEARCH / FILTER / SELECT
        </TechnicalLabel>

        <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-[#F3ECDF] p-3 sm:p-5">
          <div className="flex overflow-hidden rounded-2xl bg-card">
            <Sidebar />
            <div className="min-w-0 flex-1 p-5 sm:p-7 lg:p-8">
              <TopSearch query={query} onQueryChange={setQuery} cartCount={requested.size} onCartClick={() => setCartOpen(true)} />
              <CategoryStrip active={activeCategory} onSelect={setActiveCategory} />
              <PopularSection
                books={filtered}
                selectedId={selectedId}
                favorites={favorites}
                onSelect={setSelectedId}
                onToggleFavorite={toggleFavorite}
                viewAll={viewAll}
                onToggleViewAll={() => setViewAll((v) => !v)}
                reduceMotion={reduceMotion}
              />
              <FeaturedSection
                selectedBook={selectedBook}
                isFavorite={favorites.has(selectedBook.id)}
                onToggleFavorite={() => toggleFavorite(selectedBook.id)}
                onOpenPreview={() => setPreviewOpen(true)}
                onSummarize={() => showToast('Résumé généré')}
                onRequest={() => requestBook(selectedBook.id)}
                onFilterCategory={(catId) => {
                  setActiveCategory(catId)
                  showToast('Collection mise à jour')
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{previewOpen && <PreviewModal book={selectedBook} onClose={() => setPreviewOpen(false)} />}</AnimatePresence>
      <AnimatePresence>
        {cartOpen && (
          <CartPanel
            items={[...requested].map(bookById).filter(Boolean)}
            onClose={() => setCartOpen(false)}
            onConfirm={() => {
              showToast('Demande envoyée à l’équipe ATOOPV')
              setCartOpen(false)
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast key={toast} message={toast} />}</AnimatePresence>
    </section>
  )
}
