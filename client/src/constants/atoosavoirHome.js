/**
 * Ported ATOOPV atoosavoir content — hand-transcribed in French, verbatim,
 * from content/atoosavoir/atoosavoir.md and atoosavoir-exemple.md
 * (https://atoopv.com/atoosavoir/ and /atoosavoir/exemple/), following the
 * same block-grammar convention as tarificationHome.js / aProposHome.js /
 * autodiagnosticHome.js. The CGV sub-page is rendered straight from its
 * markdown via MarkdownArticle instead (see services/atoosavoirContent.js)
 * since it's a long, unstructured legal document rather than a designed
 * marketing page.
 */

export const ATOOSAVOIR_HERO = {
  badge: 'Service de recherche documentaire — Élus de CSE',
  title: 'Vous posez la question. Nous trouvons *la source*.',
  lead: 'Recherche dans le Code du travail, la jurisprudence et les accords de branche. Fiche structurée, sourcée, livrée en 5 jours ouvrés. Exploitable en réunion.',
  primaryCta: { label: 'Recevoir mon audit PV gratuit', to: '/atoopv/contact' },
  secondaryCta: { label: 'Voir les tarifs', to: '#tarifs' },
}

export const ATOOSAVOIR_TRUST_BADGES = ['9 ans d’expertise IRP', 'Formateur agréé', 'CAC 40 · PME → Groupes cotés']

export const ATOOSAVOIR_CONSTAT = {
  eyebrow: 'Le constat',
  heading: 'Chaque mois, des centaines d’élus cherchent les mêmes réponses.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Recherches juridiques interminables, sources contradictoires, Code du travail impénétrable. Les élus que nous formons déclarent y consacrer entre 2 et 5 heures par recherche. Vous pourriez le faire vous-même. Nous vous en déchargeons.',
    },
    {
      type: 'list',
      items: [
        'Une jurisprudence qui se perd entre doctrine, blogs RH et forums syndicaux — sans certitude sur la version en vigueur.',
        'Un article du Code du travail dont le numéro a changé en 2017, en 2020, ou la semaine dernière. Personne ne s’en aperçoit.',
        'La convention collective dit le contraire de l’accord d’entreprise, qui dit le contraire de la note de service.',
        'Le délai d’avis qui court — et toujours personne pour fournir une réponse sourcée avant l’échéance.',
      ],
    },
  ],
}

export const ATOOSAVOIR_EXAMPLES = {
  eyebrow: 'Le saviez-vous ?',
  heading: 'Ce que le droit prévoit pour vous.',
  lead: 'Trois questions que nos clients nous adressent — avec, pour chacune, la source officielle.',
  blocks: [
    {
      type: 'steps',
      items: [
        {
          title: 'Heures de délégation et temps de trajet',
          body: 'Le temps passé en réunion du CSE convoquée par l’employeur ne s’impute pas sur le crédit d’heures et est rémunéré comme du temps de travail effectif (art. L2315-11 C. trav.). Le temps de trajet pour s’y rendre, pour la part excédant le trajet normal domicile-lieu de travail, doit également être rémunéré sans imputation sur les heures de délégation (jurisprudence constante ; CJUE, 10 sept. 2015, aff. C-266/14). Cette protection ne vaut que pour les réunions convoquées par l’employeur — le temps de trajet lié à une activité exercée à l’initiative de l’élu s’impute, lui, sur les heures de délégation (art. L2315-10 C. trav.).',
        },
        {
          title: 'Transparence salariale : les leviers du droit',
          body: 'Le CSE peut exiger que la BDESE contienne les rémunérations moyennes et médianes ventilées par sexe (art. R.2312-9 C. trav.). Indépendamment du CSE, un salarié qui s’estime victime d’une inégalité de traitement peut obtenir en justice la communication des bulletins de paie de collègues occupant des postes comparables, avec occultation des données personnelles non nécessaires à la comparaison (Cass. soc., 8 mars 2023, n° 21-12.492).',
        },
        {
          title: 'Congés payés et heures supplémentaires — revirement',
          body: 'Les jours de congés payés doivent désormais être pris en compte dans le calcul du seuil de déclenchement des heures supplémentaires hebdomadaires. Un salarié qui a posé un jour de congé dans la semaine conserve son droit aux majorations (Cass. soc., 10 sept. 2025, n° 23-14.455, FP-B+R).',
        },
      ],
    },
  ],
}

