import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'
import { COMMENT_CA_MARCHE } from '@/constants/atoopvHome'

/** One of the two parallel tracks — same card recipe used throughout this
 * page (rounded-[1.6rem], border-ink/8, bg-card/95, shadow-soft), with a
 * simple numbered-circle step list inside. */
function Track({ title, steps }) {
  return (
    <div className="h-full rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft sm:p-8">
      <h3 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">{title}</h3>
      <ol className="mt-6">
        {steps.map((step, i) => (
          <li key={step.title} className={cn('flex gap-4 border-t border-ink/8 py-5', i === 0 && 'border-t-0 pt-0')}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs text-paper">
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-ink">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * "Comment ça marche" — verbatim from the reference index.html, two
 * parallel tracks (human drafting vs. AI-assisted) side by side. Sits
 * directly below NotreConviction. Same pill-eyebrow + heading treatment as
 * NotreConviction/InfoCardSection, same border-t/py section rhythm as the
 * rest of the homepage's editorial sections.
 */
export default function CommentCaMarche({ data = COMMENT_CA_MARCHE }) {
  return (
    <section className="relative border-t border-ink/10 bg-paper py-16 sm:py-20">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-sky/20 bg-sky/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-royal">
            {data.eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-balance text-ink sm:text-4xl">
            {data.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 lg:grid-cols-2">
          {data.tracks.map((track, i) => (
            <Reveal key={track.title} delay={i * 0.08} className="h-full">
              <Track title={track.title} steps={track.steps} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
