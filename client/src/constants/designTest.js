/**
 * Content for the /design-test Design & Motion Lab. Kept separate from
 * component code so the six experiments stay easy to re-read and re-tune
 * independently of their motion logic. French is used for ATOOPV workflow
 * content (matching the rest of the site); design-lab meta labels stay
 * English by design — see the PROMPT 1 brief.
 */

export const LAB_META = {
  eyebrow: 'ATOOPV / EXPERIMENTAL INTERFACE',
  titleLines: ['DESIGN &', 'MOTION LAB'],
  lead: 'Exploring new ways to transform meetings into structured intelligence.',
  count: '11 EXPERIMENTS',
  scrollCue: 'SCROLL TO EXPLORE',
  year: '2026',
}

/**
 * `layout` is the scroll choreography target for Experiment 01: where the
 * numeral + content pair sit on the canvas (percent of the pinned viewport's
 * free area) and how dominant the numeral is at that stage. Positions trace
 * a deliberate architectural path — rising left-to-right, a "review" dip
 * back down for Validation, then settling dominant and centered for the
 * final Procès-verbal — rather than staying in one fixed template.
 */
export const STRUCTURED_STAGES = [
  {
    id: 'reunion',
    number: '01',
    name: 'Réunion',
    meta: 'SOURCE / AUDIO + VIDÉO',
    description: 'La conversation brute, captée dans son intégralité — rien ne se perd.',
    layout: { numX: 6, numY: 46, scale: 0.95, contentX: 6, contentY: 70, width: '20rem' },
  },
  {
    id: 'transcription',
    number: '02',
    name: 'Transcription',
    meta: 'PROCESS / SPEECH-TO-TEXT',
    description: 'Chaque intervention posée, horodatée et attribuée au bon interlocuteur.',
    layout: { numX: 26, numY: 26, scale: 1.0, contentX: 26, contentY: 50, width: '20rem' },
  },
  {
    id: 'analyse',
    number: '03',
    name: 'Analyse',
    meta: 'PROCESS / EXTRACTION',
    description: 'Les décisions, actions et points clés extraits du bruit conversationnel.',
    layout: { numX: 46, numY: 10, scale: 1.02, contentX: 46, contentY: 34, width: '20rem' },
  },
  {
    id: 'validation',
    number: '04',
    name: 'Validation',
    meta: 'CHECK / RELECTURE',
    description: 'Relecture, ajustements et vérification avant diffusion.',
    layout: { numX: 26, numY: 46, scale: 0.96, contentX: 26, contentY: 70, width: '20rem' },
  },
  {
    id: 'proces-verbal',
    number: '05',
    name: 'Procès-verbal',
    meta: 'OUTPUT / DOCUMENT FINAL',
    description: 'Le document final, structuré et prêt à être partagé.',
    layout: { numX: 56, numY: 22, scale: 1.18, contentX: 56, contentY: 46, width: '23rem' },
  },
]

export const BLUEPRINT_META = {
  tagline: 'IDEAS TO IMPACT. A CLEARER WAY FORWARD.',
  description:
    'From ideas to implementation — a living system that helps you capture, transcribe, understand, structure, validate and deliver.',
}

/**
 * `accent` keys into the shared Tailwind color tokens (see tailwind.config.js)
 * — chosen so the six-stage signal reads as one deliberate progression
 * (blue → violet → green → amber → coral → cyan) rather than a random
 * palette. `tagline` is the short architectural-annotation copy shown next
 * to a node on hover/active; `note` (existing) stays the longer descriptive
 * line shown in the bottom metadata bar.
 */
