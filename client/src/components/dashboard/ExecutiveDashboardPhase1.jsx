import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const DASHBOARD_DATA = {
  overallHealth: {
    score: 92,
    summary: 'Overall meeting quality remains excellent with only minor follow-up risks detected.',
  },
  risks: [
    { label: 'Critical Risks', value: '3', description: 'Need executive attention this week' },
    { label: 'Medium Risks', value: '8', description: 'Tracked and being managed' },
    { label: 'Resolved Issues', value: '19', description: 'Closed since last review' },
    { label: 'Pending Actions', value: '12', description: 'Awaiting owner follow-through' },
  ],
  overview: [
    { label: 'Meetings This Month', value: '18', description: 'Across leadership and operating teams' },
    { label: 'Reports Generated', value: '38', description: 'Shared with decision makers' },
    { label: 'Decisions Captured', value: '214', description: 'High-confidence outcomes logged' },
    { label: 'Average AI Confidence', value: '94%', description: 'Signal quality remains strong' },
  ],
}

function CircularScore({ value }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative grid h-32 w-32 place-items-center rounded-full border border-ink/8 bg-ink/[0.02]">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} stroke="rgb(17 24 39 / 0.08)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke={accent('royal').hex}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="text-center">
        <div className="font-display text-4xl font-semibold tracking-tight text-ink">{value}</div>
        <div className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted">Score</div>
      </div>
    </div>
  )
}

export default function ExecutiveDashboardPhase1() {
  const { overallHealth, risks, overview } = DASHBOARD_DATA

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="h-full">
          <section className="h-full rounded-[2rem] border border-ink/8 bg-card p-8 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-purple"><Sparkles className="h-3.5 w-3.5" /> Overall Meeting Health</span>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-[180px_1fr] lg:items-center">
              <CircularScore value={overallHealth.score} />
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-balance">Overall Health Score</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{overallHealth.summary}</p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.06} className="h-full">
          <section className="h-full rounded-[2rem] border border-ink/8 bg-card p-8 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-rose"><AlertTriangle className="h-3.5 w-3.5" /> Risk Summary</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {risks.map((risk, index) => (
                <motion.div
                  key={risk.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4"
                >
                  <p className="text-sm text-muted">{risk.label}</p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{risk.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{risk.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>

      <Reveal delay={0.08}>
        <section className="rounded-[2rem] border border-ink/8 bg-card p-8 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-emerald"><CheckCircle2 className="h-3.5 w-3.5" /> Executive Overview</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overview.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-5"
              >
                <p className="text-sm text-muted">{item.label}</p>
                <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{item.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  )
}
