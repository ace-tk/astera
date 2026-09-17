import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

// Cycled per card purely for the editorial "each card its own color" look
// (same technique PlatformShowcase.jsx uses for its tiles) — all three
// articles are the same "Veille juridique CSE" category, so this is a
// decorative rotation, not a second (invented) taxonomy.
const CARD_ACCENTS = ['sky', 'royal', 'coral']

function BlogCard({ item, color }) {
  const a = accent(color)

  return (
    <Reveal className="h-full">
      <Link to={item.to} className="group block h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-ink/8 bg-card/95 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-royal/25 hover:shadow-lift">
          <div className="flex items-center justify-between px-6 pt-5">
            {item.badge && (
              <span className={cn('font-mono text-[10px] uppercase tracking-[0.16em]', a.text)}>{item.badge}</span>
            )}
            <ArrowRight className={cn('h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100')} />
          </div>

          <span className={cn('mx-6 mt-3 block h-1 w-10 rounded-full transition-all duration-300 group-hover:w-16', a.bg)} />

          <div className="flex flex-1 flex-col gap-2 px-6 pb-6 pt-4">
            <h3 className="font-display text-base font-medium leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-royal">
              {item.title}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-muted">{item.body}</p>
            <span className={cn('mt-1 inline-flex items-center gap-1.5 text-sm font-medium', a.text)}>
              {item.cta}
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

/**
 * Homepage "Blog" preview — the "Veille juridique CSE" section (`ACCUEIL.veille`
 * in constants/atoopvHome.js, itself lifted verbatim from content/home/accueil.md,
 * the reference index.html's own homepage copy). Same eyebrow/heading/lead
 * header as the rest of the homepage's editorial sections, but a compact
 * 4-column card grid (matching the requested book/card-grid presentation)
 * instead of ArticleGrid's plain 3-column list — content, order and links
 * are the exact three existing articles, unchanged.
 */
export default function BlogArticlesGrid({ data }) {
  const { eyebrow, heading, lead, items, footerCta } = data

  return (
    <div>
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow justify-center">
          <span className="h-px w-8 bg-ink/30" /> {eyebrow}
        </span>
        <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted text-pretty">{lead}</p>
      </Reveal>

      <div className="mx-auto mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <BlogCard key={item.title} item={item} color={CARD_ACCENTS[i % CARD_ACCENTS.length]} />
        ))}
      </div>

      {footerCta && (
        <Reveal delay={0.2} className="mt-8 text-center">
          <Link to={footerCta.to} className="inline-flex items-center gap-1.5 text-sm font-medium text-sky link-underline">
            {footerCta.label}
          </Link>
        </Reveal>
      )}
    </div>
  )
}
