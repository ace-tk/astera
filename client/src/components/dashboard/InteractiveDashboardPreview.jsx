import { memo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, BrainCircuit, CheckCircle2, Clock3, Sparkles, TriangleAlert, TrendingUp } from 'lucide-react'
import ExecutiveDashboardPhase1 from '@/components/dashboard/ExecutiveDashboardPhase1'
import Reveal from '@/components/ui/Reveal'

const RECENT_REPORTS = [
  { title: 'Weekly Product Sync', date: 'Jul 18', score: 92, status: 'Healthy', tone: 'emerald' },
  { title: 'Board Review', date: 'Jul 16', score: 88, status: 'Stable', tone: 'royal' },
  { title: 'Hiring Discussion', date: 'Jul 14', score: 81, status: 'Watch', tone: 'golden' },
  { title: 'Sales Pipeline Review', date: 'Jul 12', score: 95, status: 'Healthy', tone: 'emerald' },
  { title: 'Customer Success Meeting', date: 'Jul 10', score: 84, status: 'Needs follow-up', tone: 'rose' },
]

const ACTION_OVERVIEW = [
  { label: 'Open Actions', value: '12', description: 'Awaiting ownership and review' },
  { label: 'Completed', value: '24', description: 'Closed with clear next steps' },
  { label: 'Overdue', value: '3', description: 'Needs executive attention' },
  { label: 'Upcoming', value: '8', description: 'Scheduled this week' },
]

const AI_RECOMMENDATIONS = [
  { title: 'Schedule a follow-up', explanation: 'The unresolved hiring discussion needs a short executive recap before next week.', priority: 'High' },
  { title: 'Confirm budget approval', explanation: 'Stakeholder confirmation is still outstanding for the planned rollout.', priority: 'High' },
  { title: 'Review customer escalation', explanation: 'A sensitive customer issue should be revisited within the next 24 hours.', priority: 'Medium' },
  { title: 'Clarify roadmap ownership', explanation: 'Several roadmap actions remain unassigned and should be narrowed quickly.', priority: 'Medium' },
  { title: 'Preserve decision quality', explanation: 'The leadership meeting produced strong alignment and should be reused as a model.', priority: 'Low' },
]

const MEETING_TRENDS = [
  { title: 'Decision Quality', value: '12%', change: '+12%', description: 'Decision clarity improved across the most recent leadership sessions.', tone: 'emerald' },
  { title: 'Participation Balance', value: '8%', change: '+8%', description: 'Contributor balance is healthier, with less single-speaker dominance.', tone: 'royal' },
  { title: 'Execution Confidence', value: '95%', change: 'High', description: 'Follow-through confidence remains strong for the current operating rhythm.', tone: 'purple' },
  { title: 'Meeting Focus', value: '91%', change: 'Stable', description: 'Discussions stayed tightly scoped and action-oriented.', tone: 'golden' },
  { title: 'Follow-up Completion', value: '87%', change: '+5%', description: 'Teams are closing commitments faster than the prior review window.', tone: 'emerald' },
]

function badgeStyles(tone) {
  const map = {
    emerald: 'border-emerald/20 bg-emerald/10 text-emerald',
    royal: 'border-royal/20 bg-royal/10 text-royal',
    golden: 'border-golden/20 bg-golden/10 text-golden',
    rose: 'border-rose/20 bg-rose/10 text-rose',
  }

  return map[tone] || 'border-ink/10 bg-ink/[0.04] text-muted'
}

function getTrendBarWidth(title) {
  const map = {
    'Follow-up Completion': '87%',
    'Meeting Focus': '91%',
    'Execution Confidence': '95%',
    'Participation Balance': '78%',
  }

  return map[title] || '82%'
}

function EmptyState({ label }) {
  return (
    <div className="rounded-[1.15rem] border border-dashed border-ink/10 bg-ink/[0.02] p-4 text-sm text-muted">
      No {label} available right now. The layout will stay polished as data is added.
    </div>
  )
}

