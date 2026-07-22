import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Sparkles } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const SENTIMENT_STYLE = {
  Positive: { text: 'text-emerald', bg: 'bg-emerald/[0.10]' },
  Neutral: { text: 'text-royal', bg: 'bg-royal/[0.10]' },
  Concerned: { text: 'text-orange', bg: 'bg-orange/[0.10]' },
}

const CONTRIBUTION_STYLE = {
  Strategic: 'bg-royal/[0.10] text-royal',
  Facilitator: 'bg-emerald/[0.10] text-emerald',
  'Decision Maker': 'bg-golden/[0.10] text-golden',
  Advisor: 'bg-purple/[0.10] text-purple',
  'Technical Lead': 'bg-sky/[0.10] text-sky',
  Operator: 'bg-orange/[0.10] text-orange',
}

function inferRole(name) {
  const normalized = name?.toLowerCase() || ''
  if (normalized.includes('ceo')) return 'Executive Lead'
  if (normalized.includes('cfo')) return 'Finance Lead'
  if (normalized.includes('coo')) return 'Operations Lead'
  if (normalized.includes('chair')) return 'Facilitator'
  if (normalized.includes('founder')) return 'Vision Lead'
  if (normalized.includes('partner')) return 'Advisor'
  if (normalized.includes('principal')) return 'Advisor'
  if (normalized.includes('lead')) return 'Technical Lead'
  if (normalized.includes('director')) return 'Decision Maker'
  if (normalized.includes('ops')) return 'Operator'
  return 'Contributor'
}

function inferContribution(role, pct) {
  switch (role) {
    case 'Executive Lead':
    case 'Finance Lead':
    case 'Operations Lead':
      return pct >= 22 ? 'Strategic' : 'Decision Maker'
    case 'Facilitator':
      return 'Facilitator'
    case 'Vision Lead':
      return 'Strategic'
    case 'Advisor':
      return 'Advisor'
    case 'Technical Lead':
      return 'Technical Lead'
    case 'Operator':
      return 'Operator'
    default:
      return 'Decision Maker'
  }
}

function inferSentiment(name, pct, reportSentiment) {
  if (reportSentiment === 'mixed') {
    return pct >= 25 ? 'Neutral' : 'Concerned'
  }
  if (reportSentiment === 'positive') {
    return pct >= 20 ? 'Positive' : 'Neutral'
  }
  return pct >= 18 ? 'Neutral' : 'Concerned'
}

function inferTopics(name, subtitle, title) {
  const text = `${title || ''} ${subtitle || ''}`.toLowerCase()
  const topics = []

  if (text.includes('board') || text.includes('strategy')) {
    topics.push('Strategy', 'Roadmap', 'Governance')
  } else if (text.includes('fundraising') || text.includes('investor')) {
    topics.push('Growth', 'Valuation', 'Data Room')
  } else if (text.includes('finance') || text.includes('operations')) {
    topics.push('Budget', 'Forecast', 'Execution')
  } else if (text.includes('hiring') || text.includes('recruit')) {
    topics.push('Hiring', 'Talent', 'Process')
  } else {
    topics.push('Alignment', 'Execution', 'Next Steps')
  }

  if (name?.toLowerCase().includes('ceo')) topics.unshift('Decision')
  if (name?.toLowerCase().includes('cfo')) topics.unshift('Finance')
  return topics.slice(0, 3)
}

export function buildSpeakerAnalysisData(report) {
  const participants = report?.participants || []
  const talkTime = report?.talkTime || []
  const baseSentiment = report?.sentiment || 'positive'

  return participants.map((name, index) => {
    const entry = talkTime.find((item) => item.name === name) || talkTime[index] || {}
    const pct = entry.pct || Math.max(8, 32 - index * 4)
    const role = inferRole(name)
    const contribution = inferContribution(role, pct)
    const sentiment = inferSentiment(name, pct, baseSentiment)
    const topics = inferTopics(name, report?.subtitle, report?.title)

    return {
      name,
      role,
      pct,
      contribution,
      sentiment,
      topics,
    }
  })
}

export default function SpeakerAnalysis({ report }) {
  const a = accent(report?.color ?? 'royal')
  const speakers = useMemo(() => buildSpeakerAnalysisData(report), [report])

  return (
    <Reveal delay={0.12} className="mt-10">
      <section className="overflow-hidden rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
        <div className="flex items-center gap-2">
          <span className={cn('eyebrow', a.text)}>
            <Users className="h-3.5 w-3.5" /> Speaker Analysis
          </span>
        </div>
        <div className="mt-3 max-w-2xl">
          <h2 className="font-display text-2xl font-medium tracking-tight text-balance">Understand how each participant contributed to the conversation.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {speakers.map((speaker, index) => {
            const sentimentStyle = SENTIMENT_STYLE[speaker.sentiment] || SENTIMENT_STYLE.Neutral
            return (
              <motion.article
                key={speaker.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-ink">{speaker.name}</h3>
                    <p className="mt-1 text-sm text-muted">{speaker.role}</p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', CONTRIBUTION_STYLE[speaker.contribution] || CONTRIBUTION_STYLE.Advisor)}>
                    {speaker.contribution}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" /> Speaking Time
                    </span>
                    <span className="font-medium text-ink">{speaker.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                    <motion.span
                      className="block h-full rounded-full bg-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${speaker.pct}%` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.8, delay: index * 0.05 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-ink/8 bg-white/70 px-3 py-2.5">
                    <span className="text-muted">Sentiment</span>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', sentimentStyle.bg, sentimentStyle.text)}>
                      {speaker.sentiment}
                    </span>
                  </div>
                  <div className="rounded-xl border border-ink/8 bg-white/70 px-3 py-2.5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Key Topics</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {speaker.topics.map((topic) => (
                        <span key={topic} className="chip text-xs">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>
    </Reveal>
  )
}
