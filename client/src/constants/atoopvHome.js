/**
 * Content for the ported ATOOPV Accueil (home) page, transcribed verbatim
 * from content/home/accueil.md (the extraction of https://atoopv.com/).
 * Kept entirely in French — this is an internal migration of ATOOPV's own
 * site, not a translation task like the English /services content.
 *
 * The "veille juridique" and "ressources" links now point at the real
 * ported Ressources pages (/atoopv/ressources/...) built from
 * content/resources/*.md. What's still out of scope points forward to
 * routes that will ship with later phases (/atoopv/simulateur,
 * /atoopv/services, /atoopv/contact) rather than out to atoopv.com — this
 * is a migration, not a set of outbound links to the original site. The
 * source page also repeats its "Ressources gratuites" block verbatim twice
 * near the bottom; only the (more complete) second copy is represented here.
 */
import { FileText, Shield, Mic, Handshake, GraduationCap, Calculator, Award, Lock } from 'lucide-react'

/**
 * PLACEHOLDER CONTENT — NOT FINAL.
 *
 * Config for the two new editorial homepage sections ("The Process,
 * Recomposed" and "Orchestrated Intelligence"). The five-stage structure and
 * copy mirror the Design & Motion Lab reference (/design-test, Experiments
 * 03 and 05) purely as placeholder art direction — title/description/number/
 * accent are all data here specifically so the real copy can replace this
 * later without touching ProcessRecomposed.jsx / OrchestratedIntelligence.jsx.
 */
/**
 * "Nos instances" — new homepage section rendered via InfoCardSection,
 * placed directly below the existing "Nos expertises" FeatureGrid. French,
 * matching the equivalent section already established elsewhere in the
 * ATOOPV content set verbatim (kept in French per this page's own
 * convention — see file header).
 */
export const NOS_INSTANCES = {
  eyebrow: 'Nos instances',
  heading: 'Toutes les instances, tous les formats.',
  lead: "Du CSE au conseil d'établissement, un accompagnement adapté à chaque instance.",
  items: [
    {
      tag: 'CSE',
      title: 'Réunions ordinaires et extraordinaires',
      body: 'Rédaction fidèle, dans le respect du délai légal et du règlement intérieur.',
    },
    {
      tag: 'CSSCT',
      title: 'Santé, sécurité, conditions de travail',
      body: 'Un PV technique et précis, qui retranscrit les échanges sans les déformer.',
    },
    {
      tag: 'CSEC',
      title: 'Instances de coordination',
      body: 'Restitution neutre des positions de chaque établissement.',
    },
    {
      tag: 'Formation',
      title: 'Formation économique CSE',
      body: 'Un accompagnement pédagogique pour les élus, en complément de la rédaction.',
    },
  ],
}

export const HOMEPAGE_PROCESS = {
  eyebrow: 'PROCESS / 01',
  heading: ['THE PROCESS,', 'RECOMPOSED.'],
  stages: [
    { number: '01', title: 'Capturer la réunion', description: "L'enregistrement démarre en un clic, sans matériel supplémentaire ni friction." },
    { number: '02', title: 'Transcrire la conversation', description: 'La parole devient texte structuré, interlocuteur par interlocuteur.' },
    { number: '03', title: "Comprendre l'essentiel", description: 'Décisions, actions et échéances identifiées automatiquement.' },
    { number: '04', title: 'Valider les informations', description: 'Une relecture rapide confirme la fidélité du compte-rendu.' },
    { number: '05', title: 'Livrer le PV', description: 'Un document prêt à diffuser, dans le format attendu.' },
  ],
}

export const HOMEPAGE_ORCHESTRATED = {
  eyebrow: 'SYSTEM / 02',
  heading: ['ORCHESTRATED', 'INTELLIGENCE'],
  panels: [
    { number: 'DÉPÔT', title: 'Un enregistrement, un clic', description: 'Audio ou vidéo de votre réunion, déposé directement sur la plateforme.', accent: 'royal' },
    { number: 'TRAITEMENT', title: 'Structuration automatisée', description: "SIRUS transcrit, identifie les intervenants et organise le PV par point d'ordre du jour.", accent: 'coral' },
    { number: 'VALIDATION', title: 'Relecture avant diffusion', description: 'Une relecture qualité intégrée, puis validation par votre secrétaire avant envoi.', accent: 'golden' },
    // Intentionally blank per the brief — the fourth slot stays present
    // (border/background/hover) to keep the 4-column structure, with no
    // content invented for it.
    { number: '', title: '', description: '', accent: 'emerald' },
  ],
}

