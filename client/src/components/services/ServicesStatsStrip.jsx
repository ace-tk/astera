import Reveal from '@/components/ui/Reveal'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'

/**
 * The /services hub's four existing stats (2017 / 48 à 72h / 3 / 15), lifted
 * out of ServicesHomeIntro so they read as one compact horizontal strip
 * below the hero instead of living inside its text column. Same values,
 * same labels, same source — see utils/servicesHomeContent.js.
 */
export default function ServicesStatsStrip({ stats = [], note }) {
  if (!stats.length && !note) return null

  return (
    <section className="shell pb-12 pt-10 sm:pb-14 sm:pt-12">
      {stats.length > 0 && (
        <Reveal className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-ink/8 py-7 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-10">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</div>
              <p className="mt-1 max-w-[12rem] text-xs leading-relaxed text-muted">{s.label}</p>
            </div>
          ))}
        </Reveal>
      )}

      {note && (
        <div className="mt-5 [&_.markdown-article]:space-y-0 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted">
          <MarkdownArticle body={note} />
        </div>
      )}
    </section>
  )
}