export const ATOOSAVOIR_WHAT_IS = {
  eyebrow: 'Notre service',
  heading: 'atoosavoir, c’est quoi ?',
  blocks: [
    {
      type: 'paragraph',
      text: 'Un service de recherche documentaire en droit social, conçu pour les élus de CSE. Vous nous soumettez votre question — nous effectuons la recherche dans les sources officielles et vous livrons une fiche de réponse structurée, sourcée et exploitable.',
    },
    {
      type: 'callout',
      label: 'Cadre légal',
      text: 'atoosavoir est un service d’information documentaire au sens de l’article 66-1 de la loi n° 71-1130 du 31 décembre 1971. Il ne constitue ni une consultation juridique, ni un acte de conseil personnalisé. Les fiches livrées sont des supports d’information : elles doivent être adaptées à votre situation par votre conseil juridique avant toute décision engageante.',
    },
  ],
}

export const ATOOSAVOIR_QUESTIONS = {
  heading: 'Exemples de questions traitées',
  items: [
    'Reporter d’office les congés non posés à l’année suivante : dans quelles conditions ?',
    'Convocation tardive du CSE : le délai de 3 jours est-il franc ou calendaire ?',
    'Quelles données la BDESE doit-elle contenir pour une entreprise de moins de 300 salariés ?',
    'Conditions de validité d’un vote du CSE par voie électronique ?',
  ],
}

export const ATOOSAVOIR_STEPS = {
  eyebrow: 'Mode d’emploi',
  heading: 'Quatre étapes, 5 jours ouvrés.',
  blocks: [
    {
      type: 'steps',
      items: [
        {
          title: 'Vous posez votre question',
          body: 'Par téléphone, email ou via votre espace dédié. Un message en quelques lignes suffit. Joignez les pièces utiles si vous en disposez.',
        },
        {
          title: 'Nous effectuons la recherche',
          body: 'Dans le Code du travail, la jurisprudence, les accords de branche et la doctrine administrative. Toutes nos sources sont officielles et tracées : Légifrance, Cour de cassation, accords étendus, circulaires administratives.',
        },
        {
          title: 'Rédaction de votre fiche',
          body: 'L’état du droit applicable à votre thématique, exposé de manière objective et sourcée. La fiche ne constitue pas un avis juridique personnalisé. Pour toute application à un cas d’espèce, consultez un avocat ou un expert mandaté par votre CSE.',
        },
        {
          title: 'Livraison',
          body: 'Fiche structurée au format PDF : question, synthèse, sources citées, points d’attention, modèles de formulation utilisables en séance. Exploitable immédiatement. Délai : 5 jours ouvrés maximum.',
        },
      ],
    },
  ],
}

export const ATOOSAVOIR_FICHE_INTRO = {
  eyebrow: 'Le livrable',
  heading: 'À quoi ressemble une fiche ?',
  lead: 'Format A4 PDF. Structure constante. Prête à être versée au dossier de séance.',
  blocks: [
    {
      type: 'list',
      items: [
        'A — En-tête traçable — référence unique, date, marque atoosavoir',
        'B — Question reformulée — périmètre cadré de la recherche',
        'C — Synthèse opérationnelle — réponse en 2-3 lignes, exploitable immédiatement',
        'D — Sources horodatées — Code, jurisprudence, accords, doctrine, datées',
        'E — Points d’attention — zones grises, limites, renvois vers l’avocat si besoin',
      ],
    },
  ],
}

export const ATOOSAVOIR_FICHE_STATS = [
  { value: 'PDF', label: 'format universel' },
  { value: '2–4', label: 'pages selon complexité' },
  { value: '100 %', label: 'sources tracées' },
]

export const ATOOSAVOIR_FICHE_TEASER = {
  eyebrow: 'atoosavoir · Fiche n° 2026·041',
  title: 'Délai de consultation du CSE',
  fields: [
    {
      label: 'Votre question',
      value: 'Quel est le délai dont dispose le CSE pour rendre son avis lors d’une consultation, et que se passe-t-il si le comité ne se prononce pas ?',
    },
    {
      label: 'Synthèse',
      value: 'Le CSE dispose d’un mois (deux en cas d’expertise). À l’expiration du délai, le silence vaut avis négatif — l’employeur peut mettre en œuvre son projet.',
    },
    { label: 'Sources citées', value: 'Art. L.2312-16 C. trav. · Art. R.2312-6 · Cass. soc., 27 mai 2020, n° 18-26.483' },
    {
      label: 'Points d’attention',
      value: 'Un simple courrier ne suspend pas le délai. Seule la saisine du tribunal judiciaire avant l’échéance le peut.',
    },
  ],
}

