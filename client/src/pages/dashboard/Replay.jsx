import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clapperboard, ListVideo } from 'lucide-react'
import { useReport } from '@/hooks/useReports'
import CinematicBuild from '@/components/replay/CinematicBuild'
import InteractiveReplay from '@/components/replay/InteractiveReplay'
import MeshBackground from '@/components/common/MeshBackground'
import { cn } from '@/utils/cn'

const MODES = [
  { id: 'cinematic', label: 'Cinematic', icon: Clapperboard },
  { id: 'interactive', label: 'Interactive', icon: ListVideo },
]

export default function Replay() {
  const { id } = useParams()
  const { data: report, isLoading } = useReport(id)
  const [mode, setMode] = useState('cinematic')

  if (isLoading || !report) {
    return (
      <div className="grid h-full place-items-center">
        <div className="h-24 w-24 animate-pulse rounded-full bg-card" />
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <MeshBackground mood={mode === 'cinematic' ? 'ai' : 'timeline'} />

      {/* header */}
      <div className="sticky top-0 z-20 border-b border-ink/8 bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to={`/app/report/${report.id}`} className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> {report.title}
          </Link>
          {/* segmented mode toggle */}
          <div className="relative flex rounded-full border border-ink/8 bg-card p-1">
            {MODES.map((mo) => (
              <button
                key={mo.id}
                onClick={() => setMode(mo.id)}
                className={cn('relative z-10 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors', mode === mo.id ? 'text-paper' : 'text-muted hover:text-ink')}
              >
                {mode === mo.id && (
                  <motion.span layoutId="replay-mode" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <mo.icon className="h-4 w-4" /> {mo.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-8">
        {mode === 'cinematic' ? (
          <CinematicBuild report={report} onSwitchInteractive={() => setMode('interactive')} />
        ) : (
          <InteractiveReplay report={report} />
        )}
      </div>
    </div>
  )
}
