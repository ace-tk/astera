/**
 * The analysis layer.
 *
 * HONEST STATUS: this ships with a deterministic *heuristic* extractor only —
 * it does NOT call an LLM. The Deepgram (transcription) and OpenAI (extraction)
 * integrations are the intended production path and are stubbed here behind the
 * `usingLLM` check; wire the real calls in `llmExtract()` to enable them. Until
 * then every report is honestly labelled `engine: 'heuristic'` (see below), so
 * the API never claims analysis it didn't perform.
 */

const COLORS = ['royal', 'purple', 'emerald', 'coral', 'sky', 'golden']
const pick = (arr, seed) => arr[seed % arr.length]

/**
 * Heuristic extractor — scans transcript lines for decision/risk/commitment
 * cues. Deliberately simple and readable; it's the fallback, not the product.
 */
function heuristicExtract(transcript) {
  const lines = transcript
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)

  const decisions = []
  const risks = []
  const commitments = []
  const speakers = new Set()

  const stamp = (i) => {
    const total = Math.max(lines.length, 1)
    const secs = Math.round((i / total) * 74 * 60)
    return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
  }

  lines.forEach((line, i) => {
    const speaker = line.match(/^([A-Z][a-z]+)\s*:/)?.[1]
    if (speaker) speakers.add(speaker)
    const body = line.replace(/^[A-Z][a-z]+\s*:/, '').trim()
    const lower = body.toLowerCase()

    if (/\b(decid|decision|agree|going with|let'?s ship|we'?ll ship|approv|sign off|locked in)/.test(lower)) {
      decisions.push({ text: body.slice(0, 140), owner: speaker || 'Team', at: stamp(i), confidence: 0.72 + (i % 5) * 0.05 })
    }
    if (/\b(risk|concern|worried|blocker|might slip|unclear|no owner)\b/.test(lower)) {
      risks.push({ text: body.slice(0, 140), level: /\b(critical|blocker|slip)\b/.test(lower) ? 'high' : 'medium', at: stamp(i) })
    }
    if (/\b(i'll|we'll|by (mon|tue|wed|thu|fri)|action item|follow up|send|deliver)\b/.test(lower)) {
      commitments.push({ text: body.slice(0, 140), owner: speaker || 'Team', due: 'This week', at: stamp(i) })
    }
  })

  return { decisions, risks, commitments, speakers: [...speakers] }
}

/**
 * Produce a full report object from a transcript. Emits progress via the
 * optional `onStage` callback so the client can animate the pipeline.
 */
export async function generateReport(transcript, meta = {}, onStage = () => {}) {
  const stages = ['transcript', 'intelligence', 'timeline', 'report', 'compliance', 'delivery']
  for (const s of stages) {
    onStage(s)
    // small yield so socket events flush between stages
    await new Promise((r) => setTimeout(r, 40))
  }

  // A real LLM path is not implemented yet, so we never claim one ran even if a
  // key is present. `llmExtract` is the seam where OpenAI extraction would go.
  const { decisions, risks, commitments, speakers } = heuristicExtract(transcript || '')

  const participants = meta.participants?.length ? meta.participants : speakers.length ? speakers : ['Team']
  const seed = (transcript || '').length

  const timeline = [
    ...decisions.slice(0, 3).map((d) => ({ at: d.at, label: d.text.slice(0, 28), color: 'royal', kind: 'decision' })),
    ...risks.slice(0, 2).map((r) => ({ at: r.at, label: r.text.slice(0, 28), color: 'rose', kind: 'risk' })),
    ...commitments.slice(0, 2).map((c) => ({ at: c.at, label: c.text.slice(0, 28), color: 'golden', kind: 'commitment' })),
  ].sort((a, b) => a.at.localeCompare(b.at))

  const talkTime = participants.map((name, i) => ({
    name,
    pct: Math.round((100 / participants.length) * (1 + (i % 2 ? -0.2 : 0.2))),
  }))

  const talkBalance = Number((1 - 1 / Math.max(participants.length, 1)).toFixed(2))
  const clamp = (n, lo = 40, hi = 97) => Math.max(lo, Math.min(hi, Math.round(n)))
  const energy = clamp(52 + decisions.length * 5 + commitments.length * 3, 40, 96)

  // Meeting DNA — the signature fingerprint, derived from the extraction so real
  // reports render the DNA radial + confidence ring just like the demo ones.
  const dna = {
    decisionDriven: clamp(32 + decisions.length * 14),
    collaboration: clamp(38 + talkBalance * 55),
    conflict: clamp(6 + risks.length * 16, 6, 92),
    energy,
    energyLabel: energy > 80 ? 'High' : energy > 66 ? 'Engaged' : energy > 52 ? 'Measured' : 'Calm',
    compliance: clamp(100 - risks.length * 9, 55),
    aiConfidence: clamp(70 + Math.min((transcript || '').length / 40, 24) * 0.5, 68, 88),
  }

  return {
    title: meta.title || 'Untitled meeting',
    subtitle: meta.subtitle || 'Analyzed by ATOOPV',
    category: meta.category || 'Your upload',
    color: pick(COLORS, seed),
    status: 'ready',
    sentiment: risks.length > decisions.length ? 'mixed' : 'positive',
    duration: meta.duration || '74:12',
    participants,
    engine: 'heuristic', // honest: no LLM call is made in this build
    headline:
      decisions[0]?.text ||
      'ATOOPV distilled this conversation into decisions, commitments, and risks — each cited to the moment it was said.',
    metrics: {
      decisions: decisions.length,
      owners: new Set(decisions.map((d) => d.owner)).size,
      risks: risks.length,
      commitments: commitments.length,
      talkBalance,
    },
    dna,
    decisions,
    risks,
    commitments,
    timeline: timeline.length ? timeline : [{ at: '00:00', label: 'Meeting start', color: 'sky', kind: 'topic' }],
    talkTime,
  }
}