export const ATOOSAVOIR_COMPARISON = {
  eyebrow: 'Pourquoi externaliser',
  heading: 'Faire soi-même, ou déléguer la recherche ?',
  blocks: [
    {
      type: 'list',
      items: [
        'Temps par recherche — Vous, seul : 2 à 5 h · Avec atoosavoir : 0 h pour vous, 5 j ouvrés',
        'Sources consultées — Vous, seul : Google, blogs, forums · Avec atoosavoir : Légifrance, Cass. soc., doctrine',
        'Datation des textes — Vous, seul : à votre charge · Avec atoosavoir : vérifiée et tracée',
        'Restitution — Vous, seul : notes manuscrites · Avec atoosavoir : fiche PDF structurée',
        'Risque de contresens — Vous, seul : élevé sur textes techniques · Avec atoosavoir : maîtrisé, double lecture',
      ],
    },
  ],
}

export const ATOOSAVOIR_PRICING = {
  eyebrow: 'Nos tarifs',
  heading: 'Abonnement mensuel. Sans surprise.',
  tiers: [
    { id: 'lt50', segment: '< 50 salariés', price: '99 € HT', unit: '/ mois', features: ['2 recherches incluses', 'Suppl. : 59 € HT / rech.'] },
    { id: '50-149', segment: '50 – 149 salariés', price: '159 € HT', unit: '/ mois', features: ['3 recherches incluses', 'Suppl. : 59 € HT / rech.'] },
    { id: '150-499', segment: '150 – 499 salariés', price: '269 € HT', unit: '/ mois', features: ['5 recherches incluses', 'Suppl. : 69 € HT / rech.'] },
    { id: '500+', segment: '500 + salariés', price: '449 € HT', unit: '/ mois', features: ['8 recherches incluses', 'Suppl. : 69 € HT / rech.'] },
  ],
  note: 'Engagement 12 mois · Facturation mensuelle · Résiliation simple en fin de période. Formule trimestrielle disponible (majoration 15 %). Imputation budgétaire : cette prestation s’impute sur le budget de fonctionnement (AEP) du CSE, conformément à l’article L2315-61 du Code du travail.',
}

export const ATOOSAVOIR_ANALYSIS = {
  eyebrow: 'En complément',
  heading: 'Analyse de documents — à l’acte',
  blocks: [
    {
      type: 'paragraph',
      text: 'Au-delà de la recherche, nous analysons vos documents d’entreprise : conformité, zones d’attention, éléments exploitables en CSE.',
    },
    {
      type: 'list',
      items: [
        'Accord d’entreprise — 290 – 490 € HT',
        'Règlement intérieur · Charte — 190 – 290 € HT',
        'Plan de sauvegarde de l’emploi — 490 – 790 € HT',
        'BDESE — 390 – 590 € HT',
      ],
    },
    { type: 'paragraph', text: 'Devis personnalisé selon volume et complexité du document.' },
  ],
}

export const ATOOSAVOIR_FAQ = [
  { question: 'Ma question dépasse le cadre documentaire ?', answer: 'Nous vous orientons vers un avocat partenaire. atoosavoir n’est pas un service de conseil juridique.' },
  {
    question: 'Mes recherches non utilisées sont-elles reportées ?',
    answer: 'Les recherches non utilisées sont reportables sur le mois suivant uniquement, dans la limite du nombre de recherches incluses dans votre formule mensuelle. Au-delà, elles ne sont pas conservées.',
  },
  { question: 'Combien de temps pour recevoir ma fiche ?', answer: '5 jours ouvrés maximum, à compter de la réception complète de votre demande.' },
  {
    question: 'Mes échanges sont-ils confidentiels ?',
    answer: 'Vos échanges restent confidentiels. Les questions traitées peuvent être réutilisées sous forme anonymisée à des fins de publication et de recherche, sauf avis contraire de votre part.',
  },
]

export const ATOOSAVOIR_BROCHURE = {
  label: 'Télécharger la plaquette commerciale',
  text: 'Tarifs, exemples, mode d’emploi, CGV — tout le service atoosavoir en 10 pages.',
}

