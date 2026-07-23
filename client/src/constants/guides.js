/**
 * Content for the Practical Guides category, transcribed from the extracted
 * markdown in /content/guides (guide-du-comite.md, modele-pv-cse-gratuit.md).
 * Every heading, paragraph, list, FAQ, stat and CTA present in those files is
 * represented here, translated into English but not summarized or cut.
 *
 * As with prior phases: AtoopV's brand name and business contact/SIREN line
 * were dropped (another company's identity, not content), and the scrolling
 * instance-type ticker became a static chip row. Two truncated sentences
 * ("...et les dro[...]" and "...nous avons mis à jour ce modèle Wo[...]")
 * were either completed using an exact phrase repeated verbatim elsewhere in
 * the same file, or trimmed to the last complete clause when no full
 * sentence could be recovered — never invented from scratch.
 *
 * One deliberate adaptation beyond text: modele-pv-cse-gratuit.md links to
 * an instant PDF viewer and a direct download hosted on AtoopV's own file
 * server. Astera does not have that file, and linking to another company's
 * hosted asset — or promising an in-page preview we don't have — would
 * misrepresent what this page actually offers. That single section's CTA
 * and the "instant viewing" claim were adjusted to a quote-request action;
 * everything else in the file is preserved.
 */
import {
  BookOpen,
  Handshake,
  Users,
  ClipboardList,
  ShieldCheck,
  GraduationCap,
  Clock,
  FileCheck2,
  Vote,
  MessageSquare,
  FileSearch,
  Scale,
  Download,
} from 'lucide-react'

export const GUIDES_NAV = [
  { label: 'Overview', to: '/services/guides', end: true },
  { label: 'Guide du Comité', to: '/services/guides/guide-du-comite' },
  { label: 'Free minutes template', to: '/services/guides/modele-pv-cse-gratuit' },
]

const SHARED_STATS = [
  { value: '2017', label: 'Founded' },
  { value: '48–72h', label: 'Average delivery time' },
  { value: '3', label: 'Minutes formats to choose from' },
  { value: '15', label: 'Legal guides published' },
]

const INSTANCE_TAGS = ['CSE', 'CSEC', 'CSSCT', 'QVCT', 'CÉCO', 'General Assembly']

const TRUST_GRID = [
  { icon: ShieldCheck, title: 'IRP expert since 2017', body: "We've supported CSEs since our founding." },
  { icon: GraduationCap, title: 'Registered training organization', body: 'Registration 84740456974, approved by DREETS AURA, financeable on the CSE budget.' },
  { icon: Clock, title: 'Response within 24h', body: 'Free quote, personalized support for your body.' },
  { icon: Users, title: 'Complete independence', body: 'Neither union nor management — a neutral, professional perspective.' },
]

/* ---------------------------------------------------------------------- */
/* /services/guides/guide-du-comite (from                                 */
/* content/guides/guide-du-comite.md — full content)                      */
/* ---------------------------------------------------------------------- */

export const GUIDE_DU_COMITE = {
  hero: {
    breadcrumbs: [{ label: 'Services', to: '/services' }, { label: 'Practical Guides', to: '/services/guides' }, { label: 'Guide du Comité' }],
    badge: 'CSE publication — since 2017',
    title: 'The CSE Committee Guide — printed, personalized, distributed to your employees',
    lead: 'Our CSE committee guide is the reference resource for Social and Economic Committee elected members looking to master their legal obligations and carry out their mandate effectively. This comprehensive guide covers every aspect of how the CSE operates: organizing meetings, drafting minutes, managing budgets, exercising the right of alert. As a result, this CSE committee guide is the indispensable tool for every newly elected or experienced member.',
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'All our services', to: '/services' },
  },
  stats: SHARED_STATS,
  contents: {
    eyebrow: 'What the guide contains',
    heading: 'The CSE committee guide: everything elected members need to know',
    color: 'purple',
    blocks: [
      {
        type: 'paragraph',
        text: 'First, our guide covers the composition and operation of the CSE bureau: chair, secretary, treasurer. It then covers the mandatory consultations, expert assessments, and the exercise of the right of alert.',
      },
    ],
  },
  contentsGrid: [
    { icon: BookOpen, title: 'A guide your employees will actually read' },
    { icon: Handshake, title: 'Welcome message' },
    { icon: Users, title: 'The elected members’ team' },
    { icon: ClipboardList, title: 'Role and duties of the CSE' },
  ],
  furtherReading: {
    eyebrow: 'Going further',
    heading: 'More resources on how the CSE works',
    color: 'purple',
    blocks: [
      {
        type: 'paragraph',
        text: 'The committee guide covers the big principles; these articles go into specific points:',
      },
      {
        type: 'list',
        items: [
          'Information and consultation of the CSE: not to be confused',
          'The BDESE and the CSE’s minutes',
          'The CSE’s extraordinary meeting',
          'Summary or full-verbatim minutes?',
          'Minutes and obstruction of employee representation',
          'Minutes in companies with fewer than 50 employees',
          'The case law that matters for the CSE',
          'How to read a Court of Cassation ruling',
        ],
      },
    ],
  },
  whyUs: {
    eyebrow: 'Why choose us',
    heading: 'Why choose us',
    color: 'purple',
  },
  whyUsGrid: TRUST_GRID,
  cta: {
    heading: 'The CSE committee guide: everything elected members need to know',
    body: "Tell us about your situation. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
}

