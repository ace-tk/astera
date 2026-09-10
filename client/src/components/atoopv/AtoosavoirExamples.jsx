import { useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * atoosavoir-only editorial treatment of "Le saviez-vous ?" / "Ce que le
 * droit prévoit pour vous." — the existing eyebrow/heading/lead plus the
 * existing three Q&A items (title + body, verbatim), laid out as a
 * connected vertical sequence instead of three equal-height cards. The
 * three items' body lengths differ a lot (one ~500 chars, one ~230), which
 * is exactly why a 3-up card grid produced the "empty space" complaint —
 * stacking them lets each read at its natural height while a hairline +
 * dot connects them and tracks scroll position between the three, the way
 * the page's own AProposNav/ChapterRail sections already do elsewhere on
 * the site. Page-scoped: RichTextSection's shared StepsBlock (used by two
 * other pages) is untouched.
 */
function ExampleItem({ number, title, body, offset, isActive, isLast }) {
  return (
    <div className={cn('group grid grid-cols-[3rem_1fr] gap-4 sm:grid-cols-[4rem_1fr] sm:gap-6', offset && 'sm:pl-8 lg:pl-20')}>
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500',
            isActive ? 'bg-royal' : 'bg-ink/15 group-hover:bg-royal/50',
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'mt-2 font-display text-3xl font-semibold leading-none transition-colors duration-500 sm:text-4xl',
            isActive ? 'text-royal' : 'text-ink/12',
          )}
        >
          {number}
        </span>
        {!isLast && (
          <span
            className={cn('mt-3 w-px flex-1 transition-colors duration-500', isActive ? 'bg-royal/40' : 'bg-ink/10')}
            aria-hidden="true"
          />
        )}
      </div>

      <div className={cn('pb-10 transition-transform duration-300 sm:pb-14', 'group-hover:translate-x-1')}>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink/30">Question</span>
        <h3
          className={cn(
            'mt-2 font-display text-xl font-medium leading-snug tracking-tight text-balance transition-colors duration-300 sm:text-2xl',
            isActive ? 'text-royal' : 'group-hover:text-royal',
          )}
        >
          {title}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">{body}</p>
      </div>
    </div>
  )
}

export default function AtoosavoirExamples({ eyebrow, heading, lead, blocks = [] }) {
  const steps = blocks.find((b) => b.type === 'steps')
  const items = steps?.items || []
  const containerRef = useRef(null)
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const count = items.length

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start center', 'end center'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(count - 1, Math.max(0, Math.floor(v * count)))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  return (
    <div>
      <Reveal className="max-w-2xl">
        {eyebrow && (
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink/30" /> {eyebrow}
          </span>
        )}
        {heading && <h2 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-balance sm:text-4xl">{heading}</h2>}
        {lead && <p className="mt-4 text-base leading-relaxed text-muted text-pretty">{lead}</p>}
      </Reveal>

      {items.length > 0 && (
        <div ref={containerRef} className="mt-10 sm:mt-12">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={reduceMotion ? 0 : i * 0.08}>
              <ExampleItem
                number={String(i + 1).padStart(2, '0')}
                title={item.title}
                body={item.body}
                offset={i === 1}
                isActive={i === active}
                isLast={i === count - 1}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
