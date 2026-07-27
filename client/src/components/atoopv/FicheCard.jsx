import { accent } from '@/utils/accent'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * The labeled Q&A card atoosavoir uses to show "what a fiche looks like" —
 * the section's signature UI element, reused both as a teaser on the
 * landing page and as the full example on the /exemple page (each with a
 * different set of fields, hence the generic `fields` array rather than
 * fixed props).
 */
export default function FicheCard({ eyebrow, number, title, fields = [], footer, color = 'royal' }) {
  const a = accent(color)

  return (
    <Reveal>
      <div className="rounded-[1.75rem] border border-ink/8 bg-card p-7 shadow-soft sm:p-8">
        {(eyebrow || number) && (
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow && <span className={cn('text-xs font-semibold uppercase tracking-[0.18em]', a.text)}>{eyebrow}</span>}
            {number && <span className="text-xs font-medium text-muted">{number}</span>}
          </div>
        )}
        {title && <h3 className={cn('font-display text-lg font-medium tracking-tight', (eyebrow || number) && 'mt-3')}>{title}</h3>}

        <dl className="mt-5 divide-y divide-ink/8">
          {fields.map((f) => (
            <div key={f.label} className="py-4 first:pt-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{f.label}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink/80 text-pretty">{f.value}</dd>
            </div>
          ))}
        </dl>

        {footer && <div className="mt-6 border-t border-ink/8 pt-5">{footer}</div>}
      </div>
    </Reveal>
  )
}
