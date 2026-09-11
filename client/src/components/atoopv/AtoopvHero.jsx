import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { renderEmphasis } from '@/utils/richText'
import { cn } from '@/utils/cn'

/**
 * Hero for the ported ATOOPV pages. Same grammar as ServiceHero (badge,
 * display heading, lead, CTAs) plus an optional full-width image below the
 * copy — ServiceHero has no image slot, and the ATOOPV Accueil hero ships
 * with one, so this variant exists for reuse across the rest of the ported
 * ATOOPV site rather than bolting an image prop onto ServiceHero's contract.
 */
export default function AtoopvHero({ badge, title, lead, primaryCta, secondaryCta, image, hideTitle = false }) {
  return (
    <section className="relative pt-36 sm:pt-40 lg:pt-44">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="chip mx-auto"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-ink/70">{badge}</span>
            </motion.div>
          )}

          {!hideTitle && (
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={cn('mx-auto font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance', badge && 'mt-6')}
            >
              {renderEmphasis(title)}
            </motion.h1>
          )}

          {lead && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty"
            >
              {lead}
            </motion.p>
          )}

          {(primaryCta || secondaryCta) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="mt-9 flex flex-wrap justify-center gap-3"
            >
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
            </motion.div>
          )}
        </div>

        {image && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[2rem] border border-ink/8 shadow-float"
          >
            <img src={image.src} alt={image.alt} className="aspect-[21/9] w-full object-cover" />
          </motion.div>
        )}
      </div>
    </section>
  )
}
