/**
 * Content for the Drafting of Minutes category, transcribed from the
 * extracted markdown in /content/drafting (services.md, redaction-pv-cse.md,
 * redaction-pv-cssct.md). Every heading, paragraph, list, quote, stat and
 * CTA from those files is represented here — translated into Astera's
 * English voice, but not summarized or cut. Two adaptations were made
 * deliberately: the source's scrolling instance-type ticker became a static
 * chip row (an AtoopV layout device, not content), and AtoopV's own company
 * contact/SIREN footer line was dropped, since that identity belongs to a
 * different business, not Astera.
 */
import {
  FileText,
  Shield,
  Zap,
  Building2,
  CheckCircle,
  Clock,
  Map,
  MessageCircle,
  Scale,
  Calendar,
  ClipboardList,
  Send,
  Lock,
  Handshake,
  GraduationCap,
  Search,
  AlertTriangle,
} from 'lucide-react'

export const DRAFTING_NAV = [
  { label: 'Overview', to: '/services/drafting', end: true },
  { label: 'CSE minutes', to: '/services/drafting/redaction-pv-cse' },
  { label: 'CSSCT minutes', to: '/services/drafting/redaction-pv-cssct' },
]

export const INSTANCE_TAGS = ['CSE', 'CSEC', 'CSSCT', 'QVCT', 'CÉCO', 'General Assembly']

const SHARED_STATS = [
  { value: '2017', label: 'Founded' },
  { value: '48–72h', label: 'Average delivery time' },
  { value: '3', label: 'Minutes formats to choose from' },
  { value: '15', label: 'Legal guides published' },
]

/* ---------------------------------------------------------------------- */
/* /services/drafting — overview (from content/drafting/services.md,      */
/* restricted to the drafting-specific slice of that sitewide page)       */
/* ---------------------------------------------------------------------- */

export const DRAFTING_OVERVIEW = {
  hero: {
    badge: 'Minutes drafting — since 2017',
    title: 'Drafting of *CSE & CSSCT* minutes',
    lead: 'Compliant, clear, and opposable minutes for your ordinary and extraordinary meetings — compliant with art. L.2315-34, delivered D+2 to D+5, whether we attend the session in person or draft from a recording.',
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'View all services', to: '/services' },
  },
  stats: SHARED_STATS,
  included: {
    eyebrow: 'What we cover',
    heading: 'Minutes drafting, however your instance meets',
    items: [
      {
        icon: FileText,
        title: 'Drafting of CSE minutes',
        body: 'Three formats: Essential, Scope, Premium. Ordinary, extraordinary, and urgent meetings. Compliant with art. L.2315-34.',
        cta: { label: 'Read more →', to: '/services/drafting/redaction-pv-cse' },
      },
      {
        icon: Shield,
        title: 'Drafting of CSSCT minutes',
        body: 'Reports for the health, safety and working-conditions commission, with full command of the underlying issues.',
        cta: { label: 'Read more →', to: '/services/drafting/redaction-pv-cssct' },
      },
      {
        icon: Zap,
        title: 'One-off drafting',
        body: 'Free quote within 24h, mission completed within days. Ideal for a first-time need or a one-off replacement.',
        cta: { label: 'Request a quote →', to: '/services/pricing' },
      },
      {
        icon: Building2,
        title: 'IRP & CSEC minutes',
        body: 'Every one of your bodies covered: CSEC, EWC, works councils, branch-level IRP.',
        cta: { label: 'Request a quote →', to: '/services/pricing' },
      },
    ],
  },
  whyUs: {
    eyebrow: 'Why choose us',
    heading: 'A recognized partner since 2017',
    lead: 'Specialists in minutes drafting and works council support, operating across France, on-site or remotely.',
    items: [
      {
        icon: CheckCircle,
        title: 'Founded in 2017',
        body: 'ALC SAS, a recognized IRP expert. Proven experience serving employee representative bodies.',
      },
      {
        icon: Clock,
        title: 'Guaranteed delivery',
        body: 'Guaranteed D+2 to D+5 turnaround. An express option is available for urgent needs.',
      },
      {
        icon: Map,
        title: 'Nationwide coverage',
        body: 'On-site and remote intervention, anywhere in France, or drafting from a recording.',
        cta: { label: 'Browse cities →', to: '/services/by-city' },
      },
      {
        icon: MessageCircle,
        title: 'Free quote',
        body: 'Quote within 24h, no commitment. Transparent pricing per meeting hour.',
        cta: { label: 'See pricing →', to: '/services/pricing' },
      },
    ],
  },
  cta: {
    heading: 'Ready to hand off your next set of minutes?',
    body: 'Specialists in CSE minutes drafting since 2017 — ready to step in for your very next meeting. Free response within 24 hours, no commitment.',
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'View all services', to: '/services' },
  },
}

