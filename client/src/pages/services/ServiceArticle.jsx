import { useParams, Navigate } from 'react-router-dom'
import { Eye, Send } from 'lucide-react'
import ServiceHero from '@/components/services/ServiceHero'
import GuideModelHero from '@/components/atoopv/GuideModelHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import GuideModelInfoPanel from '@/components/atoopv/GuideModelInfoPanel'
import GuideModelArticleBody from '@/components/atoopv/GuideModelArticleBody'
import GuideModelRail from '@/components/atoopv/GuideModelRail'
import FormationTopics from '@/components/atoopv/FormationTopics'
import FormationIndex from '@/components/atoopv/FormationIndex'
import FAQSection from '@/components/services/FAQSection'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getServicePage, excerpt } from '@/services/servicesContent'
import { CATEGORY_NAV, CATEGORY_NAV_LABEL, CATEGORY_COLOR, CATEGORY_LABEL } from '@/constants/servicesNav'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { stripEmphasis } from '@/utils/richText'
import { parseModelePvGratuitBody, splitIconSections } from '@/utils/modelePvGratuitContent'
import FormationStatStrip from '@/components/atoopv/FormationStatStrip'
import { extractLeadTopics, extractFaq, extractCarteLinks, extractStatStrip } from '@/utils/formationContent'

// The one article whose source markdown has a "raw stats/CTA/tag-list" info
// block that renders far better through components already built for this
// exact shape (ServiceHero's own primaryCta/secondaryCta/tags) than through
// the generic markdown-to-paragraph path every other Services article uses.
// Scoped to this single slug on purpose — see GuideModelInfoPanel.jsx and
// utils/modelePvGratuitContent.js for the rest of the story.
const ENHANCED_INFO_SLUG = 'modele-pv-cse-gratuit'

// Formations menu pages (training + communication categories) — every one
// of these repeats the same short icon+heading "program" list right after
// its intro (see utils/formationContent.js). Giving each its own
// FormationTopics layout is what makes "an individual training", "a
// specialized/multi-facet training" and "a topic to browse" read
// differently instead of all sharing one template. One page per category
// is left out on purpose: newsletter-actucse's list is a mis-scraped run of
// truncated sentence fragments, not real short titles — forcing it into a
// visual layout would draw attention to the truncation rather than hide it,
// so it just renders through the normal MarkdownArticle path instead.
const FORMATION_TOPIC_LAYOUT = {
  'formation-economique-elus-cse': 'explorer',
  'formation-cse-tresorier': 'journey',
  'formation-cssct-roles-missions': 'modules',
  'formation-droit-social-contrat-travail': 'journey',
  'formation-pro-communication': 'journey',
  'communication-cse': 'modules',
  'communication-asc': 'journey',
  'guide-du-comite': 'modules',
}

