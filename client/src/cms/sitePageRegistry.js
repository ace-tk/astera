import {
  TARIFICATION_HERO,
  TARIFICATION_INTRO,
  TARIFICATION_OPTIONS,
  TARIFICATION_TIERS,
  TARIFICATION_CALCULATOR,
  TARIFICATION_WHY,
  TARIFICATION_HOW,
  TARIFICATION_FAQ,
  TARIFICATION_CTA,
} from '../constants/tarificationHome.js'
import {
  A_PROPOS_HERO,
  A_PROPOS_MISSION,
  A_PROPOS_VALUES,
  A_PROPOS_APPROACH,
  A_PROPOS_FOUNDER,
  A_PROPOS_SIRUS,
  A_PROPOS_CTA,
} from '../constants/aProposHome.js'
import { CONTACT_PAGE } from '../constants/contactHome.js'
import {
  ACCUEIL,
  ATOOPV_STATS,
  NOS_INSTANCES,
  HOMEPAGE_GUARANTEES,
  HOMEPAGE_ORCHESTRATED,
  NOTRE_CONVICTION,
  COMMENT_CA_MARCHE,
  ATOOPV_OFFERS,
  COMPLIANCE_NAMES,
  COMPLIANCE_BOOKS_TEASER,
  HOME_TICKER,
  ANNOUNCEMENT_MESSAGES,
  ACTUCSE_FAQ,
} from '../constants/atoopvHome.js'
import {
  ATOOSAVOIR_HERO,
  ATOOSAVOIR_TRUST_BADGES,
  ATOOSAVOIR_CONSTAT,
  ATOOSAVOIR_EXAMPLES,
  ATOOSAVOIR_WHAT_IS,
  ATOOSAVOIR_QUESTIONS,
  ATOOSAVOIR_STEPS,
  ATOOSAVOIR_FICHE_INTRO,
  ATOOSAVOIR_FICHE_STATS,
  ATOOSAVOIR_FICHE_TEASER,
  ATOOSAVOIR_COMPARISON,
  ATOOSAVOIR_PRICING,
  ATOOSAVOIR_ANALYSIS,
  ATOOSAVOIR_FAQ,
  ATOOSAVOIR_BROCHURE,
  ATOOSAVOIR_CTA,
  ATOOSAVOIR_CONTACT,
  ATOOSAVOIR_LEGAL,
  ATOOSAVOIR_EXEMPLE_HERO,
  ATOOSAVOIR_EXEMPLE_INTRO,
  ATOOSAVOIR_EXEMPLE_CARD,
  ATOOSAVOIR_EXEMPLE_CTA,
  ATOOSAVOIR_CGV_HERO,
} from '../constants/atoosavoirHome.js'
import {
  AUTODIAGNOSTIC_HERO,
  AUTODIAGNOSTIC_INTRO,
  AUTODIAGNOSTIC_WHY,
  AUTODIAGNOSTIC_QUIZ,
  AUTODIAGNOSTIC_CTA,
} from '../constants/autodiagnosticHome.js'
import {
  RESOURCE_CATEGORIES,
  RESOURCE_LIBRARY_BOOKS,
  RESOURCE_FEATURED,
  RESOURCE_RECOMMENDATIONS,
  REPORT_META,
  REPORT_PAGES,
} from '../constants/boutique.js'
import { DEVIS_CTA_HREF } from '../constants/content.js'
import { COMMUNICATION_FRAGMENTS } from '../constants/fragmentsIntros.js'
import { editorialTextOf } from './fragmentsIntroContainer.js'

/**
 * The website's fixed "site pages" — pages with their own bespoke design whose TEXT, LINKS
 * and NUMBERS the admin can edit (Content → Menus → Site pages). `defaults` is exactly what
 * the page shows today; the CMS only overrides values inside that structure (see
 * mergeContent.js). The server keeps a generated JSON copy of these defaults to validate
 * saves against (`npm run cms:site-pages` in server/; a test fails when it is stale).
 *
 * Adding a page = one entry here + using `useSitePage(key)` in the page component.
 *
 * Entry fields: `label`/`path` (admin tab + "View page" link), `group` (admin tab grouping),
 * `defaults` (the structured content in code) and, for pages whose text lives in a bundled
 * markdown file, `fileSource`: the server's generator reads that file and adds its fields to the
 * defaults (`fields` maps default-key → markdown header field: title/breadcrumb/body). The page
 * component passes the same bundled values to `useSitePage(key, bundledValues)`.
 */
