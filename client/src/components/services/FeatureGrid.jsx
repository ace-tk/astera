import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { accent } from '@/utils/accent'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const COLS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * A grid of icon + title + body cards — the reusable counterpart to the
 * homepage's HowItWorks stage cards, generalized for any service page's
 * "four reasons / four benefits" style content block.
 */
export default function FeatureGrid({ eyebrow, heading, lead, items, color = 'royal', columns = 4 }) {
  const a = accent(color)

  return (
    <div>
      {(eyebrow || heading || lead) && (
        <Reveal className="max-w-2xl">
          {eyebrow && (
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink/30" /> {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">
              {heading}
            </h2>
          )}
          {lead && <p className="mt-4 text-base leading-relaxed text-muted text-pretty">{lead}</p>}
        </Reveal>
      )}

      <div className={cn('mt-8 grid grid-cols-1 gap-4', COLS[columns] || COLS[4])}>
        {items.map((item, i) => {
          const Icon = item.icon
          const card = (
            <div className="group h-full rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', a.softBg, a.text)}>
                  <Icon className="h-5 w-5" />
                </span>
                {item.cta && (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/8 text-muted transition-all group-hover:border-ink/20 group-hover:text-ink group-hover:rotate-45">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight">{item.title}</h3>
              {item.body && <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>}
              {item.cta && (
                <span className={cn('mt-4 inline-block text-sm font-medium', a.text)}>{item.cta.label}</span>
              )}
            </div>
          )
          return (
            <Reveal key={item.title} delay={(i % 4) * 0.05} className="h-full">
              {item.cta?.to ? (
                <Link to={item.cta.to} className="block h-full">
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