/* ---------------------------------------------------------------------- */
/* /services/drafting/redaction-pv-cse (from                              */
/* content/drafting/redaction-pv-cse.md — full content)                   */
/* ---------------------------------------------------------------------- */

export const REDACTION_PV_CSE = {
  hero: {
    badge: 'Flagship service — since 2017',
    title: 'Drafting of CSE minutes — trust your minutes to an *expert*',
    lead: 'You follow the debate — we keep the record. Faithful, compliant, and opposable minutes, delivered while the meeting is still fresh.',
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'All our services', to: '/services' },
  },
  stats: [
    { value: '2017', label: 'Founded' },
    { value: '48–72h', label: 'Delivery time' },
    { value: '3', label: 'Minutes formats to choose from' },
    { value: '15', label: 'Legal guides published' },
  ],
  intro: {
    blocks: [
      {
        type: 'paragraph',
        text: "Minutes aren't a summary of a meeting: they're proof of what was decided there. Until an opinion, a vote, or a reservation appears in them, it hasn't, legally, happened. Drafting them means knowing IRP law, keeping an equal distance from every party, and writing fast without writing false. Since 2017, we've held ourselves to one standard: transcribe without betraying.",
      },
    ],
  },
  whyOutsource: {
    eyebrow: "The secretary's challenge",
    heading: 'Why outsource your CSE minutes drafting?',
    color: 'royal',
    blocks: [
      {
        type: 'quote',
        text: 'The deliberations of the CSE are recorded in minutes drawn up by the secretary of the committee.',
        citeLabel: 'Art. L.2315-34, Code du travail',
      },
      {
        type: 'paragraph',
        text: 'A full set of minutes for a three-hour meeting means three to six hours of work behind the scenes. That time comes out of the secretary’s mandate — often out of their evenings. And fatigue ends up showing in the document: a missed mandatory mention, a poorly restored opinion, and the legal weight of the minutes is compromised.',
      },
    ],
  },
  whyOutsourceGrid: [
    { icon: Clock, title: 'A mandate, not a job', body: 'The secretary reclaims their real role: following the discussion, carrying the elected members’ voice. We deliver the finalized minutes within 48 to 72 hours.' },
    { icon: Scale, title: 'Legal certainty', body: 'All mandatory mentions included, compliant with art. L.2315-34 and the surrounding texts. The document holds up if challenged.' },
    { icon: Shield, title: 'Guaranteed neutrality', body: 'The minutes serve the CSE institution. An outside drafter has nothing to defend in the room, except the accuracy of the debate, in complete impartiality.' },
    { icon: Calendar, title: 'Workable legal deadlines', body: 'Absent an agreement, the minutes must be communicated within 15 days (art. R.2315-25). By delivering within 48 to 72 hours, we leave you time to review and secure approval without racing the deadline.' },
  ],
  deadlineCallout: {
    label: 'Did you know?',
    text: 'Absent a company agreement, the Labor Code sets the deadline for communicating the minutes at 15 days after the meeting (art. R.2315-25). That deadline would drop to 3 days for a consultation on a collective economic layoff plan (art. L.1233-30), and to 1 day if the company were in receivership or liquidation.',
    link: { label: 'Everything about minutes drafting deadlines →', to: '/services/guides' },
  },
  process: {
    eyebrow: 'Our process',
    heading: 'How do we draft your CSE minutes?',
    color: 'royal',
    lead: 'We adapt to your organization, not the other way around. Three modes of intervention, one single standard.',
  },
  processCallout: {
    label: 'Did you know?',
    text: 'The secretary of the CSE is the only person legally competent to draw up the minutes (art. L.2315-34). They may nonetheless entrust the material drafting to an outside provider without transferring their responsibility: the document remains theirs. This arrangement would then be set out in the CSE’s internal rules and voted on in a meeting, with the employer not taking part in the vote.',
    link: { label: 'Who can draft the CSE minutes? →', to: '/services/guides' },
  },
  processSteps: [
    { title: 'On-site intervention', body: 'The drafter is in the room. They identify speakers live, follow the attendance sheet, note suspensions and comings and goings. This is maximum fidelity, especially in tense sessions where what matters plays out as much in tone as in words.' },
    { title: 'Remote intervention', body: 'From an audio/video recording or a direct connection to your video conference. Designed for multi-site CSEs and hybrid bodies, without giving up any rigor.' },
    { title: 'Secure delivery', body: 'The finalized minutes arrive in your encrypted client space. Unlimited corrections until final validation, systematic NDA, GDPR compliance.' },
  ],
  formats: {
    eyebrow: 'Our minutes formats',
    heading: 'Available CSE minutes drafting formats',
    color: 'royal',
    lead: "Not all meetings are equal. A monthly information meeting doesn't call for the same minutes as a consultation on a job-protection plan. We offer three formats to match the level of detail to the real stakes.",
  },
  formatsCallout: {
    text: "Absent an agreement, the minutes must contain at least a summary of the deliberations and the employer's reasoned decision on the proposals from the previous meeting (art. D.2315-26). In practice, a usable set of minutes goes further: attendees, agenda, debates, named votes, decisions.",
    link: { label: 'The mandatory content of the minutes →', to: '/services/guides' },
  },
  formatTiers: [
    {
      name: 'Essentiel',
      tagline: 'Decision summary',
      features: ['3 to 5 pages per hour', 'Decisions, votes and results', 'Third-person narrative drafting', 'Delivery within 48 to 72 business hours'],
      idealFor: 'Budget-conscious CSEs, short meetings, mandatory posting.',
    },
    {
      name: 'Scope',
      badge: 'Most chosen',
      tagline: 'Enhanced summary',
      features: ['6 to 10 pages per hour', 'Key exchanges restored with attribution', 'Detailed named votes', 'Union statements restored'],
      idealFor: 'CSEs of 50 to 300 employees, recurring consultations, CSSCT.',
      featured: true,
    },
    {
      name: 'Premium',
      tagline: 'Full verbatim',
      features: ['11 to 20 pages per hour', 'Full restitution of every speech', 'Maximum evidentiary value', 'Ideal in contentious or job-protection-plan contexts'],
      idealFor: 'Groups with 300+ employees, restructurings, legally demanding consultations.',
    },
  ],
  legalValue: {
    eyebrow: 'Evidentiary value',
    heading: 'The legal value of CSE minutes after approval',
    color: 'royal',
    blocks: [
      {
        type: 'paragraph',
        text: "Unapproved minutes are only a draft. It's the approval vote in session that turns them into an official, fully opposable document. From that point, they can be produced before courts, sent to the Labor Inspectorate, and circulated to employees (art. L.2315-35).",
      },
    ],
  },
  legalValueGrid: [
    { icon: ClipboardList, title: 'Legal opposability', body: "Approved minutes can be produced before courts as proof of the CSE's deliberations." },
    { icon: Send, title: 'Legal distribution', body: 'Sent to the Labor Inspectorate and circulated to employees under art. L.2315-35.' },
    { icon: Lock, title: 'Absolute confidentiality', body: 'Every drafter signs a confidentiality agreement before any intervention. Systematic NDA.' },
    { icon: CheckCircle, title: 'GDPR compliance', body: 'Personal data processing compliant with GDPR. Secure, encrypted client space.' },
  ],
  legalValueCallout: {
    text: 'As long as they are not approved, the minutes only have the value of a draft. Once adopted by vote, they can be posted or circulated within the company by the secretary, according to the terms of the internal rules (art. L.2315-35).',
    link: { label: 'Approving the minutes, step by step →', to: '/services/guides' },
  },
  expertise: {
    eyebrow: 'Global expertise',
    heading: 'We also draft your CSSCT and IRP minutes',
    color: 'royal',
    blocks: [
      {
        type: 'paragraph',
        text: "We don't stop at the CSE. The health-and-safety commission, negotiation bodies, and extraordinary meetings call for the same rigor. And because understanding a body means knowing its rules, we also train elected members.",
      },
    ],
  },
  expertiseGrid: [
    { icon: Shield, title: 'CSSCT minutes drafting', body: 'Reports for the health, safety, and working-conditions commission, closely following prevention issues.', cta: { label: 'Learn more →', to: '/services/drafting/redaction-pv-cssct' } },
    { icon: Handshake, title: 'IRP minutes drafting', body: 'Minutes for employee representative bodies: mandatory annual negotiations, extraordinary meetings, consultations.', cta: { label: 'Request a quote →', to: '/services/pricing' } },
    { icon: GraduationCap, title: 'Training for elected members', body: 'Registered training organization, approved by DREETS AURA. Financeable on the operating budget.', cta: { label: 'Explore training →', to: '/services/training' } },
  ],
  coverage: {
    blocks: [
      {
        type: 'paragraph',
        text: 'We operate across France, on-site and remotely, including in the cities we cover. Looking for a one-off mission rather than ongoing support? Discover our one-off drafting offer.',
      },
    ],
  },
  cta: {
    heading: 'Your next CSE minutes, without the stress',
    body: "Tell us about your next meeting. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote →', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
}

