import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, Users } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const SENTIMENT = {
  positive: { label: 'Positive', dot: 'bg-emerald' },
  mixed: { label: 'Mixed', dot: 'bg-orange' },
  negative: { label: 'Tense', dot: 'bg-rose' },
}

export default function ReportCard({ report, featured = false }) {
  const a = accent(report.color)
  const tint = a.hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16)).join(' ')
  const s = SENTIMENT[report.sentiment] || SENTIMENT.positive

  return (
    <SpotlightCard tint={tint} tilt={!featured} className={cn('flex h-full flex-col p-6', featured && 'lg:p-8')}>
      <Link to={`/app/report/${report.id}`} className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium', a.softBg, a.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', a.bg)} /> {report.subtitle}
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-all group-hover:border-ink/20 group-hover:text-ink group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <h3 className={cn('mt-5 font-display font-medium leading-tight tracking-tight text-balance', featured ? 'text-3xl' : 'text-2xl')}>
          {report.title}
        </h3>
        {featured && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{report.headline}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {report.duration}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {report.participants.length}</span>
          <span className="inline-flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} /> {s.label}</span>
          <span>{new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="mt-auto grid grid-cols-4 gap-2 pt-6">
          {[
            ['decisions', 'Decisions', 'text-royal'],
            ['owners', 'Owners', 'text-purple'],
            ['risks', 'Risks', 'text-rose'],
            ['commitments', 'Promises', 'text-golden'],
          ].map(([k, label, c]) => (
            <div key={k} className="rounded-2xl bg-paper px-3 py-2.5">
              <div className={cn('font-display text-xl font-semibold', c)}>{report.metrics[k]}</div>
              <div className="text-[0.65rem] text-muted">{label}</div>
            </div>
          ))}
        </div>
      </Link>
    </SpotlightCard>
  )
}
