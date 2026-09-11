import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { renderEmphasis } from '@/utils/richText'
import { cn } from '@/utils/cn'

/**
 * The /services hub's compact hero: one bordered image|content frame, image
 * left, existing breadcrumb badge/eyebrow/title/lead paragraph/CTAs right —
 * the same split-frame composition as the ATOOPV homepage hero and the
 * AtooSavoir hero (AtoosavoirHero.jsx), so the three read as one visual
 * language. The only image anywhere in the Services section (every other
 * Services page stays text/layout only). Scoped to this one page — see
 * utils/servicesHomeContent.js for how the text content is lifted, verbatim,
 * out of the source markdown, and ServicesStatsStrip.jsx for the stats row
 * that used to live inside this same block and now sits below the hero as
 * its own full-width strip.
 */
export default function ServicesHomeIntro({ badge, title, eyebrow, paragraph, ctas = [], image }) {
  return (
    <section className="relative pt-28 sm:pt-32 lg:pt-36">
      <div className="shell">
        <div className="overflow-hidden rounded-[2rem] border border-ink/8 shadow-float lg:grid lg:grid-cols-2 lg:items-stretch">
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="group relative h-64 overflow-hidden sm:h-80 lg:h-auto"
            >
              <img
                src={image.src}
                alt={image.alt}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
              <div className="pointer-events-none absolute inset-0 bg-royal/0 transition-colors duration-500 group-hover:bg-royal/[0.06]" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-white/10" aria-hidden="true" />
            </motion.div>
          )}

          <div className={cn('border-t border-ink/8 p-6 sm:p-9 lg:border-l lg:border-t-0 lg:p-12', !image && 'lg:col-span-2')}>
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
                <h1 className="mt-5 font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">{renderEmphasis(title)}</h1>
              )}

              {paragraph && <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted text-pretty">{paragraph}</p>}

              {ctas.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-3">
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
          </div>
        </div>
      </div>
    </section>
  )
}
