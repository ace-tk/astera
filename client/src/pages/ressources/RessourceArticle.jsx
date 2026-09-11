import { useParams, Navigate } from 'react-router-dom'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import EditorialSectionRail from '@/components/atoopv/EditorialSectionRail'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RessourcesEditorialNav from '@/components/atoopv/RessourcesEditorialNav'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getResource } from '@/services/resourcesContent'
import { RESSOURCES_NAV } from '@/constants/resourcesNav'
import { extractH2Sections } from '@/utils/markdownSections'

/**
 * Renders one extracted content/resources/<slug>.md file. A single dynamic
 * page for every page (hubs and leaf articles alike -- they're all just
 * extracted markdown, no structural difference) rather than one file per
 * page, same reasoning as Services' ServiceArticle. The /atoopv/ressources index
 * route passes slug="guides-livres-blancs-cse" directly: that page *is* the
 * real Ressources landing page on atoopv.com (the nav's "Ressources" link
 * points straight at it), so the index route renders it rather than a
 * directory page that doesn't exist in the source.
 *
 * This is also where the ATOOPV_NAV "Blog" item lands (same href as
 * "Ressources") — EditorialGridBackground/EditorialSectionRail below give
 * every one of these ~35 pages the editorial-grid + section-index
 * treatment, derived entirely from each page's own existing `##` headings.
 */
export default function RessourceArticle({ slug: slugProp }) {
  const { slug: slugParam } = useParams()
  const slug = slugProp || slugParam
  const resource = getResource(slug)

  usePageMeta({ title: resource?.title })

  if (!resource) return <Navigate to="/atoopv/ressources" replace />

  const sections = extractH2Sections(resource.body)
  const hasSections = sections.length >= 2

  return (
    <>
      <AtoopvHero badge={resource.breadcrumb} title={resource.title} />

      <div className="relative">
        <EditorialGridBackground lines />
        <ServiceCategoryContent
          navItems={RESSOURCES_NAV}
          navLabel="Ressources pages"
          nav={<RessourcesEditorialNav items={RESSOURCES_NAV} label="Ressources pages" />}
          rail={hasSections ? <EditorialSectionRail items={sections} /> : undefined}
          stickyColumns
          compact
        >
          <MarkdownArticle body={resource.body} color="royal" editorialNumbers={hasSections} />
        </ServiceCategoryContent>
      </div>
    </>
  )
}
