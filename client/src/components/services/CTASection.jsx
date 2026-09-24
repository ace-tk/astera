import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * A light, in-page closing CTA — a smaller sibling to the Footer's dark CTA
 * slab, for sections mid-page. `visual` is optional: when passed, the card
 * becomes a two-column (content / image) layout instead of the default
 * centered one — every other caller that doesn't pass it renders exactly as
 * before, byte-for-byte unchanged.
 */
export default function CTASection({ eyebrow, heading, body, primaryCta, secondaryCta, footer, visual }) {
  if (visual) {
    return (
      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <Reveal>
            <div className="grid grid-cols-1 items-center gap-10 rounded-[2rem] border border-ink/8 bg-card px-8 py-12 shadow-soft sm:grid-cols-2 sm:gap-12 sm:px-14 sm:py-14">
              <div>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h2 className={cn('font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl', eyebrow && 'mt-5')}>
                  {heading}
                </h2>
                {body && <p className="mt-4 max-w-lg text-base leading-relaxed text-muted text-pretty">{body}</p>}
                <div className="mt-8 flex flex-wrap gap-3">
                  {primaryCta && (
                    <Button as={Link} to={primaryCta.to} size="lg" variant="accent">
                      {primaryCta.label}
                    </Button>
                  )}
                  {secondaryCta && (
                    <Button as={Link} to={secondaryCta.to} size="lg" variant="soft">
                      {secondaryCta.label}
                    </Button>
                  )}
                </div>
                {footer && <p className="mt-7 text-xs text-muted">{footer}</p>}
              </div>
              <div>{visual}</div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-14 sm:py-16">
      <div className="shell">
        <Reveal>
          <div className="rounded-[2rem] border border-ink/8 bg-card px-8 py-14 text-center shadow-soft sm:px-14">
            {eyebrow && <span className="eyebrow justify-center">{eyebrow}</span>}
            <h2 className={cn('mx-auto max-w-xl font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl', eyebrow && 'mt-5')}>
              {heading}
            </h2>
            {body && <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted text-pretty">{body}</p>}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {primaryCta && (
                <Button as={Link} to={primaryCta.to} size="lg" variant="accent">
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Button as={Link} to={secondaryCta.to} size="lg" variant="soft">
                  {secondaryCta.label}
                </Button>
              )}
            </div>
            {footer && <p className="mt-7 text-xs text-muted">{footer}</p>}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
