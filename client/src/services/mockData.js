/**
 * Demo data powering the app shell without a live backend. Shaped exactly like
 * the server's report model so swapping to the real API is a one-line change
 * in services/reports.js. Deterministic — no random values.
 */
import { DEMO_MEETINGS, BASE_DNA } from '@/constants/demoMeetings'

const BASE_REPORTS = [
  {
    id: 'q3-roadmap',
    title: 'Q3 Roadmap Alignment',
    subtitle: 'Product · Engineering · Design sync',
    date: '2026-07-08',
    duration: '74:12',
    participants: ['Maya O.', 'Daniel R.', 'Priya N.', 'Sam K.', 'Leo T.', 'Ada W.', 'Jun P.'],
    color: 'royal',
    status: 'ready',
    sentiment: 'positive',
    headline:
      'The room committed to shipping the billing rewrite before the enterprise pilot, with design owning the migration UX and two risks left open.',
    metrics: { decisions: 9, owners: 4, risks: 2, commitments: 3, talkBalance: 0.72 },
    decisions: [
      { text: 'Ship billing rewrite before the enterprise pilot', owner: 'Sam K.', at: '12:40', confidence: 0.94 },
      { text: 'Design owns the migration UX end-to-end', owner: 'Priya N.', at: '28:10', confidence: 0.88 },
      { text: 'Freeze new integrations until pilot ships', owner: 'Leo T.', at: '41:55', confidence: 0.81 },
    ],
    risks: [
      { text: 'Billing migration may slip the pilot date', level: 'high', at: '33:20' },
      { text: 'No owner named for data backfill', level: 'medium', at: '58:02' },
    ],
    commitments: [
      { text: 'Legal review of new terms', owner: 'Daniel R.', due: 'Fri', at: '49:12' },
      { text: 'Share pilot success metrics', owner: 'Maya O.', due: 'Mon', at: '61:30' },
      { text: 'Draft migration comms', owner: 'Ada W.', due: 'Wed', at: '66:44' },
    ],
    timeline: [
      { at: '04:20', label: 'Framing the quarter', color: 'coral', kind: 'topic' },
      { at: '12:40', label: 'Billing decision', color: 'royal', kind: 'decision' },
      { at: '28:10', label: 'Design takes migration', color: 'purple', kind: 'decision' },
      { at: '33:20', label: 'Risk: date slip', color: 'rose', kind: 'risk' },
      { at: '49:12', label: 'Legal commitment', color: 'golden', kind: 'commitment' },
      { at: '61:30', label: 'Metrics agreed', color: 'emerald', kind: 'topic' },
      { at: '70:05', label: 'Wrap & next steps', color: 'sky', kind: 'topic' },
    ],
    talkTime: [
      { name: 'Maya O.', pct: 24 },
      { name: 'Sam K.', pct: 21 },
      { name: 'Priya N.', pct: 18 },
      { name: 'Daniel R.', pct: 14 },
      { name: 'Leo T.', pct: 11 },
      { name: 'Ada W.', pct: 7 },
      { name: 'Jun P.', pct: 5 },
    ],
  },
  {
    id: 'design-crit',
    title: 'Design Critique — Report Studio',
    subtitle: 'Weekly design review',
    date: '2026-07-06',
    duration: '48:33',
    participants: ['Priya N.', 'Ada W.', 'Leo T.', 'Maya O.'],
    color: 'purple',
    status: 'ready',
    sentiment: 'mixed',
    headline:
      'Strong direction on the editorial report layout; open debate on theme density and one accessibility concern flagged for contrast.',
    metrics: { decisions: 5, owners: 3, risks: 1, commitments: 2, talkBalance: 0.61 },
    decisions: [
      { text: 'Adopt the editorial bento for feature grid', owner: 'Ada W.', at: '09:15', confidence: 0.9 },
      { text: 'Keep six themes, cut the seventh', owner: 'Priya N.', at: '22:40', confidence: 0.77 },
    ],
    risks: [{ text: 'Golden-on-white contrast may fail WCAG AA', level: 'medium', at: '31:10' }],
    commitments: [
      { text: 'Run contrast audit across themes', owner: 'Leo T.', due: 'Thu', at: '33:00' },
      { text: 'Prototype scrubbable timeline', owner: 'Ada W.', due: 'Tue', at: '40:20' },
    ],
    timeline: [
      { at: '02:10', label: 'Recap last week', color: 'sky', kind: 'topic' },
      { at: '09:15', label: 'Bento adopted', color: 'purple', kind: 'decision' },
      { at: '22:40', label: 'Theme count debate', color: 'orange', kind: 'topic' },
      { at: '31:10', label: 'Contrast risk', color: 'rose', kind: 'risk' },
      { at: '40:20', label: 'Timeline prototype', color: 'emerald', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'Priya N.', pct: 34 },
      { name: 'Ada W.', pct: 28 },
      { name: 'Leo T.', pct: 22 },
      { name: 'Maya O.', pct: 16 },
    ],
  },
  {
    id: 'customer-ledgerly',
    title: 'Customer Call — Ledgerly',
    subtitle: 'Renewal & expansion',
    date: '2026-07-03',
    duration: '39:07',
    participants: ['Maya O.', 'Daniel R.', 'Ledgerly team'],
    color: 'emerald',
    status: 'ready',
    sentiment: 'positive',
    headline:
      'Ledgerly is expanding to three teams and renewing early; one compliance commitment must be honored before signature.',
    metrics: { decisions: 4, owners: 2, risks: 1, commitments: 2, talkBalance: 0.55 },
    decisions: [
      { text: 'Expand to 3 teams on Scale plan', owner: 'Maya O.', at: '15:30', confidence: 0.92 },
    ],
    risks: [{ text: 'Data residency requirement unconfirmed', level: 'high', at: '24:45' }],
    commitments: [
      { text: 'Confirm EU data residency', owner: 'Daniel R.', due: 'Mon', at: '25:10' },
      { text: 'Send expansion quote', owner: 'Maya O.', due: 'Today', at: '35:40' },
    ],
    timeline: [
      { at: '03:00', label: 'Health check', color: 'emerald', kind: 'topic' },
      { at: '15:30', label: 'Expansion decision', color: 'royal', kind: 'decision' },
      { at: '24:45', label: 'Residency risk', color: 'rose', kind: 'risk' },
      { at: '35:40', label: 'Quote commitment', color: 'golden', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'Maya O.', pct: 30 },
      { name: 'Daniel R.', pct: 25 },
      { name: 'Ledgerly team', pct: 45 },
    ],
  },
]

