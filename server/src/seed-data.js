/**
 * Demo reports served when no database is connected. Keeps the API fully
 * explorable offline and mirrors the client's expected report shape.
 */
export const DEMO_REPORTS = [
  {
    id: 'q3-roadmap',
    title: 'Q3 Roadmap Alignment',
    subtitle: 'Product · Engineering · Design sync',
    date: '2026-07-08',
    duration: '74:12',
    color: 'royal',
    status: 'ready',
    sentiment: 'positive',
    participants: ['Maya O.', 'Daniel R.', 'Priya N.', 'Sam K.', 'Leo T.', 'Ada W.', 'Jun P.'],
    headline:
      'The room committed to shipping the billing rewrite before the enterprise pilot, with design owning the migration UX and two risks left open.',
    metrics: { decisions: 9, owners: 4, risks: 2, commitments: 3, talkBalance: 0.72 },
    decisions: [
      { text: 'Ship billing rewrite before the enterprise pilot', owner: 'Sam K.', at: '12:40', confidence: 0.94 },
      { text: 'Design owns the migration UX end-to-end', owner: 'Priya N.', at: '28:10', confidence: 0.88 },
    ],
    risks: [
      { text: 'Billing migration may slip the pilot date', level: 'high', at: '33:20' },
      { text: 'No owner named for data backfill', level: 'medium', at: '58:02' },
    ],
    commitments: [
      { text: 'Legal review of new terms', owner: 'Daniel R.', due: 'Fri', at: '49:12' },
      { text: 'Share pilot success metrics', owner: 'Maya O.', due: 'Mon', at: '61:30' },
    ],
    timeline: [
      { at: '12:40', label: 'Billing decision', color: 'royal', kind: 'decision' },
      { at: '33:20', label: 'Risk: date slip', color: 'rose', kind: 'risk' },
      { at: '49:12', label: 'Legal commitment', color: 'golden', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'Maya O.', pct: 24 },
      { name: 'Sam K.', pct: 21 },
      { name: 'Priya N.', pct: 18 },
      { name: 'Daniel R.', pct: 14 },
    ],
  },
]
