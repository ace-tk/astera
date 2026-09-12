import { cn } from '@/utils/cn'

/**
 * A mega-menu column's category heading ("Formations des élus", "Par
 * instance", "PV par ville", ...). Deliberately its own small treatment
 * rather than the shared `.eyebrow` utility: `.eyebrow` is tuned for a
 * hero/section label (font-medium, text-muted) and reused all over the
 * site, so strengthening it there to read as a mega-menu category heading
 * would also lighten/darken every unrelated eyebrow on the site. This is
 * the same tick-mark + uppercase/tracked layout, just bolder and higher
 * contrast so it reads as "this is a section of the mega menu" the way a
 * generic eyebrow doesn't need to.
 */
export default function MegaMenuCategory({ children, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/75', className)}>
      <span className="h-px w-6 bg-ink/25" aria-hidden="true" />
      {children}
    </span>
  )
}
