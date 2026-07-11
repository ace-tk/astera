import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Glyph from '@/components/ui/Glyph'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const GLYPH = {
  recording: 'mic', transcript: 'text', ai: 'brain', timeline: 'timeline',
  speaker: 'chart', decision: 'report', risk: 'alert', compliance: 'shield',
  summary: 'report', report: 'report',
}

/** Per-kind mini visual — the bit that gives each node its own character. */
function NodePreview({ kind, color }) {
  const a = accent(color)
  if (kind === 'recording')
    return (
      <div className="flex h-8 items-center gap-[3px]">
        {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.35, 0.7, 0.45].map((h, i) => (
          <motion.span
            key={i}
            className={cn('w-[3px] flex-1 rounded-full', a.bg)}
            animate={{ scaleY: [h * 0.5, h, h * 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
            style={{ height: '100%', transformOrigin: 'center' }}
          />
        ))}
      </div>
    )
  if (kind === 'transcript' || kind === 'summary')
    return (
      <div className="space-y-1.5">
        {[100, 80, 92].map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-ink/8" style={{ width: `${w}%` }} />
        ))}
      </div>
    )
  if (kind === 'ai')
    return (
      <div className="relative grid h-8 place-items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={cn('absolute h-3 w-3 rounded-full', a.bg)}
            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
          />
        ))}
        <span className={cn('h-2.5 w-2.5 rounded-full', a.bg)} />
      </div>
    )
  if (kind === 'timeline')
    return (
      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-ink/10" />
        {[10, 38, 60, 85].map((p, i) => (
          <span key={i} className={cn('absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full', a.bg)} style={{ left: `${p}%` }} />
        ))}
      </div>
    )
  if (kind === 'speaker')
    return (
      <div className="flex -space-x-2">
        {['bg-royal', 'bg-purple', 'bg-emerald', 'bg-coral'].map((c) => (
          <span key={c} className={cn('h-6 w-6 rounded-full ring-2 ring-card', c)} />
        ))}
      </div>
    )
  if (kind === 'decision')
    return (
      <div className="space-y-1.5">
        {[94, 88].map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
              <div className={cn('h-full rounded-full', a.bg)} style={{ width: `${p}%` }} />
            </div>
            <span className="text-[0.6rem] text-muted">{p}%</span>
          </div>
        ))}
      </div>
    )
  if (kind === 'risk')
    return (
      <div className="flex gap-1.5">
        <span className="rounded-full bg-rose/12 px-2 py-0.5 text-[0.6rem] font-medium text-rose">High</span>
        <span className="rounded-full bg-orange/12 px-2 py-0.5 text-[0.6rem] font-medium text-orange">Medium</span>
      </div>
    )
  if (kind === 'compliance')
    return (
      <div className="flex items-center gap-2 text-[0.65rem] text-muted">
        <span className={cn('grid h-5 w-5 place-items-center rounded-full', a.softBg, a.text)}>
          <Check className="h-3 w-3" />
        </span>
        3 commitments flagged
      </div>
    )
  if (kind === 'report')
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {[['9', 'text-royal'], ['2', 'text-rose'], ['3', 'text-golden']].map(([n, c], i) => (
          <div key={i} className="rounded-lg bg-paper py-1 text-center">
            <div className={cn('font-display text-sm font-semibold', c)}>{n}</div>
          </div>
        ))}
      </div>
    )
  return null
}

const STATUS = {
  done: { ring: 'ring-emerald/40', dot: 'bg-emerald', label: 'Complete' },
  active: { ring: 'ring-accent/50', dot: 'bg-accent', label: 'Understanding' },
  idle: { ring: 'ring-ink/8', dot: 'bg-ink/20', label: 'Queued' },
}

function WorkspaceNodeBase({ data, selected }) {
  const a = accent(data.color)
  const status = STATUS[data.status || 'done']
  const tint = a.hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16)).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: data.dimmed ? 0.4 : 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, delay: (data.order || 0) * 0.09 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        'group w-[220px] cursor-pointer rounded-[1.4rem] border bg-card p-4 shadow-soft transition-shadow',
        'ring-1 hover:shadow-lift',
        selected ? cn('shadow-lift', a.border) : 'border-ink/8',
        selected ? status.ring : 'ring-transparent',
      )}
      style={selected ? { boxShadow: `0 18px 50px -18px rgb(${tint} / 0.5)` } : undefined}
    >
      {/* handles — styled dots, not default squares */}
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-2 !border-card !bg-ink/25" />
      <Handle type="source" position={Position.Right} className={cn('!h-2 !w-2 !border-2 !border-card', a.dot)} />

      <div className="flex items-start justify-between">
        <span className={cn('grid h-11 w-11 place-items-center rounded-xl transition-transform group-hover:rotate-6', a.softBg, a.text)}>
          <Glyph name={GLYPH[data.kind]} size={26} />
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-paper px-2 py-1 text-[0.6rem] font-medium text-muted">
          <motion.span
            className={cn('h-1.5 w-1.5 rounded-full', status.dot)}
            animate={data.status === 'active' ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : undefined}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          {status.label}
        </span>
      </div>

      <h3 className="mt-3 font-display text-[0.95rem] font-semibold leading-tight tracking-tight">{data.title}</h3>
      <p className="text-[0.7rem] text-muted">{data.subtitle}</p>

      <div className="mt-3 border-t border-ink/6 pt-3">
        <NodePreview kind={data.kind} color={data.color} />
      </div>
    </motion.div>
  )
}

export default memo(WorkspaceNodeBase)
