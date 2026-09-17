import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const COLS = {
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/** Same card recipe as FeatureGrid's cards (rounded-[1.6rem], border-ink/8,
 * bg-card/95, shadow-soft, hover lift) but with a small colored tag label
 * instead of an icon badge — FeatureGrid's `icon` is a required prop, and
 * these two new sections have no icons in their reference design, so this
 * stays a separate small component rather than making icon optional on a
 * shared component several other pages also render. */
function InfoCard({ tag, title, body }) {
  return (
    <div className="h-full rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-sky">{tag}</span>
      <h3 className="mt-3 font-display text-lg font-medium tracking-tight text-ink">{title}</h3>
      {body && <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>}
    </div>
  )
}

/**
 * Eyebrow-pill + heading + lead + tag/title/body card grid — used for the
 * "Our institutions" and "SIRUS portal" sections. The pill reuses the
 * existing sky/royal accent tokens (bg-sky/10 + text-royal) rather than new
 * colors, and the section-level border-t/py rhythm matches the other
 * homepage sections (ProcessRecomposed, OrchestratedIntelligence, etc.).
 */
export default function InfoCardSection({ eyebrow, heading, lead, items, columns = 4 }) {
  return (
    <section className="relative border-t border-ink/10 bg-paper py-14 sm:py-16">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-sky/20 bg-sky/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-royal">
            {eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-balance text-ink sm:text-4xl">
            {heading}
          </h2>
          {lead && <p className="mt-4 max-w-xl text-base leading-relaxed text-muted text-pretty">{lead}</p>}
        </Reveal>

        <div className={cn('mt-8 grid grid-cols-1 gap-4', COLS[columns] || COLS[4])}>
          {items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 4) * 0.05} className="h-full">
              <InfoCard {...item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
