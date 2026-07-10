/**
 * Expands a structured report into readable, magazine-style sections for the
 * Reading Mode. Prose is composed from the report's own data so the reader
 * always reflects the actual meeting.
 */
export function buildSections(report) {
  const names = report.participants
  const nameList =
    names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      kind: 'overview',
      paragraphs: [
        report.headline,
        `The conversation ran ${report.duration} across ${names.length} voices — including ${nameList} — and Astera captured ${report.metrics.decisions} decisions, ${report.metrics.commitments} commitments, and ${report.metrics.risks} risks, each cited back to the moment it was said.`,
      ],
    },
    {
      id: 'decisions',
      title: 'Decisions',
      kind: 'decisions',
      paragraphs: [
        `The room reached ${report.decisions.length} decisions worth recording. Confidence reflects how firmly the group converged.`,
      ],
      items: report.decisions.map((d) => ({
        lead: d.text,
        meta: `${d.owner} · ${d.at} · ${Math.round(d.confidence * 100)}% confidence`,
        color: 'royal',
      })),
    },
    {
      id: 'risks',
      title: 'Risks',
      kind: 'risks',
      paragraphs: [
        report.risks.length
          ? `Astera surfaced ${report.risks.length} risks — the quiet red flags the room may have skated past.`
          : 'No material risks were detected in this conversation.',
      ],
      items: report.risks.map((r) => ({
        lead: r.text,
        meta: `${r.level} risk · ${r.at}`,
        color: r.level === 'high' ? 'rose' : 'orange',
      })),
    },
    {
      id: 'actions',
      title: 'Action items',
      kind: 'actions',
      paragraphs: [`${report.commitments.length} commitments were made on the record. Astera keeps watch until each is closed.`],
      items: report.commitments.map((c) => ({
        lead: c.text,
        meta: `${c.owner} · due ${c.due} · ${c.at}`,
        color: 'golden',
      })),
    },
    {
      id: 'room',
      title: 'The room',
      kind: 'room',
      paragraphs: [
        `Airtime was ${report.metrics.talkBalance >= 0.7 ? 'well distributed' : 'concentrated among a few voices'}. Here is how the ${report.talkTime.length} participants split the conversation.`,
      ],
      bars: report.talkTime,
    },
    {
      id: 'closing',
      title: 'Closing',
      kind: 'closing',
      paragraphs: [
        `That’s ${report.title} — from a ${report.duration} conversation to a report your whole team can read in ninety seconds. From conversations to clarity.`,
      ],
    },
  ]

  return sections
}