// Attach a DNA fingerprint to the three originals, then place the curated demo
// meetings first so they lead the Reports list and the Demo Workspace gallery.
const WITH_DNA = BASE_REPORTS.map((r) => ({ ...r, dna: BASE_DNA[r.id], category: r.category || 'Internal' }))

export const REPORTS = [...DEMO_MEETINGS, ...WITH_DNA]

export const getReports = () => REPORTS
export const getReport = (id) => REPORTS.find((r) => r.id === id) || REPORTS[0]
export const getDemoMeetings = () => REPORTS.filter((r) => r.demo)

// The full set of seeded demo ids. Used to keep the demo showcase reachable by
// id even for a signed-in user, without ever mixing demo data into their own list.
export const DEMO_IDS = new Set(REPORTS.map((r) => r.id))
export const isDemoId = (id) => DEMO_IDS.has(id)

export const WORKSPACE_ANALYTICS = {
  totalReports: 38,
  totalMinutes: 2714,
  decisionsCaptured: 214,
  followThrough: 0.87,
  weekly: [
    { week: 'W1', reports: 4, decisions: 18 },
    { week: 'W2', reports: 6, decisions: 27 },
    { week: 'W3', reports: 5, decisions: 22 },
    { week: 'W4', reports: 8, decisions: 41 },
    { week: 'W5', reports: 7, decisions: 33 },
    { week: 'W6', reports: 8, decisions: 39 },
  ],
  distribution: [
    { name: 'Decisions', value: 214, color: 'royal' },
    { name: 'Risks', value: 61, color: 'rose' },
    { name: 'Commitments', value: 128, color: 'golden' },
    { name: 'Follow-ups', value: 96, color: 'emerald' },
  ],
}
