import ServiceHero from '@/components/services/ServiceHero'
import ArticleGrid from '@/components/atoopv/ArticleGrid'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getServicePagesByCategory, excerpt } from '@/services/servicesContent'
import { CATEGORY_NAV, CATEGORY_NAV_LABEL, CATEGORY_COLOR, CATEGORY_LABEL } from '@/constants/servicesNav'

/**
 * "Par ville" and "Guides pratiques" have no hub page on the live site —
 * their nav group headers are same-page anchors (#villes, #guides), not
 * real URLs (see extract_services.py's docstring) — so unlike every other
 * Services category, these two index routes have no extracted markdown to
 * render. This assembles the same directory-of-cards experience the rest
 * of the app uses for a synthesized hub (VeilleJuridique.jsx's "Veille
 * juridique CSE" page is the same pattern for Ressources) from the real
 * pages each category actually contains.
 */
const COPY = {
  'by-city': {
    title: 'Rédaction de PV CSE, partout en France',
    lead: 'Sélectionnez votre ville pour la couverture locale, les délais d’intervention et les formats proposés.',
  },
  guides: {
    title: 'Guides pratiques du procès-verbal de CSE',
    lead: 'Les réponses aux questions les plus fréquentes des élus sur la rédaction, l’approbation et le contenu du PV.',
  },
}

export default function ServiceCategoryDirectory({ category }) {
  const pages = getServicePagesByCategory(category)
  const copy = COPY[category]

  usePageMeta({ title: copy.title, description: copy.lead })

  const items = pages.map((p) => ({
    title: p.title,
    body: excerpt(p.body),
    to: `/services/${category}/${p.slug}`,
    cta: 'Lire →',
  }))

  return (
    <>
      <ServiceHero
        badge="Services"
        title={copy.title}
        lead={copy.lead}
        breadcrumbs={[{ label: 'Services', to: '/services' }, { label: CATEGORY_LABEL[category] }]}
      />

      <div className="relative">
        {/* "by-city" belongs to the Procès-verbal mega menu, which shouldn't
            show the decorative background blocks — "guides" doesn't belong
            to Procès-verbal or Formations and keeps the default. */}
        <EditorialGridBackground lines blocks={category === 'guides'} />
        <ServiceCategoryContent navItems={CATEGORY_NAV[category]} navLabel={CATEGORY_NAV_LABEL[category]}>
          <ArticleGrid items={items} color={CATEGORY_COLOR[category]} columns={3} featureFirst />
        </ServiceCategoryContent>
      </div>
    </>
  )
}
