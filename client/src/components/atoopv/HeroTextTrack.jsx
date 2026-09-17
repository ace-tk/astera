import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { SLIDE_TRANSITION, SLIDE_DRAG_THRESHOLD, useTrackWidth } from '@/hooks/useSlideCarousel'
import { renderEmphasis } from '@/utils/richText'

/**
 * The hero's left "headline/content area" as a horizontally draggable
 * track — one panel per slide (eyebrow/badge/h1/lead only; the CTA row and
 * the scroll-phase annotation live outside this track, in HeroCopy, and
 * never move). Driven entirely by the shared `active`/`onSwipe` from
 * useSlideCarousel so it never owns its own index — see RoadmapCarousel,
 * its synchronized sibling on the right.
 *
 * Panel width is measured in pixels (useTrackWidth) rather than driven by
 * a CSS-percentage transform — see that hook's comment for why.
 */
export default function HeroTextTrack({ slides, active, onSwipe }) {
  const [trackRef, width] = useTrackWidth()

  return (
    <div ref={trackRef} className="w-full min-w-0 overflow-hidden">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -SLIDE_DRAG_THRESHOLD) onSwipe(1)
          else if (info.offset.x > SLIDE_DRAG_THRESHOLD) onSwipe(-1)
        }}
        animate={{ x: -active * width }}
        transition={SLIDE_TRANSITION}
        className="flex cursor-grab active:cursor-grabbing"
      >
        {slides.map((slide, i) => (
          <div key={i} className="shrink-0" style={{ width }}>
            <Reveal>
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">ATOOPV / Intelligence</span>
            </Reveal>

            {slide.badge && (
              <Reveal delay={0.06} className="mt-3">
                <span className="chip py-1 text-xs sm:text-sm">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="text-ink/70">{slide.badge}</span>
                </span>
              </Reveal>
            )}

            <Reveal delay={0.14} className="mt-4 overflow-hidden">
              <h1
                className="font-display font-semibold leading-[1.08] tracking-tight text-ink text-balance"
                style={{ fontSize: 'clamp(1.6rem, 0.75rem + 2.2vw, 2.7rem)' }}
              >
                {renderEmphasis(slide.title)}
              </h1>
            </Reveal>

            {slide.lead && (
              <Reveal delay={0.24} className="mt-3 max-w-md">
                <p className="text-sm leading-relaxed text-muted text-pretty">{slide.lead}</p>
              </Reveal>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
