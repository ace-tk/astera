import Reveal from '@/components/ui/Reveal'

/** A row of trust stats — the same grammar as the homepage Story stat band, generalized for reuse across service pages. */
export default function StatsSection({ stats }) {
  return (
    <div className="shell mt-14">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/8 pt-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{s.value}</div>
            <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
