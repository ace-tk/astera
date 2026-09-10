import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'
import { renderEmphasis } from '@/utils/richText'

/** The five section ids/numbers/eyebrows the page's own content already
 * has — shared between the sections below and AProposNav's "Sur cette
 * page" rail so the two can never drift out of sync. */
export function buildChapters({ mission, values, approach, founder, sirus }) {
  return [
    { id: 'section-01', number: '01', eyebrow: mission.eyebrow },
    { id: 'section-02', number: '02', eyebrow: values.eyebrow },
    { id: 'section-03', number: '03', eyebrow: approach.eyebrow },
    { id: 'section-04', number: '04', eyebrow: founder.eyebrow },
    { id: 'section-05', number: '05', eyebrow: sirus.eyebrow },
  ]
}

function SectionNumber({ number }) {
  return (
    <Reveal>
      <span className="font-display text-5xl font-semibold leading-none text-ink/12 sm:text-6xl">{number}</span>
    </Reveal>
  )
}

function SectionKicker({ eyebrow, heading }) {
  return (
    <Reveal className="max-w-2xl">
      <span className="eyebrow">
        <span className="h-px w-6 bg-ink/25" /> {eyebrow}
      </span>
      {heading && <h2 className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>}
    </Reveal>
  )
}

/** 01 — Notre raison d'être: number + divider on the left, heading and the
 * existing two paragraphs split into an editorial two-column spread on the
 * right (both paragraphs already exist, verbatim). */
function MissionSection({ eyebrow, heading, blocks, number }) {
  const paragraphs = blocks.filter((b) => b.type === 'paragraph')
  const twoUp = paragraphs.length > 1

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5rem_1fr] lg:gap-10">
      <SectionNumber number={number} />
      <div className="lg:border-l lg:border-ink/8 lg:pl-10">
        <SectionKicker eyebrow={eyebrow} heading={heading} />
        <Reveal delay={0.08} className={cn('mt-5', twoUp ? 'grid max-w-3xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2' : 'max-w-xl')}>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted lg:text-base">
              {p.text}
            </p>
          ))}
        </Reveal>
      </div>
    </div>
  )
}

/** 02 — Nos valeurs: the existing four values as an interactive focus-card
 * grid. Hover/focus lifts the card, turns its border and title ATOOPV blue,
 * fills its icon chip solid, and gently dims its siblings — every value's
 * existing title/body stays fully visible at all times (no hover-gated
 * content), so the interaction is decorative emphasis, not information
 * disclosure, and works the same via keyboard focus for touch/no-hover use. */
function ValuesGrid({ items }) {
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item, i) => {
        const Icon = item.icon
        const isActive = activeIndex === i
        const isDimmed = !reduceMotion && activeIndex !== null && !isActive
        return (
          <Reveal key={item.title} delay={i * 0.06} className="h-full">
            <div
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
              className={cn(
                'h-full rounded-[1.6rem] border bg-card/95 p-6 shadow-soft outline-none',
                'transition-[transform,box-shadow,border-color,opacity] duration-300 ease-out',
                isActive ? '-translate-y-1 border-royal/40 shadow-lift' : 'border-ink/8',
                isDimmed && 'opacity-60',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-2xl transition-colors duration-300',
                  isActive ? 'bg-royal text-white' : 'bg-royal/10 text-royal',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className={cn('mt-4 font-display text-base font-medium tracking-tight transition-colors duration-300', isActive && 'text-royal')}>
                {item.title}
              </p>
              <p className={cn('mt-2 text-sm leading-relaxed transition-colors duration-300', isActive ? 'text-ink/80' : 'text-muted')}>{item.body}</p>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

function ValuesSection({ eyebrow, heading, items, number }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5rem_1fr] lg:gap-10">
      <SectionNumber number={number} />
      <div className="lg:border-l lg:border-ink/8 lg:pl-10">
        <SectionKicker eyebrow={eyebrow} heading={heading} />
        <ValuesGrid items={items} />
      </div>
    </div>
  )
}

/** 03 — Notre approche: the existing two paragraphs as a small connected
 * timeline (numbered marker + linking rule) instead of two invented process
 * step titles — no label is added, each node's text is the paragraph
 * itself, verbatim. */
function ApproachSteps({ blocks }) {
  const paragraphs = blocks.filter((b) => b.type === 'paragraph')

  return (
    <div className="mt-8">
      {paragraphs.map((b, i) => (
        <Reveal key={i} delay={i * 0.08} className="relative flex gap-5 pb-7 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-royal/25 bg-royal/10 font-display text-xs font-semibold text-royal">
              {i + 1}
            </span>
            {i < paragraphs.length - 1 && <span className="mt-1 w-px flex-1 bg-ink/10" aria-hidden="true" />}
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted lg:text-base">{b.text}</p>
        </Reveal>
      ))}
    </div>
  )
}

function ApproachSection({ eyebrow, heading, blocks, number }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5rem_1fr] lg:gap-10">
      <SectionNumber number={number} />
      <div className="lg:border-l lg:border-ink/8 lg:pl-10">
        <SectionKicker eyebrow={eyebrow} heading={heading} />
        <ApproachSteps blocks={blocks} />
      </div>
    </div>
  )
}

