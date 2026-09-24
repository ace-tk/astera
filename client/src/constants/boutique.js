/**
 * Content for the Boutique (/atoopv/boutique) shop experience: the resource
 * library shell and the procès-verbal report preview.
 */

/**
 * Experiment 13 — a resource-platform app shell (icon rail + search +
 * categories + carousel + featured/recommendations), modeled on a supplied
 * reference screenshot. NOTE: the reference has no chat panel — kept
 * strictly to what the screenshot actually shows. A third, independent
 * book dataset (see Experiments 09 and 12 for the other two) so none of the
 * three can affect each other.
 */
export const RESOURCE_CATEGORIES = [
  { id: 'tous', label: 'Tous' },
  { id: 'guides', label: 'Guides' },
  { id: 'actualites', label: 'Actualités' },
  { id: 'populaires', label: 'Populaires' },
  { id: 'modeles', label: 'Modèles' },
  { id: 'methodologie', label: 'Méthodologie' },
  { id: 'dialogue', label: 'Dialogue social' },
  { id: 'formation', label: 'Formation' },
  { id: 'fiches', label: 'Fiches pratiques' },
  { id: 'contentieux', label: 'Contentieux' },
]

export const RESOURCE_LIBRARY_BOOKS = [
  {
    id: 'guide-cse',
    title: 'Guide du CSE',
    author: 'ATOOPV Éditions',
    accent: 'golden',
    categories: ['guides', 'populaires'],
    excerpt:
      "Le CSE occupe une place centrale dans le dialogue social de l'entreprise. Ce guide retrace ses attributions économiques, sociales et culturelles.",
  },
  {
    id: 'tresorier-cse',
    title: 'Trésorier du CSE',
    author: 'ATOOPV Éditions',
    accent: 'emerald',
    categories: ['guides', 'modeles'],
    excerpt:
      "Budget de fonctionnement, budget ASC, obligations comptables : les bases indispensables à une gestion saine et transparente.",
  },
  {
    id: 'cssct-roles',
    title: 'CSSCT — Rôles & Missions',
    author: 'Marc Dubreuil',
    accent: 'coral',
    categories: ['fiches', 'formation'],
    excerpt: 'De la mise en place de la commission à la conduite des enquêtes accident du travail, le périmètre complet de la CSSCT.',
  },
  {
    id: 'pv-efficace',
    title: 'Procès-verbal efficace',
    author: 'ATOOPV Éditions',
    accent: 'royal',
    categories: ['methodologie', 'modeles'],
    excerpt: 'Rédiger un procès-verbal clair, complet et opposable, sous contrainte de temps : la méthode ATOOPV condensée.',
  },
  {
    id: 'referentiel-conformite',
    title: 'Référentiel conformité',
    author: 'ATOOPV Éditions',
    accent: 'sky',
    categories: ['contentieux', 'actualites'],
    excerpt: 'Les obligations légales du CSE par thème, avec leurs textes de référence à jour et le risque en cas de non-conformité.',
  },
  {
    id: 'comprendre-cse',
    title: 'Comprendre le CSE',
    author: 'ATOOPV Éditions',
    accent: 'purple',
    categories: ['formation', 'dialogue'],
    excerpt: "Une introduction accessible au fonctionnement du CSE, pensée pour les élus qui découvrent leur mandat.",
  },
  {
    id: 'elections-pro',
    title: 'Élections professionnelles',
    author: 'ATOOPV Éditions',
    accent: 'rose',
    categories: ['guides', 'actualites'],
    excerpt: "Protocole d'accord préélectoral, collèges, calendrier : sécuriser chaque étape du scrutin du CSE.",
  },
  {
    id: 'negociation-collective',
    title: 'Négociation collective',
    author: 'ATOOPV Éditions',
    accent: 'mint',
    categories: ['dialogue', 'formation'],
    excerpt: 'Préparer, mener et conclure une négociation avec la direction : méthode, postures et suivi de l’accord.',
  },
  {
    id: 'contentieux-prudhomal',
    title: 'Contentieux prud’homal',
    author: 'Marc Dubreuil',
    accent: 'orange',
    categories: ['contentieux', 'fiches'],
    excerpt: 'Les étapes clés d’un contentieux prud’homal et le rôle que peut y jouer le CSE aux côtés du salarié.',
  },
]

export const RESOURCE_FEATURED = {
  year: '2026',
  heading: 'Les ressources essentielles',
  description: 'Les ressources les plus utiles pour comprendre, préparer et structurer vos réunions CSE.',
  cta: 'Voir les ressources',
}

export const RESOURCE_RECOMMENDATIONS = [
  { id: 'top-cse', title: 'Top 50 ressources CSE', description: 'Les documents les plus consultés.', filter: 'populaires' },
  { id: 'top-outils', title: 'Top 50 outils', description: 'Découvrez les outils les plus utiles.', filter: 'modeles' },
  { id: 'top-conformite', title: 'Top 50 conformité', description: 'Les ressources essentielles pour rester conforme.', filter: 'contentieux' },
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