/* ---------------------------------------------------------------------- */
/* /services/guides/modele-pv-cse-gratuit (from                           */
/* content/guides/modele-pv-cse-gratuit.md — full content)                 */
/* ---------------------------------------------------------------------- */

export const MODELE_PV_CSE_GRATUIT = {
  hero: {
    breadcrumbs: [{ label: 'Services', to: '/services' }, { label: 'Practical Guides', to: '/services/guides' }, { label: 'Free minutes template' }],
    badge: 'Free resource — since 2017',
    title: 'Free CSE Minutes Template — downloadable Word outline',
    lead: "This free CSE minutes template helps you structure your meetings. This Word template covers every mandatory point. For example, the attendance list comes first. Likewise, sections for deliberations are included. There's also space for votes. Moreover, this template complies with legal deadlines. So your CSE minutes are compliant from the very first use — helping you avoid disputes at approval. That said, every committee has its specifics, which is why we also offer personalized drafting.",
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request the free template', to: '/services/pricing' },
    secondaryCta: { label: 'Personalized drafting', to: '/services/drafting/redaction-pv-cse' },
  },
  stats: [
    { value: '2017', label: 'Founded' },
    { value: '48–72h', label: 'Average delivery time (business hours)' },
    { value: '3', label: 'Minutes formats to choose from' },
    { value: '15', label: 'Legal guides published' },
  ],
  preview: {
    eyebrow: 'Your template',
    heading: 'Get our free CSE minutes template',
    color: 'rose',
    blocks: [
      {
        type: 'paragraph',
        text: 'This is the actual document, exactly as it will be in your hands. Request it below and we’ll send your copy directly.',
      },
    ],
    cta: { label: 'Request the free template →', to: '/services/pricing' },
  },
  contents: {
    eyebrow: 'What the template contains',
    heading: 'What our free CSE minutes template includes',
    color: 'rose',
    blocks: [
      {
        type: 'paragraph',
        text: 'Download our free CSE minutes template: a minutes outline designed within the framework of articles L.2315-34 and D.2315-26 of the Labor Code.',
      },
    ],
  },
  contentsGrid: [
    { icon: FileCheck2, title: 'Regulatory header of the CSE minutes', body: 'Date, time, location, list of attendees, represented members, and apologies.' },
    { icon: Scale, title: 'Approval of the previous CSE minutes', body: 'A section dedicated to approving or amending the minutes of the previous meeting.' },
    { icon: Vote, title: 'CSE deliberations and votes', body: 'A structured voting table to record results and opinions issued.' },
    { icon: MessageSquare, title: 'Other CSE business', body: 'A section for recording questions raised outside the agenda.' },
  ],
  needExpert: {
    eyebrow: 'Need an expert?',
    heading: 'When should you hand CSE minutes drafting to an expert?',
    color: 'rose',
    blocks: [
      {
        type: 'paragraph',
        text: "A template is a starting point. But writing minutes that are faithful, legally sound, and approved without dispute is a different craft. We step in when the meeting is complex, the secretary's time is limited, or the stakes are too high to risk an approximation.",
      },
    ],
  },
  needExpertGrid: [
    { icon: FileSearch, title: 'Verbatim accuracy and legal fidelity', body: "Every remark is transcribed with precision — no approximate wording should be able to weaken a deliberation if it's ever challenged." },
    { icon: Scale, title: 'Compliance with articles L.2315-34 and D.2315-26', body: 'Every set of minutes includes the mandatory mentions defined by the Labor Code. Your secretary doesn’t walk away with a template to fill in, but a finished document.' },
    { icon: Clock, title: 'Time reclaimed by the CSE secretary', body: 'On average, drafting a set of minutes takes the CSE secretary 3 to 5 hours. Hand us that work instead: you receive the finished document within 48 to 72 business hours.' },
    { icon: Download, title: 'Complex or sensitive CSE meetings', body: "Restructuring, economic layoffs, expert assessments: when the stakes are high, drafting can't be improvised. Our experts step in for every type of body." },
  ],
  cta: {
    heading: 'Why download our free CSE minutes template',
    body: "Tell us about your situation. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
  faq: [
    {
      question: 'What does a CSE minutes template include?',
      answer: 'A minutes template covers the elements expected of a meeting: date, time and location, list of attendees, represented members and apologies, agenda, summary of deliberations, voting results, opinions issued, then other business. The framework stems from articles L.2315-34 and D.2315-26 of the Labor Code. The layout is free, but forgetting a section — an undetailed vote, an unmotivated opinion — can be enough to weaken the document the day you need to refer back to it.',
    },
    {
      question: 'Does the template guarantee legal compliance?',
      answer: "The outline covers the elements set out in articles L.2315-34 and D.2315-26. The Labor Code doesn't impose a fixed format: it sets minimum content and deadlines, not a layout. So you have a reliable base. Real compliance, though, is decided at the moment of drafting: it's the fidelity of what's recorded, not the outline, that gives the minutes their value.",
    },
    {
      question: 'Who is responsible for drafting the CSE minutes?',
      answer: 'Drafting falls to the CSE secretary (article L.2315-34). They can rely on another elected member or hand the drafting to a provider, but they remain the document’s guarantor and validate it before distribution. The template is a starting point; on long or contentious sessions, filling in a blank outline single-handedly while following the debate remains the pitfall most secretaries discover the hard way.',
    },
    {
      question: 'What is the legal deadline for sending out the minutes?',
      answer: 'Absent an agreement providing for another deadline, the minutes are drawn up and sent within fifteen days of the meeting (article R.2315-25). That deadline would drop to three days for a consultation on an economic layoff, and to one day in case of receivership or judicial liquidation. A delay exposes the secretary: better a ready outline and a practiced method before the session than a race against the clock afterward.',
    },
    {
      question: 'What’s the difference between a summary report and official minutes?',
      answer: "A summary report is an informal recap, without particular legal standing. The minutes are the official document required by law: they record deliberations and votes, are approved at the next session, and stand as evidence of the debates. They're what documents a management commitment and can be produced as proof in a dispute. The outline offered here is a minutes template, not a summary-report template — the distinction isn't semantic, it's legal.",
    },
    {
      question: 'Can this template be used for CSSCT meetings too?',
      answer: 'The outline adapts to CSSCT meetings, whose logic of recording exchanges and opinions stays close to the CSE’s. The subjects differ — health, safety, working conditions: adjust the agenda and the sections to the commission’s own themes, notably alerts, risk analyses, and the follow-up given to them.',
    },
  ],
}

export const GUIDES_OVERVIEW = {
  hero: {
    breadcrumbs: [{ label: 'Services', to: '/services' }, { label: 'Practical Guides' }],
    badge: 'Practical Guides — since 2017',
    title: 'Practical Guides for CSE elected members',
    lead: GUIDE_DU_COMITE.hero.lead,
    tags: INSTANCE_TAGS,
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'View all services', to: '/services' },
  },
  stats: SHARED_STATS,
  included: {
    eyebrow: 'What we cover',
    heading: 'Guides and resources, ready to use',
    items: [
      {
        icon: BookOpen,
        title: 'Guide du Comité',
        body: 'A printed, personalized guide covering everything elected members need to know about the CSE’s operation.',
        cta: { label: 'Read more →', to: '/services/guides/guide-du-comite' },
      },
      {
        icon: Download,
        title: 'Free minutes template',
        body: 'A free, legally structured Word outline for your next set of CSE minutes.',
        cta: { label: 'Read more →', to: '/services/guides/modele-pv-cse-gratuit' },
      },
    ],
  },
  cta: {
    heading: 'The CSE committee guide: everything elected members need to know',
    body: "Tell us about your situation. We'll send you a free, personalized quote within 24 hours.",
    primaryCta: { label: 'Request a free quote', to: '/services/pricing' },
    secondaryCta: { label: 'Discover all our services', to: '/services' },
  },
}
