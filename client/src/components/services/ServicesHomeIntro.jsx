import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import { resolveServiceHref } from '@/constants/servicesLinks'

/**
 * The /services hub's intro block: eyebrow, existing lead paragraph, the
 * two existing CTA links, and the four existing stats as a compact grid
 * (same value/label shape as StatsSection, reused inline rather than via
 * that component since it carries its own `.shell` wrapper). Scoped to
 * this one page — see utils/servicesHomeContent.js for how this content is
 * lifted, verbatim, out of the source markdown.
 */
export default function ServicesHomeIntro({ eyebrow, paragraph, ctas = [], stats = [], note }) {
  return (
    <div>
      <Reveal>
        {eyebrow && (
          <span className="chip w-fit gap-2 text-ink/70">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {eyebrow}
          </span>
        )}
        {paragraph && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{paragraph}</p>}

        {ctas.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {ctas.map((c, i) =>
              c.href.startsWith('#') ? (
                <Button key={c.href} as="a" href={c.href} size="lg" variant={i === 0 ? 'accent' : 'soft'}>
                  {c.label}
                </Button>
              ) : (
                <Button key={c.href} as={Link} to={resolveServiceHref(c.href).href} size="lg" variant={i === 0 ? 'accent' : 'soft'}>
                  {c.label}
                </Button>
              ),
            )}
          </div>
        )}
      </Reveal>

      {stats.length > 0 && (
        <Reveal delay={0.1} className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink/8 pt-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</div>
              <p className="mt-1.5 max-w-[12rem] text-xs leading-relaxed text-muted">{s.label}</p>
            </div>
          ))}
        </Reveal>
      )}

      {note && (
        <div className="mt-6 [&_.markdown-article]:space-y-0 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted">
          <MarkdownArticle body={note} />
        </div>
      )}
    </div>
  )
}
