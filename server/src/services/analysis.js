/**
 * Meeting analysis — turns the already-extracted signals (Deepgram diarization,
 * topics, sentiment, timestamps + the heuristic decisions/risks/commitments)
 * into a comprehensive, structured analytics object.
 *
 * Everything here is DERIVED from the uploaded meeting — no fabrication. Fields
 * that a transcript can't support (company, country, missing legal documents,
 * etc.) are left undefined rather than invented. Audio yields the full set;
 * text/DOCX/PDF (no diarization) yield the transcript-supported subset.
 */

const round = (n, p = 0) => {
  const f = 10 ** p
  return Math.round((Number(n) || 0) * f) / f
}
const mmss = (sec) => `${Math.floor((sec || 0) / 60)}:${String(Math.round((sec || 0) % 60)).padStart(2, '0')}`
const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)))
const uniq = (arr) => [...new Set(arr)]

const RISK_CATEGORY = [
  [/\b(slip|deadline|date|delay|timeline|behind|late)\b/i, 'Timeline'],
  [/\b(owner|unassigned|no one|nobody|unclear who)\b/i, 'Ownership'],
  [/\b(compliance|legal|regulat|gdpr|policy|contract|clause|residency)\b/i, 'Compliance'],
  [/\b(budget|cost|spend|expensive|funding)\b/i, 'Financial'],
  [/\b(bug|outage|scal|technical|infra|security|data)\b/i, 'Technical'],
]
const categorize = (text) => RISK_CATEGORY.find(([re]) => re.test(text))?.[1] || 'General'
const IMPACT = { high: 'High', medium: 'Medium', low: 'Low' }
const PROBABILITY = { high: 'Likely', medium: 'Possible', low: 'Unlikely' }

/** Speaker-level analytics from the diarized utterances. */
function analyseSpeakers(diarization, speakers) {
  return speakers.map((sp) => {
    const utts = diarization.filter((d) => d.speaker === sp.label)
    const durations = utts.map((u) => (u.end || 0) - (u.start || 0))
    const totalWords = utts.reduce((n, u) => n + words(u.text), 0)
    const starts = utts.map((u) => u.start || 0)
    const ends = utts.map((u) => u.end || 0)
    return {
      id: sp.label,
      label: sp.label,
      speakingSeconds: sp.speakingSec,
      speakingTime: mmss(sp.speakingSec),
      speakingPercentage: sp.pct,
      totalWords,
      averageSpeakingLengthSec: round(sp.speakingSec / Math.max(utts.length, 1), 1),
      firstAppearance: mmss(starts.length ? Math.min(...starts) : 0),
      lastAppearance: mmss(ends.length ? Math.max(...ends) : 0),
      longestContinuousSec: round(Math.max(0, ...durations), 1),
      speakingTurns: utts.length,
      questionsAsked: utts.reduce((n, u) => n + (u.text.match(/\?/g)?.length || 0), 0),
    }
  })
}

/** Contribution & conversation-balance metrics. */
function contribution(speakerStats, speakerCount) {
  if (!speakerStats.length) return null
  const byTime = [...speakerStats].sort((a, b) => b.speakingSeconds - a.speakingSeconds)
  const pcts = speakerStats.map((s) => s.speakingPercentage)
  const mean = pcts.reduce((a, b) => a + b, 0) / pcts.length
  const variance = pcts.reduce((a, b) => a + (b - mean) ** 2, 0) / pcts.length
  // 100 = perfectly even participation, →0 = dominated by one voice.
  const balance = clamp(100 - Math.sqrt(variance))
  return {
    mostActiveSpeaker: byTime[0]?.label,
    leastActiveSpeaker: byTime[byTime.length - 1]?.label,
    averageParticipationPct: round(100 / Math.max(speakerCount, 1)),
    participationDistribution: speakerStats.map((s) => ({ speaker: s.label, pct: s.speakingPercentage })),
    conversationBalanceScore: balance,
  }
}

/** Discussion topics from Deepgram topic segments. */
function discussion(topicSegments, topicsList, summary) {
  const freq = {}
  const conf = {}
  for (const seg of topicSegments || []) {
    for (const t of seg.topics || []) {
      if (!t.topic) continue
      freq[t.topic] = (freq[t.topic] || 0) + 1
      conf[t.topic] = Math.max(conf[t.topic] || 0, t.confidence_score || 0)
    }
  }
  const topics = uniq([...(topicsList || []), ...Object.keys(freq)])
  return {
    mainTopics: topics,
    topicFrequency: topics.map((t) => ({ topic: t, mentions: freq[t] || 1 })),
    topicImportance: topics
      .map((t) => ({ topic: t, importance: round((conf[t] || 0.5) * 100) }))
      .sort((a, b) => b.importance - a.importance),
    topicSummary: summary || undefined,
  }
}

