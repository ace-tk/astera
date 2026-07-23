/**
 * Content for the Prices & Information page, transcribed from the extracted
 * markdown in /content/pricing/tarification.md — the single source of truth
 * for this page. Every heading, paragraph, FAQ and rate figure present in
 * that file is represented here, translated into English but not
 * summarized or cut. Unlike the other service files, tarification.md has no
 * hero badge/stats-ticker/tag block, so this page doesn't force that shared
 * pattern onto content that never had it.
 *
 * The source page is an interactive JS pricing simulator whose only
 * disclosed rule is the per-tier hourly rate stated in its own FAQ (90 / 130
 * / 150 €/h). The simulator also showed "instance type," "intervention
 * mode," and "agenda items" controls, but no formula was ever given for how
 * those affect price — so PricingCalculator computes only duration × the
 * stated hourly rate (a mechanical application of the one rule that IS
 * given) rather than inventing a multi-factor formula. The agenda-items and
 * intervention-mode dimensions are covered as descriptive text instead of a
 * non-functional control.
 */
export const PRICING_HERO = {
  breadcrumbs: [{ label: 'Services', to: '/services' }, { label: 'Prices & Information' }],
  badge: 'Pricing simulator',
  title: 'Estimate your minutes budget',
  lead: 'A 30-second estimate, a precise quote within 24h.',
}

export const PRICING_INTRO = {
  blocks: [
    {
      type: 'paragraph',
      text: 'The CSE minutes pricing simulator lets you estimate in 30 seconds the cost of drafting your minutes. Our tool calculates the price based on the number of participants, the length of the meeting, and the complexity of the debates. Get an immediate, free, no-commitment estimate.',
    },
  ],
}

export const PRICING_TIERS = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    rate: 90,
    note: 'Bracket: 50 to 300 employees',
    tagline: 'Decision summary',
    features: ['3 to 5 pages per hour', 'Decisions, votes and results', 'Third-person narrative drafting', 'Delivery within 48 to 72 business hours'],
  },
  {
    id: 'scope',
    name: 'Scope',
    rate: 130,
    note: 'Bracket: 50 to 300 employees',
    tagline: 'Enhanced summary',
    badge: 'Most chosen',
    featured: true,
    features: ['6 to 10 pages per hour', 'Key exchanges restored with attribution', 'Detailed named votes', 'Union statements restored'],
  },
  {
    id: 'premium',
    name: 'Premium',
    rate: 150,
    note: 'Bracket: 50 to 300 employees',
    tagline: 'Full verbatim',
    features: ['11 to 20 pages per hour', 'Full restitution of every speech', 'Maximum evidentiary value', 'Ideal in contentious or job-protection-plan contexts'],
  },
]

export const PRICING_CALCULATOR = {
  disclaimer: 'Non-contractual estimate, excl. VAT (+20%) • Free personalized quote within 24h',
  cta: { label: 'Request a free quote →', to: '/app' },
}

export const PRICING_WHY = {
  eyebrow: 'Why use it',
  heading: 'Why use the pricing simulator?',
  color: 'golden',
  blocks: [
    {
      type: 'paragraph',
      text: 'Our pricing simulator was designed for CSE secretaries, treasurers, and elected members who want to quickly get an order of magnitude for the cost of drafting their minutes. The rate varies according to several parameters: the length of the meeting, the number of members present, the complexity of the deliberations, and the desired delivery time. So rather than waiting for a traditional quote, the pricing simulator gives you an immediate estimate.',
    },
    {
      type: 'paragraph',
      text: 'We also offer minutes drafting on-site or remotely, for all staff representative bodies: CSE, CSSCT, and other IRP. The delivery format is adaptable — Word, PDF, or both. However, if your situation is unusual (an exceptional meeting, litigation, an alert procedure), we recommend contacting us directly for a personalized quote. We respond within 24 business hours to any quote request.',
    },
  ],
}

export const PRICING_HOW = {
  eyebrow: 'Step by step',
  heading: 'How do you get your quote with the pricing simulator?',
  color: 'golden',
  blocks: [
    {
      type: 'list',
      ordered: true,
      items: [
        'Select your body type (CSE, CSSCT, or IRP).',
        'Indicate the approximate length of your meeting.',
        'Specify the desired format (on-site or remote) and delivery time.',
        'The simulator automatically calculates a price estimate.',
      ],
    },
    {
      type: 'paragraph',
      text: 'This rate is indicative — the final quote is provided after reviewing your request.',
    },
  ],
}

export const PRICING_FAQ = [
  {
    question: 'How much does minutes drafting cost?',
    answer: 'The rate depends on the format and the length of the meeting. We bill by the meeting hour: starting at €90 excl. VAT/h for Essentiel, €130 excl. VAT/h for Scope, and €150 excl. VAT/h for Premium (50 to 300 employee bracket). A personalized quote states the exact amount for your situation. Measured against the time a secretary would spend drafting alone, and the risk of contestable minutes, outsourcing is less a matter of cost than of security.',
  },
  {
    question: 'Why bill by the meeting hour instead of by the page?',
    answer: 'The length of the session determines the volume of exchanges to restore, and so the real amount of work. Billing by the meeting hour gives you a known price before the work begins. Billing by the page, common elsewhere, mechanically encourages padding the document; our approach protects you from that drift and makes the budget predictable from one meeting to the next.',
  },
  {
    question: 'Who pays for minutes drafting — the CSE or the employer?',
    answer: 'Minutes drafting can fall within the CSE’s operating budget. When the employer initiates the use of a provider, the employer can bear the cost. How it’s covered is decided within the committee; a vote in session and a note in the minutes secure the decision.',
  },
  {
    question: 'Do I have to commit to a subscription?',
    answer: 'No. We work on a one-off basis, for a single meeting, or regularly according to your needs. No binding subscription: recurrence is built on service quality, meeting after meeting. You stay free to adjust the format or frequency at any time.',
  },
  {
    question: 'Are the prices inclusive of VAT?',
    answer: 'Prices are stated excluding VAT; VAT at 20% is added to the invoice. The quote details the amount excl. VAT, the VAT, and the total due, with no hidden fees.',
  },
  {
    question: 'How do I get my personalized quote?',
    answer: 'Describe your meeting: body type, length, frequency, and desired format. You receive a free, personalized quote within 24 hours.',
  },
]

export const PRICING_CTA = {
  heading: 'Ready for your personalized quote?',
  body: "Describe your meeting: body type, duration, frequency, and desired format. You'll receive a free, personalized quote within 24 hours.",
  primaryCta: { label: 'Request a free quote', to: '/app' },
  secondaryCta: { label: 'View all services', to: '/services' },
}
