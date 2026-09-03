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
  { number: '01', title: 'Capturer', description: "L'audio et la vidéo saisis intégralement, sans perte.", accent: 'royal', visual: 'waveform' },
  { number: '02', title: 'Transcrire', description: 'Chaque mot posé et attribué au bon interlocuteur.', accent: 'coral', visual: 'transcript' },
  { number: '03', title: 'Comprendre', description: 'Le sens extrait au-delà du simple texte.', accent: 'golden', visual: 'connect' },
  { number: '04', title: 'Valider', description: 'Une vérification rapide avant diffusion.', accent: 'emerald', visual: 'check' },
  { number: '05', title: 'Livrer', description: 'Le procès-verbal, prêt à être partagé.', accent: 'sky', visual: 'deliver' },
]

/**
 * Experiment 06's four-phase scroll story: fragments scatter with overlap
 * and rotation (A), ATOOPV labels/links them (B), they drift into loose
 * thematic clusters — rotation reduced, not eliminated; still an editorial
 * collage, never a grid (C) — then converge into the assembled document
 * (D). `scatter` and `organized` are percent-of-canvas positions + rotation
 * the fragment travels between; the final convergence point (the
 * document's own center) is shared, computed in the component rather than
 * duplicated per fragment. `group` is used only by the reduced-motion
 * static fallback, which groups fragments into three plain columns.
 */
export const CONNECTED_PHASES = ['CONVERSATION', 'COMPRÉHENSION', 'STRUCTURE', 'DOCUMENT']

export const CONNECTED_FRAGMENTS = [
  {
    id: 'president',
    role: 'PRÉSIDENT',
    kind: 'quote',
    text: 'Il faut confirmer le budget avant vendredi.',
    tag: 'DISCUSSION',
    group: 'discussion',
    scatter: { x: 10, y: 14, rotate: -7 },
    organized: { x: 20, y: 26, rotate: -3 },
  },
  {
    id: 'tresorier',
    role: 'TRÉSORIER',
    kind: 'quote',
    text: 'Le montant reste à valider.',
    tag: 'RISQUE',
    group: 'discussion',
    scatter: { x: 64, y: 8, rotate: 6 },
    organized: { x: 30, y: 54, rotate: 2 },
  },
  {
    id: 'secretaire',
    role: 'SECRÉTAIRE',
    kind: 'quote',
    text: 'Je peux envoyer le document demain.',
    tag: 'ACTION',
    group: 'actions',
    scatter: { x: 88, y: 32, rotate: -5 },
    organized: { x: 76, y: 24, rotate: -2 },
  },
  {
    id: 'decision',
    role: 'DÉCISION',
    kind: 'tag',
    text: 'Budget approuvé',
    tag: 'DÉCISION',
    group: 'decisions',
    scatter: { x: 32, y: 44, rotate: 5 },
    organized: { x: 50, y: 18, rotate: 3 },
  },
  {
    id: 'owner',
    role: 'RESPONSABLE',
    kind: 'tag',
    text: 'Julie — suivi budget',
    tag: 'OWNER',
    group: 'actions',
    scatter: { x: 6, y: 64, rotate: -4 },
    organized: { x: 72, y: 56, rotate: -3 },
  },
  {
    id: 'vote',
    role: 'VOTE',
    kind: 'tag',
    text: 'Adopté à l’unanimité',
    tag: 'VOTE',
    group: 'decisions',
    scatter: { x: 68, y: 62, rotate: 6 },
    organized: { x: 52, y: 48, rotate: 2 },
  },
  {
    id: 'action2',
    role: 'ACTION',
    kind: 'tag',
    text: 'Relance fournisseur lundi',
    tag: 'ACTION',
    group: 'actions',
    scatter: { x: 44, y: 80, rotate: -6 },
    organized: { x: 64, y: 76, rotate: -2 },
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

export const EXPERIMENTS = [
  { id: 'experiment-01', number: '01', label: 'Structured Intelligence' },
  { id: 'experiment-02', number: '02', label: 'Living Blueprint' },
  { id: 'experiment-03', number: '03', label: 'Editorial Process' },
  { id: 'experiment-04', number: '04', label: 'Typographic System' },
  { id: 'experiment-05', number: '05', label: 'Orchestrated Intelligence' },
  { id: 'experiment-06', number: '06', label: 'Connected Document' },
]
