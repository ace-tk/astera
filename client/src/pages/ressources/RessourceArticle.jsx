import { useParams, Navigate } from 'react-router-dom'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getResource } from '@/services/resourcesContent'
import { RESSOURCES_NAV } from '@/constants/resourcesNav'

/**
 * Renders one extracted content/resources/<slug>.md file. A single dynamic
 * page for all 34 pages (hubs and leaf articles alike -- they're all just
 * extracted markdown, no structural difference) rather than one file per
 * page, same reasoning as by-city's CityPage. The /atoopv/ressources index
 * route passes slug="guides-livres-blancs-cse" directly: that page *is* the
 * real Ressources landing page on atoopv.com (the nav's "Ressources" link
 * points straight at it), so the index route renders it rather than a
 * directory page that doesn't exist in the source.
 */
export default function RessourceArticle({ slug: slugProp }) {
  const { slug: slugParam } = useParams()
  const slug = slugProp || slugParam
  const resource = getResource(slug)

  usePageMeta({ title: resource?.title })

  if (!resource) return <Navigate to="/atoopv/ressources" replace />

  return (
    <>
      <AtoopvHero badge={resource.breadcrumb} title={resource.title} />

      <ServiceCategoryContent navItems={RESSOURCES_NAV} navLabel="Ressources pages">
        <MarkdownArticle body={resource.body} color="sky" />
      </ServiceCategoryContent>
    </>
  )
}