/* ---------------------------------------------------------------------- */
/* /services/drafting/redaction-pv-cssct (from                            */
/* content/drafting/redaction-pv-cssct.md — full content)                 */
/* ---------------------------------------------------------------------- */

export const REDACTION_PV_CSSCT = {
  hero: {
    badge: 'CSSCT — since 2017',
    title: 'Drafting of CSSCT minutes — *your CSSCT report by experts*',
    lead: "Occupational risks, investigations, right of alert, working conditions: your commission's work deserves a faithful, usable written record.",
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'All our services', to: '/services' },
  },
  stats: SHARED_STATS,
  intro: {
    blocks: [
      {
        type: 'paragraph',
        text: 'The law does not require the CSSCT to produce minutes the way it does for the CSE. Yet a written report of its work remains essential: it traces the findings, investigations, and recommendations the CSE later relies on to issue its opinions. We handle CSSCT minutes drafting with the same rigor as full-session minutes.',
      },
    ],
  },
  whyEssential: {
    eyebrow: "Why it's essential",
    heading: 'Why CSSCT minutes drafting is strategic',
    color: 'emerald',
    blocks: [
      {
        type: 'quote',
        text: 'A health, safety and working conditions commission is established within the social and economic committee in: 1° Companies with at least three hundred employees; 2° Distinct establishments with at least three hundred employees […]',
        citeLabel: 'Art. L.2315-36, Code du travail',
        citeHref: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035626455',
      },
      {
        type: 'paragraph',
        text: 'The CSSCT report is written proof that the commission carried out its oversight and prevention duties. Properly drafted, it documents findings and commitments, and serves as a reference point for the CSE and elected members alike, should the question of health and safety ever come before a judge.',
      },
    ],
  },
  whyEssentialGrid: [
    { icon: Search, title: 'Risk identification', body: 'Single risk-assessment document, arduous-work factors, psychosocial risks, musculoskeletal disorders, unfitness for work: every risk restored with precision.' },
    { icon: AlertTriangle, title: 'Alert traceability', body: 'Right of alert, serious and imminent danger, prevention plans — all timestamped.' },
    { icon: ClipboardList, title: 'Follow-up on recommendations', body: 'Management commitments recorded, ready to use for tracking actions.' },
    { icon: Clock, title: 'Fast delivery', body: 'Report delivered within 48 to 72 hours, within the timeframe agreed with your commission.' },
  ],
  whyEssentialCallout: {
    label: 'Did you know?',
    text: 'The CSSCT is mandatory in companies and establishments with at least 300 employees (art. L.2315-36), as well as at certain high-risk sites regardless of headcount. Below 300, the labor inspector can impose it, or it can be created by agreement.',
    link: { label: 'CSSCT: roles and duties →', to: '/services/guides' },
  },
  expertise: {
    eyebrow: 'Our expertise',
    heading: 'Our expertise on health and safety issues',
    color: 'emerald',
    blocks: [
      {
        type: 'paragraph',
        text: 'Our drafters master SSCT vocabulary — single risk-assessment document, arduous-work factors, psychosocial risks, musculoskeletal disorders, unfitness for work. Restoring these technical subjects without distorting them takes specific preparation, which our teams have received.',
      },
    ],
  },
  expertiseSteps: [
    { title: 'Brief & preparation', body: 'Agenda shared with us. Quote within 24h.' },
    { title: 'Attendance at the session', body: 'On-site or remote from a recording. Same standard either way.' },
    { title: 'Specialized CSSCT drafting', body: 'SSCT report, technical vocabulary mastered.' },
    { title: 'Delivery & validation', body: 'Within 48 to 72 hours, unlimited corrections. Final document in Word and PDF.' },
  ],
  expertiseCallout: {
    label: 'Did you know?',
    text: 'Unlike the CSE, the CSSCT has no legal obligation to produce minutes. A written report of its work is nonetheless recommended: it documents the findings and recommendations on which the CSE then bases its opinions.',
    link: { label: "The CSE's obligation to produce minutes →", to: '/services/drafting/redaction-pv-cse' },
  },
  cta: {
    heading: 'Request a quote for your CSSCT minutes drafting',
    body: "Entrusting your CSSCT report drafting to us means a rigorous document, delivered within 48 to 72 hours, faithful to your commission's work.",
    primaryCta: { label: 'Request a free quote →', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
}
