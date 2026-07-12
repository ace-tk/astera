import { useQuery } from '@tanstack/react-query'
import { Users, FileText, Clock, CheckCircle2 } from 'lucide-react'
import { fetchAdminStats } from '@/services/admin'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const CARDS = [
  { key: 'totalUsers', label: 'Total users', icon: Users, color: 'text-royal' },
  { key: 'totalReports', label: 'Total reports', icon: FileText, color: 'text-purple' },
  { key: 'pending', label: 'Pending review', icon: Clock, color: 'text-orange' },
  { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald' },
]

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: fetchAdminStats })

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((c, i) => (
        <Reveal key={c.key} delay={i * 0.06}>
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <c.icon className={cn('h-5 w-5', c.color)} />
            <div className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {isLoading ? '—' : (stats?.[c.key] ?? 0)}
            </div>
            <p className="mt-1 text-sm text-muted">{c.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
