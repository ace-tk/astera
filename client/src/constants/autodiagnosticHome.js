/**
 * Content for the ported ATOOPV Autodiagnostic page, transcribed verbatim
 * (French, not translated) from content/autodiagnostic/autodiagnostic.md —
 * the extraction of https://atoopv.com/autodiagnostic/. The source's quiz
 * (10 questions, scoring, and result tiers) was embedded as inline JS data
 * on the live page, not rendered markup, but every question, legal
 * citation, option, and score is reproduced exactly.
 *
 * The source's results screen ends in a lead-capture form that, on submit,
 * opens /contact/ with the answers as query params -- no real backend call
 * happens even on the live site. DiagnosticQuiz reproduces that exact
 * client-only shape (validate, then open the contact page with the same
 * params) rather than inventing an email-sending backend that doesn't exist
 * here either.
 */
export const AUTODIAGNOSTIC_HERO = {
  badge: 'Autodiagnostic',
  title: 'Autodiagnostic CSE conformité : évaluez votre comité',
  lead: 'L’autodiagnostic CSE conformité d’AtooPV vous permet d’évaluer en quelques minutes si votre Comité Social et Économique respecte l’ensemble de ses obligations légales. Cet outil interactif analyse les grands domaines de conformité : représentation du personnel, PV de réunions, budget, activités sociales et culturelles.',
}

export const AUTODIAGNOSTIC_INTRO = {
  eyebrow: 'Comment ça marche',
  heading: 'Autodiagnostic CSE conformité : évaluez votre comité',
  color: 'royal',
  blocks: [
    {
      type: 'paragraph',
      text: 'En premier lieu, renseignez les informations de base sur votre CSE : taille de l’entreprise, nombre d’élus, fréquence des réunions. Ensuite, répondez aux questions sur vos pratiques actuelles en matière de rédaction de procès-verbaux, de gestion du budget et d’organisation des ASC. Notre autodiagnostic CSE conformité identifie les points critiques nécessitant une action immédiate. Cet outil ne remplace pas un conseil juridique professionnel. Utilisez ce diagnostic comme premier pas vers un CSE pleinement conforme et efficace.',
    },
    {
      type: 'paragraph',
      text: 'Les domaines clés couverts par l’autodiagnostic CSE conformité incluent : la tenue des réunions plénières, la rédaction et diffusion des procès-verbaux dans les délais légaux, la gestion des budgets de fonctionnement et des ASC, la désignation des membres de la CSSCT, et l’exercice des droits des représentants du personnel. Chaque CSE étant unique, les recommandations sont adaptées à la taille de votre entreprise et à votre secteur d’activité.',
    },
  ],
}

export const AUTODIAGNOSTIC_WHY = {
  eyebrow: 'Pourquoi le faire',
  heading: 'Pourquoi réaliser un autodiagnostic CSE ?',
  color: 'royal',
  blocks: [
    {
      type: 'paragraph',
      text: 'Un autodiagnostic CSE conformité est indispensable pour plusieurs raisons. Premièrement, les obligations légales du CSE sont nombreuses et évoluent régulièrement. Deuxièmement, un CSE non conforme s’expose à des risques juridiques importants pour l’employeur et les élus. Réalisez votre autodiagnostic CSE conformité maintenant et sécurisez votre mandat avec nos services AtooPV.',
    },
  ],
}

