/**
 * Turns a report into a scrubbable set of "moments" for the interactive Meeting
 * Replay. Each moment carries a timestamp, what was happening, the active
 * speaker, a transcript excerpt, and any decision/risk/commitment tied to it —
 * so selecting a point on the timeline updates every synced panel at once.
 */

const LINES = {
  decision: [
    'Okay — let’s lock this in. That’s the call.',
    'Agreed. We move forward with that approach.',
    'Good, everyone’s aligned. Marking it decided.',
  ],
  risk: [
    'My concern is the timing here — this could slip.',
    'That worries me. We don’t have an owner for it yet.',
    'Flag that — it’s a real dependency risk.',
  ],
  commitment: [
    'I’ll take that and have it back by then.',
    'Leave it with me — I’ll own the follow-up.',
    'I’ll send that around before end of day.',
  ],
  topic: [
    'Let’s step back and frame what we’re solving.',
    'Quick context before we go deeper on this.',
    'Here’s where we landed last time we discussed it.',
  ],
}

const pick = (arr, i) => arr[i % arr.length]

export function buildMoments(report) {
  const speakers = report.participants
  const start = { at: '00:00', label: report.title, color: 'sky', kind: 'topic', opening: true }
  const moments = [start, ...report.timeline].map((m, i) => {
    const speaker = speakers[i % speakers.length]
    const detail =
      m.kind === 'decision'
        ? report.decisions.find((d) => d.at === m.at)
        : m.kind === 'risk'
          ? report.risks.find((r) => r.at === m.at)
          : m.kind === 'commitment'
            ? report.commitments.find((c) => c.at === m.at)
            : null
    return {
      id: `${m.at}-${i}`,
      at: m.at,
      label: m.opening ? 'Meeting started' : m.label,
      color: m.color,
      kind: m.kind,
      speaker,
      line: m.opening ? 'Alright, thanks everyone for making the time. Let’s get into it.' : pick(LINES[m.kind] || LINES.topic, i),
      detail,
    }
  })
  return moments
}

// The ordered stages the cinematic build reveals, with human labels.
export const BUILD_STAGES = [
  { key: 'listening', label: 'Listening to the room', color: 'coral' },
  { key: 'summary', label: 'Writing the executive summary', color: 'purple' },
  { key: 'metrics', label: 'Counting decisions & signals', color: 'royal' },
  { key: 'timeline', label: 'Reconstructing the timeline', color: 'emerald' },
  { key: 'speakers', label: 'Measuring who held the room', color: 'sky' },
  { key: 'decisions', label: 'Extracting decisions', color: 'royal' },
  { key: 'risks', label: 'Detecting risks', color: 'rose' },
  { key: 'actions', label: 'Lifting out action items', color: 'golden' },
]
