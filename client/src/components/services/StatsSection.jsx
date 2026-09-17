import Reveal from '@/components/ui/Reveal'
import CountUp from '@/components/ui/CountUp'

/** Pulls a leading integer + trailing suffix out of a stat value (e.g.
 * "48 à 72h" → {number: 48, suffix: " à 72h"}), so purely numeric/
 * numeric-prefixed stats can count up while non-numeric ones (e.g.
 * "CSE · CSSCT · IRP") render as plain static text. */
function parseLeadingNumber(value) {
  const match = /^(\d+)(.*)$/.exec(value)
  if (!match) return null
  return { number: Number(match[1]), suffix: match[2] }
}

/**
 * A row of trust stats — the same grammar as the homepage Story stat band,
 * generalized for reuse across service pages. All stats sit on one row
 * from `sm:` up (only true mobile gets the 2×2 fallback), wrapped in a
 * bordered card with a faint line-grid backdrop (same recipe
 * ProcessRecomposed/OrchestratedIntelligence already reproduce locally for
 * production use) so the strip reads as a distinct, elevated panel.
 */
export default function StatsSection({ stats }) {
  return (
    <div className="shell mt-14">
      <div className="relative overflow-hidden rounded-[2rem] border border-ink/8 px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(var(--line) / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line) / 0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {stats.map((s, i) => {
            const parsed = parseLeadingNumber(s.value)
            return (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                  {parsed ? <CountUp value={parsed.number} suffix={parsed.suffix} /> : s.value}
                </div>
                <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-muted">{s.label}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </div>
  )
}
