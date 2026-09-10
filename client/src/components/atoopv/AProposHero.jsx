import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { renderEmphasis } from '@/utils/richText'
import { cn } from '@/utils/cn'

/**
 * À propos-only hero content — badge/heading/lead/CTAs, same contract as
 * the shared AtoopvHero (kept page-local since AtoopvHero is reused
 * elsewhere with a centered layout). No wrapping `<section>`/`.shell` of
 * its own: it's rendered inside APropos.jsx's shared grid, in the same
 * column as the five story sections, so the "Sur cette page" rail beside it
 * can stay sticky across the whole page instead of just the hero.
 */
export default function AProposHero({ badge, title, lead, primaryCta, secondaryCta }) {
  return (
    <div>
      {badge && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="chip w-fit">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="text-ink/70">{badge}</span>
        </motion.div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn('max-w-2xl font-display text-display-sm font-medium leading-[1.05] tracking-tight text-balance', badge && 'mt-5')}
      >
        {renderEmphasis(title)}
      </motion.h1>

      {lead && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-5 max-w-xl text-lg leading-relaxed text-muted text-pretty"
        >
          {lead}
        </motion.p>
      )}

      {(primaryCta || secondaryCta) && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="mt-7 flex flex-wrap gap-3"
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
  )
}
