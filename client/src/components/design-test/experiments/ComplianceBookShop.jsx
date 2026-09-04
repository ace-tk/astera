import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Bookmark, Heart, Lock, Minus, Plus, Search } from 'lucide-react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import { BOOKS, BOOK_CATEGORIES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

const ACCENT_VAR = {
  royal: 'var(--royal)',
  coral: 'var(--coral)',
  golden: 'var(--golden)',
  emerald: 'var(--emerald)',
  sky: 'var(--sky)',
  purple: 'var(--purple)',
  rose: 'var(--rose)',
}

function BookCover({ book, layoutId, big }) {
  const colorVar = ACCENT_VAR[book.accent]
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ duration: 0.55, ease: EASE }}
      className={clsx('relative flex shrink-0 flex-col justify-between overflow-hidden rounded-lg p-4', big ? 'h-56 w-40 p-5 sm:h-64 sm:w-44' : 'h-40 w-full')}
      style={{ backgroundColor: `rgb(${colorVar} / 0.14)` }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: `rgb(${colorVar})` }} aria-hidden="true" />
      <span className="pl-2 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: `rgb(${colorVar})` }}>
        {book.category}
      </span>
      <div className="pl-2">
        <p className={clsx('font-display leading-tight text-ink', big ? 'text-xl' : 'text-base')}>{book.title}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted/70">{book.author}</p>
      </div>
    </motion.div>
  )
}

function TiltWrap({ children, className }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const onMove = (e) => {
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -6, y: px * 6 })
  }
  const onLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y, y: tilt.x !== 0 || tilt.y !== 0 ? -4 : 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      style={{ transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ShopCard({ book, isOwned, isSaved, onOpen, onToggleSave }) {
  return (
    <div className="group flex flex-col">
      <TiltWrap className="relative">
        <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Ouvrir ${book.title}`}>
          <BookCover book={book} layoutId={`cover-${book.id}`} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave(book.id)
          }}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Retirer des favoris' : 'Sauvegarder'}
          className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-paper/90 text-ink shadow-soft transition-transform hover:scale-105"
        >
          <Heart className={clsx('h-3.5 w-3.5 transition-colors', isSaved ? 'fill-accent text-accent' : 'text-ink/50')} />
        </button>
      </TiltWrap>

      <button type="button" onClick={onOpen} className="mt-3 text-left">
        <h3 className="line-clamp-1 font-display text-base text-ink">{book.title}</h3>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted/60">{book.author}</p>
      </button>

      <div className="mt-2 flex items-center justify-between">
        {isOwned ? (
          <div className="flex-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${Math.round((book.progress || 0) * 100)}%` }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            </div>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted/60">
              {book.progress > 0 ? `${Math.round(book.progress * 100)}% lu` : 'Non commencé'}
            </span>
          </div>
        ) : (
          <span className="font-mono text-sm text-ink">{book.price}</span>
        )}
      </div>
    </div>
  )
}

