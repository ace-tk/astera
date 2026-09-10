import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import { renderEmphasis } from '@/utils/richText'

/**
 * atoosavoir-only hero: same content contract as the shared AtoopvHero
 * (badge/title/lead/CTAs) plus the page's existing trust-badge pills, laid
 * out as an asymmetric two-column composition (copy left, one editorial
 * image right) instead of AtoopvHero's centered single column. Kept
 * page-local since AtoopvHero is reused by several other ATOOPV pages that
 * still want its centered layout.
 */
export default function AtoosavoirHero({ badge, title, lead, primaryCta, secondaryCta, trustBadges = [], image }) {
  return (
    <section className="relative pt-36 pb-12 sm:pt-40 sm:pb-14 lg:pt-44">
      <EditorialGridBackground className="-z-10" />
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
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
              className="mt-6 font-display text-display-sm font-medium leading-[1.05] tracking-tight text-balance"
            >
              {renderEmphasis(title)}
            </motion.h1>

            {lead && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="mt-5 max-w-xl text-lg leading-relaxed text-muted text-pretty"
              >
                {lead}
              </motion.p>
            )}

            {(primaryCta || secondaryCta) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8 }}
                className="mt-8 flex flex-wrap gap-3"
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
                className="mt-7 flex flex-wrap gap-2"
              >
                {trustBadges.map((b) => (
                  <span key={b} className="chip text-xs text-ink/60 transition-colors duration-300 hover:border-ink/20 hover:text-ink/80">
                    {b}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {image && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-[2rem] border border-ink/8 shadow-float transition-shadow duration-500 hover:shadow-lift"
            >
              <div className="aspect-[4/3] overflow-hidden lg:aspect-[5/4]">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
