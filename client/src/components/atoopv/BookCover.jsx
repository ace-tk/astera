import { motion } from 'framer-motion'
import clsx from 'clsx'

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

/**
 * The one book-cover visual used everywhere in the Shop — grid cards, the
 * detail view, and the reader's opening page. An original in-app design
 * (accent color + title/author, no external artwork). Given the same
 * `layoutId` in two places at once (e.g. detail view + reader), Framer
 * Motion's shared layout animation makes it visually travel and resize
 * between them instead of just appearing in place — see BookReader.jsx and
 * Boutique.jsx for how the shelf → detail → reader swap relies on this.
 */
export default function BookCover({ book, layoutId, big }) {
  const colorVar = ACCENT_VAR[book.accent] || ACCENT_VAR.royal
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ duration: 0.55, ease: EASE }}
      className={clsx(
        'relative flex shrink-0 flex-col justify-between overflow-hidden rounded-lg p-4',
        big ? 'h-56 w-40 p-5 sm:h-64 sm:w-44' : 'h-40 w-full',
      )}
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
