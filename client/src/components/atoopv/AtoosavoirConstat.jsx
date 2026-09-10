import { AlertTriangle } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

/**
 * atoosavoir-only editorial treatment of the "Le constat" section: the
 * existing eyebrow/heading/paragraph plus the existing four-item list, laid
 * out as number + text + a compact grid of cards instead of a plain
 * bulleted list — every string is the same one RichTextSection would
 * otherwise render, just composed differently. Page-scoped since this
 * layout is specific to this section's exact shape (one paragraph + one
 * four-item list).
 */
export default function AtoosavoirConstat({ eyebrow, heading, blocks = [] }) {
  const paragraph = blocks.find((b) => b.type === 'paragraph')
  const list = blocks.find((b) => b.type === 'list')

  return (
    <div className="grid gap-8 lg:grid-cols-[5rem_1fr] lg:gap-12">
      <Reveal>
        <span className="font-display text-6xl font-semibold leading-none text-ink/10 sm:text-7xl">01</span>
      </Reveal>

      <div>
        <Reveal className="max-w-2xl">
          {eyebrow && (
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink/30" /> {eyebrow}
            </span>
          )}
          {heading && <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>}
          {paragraph && <p className="mt-4 text-base leading-relaxed text-muted text-pretty">{paragraph.text}</p>}
        </Reveal>

        {list && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {list.items.map((item, i) => (
              <Reveal key={i} delay={i * 0.06} className="h-full">
                <div className="flex h-full gap-3 rounded-2xl border border-ink/8 bg-card/60 p-4 transition-colors duration-300 hover:border-ink/15 hover:bg-card">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-royal" strokeWidth={1.75} />
                  <p className="text-sm leading-relaxed text-ink/75">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
