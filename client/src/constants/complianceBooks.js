/**
 * Shared source of truth for the real ATOOPV Shop (/atoopv/boutique) and its
 * book reader (BookReader.jsx). The shop grid, the book detail view, and the
 * reader all read from this one array — never duplicated between them.
 *
 * Only the featured book ships a full `previewPages` preview for now; the
 * others have `previewPages: null` and simply don't show a "Lire un
 * extrait" affordance until theirs is written. The reader itself is driven
 * entirely by `previewPages.length` — nothing about page count is
 * hardcoded, so a book with a 6-page or 12-page preview works identically.
 */

export const BOOK_CATEGORIES = ['Tous', 'CSE', 'Juridique', 'Finance', 'Santé', 'Management', 'Procès-verbal']

export const COMPLIANCE_BOOKS = [
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
    previewPages: [
      { kind: 'cover', subtitle: 'Édition 2026', publisher: 'ATOOPV Éditions' },
      {
        kind: 'text',
        heading: 'Introduction',
        body: [
          "Ce guide s'adresse à tout élu du CSE, qu'il découvre son mandat ou qu'il siège depuis plusieurs années.",
          "Il rassemble, en un seul document, l'essentiel du fonctionnement de l'instance : attributions, moyens, réunions et procès-verbal.",
        ],
      },
      { kind: 'divider', heading: 'Le comité social et économique', caption: 'Chapitre 1' },
      {
        kind: 'keypoints',
        heading: 'Attributions et fonctionnement',
        items: [
          "Consultation sur les orientations stratégiques de l'entreprise",
          'Suivi de la situation économique et financière',
          'Expression collective des salariés',
        ],
      },
      {
        kind: 'checklist',
        heading: 'Les moyens du CSE',
        items: [
          'Heures de délégation mensuelles',
          'Local aménagé mis à disposition',
          'Budget de fonctionnement et budget ASC',
          'Accès permanent à la BDESE',
        ],
      },
      {
        kind: 'quote',
        quote: 'Un procès-verbal fidèle et structuré protège autant les élus que la direction.',
        attribution: 'Réunions et procès-verbal · ATOOPV Éditions',
      },
      {
        kind: 'keypoints',
        heading: 'Points essentiels à retenir',
        items: [
          "Le CSE dispose d'attributions consultatives, pas décisionnaires",
          'Chaque réunion donne lieu à un procès-verbal opposable',
          "Les moyens du CSE sont fixés par le Code du travail et l'accord d'entreprise",
        ],
      },
      { kind: 'end' },
    ],
  },
  {
    id: 'tresorier-cse',
    title: 'Trésorier du CSE',
    author: 'ATOOPV Éditions',
    category: 'Finance',
    price: '22,90 €',
    pages: 144,
    accent: 'emerald',
    description: "Budget de fonctionnement, budget ASC, obligations comptables : les bases indispensables à une gestion saine et transparente.",
    previewPages: null,
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
    previewPages: null,
  },
  {
    id: 'pv-cse',
    title: 'Le procès-verbal du CSE',
    author: 'ATOOPV Éditions',
    category: 'Procès-verbal',
    price: '19,90 €',
    pages: 96,
    accent: 'royal',
    description: 'Rédiger un procès-verbal clair, complet et opposable : méthode, structure type et pièges à éviter.',
    previewPages: null,
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
    previewPages: null,
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
    previewPages: null,
  },
]
