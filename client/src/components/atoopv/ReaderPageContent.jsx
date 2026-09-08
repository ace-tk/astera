import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import BookCover from './BookCover'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Renders one reader page's content by `kind` — cover, text, section
 * divider, key-points, checklist, quote, or the special end-of-preview CTA.
 * Deliberately varied per the brief ("don't make every page visually
 * identical") rather than one generic template repeated eight times.
 */
export default function ReaderPageContent({ page, book, pageNumber, totalPages, onGetBook, onBackToShop }) {
  if (page.kind === 'cover') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <BookCover book={book} layoutId={`cover-${book.id}`} big />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted/60">{page.subtitle}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/40">{page.publisher}</p>
        </div>
      </div>
    )
  }

  if (page.kind === 'end') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted/60">Fin de l&apos;extrait</p>
        <h3 className="font-display text-2xl leading-tight text-ink sm:text-3xl">Vous voulez aller plus loin ?</h3>
        <p className="max-w-xs text-sm leading-relaxed text-muted">Obtenez le guide complet.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onGetBook}
            className="rounded-full bg-ink px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-90"
          >
            Obtenir le livre →
          </button>
          <button
            type="button"
            onClick={onBackToShop}
            className="rounded-full border border-ink/15 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink/30"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted/60">
        {String(pageNumber).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
      </p>

      {page.kind === 'divider' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/50">{page.caption}</p>
          <h3 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">{page.heading}</h3>
          <div className="mt-2 h-px w-16 bg-ink/20" aria-hidden="true" />
        </div>
      ) : (
        <>
          <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{page.heading}</h3>
          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            {page.kind === 'text' &&
              page.body.map((p, i) => (
                <p key={i} className="mb-4 max-w-md text-sm leading-relaxed text-ink/75 sm:text-base">
                  {p}
                </p>
              ))}

            {page.kind === 'keypoints' &&
              page.items.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: EASE }}
                  className="mb-3 flex items-start gap-3 border-b border-ink/10 pb-3"
                >
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] text-royal">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-ink/85">{item}</p>
                </motion.div>
              ))}

            {page.kind === 'checklist' &&
              page.items.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: EASE }}
                  className="mb-3 flex items-center gap-3"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald/40 text-emerald">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <p className="text-sm text-ink/85">{item}</p>
                </motion.div>
              ))}

            {page.kind === 'quote' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
                className="flex h-full flex-col items-center justify-center gap-4 py-6 text-center"
              >
                <p className="font-display text-xl italic leading-snug text-ink sm:text-2xl">« {page.quote} »</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted/60">{page.attribution}</p>
              </motion.div>
            )}
          </div>
        </>
      )}
    </>
  )
}
