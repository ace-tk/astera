import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

/** Tracks which of the page's five section ids currently owns the most
 * viewport, via a single IntersectionObserver — shared by both nav variants
 * below so the desktop rail and the mobile strip never disagree. */
function useSectionScrollSpy(ids) {
  const [activeId, setActiveId] = useState(ids[0])
  const ratios = useRef({})

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.current[entry.target.id] = entry.intersectionRatio
        })
        const [topId] = Object.entries(ratios.current).sort((a, b) => b[1] - a[1])[0] || []
        if (topId) setActiveId(topId)
      },
      { rootMargin: '-15% 0% -55% 0%', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

function goToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * The À propos page's "Sur cette page" navigator — desktop variant: a
 * sticky rail beside the hero + all five sections (it lives in the shared
 * grid's second column in APropos.jsx, so it stays in view across the whole
 * story, not just the hero). Same five existing eyebrow labels as the
 * sections themselves; nothing here is new copy.
 */
export function AProposNavSticky({ chapters }) {
  const ids = chapters.map((c) => c.id)
  const activeId = useSectionScrollSpy(ids)
  const activeIndex = Math.max(0, ids.indexOf(activeId))
  const progress = ((activeIndex + 1) / chapters.length) * 100

  return (
    <nav aria-label="Sur cette page" className="hidden lg:block">
      <div className="lg:sticky lg:top-32">
        <span className="eyebrow">
          <span className="h-px w-6 bg-ink/25" /> Sur cette page
        </span>
        <div className="relative mt-5 pl-6">
          <span className="absolute inset-y-0 left-0 w-px bg-ink/8" aria-hidden="true" />
          <motion.span
            className="absolute left-0 top-0 w-px origin-top bg-royal"
            initial={false}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
          <ul className="space-y-5">
            {chapters.map((c) => {
              const isActive = c.id === activeId
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => goToSection(c.id)}
                    className="group block text-left focus:outline-none"
                  >
                    <span className={cn('flex items-baseline gap-3', isActive ? 'text-ink' : 'text-ink/35 group-hover:text-ink/60')}>
                      <span className={cn('font-display text-xs tabular-nums transition-colors duration-300', isActive ? 'text-royal' : 'text-ink/30')}>
                        {c.number}
                      </span>
                      <span className={cn('text-sm leading-snug transition-colors duration-300', isActive && 'font-medium')}>{c.eyebrow}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}

/** Mobile/tablet variant: a compact horizontal scroll strip right below the
 * hero, same active-tracking as the desktop rail, contained with
 * overflow-x so it can never widen the page. */
export function AProposNavMobile({ chapters }) {
  const ids = chapters.map((c) => c.id)
  const activeId = useSectionScrollSpy(ids)

  return (
    <nav aria-label="Sur cette page" className="lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chapters.map((c) => {
          const isActive = c.id === activeId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => goToSection(c.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-300',
                isActive ? 'border-transparent bg-royal text-white' : 'border-ink/10 text-ink/60',
              )}
            >
              <span className="tabular-nums">{c.number}</span>
              {c.eyebrow}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
