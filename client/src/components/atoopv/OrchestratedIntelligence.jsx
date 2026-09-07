import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import { HOMEPAGE_ORCHESTRATED } from '@/constants/atoopvHome'

const ACCENT_VAR = {
  royal: 'var(--royal)',
  coral: 'var(--coral)',
  golden: 'var(--golden)',
  emerald: 'var(--emerald)',
  sky: 'var(--sky)',
}

/** A restrained abstract texture standing in for a per-stage illustration —
 * deliberately generic (not five bespoke visualizations) since this
 * section's content is explicit placeholder pending final copy. */
function AbstractVisual({ colorVar, active }) {
  return (
    <div
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        opacity: active ? 0.9 : 0.35,
        backgroundImage: `repeating-linear-gradient(115deg, rgb(${colorVar} / 0.16) 0px, rgb(${colorVar} / 0.16) 1px, transparent 1px, transparent 14px), radial-gradient(rgb(${colorVar} / 0.35) 1px, transparent 1px)`,
        backgroundSize: 'auto, 18px 18px',
      }}
      aria-hidden="true"
    />
  )
}

/**
 * "ORCHESTRATED INTELLIGENCE" — new ATOOPV homepage section. Tall numbered
 * panels where exactly one is dominant: desktop hover previews a panel live
 * (click/keyboard still pins it explicitly), touch uses tap only. Leaving
 * the component preserves the most recently active panel — state is never
 * reset on mouse-leave, only ever moved forward by the next hover/tap.
 * Active panel gets more room (basis-[30%] vs 17.5%) but stays moderate,
 * never full-width, per the brief's "should NOT become enormous."
 */
export default function OrchestratedIntelligence({ data = HOMEPAGE_ORCHESTRATED }) {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative border-t border-ink/10 bg-paper py-20 sm:py-28">
      <div className="shell">
        <div className="mb-14 sm:mb-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">{data.eyebrow}</span>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {data.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex flex-col gap-3 lg:h-[30rem] lg:flex-row lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-ink/10">
          {data.panels.map((panel, i) => {
            const isActive = active === i
            const colorVar = ACCENT_VAR[panel.accent] || ACCENT_VAR.royal
            const activate = () => setActive(i)
            return (
              <div
                key={panel.number}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={`${panel.title} — ${panel.description}`}
                onClick={activate}
                onFocus={activate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    activate()
                  }
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') activate()
                }}
                className={clsx(
                  'group relative cursor-pointer overflow-hidden border border-ink/10 bg-card transition-[flex-basis] ease-[cubic-bezier(0.16,1,0.3,1)] lg:border-y-0 lg:border-l lg:border-r-0 lg:first:border-l-0',
                  reduceMotion ? 'duration-0' : 'duration-500',
                  isActive ? 'lg:basis-[30%]' : 'lg:basis-[17.5%]',
                )}
              >
                <AbstractVisual colorVar={colorVar} active={isActive} />

                <div
                  className={clsx(
                    'relative flex h-full flex-col justify-between gap-6 p-6 transition-[padding] duration-500 sm:p-7',
                    isActive && 'lg:p-9',
                  )}
                >
                  <div className="flex items-center justify-between lg:block">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted/60">{panel.number}</span>
                    <span
                      className={clsx(
                        'font-display leading-none text-ink transition-all duration-500',
                        isActive
                          ? 'mt-0 text-3xl sm:text-4xl'
                          : 'mt-0 text-xl sm:text-2xl lg:mt-4 lg:origin-left lg:-rotate-90 lg:whitespace-nowrap lg:text-lg',
                      )}
                    >
                      {panel.title}
                    </span>
                  </div>

                  <p
                    className={clsx(
                      'max-w-[22rem] text-sm leading-relaxed text-muted transition-opacity duration-300',
                      isActive ? 'opacity-100 delay-100' : 'opacity-0 lg:hidden',
                    )}
                  >
                    {panel.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
