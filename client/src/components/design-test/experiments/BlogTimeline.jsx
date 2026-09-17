import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import { BLOG_ARTICLES, BLOG_TOPICS } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

function Node({ article, isActive, onSelect, registerRef }) {
  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      aria-current={isActive}
      className="group relative flex shrink-0 snap-center flex-col items-center gap-3 px-6 first:pl-1 last:pr-1 sm:px-8"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted/50 transition-colors group-hover:text-muted">
        {article.month} {article.year}
      </span>
      <span
        className={clsx(
          'relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-all duration-300',
          isActive ? 'scale-125 border-accent bg-accent' : 'border-ink/25 bg-paper group-hover:border-ink/50',
        )}
      >
        <span className={clsx('h-1 w-1 rounded-full transition-colors', isActive ? 'bg-paper' : 'bg-ink/30')} />
      </span>
    </button>
  )
}

function ArticleCard({ article, isActive, onSelect, registerRef }) {
  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      className={clsx(
        'flex w-64 shrink-0 snap-center flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-400 sm:w-72',
        isActive ? 'border-ink/15 bg-card shadow-soft' : 'border-ink/10 bg-transparent opacity-55 hover:opacity-80',
      )}
      style={{ transform: isActive ? 'scale(1)' : 'scale(0.94)' }}
    >
      <TechnicalLabel dot={false} className="text-muted/60">
        {article.topic}
      </TechnicalLabel>
      <h3 className="font-display text-lg leading-snug text-ink sm:text-xl">{article.title}</h3>
      <p className="text-sm leading-relaxed text-muted">{article.excerpt}</p>
      <div className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
        <span>{article.readingTime}</span>
        <span aria-hidden="true">·</span>
        <span>{article.author}</span>
      </div>
    </button>
  )
}

/**
 * BLOG / ATOOSAVOIR / INSIGHTS — time itself is the navigation: a horizontal
 * rail of date-nodes (draggable/scrollable) sits above a matching row of
 * article cards, both riding the same scroll-snap track so choosing a date
 * always centers its article. A giant month/year watermark behind
 * everything tracks whichever article is active, crossfading rather than
 * sitting static — the one piece of "time passing" ambient motion.
 */
export default function BlogTimeline() {
  const [topic, setTopic] = useState('Tous')
  const [activeId, setActiveId] = useState(BLOG_ARTICLES[0].id)
  const reduceMotion = useReducedMotion()
  const nodeRefs = useRef(new Map())
  const trackRef = useRef(null)

  const articles = useMemo(
    () => (topic === 'Tous' ? BLOG_ARTICLES : BLOG_ARTICLES.filter((a) => a.topic === topic)),
    [topic],
  )

  useEffect(() => {
    if (!articles.find((a) => a.id === activeId) && articles.length > 0) {
      setActiveId(articles[0].id)
    }
  }, [articles, activeId])

  const activeIndex = Math.max(0, articles.findIndex((a) => a.id === activeId))
  const active = articles[activeIndex] || articles[0]

  const selectArticle = (id) => {
    setActiveId(id)
    const node = nodeRefs.current.get(id)
    node?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  const step = (delta) => {
    const next = articles[Math.min(articles.length - 1, Math.max(0, activeIndex + delta))]
    if (next) selectArticle(next.id)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  const progress = articles.length > 1 ? activeIndex / (articles.length - 1) : 0

  if (!active) return null

  return (
    <section id="experiment-08" className="relative overflow-hidden border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active.month}-${active.year}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -40 }}
            transition={{ duration: reduceMotion ? 0.2 : 1.1, ease: EASE }}
            className="select-none whitespace-nowrap font-display leading-none text-ink/[0.045]"
            style={{ fontSize: 'min(30vw, 22rem)' }}
          >
            {active.month} {active.year}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shell relative">
        <div className="mb-14 flex flex-col gap-6 sm:mb-20 sm:flex-row sm:items-end sm:justify-between">
          <ExperimentHeader index="08" eyebrow="EXPERIMENT / 08" titleLines={['TIME AS', 'NAVIGATION.']} />

          <div className="relative shrink-0 self-start sm:self-auto">
            <TechnicalLabel dot={false} className="mb-2">
              FILTER
            </TechnicalLabel>
            <div className="relative">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Filtrer les articles par thème"
                className="w-48 appearance-none rounded-full border border-ink/15 bg-paper py-2 pl-4 pr-9 font-mono text-[11px] uppercase tracking-[0.14em] text-ink outline-none transition-colors hover:border-ink/30 focus-visible:border-accent"
              >
                {BLOG_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        <div role="group" aria-label="Chronologie des articles" onKeyDown={onKeyDown} className="relative">
          <TechnicalLabel dot={false} className="mb-4 text-muted/50">
            DRAG / SCROLL
          </TechnicalLabel>
          <div className="relative mb-1 h-px w-full bg-ink/10">
            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left bg-accent"
              animate={{ scaleX: progress }}
              initial={false}
              transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: EASE }}
            />
          </div>

          <div ref={trackRef} className="dt-no-scrollbar flex snap-x snap-mandatory overflow-x-auto pb-2 pt-6">
            {articles.map((article) => (
              <Node
                key={article.id}
                article={article}
                isActive={article.id === active.id}
                onSelect={() => selectArticle(article.id)}
                registerRef={(el) => {
                  if (el) nodeRefs.current.set(article.id, el)
                }}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4 sm:mt-10">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={activeIndex === 0}
              aria-label="Article précédent"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="dt-no-scrollbar flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-1 py-2">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isActive={article.id === active.id}
                  onSelect={() => selectArticle(article.id)}
                  registerRef={() => {}}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => step(1)}
              disabled={activeIndex === articles.length - 1}
              aria-label="Article suivant"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/30 disabled:opacity-25"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60">
            {String(activeIndex + 1).padStart(2, '0')} / {String(articles.length).padStart(2, '0')} — {active.title}
          </p>
        </div>
      </div>
    </section>
  )
}
