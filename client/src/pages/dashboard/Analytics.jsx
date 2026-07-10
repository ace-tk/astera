import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { WORKSPACE_ANALYTICS as W } from '@/services/mockData'
import { accent } from '@/utils/accent'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const KPIS = [
  { label: 'Reports generated', value: W.totalReports, accent: 'text-royal' },
  { label: 'Minutes distilled', value: W.totalMinutes.toLocaleString(), accent: 'text-sky' },
  { label: 'Decisions captured', value: W.decisionsCaptured, accent: 'text-purple' },
  { label: 'Follow-through', value: `${Math.round(W.followThrough * 100)}%`, accent: 'text-emerald' },
]

// Custom, editorial tooltip — no default recharts chrome.
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-ink/10 bg-card px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-muted">
          <span className="font-medium text-ink">{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  return (
    <div className="mx-auto max-w-shell">
      <Reveal>
        <p className="eyebrow text-sky">Analytics</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Signals across every conversation.
        </h1>
      </Reveal>

      {/* KPI row */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.06}>
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <div className={cn('font-display text-4xl font-semibold tracking-tight', k.accent)}>{k.value}</div>
              <p className="mt-2 text-sm text-muted">{k.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Decision velocity area */}
        <Reveal delay={0.05} className="lg:col-span-2">
          <div className="h-full rounded-3xl border border-ink/8 bg-card p-7 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-medium tracking-tight">Decision velocity</h3>
              <span className="text-xs text-muted">Last 6 weeks</span>
            </div>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={W.weekly} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="g-dec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#365DF5" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#365DF5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(17,24,39,0.06)" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(17,24,39,0.15)' }} />
                  <Area type="monotone" dataKey="decisions" stroke="#365DF5" strokeWidth={2.5} fill="url(#g-dec)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        {/* Distribution donut */}
        <Reveal delay={0.1}>
          <div className="h-full rounded-3xl border border-ink/8 bg-card p-7 shadow-soft">
            <h3 className="font-display text-xl font-medium tracking-tight">What we capture</h3>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={W.distribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                    {W.distribution.map((d) => (
                      <Cell key={d.name} fill={accent(d.color).hex} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {W.distribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-muted">
                    <span className={cn('h-2.5 w-2.5 rounded-full', accent(d.color).bg)} /> {d.name}
                  </span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Volume bars */}
      <Reveal delay={0.05} className="mt-4">
        <div className="rounded-3xl border border-ink/8 bg-card p-7 shadow-soft">
          <h3 className="font-display text-xl font-medium tracking-tight">Report volume</h3>
          <div className="mt-6 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={W.weekly} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(17,24,39,0.06)" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(17,24,39,0.03)' }} />
                <Bar dataKey="reports" fill="#38BDF8" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
