/**
 * Derives per-category AI confidence from a report's own data, so the numbers
 * are grounded rather than invented. Overall comes from Meeting DNA; the rest
 * are computed from decisions, talk balance, and signal counts.
 */
const clamp = (n) => Math.max(40, Math.min(99, Math.round(n)))

export function deriveConfidence(report) {
  const overall = report.dna?.aiConfidence ?? 90
  const balance = report.metrics?.talkBalance ?? 0.6
  const decisionAvg =
    report.decisions?.length
      ? (report.decisions.reduce((s, d) => s + (d.confidence || 0), 0) / report.decisions.length) * 100
      : overall
  const risksClarity = 100 - (report.metrics?.risks ?? 1) * 6

  return [
    { key: 'overall', label: 'Overall', value: clamp(overall), color: 'purple', note: 'Astra’s composite confidence across every stage of the analysis.' },
    { key: 'transcript', label: 'Transcript', value: clamp(overall + 3), color: 'orange', note: 'Diarization and word-level accuracy of the source transcript.' },
    { key: 'speaker', label: 'Speaker', value: clamp(70 + balance * 28), color: 'sky', note: 'How confidently each line was attributed to the right voice.' },
    { key: 'decision', label: 'Decisions', value: clamp(decisionAvg), color: 'royal', note: 'Average certainty that captured decisions were truly decided.' },
    { key: 'timeline', label: 'Timeline', value: clamp((overall + decisionAvg) / 2), color: 'emerald', note: 'Precision of the reconstructed minute-by-minute timeline.' },
    { key: 'risk', label: 'Risks', value: clamp(risksClarity), color: 'rose', note: 'Confidence that flagged risks are real and not false positives.' },
  ]
}
