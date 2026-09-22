import { useParams } from 'react-router-dom'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import EditorialSectionRail from '@/components/atoopv/EditorialSectionRail'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import EditorialCategoryNav from '@/components/atoopv/EditorialCategoryNav'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getResource } from '@/services/resourcesContent'
import { RESSOURCES_NAV } from '@/constants/resourcesNav'
import { extractH2Sections } from '@/utils/markdownSections'
import { useCmsArticle } from '@/cms/useCmsArticle'
import CmsArticleGate from '@/cms/CmsArticleGate'
import { CMS_DRIVEN_RESSOURCES } from '@/cms/config'
import { useSectionNav } from '@/cms/useNavigation'

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
  const bundled = getResource(slug)

  // Bundled markdown for every existing article; the CMS for new CMS articles and admin previews.
  const source = useCmsArticle({
    path: `/atoopv/ressources/${slug}`,
    section: 'ressources',
    slug,
    bundled,
    hub: Boolean(slugProp),
    drivenSlugs: CMS_DRIVEN_RESSOURCES,
  })

  return (
    <CmsArticleGate source={source} missingTo="/atoopv/ressources">
      {(resource) => <RessourceArticleView resource={resource} />}
    </CmsArticleGate>
  )
}

/** The Ressources Article design. Receives its content as `resource` (same shape from bundled markdown or the CMS). */
function RessourceArticleView({ resource }) {
  const navItems = useSectionNav('ressources', RESSOURCES_NAV)
  usePageMeta({ title: resource.seo?.title || resource.title, description: resource.seo?.description })

  const sections = extractH2Sections(resource.body)
  const hasSections = sections.length >= 2

  return (
    <>
      <AtoopvHero badge={resource.breadcrumb} title={resource.title} />

      <div className="relative">
        <EditorialGridBackground lines />
        <ServiceCategoryContent
          navItems={navItems}
          navLabel="Ressources pages"
          nav={<EditorialCategoryNav items={navItems} label="Ressources pages" />}
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
