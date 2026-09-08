/**
 * Content for the ported ATOOPV Tarification page, transcribed verbatim
 * (French, not translated) from content/pricing/tarification.md — the
 * extraction of https://atoopv.com/tarification/.
 *
 * The source page is an interactive JS pricing simulator whose only
 * disclosed rule is the per-tier hourly rate stated in its own FAQ (90 / 130
 * / 150 €/h — tranche 50 à 300 salariés). It also showed "type d'instance,"
 * "mode d'intervention," and "points à l'ordre du jour" controls, but never
 * published a formula for how those affect price, so — same approach as the
 * English PRICING_CALCULATOR in constants/pricing.js — PricingCalculator
 * here computes only duration × the stated hourly rate, and the
 * instance-type / intervention-mode / agenda-size controls are represented
 * as descriptive text rather than a non-functional input.
 */
export const TARIFICATION_HERO = {
  badge: 'Simulateur de prix',
  title: 'Estimez votre budget PV',
  lead: 'Une estimation en 30 secondes, un devis précis sous 24h.',
  primaryCta: { label: 'Demander un devis gratuit →', to: '/atoopv/contact' },
}

export const TARIFICATION_INTRO = {
  blocks: [
    {
      type: 'paragraph',
      text: 'Le simulateur prix PV CSE d’AtooPV vous permet d’estimer en 30 secondes le coût de rédaction de votre procès-verbal. Notre outil calcule le prix en fonction du nombre de participants, de la durée de la réunion et du niveau de complexité des débats. Obtenez une estimation immédiate et gratuite sans engagement.',
    },
  ],
}

export const TARIFICATION_OPTIONS = {
  eyebrow: 'Paramètres du simulateur',
  heading: 'Ce que couvre l’estimation',
  color: 'golden',
  blocks: [
    {
      type: 'list',
      items: [
        'Type d’instance : CSE Ordinaire, CSE Extraordinaire, CSSCT, Autre IRP.',
        'Mode d’intervention : Distanciel ou Présentiel.',
        'Durée de la réunion : de 1h à 8h.',
        'Nombre de points à l’ordre du jour : de 1 à 15.',
      ],
    },
  ],
}

/**
 * `tagline`/`features` weren't in the original source transcription (only
 * the hourly rate was ever disclosed — see the file header) but match, tier
 * for tier, the equivalent English PRICING_TIERS (constants/pricing.js),
 * which added the same kind of per-tier description beyond the strict
 * source data. Added here so the two locales stay at parity for the output
 * preview (PricingCalculator) that reads from this field.
 */
export const TARIFICATION_TIERS = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    rate: 90,
    note: 'Tranche 50 à 300 salariés',
    tagline: 'Résumé décisionnel',
    features: ['3 à 5 pages par heure', 'Décisions, votes et résultats', 'Rédaction à la troisième personne', 'Livraison sous 48 à 72h ouvrées'],
  },
  {
    id: 'scope',
    name: 'Scope',
    rate: 130,
    note: 'Tranche 50 à 300 salariés',
    tagline: 'Résumé enrichi',
    badge: 'Le plus choisi',
    featured: true,
    features: ['6 à 10 pages par heure', 'Échanges clés restitués avec attribution', 'Votes nominatifs détaillés', 'Déclarations syndicales restituées'],
  },
  {
    id: 'premium',
    name: 'Premium',
    rate: 150,
    note: 'Tranche 50 à 300 salariés',
    tagline: 'Verbatim intégral',
    features: ['11 à 20 pages par heure', 'Restitution intégrale de chaque intervention', 'Valeur probante maximale', 'Idéal en contexte contentieux ou PSE'],
  },
]

export const TARIFICATION_CALCULATOR = {
  disclaimer: 'Estimation non contractuelle, hors taxes (+20% TVA) • Devis personnalisé gratuit sous 24h',
  cta: { label: 'Demander un devis gratuit →', to: '/atoopv/contact' },
  labels: { format: 'Format', duration: 'Durée de la réunion', estimate: 'Estimation indicative', currency: 'HT', instance: 'Instance', preview: 'Aperçu de l’extrait' },
}

