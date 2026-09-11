import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

/**
 * modele-pv-cse-gratuit-only sticky editorial rail: a numbered index of the
 * page's own existing icon-section headings (see GuideModelArticleBody),
 * no new copy, that highlights whichever section currently owns the most
 * viewport. Same single-IntersectionObserver approach as the Design Lab's
 * ExperimentNavigator, rebuilt page-locally rather than shared since this
 * is the only reading-progress rail anywhere in the ported ATOOPV site.
 */
export default function GuideModelRail({ items }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? null)
  const ratios = useRef({})

  useEffect(() => {
    const elements = items.map((it) => document.getElementById(it.id)).filter(Boolean)
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
  }, [items])

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!items.length) return null

  return (
    <nav aria-label="Sections de l'article" className="hidden xl:sticky xl:top-28 xl:flex xl:max-h-[calc(100vh-8rem)] xl:flex-col">
      <span className="eyebrow shrink-0 px-4">
        <span className="h-px w-6 bg-ink/25" /> Dans cet article
      </span>
      <ul className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto [scrollbar-width:thin]">
        {items.map((item, i) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => goTo(item.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300',
                  isActive ? 'border-ink/10 bg-card/80 shadow-soft backdrop-blur-md' : 'border-transparent hover:bg-ink/[0.03]',
                )}
              >
                <span className={cn('font-display text-xs tabular-nums transition-colors duration-300', isActive ? 'text-royal' : 'text-ink/30')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={cn('text-sm leading-snug transition-colors duration-300', isActive ? 'font-medium text-ink' : 'text-ink/50')}>
                  {item.heading}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