export const BLUEPRINT_NODES = [
  {
    id: 'capture',
    label: 'CAPTURE',
    x: 0.08,
    y: 0.78,
    accent: 'royal',
    tagline: 'Bring every conversation to life.',
    note: 'Audio et vidéo enregistrés sans perte de contexte.',
  },
  {
    id: 'transcribe',
    label: 'TRANSCRIBE',
    x: 0.27,
    y: 0.28,
    accent: 'purple',
    tagline: 'Turn speech into structured content.',
    note: 'Chaque mot transcrit et horodaté automatiquement.',
  },
  {
    id: 'understand',
    label: 'UNDERSTAND',
    x: 0.46,
    y: 0.72,
    accent: 'emerald',
    tagline: 'Find what matters, faster.',
    note: "Le sens et l'intention derrière chaque échange.",
  },
  {
    id: 'structure',
    label: 'STRUCTURE',
    x: 0.65,
    y: 0.24,
    accent: 'golden',
    tagline: 'Organize ideas into clarity.',
    note: 'Sections, décisions et actions organisées.',
  },
  {
    id: 'validate',
    label: 'VALIDATE',
    x: 0.82,
    y: 0.7,
    accent: 'coral',
    tagline: 'Ensure accuracy and compliance.',
    note: 'Vérifié et conforme avant diffusion.',
  },
  {
    id: 'deliver',
    label: 'DELIVER',
    x: 0.94,
    y: 0.22,
    accent: 'sky',
    tagline: 'Turn insights into real change.',
    note: 'Le PV livré, prêt à être partagé.',
  },
]

export const EDITORIAL_PROCESS_STAGES = [
  {
    number: '01',
    title: 'Capturer la réunion',
    description: "L'enregistrement démarre en un clic, sans matériel supplémentaire ni friction.",
  },
  {
    number: '02',
    title: 'Transcrire la conversation',
    description: 'La parole devient texte structuré, interlocuteur par interlocuteur.',
  },
  {
    number: '03',
    title: "Extraire l'essentiel",
    description: 'Décisions, actions et échéances identifiées automatiquement.',
  },
  {
    number: '04',
    title: 'Valider les informations',
    description: 'Une relecture rapide confirme la fidélité du compte-rendu.',
  },
  {
    number: '05',
    title: 'Livrer le PV',
    description: 'Un document prêt à diffuser, dans le format attendu.',
  },
]

export const TYPOGRAPHY_WORDS = {
  brand: 'ATOOPV',
  watermark: '01',
  document: 'PV',
  documentCaption: 'PROCÈS-VERBAL / Le document final, structuré, généré en quelques minutes.',
  stat: '48–72H',
  statCaption: 'DÉLAI DE LIVRAISON MOYEN',
  fields: [
    { word: 'RÉUNION', caption: 'CHAMP / 01' },
    { word: 'DÉCISION', caption: 'CHAMP / 02' },
    { word: 'ACTION', caption: 'CHAMP / 03' },
  ],
}

/**
 * Experiment 04's closing scroll moment: scattered transcript words drift
 * toward the center and resolve into two structured results — language
 * becoming intelligence, in the same visual grammar as Experiment 06's
 * fragments converging into a document (position/scale/opacity only).
 */
export const KINETIC_WORDS = [
  { text: 'budget', x: 12, y: 20, rotate: -6 },
  { text: 'vendredi', x: 78, y: 14, rotate: 5 },
  { text: 'validation', x: 46, y: 8, rotate: -3 },
  { text: 'président', x: 8, y: 62, rotate: 4 },
  { text: 'document', x: 84, y: 58, rotate: -5 },
  { text: 'vote', x: 30, y: 80, rotate: 6 },
  { text: 'Marie', x: 62, y: 78, rotate: -4 },
  { text: 'envoyer', x: 20, y: 42, rotate: 3 },
  { text: 'décision', x: 68, y: 36, rotate: -2 },
]

export const KINETIC_RESULTS = [
  { label: 'DÉCISION', text: 'Budget validé.', x: 32 },
  { label: 'ACTION', text: 'Marie envoie le document vendredi.', x: 68 },
]

export const ORCHESTRATED_PANELS = [
  { number: '01', title: 'Capturer', description: "L'audio et la vidéo saisis intégralement, sans perte.", accent: 'royal', visual: 'waveform' },
  { number: '02', title: 'Transcrire', description: 'Chaque mot posé et attribué au bon interlocuteur.', accent: 'coral', visual: 'transcript' },
  { number: '03', title: 'Comprendre', description: 'Le sens extrait au-delà du simple texte.', accent: 'golden', visual: 'connect' },
  { number: '04', title: 'Valider', description: 'Une vérification rapide avant diffusion.', accent: 'emerald', visual: 'check' },
  { number: '05', title: 'Livrer', description: 'Le procès-verbal, prêt à être partagé.', accent: 'sky', visual: 'deliver' },
]