export const AUTODIAGNOSTIC_QUIZ = {
  badge: '10 questions · 3 minutes · Résultat immédiat',
  heading: 'Autodiagnostic CSE — Votre comité est-il conforme ?',
  footer: 'ALC SAS — Le droit social expliqué de manière accessible —',
  footerLink: { label: 'atoopv.com', to: 'https://atoopv.com' },
  contactTo: '/atoopv/contact',
  restartLabel: 'Recommencer le diagnostic',
  questions: [
    {
      question: 'Les procès-verbaux de vos réunions CSE sont-ils rédigés et approuvés dans le délai légal ?',
      hint: 'Art. L.2315-34 CT — Le PV est établi par le secrétaire dans un délai fixé par accord ou, à défaut, dans les 15 jours (3 jours en cas de PSE).',
      options: [
        { label: 'Oui, systématiquement dans les délais', score: 2 },
        { label: 'Parfois en retard ou en attente d’approbation', score: 1 },
        { label: 'Non, plusieurs PV sont en souffrance', score: 0 },
      ],
    },
    {
      question: 'Les trois consultations récurrentes obligatoires sont-elles réalisées chaque année ?',
      hint: 'Art. L.2312-17 CT — Orientations stratégiques, situation économique et financière, politique sociale et conditions de travail.',
      options: [
        { label: 'Oui, les trois sont réalisées et documentées', score: 2 },
        { label: 'Une ou deux sur trois seulement', score: 1 },
        { label: 'Non, ou je ne sais pas', score: 0 },
      ],
    },
    {
      question: 'Les élus ont-ils un accès effectif à la BDESE ?',
      hint: 'Art. L.2312-18 CT — La base de données économiques, sociales et environnementales doit être accessible en permanence aux membres du CSE.',
      options: [
        { label: 'Oui, accès permanent et contenu à jour', score: 2 },
        { label: 'Accès existant mais contenu incomplet ou obsolète', score: 1 },
        { label: 'Pas d’accès ou BDESE inexistante', score: 0 },
      ],
    },
    {
      question: 'Les membres du CSE ont-ils suivi la formation santé, sécurité et conditions de travail (SSCT) ?',
      hint: 'Art. L.2315-18 CT — Formation obligatoire pour tous les membres du CSE, titulaires et suppléants, quel que soit l’effectif.',
      options: [
        { label: 'Oui, tous les élus sont formés', score: 2 },
        { label: 'Certains élus seulement', score: 1 },
        { label: 'Non, ou formation non organisée', score: 0 },
      ],
    },
    {
      question: 'Les membres titulaires ont-ils bénéficié de la formation économique ?',
      hint: 'Art. L.2315-63 CT — Formation de 5 jours max pour les titulaires dans les entreprises d’au moins 50 salariés, renouvelée après 4 ans de mandat.',
      options: [
        { label: 'Oui, formation suivie pour l’ensemble des titulaires', score: 2 },
        { label: 'Partiellement — certains titulaires n’ont pas été formés', score: 1 },
        { label: 'Non, ou entreprise de moins de 50 salariés', score: 0 },
      ],
    },
    {
      question: 'Le CSE dispose-t-il d’un règlement intérieur adopté ?',
      hint: 'Art. L.2315-24 CT — Obligatoire dans les entreprises d’au moins 50 salariés. Il fixe les modalités de fonctionnement du comité.',
      options: [
        { label: 'Oui, adopté et connu des élus', score: 2 },
        { label: 'Existe mais pas mis à jour ou peu connu', score: 1 },
        { label: 'Non, pas de règlement intérieur', score: 0 },
      ],
    },
    {
      question: 'Le budget de fonctionnement du CSE (0,20 % ou 0,22 %) est-il versé et utilisé ?',
      hint: 'Art. L.2315-61 CT — Subvention de fonctionnement versée par l’employeur. Son utilisation doit être tracée dans les comptes du CSE.',
      options: [
        { label: 'Oui, versé régulièrement et comptes tenus', score: 2 },
        { label: 'Versé mais utilisation peu documentée', score: 1 },
        { label: 'Non versé ou confondu avec le budget ASC', score: 0 },
      ],
    },
    {
      question: 'Les heures de délégation sont-elles utilisées et leur suivi assuré ?',
      hint: 'Art. L.2315-7 CT — Crédit d’heures mensuel selon l’effectif. Mutualisation et report possibles dans la limite de 1,5 fois le crédit mensuel.',
      options: [
        { label: 'Oui, utilisées et suivi régulier', score: 2 },
        { label: 'Utilisées partiellement, pas de suivi formalisé', score: 1 },
        { label: 'Peu ou pas utilisées', score: 0 },
      ],
    },
    {
      question: 'L’ordre du jour est-il établi conjointement et transmis au moins 3 jours avant la réunion ?',
      hint: 'Art. L.2315-29 CT — Élaboré conjointement par le président et le secrétaire. Communiqué aux membres au moins 3 jours avant la séance.',
      options: [
        { label: 'Oui, conjointement et dans les délais', score: 2 },
        { label: 'Transmis dans les délais mais rédigé unilatéralement', score: 1 },
        { label: 'Non, souvent hors délai ou imposé', score: 0 },
      ],
    },
    {
      question: 'Une CSSCT est-elle en place (si obligatoire) et se réunit-elle régulièrement ?',
      hint: 'Art. L.2315-36 CT — Obligatoire dans les entreprises d’au moins 300 salariés et les établissements classés (Seveso, nucléaire, mines).',
      options: [
        { label: 'Oui, en place avec réunions régulières (ou non obligatoire dans notre cas)', score: 2 },
        { label: 'En place mais réunions irrégulières', score: 1 },
        { label: 'Non mise en place alors qu’elle est obligatoire', score: 0 },
      ],
    },
  ],
  tiers: [
    {
      min: 16,
      level: 'green',
      color: 'emerald',
      title: 'Conformité satisfaisante',
      text: 'Votre CSE respecte l’essentiel de ses obligations légales. Restent peut-être quelques points de vigilance à consolider.',
    },
    {
      min: 10,
      level: 'amber',
      color: 'golden',
      title: 'Axes d’amélioration identifiés',
      text: 'Plusieurs obligations ne sont que partiellement remplies. Chaque point non traité est un risque juridique pour les élus comme pour l’employeur.',
    },
    {
      min: 0,
      level: 'red',
      color: 'rose',
      title: 'Alerte — accompagnement recommandé',
      text: 'Des obligations fondamentales du CSE ne sont pas respectées. La situation expose les élus et l’employeur à des risques juridiques sérieux.',
    },
  ],
  resultsCta: {
    heading: 'Recevez votre fiche de recommandations personnalisée',
    body: 'Nous vous envoyons par email une analyse détaillée avec les articles du Code du travail applicables et les actions correctives prioritaires.',
    submitLabel: 'Recevoir ma fiche',
    submittedLabel: '✓ Demande envoyée',
    legalText: 'Vos données sont utilisées uniquement pour l’envoi de la fiche.',
    legalLink: { label: 'Politique de confidentialité', to: 'https://atoopv.com/politique-de-confidentialite/' },
  },
}

export const AUTODIAGNOSTIC_CTA = {
  eyebrow: 'Aller plus loin',
  heading: 'Confiez la conformité de vos PV à AtooPV',
  body: 'Découvrez notre service de rédaction de PV CSE, nos cas pratiques et nos formations élus CSE pour sécuriser durablement votre mandat.',
  primaryCta: { label: 'Voir nos services', to: '/atoopv/services' },
  secondaryCta: { label: 'Voir toutes nos ressources', to: '/atoopv/ressources' },
}
