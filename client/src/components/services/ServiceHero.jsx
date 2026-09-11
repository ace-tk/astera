import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { renderEmphasis } from '@/utils/richText'

/**
 * Hero for a service detail page. Same grammar as the homepage Hero (chip,
 * display heading, lead, CTAs) scaled down for an interior page, plus an
 * optional row of instance-type tags rendered as static chips rather than
 * AtoopV's scrolling marquee, and an optional breadcrumb trail above the badge.
 */
export default function ServiceHero({ badge, title, lead, tags, primaryCta, secondaryCta, breadcrumbs }) {
  return (
    <section className="relative pt-28 sm:pt-32 lg:pt-36">
      <div className="shell">
        {breadcrumbs?.length > 0 && (
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted"
          >
            {breadcrumbs.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink/20" />}
                {b.to ? (
                  <Link to={b.to} className="link-underline hover:text-ink">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-ink/70">{b.label}</span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="chip mb-7"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="text-ink/70">{badge}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance"
        >
          {renderEmphasis(title)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty"
        >
          {lead}
        </motion.p>

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

        {tags?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {tags.map((t) => (
              <span key={t} className="chip text-xs text-ink/60">
                {t}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
