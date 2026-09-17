import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HeroVisual from '@/components/landing/HeroVisual'
import { SLIDE_TRANSITION, SLIDE_DRAG_THRESHOLD, useTrackWidth } from '@/hooks/useSlideCarousel'
import { cn } from '@/utils/cn'

const SLIDE_COUNT = 3

/**
 * The hero's right "Roadmap Alignment" visual as a horizontally draggable
 * track, synchronized to the same `active`/`onSwipe` as HeroTextTrack. Each
 * slide mounts the existing `HeroVisual` completely unmodified — same
 * styling, shadows, borders, floating pills, and parallax/float animation
 * as today; this only adds swipe/drag around it, never touches the card
 * itself. Content is intentionally identical across all 3 for now.
 *
 * Panel width is measured in pixels (useTrackWidth) rather than driven by
 * a CSS-percentage transform — see that hook's comment for why (this
 * column's `justify-center` flex wrapper is exactly the case where a
 * percentage transform fails to resolve against a definite width).
 *
 * The clip boundary (`overflow-hidden`, needed to hide the other two
 * off-screen slides) sits on an INNER div that intentionally bleeds wider
 * than the visible card via a negative margin + matching padding — measured
 * at 432px card width, HeroVisual's own floating chips (`left-[-6%]`,
 * `right-[-5%]`) render ~26px/~22px past the card edge, and a same-width
 * clip boundary was cutting them off. `trackRef` stays on the OUTER,
 * un-clipped div so the width measurement itself is never affected by this
 * bleed (and stays immune to the ResizeObserver feedback loop fixed
 * earlier — see useTrackWidth's own comment). Panels keep the exact same
 * width/position; only what's visible *around* them changes.
 */
export default function RoadmapCarousel({ active, onSwipe }) {
  const [trackRef, width] = useTrackWidth()
  // Measured chip overflow is ~6% of card width (left-[-6%]/right-[-5%]);
  // 6.5% covers both with a few px of safety without bleeding so far that
  // it reveals the adjacent (off-screen) slide's own mirrored overflow.
  const bleed = Math.ceil(width * 0.065)

  return (
    <div className="w-full">
      <div ref={trackRef} className="w-full min-w-0">
        <div className="overflow-hidden" style={{ margin: `0 -${bleed}px`, padding: `0 ${bleed}px` }}>
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
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <div key={i} className="shrink-0" style={{ width }}>
                <HeroVisual />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Compact shared indicator — sits right under the card, no extra
          whitespace, no large controls. Minimal chevrons flank the dots. */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onSwipe(-1)}
          disabled={active === 0}
          aria-label="Slide précédente"
          className="text-muted transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSwipe(i - active)}
              aria-label={`Aller à la diapositive ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === active ? 'w-4 bg-ink' : 'w-1.5 bg-ink/20 hover:bg-ink/35',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSwipe(1)}
          disabled={active === SLIDE_COUNT - 1}
          aria-label="Slide suivante"
          className="text-muted transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
