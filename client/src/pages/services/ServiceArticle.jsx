import { useParams, Navigate } from 'react-router-dom'
import ServiceHero from '@/components/services/ServiceHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getServicePage, excerpt } from '@/services/servicesContent'
import { CATEGORY_NAV, CATEGORY_NAV_LABEL, CATEGORY_COLOR, CATEGORY_LABEL } from '@/constants/servicesNav'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { stripEmphasis } from '@/utils/richText'

/**
 * Renders one extracted content/<category>/<slug>.md file. A single
 * dynamic page for every Services page (hub and leaf alike) instead of one
 * hand-built component per page — same reasoning as Ressources'
 * RessourceArticle: a hub page and a leaf page are both just extracted
 * markdown, no structural difference. Each category's index route passes
 * its hub slug directly via the `slug` prop (that page *is* the category's
 * real landing page on atoopv.com), the same way Ressources' index route
 * passes slug="guides-livres-blancs-cse" directly.
 */
export default function ServiceArticle({ category, slug: slugProp }) {
  const { slug: slugParam } = useParams()
  const slug = slugProp || slugParam
  const page = getServicePage(slug)

  usePageMeta({ title: page ? stripEmphasis(page.title) : undefined, description: page ? excerpt(page.body, 160) : undefined })

  if (!page) return <Navigate to={`/services/${category}`} replace />

  return (
    <>
      <ServiceHero
        badge={page.breadcrumb}
        title={page.title}
        breadcrumbs={[{ label: 'Services', to: '/services' }, { label: CATEGORY_LABEL[category], to: `/services/${category}` }]}
      />

      <ServiceCategoryContent navItems={CATEGORY_NAV[category]} navLabel={CATEGORY_NAV_LABEL[category]}>
        <MarkdownArticle body={page.body} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} />
      </ServiceCategoryContent>
    </>
  )
}
