import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * The short icon+heading "program" list every Formations page repeats
 * (content/training/*.md, content/communication/*.md — see
 * utils/formationContent.js) as a connected system instead of the plain
 * stacked icon/heading pairs MarkdownArticle would otherwise produce. Same
 * underlying data (icon + title, nothing invented) in three layouts so
 * different Formation page types don't all read identically:
 *
 * - "journey": a horizontal 01─02─03─04 connector above compact cards, for
 *   a single formation's program (one training, several steps).
 * - "modules": a vertical stack with a connecting spine, for a specialized/
 *   multi-facet training (CSSCT, communication) that reads as layered
 *   components of one framework rather than sequential steps.
 * - "explorer": interactive full-width rows, for the one page whose topics
 *   are broader subjects to browse (formation économique) rather than a
 *   program to walk through.
 */
function JourneyLayout({ topics, active, setActive }) {
  const count = topics.length
  return (
    <div>
      <div className="mb-6 hidden items-center sm:flex" aria-hidden="true">
        {topics.map((_, i) => (
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
              <span className={cn('mx-2 h-px flex-1 transition-colors duration-300', active === i || active === i + 1 ? 'bg-royal/40' : 'bg-ink/10')} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {topics.map((topic, i) => (
          <div
            key={topic.title}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            tabIndex={0}
            className={cn(
              'flex h-full items-start gap-3 rounded-[1.4rem] border bg-card/95 p-5 transition-all duration-300',
              active === i ? '-translate-y-1 border-royal/30 bg-royal/[0.03] shadow-lift' : 'border-ink/8 shadow-soft hover:-translate-y-1 hover:border-royal/25 hover:bg-royal/[0.02] hover:shadow-lift',
            )}
          >
            <span className="shrink-0 text-lg leading-none" aria-hidden="true">
              {topic.icon}
            </span>
            <div>
              <span className={cn('font-mono text-[11px] sm:hidden', active === i ? 'text-royal' : 'text-ink/35')}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h4 className={cn('font-display text-base font-medium leading-snug tracking-tight transition-colors duration-300', active === i && 'text-royal')}>
                {topic.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModulesLayout({ topics, active, setActive }) {
  const count = topics.length
  return (
    <div className="space-y-0">
      {topics.map((topic, i) => (
        <div
          key={topic.title}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(null)}
          tabIndex={0}
          className="group relative flex gap-4 py-4"
        >
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-full border font-mono text-xs font-medium transition-all duration-300',
                active === i ? 'border-royal bg-royal text-white' : 'border-ink/15 bg-card text-ink/40 group-hover:border-royal/40 group-hover:text-royal',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {i < count - 1 && (
              <span className={cn('mt-1 w-px flex-1 transition-colors duration-300', active === i ? 'bg-royal/40' : 'bg-ink/10')} aria-hidden="true" />
            )}
          </div>

          <div
            className={cn(
              'flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3 pb-6 transition-all duration-300',
              active === i ? 'translate-x-1 border-royal/25 bg-royal/[0.03]' : 'border-transparent group-hover:translate-x-1 group-hover:border-ink/8 group-hover:bg-card/60',
            )}
          >
            <span className="shrink-0 text-base leading-none" aria-hidden="true">
              {topic.icon}
            </span>
            <h4 className={cn('font-display text-base font-medium leading-snug tracking-tight transition-colors duration-300', active === i && 'text-royal')}>
              {topic.title}
            </h4>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExplorerLayout({ topics, active, setActive }) {
  return (
    <div className="divide-y divide-ink/8 border-y border-ink/8">
      {topics.map((topic, i) => (
        <div
          key={topic.title}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(null)}
          tabIndex={0}
          className={cn(
            'group flex items-center gap-4 border-l-2 py-4 pl-4 pr-2 transition-all duration-300',
            active === i ? 'border-l-royal bg-royal/[0.03]' : 'border-l-transparent hover:border-l-royal/40 hover:bg-royal/[0.02]',
          )}
        >
          <span
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-xs font-medium transition-colors duration-300',
              active === i ? 'bg-royal text-white' : 'bg-royal/10 text-royal',
            )}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="shrink-0 text-lg leading-none" aria-hidden="true">
            {topic.icon}
          </span>
          <h4 className={cn('flex-1 font-display text-base font-medium leading-snug tracking-tight transition-colors duration-300 sm:text-lg', active === i && 'text-royal')}>
            {topic.title}
          </h4>
          <ChevronRight
            className={cn('h-4 w-4 shrink-0 transition-all duration-300', active === i ? 'translate-x-0.5 text-royal' : 'text-ink/20 group-hover:translate-x-0.5 group-hover:text-royal/60')}
          />
        </div>
      ))}
    </div>
  )
}

const LAYOUTS = { journey: JourneyLayout, modules: ModulesLayout, explorer: ExplorerLayout }

export default function FormationTopics({ eyebrow, heading, topics, layout = 'journey' }) {
  const [active, setActive] = useState(null)
  const Layout = LAYOUTS[layout] || JourneyLayout
  if (!topics?.length) return null

  return (
    <div>
      {(eyebrow || heading) && (
        <Reveal className="max-w-2xl">
          {eyebrow && (
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink/30" /> {eyebrow}
            </span>
          )}
          {heading && <h2 className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>}
        </Reveal>
      )}

      <Reveal delay={0.1} className={cn(eyebrow || heading ? 'mt-8 sm:mt-10' : '')}>
        <Layout topics={topics} active={active} setActive={setActive} />
      </Reveal>
    </div>
  )
}
