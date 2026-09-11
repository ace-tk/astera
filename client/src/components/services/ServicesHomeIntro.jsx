import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { renderEmphasis } from '@/utils/richText'

/**
 * The /services hub's compact hero: existing breadcrumb badge, existing
 * eyebrow, existing title, existing lead paragraph and the two existing CTA
 * links on the left, one image on the right — the only image anywhere in
 * the Services section (every other Services page stays text/layout only).
 * Scoped to this one page — see utils/servicesHomeContent.js for how the
 * text content is lifted, verbatim, out of the source markdown, and
 * ServicesStatsStrip.jsx for the stats row that used to live inside this
 * same block and now sits below the hero as its own full-width strip.
 */
export default function ServicesHomeIntro({ badge, title, eyebrow, paragraph, ctas = [], image }) {
  return (
    <section className="relative pt-28 sm:pt-32 lg:pt-36">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              {badge && (
                <span className="chip w-fit gap-2 text-ink/70">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {badge}
                </span>
              )}
              {eyebrow && <span className="chip w-fit gap-2 text-ink/70">{eyebrow}</span>}
            </div>

            {title && (
              <h1 className="mt-6 font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">{renderEmphasis(title)}</h1>
            )}

            {paragraph && <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">{paragraph}</p>}

            {ctas.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {ctas.map((c, i) =>
                  c.href.startsWith('#') ? (
                    <Button key={c.href} as="a" href={c.href} size="lg" variant={i === 0 ? 'accent' : 'soft'}>
                      {c.label}
                    </Button>
                  ) : (
                    <Button key={c.href} as={Link} to={resolveServiceHref(c.href).href} size="lg" variant={i === 0 ? 'accent' : 'soft'}>
                      {c.label}
                    </Button>
                  ),
                )}
              </div>
            )}
          </Reveal>

          {image && (
            <Reveal delay={0.1} direction="right">
              <div className="overflow-hidden rounded-[2rem] border border-ink/8 shadow-float">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="aspect-[6/5] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
