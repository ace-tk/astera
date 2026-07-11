/**
 * Marketing + product content, kept as data so layouts stay declarative.
 * Each feature owns a semantic color token (see tailwind.config.js).
 */

export const NAV_LINKS = [
  { label: 'Story', href: '#story' },
  { label: 'How it works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

// The animated "journey" a conversation takes through Astera.
export const JOURNEY = [
  { key: 'meeting', title: 'Meeting', body: 'A 74-minute call. Seven voices. One goal.', color: 'coral', glyph: 'mic' },
  { key: 'transcript', title: 'Transcript', body: 'Every word, diarized and timestamped.', color: 'orange', glyph: 'text' },
  { key: 'intelligence', title: 'Meeting Insights', body: 'Decisions, owners, and intent extracted.', color: 'purple', glyph: 'brain' },
  { key: 'timeline', title: 'Timeline', body: 'The story of the room, minute by minute.', color: 'emerald', glyph: 'timeline' },
  { key: 'report', title: 'Report', body: 'A publication, not a PDF dump.', color: 'royal', glyph: 'report' },
  { key: 'compliance', title: 'Compliance', body: 'Commitments and obligations, flagged.', color: 'golden', glyph: 'shield' },
  { key: 'delivery', title: 'Delivery', body: 'In every inbox before the room clears.', color: 'sky', glyph: 'send' },
]

// Editorial bento — sizes are deliberately uneven (wide / tall / square).
export const FEATURES = [
  {
    id: 'reports',
    eyebrow: 'Reports',
    title: 'Meetings, rewritten as publications.',
    body: 'Astera composes a narrative report — headline, summary, decisions, and open threads — typeset like a magazine, not exported like a spreadsheet.',
    color: 'royal',
    span: 'lg:col-span-3 lg:row-span-2',
    glyph: 'report',
  },
  {
    id: 'ai',
    eyebrow: 'Insights',
    title: 'It reads intent, not just words.',
    body: 'Decisions, owners, blockers, and sentiment — surfaced with citations back to the exact moment they were said.',
    color: 'purple',
    span: 'lg:col-span-3',
    glyph: 'brain',
  },
  {
    id: 'timeline',
    eyebrow: 'Timeline',
    title: 'The room, minute by minute.',
    body: 'A living timeline you can scrub — see when the energy shifted and who moved it.',
    color: 'emerald',
    span: 'lg:col-span-2',
    glyph: 'timeline',
  },
  {
    id: 'compliance',
    eyebrow: 'Compliance',
    title: 'Every promise, on the record.',
    body: 'Commitments and obligations are extracted and flagged, so nothing said out loud quietly disappears.',
    color: 'golden',
    span: 'lg:col-span-2',
    glyph: 'shield',
  },
  {
    id: 'risks',
    eyebrow: 'Risks',
    title: 'The quiet red flags, surfaced.',
    body: 'Astera watches for risk language and unresolved tension the room may have skated past.',
    color: 'rose',
    span: 'lg:col-span-2',
    glyph: 'alert',
  },
  {
    id: 'analytics',
    eyebrow: 'Analytics',
    title: 'Signals across every conversation.',
    body: 'Talk-time balance, decision velocity, and follow-through — measured across your whole workspace.',
    color: 'sky',
    span: 'lg:col-span-3',
    glyph: 'chart',
  },
  {
    id: 'upload',
    eyebrow: 'Upload Studio',
    title: 'Drop a recording. Walk away.',
    body: 'Audio, video, or a raw transcript. Astera handles the rest and pings you when clarity is ready.',
    color: 'coral',
    span: 'lg:col-span-3',
    glyph: 'upload',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'We replaced three tools and a note-taker with Astera. The reports are the first meeting artifact anyone on my team actually reads.',
    name: 'Maya Okafor',
    role: 'VP Product, Northwind',
    color: 'royal',
  },
  {
    quote:
      'It caught a compliance commitment our legal team missed in the live call. That single flag paid for the year.',
    name: 'Daniel Reyes',
    role: 'Head of Ops, Ledgerly',
    color: 'golden',
  },
  {
    quote:
      'It doesn’t feel like software. It feels like a brilliant editor sat in the room and wrote the story of what happened.',
    name: 'Priya Nair',
    role: 'Chief of Staff, Aperture',
    color: 'purple',
  },
]

export const PRICING = [
  {
    id: 'solo',
    name: 'Solo',
    price: 0,
    tagline: 'For the curious.',
    color: 'emerald',
    features: ['5 reports / month', 'Timeline & summary', 'Light & Sunset themes', 'Email delivery'],
    cta: 'Start free',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 24,
    tagline: 'For teams who live in meetings.',
    color: 'royal',
    featured: true,
    features: [
      'Unlimited reports',
      'Insights & risk flags',
      'All three themes',
      'Compliance extraction',
      'Workspace analytics',
      'Shareable report links',
    ],
    cta: 'Start 14-day trial',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: null,
    tagline: 'For the whole company.',
    color: 'purple',
    features: ['SSO & SCIM', 'Audit log & retention', 'Custom report templates', 'Dedicated support'],
    cta: 'Talk to us',
  },
]

export const STATS = [
  { value: '74', suffix: 'min', label: 'Average meeting, read in 90 seconds' },
  { value: '12', suffix: '×', label: 'Faster than writing minutes by hand' },
  { value: '98', suffix: '%', label: 'Of decisions captured with citations' },
  { value: '3', suffix: '', label: 'Themes, so every workspace feels like home' },
]
