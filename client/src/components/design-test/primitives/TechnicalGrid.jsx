import clsx from 'clsx'

/**
 * The understated "graph paper" backdrop shared by every experiment — a
 * faint line grid plus optional corner coordinates. Purely decorative
 * (aria-hidden) and absolutely positioned so it never affects layout.
 */
export default function TechnicalGrid({ className, size = 56, showTicks = false, fade = true }) {
  return (
    <div className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div
        className={clsx('absolute inset-0', fade && 'mask-fade-b')}
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--line) / 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line) / 0.055) 1px, transparent 1px)',
          backgroundSize: `${size}px ${size}px`,
        }}
      />
      {showTicks && (
        <>
          <span className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.2em] text-muted/50 sm:left-6 sm:top-6">00°</span>
          <span className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.2em] text-muted/50 sm:right-6 sm:top-6">X→</span>
          <span className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.2em] text-muted/50 sm:bottom-6 sm:left-6">↑Y</span>
        </>
      )}
    </div>
  )
}
