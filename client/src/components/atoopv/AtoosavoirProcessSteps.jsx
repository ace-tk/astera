import { useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * atoosavoir-only editorial treatment of "Quatre étapes, 5 jours ouvrés." —
 * the existing eyebrow/heading and the four existing step cards (title +
 * body, verbatim), given a connected-process feel instead of four identical
 * static cards: a hover-driven numbered connector row on desktop ("01 ──
 * 02 ── 03 ── 04", the segment around whichever card is hovered lighting up
 * blue), and a simple vertical stem between stacked cards on mobile. Page-
 * scoped: RichTextSection's shared StepsBlock (used by Accueil's "process"
 * section and Autodiagnostic) is untouched.
 */
function ConnectorRow({ count, active }) {
  return (
    <div className="mb-6 hidden items-center sm:flex" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-1 items-center last:max-w-fit last:flex-none">
          <span
            className={cn(
              'grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[11px] font-medium transition-all duration-300',
              active === i ? 'scale-110 border-royal bg-royal text-white shadow-glow' : 'border-ink/15 bg-card text-ink/40',
            )}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          {i < count - 1 && (
            <span
              className={cn('mx-2 h-px flex-1 transition-colors duration-300', active === i || active === i + 1 ? 'bg-royal/40' : 'bg-ink/10')}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function StepCard({ number, title, body, isActive, onEnter, onLeave }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={0}
      className={cn(
        'group h-full rounded-[1.4rem] border bg-card/95 p-5 transition-all duration-300 sm:p-6',
        isActive ? '-translate-y-1 border-royal/30 bg-royal/[0.03] shadow-lift' : 'border-ink/8 shadow-soft hover:-translate-y-1 hover:border-royal/25 hover:bg-royal/[0.02] hover:shadow-lift',
      )}
    >
      <span
        className={cn(
          'grid h-8 w-8 place-items-center rounded-full font-display text-sm font-semibold transition-colors duration-300 sm:hidden',
          isActive ? 'bg-royal text-white' : 'bg-royal/10 text-royal',
        )}
      >
        {number}
      </span>
      <h4
        className={cn(
          'mt-4 font-display text-lg font-medium tracking-tight transition-colors duration-300 sm:mt-0',
          isActive && 'text-royal',
        )}
      >
        {title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  )
}

export default function AtoosavoirProcessSteps({ eyebrow, heading, items = [] }) {
  const [active, setActive] = useState(null)
  const count = items.length

  return (
    <div>
      <Reveal className="max-w-2xl">
        {eyebrow && (
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink/30" /> {eyebrow}
          </span>
        )}
        {heading && <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>}
      </Reveal>

      {count > 0 && (
        <Reveal delay={0.1} className="mt-10 sm:mt-12">
          <ConnectorRow count={count} active={active} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {items.map((item, i) => (
              <div key={item.title} className="contents sm:block">
                <StepCard
                  number={String(i + 1).padStart(2, '0')}
                  title={item.title}
                  body={item.body}
                  isActive={active === i}
                  onEnter={() => setActive(i)}
                  onLeave={() => setActive(null)}
                />
                {i < count - 1 && <span className="mx-auto h-4 w-px bg-ink/10 sm:hidden" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  )
}