/** Attribute a heuristic decision/commitment to the speaker who said it. */
function attribute(text, diarization) {
  if (!diarization?.length || !text) return null
  const needle = text.toLowerCase().slice(0, 40)
  const hit = diarization.find((u) => u.text.toLowerCase().includes(needle))
  return hit ? { speaker: hit.speaker, at: mmss(hit.start) } : null
}

/** Per-speaker + overall sentiment from utterance sentiments. */
function sentimentBreakdown(diarization, overall) {
  const counts = { positive: 0, neutral: 0, negative: 0 }
  const bySpeaker = {}
  for (const u of diarization || []) {
    const s = u.sentiment || 'neutral'
    if (counts[s] != null) counts[s] += 1
    ;(bySpeaker[u.speaker] ||= { positive: 0, neutral: 0, negative: 0 })[s] += 1
  }
  const perSpeaker = Object.entries(bySpeaker).map(([speaker, c]) => {
    const dominant = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]
    return { speaker, sentiment: dominant, counts: c }
  })
  const total = counts.positive + counts.neutral + counts.negative
  return {
    overall: overall || 'neutral',
    positive: counts.positive,
    neutral: counts.neutral,
    negative: counts.negative,
    perSpeaker,
    confidence: total ? round(Math.max(counts.positive, counts.neutral, counts.negative) / total, 2) : undefined,
  }
}

/** Derived 0–100 quality scores (deterministic, grounded in the real signals). */
function meetingQuality({ draft, balance, decisions, commitments, risks, sentimentConf }) {
  const participation = balance ?? 55
  const decisionQuality = clamp(30 + decisions.length * 12)
  const communication = clamp((participation + (sentimentConf ? sentimentConf * 100 : 60)) / 2)
  const followUp = clamp(commitments.length ? 40 + commitments.length * 15 : 25)
  const effectiveness = clamp((decisionQuality + participation + followUp) / 3 - risks.length * 4)
  return {
    effectivenessScore: effectiveness,
    participationScore: clamp(participation),
    decisionQualityScore: decisionQuality,
    communicationScore: communication,
    followUpReadinessScore: followUp,
  }
}

