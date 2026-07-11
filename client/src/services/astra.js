/**
 * ASTRA's answer engine. It resolves a natural-language question against the
 * current report using lightweight intent matching, then composes an answer
 * from the report's own data — so replies are always grounded in the meeting,
 * never generic. Each answer returns rich blocks the UI can render.
 */

const has = (q, ...words) => words.some((w) => q.includes(w))

function whoSpokeMost(report) {
  const sorted = [...report.talkTime].sort((a, b) => b.pct - a.pct)
  const top = sorted[0]
  return {
    text: `${top.name} held the room, speaking ${top.pct}% of the time. Here's how the ${report.talkTime.length} voices split.`,
    list: sorted.map((t) => ({ label: t.name, meta: `${t.pct}%`, bar: t.pct, color: 'sky' })),
  }
}

function unresolvedDecisions(report) {
  const low = [...report.decisions].sort((a, b) => a.confidence - b.confidence)
  return {
    text: `I logged ${report.decisions.length} decisions. The ones with the softest consensus — worth a follow-up:`,
    list: low.map((d) => ({ label: d.text, meta: `${Math.round(d.confidence * 100)}%`, bar: d.confidence * 100, color: 'royal' })),
  }
}

function explainRisk(report) {
  const r = report.risks[0]
  if (!r) return { text: 'Good news — I didn’t flag any material risks in this conversation.' }
  return {
    text: `The top risk is “${r.text}” (${r.level}, around ${r.at}). I flagged it because the language signalled uncertainty and no clear owner was named nearby — the pattern that usually precedes a slip.`,
    tag: { label: `${r.level} risk`, color: r.level === 'high' ? 'rose' : 'orange' },
  }
}

function commitmentsAnswer(report) {
  return {
    text: `There are ${report.commitments.length} commitments on the record. I'll keep watch until each is closed:`,
    list: report.commitments.map((c) => ({ label: c.text, meta: `${c.owner} · ${c.due}`, color: 'golden' })),
  }
}

function summarize(report) {
  return {
    text: report.headline,
    stats: [
      { label: 'Decisions', value: report.metrics.decisions, color: 'royal' },
      { label: 'Commitments', value: report.metrics.commitments, color: 'golden' },
      { label: 'Risks', value: report.metrics.risks, color: 'rose' },
      { label: 'Owners', value: report.metrics.owners, color: 'purple' },
    ],
  }
}

export const SUGGESTIONS = [
  'Summarize this meeting',
  'Who spoke most?',
  'Why is this a risk?',
  'Show unresolved decisions',
  'What did we commit to?',
]

export function answer(question, report) {
  const q = question.toLowerCase()
  if (has(q, 'who spoke', 'talk', 'most', 'loud', 'quiet')) return whoSpokeMost(report)
  if (has(q, 'unresolved', 'decision', 'decide', 'open')) return unresolvedDecisions(report)
  if (has(q, 'risk', 'why', 'concern', 'danger', 'red flag')) return explainRisk(report)
  if (has(q, 'commit', 'promise', 'action', 'owe', 'follow')) return commitmentsAnswer(report)
  if (has(q, 'summar', 'tl;dr', 'overview', 'recap', 'what happened', 'budget')) return summarize(report)
  // graceful default — orient them, then summarize.
  return {
    text: `I can read everything in “${report.title}” — decisions, risks, commitments, the timeline, and who said what. Here's the shape of it:`,
    stats: summarize(report).stats,
  }
}

export const GREETING = (report) => ({
  text: `Hi, I'm Astra. I sat in on “${report.title}” and read every word. Ask me anything — or tap a prompt below.`,
})

const LAST_KEY = 'astera:lastReport'
const VISITS_KEY = 'astera:astraVisits'

/**
 * A greeting with a little memory. Astra recalls the report you were last in and
 * your return visits — a touch of personality, never a nag. Reads/writes the
 * memory here so the assistant "remembers" across navigations and sessions.
 */
export function greetWithMemory(report) {
  let last = null
  let visits = 1
  try {
    last = JSON.parse(localStorage.getItem(LAST_KEY) || 'null')
    visits = Number(localStorage.getItem(VISITS_KEY) || 0) + 1
    localStorage.setItem(VISITS_KEY, String(visits))
    localStorage.setItem(LAST_KEY, JSON.stringify({ id: report.id, title: report.title, ts: Date.now() }))
  } catch {
    return GREETING(report)
  }

  if (last && last.id !== report.id) {
    return {
      text: `Welcome back — last time you were in “${last.title}”. For “${report.title}” I've pulled the ${report.metrics.decisions} decisions and ${report.metrics.risks} risks to the top. What would you like to know?`,
    }
  }
  if (visits > 2) {
    return {
      text: `Good to see you again. I've re-read “${report.title}” — ${report.metrics.decisions} decisions, ${report.metrics.commitments} commitments, ${report.metrics.risks} risks. Where should we start?`,
    }
  }
  return GREETING(report)
}