/**
 * Experiment 06's six-state scroll story, one waypoint set per fragment:
 *
 *   stacked   — a loose central pile (state 1: raw, chaotic conversation)
 *   readable  — an editorial two-row spread where every card can be read
 *               at once (state 3); `readableMobile` is the vertical-list
 *               equivalent for narrow screens, reused for BOTH the
 *               "readable" and "organized" states there (see the brief's
 *               simplified mobile sequence — it merges those two beats)
 *   organized — thematic clusters, rotation settled to 0 (state 5)
 *   converge  — where the card visually travels into the assembled
 *               document (state 6): the two discussion quotes head for the
 *               summary area above the fields, each semantic card for
 *               roughly where its own field row sits
 *
 * `group` is used only by the reduced-motion static fallback, which
 * groups fragments into three plain columns instead of animating them.
 */
export const CONNECTED_PHASES = ['CONVERSATION', 'SÉPARATION', 'LECTURE', 'COMPRÉHENSION', 'STRUCTURE', 'DOCUMENT']

export const CONNECTED_FRAGMENTS = [
  {
    id: 'president',
    role: 'PRÉSIDENT',
    kind: 'quote',
    text: 'Il faut confirmer le budget avant vendredi.',
    tag: 'DISCUSSION',
    group: 'discussion',
    stacked: { x: 47, y: 44, rotate: -8 },
    readable: { x: 16, y: 22, rotate: 2 },
    readableMobile: { x: 50, y: 4, rotate: 0 },
    organized: { x: 20, y: 26, rotate: 0 },
    converge: { x: 50, y: 34 },
  },
  {
    id: 'tresorier',
    role: 'TRÉSORIER',
    kind: 'quote',
    text: 'Le montant reste à valider.',
    tag: 'RISQUE',
    group: 'discussion',
    stacked: { x: 53, y: 41, rotate: 6 },
    readable: { x: 40, y: 22, rotate: -2 },
    readableMobile: { x: 50, y: 18, rotate: 0 },
    organized: { x: 30, y: 54, rotate: 0 },
    converge: { x: 50, y: 38 },
  },
  {
    id: 'secretaire',
    role: 'SECRÉTAIRE',
    kind: 'quote',
    text: 'Je peux envoyer le document demain.',
    tag: 'ACTION',
    group: 'actions',
    stacked: { x: 51, y: 53, rotate: -5 },
    readable: { x: 18, y: 66, rotate: -2 },
    readableMobile: { x: 50, y: 32, rotate: 0 },
    organized: { x: 76, y: 24, rotate: 0 },
    converge: { x: 50, y: 48 },
  },
  {
    id: 'decision',
    role: 'DÉCISION',
    kind: 'tag',
    text: 'Budget approuvé',
    tag: 'DÉCISION',
    group: 'decisions',
    stacked: { x: 45, y: 49, rotate: 5 },
    readable: { x: 64, y: 22, rotate: 2 },
    readableMobile: { x: 50, y: 46, rotate: 0 },
    organized: { x: 50, y: 18, rotate: 0 },
    converge: { x: 50, y: 44 },
  },
  {
    id: 'owner',
    role: 'RESPONSABLE',
    kind: 'tag',
    text: 'Julie — suivi budget',
    tag: 'OWNER',
    group: 'actions',
    stacked: { x: 56, y: 46, rotate: -4 },
    readable: { x: 48, y: 66, rotate: 2 },
    readableMobile: { x: 50, y: 60, rotate: 0 },
    organized: { x: 72, y: 56, rotate: 0 },
    converge: { x: 50, y: 52 },
  },
  {
    id: 'vote',
    role: 'VOTE',
    kind: 'tag',
    text: 'Adopté à l’unanimité',
    tag: 'VOTE',
    group: 'decisions',
    stacked: { x: 55, y: 51, rotate: 7 },
    readable: { x: 82, y: 66, rotate: -2 },
    readableMobile: { x: 50, y: 74, rotate: 0 },
    organized: { x: 52, y: 48, rotate: 0 },
    converge: { x: 50, y: 56 },
  },
  {
    id: 'action2',
    role: 'ACTION',
    kind: 'tag',
    text: 'Relance fournisseur lundi',
    tag: 'ACTION',
    group: 'actions',
    stacked: { x: 48, y: 57, rotate: -6 },
    readable: { x: 86, y: 22, rotate: -2 },
    readableMobile: { x: 50, y: 90, rotate: 0 },
    organized: { x: 64, y: 76, rotate: 0 },
    converge: { x: 50, y: 48 },
  },
]

