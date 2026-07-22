import Reveal from '@/components/ui/Reveal'
import ExecutiveDashboardPhase1 from '@/components/dashboard/ExecutiveDashboardPhase1'

export default function Analytics() {
  return (
    <div className="mx-auto max-w-shell">
      <Reveal>
        <p className="eyebrow text-sky">Analytics</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Executive signals, distilled for action.
        </h1>
      </Reveal>

      <div className="mt-10">
        <ExecutiveDashboardPhase1 />
      </div>
    </div>
  )
}