/**
 * "Notre conviction" — verbatim from the reference index.html's
 * `.positioning` section (kicker/h2/lede + 3 stat pairs). Rendered
 * immediately below the Orchestrated Intelligence 4-box grid.
 */
export const NOTRE_CONVICTION = {
  eyebrow: 'Notre conviction',
  heading: "Un PV de CSE mal rédigé n'est jamais neutre. Il peut être contesté, réécrit, remis en cause en réunion suivante.",
  lead: 'ALC retranscrit sans trahir depuis 2017. SIRUS industrialise cette exigence pour les réunions standardisées, sans jamais sacrifier la fidélité au débat.',
  stats: [
    { value: 'Depuis 2017', label: 'Expertise ALC' },
    { value: 'CSE · CSSCT · CSEC', label: 'Instances couvertes' },
    { value: 'Présentiel & distanciel', label: 'Deux modes d’intervention' },
  ],
}

/**
 * "Comment ça marche" — verbatim from the reference index.html's two
 * parallel-tracks section. Rendered directly below Notre conviction.
 */
export const COMMENT_CA_MARCHE = {
  eyebrow: 'Comment ça marche',
  heading: "Deux façons de travailler, un même niveau d'exigence.",
  tracks: [
    {
      title: 'Parcours ALC — rédaction humaine',
      steps: [
        { title: 'Prise de rendez-vous', description: 'Réunion planifiée avec votre CSE.' },
        { title: 'Présence en réunion', description: 'Physique ou visio, selon votre organisation.' },
        { title: 'Rédaction et relecture', description: 'Par un expert ALC, dans le respect du débat réel.' },
        { title: 'Validation et livraison', description: 'Dans le délai convenu avec votre secrétaire.' },
      ],
    },
    {
      title: 'Parcours SIRUS — génération assistée par IA',
      steps: [
        { title: "Dépôt de l'enregistrement", description: 'Audio ou vidéo de la réunion.' },
        { title: 'Traitement SIRUS', description: 'Transcription et structuration automatisées.' },
        { title: 'Relecture qualité', description: 'Contrôle avant diffusion.' },
        { title: 'Livraison et validation', description: 'Par le secrétaire, avant approbation.' },
      ],
    },
  ],
}

/**
 * "Ce que nous garantissons, sur les deux offres." — verbatim from the
 * reference index.html's value-pillars section. Fed into the existing,
 * unmodified `ProcessRecomposed` component (same `{eyebrow, heading,
 * stages:[{number,title,description}]}` shape it already consumes for
 * `HOMEPAGE_PROCESS`) so it reuses the exact same scroll-pinned
 * horizontal animation/counter — only the data changes for this call site.
 */
export const HOMEPAGE_GUARANTEES = {
  eyebrow: 'Pourquoi ATOOPV',
  heading: ['Ce que nous garantissons, sur les deux offres.'],
  stages: [
    { number: '01', title: 'Neutralité', description: 'Un tiers extérieur, sans enjeu dans les débats.' },
    { number: '02', title: 'Fidélité', description: "L'art de retranscrire, sans trahir." },
    { number: '03', title: 'Double expertise', description: 'Rédaction humaine pour les réunions complexes, génération IA pour les réunions standardisées.' },
    { number: '04', title: 'Confidentialité', description: "Chaque enregistrement et chaque échange est traité de façon confidentielle, dans le cadre de l'engagement contractuel qui nous lie à votre CSE." },
    { number: '05', title: "Capacité d'absorption", description: 'Une équipe dimensionnée pour suivre votre rythme de réunions, sans dégrader le délai de livraison.' },
    { number: '06', title: 'Accompagnement formation', description: 'Passerelle vers la formation économique CSE, en complément de la rédaction.' },
  ],
}

/**
 * Offer tiers — verbatim from the reference index.html's offer-details
 * section. Same `{tag, title, body}` shape `InfoCardSection` already
 * consumes for `NOS_INSTANCES`, reused as-is inside the new
 * AtoopvOffersTimeline section.
 */
export const ATOOPV_OFFERS = {
  eyebrow: 'Nos formats',
  heading: 'Le niveau de restitution adapté à chaque réunion.',
  items: [
    { tag: '90 € HT/h', title: 'Essentiel', body: 'Une synthèse fidèle, pour les réunions courtes et régulières.' },
    { tag: '130 € HT/h', title: 'Scope', body: "Une restitution structurée par point d'ordre du jour, générée par notre pipeline SIRUS — le niveau intermédiaire entre la synthèse Essentiel et le PV intégral Premium." },
    { tag: '150 € HT/h', title: 'Premium', body: 'Un PV intégral, rédigé par un expert, pour les réunions complexes ou à enjeux.' },
  ],
}

