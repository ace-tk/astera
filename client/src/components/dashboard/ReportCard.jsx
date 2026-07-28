import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Clock, Users, PencilLine, FileEdit, Download, Trash2, Check, X } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import StatusChip from '@/components/admin/StatusChip'
import { accent } from '@/utils/accent'
import { categoryIcon } from '@/utils/reportCategory'
import { cn } from '@/utils/cn'

const SENTIMENT = {
  positive: { label: 'Positive', dot: 'bg-emerald' },
  mixed: { label: 'Mixed', dot: 'bg-orange' },
  negative: { label: 'Tense', dot: 'bg-rose' },
}

// Keep a click inside the card's controls from following the card's Link.
const swallow = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

/**
 * A report tile. Read-only by default (demo cards are unchanged). When
 * `editable` (a signed-in user's own report) it gains inline rename + delete,
 * both of which never navigate into the report.
 */
export default function ReportCard({ report, featured = false, editable = false, onRename, onDelete }) {
  const navigate = useNavigate()
  const a = accent(report.color)
  const tint = a.hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16)).join(' ')
  const s = SENTIMENT[report.sentiment] || SENTIMENT.positive
  const cat = categoryIcon(report.subtitle)

  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(report.title)

  const startRename = (e) => {
    swallow(e)
    setDraft(report.title)
    setRenaming(true)
  }
  const commitRename = () => {
    const next = draft.trim()
    setRenaming(false)
    if (next && next !== report.title) onRename?.(next)
  }

  return (
    <SpotlightCard tint={tint} tilt={!featured} className={cn('flex h-full flex-col p-6', featured && 'lg:p-8')}>
      <Link to={`/app/report/${report.id}`} className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium', a.softBg, a.text)}>
            {cat ? <cat.icon className="h-3.5 w-3.5" /> : <span className={cn('h-1.5 w-1.5 rounded-full', a.bg)} />} {report.subtitle}
          </span>
          {editable ? (
            <div className="flex items-center gap-1" onClick={swallow}>
              <button
                onClick={(e) => { swallow(e); navigate(`/app/report/${report.id}?edit=1`) }}
                aria-label="Edit report"
                className="grid h-8 w-8 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink"
              >
                <FileEdit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { swallow(e); navigate(`/app/report/${report.id}?download=1`) }}
                aria-label="Download report"
                className="grid h-8 w-8 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={startRename}
                aria-label="Rename report"
                className="grid h-8 w-8 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink"
              >
                <PencilLine className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { swallow(e); onDelete?.() }}
                aria-label="Delete report"
                className="grid h-8 w-8 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-rose/40 hover:text-rose"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-all group-hover:border-ink/20 group-hover:text-ink group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>

        {renaming ? (
          <div className="mt-5 flex items-center gap-2" onClick={swallow}>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitRename() }
                if (e.key === 'Escape') { e.preventDefault(); setRenaming(false) }
              }}
              onBlur={commitRename}
              className={cn(
                'w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 font-display font-medium tracking-tight outline-none focus:border-accent',
                featured ? 'text-2xl' : 'text-xl',
              )}
              aria-label="Report title"
            />
            <button onMouseDown={(e) => e.preventDefault()} onClick={(e) => { swallow(e); commitRename() }} aria-label="Save title" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white"><Check className="h-4 w-4" /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={(e) => { swallow(e); setRenaming(false) }} aria-label="Cancel rename" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/10 text-muted hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <h3 className={cn('mt-5 font-display font-medium leading-tight tracking-tight text-balance', featured ? 'text-3xl' : 'text-2xl')}>
            {report.title}
          </h3>
        )}
        {featured && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{report.headline}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {report.duration}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {report.participants.length}</span>
          <span className="inline-flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} /> {s.label}</span>
          <span>{new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          {report.request && <StatusChip status="delivered" />}
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
