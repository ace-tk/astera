/**
 * Six curated demo meetings — the guided "experience everything in 20 seconds"
 * set. Each is fully populated (transcript-derived timeline, decisions, risks,
 * commitments, talk-time) and carries a Meeting DNA fingerprint. Shaped exactly
 * like every other report so the whole product works on them with zero special
 * casing. `demo: true` surfaces them in the Demo Workspace gallery.
 */

// Meeting DNA — six normalized traits that fingerprint a conversation.
// energyLabel is a human word; the rest are 0–100.
const dna = (o) => ({
  decisionDriven: 0,
  collaboration: 0,
  conflict: 0,
  energy: 0,
  energyLabel: 'Balanced',
  compliance: 0,
  aiConfidence: 0,
  ...o,
})

export const DEMO_MEETINGS = [
  {
    id: 'board-fy26',
    demo: true,
    category: 'Board',
    title: 'Board Meeting — FY26 Strategy',
    subtitle: 'Quarterly board session',
    date: '2026-07-09',
    duration: '92:40',
    color: 'royal',
    status: 'ready',
    sentiment: 'positive',
    participants: ['Chair', 'CEO', 'CFO', 'COO', 'Lead Investor', 'Independent Dir.'],
    headline:
      'The board approved the FY26 operating plan and a measured hiring ramp, greenlit the enterprise motion, and asked management to close one governance gap before the next session.',
    metrics: { decisions: 7, owners: 4, risks: 2, commitments: 3, talkBalance: 0.68 },
    dna: dna({ decisionDriven: 88, collaboration: 62, conflict: 22, energy: 71, energyLabel: 'Composed', compliance: 97, aiConfidence: 96 }),
    decisions: [
      { text: 'Approve the FY26 operating plan as presented', owner: 'CFO', at: '21:10', confidence: 0.96 },
      { text: 'Greenlight the enterprise go-to-market motion', owner: 'CEO', at: '44:30', confidence: 0.9 },
      { text: 'Cap headcount growth at 18% for the year', owner: 'COO', at: '58:15', confidence: 0.83 },
    ],
    risks: [
      { text: 'Runway assumes a Q3 raise that is not yet committed', level: 'high', at: '37:05' },
      { text: 'Audit committee charter has an unfilled independent seat', level: 'medium', at: '72:40' },
    ],
    commitments: [
      { text: 'Circulate updated cap table before next board', owner: 'CFO', due: 'Fri', at: '63:20' },
      { text: 'Recruit an independent audit-committee director', owner: 'Chair', due: 'Q3', at: '74:10' },
      { text: 'Deliver enterprise pipeline model', owner: 'CEO', due: 'Wed', at: '80:55' },
    ],
    timeline: [
      { at: '05:00', label: 'Chair opens the session', color: 'sky', kind: 'topic' },
      { at: '21:10', label: 'FY26 plan approved', color: 'royal', kind: 'decision' },
      { at: '37:05', label: 'Runway risk raised', color: 'rose', kind: 'risk' },
      { at: '44:30', label: 'Enterprise motion greenlit', color: 'royal', kind: 'decision' },
      { at: '63:20', label: 'Cap table commitment', color: 'golden', kind: 'commitment' },
      { at: '72:40', label: 'Governance gap flagged', color: 'rose', kind: 'risk' },
      { at: '88:00', label: 'Action review & close', color: 'emerald', kind: 'topic' },
    ],
    talkTime: [
      { name: 'CEO', pct: 26 }, { name: 'CFO', pct: 22 }, { name: 'Chair', pct: 18 },
      { name: 'Lead Investor', pct: 15 }, { name: 'COO', pct: 12 }, { name: 'Independent Dir.', pct: 7 },
    ],
  },
  {
    id: 'series-b',
    demo: true,
    category: 'Fundraising',
    title: 'Series B Investor Call',
    subtitle: 'Fundraising · Growth',
    date: '2026-07-07',
    duration: '54:18',
    color: 'purple',
    status: 'ready',
    sentiment: 'mixed',
    participants: ['Founder', 'Partner', 'Principal', 'CFO'],
    headline:
      'Strong conviction on the product and retention story; the partner pushed on CAC payback and asked for a data room before committing to terms.',
    metrics: { decisions: 4, owners: 2, risks: 2, commitments: 3, talkBalance: 0.59 },
    dna: dna({ decisionDriven: 66, collaboration: 70, conflict: 31, energy: 85, energyLabel: 'High', compliance: 78, aiConfidence: 92 }),
    decisions: [
      { text: 'Proceed to partial-term-sheet discussion', owner: 'Partner', at: '39:40', confidence: 0.79 },
      { text: 'Share a full data room this week', owner: 'Founder', at: '46:15', confidence: 0.88 },
    ],
    risks: [
      { text: 'CAC payback trending past 14 months', level: 'high', at: '22:30' },
      { text: 'Concentration risk — top account is 19% of ARR', level: 'medium', at: '31:10' },
    ],
    commitments: [
      { text: 'Open the data room', owner: 'Founder', due: 'Thu', at: '47:00' },
      { text: 'Provide cohort retention curves', owner: 'CFO', due: 'Fri', at: '48:20' },
      { text: 'Intro two customer references', owner: 'Founder', due: 'Mon', at: '50:05' },
    ],
    timeline: [
      { at: '02:30', label: 'Warm intro & context', color: 'sky', kind: 'topic' },
      { at: '14:00', label: 'Growth story', color: 'purple', kind: 'topic' },
      { at: '22:30', label: 'CAC payback pushback', color: 'rose', kind: 'risk' },
      { at: '31:10', label: 'Concentration risk', color: 'rose', kind: 'risk' },
      { at: '39:40', label: 'Move toward terms', color: 'royal', kind: 'decision' },
      { at: '47:00', label: 'Data room commitment', color: 'golden', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'Founder', pct: 41 }, { name: 'Partner', pct: 28 }, { name: 'Principal', pct: 18 }, { name: 'CFO', pct: 13 },
    ],
  },
  {
    id: 'finance-q2',
    demo: true,
    category: 'Finance',
    title: 'Quarterly Finance Review',
    subtitle: 'Finance · Operations',
    date: '2026-07-05',
    duration: '61:05',
    color: 'sky',
    status: 'ready',
    sentiment: 'positive',
    participants: ['CFO', 'Controller', 'FP&A Lead', 'Rev Ops', 'CEO'],
    headline:
      'Gross margin improved 3 points on infra savings; the team reforecast the year up modestly and approved a spend freeze on non-critical tooling.',
    metrics: { decisions: 5, owners: 3, risks: 1, commitments: 2, talkBalance: 0.63 },
    dna: dna({ decisionDriven: 80, collaboration: 55, conflict: 14, energy: 57, energyLabel: 'Measured', compliance: 98, aiConfidence: 94 }),
    decisions: [
      { text: 'Reforecast FY revenue up 4%', owner: 'FP&A Lead', at: '26:40', confidence: 0.91 },
      { text: 'Freeze non-critical SaaS tooling spend', owner: 'CFO', at: '41:20', confidence: 0.86 },
    ],
    risks: [{ text: 'Two enterprise renewals slipping into next quarter', level: 'medium', at: '33:50' }],
    commitments: [
      { text: 'Publish the updated forecast deck', owner: 'FP&A Lead', due: 'Tue', at: '52:10' },
      { text: 'Audit tooling contracts for savings', owner: 'Controller', due: 'Fri', at: '55:30' },
    ],
    timeline: [
      { at: '04:00', label: 'Quarter in review', color: 'sky', kind: 'topic' },
      { at: '18:15', label: 'Margin improvement', color: 'emerald', kind: 'topic' },
      { at: '26:40', label: 'Reforecast up 4%', color: 'royal', kind: 'decision' },
      { at: '33:50', label: 'Renewal timing risk', color: 'rose', kind: 'risk' },
      { at: '41:20', label: 'Spend freeze', color: 'royal', kind: 'decision' },
      { at: '52:10', label: 'Forecast deck commitment', color: 'golden', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'CFO', pct: 30 }, { name: 'FP&A Lead', pct: 26 }, { name: 'Controller', pct: 20 }, { name: 'Rev Ops', pct: 14 }, { name: 'CEO', pct: 10 },
    ],
  },
  {
    id: 'hiring-staff-eng',
    demo: true,
    category: 'People',
    title: 'Hiring Committee — Staff Engineer',
    subtitle: 'People · Hiring',
    date: '2026-07-04',
    duration: '38:22',
    color: 'emerald',
    status: 'ready',
    sentiment: 'mixed',
    participants: ['Hiring Mgr', 'Eng Lead', 'Bar Raiser', 'Recruiter'],
    headline:
      'Strong technical signal and system-design depth; the committee leaned to hire pending one follow-up on cross-team collaboration and a level calibration.',
    metrics: { decisions: 3, owners: 2, risks: 1, commitments: 2, talkBalance: 0.7 },
    dna: dna({ decisionDriven: 63, collaboration: 78, conflict: 27, energy: 66, energyLabel: 'Engaged', compliance: 90, aiConfidence: 89 }),
    decisions: [
      { text: 'Advance to offer at Staff level', owner: 'Hiring Mgr', at: '29:10', confidence: 0.78 },
      { text: 'Calibrate level with the panel before offer', owner: 'Bar Raiser', at: '31:40', confidence: 0.72 },
    ],
    risks: [{ text: 'Limited signal on cross-team collaboration', level: 'medium', at: '19:05' }],
    commitments: [
      { text: 'Schedule a collaboration-focused follow-up', owner: 'Recruiter', due: 'Wed', at: '33:00' },
      { text: 'Draft the offer package', owner: 'Hiring Mgr', due: 'Thu', at: '35:20' },
    ],
    timeline: [
      { at: '02:00', label: 'Candidate overview', color: 'sky', kind: 'topic' },
      { at: '11:30', label: 'System design debrief', color: 'purple', kind: 'topic' },
      { at: '19:05', label: 'Collaboration concern', color: 'rose', kind: 'risk' },
      { at: '29:10', label: 'Lean to hire', color: 'royal', kind: 'decision' },
      { at: '33:00', label: 'Follow-up commitment', color: 'golden', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'Eng Lead', pct: 32 }, { name: 'Hiring Mgr', pct: 28 }, { name: 'Bar Raiser', pct: 24 }, { name: 'Recruiter', pct: 16 },
    ],
  },
  {
    id: 'legal-dpa',
    demo: true,
    category: 'Legal',
    title: 'Legal & Compliance Review',
    subtitle: 'Legal · Risk',
    date: '2026-07-02',
    duration: '45:50',
    color: 'golden',
    status: 'ready',
    sentiment: 'mixed',
    participants: ['General Counsel', 'DPO', 'Security Lead', 'Sales Dir.'],
    headline:
      'The DPA is close, but a sub-processor disclosure and a data-retention clause must be resolved before signature; SOC 2 evidence was accepted.',
    metrics: { decisions: 4, owners: 3, risks: 2, commitments: 3, talkBalance: 0.6 },
    dna: dna({ decisionDriven: 71, collaboration: 58, conflict: 24, energy: 52, energyLabel: 'Deliberate', compliance: 99, aiConfidence: 93 }),
    decisions: [
      { text: 'Accept SOC 2 Type II as sufficient evidence', owner: 'Security Lead', at: '17:40', confidence: 0.9 },
      { text: 'Redline the data-retention clause to 30 days', owner: 'General Counsel', at: '33:15', confidence: 0.82 },
    ],
    risks: [
      { text: 'Undisclosed sub-processor in the DPA annex', level: 'high', at: '24:20' },
      { text: 'Retention terms exceed customer policy', level: 'medium', at: '31:00' },
    ],
    commitments: [
      { text: 'Publish the sub-processor list', owner: 'DPO', due: 'Fri', at: '38:10' },
      { text: 'Send redlined DPA', owner: 'General Counsel', due: 'Mon', at: '40:30' },
      { text: 'Confirm data-residency region', owner: 'Security Lead', due: 'Wed', at: '42:15' },
    ],
    timeline: [
      { at: '03:30', label: 'Scope of review', color: 'sky', kind: 'topic' },
      { at: '17:40', label: 'SOC 2 accepted', color: 'royal', kind: 'decision' },
      { at: '24:20', label: 'Sub-processor risk', color: 'rose', kind: 'risk' },
      { at: '33:15', label: 'Retention redline', color: 'royal', kind: 'decision' },
      { at: '38:10', label: 'Disclosure commitment', color: 'golden', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'General Counsel', pct: 34 }, { name: 'DPO', pct: 26 }, { name: 'Security Lead', pct: 24 }, { name: 'Sales Dir.', pct: 16 },
    ],
  },
  {
    id: 'marketing-launch',
    demo: true,
    category: 'Marketing',
    title: 'Marketing Launch Planning',
    subtitle: 'Marketing · GTM',
    date: '2026-06-30',
    duration: '50:12',
    color: 'coral',
    status: 'ready',
    sentiment: 'positive',
    participants: ['CMO', 'Brand Lead', 'Growth Lead', 'PR', 'Design'],
    headline:
      'The team locked the launch date, chose the hero narrative, and committed to a Product Hunt push — with one dependency on final pricing.',
    metrics: { decisions: 6, owners: 4, risks: 1, commitments: 3, talkBalance: 0.75 },
    dna: dna({ decisionDriven: 77, collaboration: 84, conflict: 15, energy: 88, energyLabel: 'High', compliance: 82, aiConfidence: 91 }),
    decisions: [
      { text: 'Lock the launch for the last week of the month', owner: 'CMO', at: '12:00', confidence: 0.92 },
      { text: 'Lead with the "conversations to clarity" narrative', owner: 'Brand Lead', at: '23:30', confidence: 0.88 },
      { text: 'Run a Product Hunt launch day', owner: 'Growth Lead', at: '34:10', confidence: 0.85 },
    ],
    risks: [{ text: 'Launch date depends on final pricing sign-off', level: 'medium', at: '28:45' }],
    commitments: [
      { text: 'Finalize the hero film', owner: 'Design', due: 'Fri', at: '41:00' },
      { text: 'Line up launch-day hunters', owner: 'Growth Lead', due: 'Wed', at: '44:20' },
      { text: 'Draft the press kit', owner: 'PR', due: 'Thu', at: '46:50' },
    ],
    timeline: [
      { at: '03:00', label: 'Launch goals', color: 'sky', kind: 'topic' },
      { at: '12:00', label: 'Date locked', color: 'royal', kind: 'decision' },
      { at: '23:30', label: 'Narrative chosen', color: 'purple', kind: 'decision' },
      { at: '28:45', label: 'Pricing dependency', color: 'rose', kind: 'risk' },
      { at: '34:10', label: 'Product Hunt go', color: 'royal', kind: 'decision' },
      { at: '41:00', label: 'Hero film commitment', color: 'golden', kind: 'commitment' },
    ],
    talkTime: [
      { name: 'CMO', pct: 27 }, { name: 'Brand Lead', pct: 22 }, { name: 'Growth Lead', pct: 21 }, { name: 'PR', pct: 16 }, { name: 'Design', pct: 14 },
    ],
  },
]

// DNA fingerprints for the three original reports so every meeting has one.
export const BASE_DNA = {
  'q3-roadmap': dna({ decisionDriven: 82, collaboration: 74, conflict: 18, energy: 76, energyLabel: 'High', compliance: 91, aiConfidence: 95 }),
  'design-crit': dna({ decisionDriven: 61, collaboration: 80, conflict: 34, energy: 68, energyLabel: 'Focused', compliance: 72, aiConfidence: 88 }),
  'customer-ledgerly': dna({ decisionDriven: 70, collaboration: 58, conflict: 12, energy: 64, energyLabel: 'Warm', compliance: 84, aiConfidence: 90 }),
}

// The six DNA traits, in display order, with their semantic colors.
export const DNA_TRAITS = [
  { key: 'decisionDriven', label: 'Decision Driven', color: 'royal' },
  { key: 'collaboration', label: 'Collaboration', color: 'emerald' },
  { key: 'energy', label: 'Energy', color: 'coral', labelKey: 'energyLabel' },
  { key: 'compliance', label: 'Compliance', color: 'golden' },
  { key: 'aiConfidence', label: 'Confidence', color: 'purple' },
  { key: 'conflict', label: 'Conflict', color: 'rose', invert: true },
]
