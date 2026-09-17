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
 * from `sm:` up (only true mobile gets the 2×2 fallback), on a flat tinted
 * band (bg-ink/[0.03], an existing subtle-tint convention already used
 * elsewhere in this codebase) with thin dividers between columns at `sm:`+.
 */
export default function StatsSection({ stats }) {
  return (
    <div className="shell mt-14">
      <div className="grid grid-cols-2 overflow-hidden rounded-[1.5rem] bg-ink/[0.03] sm:grid-cols-4 sm:divide-x sm:divide-ink/10">
        {stats.map((s, i) => {
          const parsed = parseLeadingNumber(s.value)
          return (
            <Reveal key={s.label} delay={i * 0.06} className="px-6 py-8">
              <div className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                {parsed ? <CountUp value={parsed.number} suffix={parsed.suffix} /> : s.value}
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted">{s.label}</p>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
