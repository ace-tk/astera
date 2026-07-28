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

const CURATED_MEETINGS = [
  {
    id: 'board-fy26',
    demo: true,
    category: 'Premium',
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
    category: 'Scope',
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
    category: 'Essential',
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
    category: 'Speaker Analysis',
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
    category: 'Compliance',
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
    category: 'Scope',
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

// Baseline Meeting DNA per report category — a sensible fingerprint for each
// tier, so every generated demo still "feels" like its category at a glance.
const CATEGORY_DNA = {
  Essential: { decisionDriven: 60, collaboration: 60, conflict: 20, energy: 55, energyLabel: 'Steady', compliance: 70, aiConfidence: 85 },
  Scope: { decisionDriven: 70, collaboration: 65, conflict: 25, energy: 65, energyLabel: 'Focused', compliance: 75, aiConfidence: 88 },
  Premium: { decisionDriven: 85, collaboration: 70, conflict: 20, energy: 75, energyLabel: 'Composed', compliance: 92, aiConfidence: 95 },
  'Speaker Analysis': { decisionDriven: 55, collaboration: 82, conflict: 28, energy: 78, energyLabel: 'Dynamic', compliance: 80, aiConfidence: 90 },
  Compliance: { decisionDriven: 75, collaboration: 60, conflict: 22, energy: 50, energyLabel: 'Deliberate', compliance: 98, aiConfidence: 94 },
}

/**
 * Builds a fully-populated demo report from a compact spec — metrics,
 * timeline, and DNA are all derived so each of the ~25 category demos stays
 * internally consistent (and renders through the exact same Report/ReportCard/
 * Replay/Reader components as every hand-authored meeting) without hand-typing
 * every redundant nested field.
 */
function buildDemo({ id, category, title, subtitle, date, duration, color, sentiment = 'positive', participants, headline, decisions, risks, commitments, talkTime }) {
  const metrics = {
    decisions: decisions.length,
    owners: new Set(decisions.map((d) => d.owner)).size,
    risks: risks.length,
    commitments: commitments.length,
    talkBalance: Math.round(Math.max(...talkTime.map((t) => t.pct))) / 100,
  }
  const timeline = [
    ...decisions.map((d) => ({ at: d.at, label: d.text.slice(0, 32), color: 'royal', kind: 'decision' })),
    ...risks.map((r) => ({ at: r.at, label: r.text.slice(0, 32), color: 'rose', kind: 'risk' })),
    ...commitments.map((c) => ({ at: c.at, label: c.text.slice(0, 32), color: 'golden', kind: 'commitment' })),
  ].sort((a, b) => a.at.localeCompare(b.at))

  return {
    id, demo: true, category, title, subtitle, date, duration, color, status: 'ready', sentiment,
    participants, headline, metrics, dna: dna(CATEGORY_DNA[category]), decisions, risks, commitments, timeline, talkTime,
  }
}

// ~4 additional demos per category (plus the curated meeting already retagged
// into it above) so every category lands at "approximately five."
const GENERATED_MEETINGS = [
  // Essential — everyday, routine team meetings.
  buildDemo({
    id: 'essential-weekly-standup', category: 'Essential', title: 'Weekly Team Standup', subtitle: 'Engineering · Sync',
    date: '2026-06-29', duration: '18:40', color: 'sky', participants: ['Eng Lead', 'Dev A', 'Dev B', 'QA Lead'],
    headline: 'Sprint is on track; one blocker on the payments integration was reassigned and QA signed off on last week’s release.',
    decisions: [{ text: 'Reassign payments integration to Dev B', owner: 'Eng Lead', at: '06:10', confidence: 0.85 }],
    risks: [{ text: 'Third-party sandbox downtime may delay testing', level: 'low', at: '11:20' }],
    commitments: [{ text: 'Post updated sprint board', owner: 'Eng Lead', due: 'Today', at: '15:00' }],
    talkTime: [{ name: 'Eng Lead', pct: 40 }, { name: 'Dev A', pct: 22 }, { name: 'Dev B', pct: 22 }, { name: 'QA Lead', pct: 16 }],
  }),
  buildDemo({
    id: 'essential-ops-review', category: 'Essential', title: 'Monthly Ops Review', subtitle: 'Operations · Standing meeting',
    date: '2026-06-27', duration: '32:05', color: 'emerald', participants: ['Ops Mgr', 'Support Lead', 'Logistics'],
    headline: 'Ticket backlog cleared to target; logistics flagged a recurring shipping delay for one region.',
    decisions: [{ text: 'Keep support SLA at 4 hours for the next quarter', owner: 'Ops Mgr', at: '09:30', confidence: 0.88 }],
    risks: [{ text: 'Regional carrier delays affecting 8% of orders', level: 'medium', at: '18:45' }],
    commitments: [{ text: 'Escalate carrier issue to account rep', owner: 'Logistics', due: 'Wed', at: '24:10' }],
    talkTime: [{ name: 'Ops Mgr', pct: 38 }, { name: 'Support Lead', pct: 34 }, { name: 'Logistics', pct: 28 }],
  }),
  buildDemo({
    id: 'essential-customer-checkin', category: 'Essential', title: 'Customer Check-in — Northwind', subtitle: 'Account · Routine call',
    date: '2026-06-25', duration: '22:15', color: 'coral', participants: ['Account Mgr', 'Northwind Lead'],
    headline: 'Northwind is happy with onboarding progress; a minor reporting request was logged for the next release.',
    decisions: [{ text: 'Add the request to the Q3 feature backlog', owner: 'Account Mgr', at: '14:00', confidence: 0.8 }],
    risks: [{ text: 'No dedicated admin assigned on Northwind’s side yet', level: 'low', at: '17:30' }],
    commitments: [{ text: 'Send onboarding progress summary', owner: 'Account Mgr', due: 'Fri', at: '20:00' }],
    talkTime: [{ name: 'Account Mgr', pct: 45 }, { name: 'Northwind Lead', pct: 55 }],
  }),
  buildDemo({
    id: 'essential-content-planning', category: 'Essential', title: 'Content Calendar Planning', subtitle: 'Marketing · Weekly',
    date: '2026-06-23', duration: '26:50', color: 'golden', participants: ['Content Lead', 'Writer', 'Designer'],
    headline: 'Next month’s content calendar locked; one piece needs design support ahead of schedule.',
    decisions: [{ text: 'Publish the case study before the product update', owner: 'Content Lead', at: '10:15', confidence: 0.83 }],
    risks: [{ text: 'Designer bandwidth tight the week of launch', level: 'low', at: '19:00' }],
    commitments: [{ text: 'Draft the case study outline', owner: 'Writer', due: 'Tue', at: '22:30' }],
    talkTime: [{ name: 'Content Lead', pct: 42 }, { name: 'Writer', pct: 30 }, { name: 'Designer', pct: 28 }],
  }),

  // Scope — planning, kickoffs, and scoping conversations.
  buildDemo({
    id: 'scope-project-kickoff', category: 'Scope', title: 'Project Kickoff — Analytics Rebuild', subtitle: 'Engineering · Scoping',
    date: '2026-06-28', duration: '41:20', color: 'purple', participants: ['PM', 'Tech Lead', 'Design Lead', 'Stakeholder'],
    headline: 'Scope locked to core dashboards for phase one; real-time alerting pushed to phase two.',
    decisions: [
      { text: 'Phase one covers dashboards only, not alerting', owner: 'PM', at: '12:20', confidence: 0.9 },
      { text: 'Target an 8-week delivery window', owner: 'Tech Lead', at: '24:00', confidence: 0.82 },
    ],
    risks: [{ text: 'Data warehouse migration is a hard dependency', level: 'medium', at: '19:40' }],
    commitments: [{ text: 'Circulate the phase-one scope doc', owner: 'PM', due: 'Thu', at: '35:10' }],
    talkTime: [{ name: 'PM', pct: 32 }, { name: 'Tech Lead', pct: 28 }, { name: 'Design Lead', pct: 22 }, { name: 'Stakeholder', pct: 18 }],
  }),
  buildDemo({
    id: 'scope-vendor-evaluation', category: 'Scope', title: 'Vendor Evaluation — CRM Migration', subtitle: 'Ops · Scoping call',
    date: '2026-06-24', duration: '35:00', color: 'sky', participants: ['Ops Lead', 'IT Lead', 'Vendor Rep'],
    headline: 'Shortlist narrowed to two vendors; migration scope will exclude legacy custom fields for now.',
    decisions: [{ text: 'Exclude legacy custom fields from migration scope', owner: 'IT Lead', at: '14:30', confidence: 0.79 }],
    risks: [{ text: 'Vendor SLA unclear on data export timelines', level: 'medium', at: '21:15' }],
    commitments: [{ text: 'Request a formal SLA document', owner: 'Ops Lead', due: 'Mon', at: '28:00' }],
    talkTime: [{ name: 'Ops Lead', pct: 36 }, { name: 'IT Lead', pct: 34 }, { name: 'Vendor Rep', pct: 30 }],
  }),
  buildDemo({
    id: 'scope-platform-migration', category: 'Scope', title: 'Platform Migration Planning', subtitle: 'Engineering · Scoping',
    date: '2026-06-20', duration: '46:10', color: 'royal', participants: ['Eng Director', 'SRE Lead', 'Backend Lead'],
    headline: 'Migration scoped to non-critical services first; a rollback plan is required before the critical path moves.',
    decisions: [
      { text: 'Migrate non-critical services in wave one', owner: 'SRE Lead', at: '16:00', confidence: 0.86 },
      { text: 'Require a rollback plan before wave two', owner: 'Eng Director', at: '29:40', confidence: 0.9 },
    ],
    risks: [{ text: 'No load-testing environment for wave two yet', level: 'high', at: '33:20' }],
    commitments: [{ text: 'Stand up a load-testing environment', owner: 'Backend Lead', due: 'Fri', at: '40:00' }],
    talkTime: [{ name: 'Eng Director', pct: 30 }, { name: 'SRE Lead', pct: 38 }, { name: 'Backend Lead', pct: 32 }],
  }),

  // Premium — high-stakes, executive / strategic meetings.
  buildDemo({
    id: 'premium-exec-offsite', category: 'Premium', title: 'Executive Offsite — Annual Strategy', subtitle: 'Leadership · Strategic',
    date: '2026-06-30', duration: '98:30', color: 'royal', participants: ['CEO', 'CFO', 'CTO', 'CMO', 'COO', 'VP People'],
    headline: 'Leadership aligned on three strategic bets for next year and agreed a hiring plan tied to enterprise growth.',
    decisions: [
      { text: 'Commit to three strategic bets for next year', owner: 'CEO', at: '24:00', confidence: 0.93 },
      { text: 'Tie hiring plan to enterprise pipeline milestones', owner: 'COO', at: '52:10', confidence: 0.87 },
      { text: 'Increase R&D budget allocation by 12%', owner: 'CFO', at: '71:45', confidence: 0.84 },
    ],
    risks: [
      { text: 'Enterprise pipeline assumptions are unvalidated', level: 'high', at: '48:00' },
      { text: 'Hiring plan depends on an unclosed funding round', level: 'medium', at: '80:15' },
    ],
    commitments: [
      { text: 'Validate enterprise pipeline with sales', owner: 'CMO', due: 'Two weeks', at: '85:00' },
      { text: 'Present the finalized hiring plan', owner: 'VP People', due: 'Q3', at: '90:20' },
    ],
    talkTime: [{ name: 'CEO', pct: 24 }, { name: 'CFO', pct: 18 }, { name: 'CTO', pct: 16 }, { name: 'CMO', pct: 16 }, { name: 'COO', pct: 14 }, { name: 'VP People', pct: 12 }],
  }),
  buildDemo({
    id: 'premium-partnership-review', category: 'Premium', title: 'Strategic Partnership Review', subtitle: 'Leadership · Partnerships',
    date: '2026-06-22', duration: '58:40', color: 'purple', participants: ['CEO', 'VP Partnerships', 'Legal Counsel', 'Partner Exec'],
    headline: 'Both sides agreed to expand the partnership into a new region, pending a joint compliance review.',
    decisions: [
      { text: 'Expand the partnership into APAC', owner: 'CEO', at: '19:30', confidence: 0.88 },
      { text: 'Require a joint compliance review before launch', owner: 'Legal Counsel', at: '38:00', confidence: 0.91 },
    ],
    risks: [{ text: 'Regional compliance requirements not yet mapped', level: 'high', at: '41:20' }],
    commitments: [{ text: 'Schedule the joint compliance review', owner: 'VP Partnerships', due: 'Two weeks', at: '50:10' }],
    talkTime: [{ name: 'CEO', pct: 28 }, { name: 'VP Partnerships', pct: 26 }, { name: 'Legal Counsel', pct: 24 }, { name: 'Partner Exec', pct: 22 }],
  }),
  buildDemo({
    id: 'premium-annual-planning', category: 'Premium', title: 'Annual Budget Planning', subtitle: 'Leadership · Finance',
    date: '2026-06-18', duration: '76:15', color: 'golden', participants: ['CEO', 'CFO', 'VP Eng', 'VP Sales'],
    headline: 'Budget approved with a growth-weighted split; sales gets the largest increase tied to new-market targets.',
    decisions: [
      { text: 'Approve the annual budget as revised', owner: 'CFO', at: '31:00', confidence: 0.92 },
      { text: 'Weight the sales budget toward new-market targets', owner: 'CEO', at: '55:20', confidence: 0.85 },
    ],
    risks: [{ text: 'New-market targets assume regulatory approval not yet granted', level: 'high', at: '60:40' }],
    commitments: [{ text: 'Confirm regulatory timeline with legal', owner: 'VP Sales', due: 'Mon', at: '68:00' }],
    talkTime: [{ name: 'CEO', pct: 26 }, { name: 'CFO', pct: 30 }, { name: 'VP Eng', pct: 22 }, { name: 'VP Sales', pct: 22 }],
  }),
  buildDemo({
    id: 'premium-ma-review', category: 'Premium', title: 'M&A Diligence Review', subtitle: 'Leadership · Corporate development',
    date: '2026-06-15', duration: '84:50', color: 'sky', participants: ['CEO', 'CFO', 'Corp Dev Lead', 'Outside Counsel'],
    headline: 'Diligence surfaced a manageable IP concern; the deal advances to final terms pending its resolution.',
    decisions: [{ text: 'Advance to final terms pending IP resolution', owner: 'CEO', at: '42:00', confidence: 0.8 }],
    risks: [{ text: 'Target’s IP assignment records are incomplete', level: 'high', at: '35:10' }],
    commitments: [{ text: 'Request full IP assignment records', owner: 'Outside Counsel', due: 'This week', at: '50:30' }],
    talkTime: [{ name: 'CEO', pct: 24 }, { name: 'CFO', pct: 22 }, { name: 'Corp Dev Lead', pct: 30 }, { name: 'Outside Counsel', pct: 24 }],
  }),

  // Speaker Analysis — meetings where speaker balance/dynamics are the story.
  buildDemo({
    id: 'speaker-allhands-qna', category: 'Speaker Analysis', title: 'All-Hands Q&A', subtitle: 'Company-wide · Open floor',
    date: '2026-06-26', duration: '44:00', color: 'coral', participants: ['CEO', 'Employee A', 'Employee B', 'Employee C', 'Employee D'],
    headline: 'Broad participation across the floor; questions on the return-to-office policy drove the longest discussion.',
    decisions: [{ text: 'Publish a written FAQ on return-to-office', owner: 'CEO', at: '22:00', confidence: 0.82 }],
    risks: [{ text: 'Sentiment on the policy is split across teams', level: 'medium', at: '18:30' }],
    commitments: [{ text: 'Publish the return-to-office FAQ', owner: 'CEO', due: 'Fri', at: '30:00' }],
    talkTime: [{ name: 'CEO', pct: 30 }, { name: 'Employee A', pct: 20 }, { name: 'Employee B', pct: 18 }, { name: 'Employee C', pct: 17 }, { name: 'Employee D', pct: 15 }],
  }),
  buildDemo({
    id: 'speaker-panel-review', category: 'Speaker Analysis', title: 'Hiring Panel — Engineering Manager', subtitle: 'People · Panel debrief',
    date: '2026-06-19', duration: '35:30', color: 'emerald', participants: ['Hiring Mgr', 'Panelist A', 'Panelist B', 'Panelist C'],
    headline: 'Panel was split on leadership signal; one panelist’s concerns dominated the debrief and warrant a follow-up.',
    decisions: [{ text: 'Schedule a follow-up leadership exercise', owner: 'Hiring Mgr', at: '20:00', confidence: 0.75 }],
    risks: [{ text: 'One panelist’s objection wasn’t fully resolved', level: 'medium', at: '24:15' }],
    commitments: [{ text: 'Schedule the follow-up exercise', owner: 'Hiring Mgr', due: 'Wed', at: '28:40' }],
    talkTime: [{ name: 'Panelist A', pct: 38 }, { name: 'Hiring Mgr', pct: 24 }, { name: 'Panelist B', pct: 20 }, { name: 'Panelist C', pct: 18 }],
  }),
  buildDemo({
    id: 'speaker-town-hall', category: 'Speaker Analysis', title: 'Regional Town Hall', subtitle: 'People · Open discussion',
    date: '2026-06-14', duration: '52:20', color: 'purple', participants: ['Regional Dir.', 'Team Lead A', 'Team Lead B', 'Team Lead C'],
    headline: 'Discussion was well-balanced across regional leads; one team lead raised a staffing concern needing follow-up.',
    decisions: [{ text: 'Review staffing levels for the understaffed team', owner: 'Regional Dir.', at: '30:00', confidence: 0.81 }],
    risks: [{ text: 'One team reports being understaffed for its workload', level: 'medium', at: '27:10' }],
    commitments: [{ text: 'Review staffing levels', owner: 'Regional Dir.', due: 'Two weeks', at: '40:00' }],
    talkTime: [{ name: 'Regional Dir.', pct: 26 }, { name: 'Team Lead A', pct: 25 }, { name: 'Team Lead B', pct: 25 }, { name: 'Team Lead C', pct: 24 }],
  }),
  buildDemo({
    id: 'speaker-customer-panel', category: 'Speaker Analysis', title: 'Customer Advisory Panel', subtitle: 'Product · Panel session',
    date: '2026-06-11', duration: '48:15', color: 'golden', participants: ['Product Lead', 'Customer A', 'Customer B', 'Customer C'],
    headline: 'Customers were vocal and evenly heard; a shared request for better export tools emerged as the clearest signal.',
    decisions: [{ text: 'Prioritize export tooling for next quarter', owner: 'Product Lead', at: '26:00', confidence: 0.87 }],
    risks: [{ text: 'Feature request may conflict with current roadmap', level: 'low', at: '32:00' }],
    commitments: [{ text: 'Share a prioritized roadmap update', owner: 'Product Lead', due: 'Mon', at: '42:00' }],
    talkTime: [{ name: 'Product Lead', pct: 22 }, { name: 'Customer A', pct: 27 }, { name: 'Customer B', pct: 26 }, { name: 'Customer C', pct: 25 }],
  }),

  // Compliance — legal, regulatory, audit, and security reviews.
  buildDemo({
    id: 'compliance-soc2-renewal', category: 'Compliance', title: 'SOC 2 Renewal Readiness', subtitle: 'Security · Audit prep',
    date: '2026-06-21', duration: '39:40', color: 'golden', participants: ['Security Lead', 'DPO', 'Eng Lead'],
    headline: 'Evidence collection is on track for renewal; one access-control gap must close before the audit window opens.',
    decisions: [{ text: 'Remediate the access-control gap before audit', owner: 'Security Lead', at: '14:00', confidence: 0.9 }],
    risks: [{ text: 'Stale admin accounts found in the access review', level: 'high', at: '18:20' }],
    commitments: [{ text: 'Revoke stale admin accounts', owner: 'Eng Lead', due: 'Fri', at: '25:00' }],
    talkTime: [{ name: 'Security Lead', pct: 40 }, { name: 'DPO', pct: 32 }, { name: 'Eng Lead', pct: 28 }],
  }),
  buildDemo({
    id: 'compliance-gdpr-review', category: 'Compliance', title: 'GDPR Data Mapping Review', subtitle: 'Legal · Privacy',
    date: '2026-06-17', duration: '43:10', color: 'rose', participants: ['DPO', 'General Counsel', 'Eng Lead'],
    headline: 'Data map is mostly complete; one third-party processor still needs a signed data processing agreement.',
    decisions: [{ text: 'Block new integrations until the DPA is signed', owner: 'General Counsel', at: '20:00', confidence: 0.88 }],
    risks: [{ text: 'Third-party processor has no signed DPA on file', level: 'high', at: '16:40' }],
    commitments: [{ text: 'Send the DPA to the processor for signature', owner: 'DPO', due: 'Mon', at: '30:00' }],
    talkTime: [{ name: 'DPO', pct: 38 }, { name: 'General Counsel', pct: 34 }, { name: 'Eng Lead', pct: 28 }],
  }),
  buildDemo({
    id: 'compliance-vendor-risk', category: 'Compliance', title: 'Vendor Risk Assessment', subtitle: 'Security · Third-party risk',
    date: '2026-06-12', duration: '36:50', color: 'sky', participants: ['Security Lead', 'Procurement', 'Vendor Rep'],
    headline: 'Vendor passed the core security review; a penetration-test report is still outstanding before sign-off.',
    decisions: [{ text: 'Conditionally approve the vendor pending pen-test report', owner: 'Security Lead', at: '17:00', confidence: 0.84 }],
    risks: [{ text: 'No recent penetration-test report on file', level: 'medium', at: '21:30' }],
    commitments: [{ text: 'Request the latest penetration-test report', owner: 'Procurement', due: 'Wed', at: '28:00' }],
    talkTime: [{ name: 'Security Lead', pct: 42 }, { name: 'Procurement', pct: 32 }, { name: 'Vendor Rep', pct: 26 }],
  }),
  buildDemo({
    id: 'compliance-incident-postmortem', category: 'Compliance', title: 'Security Incident Postmortem', subtitle: 'Security · Compliance review',
    date: '2026-06-09', duration: '41:00', color: 'coral', participants: ['Security Lead', 'SRE Lead', 'DPO', 'Legal Counsel'],
    headline: 'Root cause identified and contained within policy; disclosure obligations confirmed as not triggered.',
    decisions: [
      { text: 'Confirm no regulatory disclosure is required', owner: 'Legal Counsel', at: '22:00', confidence: 0.89 },
      { text: 'Roll out the patched configuration to all environments', owner: 'SRE Lead', at: '30:15', confidence: 0.92 },
    ],
    risks: [{ text: 'Similar misconfiguration may exist in other environments', level: 'medium', at: '26:40' }],
    commitments: [{ text: 'Audit all environments for the same misconfiguration', owner: 'SRE Lead', due: 'This week', at: '35:00' }],
    talkTime: [{ name: 'Security Lead', pct: 30 }, { name: 'SRE Lead', pct: 28 }, { name: 'DPO', pct: 22 }, { name: 'Legal Counsel', pct: 20 }],
  }),
]

export const DEMO_MEETINGS = [...CURATED_MEETINGS, ...GENERATED_MEETINGS]

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
