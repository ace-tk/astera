import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const PRIORITY_STYLE = {
  High: 'bg-rose/10 text-rose',
  Medium: 'bg-golden/10 text-golden',
  Low: 'bg-emerald/10 text-emerald',
}

const STATUS_STYLE = {
  Completed: 'bg-emerald/10 text-emerald',
  'In Progress': 'bg-royal/10 text-royal',
  Pending: 'bg-orange/10 text-orange',
}

function formatDeadline(value) {
  const raw = (value || '').toString().trim()
  if (!raw) return 'Not specified'

  const normalized = raw.toLowerCase()
  if (normalized === 'fri') return 'Due Friday'
  if (normalized === 'wed') return 'Due Wednesday'
  if (normalized === 'thu') return 'Due Thursday'
  if (normalized === 'mon') return 'Due Monday'
  if (normalized === 'tue') return 'Due Tuesday'
  if (normalized === 'today') return 'Today'
  if (normalized === 'tomorrow') return 'Tomorrow'
  if (normalized === 'q3') return 'Q3 2026'
  if (normalized === 'q4') return 'Q4 2026'
  if (normalized === 'overdue') return 'Overdue'
  return raw
}

function normalizeAction(action, index) {
  const title = action?.text || action?.title || 'Follow up on the open item'
  const owner = action?.owner || 'Unassigned'
  const deadline = formatDeadline(action?.due || action?.deadline)
  const priority = action?.priority || (index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low')
  const status = action?.status || (index === 0 ? 'Pending' : index === 1 ? 'In Progress' : 'Pending')

  return { title, owner, deadline, priority, status }
}

export function buildKeyActionsData(report) {
  const source = Array.isArray(report?.commitments) ? report.commitments : []
  const actions = source.slice(0, 5).map((item, index) => normalizeAction(item, index))

  if (actions.length < 3) {
    actions.push(
      ...[
        { title: 'Confirm the next decision owner', owner: 'Unassigned', deadline: 'Tomorrow', priority: 'High', status: 'Pending' },
        { title: 'Share the updated working draft', owner: 'Unassigned', deadline: '18 Jul', priority: 'Medium', status: 'In Progress' },
      ].slice(0, 3 - actions.length),
    )
  }

  return actions
}

export default function KeyActions({ report }) {
  const a = accent(report?.color ?? 'royal')
  const actions = useMemo(() => buildKeyActionsData(report), [report])

  return (
    <Reveal delay={0.12} className="mt-10">
      <section className="overflow-hidden rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
        <div className="flex items-center gap-2">
          <span className={cn('eyebrow', a.text)}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Key Actions & Deadlines
          </span>
        </div>
        <div className="mt-3 max-w-2xl">
          <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-balance">Key Actions & Deadlines</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">The most important follow-ups identified from this meeting.</p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {actions.map((action, index) => (
            <motion.article
              key={`${action.title}-${index}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4 shadow-[0_8px_24px_rgba(17,24,39,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.95rem] font-medium leading-snug text-ink">{action.title}</p>
                <span className={cn('shrink-0 rounded-full px-2 py-1 text-[0.7rem] font-medium', PRIORITY_STYLE[action.priority] || PRIORITY_STYLE.Medium)}>
                  {action.priority}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted">
                <div className="flex items-center justify-between rounded-xl border border-ink/8 bg-white/70 px-3 py-2">
                  <span className="text-muted">Owner</span>
                  <span className="font-medium text-ink">{action.owner}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-ink/8 bg-white/70 px-3 py-2">
                  <span className="text-muted">Deadline</span>
                  <span className="font-medium text-ink">{action.deadline}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-ink/8 bg-white/70 px-3 py-2">
                  <span className="text-muted">Status</span>
                  <span className={cn('rounded-full px-2 py-1 text-[0.7rem] font-medium', STATUS_STYLE[action.status] || STATUS_STYLE.Pending)}>
                    {action.status}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </Reveal>
  )
}
