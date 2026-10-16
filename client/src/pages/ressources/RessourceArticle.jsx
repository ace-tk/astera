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
import { useHubPage } from '@/cms/useHubPage'
import { CMS_DRIVEN_RESSOURCES, ressourceCmsPath } from '@/cms/config'
import { useSectionNav } from '@/cms/useNavigation'
import RelatedServices from '@/components/atoopv/RelatedServices'

/**
 * Renders one extracted content/resources/<slug>.md file. A single dynamic
 * page for every page (hubs and leaf articles alike -- they're all just
 * extracted markdown, no structural difference) rather than one file per
 * page, same reasoning as Services' ServiceArticle. The /ressources index
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
  // The Ressources landing page (guides & livres blancs) takes its text from its CMS site page, if published.
  const bundled = useHubPage(slugProp ? slug : null, getResource(slug))

  // Bundled markdown only as the fallback: migrated articles (CMS_DRIVEN_RESSOURCES) read the CMS first,
  // under their legacy stored address (see ressourceCmsPath); new CMS articles and admin previews too.
  const source = useCmsArticle({
    path: ressourceCmsPath(slug),
    section: 'ressources',
    slug,
    bundled,
    hub: Boolean(slugProp),
    drivenSlugs: CMS_DRIVEN_RESSOURCES,
    templateKey: 'ressources-article',
  })

  return (
    <CmsArticleGate source={source} missingTo="/ressources">
      {(resource) => <RessourceArticleView resource={resource} slug={slug} />}
    </CmsArticleGate>
  )
}

const GUIDES_SLUG = 'guides-livres-blancs-cse'
const GUIDES_META = {
  title: 'Guides et livres blancs gratuits pour le CSE',
  description:
    'Téléchargez nos guides juridiques et livres blancs : réunions du CSE, rédaction du procès-verbal, droits des élus, cas pratiques et références au Code du travail.',
}

/** The Ressources Article design. Receives its content as `resource` (same shape from bundled markdown or the CMS). */
function RessourceArticleView({ resource, slug }) {
  const navItems = useSectionNav('ressources', RESSOURCES_NAV)
  // The guides page shares its source with the old /ressources landing page; it now has its own subject in the
  // title and description (a title typed in the CMS wins, unless it is just the page heading again).
  const own = slug === GUIDES_SLUG ? GUIDES_META : null
  const customTitle = resource.seo?.title && resource.seo.title !== resource.title ? resource.seo.title : null
  usePageMeta({
    title: customTitle || own?.title || resource.title,
    description: resource.seo?.description || own?.description,
  })

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
          <RelatedServices slug={slug} />
        </ServiceCategoryContent>
      </div>
    </>
  )
}