export const CONNECTED_GROUPS = [
  { id: 'discussion', label: 'DISCUSSION', x: 25 },
  { id: 'decisions', label: 'DÉCISIONS', x: 50 },
  { id: 'actions', label: 'ACTIONS', x: 75 },
]

// Which fragments visually connect during the "understanding" phase.
export const CONNECTED_LINKS = [
  ['president', 'decision'],
  ['tresorier', 'vote'],
  ['secretaire', 'action2'],
]

export const CONNECTED_ANNOTATIONS = ['Décisions détectées', 'Actions assignées', 'Participants identifiés', 'Résumé généré']

export const CONNECTED_STATEMENT = ['74 minutes de conversation.', 'Un document clair.']

export const OUTRO_STATEMENT = ['CONVERSATION', 'BECOMES', 'STRUCTURE.']

export const EXPERIMENTS = [
  { id: 'experiment-01', number: '01', label: 'Structured Intelligence' },
  { id: 'experiment-02', number: '02', label: 'Living Blueprint' },
  { id: 'experiment-03', number: '03', label: 'Editorial Process' },
  { id: 'experiment-04', number: '04', label: 'Typographic System' },
  { id: 'experiment-05', number: '05', label: 'Orchestrated Intelligence' },
  { id: 'experiment-06', number: '06', label: 'Connected Document' },
  { id: 'experiment-07', number: '07', label: 'Training Explorer' },
  { id: 'experiment-08', number: '08', label: 'Blog Timeline' },
  { id: 'experiment-09', number: '09', label: 'Compliance Books' },
  { id: 'experiment-10', number: '10', label: 'Report Page Flip' },
  { id: 'experiment-11', number: '11', label: 'Common Questions' },
]

/**
 * Experiment 11 — a close visual reproduction of a supplied FAQ/accordion
 * reference (dark frame around a soft white panel). The five questions and
 * item 2's answer are given verbatim by the brief; the other four answers
 * are original ATOOPV-relevant copy written to match that same register.
 * Kept in English throughout for internal consistency with the reference's
 * exact given text, in the same spirit as the lab's English meta-labels.
 */
export const FAQ_ITEMS = [
  {
    id: 'industries',
    question: 'What industries do you work with?',
    answer:
      'We work with CSE, CSSCT and IRP instances of any size — from local SMEs to CAC 40 groups — across construction, hospitality, social housing, industry, logistics, healthcare and financial services.',
  },
  {
    id: 'implementation',
    question: 'How long does implementation take?',
    answer:
      'Project timelines typically range from 2 to 6 weeks, depending on complexity.\nSmaller automation systems — such as AI chatbots with CRM integration — can often be deployed within 2–3 weeks.\nMore advanced projects involving multi-platform integrations, custom AI logic, internal workflow automation, and reporting dashboards may take 4–6 weeks or longer.',
  },
  {
    id: 'technical',
    question: 'Do we need technical knowledge to work with you?',
    answer:
      'No. You bring the meeting — we bring the structure. Join in person or send a recording; there is no software to install and nothing technical required on your side.',
  },
  {
    id: 'security',
    question: 'Is AI automation secure?',
    answer:
      'Every recording and transcript is covered by an NDA and handled exclusively by our own team. Nothing is retained beyond delivery, and no client content is ever used to train a model.',
  },
  {
    id: 'roi',
    question: 'What kind of ROI can we expect?',
    answer:
      'Most CSE secretaries reclaim several hours per meeting cycle no longer spent drafting or chasing corrections — with a compliant, opposable procès-verbal delivered in 48 to 72 hours.',
  },
]

/**
 * ————————————————————————————————————————————————————————————————
 * EXPERIMENTS 07–10 — four independent creative concepts, each with its
 * own UI language. Content is realistic ATOOPV-relevant demo data; no
 * production data, no real payment/backend, no external assets.
 * ————————————————————————————————————————————————————————————————
 */

// 07 — FORMATIONS / TRAINING EXPLORER ————————————————————————————————

