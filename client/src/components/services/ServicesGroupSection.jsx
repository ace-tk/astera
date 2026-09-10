import { Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const COLS = {
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * One /services hub service group ("Rédaction de PV", "Formation &
 * accompagnement", "Pourquoi AtooPV"): the existing group label/heading/
 * paragraph, then its existing icon+heading+description[+CTA] items as a
 * compact card grid — the same card language as FeatureGrid, so the icon
 * and heading share one row instead of stacking on separate lines. Scoped
 * to this one page — see utils/servicesHomeContent.js for how each field
 * is lifted, verbatim, out of the source markdown.
 */
export default function ServicesGroupSection({ label, heading, body, items, color = 'royal' }) {
  const a = accent(color)

  return (
    <div>
      <Reveal className="max-w-2xl">
        {label && (
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink/30" /> {label}
          </span>
        )}
        {heading && <h2 className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>}
        {body && <p className="mt-3 text-base leading-relaxed text-muted text-pretty">{body}</p>}
      </Reveal>

      <div className={cn('mt-8 grid grid-cols-1 gap-4', COLS[items.length] || COLS[4])}>
        {items.map((item, i) => {
          const card = (
            <div className="group flex h-full flex-col rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="font-display text-base font-medium tracking-tight">{item.heading}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              {item.cta && <span className={cn('mt-4 inline-block text-sm font-medium', a.text)}>{item.cta.label}</span>}
            </div>
          )

          return (
            <Reveal key={item.heading} delay={(i % 4) * 0.05} className="h-full">
              {item.cta ? (
                <Link to={resolveServiceHref(item.cta.href).href} className="block h-full">
                  {card}
                </Link>
              ) : (
                card
              )}
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
