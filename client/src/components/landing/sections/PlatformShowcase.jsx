import { motion } from 'framer-motion'
import { accent } from '@/utils/accent'
import SpotlightCard from '@/components/ui/SpotlightCard'
import Glyph from '@/components/ui/Glyph'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * Replaces the Homepage's old Pricing section (moved to /atoopv/tarification).
 * Same uneven bento pattern as Features.jsx (SpotlightCard + Glyph + variable
 * spans), distinct content — this showcases the product's surfaces rather
 * than pitching capabilities, so the page doesn't read as two Features sections.
 */
const TILES = [
  {
    id: 'reports',
    eyebrow: 'AI Reports',
    title: 'A report that reads like a briefing.',
    body: 'Headline, decisions, owners, and a scrubbable timeline — composed automatically from the raw conversation.',
    color: 'royal',
    span: 'lg:col-span-3 lg:row-span-2',
    glyph: 'report',
  },
  {
    id: 'speakers',
    eyebrow: 'Speaker Intelligence',
    title: 'Knows who spoke, and how it landed.',
    body: 'Talk-time balance and per-speaker contribution, mapped straight from the audio — no manual tagging.',
    color: 'purple',
    span: 'lg:col-span-3',
    glyph: 'mic',
  },
  {
    id: 'analytics',
    eyebrow: 'Analytics',
    title: 'Every meeting, measured.',
    body: 'Decision velocity and follow-through, tracked across your whole workspace over time.',
    color: 'coral',
    span: 'lg:col-span-3',
    glyph: 'chart',
  },
  {
    id: 'decisions',
    eyebrow: 'Decisions',
    title: 'What was decided, on the record.',
    body: 'Every call made in the room, captured with the moment it happened.',
    color: 'sky',
    span: 'lg:col-span-2',
    glyph: 'brain',
  },
  {
    id: 'actions',
    eyebrow: 'Action Items',
    title: 'Commitments that don’t slip.',
    body: 'Owners and due dates extracted automatically, so follow-through is never a guessing game.',
    color: 'golden',
    span: 'lg:col-span-2',
    glyph: 'send',
  },
  {
    id: 'risks',
    eyebrow: 'Risks',
    title: 'The quiet red flags, surfaced.',
    body: 'Risk language and unresolved tension the room may have skated past, flagged for review.',
    color: 'rose',
    span: 'lg:col-span-2',
    glyph: 'alert',
  },
  {
    id: 'timeline',
    eyebrow: 'Meeting Timeline',
    title: 'Scrub straight to the moment.',
    body: 'A living, minute-by-minute timeline you can jump through — see exactly when the room shifted.',
    color: 'emerald',
    span: 'lg:col-span-3',
    glyph: 'timeline',
  },
  {
    id: 'compliance',
    eyebrow: 'Compliance',
    title: 'Every promise, kept on file.',
    body: 'Commitments and obligations are logged and flagged, so nothing said out loud quietly disappears.',
    color: 'mint',
    span: 'lg:col-span-3',
    glyph: 'shield',
  },
]

function ShowcaseTile({ t, i }) {
  const a = accent(t.color)
  const tint = a.hex
    .replace('#', '')
    .match(/.{2}/g)
    .map((h) => parseInt(h, 16))
    .join(' ')

  return (
    <Reveal delay={(i % 3) * 0.06} className={cn('min-h-[15rem]', t.span)}>
      <SpotlightCard tint={tint} className="flex h-full flex-col justify-between p-7">
        <div className="flex items-start justify-between">
          <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', a.softBg, a.text)}>
            <Glyph name={t.glyph} size={34} />
          </span>
          <span className={cn('eyebrow', a.text)}>{t.eyebrow}</span>
        </div>
        <div className="mt-8">
          <h3 className="font-display text-2xl font-medium leading-tight tracking-tight text-balance lg:text-[1.7rem]">
            {t.title}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{t.body}</p>
        </div>
        <motion.span className={cn('mt-6 block h-1 w-12 rounded-full transition-all duration-500 group-hover:w-24', a.bg)} />
      </SpotlightCard>
    </Reveal>
  )
}

export default function PlatformShowcase() {
  return (
    <section id="platform" className="relative py-section">
      <div className="shell">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <span className="eyebrow"><span className="h-px w-8 bg-ink/30" /> Platform</span>
            <h2 className="mt-6 max-w-xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
              One workspace. Every signal in view.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              From the first upload to the final decision — explore the surfaces that make up ATOOPV.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {TILES.map((t, i) => (
            <ShowcaseTile key={t.id} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