export const TRAINING_CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'economique', label: 'Économique' },
  { id: 'tresorier', label: 'Trésorier' },
  { id: 'cssct', label: 'CSSCT' },
  { id: 'juridique', label: 'Juridique' },
  { id: 'sante', label: 'Santé & sécurité' },
  { id: 'management', label: 'Management' },
]

export const TRAININGS = [
  {
    id: 'formation-economique',
    title: 'Formation économique',
    category: 'economique',
    duration: '3 jours',
    format: 'Présentiel',
    org: 'ATOOPV Institut',
    date: '14–16 oct. 2026',
    description:
      "Comprendre les comptes de l'entreprise, lire un bilan et un compte de résultat, et exercer pleinement les attributions économiques du CSE.",
    related: ['tresorier-cse', 'budget-comptabilite'],
  },
  {
    id: 'tresorier-cse',
    title: 'Trésorier du CSE',
    category: 'tresorier',
    duration: '2 jours',
    format: 'Présentiel',
    org: 'ATOOPV Institut',
    date: '4–5 nov. 2026',
    description: 'Budget de fonctionnement, budget ASC, obligations comptables : maîtriser le rôle de trésorier au quotidien.',
    related: ['formation-economique', 'dialogue-social'],
  },
  {
    id: 'cssct-roles',
    title: 'CSSCT — rôles et missions',
    category: 'cssct',
    duration: '2 jours',
    format: 'Hybride',
    org: 'ATOOPV Institut',
    date: '18–19 nov. 2026',
    description: "Le périmètre d'action de la commission santé, sécurité et conditions de travail, et son articulation avec le CSE.",
    related: ['sante-securite', 'droit-travail'],
  },
  {
    id: 'secretaire-cse',
    title: 'Formation secrétaire CSE',
    category: 'management',
    duration: '3 jours',
    format: 'Présentiel',
    org: 'ATOOPV Institut',
    date: '25–27 nov. 2026',
    description: "Organiser les réunions, rédiger l'ordre du jour et le procès-verbal, piloter la vie institutionnelle du CSE.",
    related: ['dialogue-social', 'droit-travail'],
  },
  {
    id: 'droit-travail',
    title: 'Droit du travail',
    category: 'juridique',
    duration: '2 jours',
    format: 'Distanciel',
    org: 'ATOOPV Institut',
    date: '2–3 déc. 2026',
    description: 'Les fondamentaux du droit du travail utiles à un élu : contrat, durée du travail, discipline, contentieux.',
    related: ['cssct-roles', 'secretaire-cse'],
  },
  {
    id: 'sante-securite',
    title: 'Santé & sécurité',
    category: 'sante',
    duration: '2 jours',
    format: 'Présentiel',
    org: 'ATOOPV Institut',
    date: '9–10 déc. 2026',
    description: 'Prévention des risques professionnels, document unique, enquêtes accident du travail.',
    related: ['cssct-roles', 'droit-travail'],
  },
  {
    id: 'dialogue-social',
    title: 'Dialogue social',
    category: 'management',
    duration: '1 jour',
    format: 'Distanciel',
    org: 'ATOOPV Institut',
    date: '16 déc. 2026',
    description: 'Construire une relation constructive avec la direction : posture, négociation, communication.',
    related: ['secretaire-cse', 'tresorier-cse'],
  },
]

// 08 — BLOG / ATOOSAVOIR / INSIGHTS ——————————————————————————————————

export const BLOG_TOPICS = ['Tous', 'Actualité CSE', 'Juridique', 'Budget', 'Santé au travail', 'Procès-verbal', 'Négociation', 'Formation']

