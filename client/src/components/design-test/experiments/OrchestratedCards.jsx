import { useState } from 'react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import { ORCHESTRATED_PANELS } from '@/constants/designTest'

const ACCENT_VAR = {
  royal: 'var(--royal)',
  coral: 'var(--coral)',
  golden: 'var(--golden)',
  emerald: 'var(--emerald)',
  sky: 'var(--sky)',
}

function AbstractVisual({ accent, active }) {
  const color = ACCENT_VAR[accent]
  return (
    <div
      className="absolute inset-0 transition-opacity duration-700"
      style={{
        opacity: active ? 0.9 : 0.35,
        backgroundImage: `repeating-linear-gradient(115deg, rgb(${color} / 0.16) 0px, rgb(${color} / 0.16) 1px, transparent 1px, transparent 14px), radial-gradient(rgb(${color} / 0.35) 1px, transparent 1px)`,
        backgroundSize: 'auto, 18px 18px',
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Tall numbered panels where exactly one is dominant at a time. Desktop
 * drives the active panel by hover (with click to pin, for trackpads and
 * touch alike); the width transition is a plain CSS transition on
 * flex-basis so it automatically collapses under prefers-reduced-motion via
 * the app's global rule. Below `lg`, the panels become a tap accordion.
 */
export default function OrchestratedCards() {
  const [active, setActive] = useState(0)

  return (
    <section id="experiment-05" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader index="05" eyebrow="EXPERIMENT / 05" titleLines={['ORCHESTRATED', 'INTELLIGENCE']} className="mb-14 sm:mb-20" />

        <div className="flex flex-col gap-3 lg:h-[30rem] lg:flex-row lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-ink/10">
          {ORCHESTRATED_PANELS.map((panel, i) => {
            const isActive = active === i
            return (
              <div
                key={panel.number}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActive(i)
                  }
                }}
                onMouseEnter={() => setActive(i)}
                className={clsx(
                  'group relative cursor-pointer overflow-hidden border border-ink/10 bg-card transition-[flex-basis,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:border-y-0 lg:border-l lg:border-r-0 lg:first:border-l-0',
                  isActive ? 'lg:basis-[36%]' : 'lg:basis-[16%]',
                )}
              >
                <AbstractVisual accent={panel.accent} active={isActive} />

                <div
                  className={clsx(
                    'relative flex h-full flex-col justify-between p-6 transition-all duration-500 sm:p-7',
                    isActive ? 'lg:p-9' : '',
                  )}
                >
                  <div className="flex items-center justify-between lg:block">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted/60">{panel.number}</span>
                    <span
                      className={clsx(
                        'font-display leading-none text-ink transition-all duration-500',
                        isActive ? 'mt-0 text-3xl sm:text-4xl' : 'mt-0 text-xl sm:text-2xl lg:mt-4 lg:origin-left lg:-rotate-90 lg:whitespace-nowrap lg:text-lg',
                      )}
                    >
                      {panel.title}
                    </span>
                  </div>

                  <p
                    className={clsx(
                      'max-w-[22rem] text-sm leading-relaxed text-muted transition-opacity duration-500',
                      isActive ? 'opacity-100 delay-150' : 'opacity-0 lg:hidden',
                    )}
                  >
                    {panel.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60">
          {String(active + 1).padStart(2, '0')} / {String(ORCHESTRATED_PANELS.length).padStart(2, '0')} — {ORCHESTRATED_PANELS[active].title}
        </p>
      </div>
    </section>
  )
}
