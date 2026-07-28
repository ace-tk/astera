import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Workflow, Clapperboard, ArrowRight } from 'lucide-react'
import { getDemoMeetings } from '@/services/mockData'
import { REPORT_TYPES } from '@/constants/reportRequests'
import DemoCard from '@/components/demo/DemoCard'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'

/**
 * Demo Workspace — the "experience everything in 20 seconds" gallery. No upload
 * required: real, fully-populated meetings the visitor can open, replay, and
 * read immediately — organized by report category. Cards/grid are unchanged
 * (DemoCard is untouched); this only groups the existing gallery.
 */
export default function DemoWorkspace() {
  const demos = getDemoMeetings()
  const byCategory = REPORT_TYPES.map((category) => ({
    category,
    reports: demos.filter((r) => r.category === category),
  })).filter((g) => g.reports.length > 0)

  return (
    <div className="mx-auto max-w-shell">
      <Reveal>
        <span className="eyebrow text-purple"><Sparkles className="h-3.5 w-3.5" /> Demo Workspace</span>
        <h1 className="mt-3 max-w-2xl font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Real meetings, by report type. Nothing to upload.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Open any conversation to explore its intelligence — timeline, decisions, risks,
          Meeting DNA, cinematic replay, and the reader. Pick one and press play.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button as={Link} to="/app" variant="soft" size="sm"><Workflow className="h-4 w-4" /> Open the workspace canvas</Button>
          <Button as={Link} to="/app/replay/board-fy26" variant="accent" size="sm"><Clapperboard className="h-4 w-4" /> Watch a replay <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </Reveal>

      {byCategory.map(({ category, reports }, gi) => (
        <Reveal key={category} delay={gi * 0.05} className={gi === 0 ? 'mt-12' : 'mt-14'}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-medium tracking-tight">{category}</h2>
            <span className="text-sm text-muted">{reports.length} report{reports.length === 1 ? '' : 's'}</span>
          </div>
          <motion.div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r, i) => (
              <DemoCard key={r.id} report={r} index={i} />
            ))}
          </motion.div>
        </Reveal>
      ))}
    </div>
  )
}
