/**
 * Content for the Training category, transcribed from the extracted markdown
 * in /content/training (formation.md, formation-cse.md). Every heading,
 * paragraph, FAQ, stat and CTA present in those files is represented here,
 * translated into English but not summarized or cut.
 *
 * formation.md and formation-cse.md are byte-identical aside from their
 * source URL — both are rendered in full as their own pages, matching the
 * actual (duplicated) source content rather than inventing differentiation
 * that isn't there. One truncated sentence ("...gérer le contrôle URSSAF
 * sur[...]") was completed using the exact phrase "risque de contrôle
 * URSSAF" that appears verbatim later in the very same file's FAQ, rather
 * than invented from scratch.
 */
import { Scale, Wallet, Calculator, HeartHandshake, ClipboardList } from 'lucide-react'

export const TRAINING_NAV = [
  { label: 'Overview', to: '/services/training', end: true },
  { label: 'Formation', to: '/services/training/formation' },
  { label: 'Formation CSE', to: '/services/training/formation-cse' },
]

const SHARED_STATS = [
  { value: '2017', label: 'Founded' },
  { value: '48–72h', label: 'Average delivery time' },
  { value: '3', label: 'Minutes formats to choose from' },
  { value: '15', label: 'Legal guides published' },
]

const INSTANCE_TAGS = ['CSE', 'CSEC', 'CSSCT', 'QVCT', 'CÉCO', 'General Assembly']

const PROGRAMME_GRID = [
  { icon: Scale, title: 'Accounting obligations of the CSE', body: 'What the treasurer must track and report, and where the risk of irregularity lies.' },
  { icon: Wallet, title: 'Financial resources of the CSE', body: 'The operating budget and the ASC budget, and the rules governing each.' },
  { icon: Calculator, title: 'Operating budget calculation', body: 'How to compute and justify the committee’s operating budget.' },
  { icon: HeartHandshake, title: 'ASC budget', body: 'Allocation rules and the case law that shapes them.' },
]

const FAQ = [
  {
    question: 'What does the treasurer training cover?',
    answer: 'The treasurer manages two distinct budgets — operating and social and cultural activities — with strict allocation rules that a poor decision can tip into irregularity. The two-day training covers accounting adapted to the CSE, presenting accounts in meetings, and managing URSSAF audit risk.',
  },
  {
    question: 'Is treasurer training legally mandatory?',
    answer: "No. Unlike economic training and health-and-safety training, treasurer training is not required by the Labor Code. It remains strongly recommended: the treasurer's responsibility for the accounts is real, and approximate management exposes both the committee and the elected member.",
  },
  {
    question: 'Who is this training for?',
    answer: 'For newly designated treasurers and deputy treasurers, as well as elected members responsible for following the committee’s finances. No accounting background is required: the training starts from the fundamentals.',
  },
]

/**
 * formation.md and formation-cse.md share this exact content — see the file
 * header for why both routes render it rather than inventing two versions.
 */
const TREASURER_TRAINING = {
  hero: {
    badge: 'Treasurer training — since 2017',
    title: 'Role and duties of the CSE treasurer',
    lead: 'Our CSE treasurer training covers, over two days, every skill needed to effectively manage the Social and Economic Committee’s budgets. The treasurer plays a key role in managing the operating budget and the social and cultural activities (ASC) budget — this training is essential for any newly designated elected member taking on the role.',
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'All our services', to: '/services' },
  },
  stats: SHARED_STATS,
  programme: {
    eyebrow: 'Programme',
    heading: 'Treasurer training: skills and curriculum',
    color: 'mint',
    blocks: [
      {
        type: 'paragraph',
        text: 'The training covers simplified accounting adapted to CSEs and presenting the accounts in a plenary meeting. Participants then learn to manage URSSAF audit risk.',
      },
    ],
  },
  programmeGrid: PROGRAMME_GRID,
  cta: {
    heading: 'Treasurer training: skills and curriculum',
    body: "Tell us about your situation. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
  faq: FAQ,
}

export const FORMATION = TREASURER_TRAINING
export const FORMATION_CSE = TREASURER_TRAINING

export const TRAINING_OVERVIEW = {
  ...TREASURER_TRAINING,
  included: {
    eyebrow: 'What we cover',
    heading: 'Treasurer training, wherever you found it',
    items: [
      {
        icon: ClipboardList,
        title: 'Formation',
        body: 'The full two-day treasurer curriculum: accounting, budgets, and URSSAF risk.',
        cta: { label: 'Read more →', to: '/services/training/formation' },
      },
      {
        icon: ClipboardList,
        title: 'Formation CSE',
        body: 'The same treasurer curriculum, for CSEs looking for it under this page.',
        cta: { label: 'Read more →', to: '/services/training/formation-cse' },
      },
    ],
  },
}
