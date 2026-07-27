import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { ADMIN_STATS, REPORTS_TREND, REPORTS_BY_STATUS, PLAN_DISTRIBUTION } from '@/services/mockAdminData'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const NEUTRAL = 'rgb(17 24 39 / 0.35)'
const fillFor = (color) => (color === 'ink' ? NEUTRAL : accent(color).hex)

const KPIS = [
  { label: 'Total reports', value: ADMIN_STATS.totalReports, color: 'purple' },
  { label: 'Total customers', value: ADMIN_STATS.totalCustomers, color: 'royal' },
  { label: 'Avg reports / customer', value: Math.round(ADMIN_STATS.totalReports / ADMIN_STATS.totalCustomers), color: 'sky' },
  { label: 'MoM growth', value: '+13%', color: 'emerald' },
]

/** Custom recharts tooltip built from the app's own card classes, so it stays theme-correct across all three palettes instead of hardcoded recharts colors. */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-ink/8 bg-card px-3 py-2 text-xs shadow-soft">
      {label && <p className="font-medium text-ink">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="text-muted">
          <span className="font-medium" style={{ color: p.color }}>{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  )
}

/** Same ring technique as ExecutiveDashboardPhase1's CircularScore (not exported from there, so reproduced here rather than importing a private component). */
function CircularScore({ value, color = 'royal' }) {
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
          stroke={accent(color).hex}
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
        <div className="font-display text-3xl font-semibold tracking-tight text-ink">{value}%</div>
        <div className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted">Approval</div>
      </div>
    </div>
  )
}

function DonutCard({ title, data, delay = 0 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Reveal delay={delay}>
      <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
        <div className="mt-4 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={3} stroke="none">
                  {data.map((d) => (
                    <Cell key={d.name} fill={fillFor(d.color)} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: fillFor(d.color) }} />
                  {d.name}
                </span>
                <span className="font-medium">
                  {d.value} <span className="text-xs text-muted">({Math.round((d.value / total) * 100)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  )
}

/**
 * Admin Analytics — frontend-only placeholder data (services/mockAdminData.js).
 * First real chart usage in the app: recharts is an installed but previously
 * unused dependency, wired up here following the app's own color tokens
 * (accent().hex for series colors, `currentColor` for grid/axis so it stays
 * correct across all three themes) rather than recharts' defaults.
 */
export default function AdminAnalytics() {
  return (
    <div>
      <Reveal>
        <p className="eyebrow text-accent">
          <BarChart3 className="h-3.5 w-3.5" /> Admin · Analytics
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Trends across every customer and report.
        </h1>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.06}>
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <div className={cn('font-display text-4xl font-semibold tracking-tight', accent(k.color).text)}>{k.value}</div>
              <p className="mt-2 text-sm text-muted">{k.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <section className="h-full rounded-[2rem] border border-ink/8 bg-card p-8 shadow-soft">
            <span className="eyebrow text-royal">
              <TrendingUp className="h-3.5 w-3.5" /> Growth
            </span>
            <h2 className="mt-3 font-display text-xl font-medium tracking-tight">Reports & customers over time</h2>
            <div className="mt-6 h-72 text-ink/10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REPORTS_TREND} margin={{ left: -4, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminReportsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accent('royal').hex} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={accent('royal').hex} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminCustomersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accent('emerald').hex} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={accent('emerald').hex} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="currentColor" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'currentColor' }} className="text-muted" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tick={{ fill: 'currentColor' }} className="text-muted" tickLine={false} axisLine={false} fontSize={12} width={44} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="reports" name="Reports" stroke={accent('royal').hex} strokeWidth={2} fill="url(#adminReportsFill)" />
                  <Area type="monotone" dataKey="customers" name="Customers" stroke={accent('emerald').hex} strokeWidth={2} fill="url(#adminCustomersFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-5 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: accent('royal').hex }} /> Reports
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: accent('emerald').hex }} /> Customers
              </span>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-ink/8 bg-card p-8 text-center shadow-soft">
            <span className="eyebrow text-emerald">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approval rate
            </span>
            <div className="mt-6">
              <CircularScore value={92} color="emerald" />
            </div>
            <p className="mt-5 text-sm text-muted">Of reports submitted this quarter were approved on first review.</p>
          </section>
        </Reveal>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <DonutCard title="Reports by status" data={REPORTS_BY_STATUS} />
        <DonutCard title="Customers by plan" data={PLAN_DISTRIBUTION} delay={0.06} />
      </div>
    </div>
  )
}
