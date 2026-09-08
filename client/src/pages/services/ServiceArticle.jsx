import { useParams, Navigate } from 'react-router-dom'
import { Eye, Send } from 'lucide-react'
import ServiceHero from '@/components/services/ServiceHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import GuideModelInfoPanel from '@/components/atoopv/GuideModelInfoPanel'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getServicePage, excerpt } from '@/services/servicesContent'
import { CATEGORY_NAV, CATEGORY_NAV_LABEL, CATEGORY_COLOR, CATEGORY_LABEL } from '@/constants/servicesNav'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { stripEmphasis } from '@/utils/richText'
import { parseModelePvGratuitBody } from '@/utils/modelePvGratuitContent'

// The one article whose source markdown has a "raw stats/CTA/tag-list" info
// block that renders far better through components already built for this
// exact shape (ServiceHero's own primaryCta/secondaryCta/tags) than through
// the generic markdown-to-paragraph path every other Services article uses.
// Scoped to this single slug on purpose — see GuideModelInfoPanel.jsx and
// utils/modelePvGratuitContent.js for the rest of the story.
const ENHANCED_INFO_SLUG = 'modele-pv-cse-gratuit'

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

  const enhanced = slug === ENHANCED_INFO_SLUG ? parseModelePvGratuitBody(page.body) : null

  return (
    <>
      <ServiceHero
        badge={page.breadcrumb}
        title={page.title}
        breadcrumbs={[{ label: 'Services', to: '/services' }, { label: CATEGORY_LABEL[category], to: `/services/${category}` }]}
        tags={enhanced?.tags}
        secondaryCta={
          enhanced?.secondaryCta && {
            to: resolveServiceHref(enhanced.secondaryCta.href).href,
            label: (
              <>
                <Eye className="h-4 w-4" /> {enhanced.secondaryCta.label}
              </>
            ),
          }
        }
        primaryCta={
          enhanced?.primaryCta && {
            to: resolveServiceHref(enhanced.primaryCta.href).href,
            label: (
              <>
                {enhanced.primaryCta.label} <Send className="h-4 w-4" />
              </>
            ),
          }
        }
      />

      <ServiceCategoryContent navItems={CATEGORY_NAV[category]} navLabel={CATEGORY_NAV_LABEL[category]}>
        {enhanced ? (
          <>
            <MarkdownArticle body={enhanced.introBody} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} />
            <GuideModelInfoPanel headingBody={enhanced.headingBody} stats={enhanced.stats} contact={enhanced.contact} color={CATEGORY_COLOR[category]} />
            <MarkdownArticle body={enhanced.restBody} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} />
          </>
        ) : (
          <MarkdownArticle body={page.body} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} />
        )}
      </ServiceCategoryContent>
    </>
  )
}
