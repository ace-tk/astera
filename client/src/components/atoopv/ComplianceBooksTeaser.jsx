import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { COMPLIANCE_BOOKS_TEASER } from '@/constants/atoopvHome'
import { cn } from '@/utils/cn'

/** An original, in-app cover — accent edge + title/author, no external
 * artwork — sized to the brief's 180–220px desktop width. */
function BookCover({ title, author, a }) {
  return (
    <div className="relative h-[15.5rem] w-40 shrink-0 overflow-hidden rounded-xl border border-ink/8 bg-paper shadow-soft sm:h-[17rem] sm:w-48">
      <div className={cn('absolute inset-y-0 left-0 w-1.5', a.bg)} aria-hidden="true" />
      <div className="flex h-full flex-col justify-between p-4 pl-6">
        <span className={cn('h-2 w-2 rounded-full', a.bg)} aria-hidden="true" />
        <div>
          <p className="font-display text-lg font-medium leading-tight text-ink">{title}</p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted/70">{author}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * A small, restrained "window" into the planned Compliance Books shop —
 * not the shop itself. Category pills are decorative/visual-only (per the
 * brief: no on-page filtering), and the entire featured card is one Link so
 * "click anywhere on the featured book" is literal rather than a fake
 * clickable-div — the visible CTA text inside it is not a second nested
 * link, since both CTAs point at the same destination today.
 */
export default function ComplianceBooksTeaser() {
  const data = COMPLIANCE_BOOKS_TEASER
  const [activeCategory, setActiveCategory] = useState(data.categories[0])
  const a = accent(data.featured.accent)

  return (
    <section className="relative border-t border-ink/8 py-14 sm:py-16">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink/30" /> {data.eyebrow}
          </span>
          <h2 className="mt-5 font-display text-4xl font-medium leading-[0.98] tracking-tight text-balance sm:text-5xl">
            {data.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted text-pretty">{data.lead}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-7 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto">
          {data.categories.map((cat, i) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
                activeCategory === cat ? 'border-ink bg-ink text-paper' : 'border-ink/12 text-muted hover:border-ink/25 hover:text-ink',
              )}
              style={{ transitionDelay: `${i * 20}ms` }}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.2} className="mt-8">
          <Link
            to={data.shopHref}
            className="group flex flex-col gap-6 rounded-[1.75rem] border border-ink/8 bg-card/95 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-ink/16 hover:shadow-lift sm:flex-row sm:items-center sm:gap-8 sm:p-8"
          >
            <div className="mx-auto transition-transform duration-300 group-hover:translate-x-1 sm:mx-0">
              <BookCover title={data.featured.title} author={data.featured.author} a={a} />
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', a.softBg, a.text)}>
                  {data.featured.badge}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted/60">{data.featured.category}</span>
              </div>

              <h3 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">{data.featured.title}</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted sm:mx-0">{data.featured.description}</p>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-6">
                <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', a.text)}>
                  Découvrir la boutique
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors group-hover:text-ink">
                  Voir le livre
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
