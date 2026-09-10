import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

// Existing item data sometimes bakes a trailing "→" glyph straight into the
// cta string (e.g. VeilleJuridique's "Lire →") — stripped here only so it
// isn't shown twice alongside the new animated ArrowRight icon; the label
// word itself (what the text actually says) is untouched.
function stripTrailingArrow(label) {
  return label.replace(/\s*(→|->)\s*$/, '')
}

/**
 * A grid of article/guide preview cards — small badge, title, body, link.
 * Used for the Accueil "veille juridique" and "ressources" blocks; kept
 * generic (no ATOOPV-specific copy) so future Ressources/Atoosavoir pages
 * can reuse it instead of duplicating this card markup.
 */
export default function ArticleGrid({ eyebrow, heading, lead, items, color = 'sky', columns = 3, footerCta }) {
  const a = accent(color)

  return (
    <div>
      {(eyebrow || heading || lead) && (
        <Reveal className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <span className="eyebrow justify-center">
              <span className="h-px w-8 bg-ink/30" /> {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">
              {heading}
            </h2>
          )}
          {lead && <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted text-pretty">{lead}</p>}
        </Reveal>
      )}

      <div className={cn('mx-auto mt-8 grid grid-cols-1 gap-4', columns === 2 ? 'sm:grid-cols-2 max-w-2xl' : 'sm:grid-cols-2 lg:grid-cols-3')}>
        {items.map((item, i) => (
          <Reveal key={item.title} delay={(i % 3) * 0.06}>
            <Link
              to={item.to}
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-royal/25 hover:shadow-lift"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-grid-faint opacity-0 transition-opacity duration-300 [background-size:20px_20px] group-hover:opacity-30"
                aria-hidden="true"
              />
              {item.badge && (
                <span className={cn('relative w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', a.softBg, a.text)}>
                  {item.badge}
                </span>
              )}
              <h3 className="relative mt-4 font-display text-lg font-medium tracking-tight transition-colors duration-300 group-hover:text-royal">
                {item.title}
              </h3>
              <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted">{item.body}</p>
              <span className={cn('relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium', a.text)}>
                {stripTrailingArrow(item.cta || 'Lire')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      {footerCta && (
        <Reveal delay={0.2} className="mt-8 text-center">
          <Link to={footerCta.to} className={cn('inline-flex items-center gap-1.5 text-sm font-medium link-underline', a.text)}>
            {footerCta.label}
          </Link>
        </Reveal>
      )}
    </div>
  )
}
