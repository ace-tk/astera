import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Activity, Server, Database, Cpu, HardDrive, Radio } from 'lucide-react'
import MeshBackground from '@/components/common/MeshBackground'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const STATE = {
  operational: { label: 'Operational', dot: 'bg-emerald', text: 'text-emerald', ring: 'ring-emerald/30' },
  elevated: { label: 'Elevated latency', dot: 'bg-golden', text: 'text-golden', ring: 'ring-golden/30' },
  down: { label: 'Outage', dot: 'bg-rose', text: 'text-rose', ring: 'ring-rose/30' },
}

const SERVICES = [
  { id: 'api', name: 'API Gateway', desc: 'Express · REST', icon: Server, state: 'operational', latency: '42ms', uptime: '99.98%', spark: [8, 6, 7, 5, 6, 4, 5, 6, 5, 4] },
  { id: 'db', name: 'Database', desc: 'MongoDB Atlas', icon: Database, state: 'operational', latency: '11ms', uptime: '99.99%', spark: [3, 4, 3, 5, 3, 4, 3, 3, 4, 3] },
  { id: 'ai', name: 'Analysis Engine', desc: 'Transcription · extraction', icon: Cpu, state: 'elevated', latency: '1.2s', uptime: '99.90%', spark: [10, 12, 9, 14, 11, 16, 13, 12, 15, 11] },
  { id: 'storage', name: 'Storage', desc: 'Media · Cloudinary', icon: HardDrive, state: 'operational', latency: '63ms', uptime: '99.95%', spark: [7, 6, 8, 6, 7, 6, 7, 8, 6, 7] },
  { id: 'realtime', name: 'Realtime', desc: 'Socket.io channels', icon: Radio, state: 'operational', latency: '28ms', uptime: '99.97%', spark: [5, 4, 6, 5, 4, 5, 6, 4, 5, 5] },
]

function Sparkline({ data, color }) {
  const max = Math.max(...data)
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${28 - (d / max) * 24}`).join(' ')
  return (
    <svg viewBox="0 0 100 28" className="h-7 w-24" preserveAspectRatio="none">
      <motion.polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function Status() {
  const anyIssue = SERVICES.some((s) => s.state !== 'operational')

  return (
    <div className="relative">
      <MeshBackground mood={anyIssue ? 'gold' : 'timeline'} dots={false} />
      <div className="mx-auto max-w-3xl">
        <Link to="/app/settings" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Settings
        </Link>

        <Reveal className="mt-6">
          <div className={cn('flex items-center gap-4 rounded-3xl border bg-card p-6 shadow-soft', anyIssue ? 'border-golden/30' : 'border-emerald/30')}>
            <span className={cn('relative grid h-12 w-12 place-items-center rounded-2xl', anyIssue ? 'bg-golden/12 text-golden' : 'bg-emerald/12 text-emerald')}>
              <Activity className="h-6 w-6" />
              <motion.span className={cn('absolute inset-0 rounded-2xl ring-2', anyIssue ? 'ring-golden/40' : 'ring-emerald/40')} animate={{ scale: [1, 1.15], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {anyIssue ? 'Minor degradation' : 'All systems operational'}
              </h1>
              <p className="text-sm text-muted">{anyIssue ? 'One service is running slower than usual.' : 'Every service is healthy and responsive.'}</p>
            </div>
          </div>
        </Reveal>

        <div className="mt-5 space-y-3">
          {SERVICES.map((s, i) => {
            const st = STATE[s.state]
            const color = s.state === 'operational' ? '#16B364' : s.state === 'elevated' ? '#F6C453' : '#F43F5E'
            return (
              <Reveal key={s.id} delay={i * 0.06}>
                <div className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-card p-5 shadow-soft">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-ink/70"><s.icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{s.name}</p>
                      <span className={cn('relative flex h-2 w-2')}>
                        <motion.span className={cn('absolute inline-flex h-full w-full rounded-full', st.dot)} animate={{ scale: [1, 2.2], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />
                        <span className={cn('relative inline-flex h-2 w-2 rounded-full', st.dot)} />
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted">{s.desc}</p>
                  </div>
                  <div className="hidden sm:block"><Sparkline data={s.spark} color={color} /></div>
                  <div className="w-16 text-right">
                    <div className="text-sm font-medium">{s.latency}</div>
                    <div className="text-[0.65rem] text-muted">latency</div>
                  </div>
                  <div className="hidden w-20 text-right sm:block">
                    <div className={cn('text-sm font-medium', st.text)}>{s.uptime}</div>
                    <div className="text-[0.65rem] text-muted">90-day</div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2} className="mt-6">
          <div className="rounded-2xl border border-ink/8 bg-card p-5 text-center text-xs text-muted shadow-soft">
            Live status is illustrative in demo mode. In production these read from real health checks
            (<span className="font-mono">/api/health</span>) over Socket.io.
          </div>
        </Reveal>
      </div>
    </div>
  )
}
