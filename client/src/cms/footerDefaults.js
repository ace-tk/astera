/**
 * Fallback-only mirror of server/src/cms/footerDefaults.js's DEFAULT_FOOTER_CONTENT.
 * Used ONLY when the CMS request fails or times out (see useFooter.js) — the site
 * must never render a broken/empty footer because of a temporary API failure. This
 * is a snapshot of the footer's real content as of the Footer CMS migration; once
 * an admin publishes an edit, the live site reads the CMS's answer instead.
 */
export const DEFAULT_FOOTER_CONTENT = {
  brand: {
    tagline: '« Retranscrire sans trahir. »',
    location: 'Lyon · Annecy — ALC SAS',
  },
  contact: {
    phoneDisplay: '04 12 10 06 06',
    phoneHref: 'tel:+33412100606',
    email: 'contact@atoopv.com',
  },
  cta: {
    label: 'Demander un devis',
    link: { type: 'route', route: '/tarification' },
  },
  columns: [
    {
      id: 'offres',
      title: 'Offres',
      links: [
        { id: 'offres-pv', label: 'Rédaction PV — ALC', link: { type: 'route', route: '/services' } },
        { id: 'offres-sirus', label: 'SIRUS — IA', link: { type: 'route', route: '/a-propos' } },
        { id: 'offres-formations', label: 'Formations', link: { type: 'route', route: '/services/training' } },
      ],
    },
    {
      id: 'ressources',
      title: 'Ressources',
      links: [
        { id: 'ressources-blog', label: 'Blog', link: { type: 'route', route: '/ressources' } },
        { id: 'ressources-atoosavoir', label: 'AtooSavoir', link: { type: 'route', route: '/atoosavoir' } },
        { id: 'ressources-boutique', label: 'Boutique', link: { type: 'route', route: '/boutique' } },
      ],
    },
    {
      id: 'entreprise',
      title: 'Entreprise',
      links: [
        { id: 'entreprise-apropos', label: 'À propos', link: { type: 'route', route: '/a-propos' } },
        { id: 'entreprise-contact', label: 'Contact', link: { type: 'mailto', url: 'mailto:contact@atoopv.com' } },
      ],
    },
  ],
  legalLinks: [
    { id: 'legal-mentions', label: 'Mentions légales', link: { type: 'anchor', url: '#' } },
    { id: 'legal-cgv', label: 'CGV', link: { type: 'anchor', url: '#' } },
    { id: 'legal-confidentialite', label: 'Politique de confidentialité', link: { type: 'anchor', url: '#' } },
    { id: 'legal-cookies', label: 'Cookies', link: { type: 'anchor', url: '#' } },
  ],
  social: [],
  copyrightText: '© {year} ALC SAS — Tous droits réservés.',
  bottomLine: 'contact@atoopv.com · 04 12 10 06 06',
}
