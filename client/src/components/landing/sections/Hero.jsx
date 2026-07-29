import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Play, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import HeroVisual from '@/components/landing/HeroVisual'

// Word-by-word entrance for the oversized headline.
const line = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}
const word = {
  hidden: { opacity: 0, y: '0.5em', filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

export default function Hero() {
  return (
    <section className="relative pt-28 sm:pt-32 lg:pt-36">
      <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* Left: editorial headline */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="chip mb-7"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-ink/70">Intelligence reports for every meeting</span>
          </motion.div>

          <motion.h1
            variants={line}
            initial="hidden"
            animate="show"
            className="font-display text-display-lg font-semibold text-ink"
          >
            {['Meetings', 'deserve'].map((w) => (
              <motion.span key={w} variants={word} className="mr-[0.28em] inline-block">
                {w}
              </motion.span>
            ))}
            <br />
            <motion.span variants={word} className="mr-[0.28em] inline-block text-accent">
              better
            </motion.span>
            <motion.span variants={word} className="inline-block">
              stories.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-7 max-w-prose text-lg leading-relaxed text-muted text-pretty"
          >
            ATOOPV turns a 74-minute conversation into a beautiful intelligence
            report — decisions, owners, risks, and a scrubbable timeline. Not a
            boring PDF. A publication your team actually reads.
          </motion.p>
        </div>

        {/* Right: floating report visual, with "Trusted by" and the CTAs
            stacked beneath it — centered on the card for a clean hierarchy. */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <HeroVisual />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-44 flex items-center justify-center gap-4 text-sm text-muted sm:mt-8 lg:mt-44 xl:mt-8"
          >
            <div className="flex -space-x-2">
              {['bg-coral', 'bg-purple', 'bg-emerald', 'bg-golden'].map((c) => (
                <span key={c} className={`h-8 w-8 rounded-full ring-2 ring-paper ${c}`} />
              ))}
            </div>
            <span>Trusted by teams who’d rather build than take minutes.</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button as={Link} to="/app" size="lg" variant="accent">
              Generate beautiful reports <ArrowUpRight className="h-5 w-5" />
            </Button>
            <Button as="a" href="#how" size="lg" variant="ghost" magnetic={false}>
              <Play className="h-4 w-4" /> Watch demo
            </Button>
          </motion.div>
        </div>
      </div>

      {/* scroll indicator */}
      <motion.a
        href="#story"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mx-auto mt-10 flex w-fit flex-col items-center gap-2 text-xs uppercase tracking-widest text-muted"
      >
        Scroll
        <span className="relative flex h-9 w-5 justify-center rounded-full border border-ink/20">
          <motion.span
            className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ink/50"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.a>
    </section>
  )
}
