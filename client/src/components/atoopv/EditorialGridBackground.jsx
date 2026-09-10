import { cn } from '@/utils/cn'

// A standalone grid definition, deliberately NOT reusing the shared
// `bg-grid-faint` Tailwind utility: that one bakes in a 3.5%-alpha line
// color tuned for AmbientBackground's whole-page ambient wash, so no amount
// of wrapper opacity on top of it can ever make it read as a visible
// technical grid (0.6 opacity × 0.035 alpha ≈ 2% — less visible, not more).
// This is its own, independently-tunable line color/scale.
const GRID_STYLE = {
  backgroundImage:
    'linear-gradient(to right, rgb(17 24 39 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(17 24 39 / 0.07) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
}

/**
 * A reusable, purely decorative backdrop for editorial ATOOPV content
 * areas: a technical grid plus a couple of oversized bordered blocks and a
 * faint tonal wash for depth. `pointer-events-none` and `aria-hidden`
 * throughout — it never carries content and never intercepts clicks/hover.
 *
 * `lines` defaults to false because AmbientBackground already paints its
 * own (much fainter) page-wide grid — pass `lines` explicitly on pages that
 * want their OWN, more pronounced editorial grid on top of that (Blog/
 * Ressources pages do, so their identity is recognizably different from the
 * rest of the site rather than indistinguishable from the ambient wash).
 */
export default function EditorialGridBackground({ className, blocks = true, lines = false, tint = true }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {lines && <div className="absolute inset-0 mask-fade-b" style={GRID_STYLE} />}
      {tint && <div className="absolute inset-x-0 top-0 h-72 bg-royal/[0.035]" />}
      {blocks && (
        <>
          <div className="absolute -right-16 top-16 h-80 w-80 rounded-[2.5rem] border border-ink/[0.1]" />
          <div className="absolute left-6 bottom-10 h-56 w-56 rounded-[2rem] border border-ink/[0.1]" />
        </>
      )}
    </div>
  )
}
