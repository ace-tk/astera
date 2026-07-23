import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BarChart3, BrainCircuit, ChevronLeft, ChevronRight, Clock3, MessageSquareText, Sparkles, X } from 'lucide-react'

const REPORT_PREVIEWS = [
  {
    title: 'Product Roadmap Review',
    subtitle: 'Shipping priorities and launch sequencing',
    summary: 'A polished executive recap with milestones, owners, and the decisions that mattered most for this quarter.',
    tone: 'royal',
    modal: {
      headline: 'A crisp, decision-ready roadmap review that feels polished enough for leadership.',
      summary: 'This report distills the most important launch decisions, dependencies, and follow-up tasks into an elegant executive brief.',
      timeline: [
        { time: '00:12', title: 'Launch priorities confirmed', detail: 'Scope narrowed to the billing rewrite and pilot readiness.' },
        { time: '16:08', title: 'Dependency review', detail: 'Legal and design alignment locked for the next shipping milestone.' },
        { time: '42:25', title: 'Decision captured', detail: 'A clear owner was assigned to the rollout plan.' },
      ],
      analyzer: ['3 critical decisions surfaced', '2 blockers flagged for follow-up', '1 alignment gap resolved before the room adjourned'],
      speakers: ['Product lead drove the roadmap discussion', 'Finance contributed the rollout risks', 'Operations clarified the delivery timing'],
      actions: ['Confirm pilot launch readiness by Thursday', 'Share the revised dependency list with design', 'Revisit the legal review before the next sync'],
      metrics: [
        { label: 'Duration', value: '74 min' },
        { label: 'Participants', value: '7' },
        { label: 'Actions', value: '4' },
      ],
    },
  },
  {
    title: 'Weekly Leadership Sync',
    subtitle: 'Team momentum and follow-through',
    summary: 'A calm, readable summary of priorities, blockers, and the moments that need a closer look.',
    tone: 'purple',
    modal: {
      headline: 'A leadership brief that keeps momentum visible without sounding like a status dump.',
      summary: 'This preview highlights execution focus, key risks, and the operating rhythm that keeps the team aligned.',
      timeline: [
        { time: '04:41', title: 'Team pulse check', detail: 'Heads-up on hiring capacity and delivery concentration.' },
        { time: '21:14', title: 'Roadmap tradeoffs', detail: 'Two initiatives were reframed to protect the current launch window.' },
        { time: '53:06', title: 'Follow-through', detail: 'Ownership remained clear through the final recap.' },
      ],
      analyzer: ['4 themes surfaced in the discussion', '1 risk accepted with a mitigation plan', '3 decisions carried into the next week'],
      speakers: ['CEO set the strategic framing', 'Heads of product and ops balanced the tradeoffs', 'The team lead closed the loop with owners'],
      actions: ['Share the revised staffing plan', 'Close the hiring follow-up before Friday', 'Reconnect on the risk mitigation thread next week'],
      metrics: [
        { label: 'Duration', value: '58 min' },
        { label: 'Participants', value: '6' },
        { label: 'Actions', value: '3' },
      ],
    },
  },
  {
    title: 'Customer Success Review',
    subtitle: 'Retention risk and customer sentiment',
    summary: 'Highlights the moments that mattered most, paired with clear next actions and customer context.',
    tone: 'emerald',
    modal: {
      headline: 'A warm, executive-ready review that keeps the customer story clear and actionable.',
      summary: 'The report captures churn signal, customer sentiment, and the follow-up steps that matter most to retention.',
      timeline: [
        { time: '08:03', title: 'Signal surfaced', detail: 'An escalation trend became visible early in the call.' },
        { time: '26:19', title: 'Escalation response', detail: 'The team aligned on a short-term recovery plan.' },
        { time: '49:40', title: 'Renewal confidence', detail: 'The customer context was synthesized into a clear handoff.' },
      ],
      analyzer: ['2 customer risks were elevated', '1 positive sentiment trend preserved', '3 follow-ups captured for the next cycle'],
      speakers: ['Customer success led the narrative', 'Support surfaced the escalation context', 'Leadership framed the retention response'],
      actions: ['Send the recovery recap to the account team', 'Schedule a renewal touchpoint', 'Monitor the sentiment trend through the next week'],
      metrics: [
        { label: 'Duration', value: '61 min' },
        { label: 'Participants', value: '5' },
        { label: 'Actions', value: '3' },
      ],
    },
  },
  {
    title: 'Sales Pipeline Review',
    subtitle: 'Forecast confidence and opportunities',
    summary: 'Built to make revenue discussions feel clear, concise, and decision-ready without flattening nuance.',
    tone: 'golden',
    modal: {
      headline: 'A revenue review that feels sharp, executive, and easy to share with the broader team.',
      summary: 'This preview turns deal momentum into a sleek narrative with next steps that feel actionable without becoming noisy.',
      timeline: [
        { time: '02:56', title: 'Forecast check-in', detail: 'Deal confidence and timing were reviewed with care.' },
        { time: '20:11', title: 'Momentum shift', detail: 'Two opportunities moved into a stronger conversion posture.' },
        { time: '44:54', title: 'Executive next steps', detail: 'A crisp handoff was prepared for the follow-up review.' },
      ],
      analyzer: ['4 opportunities reviewed', '2 momentum shifts identified', '1 risk carried into the next forecast cycle'],
      speakers: ['Revenue lead framed the forecast', 'Regional sales added the field context', 'Leadership focused the decision points'],
      actions: ['Circle back on the two high-potential deals', 'Reconfirm the timing with regional leadership', 'Prepare the next forecast update'],
      metrics: [
        { label: 'Duration', value: '49 min' },
        { label: 'Participants', value: '4' },
        { label: 'Actions', value: '3' },
      ],
    },
  },
  {
    title: 'Hiring Committee',
    subtitle: 'Candidate alignment and interview decisions',
    summary: 'Turns interview notes into a structured summary that stays easy to share, discuss, and act on.',
    tone: 'coral',
    modal: {
      headline: 'A thoughtful committee review that keeps the hiring story clear and accountable.',
      summary: 'The report captures candidate strengths, decision criteria, and the follow-up needed to keep the hiring process moving.',
      timeline: [
        { time: '06:14', title: 'Candidate profile shared', detail: 'The committee aligned on the core criteria for the role.' },
        { time: '23:08', title: 'Interview discussion', detail: 'Strengths and concerns were reviewed without losing context.' },
        { time: '51:32', title: 'Decision summary', detail: 'The recommendation and next step were captured cleanly.' },
      ],
      analyzer: ['3 candidate strengths surfaced', '2 concerns documented', '1 recommendation preserved for the next review'],
      speakers: ['HR summarized the process', 'Hiring managers contributed the role-specific perspective', 'Leadership framed the recommendation'],
      actions: ['Send the feedback summary to the committee', 'Schedule the next interview round', 'Document the hiring recommendation in the tracker'],
      metrics: [
        { label: 'Duration', value: '63 min' },
        { label: 'Participants', value: '5' },
        { label: 'Actions', value: '3' },
      ],
    },
  },
  {
    title: 'Board Meeting',
    subtitle: 'Big-picture update with executive clarity',
    summary: 'A refined report that respects the stakes of the room while keeping every point legible and calm.',
    tone: 'sky',
    modal: {
      headline: 'An executive-grade board brief that keeps the signal crisp and the story unhurried.',
      summary: 'This preview surfaces the most consequential updates, tradeoffs, and decisions in a format that feels polished enough for the boardroom.',
      timeline: [
        { time: '05:09', title: 'Opening update', detail: 'The room reviewed the overall operating posture and priorities.' },
        { time: '22:41', title: 'Decision framing', detail: 'The board weighed resource tradeoffs and the implications for the next quarter.' },
        { time: '58:22', title: 'Executive close', detail: 'A concise summary and next checkpoint were captured for follow-up.' },
      ],
      analyzer: ['4 strategic decisions were captured', '2 board-level risks were highlighted', '1 executive recommendation carried forward'],
      speakers: ['The CEO led the narrative', 'Finance clarified the tradeoffs', 'The chair closed with the next checkpoint'],
      actions: ['Circulate the summary to the board pack', 'Prepare the resource follow-up', 'Confirm the next review date'],
      metrics: [
        { label: 'Duration', value: '72 min' },
        { label: 'Participants', value: '8' },
        { label: 'Actions', value: '3' },
      ],
    },
  },
]

