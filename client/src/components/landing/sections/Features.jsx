import { motion } from 'framer-motion'
import { FEATURES } from '@/constants/content'
import { accent } from '@/utils/accent'
import SpotlightCard from '@/components/ui/SpotlightCard'
import Glyph from '@/components/ui/Glyph'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * Editorial bento — deliberately uneven tiles (wide / tall / square), each
 * owning its feature color. Pinterest-meets-Apple, never a row of equal cards.
 */
function FeatureTile({ f, i }) {
  const a = accent(f.color)
  const tint = a.hex
    .replace('#', '')
    .match(/.{2}/g)
    .map((h) => parseInt(h, 16))
    .join(' ')

  return (
    <Reveal delay={(i % 3) * 0.06} className={cn('min-h-[15rem]', f.span)}>
      <SpotlightCard tint={tint} className="flex h-full flex-col justify-between p-7">
        <div className="flex items-start justify-between">
          <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', a.softBg, a.text)}>
            <Glyph name={f.glyph} size={34} />
          </span>
          <span className={cn('eyebrow', a.text)}>{f.eyebrow}</span>
        </div>
        <div className="mt-8">
          <h3 className="font-display text-2xl font-medium leading-tight tracking-tight text-balance lg:text-[1.7rem]">
            {f.title}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{f.body}</p>
        </div>
        {/* decorative accent bar that grows on hover */}
        <motion.span className={cn('mt-6 block h-1 w-12 rounded-full transition-all duration-500 group-hover:w-24', a.bg)} />
      </SpotlightCard>
    </Reveal>
  )
}

export default function Features() {
  return (
    <section id="features" className="relative py-section">
      <div className="shell">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <span className="eyebrow"><span className="h-px w-8 bg-ink/30" /> Capabilities</span>
            <h2 className="mt-6 max-w-xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
              Everything a great chief of staff would do. In ninety seconds.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Seven capabilities, each with a job to do — and a color to prove it.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f, i) => (
            <FeatureTile key={f.id} f={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
