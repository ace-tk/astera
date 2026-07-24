import { TESTIMONIALS } from '@/constants/content'
import { accent } from '@/utils/accent'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * Pull-quotes with an oversized editorial quote mark. Generic over
 * `eyebrow`/`heading`/`items` (falling back to Astera's own landing copy) so
 * other pages — e.g. the ported ATOOPV Accueil — can reuse the same visual
 * grammar with their own testimonials instead of duplicating this component.
 */
export default function Testimonials({ eyebrow = 'In the room', heading = 'The artifact people actually read.', items = TESTIMONIALS }) {
  return (
    <section className="relative py-section">
      <div className="shell">
        <Reveal className="text-center">
          <span className="eyebrow justify-center">{eyebrow}</span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
            {heading}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {items.map((t, i) => {
            const a = accent(t.color)
            return (
              <Reveal key={t.name} delay={i * 0.1}>
                <figure
                  className={cn(
                    'relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-ink/8 bg-card p-8 shadow-soft',
                    i === 1 && 'lg:-translate-y-6',
                  )}
                >
                  <span className={cn('pointer-events-none absolute -right-3 -top-6 font-display text-[9rem] leading-none opacity-10', a.text)}>
                    ”
                  </span>
                  <blockquote className="relative text-lg leading-relaxed text-ink/90 text-pretty">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-3">
                    <span className={cn('grid h-11 w-11 place-items-center rounded-full font-display text-sm font-semibold text-white', a.bg)}>
                      {t.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{t.name}</span>
                      <span className="block text-xs text-muted">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
