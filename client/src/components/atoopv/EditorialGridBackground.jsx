import { cn } from '@/utils/cn'

/**
 * A reusable, purely decorative backdrop for editorial ATOOPV content
 * areas: the same extremely-faint technical grid AmbientBackground already
 * uses site-wide, plus a couple of oversized, barely-visible bordered
 * blocks for depth. `pointer-events-none` and `aria-hidden` throughout — it
 * never carries content and never intercepts clicks/hover.
 *
 * Every page already sits on AmbientBackground's own full-page grid, so
 * `lines` defaults to false here to avoid stacking a second, differently-
 * scaled grid on top of it (that reads as noise, not depth) — pass
 * `lines` only on a surface that ISN'T already on the ambient page grid
 * (e.g. a bounded content panel with its own solid background).
 */
export default function EditorialGridBackground({ className, blocks = true, lines = false }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {lines && <div className="absolute inset-0 bg-grid-faint opacity-[0.35] [background-size:48px_48px]" />}
      {blocks && (
        <>
          <div className="absolute -right-24 top-24 h-[26rem] w-[26rem] rounded-[3rem] border border-ink/[0.05]" />
          <div className="absolute -left-16 bottom-32 h-72 w-72 rounded-[2.5rem] border border-ink/[0.05]" />
        </>
      )}
    </div>
  )
}
