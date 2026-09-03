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
  count: '06 EXPERIMENTS',
  scrollCue: 'SCROLL TO EXPLORE',
  year: '2026',
}

export const STRUCTURED_STAGES = [
  {
    id: 'reunion',
    number: '01',
    name: 'Réunion',
    meta: 'SOURCE / AUDIO + VIDÉO',
    description: 'La conversation brute, captée dans son intégralité — rien ne se perd.',
  },
  {
    id: 'transcription',
    number: '02',
    name: 'Transcription',
    meta: 'PROCESS / SPEECH-TO-TEXT',
    description: 'Chaque intervention posée, horodatée et attribuée au bon interlocuteur.',
  },
  {
    id: 'analyse',
    number: '03',
    name: 'Analyse',
    meta: 'PROCESS / EXTRACTION',
    description: 'Les décisions, actions et points clés extraits du bruit conversationnel.',
  },
  {
    id: 'validation',
    number: '04',
    name: 'Validation',
    meta: 'CHECK / RELECTURE',
    description: 'Relecture, ajustements et vérification avant diffusion.',
  },
  {
    id: 'proces-verbal',
    number: '05',
    name: 'Procès-verbal',
    meta: 'OUTPUT / DOCUMENT FINAL',
    description: 'Le document final, structuré et prêt à être partagé.',
  },
]

export const BLUEPRINT_NODES = [
  { id: 'capture', label: 'CAPTURE', x: 0.08, y: 0.78, note: 'Audio et vidéo enregistrés sans perte de contexte.' },
  { id: 'transcribe', label: 'TRANSCRIBE', x: 0.27, y: 0.28, note: 'Chaque mot transcrit et horodaté automatiquement.' },
  { id: 'understand', label: 'UNDERSTAND', x: 0.46, y: 0.72, note: "Le sens et l'intention derrière chaque échange." },
  { id: 'structure', label: 'STRUCTURE', x: 0.65, y: 0.24, note: 'Sections, décisions et actions organisées.' },
  { id: 'validate', label: 'VALIDATE', x: 0.82, y: 0.7, note: 'Vérifié et conforme avant diffusion.' },
  { id: 'deliver', label: 'DELIVER', x: 0.94, y: 0.22, note: 'Le PV livré, prêt à être partagé.' },
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

export const ORCHESTRATED_PANELS = [
  { number: '01', title: 'Capturer', description: "L'audio et la vidéo saisis intégralement, sans perte.", accent: 'royal' },
  { number: '02', title: 'Transcrire', description: 'Chaque mot posé et attribué au bon interlocuteur.', accent: 'coral' },
  { number: '03', title: 'Comprendre', description: 'Le sens extrait au-delà du simple texte.', accent: 'golden' },
  { number: '04', title: 'Valider', description: 'Une vérification rapide avant diffusion.', accent: 'emerald' },
  { number: '05', title: 'Livrer', description: 'Le procès-verbal, prêt à être partagé.', accent: 'sky' },
]

export const CONNECTED_FRAGMENTS = [
  { id: 'president', role: 'PRÉSIDENT', text: 'Il faut confirmer le budget avant vendredi.', kind: 'quote', x: -90, y: -50, rotate: -7 },
  { id: 'secretaire', role: 'SECRÉTAIRE', text: 'La prochaine action revient à Julie.', kind: 'quote', x: 100, y: 10, rotate: 5 },
  { id: 'decision', role: 'DÉCISION', text: 'Approuvé', kind: 'tag', x: -70, y: 90, rotate: 4 },
  { id: 'action', role: 'ACTION', text: 'Suivi requis', kind: 'tag', x: 80, y: -80, rotate: -5 },
]

export const CONNECTED_TEASER = ['CONVERSATION BRUTE', 'INTELLIGENCE STRUCTURÉE', 'PROCÈS-VERBAL']

export const EXPERIMENTS = [
  { id: 'experiment-01', number: '01', label: 'Structured Intelligence' },
  { id: 'experiment-02', number: '02', label: 'Living Blueprint' },
  { id: 'experiment-03', number: '03', label: 'Editorial Process' },
  { id: 'experiment-04', number: '04', label: 'Typographic System' },
  { id: 'experiment-05', number: '05', label: 'Orchestrated Intelligence' },
  { id: 'experiment-06', number: '06', label: 'Connected Document' },
]