export const BLOG_ARTICLES = [
  {
    id: 'a1',
    date: '2024-03-08',
    year: '2024',
    month: 'MARS',
    topic: 'Juridique',
    title: 'Les nouvelles obligations du CSE en matière de RGPD',
    excerpt: 'Ce que change la mise à jour du règlement pour la gestion des données des salariés.',
    readingTime: '5 min',
    author: 'Équipe ATOOPV',
  },
  {
    id: 'a2',
    date: '2024-09-19',
    year: '2024',
    month: 'SEPT',
    topic: 'Budget',
    title: 'Bien répartir le budget ASC en fin d’exercice',
    excerpt: 'Trois méthodes simples pour clôturer un exercice budgétaire sans mauvaise surprise.',
    readingTime: '6 min',
    author: 'Julie Marchand',
  },
  {
    id: 'a3',
    date: '2025-01-22',
    year: '2025',
    month: 'JANV',
    topic: 'Procès-verbal',
    title: 'Rédiger un procès-verbal opposable en moins de 48h',
    excerpt: "La méthode ATOOPV pour transformer une réunion en document diffusable rapidement.",
    readingTime: '4 min',
    author: 'Équipe ATOOPV',
  },
  {
    id: 'a4',
    date: '2025-05-06',
    year: '2025',
    month: 'MAI',
    topic: 'Santé au travail',
    title: 'Document unique : les erreurs les plus fréquentes',
    excerpt: 'Un tour d’horizon des oublis qui exposent employeur et CSE lors d’un contrôle.',
    readingTime: '7 min',
    author: 'Marc Dubreuil',
  },
  {
    id: 'a5',
    date: '2025-08-14',
    year: '2025',
    month: 'AOÛT',
    topic: 'Négociation',
    title: 'Préparer une NAO : la check-list en 9 points',
    excerpt: 'Chiffres, revendications, calendrier : ce qu’il faut réunir avant la première séance.',
    readingTime: '5 min',
    author: 'Équipe ATOOPV',
  },
  {
    id: 'a6',
    date: '2025-11-03',
    year: '2025',
    month: 'NOV',
    topic: 'Actualité CSE',
    title: 'Ce que la loi de finances 2026 change pour les CSE',
    excerpt: 'Les mesures qui touchent directement le fonctionnement des instances représentatives.',
    readingTime: '6 min',
    author: 'Julie Marchand',
  },
  {
    id: 'a7',
    date: '2026-02-11',
    year: '2026',
    month: 'FÉVR',
    topic: 'Formation',
    title: 'CSSCT : faut-il systématiquement former ses membres ?',
    excerpt: "Un état des lieux des obligations réelles, au-delà des idées reçues.",
    readingTime: '4 min',
    author: 'Marc Dubreuil',
  },
  {
    id: 'a8',
    date: '2026-05-27',
    year: '2026',
    month: 'MAI',
    topic: 'Juridique',
    title: 'Consultation économique : les délais à ne pas manquer',
    excerpt: 'Un rappel précis des délais légaux pour chaque type de consultation du CSE.',
    readingTime: '5 min',
    author: 'Équipe ATOOPV',
  },
  {
    id: 'a9',
    date: '2026-09-01',
    year: '2026',
    month: 'SEPT',
    topic: 'Actualité CSE',
    title: 'ATOOPV, un an après : ce que les CSE en retiennent',
    excerpt: "Retour sur douze mois d'usage, avec les élus qui ont changé leur manière de travailler.",
    readingTime: '6 min',
    author: 'Équipe ATOOPV',
  },
]

// 09 — COMPLIANCE BOOKS / BOUTIQUE CONFORMITÉ ————————————————————————

export const BOOK_CATEGORIES = ['Tous', 'CSE', 'Juridique', 'Finance', 'Santé', 'Management', 'Procès-verbal']

