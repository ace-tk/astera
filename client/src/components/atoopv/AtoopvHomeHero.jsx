import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { renderEmphasis } from '@/utils/richText'

const EASE = [0.16, 1, 0.3, 1]
const PHASE_COUNT = 6

function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const onChange = () => setIsDesktop(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])
  return isDesktop
}

/**
 * The six-state story from the brief, told through one small annotation slot
 * rather than by touching the headline/lead/CTA — those stay put throughout
 * the scroll (§13/§15: "the 50/50 composition remains recognizable", "do NOT
 * make the entire hero disappear"). Content is decorative/illustrative
 * (same register as a real ATOOPV meeting: a budget quote, a decision, an
 * action, an owner), not a factual claim, so it doesn't need to match any
 * specific approved copy — it exists to make CAPTURE → PV feel physical.
 */
function HeroAnnotation({ phase }) {
  return (
    <div className="relative flex min-h-[2.25rem] shrink-0 items-center sm:min-h-[2.75rem]">
      <AnimatePresence mode="wait">
        {phase > 0 && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ duration: 0.45, ease: EASE }}
            className="w-full"
          >
            {phase === 1 && (
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Capture <span className="text-ink">01</span>
              </p>
            )}
            {phase === 2 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky">Transcription · 01:24:18</p>
                <p className="mt-1.5 text-sm italic leading-snug text-ink/75">« Il faut confirmer le budget avant vendredi. »</p>
              </div>
            )}
            {phase === 3 && (
              <div className="flex flex-wrap gap-2">
                {['Décision', 'Action', 'Responsable', 'Échéance'].map((l) => (
                  <span key={l} className="rounded-full border border-sky/30 bg-sky/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sky">
                    {l}
                  </span>
                ))}
              </div>
            )}
            {phase === 4 && (
              <div className="grid grid-cols-1 gap-1 text-xs leading-relaxed sm:grid-cols-3 sm:gap-4">
                <p><span className="font-mono uppercase tracking-[0.12em] text-muted">Décision </span><span className="text-ink">Budget approuvé</span></p>
                <p><span className="font-mono uppercase tracking-[0.12em] text-muted">Action </span><span className="text-ink">Relancer le fournisseur</span></p>
                <p><span className="font-mono uppercase tracking-[0.12em] text-muted">Responsable </span><span className="text-ink">Julie Martin</span></p>
              </div>
            )}
            {phase === 5 && <p className="font-display text-xl tracking-tight text-ink">Procès-verbal.</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScrollStrip({ phase, animated }) {
  return (
    <a
      href="#stats"
      className="group -mx-6 flex shrink-0 items-center justify-between border-t border-ink/10 px-6 pt-3 sm:-mx-9 sm:px-9 lg:-mx-11 lg:px-11"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors group-hover:text-ink">Scroll down</span>
      <span className="flex items-center gap-2.5">
        {animated && (
          <span className="font-mono text-[11px] tabular-nums text-muted/60">
            {String(phase + 1).padStart(2, '0')} / {String(PHASE_COUNT).padStart(2, '0')}
          </span>
        )}
        <ArrowDown className="h-3.5 w-3.5 text-muted transition-transform duration-300 group-hover:translate-y-1 group-hover:text-ink" />
      </span>
    </a>
  )
}

function HeroCopy({ hero, phase, animated }) {
  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-6 py-6 sm:px-9 sm:py-7 lg:px-11 lg:py-8">
      <div>
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">ATOOPV / Intelligence</span>
        </Reveal>

        {hero.badge && (
          <Reveal delay={0.06} className="mt-3">
            <span className="chip py-1 text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="text-ink/70">{hero.badge}</span>
            </span>
          </Reveal>
        )}

        {/* This headline is the ACCUEIL page's real, approved sentence-length
            copy — not a punchy 2-3 word phrase — so its clamp max is
            deliberately smaller than a short headline would use: at the
            reference's scale, a full sentence would blow well past the
            pinned hero's viewport-height budget (confirmed by measuring
            actual rendered height against the container while tuning this). */}
        <Reveal delay={0.14} className="mt-4 overflow-hidden">
          <h1
            className="font-display font-medium leading-[1.12] tracking-tight text-ink text-balance"
            style={{ fontSize: 'clamp(1.5rem, 0.85rem + 1.9vw, 2.35rem)' }}
          >
            {renderEmphasis(hero.title)}
          </h1>
        </Reveal>

        {hero.lead && (
          <Reveal delay={0.24} className="mt-3 max-w-md">
            <p className="text-sm leading-relaxed text-muted text-pretty">{hero.lead}</p>
          </Reveal>
        )}

        <Reveal delay={0.34} className="mt-5 flex flex-wrap gap-2.5">
          {hero.primaryCta && (
            <Button as={Link} to={hero.primaryCta.to} size="md" variant="accent">
              {hero.primaryCta.label}
            </Button>
          )}
          {hero.secondaryCta && (
            <Button as={Link} to={hero.secondaryCta.to} size="md" variant="soft">
              {hero.secondaryCta.label}
            </Button>
          )}
        </Reveal>
      </div>

      <HeroAnnotation phase={animated ? phase : 0} />

      <ScrollStrip phase={phase} animated={animated} />
    </div>
  )
}