function DetailView({ book, isOwned, isSaved, onToggleSave, onBack, onBuy, onRead }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Retour à la boutique
      </button>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[11rem_1fr] sm:gap-12">
        <div className="relative mx-auto sm:mx-0">
          <BookCover book={book} layoutId={`cover-${book.id}`} big />
        </div>

        <div>
          <TechnicalLabel dot={false} className="text-muted/60">
            {book.category}
          </TechnicalLabel>
          <h3 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{book.title}</h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-muted/70">{book.author}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">{book.description}</p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em]">
            <div>
              <dt className="text-muted/60">Pages</dt>
              <dd className="mt-1 text-ink normal-case tracking-normal">{book.pages}</dd>
            </div>
            <div>
              <dt className="text-muted/60">Prix</dt>
              <dd className="mt-1 text-ink normal-case tracking-normal">{book.price}</dd>
            </div>
            <div>
              <dt className="text-muted/60">Statut</dt>
              <dd className="mt-1 text-ink normal-case tracking-normal">{isOwned ? 'Possédé' : 'Non possédé'}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            {isOwned ? (
              <button type="button" onClick={onRead} className="rounded-full bg-ink px-7 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-90">
                Continuer la lecture
              </button>
            ) : (
              <>
                <button type="button" onClick={onBuy} className="rounded-full bg-ink px-7 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-90">
                  Ajouter — {book.price}
                </button>
                <button type="button" onClick={onRead} className="rounded-full border border-ink/15 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink/30">
                  Aperçu
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onToggleSave(book.id)}
              aria-pressed={isSaved}
              className="flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink/30"
            >
              <Heart className={clsx('h-3.5 w-3.5', isSaved ? 'fill-accent text-accent' : 'text-ink/50')} />
              {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ReaderView({ book, isOwned, onBack, onBuy }) {
  const [chapterIndex, setChapterIndex] = useState(0)
  const [fontScale, setFontScale] = useState(1)
  const [bookmarks, setBookmarks] = useState(() => new Set())

  const chapter = book.chapters[chapterIndex]
  const key = `${book.id}:${chapterIndex}`
  const isBookmarked = bookmarks.has(key)
  const locked = !isOwned && chapterIndex > 0
  const sentences = chapter.excerpt.split(/(?<=\.)\s+/)
  const timeRemaining = Math.max(1, (book.chapters.length - chapterIndex - 1) * 2 + 2)

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Navigating to a locked chapter is allowed on purpose: it's what makes
  // the lock overlay (and its "Ajouter" unlock CTA) reachable at all,
  // rather than the dot silently doing nothing in preview mode.
  const goToChapter = (i) => setChapterIndex(i)

  return (
    <motion.div initial={{ opacity: 0, scaleY: 0.98 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ duration: 0.4, ease: EASE }} style={{ transformOrigin: 'top' }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> {book.title}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFontScale((f) => Math.max(0.9, +(f - 0.1).toFixed(1)))}
            aria-label="Réduire la taille du texte"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFontScale((f) => Math.min(1.3, +(f + 0.1).toFixed(1)))}
            aria-label="Agrandir la taille du texte"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleBookmark}
            aria-pressed={isBookmarked}
            aria-label="Marquer ce chapitre"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30"
          >
            <Bookmark className={clsx('h-3.5 w-3.5', isBookmarked && 'fill-accent text-accent')} />
          </button>
        </div>
      </div>

      <div className="relative mt-8 min-h-[16rem] rounded-2xl border border-ink/10 bg-card p-7 sm:p-10">
        <AnimatePresence mode="wait">
          {locked ? (
            <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10 text-center">
              <Lock className="h-6 w-6 text-muted/50" />
              <p className="mt-4 max-w-xs text-sm text-muted">Aperçu limité au premier chapitre. Ajoutez ce livre pour continuer la lecture.</p>
              <button type="button" onClick={onBuy} className="mt-5 rounded-full bg-ink px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-90">
                Ajouter — {book.price}
              </button>
            </motion.div>
          ) : (
            <motion.div key={chapterIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
              <TechnicalLabel dot={false} className="mb-4 text-muted/60">
                CHAPITRE {String(chapterIndex + 1).padStart(2, '0')} / {String(book.chapters.length).padStart(2, '0')}
              </TechnicalLabel>
              <h3 className="font-display text-2xl text-ink sm:text-3xl" style={{ fontSize: `${1.5 * fontScale}rem` }}>
                {chapter.title}
              </h3>
              <p className="mt-4 leading-relaxed text-ink/80" style={{ fontSize: `${1 * fontScale}rem`, lineHeight: 1.75 }}>
                <mark className="rounded bg-accent/15 px-0.5 text-ink">{sentences[0]}</mark>
                {sentences.length > 1 ? ` ${sentences.slice(1).join(' ')}` : null}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {book.chapters.map((c, i) => (
            <button
              key={c.title}
              type="button"
              onClick={() => goToChapter(i)}
              aria-label={`Aller au chapitre ${i + 1}`}
              aria-current={i === chapterIndex}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === chapterIndex ? 'w-6 bg-accent' : 'w-1.5 bg-ink/15 hover:bg-ink/30',
                !isOwned && i > 0 && 'opacity-40',
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/60">
          <span>{Math.round(((chapterIndex + 1) / book.chapters.length) * 100)}% du livre</span>
          <span aria-hidden="true">·</span>
          <span>{timeRemaining} min restantes</span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * COMPLIANCE BOOKS / BOUTIQUE CONFORMITÉ — a warm, tactile mini-library.
 * Book covers are designed in-app (accent color + title/author, no
 * external art) rather than photographed, and the whole shelf→detail→
 * reader flow is one continuous object: the same `layoutId` cover element
 * is what "travels" from card to hero to (implicitly) the book that opens,
 * driven by Framer Motion's shared layout animation rather than a manual
 * FLIP or a modal swap.
 */
export default function ComplianceBookShop() {
  const [view, setView] = useState('shelf')
  const [activeId, setActiveId] = useState(null)
  const [category, setCategory] = useState('Tous')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(() => new Set())
  const [ownedOverrides, setOwnedOverrides] = useState({})

  const isOwned = (book) => ownedOverrides[book.id] ?? book.owned

  const filtered = useMemo(() => {
    return BOOKS.filter((b) => {
      const matchesCategory = category === 'Tous' || b.category === category
      const matchesQuery = b.title.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  const featured = BOOKS.find((b) => b.featured)
  const showFeatured = category === 'Tous' && !query

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const open = (id) => {
    setActiveId(id)
    setView('detail')
  }

  const activeBook = BOOKS.find((b) => b.id === activeId)

  return (
    <section id="experiment-09" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader index="09" eyebrow="EXPERIMENT / 09" titleLines={['COMPLIANCE', 'BOOKS.']} className="mb-14 sm:mb-20" />

        {/* Not wrapped in AnimatePresence: the shelf/detail/reader swap is a
            direct conditional render so the shared `layoutId` cover element
            (present in exactly one of the three at a time) can be measured
            in both its old and new position across the same commit — that's
            what makes Framer Motion animate it traveling between them,
            rather than just appearing in place. Each view still fades in on
            its own via a plain mount transition. */}
        <LayoutGroup id="book-shop">
          <>
            {view === 'shelf' && (
              <motion.div key="shelf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher un livre…"
                      aria-label="Rechercher un livre"
                      className="w-full rounded-full border border-ink/15 bg-paper py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/50 focus-visible:border-accent"
                    />
                  </div>
                  <div className="dt-no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:px-0">
                    {BOOK_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={clsx(
                          'shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors',
                          category === cat ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-muted hover:border-ink/30 hover:text-ink',
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {showFeatured && featured && (
                  <button
                    type="button"
                    onClick={() => open(featured.id)}
                    className="mb-10 flex w-full flex-col items-start gap-5 rounded-2xl border border-ink/10 bg-card p-6 text-left transition-colors hover:border-ink/20 sm:flex-row sm:items-center sm:p-8"
                  >
                    <BookCover book={featured} layoutId={`cover-${featured.id}`} big />
                    <div>
                      <TechnicalLabel dot={false} className="text-muted/60">
                        EN VEDETTE
                      </TechnicalLabel>
                      <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{featured.title}</h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{featured.description}</p>
                    </div>
                  </button>
                )}

                <TechnicalLabel dot={false} className="mb-5 text-muted/60">
                  {query || category !== 'Tous' ? 'RÉSULTATS' : 'TOUS LES LIVRES'}
                </TechnicalLabel>
                <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
                  {filtered.map((book) => (
                    <ShopCard
                      key={book.id}
                      book={book}
                      isOwned={isOwned(book)}
                      isSaved={saved.has(book.id)}
                      onOpen={() => open(book.id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                  {filtered.length === 0 && <p className="col-span-full py-6 text-sm text-muted">Aucun livre ne correspond à cette recherche.</p>}
                </div>
              </motion.div>
            )}

            {view === 'detail' && activeBook && (
              <DetailView
                key="detail"
                book={activeBook}
                isOwned={isOwned(activeBook)}
                isSaved={saved.has(activeBook.id)}
                onToggleSave={toggleSave}
                onBack={() => setView('shelf')}
                onBuy={() => setOwnedOverrides((prev) => ({ ...prev, [activeBook.id]: true }))}
                onRead={() => setView('reader')}
              />
            )}

            {view === 'reader' && activeBook && (
              <ReaderView
                key="reader"
                book={activeBook}
                isOwned={isOwned(activeBook)}
                onBack={() => setView('detail')}
                onBuy={() => setOwnedOverrides((prev) => ({ ...prev, [activeBook.id]: true }))}
              />
            )}
          </>
        </LayoutGroup>
      </div>
    </section>
  )
}
