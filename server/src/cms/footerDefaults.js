/**
 * The footer's real, live content as of the Footer CMS migration (2026-09-29) —
 * i.e. exactly what `client/src/components/atoopv/AtoopvFooter.jsx` used to
 * hardcode. `footerService.getFooter()` seeds a brand-new Footer document with
 * this in BOTH `draft` and `live` the first time it is ever read, so the public
 * site never shows anything different from what it already shows today, and no
 * separate "import the built-in footer" admin step is needed.
 *
 * The legal links still point at '#' — they always have; that isn't invented
 * here, it's the current, real state of the site. An admin can now point them
 * at real pages from the Footer editor once those pages exist.
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
    { id: 'legal-mentions', label: 'Mentions légales', link: { type: 'route', route: '/mentions-legales' } },
    { id: 'legal-cgv', label: 'CGV', link: { type: 'route', route: '/cgv' } },
    { id: 'legal-confidentialite', label: 'Politique de confidentialité', link: { type: 'route', route: '/politique-de-confidentialite' } },
    { id: 'legal-cookies', label: 'Cookies', link: { type: 'route', route: '/cookies' } },
  ],
  social: [],
  copyrightText: '© {year} ALC SAS — Tous droits réservés.',
  bottomLine: 'contact@atoopv.com · 04 12 10 06 06',
}
