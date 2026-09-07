import { useReducedMotion } from 'framer-motion'
import { HOME_TICKER } from '@/constants/atoopvHome'
import { cn } from '@/utils/cn'

function TickerRow({ ariaHidden = false }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {HOME_TICKER.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center">
          {item.anchor ? (
            // Plain `#anchor` href on purpose: this ticker only ever renders
            // on /atoopv itself, and the app's global useSmoothScroll click
            // listener intercepts exactly this shape (`a[href^="#"]`) to
            // Lenis-scroll with the floating navbar's offset — a React
            // Router `Link` here would just rewrite the URL with no scroll.
            <a href={item.anchor} className="px-4 transition-colors hover:text-sky sm:px-6" tabIndex={ariaHidden ? -1 : 0}>
              {item.label}
            </a>
          ) : (
            <span className="px-4 sm:px-6">{item.label}</span>
          )}
          <span className="text-ink/25" aria-hidden="true">
            ·
          </span>
        </span>
      ))}
    </div>
  )
}

/**
 * The editorial strip immediately below the hero — a continuously moving
 * marquee of real ATOOPV service/section terms. Pure CSS keyframe animation
 * (see `.atoopv-ticker-track` in globals.css) so there's no per-frame React
 * state; the track is duplicated once so the loop is seamless, and hovering
 * pauses it via `animation-play-state` rather than any JS timer.
 */
export default function AtoopvTicker() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="atoopv-ticker relative overflow-hidden border-y border-ink/8 bg-paper py-4">
      <div
        className={cn(
          'flex whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-muted sm:text-sm',
          !reduceMotion && 'atoopv-ticker-track',
        )}
      >
        <TickerRow />
        {!reduceMotion && <TickerRow ariaHidden />}
      </div>
    </div>
  )
}