export const BOOKS = [
  {
    id: 'guide-pratique-cse',
    title: 'Guide pratique du CSE',
    author: 'ATOOPV Éditions',
    category: 'CSE',
    price: '24,90 €',
    pages: 168,
    accent: 'golden',
    featured: true,
    description:
      "Le manuel de référence pour comprendre les attributions, le fonctionnement et les moyens du comité social et économique.",
    owned: true,
    progress: 0.62,
    chapters: [
      { title: '1. Mettre en place le CSE', excerpt: 'La composition, les élections, la durée des mandats et les moyens attribués à l’instance dès sa constitution.' },
      { title: '2. Les attributions économiques', excerpt: 'Consultations obligatoires, informations récurrentes, et le rôle de la BDESE dans le dialogue avec la direction.' },
      { title: '3. Les attributions sociales et culturelles', excerpt: 'Construire une politique ASC cohérente, du budget à la communication auprès des salariés.' },
      { title: '4. Le fonctionnement au quotidien', excerpt: 'Réunions, ordre du jour, procès-verbal : les bons réflexes pour une instance qui fonctionne sereinement.' },
    ],
  },
  {
    id: 'pv-cse',
    title: 'Le procès-verbal du CSE',
    author: 'ATOOPV Éditions',
    category: 'Procès-verbal',
    price: '19,90 €',
    pages: 96,
    accent: 'royal',
    description: "Rédiger un procès-verbal clair, complet et opposable : méthode, structure type et pièges à éviter.",
    owned: false,
    progress: 0,
    chapters: [
      { title: '1. À quoi sert le procès-verbal', excerpt: 'Sa valeur juridique, ses destinataires, et pourquoi il engage durablement le CSE.' },
      { title: '2. La structure type', excerpt: 'Ordre du jour, présents, décisions, actions, votes : l’ossature d’un PV complet.' },
      { title: '3. Rédiger sous contrainte de temps', excerpt: 'Des méthodes pour produire un document fiable rapidement après la réunion.' },
    ],
  },
  {
    id: 'droit-travail-2026',
    title: 'Droit du travail — édition 2026',
    author: 'Collectif ATOOPV',
    category: 'Juridique',
    price: '34,90 €',
    pages: 312,
    accent: 'purple',
    description: 'La mise à jour annuelle des textes et de la jurisprudence essentiels à l’exercice du mandat.',
    owned: true,
    progress: 0.18,
    chapters: [
      { title: '1. Le contrat de travail', excerpt: 'Formation, modification, rupture : les points de vigilance pour un élu du personnel.' },
      { title: '2. Durée et organisation du travail', excerpt: 'Temps de travail, repos, forfaits : ce qui a changé cette année.' },
      { title: '3. Contentieux et procédures', excerpt: 'Les étapes clés d’un contentieux prud’homal et le rôle du CSE.' },
    ],
  },
  {
    id: 'budget-comptabilite',
    title: 'Budget et comptabilité du CSE',
    author: 'Julie Marchand',
    category: 'Finance',
    price: '22,90 €',
    pages: 144,
    accent: 'emerald',
    description: 'Comprendre les deux budgets du CSE, leurs règles de transfert et les obligations comptables associées.',
    owned: false,
    progress: 0,
    chapters: [
      { title: '1. Les deux budgets', excerpt: 'Fonctionnement et ASC : origine, calcul et usages autorisés de chaque enveloppe.' },
      { title: '2. Obligations comptables', excerpt: 'Tenue des comptes, certification, publicité : ce que la loi impose selon la taille du CSE.' },
    ],
  },
  {
    id: 'cssct-guide-complet',
    title: 'CSSCT — guide complet',
    author: 'Marc Dubreuil',
    category: 'Santé',
    price: '27,90 €',
    pages: 188,
    accent: 'coral',
    description: 'De la mise en place de la commission à la conduite des enquêtes accident du travail.',
    owned: false,
    progress: 0,
    chapters: [
      { title: '1. Constituer la CSSCT', excerpt: 'Périmètre, membres, moyens : les décisions à prendre à la création de la commission.' },
      { title: '2. Prévenir les risques', excerpt: 'Document unique, inspections, droit d’alerte : l’action préventive au quotidien.' },
    ],
  },
  {
    id: 'negociation-collective',
    title: 'Négociation collective',
    author: 'ATOOPV Éditions',
    category: 'Management',
    price: '26,90 €',
    pages: 152,
    accent: 'sky',
    description: 'Préparer, mener et conclure une négociation avec la direction : méthode et postures.',
    owned: true,
    progress: 0.91,
    chapters: [
      { title: '1. Préparer la négociation', excerpt: 'Diagnostic, revendications, marges de manœuvre : construire une position solide.' },
      { title: '2. Mener les séances', excerpt: 'Postures, arguments, gestion du désaccord : conduire la discussion sans la subir.' },
      { title: '3. Conclure et suivre l’accord', excerpt: 'Signature, dépôt, suivi de l’application : ce qui se joue après la table des négociations.' },
    ],
  },
  {
    id: 'guide-secretaire-cse',
    title: 'Guide du secrétaire CSE',
    author: 'ATOOPV Éditions',
    category: 'CSE',
    price: '21,90 €',
    pages: 128,
    accent: 'golden',
    description: 'Le rôle pivot du secrétaire : ordre du jour conjoint, animation des réunions, suivi des décisions.',
    owned: false,
    progress: 0,
    chapters: [
      { title: '1. Le rôle du secrétaire', excerpt: 'Ses prérogatives propres et sa relation avec le président de séance.' },
      { title: '2. Piloter le suivi', excerpt: 'Garder trace des décisions et actions d’une réunion à l’autre.' },
    ],
  },
]

