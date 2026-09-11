import AtoopvHero from '@/components/atoopv/AtoopvHero'
import ArticleGrid from '@/components/atoopv/ArticleGrid'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import EditorialDivider from '@/components/atoopv/EditorialDivider'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RessourcesEditorialNav from '@/components/atoopv/RessourcesEditorialNav'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getResource, excerpt, VEILLE_JURIDIQUE_SLUGS } from '@/services/resourcesContent'
import { RESSOURCES_NAV } from '@/constants/resourcesNav'

/**
 * "Veille juridique CSE" hub. The live atoopv.com nav points this entry at
 * /category/veille-juridique-cse/ -- a paginated WordPress archive, not a
 * real page (see extract_resources.py's docstring for why it wasn't
 * extracted). Its 11 constituent articles were all extracted individually,
 * so this page assembles the same hub experience from those, using the
 * same ArticleGrid card grammar the Accueil page already uses for its own
 * "veille juridique" preview.
 */
export default function VeilleJuridique() {
  const items = VEILLE_JURIDIQUE_SLUGS.map((slug) => {
    const r = getResource(slug)
    return { title: r.title, body: excerpt(r.body), to: `/atoopv/ressources/${slug}`, cta: 'Lire →' }
  })

  usePageMeta({ title: 'Veille juridique CSE', description: 'Publications LinkedIn du président d’ALC SAS — jurisprudence sociale et actualité juridique pour les élus CSE.' })

  return (
    <>
      <AtoopvHero badge="Ressources" title="Veille juridique CSE" lead="Publications LinkedIn du président d’ALC SAS — jurisprudence sociale et actualité juridique pour les élus CSE." />

      <div className="relative">
        <EditorialGridBackground lines />

        <ServiceCategoryContent
          navItems={RESSOURCES_NAV}
          navLabel="Ressources pages"
          nav={<RessourcesEditorialNav items={RESSOURCES_NAV} label="Ressources pages" />}
          stickyColumns
          compact
        >
          <div>
            <EditorialDivider className="mb-8" />
            <ArticleGrid items={items} color="royal" columns={3} featureFirst />
          </div>
        </ServiceCategoryContent>
      </div>
    </>
  )
}
