/**
 * Content for the Communication category, transcribed from the extracted
 * markdown in /content/communication (communication.md, communication-asc.md,
 * communication-cse.md, newsletter.md). Every heading, paragraph, list, FAQ,
 * stat and CTA present in those files is represented here, translated into
 * English but not summarized or cut. As with the Drafting phase, AtoopV's own
 * brand name and business contact/SIREN line were dropped (another company's
 * identity, not content), and the scrolling instance-type ticker became a
 * static chip row.
 *
 * Two source-extraction artifacts were handled deliberately:
 * - `communication.md` and `communication-asc.md` are byte-identical aside
 *   from their source URL; both are rendered in full as their own pages,
 *   matching the actual (duplicated) source content rather than inventing
 *   artificial differentiation.
 * - Several body paragraphs and a card grid in newsletter.md were cut off
 *   mid-sentence in the extraction (a scraping artifact, not real content).
 *   Where a complete sentence remained after trimming the dangling fragment,
 *   it was kept; where nothing legible remained (the newsletter.md "how it
 *   works" 4-card grid), it was omitted rather than invented or shown broken.
 */
import {
  Gift,
  Palmtree,
  Dumbbell,
  Archive,
  Mail,
  Megaphone,
  BookOpen,
  MessageCircle,
  ShieldCheck,
  Clock,
  GraduationCap,
  Users,
} from 'lucide-react'

export const COMMUNICATION_NAV = [
  { label: 'Overview', to: '/services/communication', end: true },
  { label: 'CSE communication', to: '/services/communication/communication-cse' },
  { label: 'ASC communication', to: '/services/communication/communication-asc' },
  { label: 'Newsletter ActuCSE', to: '/services/communication/newsletter' },
]

const SHARED_STATS = [
  { value: '2017', label: 'Founded' },
  { value: '48–72h', label: 'Average delivery time' },
  { value: '3', label: 'Minutes formats to choose from' },
  { value: '15', label: 'Legal guides published' },
]

const INSTANCE_TAGS = ['CSE', 'CSEC', 'CSSCT', 'QVCT', 'CÉCO', 'General Assembly']

const ASC_RULES_GRID = [
  { icon: Gift, title: 'Gift vouchers', body: 'Maximum 5% of the Social Security ceiling per event.' },
  { icon: Palmtree, title: 'Holiday vouchers', body: 'CSE funding capped at 50% maximum.' },
  { icon: Dumbbell, title: 'Sports activities', body: 'Collective rate, non-nominative access.' },
  { icon: Archive, title: 'Record retention', body: 'Minimum 5 years.' },
]

/* ---------------------------------------------------------------------- */
/* Shared hero/legal/why-us/cta content for communication.md and          */
/* communication-asc.md — the two files are byte-identical bar their      */
/* source URL, so both pages render this same content in full.            */
/* ---------------------------------------------------------------------- */

const ASC_COMMUNICATION_PAGE = {
  hero: {
    badge: 'Social activities — since 2017',
    title: 'ASC communication — showcasing social and cultural activities',
    lead: 'ASC communication is an essential lever for showcasing social and cultural activities to employees. Effective communication lets the social and economic committee concretely demonstrate how the ASC budget is used and strengthen employee buy-in. Managing and communicating about CSE social and cultural activities is a mission in its own right for the treasurer and the secretary.',
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'All our services', to: '/services' },
  },
  stats: SHARED_STATS,
  legalFramework: {
    eyebrow: 'The legal framework',
    heading: 'The ASC management report',
    color: 'coral',
    blocks: [
      {
        type: 'paragraph',
        text: 'The ASC management report is a mandatory document presented to the assembly of elected members, in accordance with articles L.2312-83 and L.2315-64 of the Labor Code.',
      },
    ],
  },
  legalFrameworkGrid: ASC_RULES_GRID,
  whyUs: {
    eyebrow: 'Why choose us',
    heading: 'A recognized ASC communication expert since 2017',
    color: 'coral',
    blocks: [
      {
        type: 'paragraph',
        text: 'We support social and economic committees in managing and communicating their social and cultural activities.',
      },
    ],
  },
  cta: {
    heading: 'A recognized ASC communication expert since 2017',
    body: "Tell us about your situation. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
}