// The Formations landing page (/services/training's hub) links its four
// "à la carte" formations inline, in one prose sentence. This turns those
// same four existing links into the editorial index rows — title/excerpt
// pulled from each linked page's own real content (getServicePage/excerpt),
// nothing invented.
const CARTE_INDEX_SLUG = 'formations-elus-cse-agree'
const CARTE_MARKER = 'NOS FORMATIONS À LA CARTE'

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
  const articleSegments = enhanced ? splitIconSections(enhanced.restBody) : null
  const railItems = articleSegments?.filter((s) => s.type === 'icon') || []
  const breadcrumbs = [{ label: 'Services', to: '/services' }, { label: CATEGORY_LABEL[category], to: `/services/${category}` }]

  const isFormationPage = !enhanced && (category === 'training' || category === 'communication')
  const faqResult = isFormationPage ? extractFaq(page.body) : null
  const bodyBeforeFaq = faqResult ? faqResult.before : page.body
  const faqItems = faqResult?.items || []
  const faqAfterBody = faqResult?.after || ''

  const statResult = isFormationPage ? extractStatStrip(bodyBeforeFaq) : null
  const introBody = statResult ? statResult.before : ''
  const stats = statResult?.stats || []
  const bodyAfterStats = statResult ? statResult.after : bodyBeforeFaq

  const topicsLayout = FORMATION_TOPIC_LAYOUT[slug]
  const topicsResult = isFormationPage && topicsLayout ? extractLeadTopics(bodyAfterStats) : null
  const mainBody = topicsResult ? topicsResult.before : bodyAfterStats
  const topics = topicsResult?.topics || []
  const afterTopicsBody = topicsResult?.after || ''

  const indexItems =
    slug === CARTE_INDEX_SLUG
      ? extractCarteLinks(page.body, CARTE_MARKER)
          .map((l) => {
            const target = getServicePage(l.href.replace(/^\/+|\/+$/g, ''))
            return target ? { title: target.title, excerpt: excerpt(target.body), to: resolveServiceHref(l.href).href } : null
          })
          .filter(Boolean)
      : []
  const heroCtas = {
    secondaryCta: enhanced?.secondaryCta && {
      to: resolveServiceHref(enhanced.secondaryCta.href).href,
      label: (
        <>
          <Eye className="h-4 w-4" /> {enhanced.secondaryCta.label}
        </>
      ),
    },
    primaryCta: enhanced?.primaryCta && {
      to: resolveServiceHref(enhanced.primaryCta.href).href,
      label: (
        <>
          {enhanced.primaryCta.label} <Send className="h-4 w-4" />
        </>
      ),
    },
  }

  return (
    <>
      {enhanced ? (
        <GuideModelHero
          badge={page.breadcrumb}
          title={page.title}
          breadcrumbs={breadcrumbs}
          introBody={enhanced.introBody}
          tags={enhanced.tags}
          color={CATEGORY_COLOR[category]}
          {...heroCtas}
        />
      ) : (
        <ServiceHero badge={page.breadcrumb} title={page.title} breadcrumbs={breadcrumbs} />
      )}

      <div className="relative">
        {/* Formations (training/communication) pages want a fully clean,
            continuous page background — no grid, no tint wash, no blocks —
            per an explicit "zero block backgrounds" request. drafting/
            by-city/tarifs-infos keep the faint grid lines (no blocks); only
            "guides" (reached from Ressources/Blog, not these two menus)
            keeps the original grid+blocks. */}
        {!isFormationPage && <EditorialGridBackground lines blocks={category === 'guides'} />}
        <ServiceCategoryContent
          navItems={CATEGORY_NAV[category]}
          navLabel={CATEGORY_NAV_LABEL[category]}
          rail={railItems.length > 0 ? <GuideModelRail items={railItems} /> : undefined}
        >
          {enhanced ? (
            <>
              <GuideModelInfoPanel headingBody={enhanced.headingBody} stats={enhanced.stats} contact={enhanced.contact} color={CATEGORY_COLOR[category]} />
              <GuideModelArticleBody segments={articleSegments} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} />
            </>
          ) : isFormationPage ? (
            <>
              {introBody && <MarkdownArticle body={introBody} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} iconHeadings />}
              {stats.length > 0 && <FormationStatStrip stats={stats} />}
              {mainBody && <MarkdownArticle body={mainBody} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} iconHeadings />}
              {topics.length > 0 && <FormationTopics topics={topics} layout={topicsLayout} />}
              {afterTopicsBody && <MarkdownArticle body={afterTopicsBody} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} iconHeadings />}
              {indexItems.length > 0 && <FormationIndex items={indexItems} />}
              {faqItems.length > 0 && <FAQSection eyebrow="Questions fréquentes" heading="FAQ" items={faqItems} />}
              {faqAfterBody && <MarkdownArticle body={faqAfterBody} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} iconHeadings />}
            </>
          ) : (
            <MarkdownArticle body={page.body} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} iconHeadings />
          )}
        </ServiceCategoryContent>
      </div>
    </>
  )
}
