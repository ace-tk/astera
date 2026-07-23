import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { accent } from '@/utils/accent'
import SpotlightCard from '@/components/ui/SpotlightCard'
import Glyph from '@/components/ui/Glyph'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

/**
 * A service category tile — the Services-page counterpart to FeatureTile /
 * ReportCard. Whole card navigates to the category page; the arrow badge
 * rotates on hover the same way ReportCard's does.
 */
export default function ServiceCard({ service, index = 0 }) {
  const a = accent(service.color)

  return (
    <Reveal delay={(index % 3) * 0.06} className="h-full">
      <SpotlightCard tint={a.hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16)).join(' ')} className="h-full">
        <Link to={service.href} className="flex h-full flex-col p-7">
          <div className="flex items-start justify-between gap-4">
            <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', a.softBg, a.text)}>
              <Glyph name={service.glyph} size={30} />
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/8 text-muted transition-all group-hover:border-ink/20 group-hover:text-ink group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-7 flex-1">
            <span className={cn('eyebrow', a.text)}>{service.eyebrow}</span>
            <h3 className="mt-3 font-display text-xl font-medium leading-tight tracking-tight text-balance">
              {service.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{service.description}</p>
          </div>

          <span className={cn('mt-6 inline-flex items-center gap-1.5 text-sm font-medium link-underline w-fit', a.text)}>
            {service.cta}
          </span>
        </Link>
      </SpotlightCard>
    </Reveal>
  )
}
