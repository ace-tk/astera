import { Check } from 'lucide-react'
import { accent } from '@/utils/accent'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * Tiered benefit cards — the same visual grammar as the homepage Pricing
 * cards (featured tier lifts + rings), reused here for format/tier
 * comparisons that carry a feature checklist instead of a price.
 */
export default function BenefitsSection({ eyebrow, heading, lead, tiers, color = 'royal' }) {
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

      <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08} className="h-full">
            <div
              className={cn(
                'relative flex h-full flex-col rounded-[1.75rem] border p-8 transition-shadow',
                t.featured
                  ? cn('border-transparent bg-card shadow-float ring-1 lg:-translate-y-3', a.ring)
                  : 'border-ink/8 bg-card/70 shadow-soft',
              )}
            >
              {t.badge && (
                <span className={cn('absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-medium text-white shadow-glow', a.bg)}>
                  {t.badge}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', a.bg)} />
                <h3 className="font-display text-xl font-semibold tracking-tight">{t.name}</h3>
              </div>
              <p className="mt-1.5 text-sm text-muted">{t.tagline}</p>

              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-ink/80">
                    <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full', a.softBg, a.text)}>
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {t.idealFor && (
                <div className="mt-auto pt-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Ideal for</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{t.idealFor}</p>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
