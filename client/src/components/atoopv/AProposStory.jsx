import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'

const EASE = [0.16, 1, 0.3, 1]

function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const onChange = () => setIsDesktop(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])
  return isDesktop
}

/** Builds the five numbered "chapters" straight from the page's own
 * existing content objects — nothing here is new copy, just a different
 * shape for the same eyebrow/heading/body/items/list fields already used
 * by RichTextSection and FeatureGrid elsewhere on this page. */
function buildChapters({ mission, values, approach, founder, sirus }) {
  return [
    { number: '01', eyebrow: mission.eyebrow, heading: mission.heading, kind: 'text', body: mission.blocks.map((b) => b.text) },
    { number: '02', eyebrow: values.eyebrow, heading: values.heading, kind: 'values', items: values.items },
    { number: '03', eyebrow: approach.eyebrow, heading: approach.heading, kind: 'text', body: approach.blocks.map((b) => b.text) },
    { number: '04', eyebrow: founder.eyebrow, heading: founder.heading, kind: 'founder', lead: founder.lead, list: founder.blocks[0]?.items || [] },
    { number: '05', eyebrow: sirus.eyebrow, heading: sirus.heading, kind: 'text', body: sirus.blocks.map((b) => b.text) },
  ]
}

function ChapterNumeral({ index, count, progress, label }) {
  const seg = 1 / count
  const center = index * seg + seg / 2
  const opacity = useTransform(progress, [center - seg, center - seg * 0.35, center, center + seg * 0.35, center + seg], [0.12, 0.12, 1, 0.12, 0.12])
  const scale = useTransform(progress, [center - seg, center, center + seg], [0.85, 1, 0.85])
  const y = useTransform(progress, [center - seg, center, center + seg], [24, 0, -24])

  return (
    <motion.span
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex items-center font-display text-[5rem] leading-none text-ink sm:text-[7rem] lg:text-[8.5rem]"
    >
      {label}
    </motion.span>
  )
}

/** Its own component (not an inline `.map()` callback) so `useTransform`
 * is called once per mounted instance, in a stable order — calling a hook
 * inside a loop within a single component's render body would break the
 * Rules of Hooks even though the array length here happens to be fixed. */
function TrackerTick({ index, count, progress }) {
  const scaleX = useTransform(progress, [index / count, (index + 1) / count], [0, 1])
  return (
    <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink/8">
      <motion.span className="absolute inset-y-0 left-0 origin-left rounded-full bg-royal" style={{ scaleX }} />
    </span>
  )
}

function ChapterBody({ chapter }) {
  return (
    <motion.div
      key={chapter.number}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.15, ease: 'easeIn' } }}
      className="absolute inset-0"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{chapter.eyebrow}</span>
      <h3 className="mt-3 max-w-lg font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{chapter.heading}</h3>

      {chapter.kind === 'text' && (
        <div className="mt-4 max-w-lg space-y-3">
          {chapter.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted sm:text-base">
              {p}
            </p>
          ))}
        </div>
      )}

      {chapter.kind === 'values' && (
        <div className="mt-5 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          {chapter.items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-xl border border-ink/8 bg-card/60 p-4">
                <Icon className="h-4 w-4 text-royal" strokeWidth={1.75} />
                <p className="mt-2 font-display text-sm font-medium tracking-tight">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
              </div>
            )
          })}
        </div>
      )}

      {chapter.kind === 'founder' && (
        <div className="mt-4 max-w-lg">
          {chapter.lead && <p className="text-sm leading-relaxed text-ink/80 sm:text-base">{chapter.lead}</p>}
          <ul className="mt-3 space-y-2">
            {chapter.list.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-royal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

/** Desktop path: a pinned vertical scroll drives the numeral crossfade and
 * the content swap — same mechanic as the Design Lab's Structured
 * Intelligence experiment (useScroll + per-index transforms), rebuilt here
 * independently for production rather than importing the sandbox component. */
function PinnedStory({ chapters }) {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const count = chapters.length
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(count - 1, Math.max(0, Math.floor(v * count)))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  return (
    <section ref={sectionRef} className="relative border-t border-ink/8" style={{ height: `${count * 90}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="shell">
          <div className="grid grid-cols-[8rem_1fr] items-center gap-8 lg:grid-cols-[10rem_1fr] lg:gap-16">
            <div className="relative h-24 sm:h-28 lg:h-32">
              {chapters.map((c, i) => (
                <ChapterNumeral key={c.number} index={i} count={count} progress={scrollYProgress} label={c.number} />
              ))}
            </div>

            <div className="relative min-h-[16rem] sm:min-h-[14rem]">
              {/* Default (non-"wait") mode on purpose — matches the Design
                  Lab's Structured Intelligence precedent. "wait" mode blocks
                  the next chapter's mount until the previous one's exit
                  finishes, which queues under rapid scroll changes and can
                  visibly skip a chapter; ChapterBody is already absolutely
                  positioned so the two can overlap safely without a layout
                  jump while the crossfade plays. */}
              <AnimatePresence initial={false}>
                <ChapterBody key={chapters[active].number} chapter={chapters[active]} />
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-2 sm:mt-14">
            {chapters.map((c, i) => (
              <TrackerTick key={c.number} index={i} count={count} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Mobile/tablet/reduced-motion path: the same five chapters as a normal
 * stacked column, built from the exact same existing components used
 * before this change (RichTextSection, FeatureGrid) — not a shrunken
 * version of the pinned desktop mechanic, a genuinely different, safe,
 * already-proven layout. */
function StackedStory({ mission, values, approach, founder, sirus }) {
  return (
    <div className="shell py-14 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <RichTextSection eyebrow={mission.eyebrow} heading={mission.heading} blocks={mission.blocks} color="royal" />
      </div>

      <div className="mt-14">
        <FeatureGrid eyebrow={values.eyebrow} heading={values.heading} items={values.items} color="royal" columns={4} />
      </div>

      <div className="mx-auto mt-14 max-w-3xl space-y-14">
        <RichTextSection eyebrow={approach.eyebrow} heading={approach.heading} blocks={approach.blocks} color="royal" />
        <RichTextSection eyebrow={founder.eyebrow} heading={founder.heading} lead={founder.lead} blocks={founder.blocks} color="royal" />
        <RichTextSection eyebrow={sirus.eyebrow} heading={sirus.heading} blocks={sirus.blocks} color="royal" />
      </div>
    </div>
  )
}

/**
 * The À propos page's mid-page scroll story — everything between the hero
 * and the existing "Travaillons ensemble" CTASection (untouched, see
 * APropos.jsx). Desktop with motion allowed gets a pinned, numbered,
 * editorial crossfade (mission → values → approach → founder → SIRUS);
 * everything else gets the same five chapters as a plain stacked column via
 * the exact components already used on this page pre-change.
 */
export default function AProposStory(props) {
  const isDesktop = useIsDesktop(1024)
  const reduceMotion = useReducedMotion()
  const chapters = buildChapters(props)

  return isDesktop && !reduceMotion ? <PinnedStory chapters={chapters} /> : <StackedStory {...props} />
}
