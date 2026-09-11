import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

/** Same single-IntersectionObserver scrollspy already proven on the guide
 * page's rail and À propos's "Sur cette page" nav, generalized here so any
 * page with a real multi-heading structure can reuse it instead of hand-
 * rolling the observer again. */
function useScrollSpy(ids) {
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
      // Top margin is a fixed pixel value, not a percentage: MarkdownArticle's
      // headings carry `scroll-mt-28` (112px) so `scrollIntoView` clears the
      // fixed navbar, landing a heading's top right around y=112. A
      // percentage-based top margin (the previous `-15%`) shrinks by a
      // viewport-height-dependent amount that can land ABOVE that 112px —
      // e.g. 150px on a 1000px-tall viewport — so a short heading scrolled
      // to its own anchor point would sit just above the "active" zone and
      // never register, even though it's the exact section just navigated
      // to. Matching the margin to the same 112px scroll-mt anchor (with a
      // few px of slack) means a just-clicked heading is inside the active
      // zone immediately, regardless of viewport height.
      { rootMargin: '-96px 0% -55% 0%', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

/**
 * A compact sticky "in this article" rail, built entirely from a page's own
 * existing `##` headings (see utils/markdownSections.js) — numbers here are
 * a visual index of real content, not invented section markers. Reusable
 * across any Ressources/Blog article with a genuine multi-section shape.
 */
export default function EditorialSectionRail({ items }) {
  const ids = items.map((it) => it.id)
  const activeId = useScrollSpy(ids)

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!items.length) return null

  return (
    <nav aria-label="Sections de l'article" className="hidden xl:block">
      <div className="xl:sticky xl:top-28">
        <span className="eyebrow">
          <span className="h-px w-6 bg-ink/25" /> Dans cet article
        </span>
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => {
            const isActive = item.id === activeId
            return (
              <li key={item.id}>
                <button type="button" onClick={() => goTo(item.id)} className="group block text-left">
                  <span className={cn('flex items-baseline gap-3', isActive ? 'text-ink' : 'text-ink/35 group-hover:text-ink/60')}>
                    <span className={cn('font-display text-xs tabular-nums', isActive ? 'text-royal' : 'text-ink/30')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={cn('text-sm leading-snug', isActive && 'font-medium')}>{item.label}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
