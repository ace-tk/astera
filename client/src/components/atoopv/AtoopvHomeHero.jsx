import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import Button from '@/components/ui/Button'
import HeroTextTrack from '@/components/atoopv/HeroTextTrack'
import RoadmapCarousel from '@/components/atoopv/RoadmapCarousel'
import { useSlideCarousel } from '@/hooks/useSlideCarousel'

const EASE = [0.16, 1, 0.3, 1]

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
 *
 * Entirely independent of the hero's slide carousel below: this is driven
 * by scroll position (`phase`), the carousel by drag/swipe (`active`) — the
 * two never interact.
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

/**
 * Left column: the draggable slide-text track (eyebrow/badge/h1/lead, one
 * panel per carousel slide) followed by the two CTA buttons and the
 * scroll-phase annotation — both fully static, never part of the carousel,
 * per the brief ("the two existing CTA buttons ... MUST remain STATIC").
 */
function HeroCopy({ heroSlides, active, onSwipe, hero, phase, animated }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-6 sm:px-9 sm:py-7 lg:px-11 lg:py-8">
      <HeroTextTrack slides={heroSlides} active={active} onSwipe={onSwipe} />

      <div className="mt-5 flex flex-wrap gap-2.5">
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
      </div>

      <div className="mt-6">
        <HeroAnnotation phase={animated ? phase : 0} />
      </div>
    </div>
  )
}

/** Static path: mobile, tablet, laptop below the pin breakpoint, and
 * reduced-motion — a simple load-in, content stacked above the Roadmap
 * Alignment visual (badge/heading/description/CTA first, card below), no
 * scroll-pinning. Same composition building blocks as the desktop pin. */
function StaticHero({ hero, heroSlides }) {
  const { active, step } = useSlideCarousel(heroSlides.length)

  return (
    <section className="relative border-b border-ink/10 pt-32 sm:pt-36 lg:pt-40">
      <div className="shell">
        <div className="rounded-none border border-ink/10 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* min-w-0 on both cells — see the matching comment in
              PinnedHero: prevents the carousel tracks' non-shrinkable
              slide panels from feeding a runaway width back into these
              grid tracks' auto min-size. */}
          <div className="min-w-0 border-b border-ink/10 lg:border-b-0 lg:border-r">
            <HeroCopy heroSlides={heroSlides} active={active} onSwipe={step} hero={hero} phase={0} animated={false} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
            className="flex min-w-0 items-center justify-center p-6 sm:p-8"
          >
            <div className="w-full max-w-[27rem]">
              <RoadmapCarousel active={active} onSwipe={step} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** Desktop path: a pinned 230vh scroll range drives the six-state
 * annotation story (§13) on the left while the Roadmap Alignment visual on
 * the right runs its own independent hover/float/parallax animations. The
 * slide carousel (drag/swipe) is a separate, orthogonal interaction layered
 * on top of both sides via one shared `active` index. */
function PinnedHero({ hero, heroSlides }) {
  const sectionRef = useRef(null)
  const [phase, setPhase] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const { active, step } = useSlideCarousel(heroSlides.length)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const thresholds = [0.14, 0.32, 0.5, 0.68, 0.86]
    const idx = thresholds.filter((t) => v >= t).length
    setPhase((prev) => (prev === idx ? prev : idx))
  })

  return (
    <section ref={sectionRef} className="relative border-b border-ink/10" style={{ height: '230vh' }}>
      <div className="sticky top-0 flex h-screen flex-col justify-start overflow-hidden pt-28">
        <div className="shell w-full">
          <div className="grid grid-cols-[1.1fr_0.9fr] border border-ink/10" style={{ height: 'min(46rem, calc(100vh - 7rem))' }}>
            {/* min-w-0 on both grid cells: without it, the carousel
                tracks' non-shrinkable (shrink-0) slide panels feed their
                combined width back into these 1.1fr/0.9fr tracks' auto
                min-size, which — since the panels' own width is itself
                measured from this cell — creates a runaway feedback loop
                (confirmed empirically: it multiplied by the slide count on
                every tick until hitting the browser's max layout size). */}
            <div className="min-w-0 border-r border-ink/10">
              <HeroCopy heroSlides={heroSlides} active={active} onSwipe={step} hero={hero} phase={phase} animated />
            </div>
            <div className="relative flex min-w-0 items-center justify-center p-6">
              {/* HeroVisual's floating chips are positioned by percentage
                  against its own square box, tuned for the ~27rem width it
                  renders at on the Astera hero — a wider box here would wrap
                  its fixed-size text less, shrink the card, and let the
                  chips drift onto content they're meant to sit beside. */}
              <div className="w-full max-w-[27rem]">
                <RoadmapCarousel active={active} onSwipe={step} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * ATOOPV homepage hero — content/visual split built on the existing
 * `ACCUEIL.hero` content (real badge/title/lead/CTA copy). The right side
 * reuses HeroVisual (via RoadmapCarousel), the same "Q3 Roadmap alignment"
 * component that anchors the Astera marketing hero
 * (components/landing/sections/Hero.jsx) — one component, one source of
 * data, rendered a second time here rather than a separate hero image.
 * Desktop (≥1024px) with motion allowed gets the pinned scroll choreography
 * for the left-side annotation story; everything else gets the same
 * composition without the pin. Both paths share the same 3-slide
 * left-text/right-Roadmap carousel (see HeroTextTrack/RoadmapCarousel),
 * built for now from the single existing `hero` object duplicated 3× —
 * intentional per the brief, trivial to diversify later.
 */
export default function AtoopvHomeHero({ hero }) {
  const isDesktop = useIsDesktop(1024)
  const reduceMotion = useReducedMotion()
  const heroSlides = [hero, hero, hero]

  return isDesktop && !reduceMotion ? (
    <PinnedHero hero={hero} heroSlides={heroSlides} />
  ) : (
    <StaticHero hero={hero} heroSlides={heroSlides} />
  )
}
