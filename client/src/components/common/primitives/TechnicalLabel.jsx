import { useState } from 'react'
import clsx from 'clsx'

/**
 * Small uppercase mono metadata tag ("SESSION 01", "PROCESS / 01"...).
 * When given a `coordinate`, it stays hidden until hover/focus — the
 * micro-interaction from the brief where metadata reveals a technical
 * detail on demand instead of always showing it.
 */
export default function TechnicalLabel({ children, coordinate, dot = true, as = 'span', className }) {
  const [active, setActive] = useState(false)
  const Comp = as
  return (
    <Comp
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={clsx('inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-muted', className)}
    >
      {dot && <span className="h-1 w-1 shrink-0 rounded-full bg-current" aria-hidden="true" />}
      <span>{children}</span>
      {coordinate && (
        <span
          className={clsx('text-ink/40 transition-opacity duration-300', active ? 'opacity-100' : 'opacity-0')}
          aria-hidden={!active}
        >
          {coordinate}
        </span>
      )}
    </Comp>
  )
}