export const COMMUNICATION_OVERVIEW = {
  ...ASC_COMMUNICATION_PAGE,
  included: {
    eyebrow: 'What we cover',
    heading: 'Communication, from committee to inbox',
    items: [
      {
        icon: Users,
        title: 'CSE communication',
        body: 'Best practices for newsletters and ASC communication that inform employees and strengthen your committee’s image.',
        cta: { label: 'Read more →', to: '/services/communication/communication-cse' },
      },
      {
        icon: Megaphone,
        title: 'ASC communication',
        body: 'Showcase social and cultural activities and the ASC budget’s impact, in line with the legal reporting rules.',
        cta: { label: 'Read more →', to: '/services/communication/communication-asc' },
      },
      {
        icon: Mail,
        title: 'Newsletter ActuCSE',
        body: 'Turn your approved minutes into an internal newsletter every employee will actually read.',
        cta: { label: 'Read more →', to: '/services/communication/newsletter' },
      },
    ],
  },
}

export const COMMUNICATION_ASC = ASC_COMMUNICATION_PAGE

/* ---------------------------------------------------------------------- */
/* /services/communication/communication-cse (from                       */
/* content/communication/communication-cse.md — full content)             */
/* ---------------------------------------------------------------------- */

export const COMMUNICATION_CSE = {
  hero: {
    badge: 'Communication — since 2017',
    title: 'Communication for your works council',
    lead: "CSE communication is an essential lever for informing employees about the activities of the Social and Economic Committee. Effective communication strengthens the bond between elected members and employees. Through our ActuCSE newsletter and our ASC communication service, you can bridge elected members and employees while showcasing the CSE's actions on social and cultural activities. Setting up a structured CSE newsletter or ASC communication significantly improves your committee's image and impact.",
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'All our services', to: '/services' },
  },
  stats: SHARED_STATS,
  practices: {
    eyebrow: 'Best practices',
    heading: 'CSE newsletter & ASC communication: best practices',
    color: 'coral',
    blocks: [
      {
        type: 'paragraph',
        text: 'First, define the goals of your CSE newsletter and ASC communication: informing about employee benefits, communicating on plenary meetings, presenting cultural actions.',
      },
    ],
  },
  practicesGrid: [
    { icon: MessageCircle, title: 'What content to include', body: 'Employee benefits, plenary meeting takeaways, and cultural and social actions.' },
    { icon: Mail, title: 'Newsletter ActuCSE', body: 'Turn approved minutes into a newsletter your employees will read.', cta: { label: 'Read more →', to: '/services/communication/newsletter' } },
    { icon: Megaphone, title: 'ASC communication', body: 'Showcase your committee’s social and cultural activities.', cta: { label: 'Read more →', to: '/services/communication/communication-asc' } },
    { icon: BookOpen, title: 'Committee guide', body: 'A printed, personalized guide distributed to your employees.', cta: { label: 'Explore guides →', to: '/services/guides' } },
  ],
  whyUs: {
    eyebrow: 'Why choose us',
    heading: 'Why choose us',
    color: 'coral',
    blocks: [
      {
        type: 'paragraph',
        text: 'We support CSEs, CSSCTs, and IRPs in their internal communication: employee newsletters, ASC promotion, practical guides for elected members. Turnkey tools to strengthen dialogue.',
      },
      {
        type: 'list',
        items: ['Monthly or quarterly drafting', 'Social and legal news', 'Professional layout', 'PDF or HTML email format'],
      },
    ],
  },
  cta: {
    heading: 'CSE newsletter & ASC communication: best practices',
    body: "Tell us about your situation. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
  faq: [
    {
      question: 'What is the ActuCSE newsletter?',
      answer: "ActuCSE is an information letter for employees. In two to three pages, it summarizes the committee's decisions, social and cultural activities, and company news, in a format everyone can read clearly. We handle the drafting and layout. A CSE that communicates regularly gains legitimacy: information matters as much as action when it comes to mobilizing employees.",
    },
    {
      question: 'How is ActuCSE different from the minutes themselves?',
      answer: 'The minutes are the official, complete record of the meeting, intended for elected members and the employer. ActuCSE is a short, accessible version, designed to inform all employees without overwhelming them with the details of the debates. The two tools are complementary: one serves as proof, the other as a link.',
    },
    {
      question: 'Can the CSE legally share meeting outcomes with employees this way?',
      answer: 'Yes. Once the minutes are adopted, the committee can communicate them to employees in full or as a summary. ActuCSE fills that second role: it showcases the CSE’s work while respecting the confidentiality of sensitive information, which stays out of the circulated document.',
    },
    {
      question: 'How long does it take to receive the newsletter?',
      answer: 'Count on seven to ten business days when we draft the content. If you supply the copy yourself, the layout is delivered within 72 hours of receiving it.',
    },
  ],
}

