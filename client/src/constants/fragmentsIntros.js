/**
 * Content for `FragmentsToDocument` (src/components/atoopv/), the
 * production reuse of the Design Lab's Experiment 06 motion system. Every
 * string here is pulled verbatim (or lightly excerpted) from the real page
 * it's used on -- nothing invented. Fragment `stacked`/`readable`/
 * `readableMobile`/`organized`/`converge` coordinates are reused verbatim
 * from Experiment 06's own validated 4-tag-fragment geometry
 * (constants/designTest.js: decision/owner/vote/action2) -- purely
 * positional, not content, so safe to share.
 */

// content/training/formation-economique-elus-cse.md -- the page's own real
// "PROGRAMME DÉTAILLÉ" module headings, its real duration/financing/
// accreditation facts, and its own real closing sentence.
export const FORMATION_ECONOMIQUE_FRAGMENTS = {
  eyebrow: 'FORMATION 5 JOURS — DEPUIS 2017',
  titleLines: ['PROGRAMME', 'STRUCTURÉ.'],
  fragments: [
    {
      id: 'module1',
      role: 'MODULE 01',
      kind: 'topic',
      text: 'Du triptyque DP/CE/CHSCT à l’instance unique',
      tag: 'RÉFORME',
      group: 'cadre',
      stacked: { x: 45, y: 49, rotate: 5 },
      readable: { x: 64, y: 22, rotate: 2 },
      readableMobile: { x: 50, y: 46, rotate: 0 },
      organized: { x: 50, y: 18, rotate: 0 },
      converge: { x: 50, y: 44 },
    },
    {
      id: 'module2',
      role: 'MODULE 02',
      kind: 'topic',
      text: 'Composition, bureau, CSSCT et commissions obligatoires',
      tag: 'GOUVERNANCE',
      group: 'cadre',
      stacked: { x: 56, y: 46, rotate: -4 },
      readable: { x: 48, y: 66, rotate: 2 },
      readableMobile: { x: 50, y: 60, rotate: 0 },
      organized: { x: 72, y: 56, rotate: 0 },
      converge: { x: 50, y: 52 },
    },
    {
      id: 'module3',
      role: 'MODULE 03',
      kind: 'topic',
      text: 'Caractéristiques du mandat : durée, limitation, évènements impactants',
      tag: 'MANDAT',
      group: 'mandat',
      stacked: { x: 55, y: 51, rotate: 7 },
      readable: { x: 82, y: 66, rotate: -2 },
      readableMobile: { x: 50, y: 74, rotate: 0 },
      organized: { x: 52, y: 48, rotate: 0 },
      converge: { x: 50, y: 56 },
    },
    {
      id: 'module4',
      role: 'MODULE 04',
      kind: 'topic',
      text: 'Protection des élus : périmètre, durée post-mandat, procédure d’autorisation',
      tag: 'PROTECTION',
      group: 'mandat',
      stacked: { x: 48, y: 57, rotate: -6 },
      readable: { x: 86, y: 22, rotate: -2 },
      readableMobile: { x: 50, y: 90, rotate: 0 },
      organized: { x: 64, y: 76, rotate: 0 },
      converge: { x: 50, y: 48 },
    },
  ],
  groups: [
    { id: 'cadre', label: 'CADRE JURIDIQUE' },
    { id: 'mandat', label: 'MANDAT & PROTECTION' },
  ],
  links: [],
  phases: ['PROGRAMME', 'MODULES', 'LECTURE', 'COMPRÉHENSION', 'STRUCTURE', 'FICHE'],
  documentLabel: 'FICHE FORMATION',
  documentRows: [
    { label: 'Durée', text: '5 jours' },
    { label: 'Financement', text: 'Budget de fonctionnement CSE' },
    { label: 'Agrément', text: 'NDA 84740456974' },
    { label: 'Modules', text: '4' },
  ],
  annotations: ['Formation obligatoire à chaque renouvellement', 'Financée par le CSE', 'Organisme agréé', '4 modules structurés'],
  documentMeta: 'AtooPV / Formation économique',
  statement: ['5 jours de formation.', 'Exercer pleinement leur mandat.'],
}

// content/communication/communication-cse.md -- the page's own real
// "bonnes pratiques" topic headings, its own real delivery-time and format
// facts, and its own real FAQ line contrasting the PV and the newsletter.
export const COMMUNICATION_FRAGMENTS = {
  eyebrow: 'COMMUNICATION — DEPUIS 2017',
  titleLines: ['DE LA RÉUNION', 'AUX SALARIÉS.'],
  fragments: [
    {
      id: 'theme1',
      role: 'THÈME 01',
      kind: 'topic',
      text: 'Quels contenus inclure dans votre newsletter CSE ?',
      tag: 'CONTENU',
      group: 'newsletter',
      stacked: { x: 45, y: 49, rotate: 5 },
      readable: { x: 64, y: 22, rotate: 2 },
      readableMobile: { x: 50, y: 46, rotate: 0 },
      organized: { x: 50, y: 18, rotate: 0 },
      converge: { x: 50, y: 44 },
    },
    {
      id: 'theme2',
      role: 'THÈME 02',
      kind: 'topic',
      text: 'Newsletter ActuCSE',
      tag: 'ACTUCSE',
      group: 'newsletter',
      stacked: { x: 56, y: 46, rotate: -4 },
      readable: { x: 48, y: 66, rotate: 2 },
      readableMobile: { x: 50, y: 60, rotate: 0 },
      organized: { x: 72, y: 56, rotate: 0 },
      converge: { x: 50, y: 52 },
    },
    {
      id: 'theme3',
      role: 'THÈME 03',
      kind: 'topic',
      text: 'Communication ASC',
      tag: 'ASC',
      group: 'asc',
      stacked: { x: 55, y: 51, rotate: 7 },
      readable: { x: 82, y: 66, rotate: -2 },
      readableMobile: { x: 50, y: 74, rotate: 0 },
      organized: { x: 52, y: 48, rotate: 0 },
      converge: { x: 50, y: 56 },
    },
    {
      id: 'theme4',
      role: 'THÈME 04',
      kind: 'topic',
      text: 'Guide du comité',
      tag: 'GUIDE',
      group: 'asc',
      stacked: { x: 48, y: 57, rotate: -6 },
      readable: { x: 86, y: 22, rotate: -2 },
      readableMobile: { x: 50, y: 90, rotate: 0 },
      organized: { x: 64, y: 76, rotate: 0 },
      converge: { x: 50, y: 48 },
    },
  ],
  groups: [
    { id: 'newsletter', label: 'NEWSLETTER ACTUCSE' },
    { id: 'asc', label: 'ASC & GUIDE' },
  ],
  links: [],
  phases: ['RÉUNION', 'THÈMES', 'LECTURE', 'COMPRÉHENSION', 'STRUCTURE', 'NEWSLETTER'],
  documentLabel: 'FICHE COMMUNICATION',
  documentRows: [
    { label: 'Format', text: 'PDF ou email HTML' },
    { label: 'Délai (rédigé par ALC)', text: '7 à 10 jours ouvrés' },
    { label: 'Délai (mise en page seule)', text: '72 heures' },
    { label: 'Support', text: 'Newsletter ActuCSE' },
  ],
  annotations: ['Mise en page professionnelle', 'Rédaction mensuelle ou trimestrielle', 'Actualités sociales et juridiques', 'Format PDF ou email HTML'],
  documentMeta: 'AtooPV / Communication CSE',
  statement: ['L’un fait foi,', 'l’autre fait lien.'],
}