/** Static path: mobile, tablet, laptop below the pin breakpoint, and
 * reduced-motion — a simple load-in, image stacked above content, no
 * scroll-pinning. Same composition building blocks as the desktop pin. */
function StaticHero({ hero }) {
  return (
    <section className="relative border-b border-ink/10 pt-24 sm:pt-28 lg:pt-32">
      <div className="shell">
        <div className="overflow-hidden rounded-none border border-ink/10 lg:grid lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
            className="h-64 w-full overflow-hidden sm:h-80 lg:h-auto"
          >
            <img src={hero.image.src} alt={hero.image.alt} className="h-full w-full object-cover" style={{ objectPosition: 'center 42%' }} />
          </motion.div>
          <div className="border-t border-ink/10 lg:border-l lg:border-t-0">
            <HeroCopy hero={hero} phase={0} animated={false} />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Desktop path: a pinned 230vh scroll range drives the six-state
 * annotation story (§13) while the image/content split itself stays put —
 * only a subtle image scale (§20) and the annotation slot actually move. */
function PinnedHero({ hero }) {
  const sectionRef = useRef(null)
  const [phase, setPhase] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.045, 1])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const thresholds = [0.14, 0.32, 0.5, 0.68, 0.86]
    const idx = thresholds.filter((t) => v >= t).length
    setPhase((prev) => (prev === idx ? prev : idx))
  })

  return (
    <section ref={sectionRef} className="relative border-b border-ink/10" style={{ height: '230vh' }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-20">
        <div className="shell w-full">
          <div className="grid grid-cols-2 overflow-hidden border border-ink/10" style={{ height: 'min(42rem, calc(100vh - 11rem))' }}>
            <div className="relative h-full w-full overflow-hidden border-r border-ink/10">
              <motion.img
                src={hero.image.src}
                alt={hero.image.alt}
                style={{ scale: imageScale, objectPosition: 'center 42%' }}
                className="h-full w-full object-cover"
              />
            </div>
            <HeroCopy hero={hero} phase={phase} animated />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * ATOOPV homepage hero — the editorial image|content split from the
 * approved reference, built on the existing `ACCUEIL.hero` content (real
 * badge/title/lead/CTA copy, real hero image) rather than new marketing
 * copy. Desktop (≥1024px) with motion allowed gets the pinned scroll
 * choreography; everything else gets the same composition without the pin.
 */
export default function AtoopvHomeHero({ hero }) {
  const isDesktop = useIsDesktop(1024)
  const reduceMotion = useReducedMotion()

  return isDesktop && !reduceMotion ? <PinnedHero hero={hero} /> : <StaticHero hero={hero} />
}