function toneClasses(tone) {
  switch (tone) {
    case 'royal':
      return 'border-royal/15 bg-royal/10 text-royal'
    case 'purple':
      return 'border-purple/15 bg-purple/10 text-purple'
    case 'emerald':
      return 'border-emerald/15 bg-emerald/10 text-emerald'
    case 'golden':
      return 'border-golden/15 bg-golden/10 text-golden'
    case 'coral':
      return 'border-coral/15 bg-coral/10 text-coral'
    case 'sky':
      return 'border-sky/15 bg-sky/10 text-sky'
    default:
      return 'border-ink/10 bg-ink/[0.03] text-muted'
  }
}

function ReportModal({ item, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 px-3 py-4 backdrop-blur-sm sm:px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-ink/10 bg-paper shadow-[0_35px_110px_rgba(15,23,42,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink/8 bg-ink/[0.02] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-2.8 w-2.8 rounded-full bg-rose/80" />
            <span className="h-2.8 w-2.8 rounded-full bg-golden/80" />
            <span className="h-2.8 w-2.8 rounded-full bg-emerald/80" />
          </div>
          <div className="flex-1 rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-left text-[0.7rem] text-muted shadow-inner sm:text-xs">
            astera.app/reports/{item.title.toLowerCase().replace(/\s+/g, '-')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/8 bg-card text-ink transition-all duration-200 hover:bg-ink/[0.04]"
            aria-label="Close report preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="rounded-[1.5rem] border border-ink/8 bg-card/95 p-4 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-sky">Full report preview</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.8rem]">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                  {item.modal.summary}
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.24em] ${toneClasses(item.tone)}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Premium preview
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-ink/8 bg-ink/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 text-purple" />
                    <h4 className="font-display text-lg font-semibold tracking-tight text-ink">Summary</h4>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.modal.headline}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {item.modal.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-ink/8 bg-card p-3 text-center">
                        <p className="font-display text-xl font-semibold tracking-tight text-ink">{metric.value}</p>
                        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-muted">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-ink/8 bg-ink/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-emerald" />
                    <h4 className="font-display text-lg font-semibold tracking-tight text-ink">Timeline preview</h4>
                  </div>
                  <div className="mt-4 space-y-3">
                    {item.modal.timeline.map((entry) => (
                      <div key={entry.time} className="rounded-2xl border border-ink/8 bg-card p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-ink">{entry.title}</p>
                          <span className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">{entry.time}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{entry.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-ink/8 bg-ink/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-royal" />
                    <h4 className="font-display text-lg font-semibold tracking-tight text-ink">Report Analyzer</h4>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {item.modal.analyzer.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-muted">
                        <span className="mt-1 h-2 w-2 rounded-full bg-royal" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.25rem] border border-ink/8 bg-ink/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 text-purple" />
                    <h4 className="font-display text-lg font-semibold tracking-tight text-ink">Speaker Analysis</h4>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {item.modal.speakers.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-muted">
                        <span className="mt-1 h-2 w-2 rounded-full bg-purple" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.25rem] border border-ink/8 bg-ink/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-golden" />
                    <h4 className="font-display text-lg font-semibold tracking-tight text-ink">Key Actions</h4>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {item.modal.actions.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-muted">
                        <span className="mt-1 h-2 w-2 rounded-full bg-golden" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ReportPreviewCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cardWidth, setCardWidth] = useState(290)
  const [selectedItem, setSelectedItem] = useState(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const node = trackRef.current?.querySelector('[data-preview-card]')
    if (!node) return

    const updateWidth = () => setCardWidth(node.getBoundingClientRect().width + 16)
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    window.addEventListener('resize', updateWidth)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  useEffect(() => {
    if (paused) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % REPORT_PREVIEWS.length)
    }, 3600)

    return () => window.clearInterval(timer)
  }, [paused])

  const visibleItems = useMemo(() => [...REPORT_PREVIEWS, ...REPORT_PREVIEWS], [])

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? REPORT_PREVIEWS.length - 1 : current - 1))
  }

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % REPORT_PREVIEWS.length)
  }

  return (
    <>
      <section className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="overflow-hidden rounded-[1.8rem] border border-ink/8 bg-card/90 p-4 shadow-soft backdrop-blur sm:p-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow text-sky">Beautiful reports for every meeting</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
                From planning sessions to board rooms.
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/8 bg-ink/[0.03] text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-card"
                aria-label="Show previous report preview"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/8 bg-ink/[0.03] text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-card"
                aria-label="Show next report preview"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={trackRef} className="mt-5 overflow-hidden">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) handleNext()
                if (info.offset.x > 50) handlePrev()
              }}
              animate={{ x: -activeIndex * cardWidth }}
              transition={{ type: 'spring', stiffness: 140, damping: 24 }}
              className="flex gap-4"
            >
              {visibleItems.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  data-preview-card
                  className="flex h-[23rem] w-[16rem] shrink-0 flex-col rounded-[1.35rem] border border-ink/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.97),rgba(248,250,252,0.9))] p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:h-[24rem] sm:w-[17.5rem]"
                >
                  <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.24em] ${toneClasses(item.tone)}`}>
                    <Sparkles className="h-3 w-3" />
                    {item.title}
                  </div>
                  <div className="mt-4 flex min-h-[7.6rem] flex-col rounded-[1.05rem] border border-ink/8 bg-paper/80 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Preview</p>
                    <p className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
                  </div>
                  <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-muted line-clamp-3">{item.summary}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-ink">
                    <span className="text-muted">AI-generated report</span>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-ink/8 bg-card px-3 py-1.5 text-sm text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink/[0.04]"
                    >
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedItem ? <ReportModal item={selectedItem} onClose={() => setSelectedItem(null)} /> : null}
      </AnimatePresence>
    </>
  )
}
