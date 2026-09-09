import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { renderEmphasis } from '@/utils/richText'
import { cn } from '@/utils/cn'

/**
 * À propos-only hero. Same content contract as the shared AtoopvHero
 * (badge/title/lead/CTAs) — kept as a separate, page-local component rather
 * than a change to AtoopvHero because that one is reused by several other
 * ATOOPV pages that still want its centered single-column layout.
 *
 * The right-hand panel isn't a new content block: it's the same five
 * chapter numbers/eyebrows rendered further down this page (see
 * AProposStory), reused here as an at-a-glance index so the hero's second
 * column reads as an intentional editorial device instead of empty space.
 */
export default function AProposHero({ badge, title, lead, primaryCta, secondaryCta, chapters = [] }) {
  return (
    <section className="relative pt-36 pb-10 sm:pt-40 sm:pb-12 lg:pt-48 lg:pb-16">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-16 xl:grid-cols-[1fr_23rem]">
          <div>
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="chip"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-ink/70">{badge}</span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={cn('max-w-2xl font-display text-display-sm font-medium leading-[1.05] tracking-tight text-balance', badge && 'mt-6')}
            >
              {renderEmphasis(title)}
            </motion.h1>

            {lead && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty"
              >
                {lead}
              </motion.p>
            )}

            {(primaryCta || secondaryCta) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8 }}
                className="mt-9 flex flex-wrap gap-3"
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

          {chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2rem] border border-ink/8 bg-card/60 p-6 sm:p-7 lg:mt-3"
            >
              <span className="eyebrow">
                <span className="h-px w-6 bg-ink/25" /> Sur cette page
              </span>
              <ul className="mt-5 flex flex-wrap gap-2 lg:block lg:gap-0">
                {chapters.map((c) => (
                  <li key={c.number} className="lg:border-t lg:border-ink/6 lg:py-3 lg:first:border-t-0">
                    <span className="inline-flex items-baseline gap-2 rounded-full border border-ink/8 bg-paper/70 px-3 py-1.5 text-xs font-medium text-ink/70 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:text-sm lg:leading-snug lg:text-ink/75">
                      <span className="font-display text-ink/35">{c.number}</span>
                      {c.eyebrow}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