/**
 * Six compliance names (user-confirmed final list — index.html itself has
 * no set of six; it only supplied CSE/CSSCT/CSEC/Formation) driving the
 * AtoopvOffersTimeline rail instead of dates.
 */
export const COMPLIANCE_NAMES = ['CSE', 'CSEE', 'CSEC', 'CSSCT', 'CECO', 'QVCT']

/**
 * The homepage's "Compliance Books" teaser — a small glimpse into the real
 * Shop/Compliance Books experience at /atoopv/boutique, not the shop itself.
 *
 * `shopHref` originally pointed at /atoopv/ressources as an interim target,
 * back when no dedicated Shop route existed. Now that /atoopv/boutique is a
 * real page (see pages/atoopv/Boutique.jsx), this points there instead —
 * still the only value that needed to change.
 */
export const COMPLIANCE_BOOKS_TEASER = {
  eyebrow: 'RESSOURCES / 06',
  heading: ['COMPLIANCE', 'BOOKS.'],
  lead: 'Des guides pratiques pour comprendre, agir et maîtriser les enjeux du CSE.',
  categories: ['Tous', 'CSE', 'Juridique', 'Finance', 'Santé', 'Management', 'Procès-verbal'],
  shopHref: '/atoopv/boutique',
  featured: {
    category: 'CSE',
    badge: 'EN VEDETTE',
    title: 'Guide pratique du CSE',
    author: 'ATOOPV Éditions',
    description:
      "Le manuel de référence pour comprendre les attributions, le fonctionnement et les moyens du comité social et économique.",
    accent: 'golden',
  },
}

/**
 * The homepage hero's horizontal ticker — real ATOOPV service/section terms
 * (drawn from `ACCUEIL.expertise`/`veille`/`garanties` below), each linking
 * to the matching in-page section where one exists. `anchor: null` items are
 * decorative only, per the brief's "do not create fake navigation."
 */
export const HOME_TICKER = [
  { label: 'PROCÈS-VERBAL', anchor: '#expertise' },
  { label: 'CSSCT', anchor: '#expertise' },
  { label: 'RETRANSCRIPTION', anchor: '#expertise' },
  { label: 'FORMATION DES ÉLUS', anchor: '#expertise' },
  { label: 'VEILLE JURIDIQUE', anchor: '#veille' },
  { label: 'CONFORMITÉ', anchor: '#garanties' },
  { label: 'CSE · CSSCT · IRP', anchor: null },
]

/** Rotating text for the slim announcement bar above the homepage navbar
 * (AtoopvAnnouncementBar). Kept as a plain string array so it's trivial to
 * replace/extend later without touching the component. */
export const ANNOUNCEMENT_MESSAGES = [
  'Nouveau : autodiagnostic gratuit de conformité CSE en 2 minutes.',
  'Délai de livraison : 48 à 72h sur vos procès-verbaux.',
  'Formation économique des élus du CSE — session Région AURA.',
]

export const ATOOPV_STATS = [
  { value: '48 h', label: 'Projet de PV remis' },
  { value: '3 → 1', label: 'Formats livrés, un seul facturé' },
  { value: 'Incluse', label: 'Newsletter aux salariés' },
  { value: 'PME → CAC 40', label: 'Instances suivies' },
]

