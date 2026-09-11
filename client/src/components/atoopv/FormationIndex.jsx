import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * The Formations landing page's editorial index — the existing "à la
 * carte" formations, presented as numbered navigation rows instead of a
 * card grid. Each row's title/excerpt is the linked page's own real
 * content (via getServicePage/excerpt, same technique ArticleGrid and the
 * directory pages already use to assemble a listing from other pages
 * without duplicating or inventing copy) — see
 * utils/formationContent.js:extractCarteLinks for where the four links
 * themselves come from.
 */
function IndexRow({ number, title, excerpt, to, isLast }) {
  return (
    <Reveal>
      <Link
        to={to}
        className={cn('group relative flex items-start gap-5 py-6 transition-colors duration-300 sm:gap-8', !isLast && 'border-b border-ink/8')}
      >
        <span className="shrink-0 font-display text-3xl font-semibold leading-none text-ink/12 transition-colors duration-300 group-hover:text-royal/50 sm:text-4xl">
          {number}
        </span>
        <div className="min-w-0 flex-1 transition-transform duration-300 group-hover:translate-x-1">
          <h3 className="font-display text-lg font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-royal sm:text-2xl">
            {title}
          </h3>
          {excerpt && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted line-clamp-2">{excerpt}</p>}
        </div>
        <ArrowRight className="mt-1.5 h-5 w-5 shrink-0 text-ink/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-royal sm:mt-2" />
      </Link>
    </Reveal>
  )
}

export default function FormationIndex({ eyebrow, heading, items = [] }) {
  if (!items.length) return null

  return (
    <div>
      {(eyebrow || heading) && (
        <Reveal className="max-w-2xl">
          {eyebrow && (
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink/30" /> {eyebrow}
            </span>
          )}
          {heading && <h2 className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>}
        </Reveal>
      )}

      <div className="mt-6 border-t border-ink/8 sm:mt-8">
        {items.map((item, i) => (
          <IndexRow key={item.to} number={String(i + 1).padStart(2, '0')} {...item} isLast={i === items.length - 1} />
        ))}
      </div>
    </div>
  )
}