export const SITE_PAGES = {
  tarification: {
    label: 'Tarification',
    group: 'Pages',
    path: '/tarification',
    defaults: {
      hero: { badge: TARIFICATION_HERO.badge, title: TARIFICATION_HERO.title },
      intro: { text: TARIFICATION_INTRO.blocks[0].text },
      options: TARIFICATION_OPTIONS,
      tiers: TARIFICATION_TIERS,
      calculator: TARIFICATION_CALCULATOR,
      why: TARIFICATION_WHY,
      how: TARIFICATION_HOW,
      faqSection: { eyebrow: 'Questions fréquentes', heading: 'Cliquez sur une question pour afficher la réponse' },
      faq: TARIFICATION_FAQ,
      cta: TARIFICATION_CTA,
      ctaImage: { src: '/atoopv-media/hero-salle-reunion.webp', alt: 'Salle de réunion équipée, prête pour une séance de CSE' },
    },
  },
  'a-propos': {
    label: 'À propos',
    group: 'Pages',
    path: '/a-propos',
    defaults: {
      hero: A_PROPOS_HERO,
      mission: A_PROPOS_MISSION,
      values: A_PROPOS_VALUES,
      approach: A_PROPOS_APPROACH,
      founder: A_PROPOS_FOUNDER,
      sirus: A_PROPOS_SIRUS,
      cta: A_PROPOS_CTA,
    },
  },
  contact: {
    label: 'Contact',
    group: 'Pages',
    path: '/contact',
    defaults: CONTACT_PAGE,
  },
  accueil: {
    label: 'Accueil',
    group: 'Pages',
    path: '/',
    defaults: {
      announcements: ANNOUNCEMENT_MESSAGES,
      announcementBar: { phone: '04 12 10 06 06', button: { label: 'Demander un devis', to: DEVIS_CTA_HREF } },
      hero: ACCUEIL.hero,
      ticker: HOME_TICKER,
      stats: ATOOPV_STATS,
      statsCaption: { text: ACCUEIL.statsCaption },
      expertise: ACCUEIL.expertise,
      instances: NOS_INSTANCES,
      offers: ATOOPV_OFFERS,
      complianceNames: COMPLIANCE_NAMES,
      orchestrated: HOMEPAGE_ORCHESTRATED,
      conviction: NOTRE_CONVICTION,
      howItWorks: COMMENT_CA_MARCHE,
      guarantees: HOMEPAGE_GUARANTEES,
      process: ACCUEIL.process,
      video: ACCUEIL.video,
      veille: ACCUEIL.veille,
      devis: ACCUEIL.devis,
      quickDiagnostic: ACCUEIL.quickDiagnostic,
      garanties: ACCUEIL.garanties,
      sectors: ACCUEIL.sectors,
      testimonials: ACCUEIL.testimonials,
      cta: ACCUEIL.cta,
      resources: ACCUEIL.resources,
      booksTeaser: COMPLIANCE_BOOKS_TEASER,
      faq: ACTUCSE_FAQ,
      finalCta: {
        heading: 'Donnez-nous votre prochain PV à rédiger, nous vous rendons un document que vos élus n’auront pas à corriger.',
        contact: 'contact@atoopv.com · 04 12 10 06 06',
        button: { label: 'Demander un devis', to: DEVIS_CTA_HREF },
      },
    },
  },
  atoosavoir: {
    label: 'AtooSavoir',
    group: 'Pages',
    path: '/atoosavoir',
    defaults: {
      hero: ATOOSAVOIR_HERO,
      trustBadges: ATOOSAVOIR_TRUST_BADGES,
      constat: ATOOSAVOIR_CONSTAT,
      examples: ATOOSAVOIR_EXAMPLES,
      whatIs: ATOOSAVOIR_WHAT_IS,
      questions: ATOOSAVOIR_QUESTIONS,
      steps: ATOOSAVOIR_STEPS,
      ficheIntro: ATOOSAVOIR_FICHE_INTRO,
      ficheStats: ATOOSAVOIR_FICHE_STATS,
      ficheTeaser: ATOOSAVOIR_FICHE_TEASER,
      ficheButton: { label: 'Voir un exemple complet' },
      comparison: ATOOSAVOIR_COMPARISON,
      pricing: ATOOSAVOIR_PRICING,
      analysis: ATOOSAVOIR_ANALYSIS,
      faqSection: { eyebrow: 'Questions fréquentes', heading: 'FAQ' },
      faq: ATOOSAVOIR_FAQ,
      brochure: ATOOSAVOIR_BROCHURE,
      cta: ATOOSAVOIR_CTA,
      contact: ATOOSAVOIR_CONTACT,
      legal: { text: ATOOSAVOIR_LEGAL, cgvLabel: 'Conditions générales de vente' },
    },
  },
  'atoosavoir-exemple': {
    label: 'AtooSavoir — Exemple',
    group: 'Pages',
    path: '/atoosavoir/exemple',
    defaults: {
      hero: ATOOSAVOIR_EXEMPLE_HERO,
      intro: ATOOSAVOIR_EXEMPLE_INTRO,
      card: ATOOSAVOIR_EXEMPLE_CARD,
      cardFooter: { question: 'Une question à traiter ?' },
      cta: ATOOSAVOIR_EXEMPLE_CTA,
      contact: ATOOSAVOIR_CONTACT,
    },
  },
  'atoosavoir-cgv': {
    label: 'AtooSavoir — CGV',
    group: 'Pages',
    path: '/atoosavoir/cgv',
    defaults: { hero: ATOOSAVOIR_CGV_HERO, backLink: { label: 'Retour à atoosavoir' } },
    fileSource: { file: 'content/atoosavoir/atoosavoir-cgv.md', parser: 'atoosavoir', fields: { markdown: 'body' } },
  },
  autodiagnostic: {
    label: 'Autodiagnostic',
    group: 'Pages',
    path: '/autodiagnostic',
    defaults: {
      hero: AUTODIAGNOSTIC_HERO,
      intro: AUTODIAGNOSTIC_INTRO,
      why: AUTODIAGNOSTIC_WHY,
      quiz: AUTODIAGNOSTIC_QUIZ,
      cta: AUTODIAGNOSTIC_CTA,
    },
  },
  boutique: {
    label: 'Boutique',
    group: 'Pages',
    path: '/boutique',
    defaults: {
      meta: { title: 'Boutique', description: 'Des guides pratiques pour comprendre, agir et maîtriser les enjeux du CSE.' },
      categoryTabs: RESOURCE_CATEGORIES,
      books: RESOURCE_LIBRARY_BOOKS,
      featured: RESOURCE_FEATURED,
      recommendations: RESOURCE_RECOMMENDATIONS,
      reportMeta: REPORT_META,
      reportPages: REPORT_PAGES,
    },
  },
  'veille-juridique': {
    label: 'Veille juridique (listing)',
    group: 'Pages',
    path: '/ressources/veille-juridique-cse',
    defaults: {
      hero: {
        badge: 'Ressources',
        title: 'Veille juridique CSE',
        lead: 'Publications LinkedIn du président d’ALC SAS — jurisprudence sociale et actualité juridique pour les élus CSE.',
      },
    },
  },
  'hub-services': {
    label: 'Services',
    group: 'Hub pages',
    path: '/services',
    defaults: {},
    fileSource: { file: 'content/drafting/services.md', fields: { title: 'title', badge: 'breadcrumb', markdown: 'body' } },
  },
  'hub-nos-services-pv': {
    label: 'Nos services PV',
    group: 'Hub pages',
    path: '/services/drafting',
    defaults: {},
    fileSource: { file: 'content/drafting/nos-services-pv.md', fields: { title: 'title', badge: 'breadcrumb', markdown: 'body' } },
  },
  'hub-communication-cse': {
    label: 'Communication CSE',
    group: 'Hub pages',
    path: '/services/communication',
    defaults: { fragmentsIntro: editorialTextOf(COMMUNICATION_FRAGMENTS) },
    fileSource: { file: 'content/communication/communication-cse.md', fields: { title: 'title', badge: 'breadcrumb', markdown: 'body' } },
  },
  'hub-formations-elus-cse-agree': {
    label: 'Formations élus CSE agréées',
    group: 'Hub pages',
    path: '/services/training',
    defaults: {},
    fileSource: { file: 'content/training/formations-elus-cse-agree.md', fields: { title: 'title', badge: 'breadcrumb', markdown: 'body' } },
  },
  'hub-tarif-redaction-pv-cse': {
    label: 'Tarif rédaction PV CSE',
    group: 'Hub pages',
    path: '/services/tarifs-infos',
    defaults: {},
    fileSource: { file: 'content/tarifs-infos/tarif-redaction-pv-cse.md', fields: { title: 'title', badge: 'breadcrumb', markdown: 'body' } },
  },
  'hub-guides-livres-blancs-cse': {
    label: 'Guides & livres blancs',
    group: 'Hub pages',
    path: '/ressources',
    defaults: {},
    fileSource: { file: 'content/resources/guides-livres-blancs-cse.md', fields: { title: 'title', badge: 'breadcrumb', markdown: 'body' } },
  },
}

export const SITE_PAGE_KEYS = Object.keys(SITE_PAGES)