// 10 — RAPPORT / PROCÈS-VERBAL PREVIEW (PAGE FLIP) ———————————————————

export const REPORT_META = {
  title: 'PROCÈS-VERBAL',
  org: 'CSE — Société Demo SAS',
  date: '3 septembre 2026',
  meetingType: 'Réunion ordinaire',
  generatedBy: 'Généré par ATOOPV',
}

export const REPORT_PAGES = [
  { id: 'cover', number: '01', title: 'Couverture', kind: 'cover' },
  {
    id: 'resume',
    number: '02',
    title: 'Résumé exécutif',
    kind: 'text',
    body: [
      "La réunion ordinaire du CSE s'est tenue le 3 septembre 2026, réunissant 9 participants sur 11 membres convoqués.",
      "Trois décisions ont été adoptées, dont la validation du budget ASC du second semestre. Quatre actions ont été assignées avec des échéances sous 15 jours.",
      "Un point de vigilance a été identifié concernant le délai de réponse fournisseur, reporté au suivi de la prochaine séance.",
    ],
  },
  {
    id: 'participants',
    number: '03',
    title: 'Participants',
    kind: 'list',
    items: [
      { name: 'Président de séance', role: 'Direction', status: 'Présent' },
      { name: 'Secrétaire du CSE', role: 'Élu titulaire', status: 'Présent' },
      { name: 'Trésorier du CSE', role: 'Élu titulaire', status: 'Présent' },
      { name: 'Élu titulaire — Collège cadres', role: 'Élu titulaire', status: 'Présent' },
      { name: 'Élu suppléant', role: 'Élu suppléant', status: 'Excusé' },
      { name: 'Représentant syndical', role: 'RS', status: 'Présent' },
    ],
  },
  {
    id: 'decisions',
    number: '04',
    title: 'Décisions',
    kind: 'decisions',
    items: [
      { text: 'Budget ASC du second semestre approuvé.', tag: 'BUDGET' },
      { text: "Reconduction du prestataire de médecine du travail pour 2027.", tag: 'CONTRAT' },
      { text: 'Calendrier des réunions du 1er trimestre 2027 validé.', tag: 'ORGANISATION' },
    ],
  },
  {
    id: 'actions',
    number: '05',
    title: 'Actions & Responsables',
    kind: 'actions',
    items: [
      { text: 'Relancer le fournisseur sur le retard de livraison.', owner: 'Trésorier', due: '10 sept. 2026' },
      { text: 'Diffuser le calendrier des réunions aux salariés.', owner: 'Secrétaire', due: '12 sept. 2026' },
      { text: 'Préparer le dossier de consultation économique T4.', owner: 'Président', due: '20 sept. 2026' },
      { text: 'Planifier la visite CSSCT de l’atelier B.', owner: 'CSSCT', due: '25 sept. 2026' },
    ],
  },
  {
    id: 'votes',
    number: '06',
    title: 'Votes',
    kind: 'votes',
    items: [
      { subject: 'Budget ASC du second semestre', pour: 7, contre: 0, abstention: 1 },
      { subject: 'Reconduction du prestataire médecine du travail', pour: 6, contre: 1, abstention: 1 },
      { subject: 'Calendrier des réunions 2027', pour: 8, contre: 0, abstention: 0 },
    ],
  },
  {
    id: 'suivi',
    number: '07',
    title: 'Points à suivre',
    kind: 'list',
    items: [
      { name: 'Délai de réponse du fournisseur', role: 'Reporté', status: 'En cours' },
      { name: 'Retour de l’enquête CSSCT — atelier B', role: 'Prévu T4', status: 'En attente' },
      { name: 'Bilan de la NAO 2026', role: 'Séance suivante', status: 'À planifier' },
    ],
  },
  {
    id: 'annexes',
    number: '08',
    title: 'Annexes / Signatures',
    kind: 'signatures',
    items: [
      { name: 'Président de séance', role: 'Direction' },
      { name: 'Secrétaire du CSE', role: 'Élu titulaire' },
    ],
  },
]
