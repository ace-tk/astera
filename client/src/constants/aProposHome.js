/**
 * Content for the ported ATOOPV À propos page, transcribed verbatim
 * (French, not translated) from content/about/a-propos.md — the extraction
 * of https://atoopv.com/a-propos/. The source page has no images, stats bar,
 * multi-person team grid, or FAQ (FAQ lives at a separate /faq/ page under a
 * different nav item) — just a mission statement, four value cards, a
 * founder bio, and a product-innovation teaser, so nothing here invents
 * sections the source doesn't have.
 */
import { Target, Scale, Lock, Compass } from 'lucide-react'

export const A_PROPOS_HERO = {
  badge: 'À propos — AtooPV depuis 2017',
  title: 'L’expertise du procès-verbal de CSE, *au service de vos instances*',
  lead: 'AtooPV fait de la rédaction des procès-verbaux un métier à part entière : méthode rigoureuse, délais tenus, fidélité totale aux échanges. Pour des CSE de toutes tailles, partout en France.',
  primaryCta: { label: 'Travaillons ensemble', to: '/atoopv/contact' },
  secondaryCta: { label: 'Nos services', to: '/atoopv/services' },
}

export const A_PROPOS_MISSION = {
  eyebrow: 'Notre raison d’être',
  heading: 'Le document le plus sous-estimé du dialogue social',
  color: 'royal',
  blocks: [
    {
      type: 'paragraph',
      text: 'Le procès-verbal engage l’instance, trace chaque décision et peut être produit devant le juge. Rédigé à la hâte par un élu déjà surchargé, livré en retard, parfois incomplet, il devient un risque au lieu d’une protection.',
    },
    {
      type: 'paragraph',
      text: 'AtooPV est né de ce constat : faire du PV un acte professionnel, exigeant et stratégique, plutôt qu’une corvée expédiée en fin de réunion. Cette conviction guide chaque mission depuis 2017.',
    },
  ],
}

export const A_PROPOS_VALUES = {
  eyebrow: 'Nos valeurs',
  heading: 'Quatre engagements, sur chaque PV',
  color: 'royal',
  items: [
    {
      icon: Target,
      title: 'Fidélité aux débats',
      body: 'Retranscrire sans trahir. Chaque position, chaque nuance est rendue avec exactitude : nous restituons la réalité des échanges, sans la reformuler.',
    },
    {
      icon: Scale,
      title: 'Rigueur juridique',
      body: 'Nos rédacteurs maîtrisent le droit des IRP. Chaque PV respecte les dispositions légales et la jurisprudence en vigueur.',
    },
    {
      icon: Lock,
      title: 'Confidentialité totale',
      body: 'NDA systématique et espace de partage sécurisé. Les délibérations de votre instance ne sortent pas de votre instance.',
    },
    {
      icon: Compass,
      title: 'Indépendance',
      body: 'Ni proche de la direction, ni proche des syndicats. Un seul mandat : la vérité des échanges.',
    },
  ],
}

export const A_PROPOS_APPROACH = {
  eyebrow: 'Notre approche',
  heading: 'Une connaissance des deux côtés de la table',
  color: 'royal',
  blocks: [
    {
      type: 'paragraph',
      text: 'AtooPV s’appuie sur une expérience rare : avoir exercé des responsabilités côté direction comme côté représentation du personnel. Cette double lecture nourrit chaque procès-verbal d’une compréhension fine des enjeux, des tensions et des attentes de chacun.',
    },
    {
      type: 'paragraph',
      text: 'Depuis 2017, ce sont des centaines de procès-verbaux rédigés, pour des CSE allant de la PME régionale au groupe coté au CAC 40 — avec la même promesse tenue à chaque fois : fidélité aux échanges, rigueur juridique, délais respectés.',
    },
  ],
}

export const A_PROPOS_FOUNDER = {
  eyebrow: 'L’expertise derrière AtooPV',
  heading: 'Alami Loine, fondateur d’ALC SAS',
  lead: 'Un savoir-faire à la croisée du droit social, de l’économie et du terrain.',
  color: 'royal',
  blocks: [
    {
      type: 'list',
      items: [
        'Formateur agréé en formation économique des membres du CSE — art. L.2315-63 CT (NDA 84740456974)',
        'Master en économie, option politique et analyse économique',
        'Auteur de *Debout dans l’entreprise — Faire de la loi un droit* (à paraître, septembre 2026)',
      ],
    },
  ],
}

export const A_PROPOS_SIRUS = {
  eyebrow: 'Innovation 2026',
  heading: 'SIRUS — la prochaine étape du PV de CSE',
  color: 'royal',
  blocks: [
    {
      type: 'paragraph',
      text: 'Après neuf ans de terrain, l’expertise d’AtooPV prend une forme inédite : SIRUS, une technologie conçue pour transformer la production des procès-verbaux d’instances. Elle ne remplace pas l’expertise humaine, elle l’amplifie. Annonce officielle à venir.',
    },
  ],
}

export const A_PROPOS_CTA = {
  eyebrow: 'Travaillons ensemble',
  heading: 'Confiez la rédaction de vos PV à AtooPV',
  body: 'Libérez vos élus des contraintes administratives et sécurisez la conformité de vos procès-verbaux. Rédaction de PV, audiotypie et formations élus CSE : un seul partenaire pour votre instance.',
  primaryCta: { label: 'Contactez-nous', to: '/atoopv/contact' },
  secondaryCta: { label: 'Voir nos services', to: '/atoopv/services' },
  footer: '04 12 10 06 06 · contact@atoopv.com · ALC SAS — SIREN 833 781 248',
}