const InteractiveDashboardPreview = memo(function InteractiveDashboardPreview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="overflow-hidden rounded-[2rem] border border-ink/8 bg-card p-2 shadow-[0_35px_95px_rgba(17,24,39,0.14)] ring-1 ring-ink/6 sm:p-3">
        <div className="rounded-[1.6rem] border border-ink/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(248,250,252,0.9))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-4">
          <div className="flex items-center gap-2 border-b border-ink/8 bg-ink/[0.02] px-3 py-3 sm:px-4">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-rose/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-golden/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald/80" />
            </div>
            <div className="ml-2 flex-1 rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-left text-[0.72rem] text-muted shadow-inner sm:text-xs">
              astera.app/dashboard/overview
            </div>
          </div>

          <div className="max-h-[760px] overflow-y-auto bg-card/80 p-3 sm:p-4 lg:p-5">
            <div className="rounded-[1.4rem] border border-ink/8 bg-ink/[0.02] p-4 sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="eyebrow text-purple"><Sparkles className="h-3.5 w-3.5" /> Live product preview</span>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
                    A complete executive view in one glance.
                  </h3>
                </div>
                <div className="rounded-full border border-ink/8 bg-card px-3 py-1.5 text-xs text-muted shadow-soft">
                  Designed for fast understanding
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <ExecutiveDashboardPhase1 />

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <Reveal delay={0.08}>
                    <section className="rounded-[1.5rem] border border-ink/8 bg-card/95 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Recent Reports</h4>
                          <p className="mt-1 text-sm text-muted">A curated pulse of the most relevant meetings.</p>
                        </div>
                        <span className="rounded-full border border-ink/8 bg-ink/[0.03] px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                          Updated now
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2" role="list">
                        {RECENT_REPORTS.length > 0 ? RECENT_REPORTS.map((report, index) => (
                          <motion.article
                            key={report.title}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="rounded-[1.2rem] border border-ink/8 bg-ink/[0.02] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                            role="listitem"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h5 className="font-medium text-ink">{report.title}</h5>
                                <p className="mt-1 text-sm text-muted">{report.date}</p>
                              </div>
                              <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-medium ${badgeStyles(report.tone)}`}>
                                {report.status}
                              </span>
                            </div>

                            <div className="mt-4 flex items-end justify-between gap-3">
                              <div>
                                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted">Health score</p>
                                <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{report.score}</p>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full border border-ink/8 bg-card px-3 py-1.5 text-sm text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/40 focus-visible:ring-offset-2"
                                aria-label={`Quick view ${report.title}`}
                              >
                                Quick View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </motion.article>
                        )) : <EmptyState label="recent reports" />}
                      </div>
                    </section>
                  </Reveal>

                  <Reveal delay={0.1}>
                    <section className="rounded-[1.5rem] border border-ink/8 bg-card/95 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                      <div>
                        <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Action Overview</h4>
                        <p className="mt-1 text-sm text-muted">A clean view of meeting follow-through without feeling like project management.</p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {ACTION_OVERVIEW.length > 0 ? ACTION_OVERVIEW.map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="rounded-[1.15rem] border border-ink/8 bg-ink/[0.02] p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm text-muted">{item.label}</p>
                                <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{item.value}</p>
                              </div>
                              {item.label === 'Overdue' ? <TriangleAlert className="h-4 w-4 text-rose" /> : item.label === 'Completed' ? <CheckCircle2 className="h-4 w-4 text-emerald" /> : <Clock3 className="h-4 w-4 text-royal" />}
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                          </motion.div>
                        )) : <EmptyState label="action overview data" />}
                      </div>
                    </section>
                  </Reveal>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                  <Reveal delay={0.12}>
                    <section className="rounded-[1.5rem] border border-ink/8 bg-card/95 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">AI Recommendations</h4>
                          <p className="mt-1 text-sm text-muted">Elegant prompts that highlight the next best step.</p>
                        </div>
                        <div className="rounded-full border border-ink/8 bg-ink/[0.03] p-2 text-purple">
                          <BrainCircuit className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        {AI_RECOMMENDATIONS.length > 0 ? AI_RECOMMENDATIONS.map((item, index) => (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="rounded-[1.15rem] border border-ink/8 bg-ink/[0.02] p-4 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex gap-3">
                                <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-purple/10 text-purple">
                                  <BrainCircuit className="h-4 w-4" />
                                </span>
                                <div>
                                  <h5 className="font-medium text-ink">{item.title}</h5>
                                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.explanation}</p>
                                </div>
                              </div>
                              <span className="rounded-full border border-ink/8 bg-card px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                                {item.priority}
                              </span>
                            </div>
                          </motion.div>
                        )) : <EmptyState label="AI recommendations" />}
                      </div>
                    </section>
                  </Reveal>

                  <Reveal delay={0.14}>
                    <section className="rounded-[1.5rem] border border-ink/8 bg-card/95 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Meeting Trends</h4>
                          <p className="mt-1 text-sm text-muted">Editorial insight cards that surface momentum and stability.</p>
                        </div>
                        <div className="rounded-full border border-ink/8 bg-ink/[0.03] p-2 text-emerald">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        {MEETING_TRENDS.length > 0 ? MEETING_TRENDS.map((item, index) => (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="rounded-[1.15rem] border border-ink/8 bg-ink/[0.02] p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm text-muted">{item.title}</p>
                                <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{item.value}</p>
                              </div>
                              <div className="text-right">
                                <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-medium ${item.tone === 'emerald' ? 'border-emerald/20 bg-emerald/10 text-emerald' : item.tone === 'royal' ? 'border-royal/20 bg-royal/10 text-royal' : item.tone === 'purple' ? 'border-purple/20 bg-purple/10 text-purple' : 'border-golden/20 bg-golden/10 text-golden'}`}>
                                  {item.change}
                                </span>
                                <div className="mt-2 h-2 w-20 rounded-full bg-ink/[0.06]">
                                  <div className={`h-2 rounded-full ${item.tone === 'emerald' ? 'bg-emerald' : item.tone === 'royal' ? 'bg-royal' : item.tone === 'purple' ? 'bg-purple' : 'bg-golden'}`} style={{ width: getTrendBarWidth(item.title) }} />
                                </div>
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                          </motion.div>
                        )) : <EmptyState label="meeting trend data" />}
                      </div>
                    </section>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
})

export default InteractiveDashboardPreview
