import { Link } from 'react-router-dom'
import { Check, Lightbulb } from 'lucide-react'
import { accent } from '@/utils/accent'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'
import { renderEmphasis } from '@/utils/richText'

function Paragraph({ text }) {
  return <p className="text-base leading-relaxed text-muted text-pretty">{text}</p>
}

function ListBlock({ ordered, items, a }) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
          <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-medium', a.softBg, a.text)}>
            {ordered ? i + 1 : <Check className="h-3 w-3" />}
          </span>
          {typeof item === 'string' ? renderEmphasis(item) : item}
        </li>
      ))}
    </Tag>
  )
}

function QuoteBlock({ text, citeLabel, citeHref }) {
  return (
    <figure className="relative overflow-hidden rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
      <span className="pointer-events-none absolute -right-2 -top-8 font-display text-[7rem] leading-none text-ink/10">”</span>
      <blockquote className="relative italic text-lg leading-relaxed text-ink/90 text-pretty">{text}</blockquote>
      {citeLabel && (
        <figcaption className="relative mt-5 text-sm font-medium text-muted">
          {citeHref ? (
            <a href={citeHref} target="_blank" rel="noreferrer" className="link-underline text-ink/70 hover:text-ink">
              {citeLabel}
            </a>
          ) : (
            citeLabel
          )}
        </figcaption>
      )}
    </figure>
  )
}

function CalloutBlock({ label, text, link, a }) {
  return (
    <div className={cn('flex gap-4 rounded-3xl border-l-4 bg-card p-6 shadow-soft', a.border)}>
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl', a.softBg, a.text)}>
        <Lightbulb className="h-5 w-5" />
      </span>
      <div>
        {label && <p className={cn('text-xs font-semibold uppercase tracking-[0.18em]', a.text)}>{label}</p>}
        <p className="mt-2 text-sm leading-relaxed text-ink/80 text-pretty">{text}</p>
        {link && (
          <Link to={link.to} className={cn('mt-3 inline-block text-sm font-medium link-underline', a.text)}>
            {link.label}
          </Link>
        )}
      </div>
    </div>
  )
}

function StepsBlock({ items, a }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((step, i) => (
        <div key={i} className="rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft">
          <span className={cn('grid h-9 w-9 place-items-center rounded-full font-display text-sm font-semibold', a.softBg, a.text)}>
            {i + 1}
          </span>
          <h4 className="mt-4 font-display text-lg font-medium tracking-tight">{step.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * The core "preserve markdown hierarchy" renderer. Feed it a list of typed
 * blocks (paragraph / list / quote / callout / steps) and it lays them out
 * with Astera's editorial section grammar — no summarizing, just typesetting.
 */
export default function RichTextSection({ eyebrow, heading, lead, blocks = [], color = 'royal', id }) {
  const a = accent(color)

  return (
    <div id={id}>
      {(eyebrow || heading || lead) && (
        <Reveal className="max-w-2xl">
          {eyebrow && (
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink/30" /> {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">
              {heading}
            </h2>
          )}
          {lead && <p className="mt-4 text-base leading-relaxed text-muted text-pretty">{lead}</p>}
        </Reveal>
      )}

      <div className="mt-8 space-y-6">
        {blocks.map((block, i) => (
          <Reveal key={i} delay={Math.min(i, 4) * 0.05} className={block.type === 'paragraph' ? 'max-w-2xl' : undefined}>
            {block.type === 'paragraph' && <Paragraph text={block.text} />}
            {block.type === 'list' && (
              <div className="max-w-2xl">
                <ListBlock ordered={block.ordered} items={block.items} a={a} />
              </div>
            )}
            {block.type === 'quote' && (
              <div className="max-w-2xl">
                <QuoteBlock text={block.text} citeLabel={block.citeLabel} citeHref={block.citeHref} />
              </div>
            )}
            {block.type === 'callout' && (
              <div className="max-w-2xl">
                <CalloutBlock label={block.label} text={block.text} link={block.link} a={a} />
              </div>
            )}
            {block.type === 'steps' && <StepsBlock items={block.items} a={a} />}
          </Reveal>
        ))}
      </div>
    </div>
  )
}
