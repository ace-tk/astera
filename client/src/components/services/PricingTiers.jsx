import { Link } from 'react-router-dom'
import { accent } from '@/utils/accent'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * A grid of fixed pricing-tier cards (segment, monthly price, included
 * units, overage rate) — distinct from PricingCalculator (a slider
 * estimator) and the landing Pricing section (SaaS seat plans hard-wired to
 * /app). Generic enough for any service page whose source lists discrete
 * priced tiers by segment.
 */
export default function PricingTiers({ eyebrow, heading, lead, tiers, note, cta, color = 'royal' }) {
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.06} className="h-full">
            <div className="flex h-full flex-col rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', a.bg)} />
                <h3 className="font-display text-sm font-medium tracking-tight text-ink/80">{t.segment}</h3>
              </div>
              <div className="mt-4 flex items-end gap-1.5">
                <span className="font-display text-3xl font-semibold tracking-tight">{t.price}</span>
                {t.unit && <span className="mb-1 text-xs text-muted">{t.unit}</span>}
              </div>
              <ul className="mt-5 space-y-2 text-sm text-ink/80">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {(note || cta) && (
        <Reveal delay={0.1} className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {note && <p className="max-w-xl text-xs leading-relaxed text-muted">{note}</p>}
          {cta && (
            <Button as={Link} to={cta.to} variant="soft" size="sm">
              {cta.label}
            </Button>
          )}
        </Reveal>
      )}
    </div>
  )
}
