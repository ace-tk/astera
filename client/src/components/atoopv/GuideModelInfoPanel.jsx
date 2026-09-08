import { Link } from 'react-router-dom'
import { Gift, Phone } from 'lucide-react'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * The compact, structured replacement for modele-pv-cse-gratuit's "info
 * block" — see utils/modelePvGratuitContent.js for how this data is lifted
 * (verbatim, nothing invented) out of the source markdown. Everything here
 * reuses an existing visual pattern: `.chip` for the banner and the phone
 * pill, StatsSection for the four stat pairs (the same component used
 * site-wide for exactly this value/label shape), and MarkdownArticle,
 * unmodified, for the one heading+paragraph that sits between them.
 */
export default function GuideModelInfoPanel({ headingBody, stats, contact, color }) {
  return (
    <div className="space-y-10">
      <div className="chip w-fit gap-2 text-ink/70">
        <Gift className="h-3.5 w-3.5 text-accent" />
        <span>RESSOURCE GRATUITE — DEPUIS 2017</span>
      </div>

      {headingBody && <MarkdownArticle body={headingBody} color={color} />}

      {/* StatsSection's own inner grid (border-t + 2/4-col grid), reused
          directly rather than the <StatsSection> component itself — that
          component wraps in its own top-level `.shell`, meant for a
          full-width page section, which would double up awkwardly nested
          inside this already-narrower article column. */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/8 pt-10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{s.value}</div>
              <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      )}

      <div className="relative overflow-hidden rounded-[2rem] border border-ink/8 bg-card p-8 text-center shadow-soft sm:p-10">
        <div
          className="pointer-events-none absolute -inset-10 -z-10 opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(var(--accent) / 0.25), transparent 70%)' }}
          aria-hidden="true"
        />
        {contact.phone && (
          <span className={cn('chip mx-auto w-fit gap-2')}>
            <Phone className="h-3.5 w-3.5 text-accent" />
            {contact.phone}
          </span>
        )}
        {contact.email && (
          <p className="mt-4 text-sm text-muted">
            <Link to="/atoopv/contact" className="font-medium text-ink link-underline">
              {contact.email}
            </Link>
            {contact.trailing && <> · {contact.trailing}</>}
          </p>
        )}
      </div>
    </div>
  )
}