export const ATOOSAVOIR_CTA = {
  eyebrow: 'Offre de découverte',
  heading: 'Analyse de conformité gratuite de votre dernier PV.',
  body: 'Envoyez-nous votre dernier procès-verbal de CSE. Nous vous retournons une fiche de corrections — points de conformité, zones d’attention, améliorations concrètes. Sans engagement.',
  primaryCta: { label: 'Envoyer mon PV pour audit', to: '/atoopv/contact' },
  secondaryCta: { label: 'Voir toutes nos ressources', to: '/atoopv/ressources' },
}

export const ATOOSAVOIR_CONTACT = { phone: '04 12 10 06 06', phoneHref: 'tel:+33412100606', email: 'contact@atoopv.com', emailHref: 'mailto:contact@atoopv.com' }

export const ATOOSAVOIR_LEGAL =
  'atoosavoir est un service d’information documentaire — il ne constitue pas une consultation juridique. Consultez un avocat avant toute décision engageante. ALC SAS au capital de 1 000 € — SIRET 833 781 248 00038 — RCS Lyon.'

// --- /atoopv/atoosavoir/exemple -------------------------------------------------

export const ATOOSAVOIR_EXEMPLE_HERO = {
  badge: 'Exemple de livrable',
  title: 'À quoi ressemble une fiche atoosavoir ?',
  lead: 'Cet exemple est fictif. Il illustre la structure, le niveau de sourçage et le format de livraison du service atoosavoir.',
}

export const ATOOSAVOIR_EXEMPLE_INTRO = {
  eyebrow: 'Fiche juridique CSE atoosavoir : exemple complet',
  blocks: [
    {
      type: 'paragraph',
      text: 'Découvrez un exemple de fiche juridique CSE atoosavoir, la base de données de référence pour les élus du Comité Social et Économique. Chaque fiche atoosavoir présente de manière structurée les règles du droit du travail applicables au CSE. Les élus peuvent ainsi rapidement trouver les informations juridiques dont ils ont besoin pour exercer leur mandat.',
    },
    {
      type: 'paragraph',
      text: 'Chaque fiche juridique CSE atoosavoir couvre un thème précis du droit social : textes de loi, jurisprudence et conseils pratiques pour les élus, avec des exemples concrets et des modèles réutilisables.',
    },
  ],
}

export const ATOOSAVOIR_EXEMPLE_CARD = {
  eyebrow: 'FICHE N° 2026·T01 — EXEMPLE FICTIF',
  title: 'Délai de consultation du CSE : que se passe-t-il si le comité ne se prononce pas ?',
  fields: [
    {
      label: 'Synthèse',
      value: 'Le CSE dispose d’un mois (deux en cas d’expertise). À l’expiration du délai, le silence vaut avis négatif — l’employeur peut mettre en œuvre son projet.',
    },
    { label: 'Sources citées', value: 'Art. L.2312-15 · L.2312-16 · R.2312-5 · R.2312-6 C. trav. — 6 arrêts Cass. soc. (2018–2025)' },
    {
      label: 'Contenu',
      value: 'Analyse complète · Tableau récapitulatif des délais · 6 arrêts commentés (faits, solution, portée pratique) · 7 points d’attention · 3 modèles de formulation · Extraits des textes applicables',
    },
    { label: 'Format', value: 'PDF · 9 pages · Structure constante · Sources horodatées · Prêt à verser au dossier de séance' },
  ],
  downloadHref: 'https://atoopv.com/wp-content/uploads/2026/05/atoosavoir-%E2%80%94-Fiche-N%C2%B0-2026%C2%B7T01.pdf',
  downloadLabel: 'Télécharger la fiche exemple (PDF)',
}

export const ATOOSAVOIR_EXEMPLE_CTA = {
  eyebrow: 'Une question similaire ?',
  heading: 'Posez-la, nous menons la recherche.',
  body: 'Décrivez votre situation, nous vous livrons une fiche structurée et sourcée sous 5 jours ouvrés.',
  primaryCta: { label: 'Recevoir mon audit PV gratuit', to: '/atoopv/contact' },
  secondaryCta: { label: 'Retour à atoosavoir', to: '/atoopv/atoosavoir' },
}

// --- /atoopv/atoosavoir/cgv -------------------------------------------------

export const ATOOSAVOIR_CGV_HERO = {
  title: 'Conditions générales de vente — atoosavoir',
  lead: 'Les conditions générales de vente atoosavoir régissent votre accès au service de recherche documentaire en droit social d’AtooPV.',
}