export const TARIFICATION_WHY = {
  eyebrow: 'Pourquoi l’utiliser',
  heading: 'Pourquoi utiliser le simulateur de prix AtooPV ?',
  color: 'golden',
  blocks: [
    {
      type: 'paragraph',
      text: 'Notre simulateur de prix AtooPV a été conçu pour les secrétaires de CSE, trésoriers et élus qui souhaitent obtenir rapidement un ordre de grandeur du coût de rédaction de leurs procès-verbaux. Le tarif varie selon plusieurs paramètres : la durée de la réunion, le nombre de membres présents, la complexité des délibérations et le délai de livraison souhaité. Plutôt que d’attendre un devis traditionnel, le simulateur de prix AtooPV vous donne une estimation immédiate.',
    },
    {
      type: 'paragraph',
      text: 'AtooPV propose une rédaction de PV en présentiel ou en distanciel, pour toutes les instances représentatives du personnel : CSE, CSSCT et autres IRP. Le format de livraison est adaptable — Word, PDF ou les deux. Si votre situation est particulière (réunion exceptionnelle, contentieux, procédure d’alerte), nous vous recommandons de nous contacter directement pour obtenir un devis personnalisé. Nous répondons sous 24h ouvrées à toute demande de devis.',
    },
  ],
}

export const TARIFICATION_HOW = {
  eyebrow: 'Étape par étape',
  heading: 'Comment obtenir votre devis avec le simulateur de prix ?',
  color: 'golden',
  blocks: [
    {
      type: 'list',
      ordered: true,
      items: [
        'Sélectionnez votre type d’instance (CSE, CSSCT ou IRP).',
        'Indiquez la durée approximative de votre réunion.',
        'Précisez le format souhaité (présentiel ou distanciel) et le délai de livraison.',
        'Le simulateur calcule automatiquement une estimation tarifaire.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Ce tarif est indicatif — le devis définitif vous est communiqué après étude de votre demande.',
    },
  ],
}

export const TARIFICATION_FAQ = [
  {
    question: 'Combien coûte la rédaction d’un procès-verbal de CSE ?',
    answer: 'Le tarif dépend du format et de la durée de la réunion. ALC facture à l’heure de réunion : à partir de 90 € HT/h en Essentiel, 130 € HT/h en Scope et 150 € HT/h en Premium (tranche 50 à 300 salariés). Un devis personnalisé précise le montant selon votre situation. Rapporté au temps qu’un secrétaire passerait à rédiger seul, et au risque d’un PV contestable, l’externalisation se raisonne moins en coût qu’en sécurité.',
  },
  {
    question: 'Pourquoi facturer à l’heure de réunion plutôt qu’à la page ?',
    answer: 'La durée de la séance détermine le volume d’échanges à restituer, donc le travail réel. Facturer à l’heure de réunion donne un prix connu avant la prestation. La facturation à la page, courante ailleurs, incite mécaniquement à allonger le document ; notre logique vous protège de cette dérive et rend le budget prévisible d’une réunion à l’autre.',
  },
  {
    question: 'L’externalisation du PV peut-elle être financée par le budget du CSE ?',
    answer: 'La rédaction du PV peut entrer dans le budget de fonctionnement du CSE. Lorsque le recours au prestataire émane de l’employeur, ce dernier peut en supporter les frais. Les modalités de prise en charge se décident au sein du comité ; un vote en réunion et une mention au PV sécurisent la décision.',
  },
  {
    question: 'Y a-t-il un engagement de durée ?',
    answer: 'Non. ALC intervient ponctuellement, pour une réunion isolée, ou de façon régulière selon vos besoins. Aucun abonnement contraignant : la récurrence se construit sur la qualité du service, réunion après réunion. Vous restez libre d’ajuster le format ou la fréquence à tout moment.',
  },
  {
    question: 'Les tarifs sont-ils indiqués hors taxes ?',
    answer: 'Oui. Les prix sont exprimés en HT ; la TVA au taux de 20 % s’ajoute sur la facture. Le devis détaille le montant HT, la TVA et le total à régler, sans frais caché.',
  },
  {
    question: 'Comment obtenir un devis ?',
    answer: 'Décrivez-nous votre réunion : type d’instance, durée, fréquence et format souhaité. Vous recevez un devis gratuit et personnalisé sous 24 heures. Vous pouvez aussi nous joindre au 04 12 10 06 06 ou à contact@atoopv.com.',
  },
]

export const TARIFICATION_CTA = {
  eyebrow: 'Passons à l’action',
  heading: 'Prêt pour votre devis personnalisé ?',
  body: 'Décrivez-nous votre réunion : type d’instance, durée, fréquence et format souhaité. Vous recevez un devis gratuit et personnalisé sous 24 heures.',
  primaryCta: { label: 'Demander un devis gratuit', to: '/atoopv/contact' },
  secondaryCta: { label: 'Voir toutes nos ressources', to: '/atoopv/ressources' },
}
