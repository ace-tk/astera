import { useMemo, useState } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { Heart, Search } from 'lucide-react'
import clsx from 'clsx'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import BookCover from '@/components/atoopv/BookCover'
import BookReader from '@/components/atoopv/BookReader'
import { usePageMeta } from '@/hooks/usePageMeta'
import { COMPLIANCE_BOOKS, BOOK_CATEGORIES } from '@/constants/complianceBooks'

const EASE = [0.16, 1, 0.3, 1]

function ShopCard({ book, isSaved, onOpen, onToggleSave }) {
  return (
    <div className="group flex flex-col">
      <div className="relative">
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
      </div>

      <button type="button" onClick={onOpen} className="mt-3 text-left">
        <h3 className="line-clamp-1 font-display text-base text-ink">{book.title}</h3>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted/60">{book.author}</p>
      </button>

      <span className="mt-2 font-mono text-sm text-ink">{book.price}</span>
    </div>
  )
}

function DetailView({ book, isSaved, onToggleSave, onBack, onRequest, requested, onReadPreview }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
        ← Retour à la boutique
      </button>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[11rem_1fr] sm:gap-12">
        <div className="relative mx-auto sm:mx-0">
          <BookCover book={book} layoutId={`cover-${book.id}`} big />
        </div>

        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted/60">{book.category}</span>
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
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRequest}
              className="rounded-full bg-ink px-7 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-90"
            >
              {requested ? 'Demande envoyée ✓' : `Demander ce guide — ${book.price}`}
            </button>

            {book.previewPages ? (
              <button
                type="button"
                onClick={onReadPreview}
                className="rounded-full border border-ink/15 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink/30"
              >
                Lire un extrait →
              </button>
            ) : (
              <span className="inline-flex items-center rounded-full border border-ink/10 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted/50">
                Extrait bientôt disponible
              </span>
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

/**
 * ATOOPV Shop / Compliance Books (/atoopv/boutique) — the real production
 * equivalent of the /design-test Compliance Books prototype (Experiment 09),
 * rebuilt as its own page with a shared `COMPLIANCE_BOOKS` data source (see
 * constants/complianceBooks.js) and a dedicated full-screen reader
 * (BookReader.jsx) instead of the prototype's inline reading-progress view.
 *
 * shelf / detail / reader are three mutually-exclusive views, not a modal
 * stacked over the page — a direct conditional render (no AnimatePresence
 * wrapping the swap) is what lets the shared `layoutId` book cover be
 * measured in both its old and new position across one commit, so Framer
 * Motion animates it traveling between them.
 */
export default function Boutique() {
  usePageMeta({
    title: 'Boutique — Compliance Books | ATOOPV',
    description: 'Des guides pratiques pour comprendre, agir et maîtriser les enjeux du CSE.',
  })

  const [view, setView] = useState('shelf')
  const [activeId, setActiveId] = useState(null)
  const [category, setCategory] = useState('Tous')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(() => new Set())
  const [requested, setRequested] = useState(() => new Set())
  const filtered = useMemo(() => {
    return COMPLIANCE_BOOKS.filter((b) => {
      const matchesCategory = category === 'Tous' || b.category === category
      const matchesQuery = b.title.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  const featured = COMPLIANCE_BOOKS.find((b) => b.featured)
  const showFeatured = category === 'Tous' && !query

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const requestBook = (id) => setRequested((prev) => new Set(prev).add(id))

  const open = (id) => {
    setActiveId(id)
    setView('detail')
  }

  const activeBook = COMPLIANCE_BOOKS.find((b) => b.id === activeId)

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="relative min-h-screen bg-paper">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-36 sm:pt-40 lg:pt-44">
        <div className="shell pb-24 sm:pb-32">
          {view !== 'reader' && (
            <div className="mb-14 sm:mb-20">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">BOUTIQUE / COMPLIANCE BOOKS</span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-5xl">
                Compliance Books.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                Des guides pratiques pour comprendre, agir et maîtriser les enjeux du CSE.
              </p>
            </div>
          )}

          <LayoutGroup id="boutique">
            <>
              {view === 'shelf' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
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
                    <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:px-0">
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
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted/60">EN VEDETTE</span>
                        <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{featured.title}</h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{featured.description}</p>
                      </div>
                    </button>
                  )}

                  <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted/60">
                    {query || category !== 'Tous' ? 'RÉSULTATS' : 'TOUS LES LIVRES'}
                  </p>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
                    {filtered.map((book) => (
                      <ShopCard key={book.id} book={book} isSaved={saved.has(book.id)} onOpen={() => open(book.id)} onToggleSave={toggleSave} />
                    ))}
                    {filtered.length === 0 && <p className="col-span-full py-6 text-sm text-muted">Aucun livre ne correspond à cette recherche.</p>}
                  </div>
                </motion.div>
              )}

              {view === 'detail' && activeBook && (
                <DetailView
                  book={activeBook}
                  isSaved={saved.has(activeBook.id)}
                  onToggleSave={toggleSave}
                  onBack={() => setView('shelf')}
                  onRequest={() => requestBook(activeBook.id)}
                  requested={requested.has(activeBook.id)}
                  onReadPreview={() => setView('reader')}
                />
              )}

              {view === 'reader' && activeBook && (
                <BookReader
                  book={activeBook}
                  onClose={() => setView('shelf')}
                  onGetBook={() => setView('detail')}
                />
              )}
            </>
          </LayoutGroup>
        </div>
      </section>

      {view !== 'reader' && <Footer />}
    </motion.main>
  )
}
