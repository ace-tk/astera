import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { renderEmphasis } from '@/utils/richText'
import { cn } from '@/utils/cn'

/**
 * atoosavoir-only hero: same content contract as the shared AtoopvHero
 * (badge/title/lead/CTAs) plus the page's existing trust-badge pills, laid
 * out as one bordered image|content frame — image left, copy right — in the
 * same editorial spirit as the ATOOPV homepage hero's split composition,
 * kept in AtooSavoir's own rounded-corner language rather than the
 * homepage's sharp-cornered technical frame. Kept page-local since
 * AtoopvHero is reused by several other ATOOPV pages that still want its
 * centered layout.
 */
export default function AtoosavoirHero({ badge, title, lead, primaryCta, secondaryCta, trustBadges = [], image }) {
  return (
    <section className="relative pt-28 pb-10 sm:pt-32 sm:pb-12 lg:pt-36">
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
            {badge && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="chip w-fit">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-ink/70">{badge}</span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 font-display text-display-sm font-medium leading-[1.05] tracking-tight text-balance"
            >
              {renderEmphasis(title)}
            </motion.h1>

            {lead && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="mt-4 max-w-xl text-lg leading-relaxed text-muted text-pretty"
              >
                {lead}
              </motion.p>
            )}

            {(primaryCta || secondaryCta) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                {primaryCta &&
                  (primaryCta.to.startsWith('#') ? (
                    <Button as="a" href={primaryCta.to} size="lg" variant="accent">
                      {primaryCta.label}
                    </Button>
                  ) : (
                    <Button as={Link} to={primaryCta.to} size="lg" variant="accent">
                      {primaryCta.label}
                    </Button>
                  ))}
                {secondaryCta &&
                  (secondaryCta.to.startsWith('#') ? (
                    <Button as="a" href={secondaryCta.to} size="lg" variant="soft">
                      {secondaryCta.label}
                    </Button>
                  ) : (
                    <Button as={Link} to={secondaryCta.to} size="lg" variant="soft">
                      {secondaryCta.label}
                    </Button>
                  ))}
              </motion.div>
            )}

            {trustBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="mt-6 flex flex-wrap gap-2"
              >
                {trustBadges.map((b) => (
                  <span key={b} className="chip text-xs text-ink/60 transition-colors duration-300 hover:border-ink/20 hover:text-ink/80">
                    {b}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
