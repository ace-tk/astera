import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Users } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import MeetingDNA from '@/components/dna/MeetingDNA'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2)

/** A demo meeting card — DNA motif, category, stats, and a one-tap explore. */
export default function DemoCard({ report, index = 0 }) {
  const a = accent(report.color)
  const tint = a.hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16)).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <SpotlightCard tint={tint} tilt className="h-full">
        <Link to={`/app/report/${report.id}`} className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', a.softBg, a.text)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', a.bg)} /> {report.category}
            </span>
            {/* DNA motif */}
            <div className="-mr-2 -mt-2 opacity-90">
              <MeetingDNA dna={report.dna} color={report.color} size={92} showLabels={false} animate={false} />
            </div>
          </div>

          <h3 className="mt-3 font-display text-xl font-semibold leading-tight tracking-tight text-balance">
            {report.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{report.subtitle}</p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {report.duration}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {report.participants.length}</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              [report.metrics.decisions, 'Decisions', 'text-royal'],
              [report.metrics.risks, 'Risks', 'text-rose'],
              [report.metrics.commitments, 'Actions', 'text-golden'],
            ].map(([n, l, c]) => (
              <div key={l} className="rounded-2xl bg-paper px-3 py-2.5">
                <div className={cn('font-display text-lg font-semibold', c)}>{n}</div>
                <div className="text-[0.65rem] text-muted">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between pt-5">
            <div className="flex -space-x-2">
              {report.participants.slice(0, 4).map((p, i) => (
                <span key={i} className={cn('grid h-7 w-7 place-items-center rounded-full text-[0.6rem] font-semibold text-white ring-2 ring-card', a.bg)} style={{ opacity: 1 - i * 0.15 }}>
                  {initials(p)}
                </span>
              ))}
              {report.participants.length > 4 && (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/8 text-[0.6rem] font-medium ring-2 ring-card">
                  +{report.participants.length - 4}
                </span>
              )}
            </div>
            <span className={cn('inline-flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-0.5', a.text)}>
              Explore <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </SpotlightCard>
    </motion.div>
  )
}
