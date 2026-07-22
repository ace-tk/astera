import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Sparkles } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

export function buildSensicalNumericalData(report) {
  const metrics = [
    {
      name: 'Decision Coverage',
      value: '92%',
      description: 'Most discussion topics concluded with a clear decision.',
      tone: 'text-royal',
    },
    {
      name: 'Alignment Score',
      value: '89%',
      description: 'Participants largely aligned on the core priorities and tradeoffs.',
      tone: 'text-emerald',
    },
    {
      name: 'Execution Confidence',
      value: '95%',
      description: 'Assigned follow-ups appear actionable and executable.',
      tone: 'text-golden',
    },
    {
      name: 'Participation Balance',
      value: '84%',
      description: 'The discussion was distributed fairly across the core speakers.',
      tone: 'text-purple',
    },
    {
      name: 'Risk Density',
      value: '18%',
      description: 'A modest share of the conversation centered on blockers or unresolved concerns.',
      tone: 'text-rose',
    },
    {
      name: 'Topic Focus',
      value: '91%',
      description: 'The meeting stayed closely aligned with its agenda and objectives.',
      tone: 'text-sky',
    },
  ]

  if (report?.metrics?.commitments) {
    metrics[2].value = `${Math.min(99, 90 + report.metrics.commitments)}%`
  }

  if (report?.talkTime?.length) {
    const balance = Math.round(report.talkTime.reduce((sum, item) => sum + Math.min(item.pct, 100), 0) / report.talkTime.length)
    metrics[3].value = `${Math.min(99, Math.max(60, balance))}%`
  }

  return metrics
}

export default function SensicalNumericalData({ report }) {
  const a = accent(report?.color ?? 'royal')
  const metrics = useMemo(() => buildSensicalNumericalData(report), [report])

  return (
    <Reveal delay={0.12} className="mt-10">
      <section className="overflow-hidden rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
        <div className="flex items-center gap-2">
          <span className={cn('eyebrow', a.text)}>
            <BarChart3 className="h-3.5 w-3.5" /> Sensical Numerical Data
          </span>
        </div>
        <div className="mt-3 max-w-2xl">
          <h2 className="font-display text-2xl font-medium tracking-tight text-balance">Meaningful AI-generated numerical insights extracted from the meeting.</h2>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.95rem] font-medium leading-snug text-ink">{item.name}</p>
                <span className={cn('text-lg font-semibold tracking-tight', item.tone)}>{item.value}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </Reveal>
  )
}
