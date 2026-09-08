import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import { renderEmphasis } from '@/utils/richText'

/**
 * A wide two-column hero, scoped to modele-pv-cse-gratuit only — NOT a
 * replacement for the shared ServiceHero (used by every other Services/
 * Ressources article; redesigning it would change every one of those pages).
 *
 * The problem this solves: ServiceHero is a single narrow column
 * (title/actions/tags, `max-w-3xl`), which on a wide desktop viewport left
 * roughly half the hero empty while the article's own opening paragraph sat
 * far below, inside the content column. That paragraph is existing content
 * (`introBody`, lifted verbatim by utils/modelePvGratuitContent.js) — this
 * just moves it up into the hero's right column instead of duplicating it,
 * so the first viewport actually has something in it on both sides.
 */
export default function GuideModelHero({ badge, title, breadcrumbs, introBody, tags, primaryCta, secondaryCta, color }) {
  return (
    <section className="relative pt-32 sm:pt-36 lg:pt-40">
      <div className="shell pb-10 sm:pb-12">
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

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <div>
            {badge && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="chip mb-5">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-ink/70">{badge}</span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance"
            >
              {renderEmphasis(title)}
            </motion.h1>

            {(primaryCta || secondaryCta) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
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

            {tags?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="mt-6 flex flex-wrap gap-2"
              >
                {tags.map((t) => (
                  <span key={t} className="chip text-xs text-ink/60">
                    {t}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {introBody && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="lg:pt-2"
            >
              <MarkdownArticle body={introBody} color={color} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
