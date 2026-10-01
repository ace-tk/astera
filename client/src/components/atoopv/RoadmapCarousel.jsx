import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SLIDE_TRANSITION, SLIDE_DRAG_THRESHOLD, useTrackWidth } from '@/hooks/useSlideCarousel'
import { useHomeHeroCms } from '@/cms/useHomeHero'
import { resolveMediaUrl } from '@/cms/media'
import { cn } from '@/utils/cn'

const SLIDE_COUNT = 3

/** One slide's photo — same outer footprint (aspect-square, max width,
 * rounded corners) as the HeroVisual card it replaces, so the track's width
 * measurement (useTrackWidth) still lines up exactly; only what's INSIDE
 * that box changed, from a coded mockup to a real photo. `object-cover` on a
 * genuinely square (1024×1024) source shows the full image with zero
 * cropping. No background or shadow on this wrapper — the photo's own edge
 * is the card's edge, flush against the rounded corners with nothing
 * framing it (a `bg-card` + `shadow-float` pairing used to sit here: the
 * background showed through as a flash of plain color on whichever slide's
 * image hadn't finished loading yet, and the shadow's own downward blur —
 * `0 20px 60px -20px` in tailwind.config.js — read as a faint square smudge
 * behind the card's bottom corners once the image HAD loaded. Both are gone
 * now rather than papered over, since neither one should be visible either
 * way). `eager`/`high` loading only for the first slide — it's the one
 * visible immediately on page load (the hero's LCP element), so deferring
 * it like the off-screen slides 2/3 only made that load-flash worse. */
function HeroSlideImage({ src, alt, priority = false }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[43rem] overflow-hidden rounded-[2.2rem] bg-transparent">
      <img
        src={resolveMediaUrl(src)}
        alt={alt}
        className="block h-full w-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  )
}

/**
 * The hero's right visual as a horizontally draggable track, synchronized to
 * the same `active`/`onSwipe` as HeroTextTrack. Each slide now shows one of
 * the 3 real photos from the CMS (useHomeHeroCms — Admin → Content → Menus →
 * Homepage; falls back to the site's built-in defaults if the CMS is
 * unreachable, same rule as the footer). Previously: the same coded
 * `HeroVisual` "Roadmap Alignment" mockup, identically, on all 3 — see git
 * history for that version. The carousel mechanics themselves — drag/swipe,
 * chevrons, dot indicators, spring transition, track-width measurement —
 * are completely unchanged; only what mounts inside each slide panel differs.
 *
 * Panel width is measured in pixels (useTrackWidth) rather than driven by
 * a CSS-percentage transform — see that hook's comment for why (this
 * column's `justify-center` flex wrapper is exactly the case where a
 * percentage transform fails to resolve against a definite width).
 *
 * The clip boundary (`overflow-hidden`) sits flush with the visible card —
 * unlike the old HeroVisual mockup, a plain photo has nothing floating past
 * its own edges, so there's no reason to clip wider than the card itself.
 * (HeroVisual used to bleed this boundary a few px past the card to avoid
 * cutting off its floating chips; with real photos in every slide that bleed
 * only revealed a sliver of the next/previous slide's photo — a visible
 * seam — so it's gone along with the chips it existed for.)
 */
export default function RoadmapCarousel({ active, onSwipe }) {
  const { slides } = useHomeHeroCms()
  const [trackRef, width] = useTrackWidth()

  return (
    <div className="w-full">
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
            <div key={slide.id ?? i} className="shrink-0" style={{ width }}>
              <HeroSlideImage src={slide.path} alt={slide.alt} priority={i === 0} />
            </div>
          ))}
        </motion.div>
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