export function buildMeetingAnalysis({ meta = {}, transcript, diarization = [], speakers = [], transcription, draft, deepgram }) {
  const decisions = draft.decisions || []
  const risks = draft.risks || []
  const commitments = draft.commitments || []
  const isAudio = diarization.length > 0

  const speakerStats = isAudio ? analyseSpeakers(diarization, speakers) : []
  const contrib = isAudio ? contribution(speakerStats, transcription?.speakerCount || speakers.length) : null

  // Speaker insights (only what the data supports).
  let speakerInsights = null
  if (isAudio && speakerStats.length) {
    const byWords = [...speakerStats].sort((a, b) => b.totalWords - a.totalWords)
    const byQuestions = [...speakerStats].sort((a, b) => b.questionsAsked - a.questionsAsked)
    const monologue = diarization.reduce((m, u) => ((u.end - u.start) > (m.end - m.start) ? u : m), diarization[0])
    speakerInsights = {
      mostEngaged: byWords[0]?.label,
      mostInfluential: byWords[0]?.label, // most words as an influence proxy (no name refs to score)
      mostQuestionsAsked: byQuestions[0]?.questionsAsked ? byQuestions[0].label : undefined,
      longestMonologue: { speaker: monologue.speaker, seconds: round(monologue.end - monologue.start, 1), at: mmss(monologue.start) },
      participationHeatmap: heatmap(diarization, speakers, transcription?.durationSec || 0),
    }
  }

  const disc = discussion(deepgram?.topicSegments, transcription?.topics, transcription?.summary)

  const actionItems = commitments.map((c) => {
    const at = attribute(c.text, diarization)
    return {
      task: c.text,
      owner: at?.speaker || c.owner || 'Unassigned',
      priority: /\b(urgent|asap|immediately|critical|today)\b/i.test(c.text) ? 'High' : 'Medium',
      deadline: c.due && c.due !== 'This week' ? c.due : detectDeadline(c.text),
      status: 'Open',
      at: at?.at || c.at,
    }
  })

  const decisionList = decisions.map((d) => {
    const at = attribute(d.text, diarization)
    return {
      decision: d.text,
      owner: at?.speaker || d.owner || 'Team',
      supportingEvidence: d.text,
      timestamp: at?.at || d.at,
      confidence: round((d.confidence || 0.75) * 100),
    }
  })

  const riskAnalysis = {
    critical: risks.filter((r) => r.level === 'high').map(shapeRisk),
    medium: risks.filter((r) => r.level === 'medium').map(shapeRisk),
    low: risks.filter((r) => r.level === 'low').map(shapeRisk),
  }

  const complianceScore = clamp(100 - risks.length * 9, 40)
  const compliance = {
    complianceScore,
    riskLevel: complianceScore >= 80 ? 'Low' : complianceScore >= 60 ? 'Medium' : 'High',
    riskSummary: risks.length
      ? `${risks.length} open risk${risks.length > 1 ? 's' : ''} across ${uniq(risks.map((r) => categorize(r.text))).join(', ')}.`
      : 'No material risks detected in this discussion.',
    recommendations: risks.slice(0, 5).map((r) => `Address: ${r.text}`),
    // Not derivable from a generic transcript — left empty rather than fabricated.
    missingDocuments: [],
    missingClauses: [],
    complianceReferences: [],
    confidence: round((draft.dna?.aiConfidence || 75) / 100, 2),
  }

  const sentiment = sentimentBreakdown(diarization, transcription?.sentiment)
  const quality = meetingQuality({
    draft,
    balance: contrib?.conversationBalanceScore,
    decisions,
    commitments,
    risks,
    sentimentConf: sentiment.confidence,
  })

  const aiInsights = {
    keyTakeaways: [transcription?.summary, ...decisions.slice(0, 3).map((d) => d.text)].filter(Boolean).slice(0, 5),
    nextSteps: commitments.slice(0, 6).map((c) => c.text),
    potentialRisks: risks.map((r) => r.text),
    missingInformation: risks.filter((r) => /\b(no owner|unclear|unconfirmed|tbd|unassigned)\b/i.test(r.text)).map((r) => r.text),
    strategicObservations: buildObservations({ decisions, risks, commitments, contrib, disc, isAudio }),
    executiveRecommendations: uniq([
      ...risks.slice(0, 3).map((r) => `Mitigate: ${r.text}`),
      ...commitments.slice(0, 2).map((c) => `Follow through on: ${c.text}`),
    ]).slice(0, 5),
  }

  return {
    generatedAt: undefined, // stamped by the caller (Date is unavailable here)
    metadata: {
      meetingName: meta.title,
      company: meta.company || undefined,
      meetingType: meta.meetingType || undefined,
      date: undefined, // set by caller
      duration: transcription?.durationSec ? mmss(transcription.durationSec) : meta.duration,
      language: transcription?.language,
      country: undefined,
      complianceSelected: undefined,
      wordCount: words(transcript),
      speakerCount: transcription?.speakerCount || speakers.length || undefined,
    },
    speakerAnalysis: speakerStats,
    speakerContribution: contrib,
    speakerInsights,
    discussion: disc,
    actionItems,
    decisions: decisionList,
    riskAnalysis,
    compliance,
    sentiment,
    meetingQuality: quality,
    aiInsights,
  }
}

function shapeRisk(r) {
  return {
    risk: r.text,
    category: categorize(r.text),
    impact: IMPACT[r.level] || 'Medium',
    probability: PROBABILITY[r.level] || 'Possible',
    recommendation: `Assign an owner and a due date to resolve: ${r.text}`,
    at: r.at,
  }
}

function detectDeadline(text) {
  const m = text.match(/\b(by|before|due)\s+(mon|tue|wed|thu|fri|sat|sun|today|tomorrow|next week|end of week|eow|q[1-4]|\w+day)\b/i)
  return m ? m[0] : undefined
}

/** Speaking time per speaker across N time buckets → a participation heatmap. */
function heatmap(diarization, speakers, durationSec, buckets = 6) {
  if (!durationSec) return []
  const size = durationSec / buckets
  return speakers.map((sp) => {
    const row = new Array(buckets).fill(0)
    for (const u of diarization.filter((d) => d.speaker === sp.label)) {
      const b = Math.min(buckets - 1, Math.floor((u.start || 0) / size))
      row[b] += (u.end || 0) - (u.start || 0)
    }
    return { speaker: sp.label, buckets: row.map((s) => round(s, 1)) }
  })
}

function buildObservations({ decisions, risks, commitments, contrib, disc, isAudio }) {
  const out = []
  if (decisions.length) out.push(`${decisions.length} decision${decisions.length > 1 ? 's were' : ' was'} reached during the meeting.`)
  if (disc.mainTopics.length) out.push(`Discussion centred on ${disc.mainTopics.slice(0, 3).join(', ')}.`)
  if (isAudio && contrib) out.push(`Conversation was ${contrib.conversationBalanceScore}% balanced across ${contrib.participationDistribution.length} speakers; ${contrib.mostActiveSpeaker} led the discussion.`)
  if (risks.length) out.push(`${risks.length} risk${risks.length > 1 ? 's remain' : ' remains'} open and ${commitments.length} follow-up${commitments.length === 1 ? '' : 's'} ${commitments.length === 1 ? 'was' : 'were'} committed.`)
  return out
}