export const ACCUEIL = {
  hero: {
    badge: 'Agréé au titre de la formation économique des membres du CSE — Région AURA',
    title: 'Vos PV de CSE, CSSCT et IRP rédigés par des *experts des instances représentatives du personnel*.',
    lead: 'Depuis 2017, AtooPV accompagne les CSE, CSSCT et IRP dans la rédaction de leurs procès-verbaux. Nos experts interviennent en présentiel ou à distance pour produire des PV conformes, précis et opposables.',
    primaryCta: { label: 'Demander un devis gratuit', to: '/atoopv/contact' },
    secondaryCta: { label: 'Simuler mon budget', to: '/atoopv/simulateur' },
    image: { src: '/atoopv-media/hero-salle-reunion.webp', alt: 'Salle de réunion équipée, prête pour une séance de CSE' },
  },
  statsCaption: 'De la *PME aux groupes cotés au CAC 40* — formation finançable sur budget CSE (Art. L.2315-63 CT)',
  expertise: {
    eyebrow: 'Nos expertises',
    heading: 'Une expertise complète au service de vos instances',
    lead: 'De la rédaction du premier PV à la formation de vos élus, AtooPV couvre l’intégralité du cycle de vie de votre CSE.',
    items: [
      {
        icon: FileText,
        title: 'Rédaction PV de CSE',
        body: 'Procès-verbaux conformes au Code du travail, livrés sous 48 à 72h. Intervention en présentiel ou sur enregistrement fourni. Conformité Art. L.2315-34.',
        cta: { label: 'Découvrir →', to: '/atoopv/services' },
      },
      {
        icon: Shield,
        title: 'Rédaction PV CSSCT',
        body: 'Comptes-rendus de réunions CSSCT avec maîtrise des enjeux santé-sécurité. Identification des risques, suivi des alertes, traçabilité des décisions.',
        cta: { label: 'Découvrir →', to: '/atoopv/services' },
      },
      {
        icon: Mic,
        title: 'Retranscription audio/vidéo',
        body: 'Vos enregistrements transformés en verbatim structuré et exploitable. Idéal pour les réunions à distance ou les instances à fort volume d’échanges.',
        cta: { label: 'Découvrir →', to: '/atoopv/services' },
      },
      {
        icon: Handshake,
        title: 'Assistance aux élus',
        body: 'Accompagnement des secrétaires de CSE dans la préparation et la rédaction de leurs PV. Formulation juridique, structure des délibérations, relecture experte.',
        cta: { label: 'Découvrir →', to: '/atoopv/services' },
      },
      {
        icon: GraduationCap,
        title: 'Formation des élus',
        body: 'Organisme agréé au titre de la formation économique des membres du CSE — Région AURA. Formations finançables (art. L.2315-63 CT) : droit du travail, CSSCT, heures de délégation, lecture des comptes.',
        cta: { label: 'Découvrir →', to: '/atoopv/services' },
      },
      {
        icon: Calculator,
        eyebrow: 'Simulation gratuite',
        title: 'Estimez votre budget en 30 secondes',
        body: 'Devis personnalisé sans engagement. Réponse sous 24h par un expert ALC SAS.',
        cta: { label: 'Simuler mon budget →', to: '/atoopv/simulateur' },
        featured: true,
      },
    ],
  },
  process: {
    eyebrow: 'Notre processus',
    heading: 'De la réunion au PV validé — 3 étapes',
    lead: 'Un processus éprouvé depuis 2017, au service de la conformité juridique de vos instances.',
    steps: [
      {
        title: 'Briefing et préparation',
        body: 'Nous prenons connaissance de l’ordre du jour, des PV précédents et de la composition de l’instance. Aucun détail ne nous échappe.',
      },
      {
        title: 'Rédaction experte',
        body: 'En séance ou sur enregistrement, nos rédacteurs (niveau master, filières économiques et sociales) produisent un PV fidèle, structuré et juridiquement opposable.',
      },
      {
        title: 'Livraison sous 48 à 72h',
        body: 'Le PV finalisé vous est transmis dans les délais convenus. Corrections illimitées incluses jusqu’à validation définitive.',
      },
    ],
  },
  video: {
    eyebrow: 'Découvrez AtooPV',
    heading: 'Notre service de rédaction en vidéo',
    lead: 'Une présentation courte de notre méthode et de nos garanties, filmée par l’équipe AtooPV.',
    video: { src: 'https://atoopv.com/wp-content/uploads/2026/07/20260716_095703.mp4', poster: '/atoopv-media/video-poster.png' },
    cta: { label: 'Voir plus de vidéos sur notre chaîne YouTube →', to: 'https://youtube.com/@laminutecse' },
  },
  veille: {
    eyebrow: 'Veille juridique CSE',
    heading: 'Publications LinkedIn d’ALC SAS — 678 148 impressions',
    lead: 'Arrêts de la Cour de cassation, réformes législatives, jurisprudence sociale : les publications du président d’ALC SAS décryptées pour les élus CSE et les DRH.',
    items: [
      {
        badge: '198 272 impressions',
        title: 'Arrêt maladie : durée légale et LFSS 2026',
        body: 'Ce que change la loi de financement de la Sécurité sociale 2026 pour les employeurs et les CSE.',
        cta: 'Lire l’article →',
        to: '/atoopv/ressources/arret-maladie-duree-legale-lfss-2026-droits-salarie',
      },
      {
        badge: '144 000 impressions',
        title: 'Congé payé vendredi après 37h : le calcul qui surprend',
        body: 'Combien de jours de CP décomptés pour un vendredi posé après 37h lundi–jeudi ?',
        cta: 'Lire l’article →',
        to: '/atoopv/ressources/conge-paye-vendredi-37h-decompte-jours-ouvrables',
      },
      {
        badge: '131 000 impressions',
        title: 'CP + heures sup : 3 bulletins, 3 résultats',
        body: 'La règle du maintien de salaire et ses effets sur les bulletins de paie.',
        cta: 'Lire l’article →',
        to: '/atoopv/ressources/conges-payes-heures-supplementaires-calcul-bulletins-paie',
      },
    ],
    footerCta: { label: '⚖️ Voir toute la veille juridique CSE — 8 articles', to: '/atoopv/ressources/veille-juridique-cse' },
  },
  devis: {
    eyebrow: 'Devis qualifié — réponse sous 24h',
    heading: 'Estimez votre besoin en 2 minutes',
    body: 'Renseignez les caractéristiques de votre instance : nous revenons vers vous avec une proposition adaptée et un tarif clair.',
    primaryCta: { label: 'Faire ma simulation', to: '/atoopv/simulateur' },
  },
  garanties: {
    eyebrow: 'Reconnaissance & accréditations',
    heading: 'Des garanties concrètes pour votre instance',
    items: [
      {
        icon: Award,
        title: 'Agréé formation économique CSE',
        body: 'Organisme de formation officiel — Région AURA. Formations finançables sur budget CSE (Art. L.2315-63 CT).',
      },
      {
        icon: GraduationCap,
        title: 'Rédacteurs niveau master',
        body: '100% des rédacteurs AtooPV sont titulaires d’un master dans les filières économiques et sociales.',
      },
      {
        icon: Lock,
        title: 'Confidentialité totale',
        body: 'Données couvertes par NDA. Aucun contenu client n’est conservé au-delà de la livraison.',
      },
    ],
  },
  sectors: {
    eyebrow: 'Secteurs accompagnés depuis 2017',
    heading: 'Une expérience tous secteurs',
    items: ['🏗 Bâtiment & BTP', '🏨 Hôtellerie', '🏠 Bailleur social', '🏭 Industrie', '📦 Logistique', '🏥 Médico-social', '🏦 Services financiers'],
  },
  testimonials: {
    eyebrow: 'Témoignages',
    heading: 'Ce que disent nos clients',
    items: [
      {
        quote:
          'La qualité des procès-verbaux produits par AtooPV est irréprochable. L’équipe s’intègre parfaitement à notre réunion, les élus peuvent se concentrer sur les débats. Un partenaire indispensable pour notre CSE.',
        name: 'Sandra A.',
        role: 'Secrétaire CSE — Secteur Hôtellerie, Annecy',
        color: 'royal',
      },
      {
        quote:
          'AtooPV fournit exactement ce dont notre CSSCT a besoin pour travailler efficacement et disposer de documents opposables face à la direction. Rigueur, réactivité et vraie expertise juridique.',
        name: 'Bruno C.',
        role: 'Membre CSSCT — Secteur Industrie',
        color: 'coral',
      },
    ],
  },
  cta: {
    eyebrow: 'Passons à l’action',
    heading: 'Confiez-nous vos procès-verbaux dès aujourd’hui',
    body: 'Devis gratuit sous 24h. Première livraison sous 48 à 72h. Aucun engagement.',
    primaryCta: { label: 'Demander un devis gratuit', to: '/atoopv/contact' },
    secondaryCta: { label: 'Télécharger nos guides gratuits', to: '/atoopv/ressources' },
    legal: 'ALC SAS — SIREN 833 781 248 — Lyon · Annecy · contact@atoopv.com · 04 12 10 06 06',
  },
  resources: {
    eyebrow: 'Ressources gratuites',
    heading: 'Guides pratiques pour les élus du CSE',
    lead: 'Des fiches pédagogiques et livres blancs rédigés par nos experts, accessibles gratuitement.',
    items: [
      {
        badge: 'Nouveau',
        title: 'Comment lire un arrêt de la Cour de cassation',
        body: 'Fiche pédagogique : structure, vocabulaire et méthode de lecture décryptés pour les élus.',
        cta: 'Lire le guide →',
        to: '/atoopv/ressources/comment-lire-arret-cour-de-cassation',
      },
      {
        badge: '7 guides',
        title: 'Tous nos livres blancs CSE',
        body: 'Suppléance, CSSCT, heures de délégation, budget, formation… 7 guides en téléchargement libre.',
        cta: 'Voir tous les guides →',
        to: '/atoopv/ressources/guides-livres-blancs-cse',
      },
    ],
  },
}
