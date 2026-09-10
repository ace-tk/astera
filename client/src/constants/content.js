/**
 * Marketing + product content, kept as data so layouts stay declarative.
 * Each feature owns a semantic color token (see tailwind.config.js).
 */

const STORY_NAV = {
  label: 'Story',
  href: '#story',
  children: [
    { label: 'How it works', href: '#how' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/atoopv/tarification' },
  ],
}

/**
 * The ATOOPV site's own top-level navigation — six commercial entries plus
 * the two direct links (AtooSavoir, À propos), reorganized per the
 * atoopv-navigation-brief: "Services", "Accueil", "Simulateur" and
 * "Autodiagnostic" no longer appear as standalone top-level items; every
 * page they used to expose is re-linked from inside these six groups
 * instead (see each item's `mega.columns`). No route was renamed, moved,
 * or deleted — only where it's *linked from* changed.
 *
 * `mega.columns` drives the desktop mega-menu (MegaNavPanel); `mobileItems`
 * is a separate, deliberately shorter curated list for the mobile
 * accordion's one nested level (the brief caps mobile at two levels total,
 * never three, so the mobile list can't just be "all leaf pages" the way
 * the desktop columns are).
 *
 * Every href here is an EXISTING route. A few brief destinations have no
 * matching page in this app (no /contact/, no dedicated /simulateur/, no
 * /blog/ index, no FAQ page, no page for "Rédaction intégrale du PV" /
 * "Audiotypie & retranscription" / the URSSAF-audit or quitus-financier
 * guides) — those are pointed at the closest existing equivalent rather
 * than a new page, and are called out in full in the delivery report.
 */
export const ATOOPV_NAV = [
  {
    key: 'pv',
    label: 'Procès-verbal',
    href: '/services',
    color: 'royal',
    mega: {
      columns: [
        {
          heading: 'Nos formules',
          items: [
            { label: 'Rédaction intégrale du PV', href: '/services/drafting' },
            { label: 'PV à l’acte', href: '/services/drafting/redaction-pv-cse-a-lacte' },
            { label: 'Audiotypie & retranscription', href: '/services/drafting' },
            { label: 'Externaliser vos PV', href: '/services/drafting/externaliser-pv-cse' },
          ],
        },
        {
          heading: 'Par instance',
          items: [
            { label: 'PV de CSE', href: '/services/drafting/redaction-pv-cse' },
            { label: 'PV de CSSCT', href: '/services/drafting/redaction-pv-cssct' },
            { label: 'PV de CSE central', href: '/services/drafting/redaction-pv-csec' },
            { label: 'PV d’IRP', href: '/services/drafting/redaction-pv-irp' },
          ],
        },
        {
          heading: 'Tarifs & délais',
          items: [
            { label: 'Tarifs & devis', href: '/atoopv/tarification' },
            { label: 'Simulateur de budget', href: '/atoopv/tarification' },
            { label: 'Délais de remise', href: '/services/tarifs-infos/delai-redaction-pv-cse' },
            { label: 'PV par ville — 11 villes', href: '/services/by-city' },
          ],
        },
      ],
      cta: {
        tone: 'dark',
        eyebrow: 'Devis en 24 h',
        title: 'Votre PV relu et livré sous 5 jours.',
        buttonLabel: 'Demander un devis',
        buttonHref: '/atoopv/tarification',
      },
    },
    mobileItems: [
      { label: 'Rédaction intégrale', href: '/services/drafting' },
      { label: 'PV à l’acte', href: '/services/drafting/redaction-pv-cse-a-lacte' },
      { label: 'Par instance', href: '/services/drafting/redaction-pv-cse' },
      { label: 'Tarifs & délais', href: '/atoopv/tarification' },
      { label: 'PV par ville', href: '/services/by-city' },
    ],
  },
  {
    key: 'formations',
    label: 'Formations',
    href: '/services/training',
    color: 'royal',
    mega: {
      columns: [
        {
          heading: 'Formations des élus',
          items: [
            { label: 'Formation économique', href: '/services/training/formation-economique-elus-cse' },
            { label: 'Trésorier du CSE', href: '/services/training/formation-cse-tresorier' },
            { label: 'CSSCT — rôles et missions', href: '/services/training/formation-cssct-roles-missions' },
            { label: 'Toutes nos formations agréées', href: '/services/training' },
          ],
        },
        {
          heading: 'Droit & pratique',
          items: [
            { label: 'Droit social & contrat de travail', href: '/services/training/formation-droit-social-contrat-travail' },
            { label: 'Communication professionnelle', href: '/services/training/formation-pro-communication' },
          ],
        },
        {
          heading: 'Communication du CSE',
          items: [
            { label: 'Communiquer avec les salariés', href: '/services/communication' },
            { label: 'Valoriser vos ASC', href: '/services/communication/communication-asc' },
          ],
        },
      ],
      cta: {
        tone: 'dark',
        eyebrow: 'Sur mesure',
        title: 'Construisons le plan de formation de votre mandat.',
        buttonLabel: 'Nous contacter',
        buttonHref: '/atoopv/tarification',
      },
    },
    mobileItems: [
      { label: 'Formation économique', href: '/services/training/formation-economique-elus-cse' },
      { label: 'Droit & pratique', href: '/services/training/formation-droit-social-contrat-travail' },
      { label: 'Communication du CSE', href: '/services/communication' },
    ],
  },
  { label: 'AtooSavoir', href: '/atoopv/atoosavoir' },
  {
    key: 'ressources',
    label: 'Ressources',
    href: '/atoopv/ressources',
    color: 'royal',
    mega: {
      columns: [
        {
          heading: 'Outils',
          items: [
            { label: 'Autodiagnostic de votre CSE', href: '/atoopv/autodiagnostic' },
            { label: 'Simulateur de budget PV', href: '/atoopv/tarification' },
          ],
        },
        {
          heading: 'Modèles de PV',
          items: [
            { label: 'Modèle de PV gratuit', href: '/services/guides/modele-pv-cse-gratuit' },
            { label: 'Bibliothèque de modèles', href: '/atoopv/ressources/modeles-pv' },
            { label: 'Modèle premium intégral', href: '/atoopv/ressources/modele-pv-cse-premium-integral' },
          ],
        },
        {
          heading: 'Guides & abonnements',
          items: [
            { label: 'Guides & livres blancs', href: '/atoopv/ressources/guides-livres-blancs-cse' },
            { label: 'Le guide du comité', href: '/services/communication/guide-du-comite' },
            { label: 'Newsletter ActuCSE', href: '/services/communication/newsletter-actucse' },
            { label: 'Questions fréquentes', href: '/atoopv/a-propos' },
          ],
        },
      ],
      cta: {
        tone: 'light',
        eyebrow: 'Le plus téléchargé',
        title: 'Le modèle de PV que vous pouvez utiliser dès lundi.',
        buttonLabel: 'Télécharger',
        buttonHref: '/services/guides/modele-pv-cse-gratuit',
      },
    },
    mobileItems: [
      { label: 'Autodiagnostic de votre CSE', href: '/atoopv/autodiagnostic' },
      { label: 'Simulateur de budget PV', href: '/atoopv/tarification' },
      { label: 'Modèles de PV', href: '/atoopv/ressources/modeles-pv' },
      { label: 'Guides & abonnements', href: '/atoopv/ressources/guides-livres-blancs-cse' },
    ],
  },
  {
    key: 'blog',
    label: 'Blog',
    href: '/atoopv/ressources',
    color: 'purple',
    mega: {
      columns: [
        {
          heading: 'Rubriques',
          items: [
            { label: 'Actualité sociale', href: '/atoopv/ressources/actualite-sociale' },
            { label: 'Jurisprudence', href: '/atoopv/ressources/jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse' },
            { label: 'Cas pratiques', href: '/atoopv/ressources/cas-pratiques' },
            { label: 'Veille sociale', href: '/atoopv/ressources/veille-juridique-cse' },
          ],
        },
        {
          heading: 'Le PV en pratique',
          items: [
            { label: 'Contenu obligatoire du PV', href: '/services/guides/pv-cse-contenu-obligatoire' },
            { label: 'Délais, approbation, signature', href: '/services/guides/delai-pv-cse' },
            { label: 'Synthétique ou intégral ?', href: '/services/guides/pv-cse-synthetique-ou-integral' },
            { label: 'Délit d’entrave & code du travail', href: '/services/guides/pv-cse-delit-entrave' },
          ],
        },
        {
          heading: 'Le CSE en pratique',
          items: [
            { label: 'Droits & moyens des élus', href: '/atoopv/ressources/droits-elus-cse-guide-juridique' },
            { label: 'Information-consultation & BDESE', href: '/services/guides/information-consultation-cse' },
            { label: 'Réunions & fonctionnement', href: '/services/guides/reunion-extraordinaire-cse' },
            { label: 'Comptes & contrôle URSSAF', href: '/atoopv/ressources' },
          ],
        },
      ],
      cities: {
        heading: 'PV par ville',
        label: 'Lyon · Paris · Marseille · Toulouse · Bordeaux · Nantes · Lille · Grenoble · Saint-Étienne · Clermont-Ferrand · Annecy',
        linkLabel: 'Voir le hub des 11 villes',
        href: '/services/by-city',
      },
    },
    mobileItems: [
      { label: 'Actualité sociale', href: '/atoopv/ressources/actualite-sociale' },
      { label: 'Jurisprudence', href: '/atoopv/ressources/jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse' },
      { label: 'Cas pratiques', href: '/atoopv/ressources/cas-pratiques' },
      { label: 'Le PV en pratique', href: '/services/guides/pv-cse-contenu-obligatoire' },
      { label: 'Le CSE en pratique', href: '/atoopv/ressources/droits-elus-cse-guide-juridique' },
      { label: 'PV par ville', href: '/services/by-city' },
    ],
  },
  { label: 'À propos', href: '/atoopv/a-propos' },
  // TEMPORARY — client-facing design showcase link; remove once the review
  // round is done and any adopted directions have shipped to the real site.
  { label: 'Design Test', href: '/design-test' },
]

/** Mobile-only: kept as the burger menu's first row (see ATOOPV_NAV's own
 * comment — desktop drops "Accueil" entirely, reached via the logo instead). */
export const MOBILE_HOME_LINK = { label: 'Accueil', href: '/atoopv' }

/** No /contact/ route exists in this app — every "Devis PV" / "Demander un
 * devis" / "Nous contacter" CTA in the brief resolves to the closest
 * existing equivalent, the quote/pricing page. */
export const DEVIS_CTA_HREF = '/atoopv/tarification'

/** Full desktop top-level order: Story (unchanged, Astera-only) followed by
 * the six ATOOPV entries. Mobile renders MOBILE_HOME_LINK first, then this
 * same array — see Navbar.jsx. */
export const NAV_LINKS = [STORY_NAV, ...ATOOPV_NAV]

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
