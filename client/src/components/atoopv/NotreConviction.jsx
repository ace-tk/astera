import Reveal from '@/components/ui/Reveal'
import { NOTRE_CONVICTION } from '@/constants/atoopvHome'

/**
 * "Notre conviction" — centered quote band, verbatim content from the
 * reference index.html's `.positioning` section (`text-align: center`).
 * Sits directly below the Orchestrated Intelligence 4-box grid. Same
 * pill-eyebrow recipe as InfoCardSection (bg-sky/10 + text-royal), same
 * border-t/py section rhythm as ProcessRecomposed/OrchestratedIntelligence.
 */
export default function NotreConviction({ data = NOTRE_CONVICTION }) {
  return (
    <section className="relative border-t border-ink/10 bg-paper py-16 text-center sm:py-20">
      <div className="shell">
        <Reveal className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-sky/20 bg-sky/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-royal">
            {data.eyebrow}
          </span>

          <h2 className="mx-auto mt-5 max-w-2xl font-display text-2xl font-semibold leading-tight tracking-tight text-balance text-ink sm:text-3xl lg:text-4xl">
            {data.heading}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted text-pretty">{data.lead}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:mt-14">
          {data.stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">{stat.value}</div>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
