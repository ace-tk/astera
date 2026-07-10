import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PRICING } from '@/constants/content'
import { accent } from '@/utils/accent'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/** Three plans; the featured tier lifts, warms, and carries the accent glow. */
export default function Pricing() {
  return (
    <section id="pricing" className="relative py-section">
      <div className="shell">
        <Reveal className="text-center">
          <span className="eyebrow justify-center">Pricing</span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
            Priced like a teammate, not a tax.
          </h2>
        </Reveal>

        <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
          {PRICING.map((p, i) => {
            const a = accent(p.color)
            return (
              <Reveal key={p.id} delay={i * 0.08} className="h-full">
                <div
                  className={cn(
                    'relative flex h-full flex-col rounded-[1.75rem] border p-8 transition-shadow',
                    p.featured
                      ? 'border-transparent bg-card shadow-float ring-1 ring-accent/20 lg:-translate-y-4 lg:scale-[1.02]'
                      : 'border-ink/8 bg-card/70 shadow-soft',
                  )}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white shadow-glow">
                      Most loved
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', a.bg)} />
                    <h3 className="font-display text-xl font-semibold tracking-tight">{p.name}</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{p.tagline}</p>

                  <div className="mt-6 flex items-end gap-1">
                    {p.price === null ? (
                      <span className="font-display text-4xl font-semibold">Let’s talk</span>
                    ) : (
                      <>
                        <span className="font-display text-5xl font-semibold tracking-tight">${p.price}</span>
                        <span className="mb-1.5 text-sm text-muted">/ seat / mo</span>
                      </>
                    )}
                  </div>

                  <ul className="mt-7 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-ink/80">
                        <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full', a.softBg, a.text)}>
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-2">
                    <Button
                      as={Link}
                      to="/app"
                      variant={p.featured ? 'accent' : 'soft'}
                      className="w-full"
                    >
                      {p.cta}
                    </Button>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