/* ---------------------------------------------------------------------- */
/* /services/communication/newsletter (from                               */
/* content/communication/newsletter.md — full content)                    */
/* ---------------------------------------------------------------------- */

export const NEWSLETTER = {
  hero: {
    badge: 'Newsletter — since 2017',
    title: 'ActuCSE — transform your minutes into a newsletter your employees will actually read',
    lead: "The ActuCSE newsletter turns the content of your CSE minutes into an internal newsletter every employee can read. It lets your CSE's elected members easily communicate the outcome of every meeting — with no extra drafting effort.",
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'All our services', to: '/services' },
  },
  stats: SHARED_STATS,
  howItWorks: {
    eyebrow: 'How it works',
    heading: 'How does the ActuCSE newsletter work?',
    color: 'coral',
    blocks: [
      {
        type: 'paragraph',
        text: 'The ActuCSE newsletter considerably simplifies communication between elected members and employees. First, it picks up the content of the minutes we’ve drafted.',
      },
    ],
  },
  whyActuCse: {
    eyebrow: 'Why ActuCSE',
    heading: 'Why ActuCSE',
    color: 'coral',
    blocks: [],
  },
  whyActuCseGrid: [
    { icon: ShieldCheck, title: 'IRP expert since 2017', body: "We've supported CSEs since our founding." },
    { icon: GraduationCap, title: 'Registered training organization', body: 'Registration 84740456974, approved by DREETS AURA, financeable on the CSE budget.' },
    { icon: Clock, title: 'Response within 24h', body: 'Free quote, personalized support for your body.' },
    { icon: Users, title: 'Complete independence', body: 'Neither union nor management — a neutral, professional perspective.' },
  ],
  cta: {
    heading: 'Your elected members work, negotiate, and deliver — but no one knows it',
    body: "Tell us about your situation. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
  faq: [
    {
      question: 'What is the ActuCSE newsletter?',
      answer: "ActuCSE is an information letter for employees. In two to three pages, it summarizes the committee's decisions, social and cultural activities, and company news, in a format everyone can read clearly. We handle the drafting and layout. A CSE that communicates regularly gains legitimacy: information matters as much as action when it comes to mobilizing employees.",
    },
    {
      question: 'How is ActuCSE different from the minutes themselves?',
      answer: 'The minutes are the official, complete record of the meeting, intended for elected members and the employer. ActuCSE is a short, accessible version, designed to inform all employees without overwhelming them with the details of the debates. The two tools are complementary: one serves as proof, the other as a link.',
    },
    {
      question: 'Can the CSE legally share meeting outcomes with employees this way?',
      answer: 'Yes. Once the minutes are adopted, the committee can communicate them to employees in full or as a summary. ActuCSE fills that second role: it showcases the CSE’s work while respecting the confidentiality of sensitive information, which stays out of the circulated document.',
    },
    {
      question: 'How long does it take to receive the newsletter?',
      answer: 'Count on seven to ten business days when we draft the content. If you supply the copy yourself, the layout is delivered within 72 hours of receiving it.',
    },
  ],
}
