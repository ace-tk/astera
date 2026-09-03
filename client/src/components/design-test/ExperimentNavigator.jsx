import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { EXPERIMENTS } from '@/constants/designTest'

/**
 * The understated experiment index (brief §14): part of the editorial
 * system, not a website nav bar. Tracks which section currently owns the
 * most viewport via a single IntersectionObserver and lets a click glide
 * there through the page's existing Lenis instance when present.
 */
export default function ExperimentNavigator() {
  const [active, setActive] = useState(null)
  const ratios = useRef({})

  useEffect(() => {
    const elements = EXPERIMENTS.map((exp) => document.getElementById(exp.id)).filter(Boolean)
    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.current[entry.target.id] = entry.intersectionRatio
        })
        const [topId] = Object.entries(ratios.current).sort((a, b) => b[1] - a[1])[0] || []
        if (topId) setActive(topId)
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const goTo = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Navigateur d'expériences"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit gap-4 rounded-full border border-ink/10 bg-card/80 px-4 py-2 font-mono text-[11px] tracking-widest shadow-soft backdrop-blur-md lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-1/2 lg:w-auto lg:-translate-y-1/2 lg:flex-col lg:gap-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:backdrop-blur-none"
    >
      {EXPERIMENTS.map((exp) => {
        const isActive = active === exp.id
        return (
          <button
            key={exp.id}
            type="button"
            onClick={() => goTo(exp.id)}
            aria-current={isActive}
            aria-label={`Aller à l'expérience ${exp.number} — ${exp.label}`}
            className={clsx(
              'relative flex h-6 w-6 items-center justify-center transition-colors duration-300',
              isActive ? 'text-ink' : 'text-muted/40 hover:text-muted',
            )}
          >
            <span
              className={clsx(
                'absolute -left-2 hidden h-px bg-ink transition-all duration-300 lg:block',
                isActive ? 'w-2 opacity-100' : 'w-0 opacity-0',
              )}
              aria-hidden="true"
            />
            {exp.number}
          </button>
        )
      })}
    </nav>
  )
}
