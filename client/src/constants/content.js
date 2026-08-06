/**
 * Marketing + product content, kept as data so layouts stay declarative.
 * Each feature owns a semantic color token (see tailwind.config.js).
 */

export const NAV_LINKS = [
  {
    label: 'Story',
    href: '#story',
    children: [
      { label: 'How it works', href: '#how' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '/atoopv/tarification' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    children: [
      {
        label: 'Rédaction PV',
        href: '/services/drafting',
        children: [
          { label: 'Rédaction PV CSE', href: '/services/drafting/redaction-pv-cse' },
          { label: 'Rédaction à l’acte', href: '/services/drafting/redaction-pv-cse-a-lacte' },
          { label: 'Rédaction PV CSSCT', href: '/services/drafting/redaction-pv-cssct' },
          { label: 'Externaliser son PV CSE', href: '/services/drafting/externaliser-pv-cse' },
          { label: 'Rédaction PV IRP', href: '/services/drafting/redaction-pv-irp' },
          { label: 'Rédaction PV CSEC', href: '/services/drafting/redaction-pv-csec' },
        ],
      },
      {
        label: 'Par ville',
        href: '/services/by-city',
        children: [
          { label: 'PV CSE Grenoble', href: '/services/by-city/redaction-pv-cse-grenoble' },
          { label: 'PV CSE Marseille', href: '/services/by-city/redaction-pv-cse-marseille' },
          { label: 'PV CSE Toulouse', href: '/services/by-city/redaction-pv-cse-toulouse' },
          { label: 'PV CSE Bordeaux', href: '/services/by-city/redaction-pv-cse-bordeaux' },
          { label: 'PV CSE Nantes', href: '/services/by-city/redaction-pv-cse-nantes' },
          { label: 'PV CSE Lille', href: '/services/by-city/redaction-pv-cse-lille' },
          { label: 'PV CSE Saint-Étienne', href: '/services/by-city/redaction-pv-cse-saint-etienne' },
          { label: 'PV CSE Clermont-Ferrand', href: '/services/by-city/redaction-pv-cse-clermont-ferrand' },
          { label: 'Rédaction PV CSE Annecy', href: '/services/by-city/redaction-pv-cse-annecy' },
          { label: 'Rédaction PV CSE Lyon', href: '/services/by-city/redaction-pv-cse-lyon' },
          { label: 'Rédaction PV CSE Paris', href: '/services/by-city/redaction-pv-cse-paris' },
        ],
      },
      {
        label: 'Tarifs & Infos',
        href: '/services/tarifs-infos',
        children: [
          { label: 'PV CSE et Code du travail', href: '/services/tarifs-infos/pv-cse-code-travail' },
          { label: 'Délai rédaction PV CSE', href: '/services/tarifs-infos/delai-redaction-pv-cse' },
          { label: 'Rédacteur PV CSE', href: '/services/tarifs-infos/redacteur-pv-cse' },
        ],
      },
      {
        label: 'Guides pratiques',
        href: '/services/guides',
        children: [
          { label: 'Qui rédige le PV CSE ?', href: '/services/guides/qui-redige-pv-cse' },
          { label: 'Approbation du PV CSE', href: '/services/guides/approbation-pv-cse' },
          { label: 'Contenu obligatoire du PV', href: '/services/guides/pv-cse-contenu-obligatoire' },
          { label: 'PV CSE – moins de 50 salariés', href: '/services/guides/pv-cse-moins-50-salaries' },
          { label: 'Modèle PV CSE gratuit', href: '/services/guides/modele-pv-cse-gratuit' },
          { label: 'Guide complet PV de CSE', href: '/services/guides/proces-verbal-cse' },
          { label: 'Délai du PV de CSE', href: '/services/guides/delai-pv-cse' },
          { label: 'Contenu du PV de CSE', href: '/services/guides/contenu-pv-cse' },
          { label: 'PV de CSE et délit d’entrave', href: '/services/guides/pv-cse-delit-entrave' },
          { label: 'BDESE et PV de CSE', href: '/services/guides/bdese-pv-cse' },
          { label: 'Information ou consultation CSE', href: '/services/guides/information-consultation-cse' },
          { label: 'Réunion extraordinaire du CSE', href: '/services/guides/reunion-extraordinaire-cse' },
          { label: 'PV synthétique ou in extenso', href: '/services/guides/pv-cse-synthetique-ou-integral' },
        ],
      },
      { label: 'Tous nos services', href: '/services' },
      {
        label: 'Communication',
        href: '/services/communication',
        children: [
          { label: 'Newsletter ActuCSE', href: '/services/communication/newsletter-actucse' },
          { label: 'Communication ASC', href: '/services/communication/communication-asc' },
          { label: 'Guide du comité', href: '/services/communication/guide-du-comite' },
        ],
      },
      {
        label: 'Formations',
        href: '/services/training',
        children: [
          { label: 'Formation économique — 5 jours', href: '/services/training/formation-economique-elus-cse' },
          { label: 'Trésorier du CSE', href: '/services/training/formation-cse-tresorier' },
          { label: 'Rédaction PV CSSCT', href: '/services/training/formation-cssct-roles-missions' },
          { label: 'Formation Communication', href: '/services/training/formation-pro-communication' },
          { label: 'Contrat de travail & Rupture', href: '/services/training/formation-droit-social-contrat-travail' },
        ],
      },
      { label: 'Modèle PV CSE gratuit', href: '/services/guides/modele-pv-cse-gratuit' },
    ],
  },
  { label: 'Accueil', href: '/atoopv' },
  {
    label: 'Ressources',
    href: '/atoopv/ressources',
    children: [
      { label: 'Guides Juridiques', href: '/atoopv/ressources/guides-livres-blancs-cse' },
      {
        label: 'Modèles de PV',
        href: '/atoopv/ressources/modeles-pv',
        children: [
          { label: 'PV Premium Intégral — Exemple complet', href: '/atoopv/ressources/modele-pv-cse-premium-integral' },
        ],
      },
      { label: 'Mentions Obligatoires du PV', href: '/atoopv/ressources/mentions-obligatoires-pv' },
      {
        label: 'Actualité Sociale',
        href: '/atoopv/ressources/actualite-sociale',
        children: [
          { label: 'Cas pratiques', href: '/atoopv/ressources/cas-pratiques' },
          {
            label: 'Jurisprudence sociale',
            href: '/atoopv/ressources/jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse',
          },
          { label: 'Veille juridique CSE', href: '/atoopv/ressources/veille-juridique-cse' },
        ],
      },
      { label: 'Lire un arrêt de la Cour de cassation', href: '/atoopv/ressources/comment-lire-arret-cour-de-cassation' },
      { label: 'La Minute CSE : le droit du CSE expliqué en vidéo', href: '/atoopv/ressources/la-minute-cse' },
    ],
  },
  { label: 'Tarification', href: '/atoopv/tarification' },
  { label: 'À propos', href: '/atoopv/a-propos' },
  { label: 'Autodiagnostic', href: '/atoopv/autodiagnostic' },
  { label: 'AtooSavoir', href: '/atoopv/atoosavoir' },
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
    body: 'ATOOPV composes a narrative report — headline, summary, decisions, and open threads — typeset like a magazine, not exported like a spreadsheet.',
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
    body: 'ATOOPV watches for risk language and unresolved tension the room may have skated past.',
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
    body: 'Audio, video, or a raw transcript. ATOOPV handles the rest and pings you when clarity is ready.',
    color: 'coral',
    span: 'lg:col-span-3',
    glyph: 'upload',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'We replaced three tools and a note-taker with ATOOPV. The reports are the first meeting artifact anyone on my team actually reads.',
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
