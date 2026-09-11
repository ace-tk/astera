import Reveal from '@/components/ui/Reveal'

/**
 * The four existing company stats (2017 / 48 à 72h / 3 / 15) every
 * Formations page repeats as eight stacked plain paragraphs — see
 * utils/formationContent.js:extractStatStrip. Same values, same labels,
 * laid out as one compact row of thin-divided columns instead.
 */
export default function FormationStatStrip({ stats = [] }) {
  if (!stats.length) return null

  return (
    <Reveal>
      <div className="grid grid-cols-2 divide-x divide-y divide-ink/8 border-y border-ink/8 sm:grid-cols-4 sm:divide-y-0">
        {stats.map((s, i) => (
          <div key={s.label} className="px-4 py-5 sm:px-6 sm:py-6">
            <span className="font-mono text-[10px] tracking-wide text-ink/30">{String(i + 1).padStart(2, '0')}</span>
            <div className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</div>
            <p className="mt-1 text-xs leading-snug text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </Reveal>
  )
}