/** 04 — L'expertise derrière AtooPV: no photo exists for this section in
 * the source, so the asymmetric treatment comes purely from typography —
 * the existing heading set large on one side, the existing lead + list on
 * the other. */
function FounderSection({ eyebrow, heading, lead, list, number }) {
  return (
    <div>
      <span className="font-display text-xs tabular-nums text-ink/30">{number}</span>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
        <Reveal>
          <span className="eyebrow">
            <span className="h-px w-6 bg-ink/25" /> {eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-medium leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl">{heading}</h2>
        </Reveal>
        <Reveal delay={0.08} className="lg:pt-1">
          {lead && <p className="text-base leading-relaxed text-ink/80 lg:text-lg">{lead}</p>}
          <ul className="mt-5 space-y-3">
            {list.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted lg:text-base">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-royal" />
                {renderEmphasis(item)}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  )
}

/** 05 — Innovation 2026: the story's closing beat, given a slightly bolder
 * treatment (bigger number, animated underline, a soft blue-tinted block
 * around the existing heading/paragraph) so it reads as a conclusion. */
function SirusSection({ eyebrow, heading, blocks, number }) {
  const paragraph = blocks.find((b) => b.type === 'paragraph')

  return (
    <div>
      <Reveal className="flex items-center gap-3">
        <span className="font-display text-5xl font-semibold leading-none text-ink/12 sm:text-6xl">{number}</span>
        <span className="eyebrow">
          <motion.span
            className="h-px w-6 origin-left bg-ink/30"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          {eyebrow}
        </span>
      </Reveal>

      <Reveal delay={0.08} className="mt-6 rounded-[1.75rem] border border-royal/20 bg-royal/[0.04] p-6 transition-colors duration-300 hover:bg-royal/[0.06] sm:p-8">
        <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>
        {paragraph && <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/75 text-pretty">{paragraph.text}</p>}
      </Reveal>
    </div>
  )
}

/**
 * The À propos page's mid-page content — five discrete, normal-flow
 * sections (mission → values → approach → founder → SIRUS), each with a
 * real `id` so AProposNav's "Sur cette page" rail can scroll-spy and jump
 * to them directly. Replaces the previous pinned/crossfade scroll mechanic:
 * every section is always independently reachable and reveals in on scroll
 * via the shared Reveal component, instead of being locked inside one tall
 * sticky viewport.
 */
export default function AProposSections({ mission, values, approach, founder, sirus }) {
  const founderList = founder.blocks[0]?.items || []

  return (
    <div className="space-y-14 sm:space-y-16">
      <section id="section-01" className="scroll-mt-32">
        <MissionSection eyebrow={mission.eyebrow} heading={mission.heading} blocks={mission.blocks} number="01" />
      </section>

      <section id="section-02" className="scroll-mt-32 border-t border-ink/8 pt-14 sm:pt-16">
        <ValuesSection eyebrow={values.eyebrow} heading={values.heading} items={values.items} number="02" />
      </section>

      <section id="section-03" className="scroll-mt-32 border-t border-ink/8 pt-14 sm:pt-16">
        <ApproachSection eyebrow={approach.eyebrow} heading={approach.heading} blocks={approach.blocks} number="03" />
      </section>

      <section id="section-04" className="scroll-mt-32 border-t border-ink/8 pt-14 sm:pt-16">
        <FounderSection eyebrow={founder.eyebrow} heading={founder.heading} lead={founder.lead} list={founderList} number="04" />
      </section>

      <section id="section-05" className="scroll-mt-32 border-t border-ink/8 pt-14 sm:pt-16">
        <SirusSection eyebrow={sirus.eyebrow} heading={sirus.heading} blocks={sirus.blocks} number="05" />
      </section>
    </div>
  )
}
