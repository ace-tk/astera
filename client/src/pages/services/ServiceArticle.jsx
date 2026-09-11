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
import EditorialSectionRail from '@/components/atoopv/EditorialSectionRail'
import FAQSection from '@/components/services/FAQSection'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getServicePage, excerpt } from '@/services/servicesContent'
import { CATEGORY_NAV, CATEGORY_NAV_LABEL, CATEGORY_COLOR, CATEGORY_LABEL } from '@/constants/servicesNav'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { stripEmphasis } from '@/utils/richText'
import { parseModelePvGratuitBody, splitIconSections } from '@/utils/modelePvGratuitContent'
import { extractH2Sections } from '@/utils/markdownSections'
import FormationStatStrip from '@/components/atoopv/FormationStatStrip'
import PvKineticIntro from '@/components/atoopv/PvKineticIntro'
import FragmentsToDocument from '@/components/atoopv/FragmentsToDocument'
import { extractLeadTopics, extractFaq, extractCarteLinks, extractStatStrip } from '@/utils/formationContent'
import { FORMATION_ECONOMIQUE_FRAGMENTS, COMMUNICATION_FRAGMENTS } from '@/constants/fragmentsIntros'

// Kinetic brand intro (adapted from the Design Lab's Experiment 04) and the
// fragments-to-document intro (adapted from Experiment 06) — each scoped to
// one specific real slug, same "slug-keyed, additive" pattern as
// ENHANCED_INFO_SLUG/TOPIC_LAYOUT above, so every other Services page is
// completely unaffected.
const PV_KINETIC_INTRO_SLUG = 'redaction-pv-cse'
const FRAGMENTS_INTRO = {
  'formation-economique-elus-cse': FORMATION_ECONOMIQUE_FRAGMENTS,
  'communication-cse': COMMUNICATION_FRAGMENTS,
}

// The one article whose source markdown has a "raw stats/CTA/tag-list" info
// block that renders far better through components already built for this
// exact shape (ServiceHero's own primaryCta/secondaryCta/tags) than through
// the generic markdown-to-paragraph path every other Services article uses.
// Scoped to this single slug on purpose — see GuideModelInfoPanel.jsx and
// utils/modelePvGratuitContent.js for the rest of the story.
const ENHANCED_INFO_SLUG = 'modele-pv-cse-gratuit'

// Every Services page outside "guides" (drafting/by-city/tarifs-infos —
// the Procès-verbal menu — plus training/communication — the Formations
// menu) shares the same editorial system: no grid/block background, a
// compact stat strip, an H2-derived right rail, and — only where a page's
// own icon+heading "program" list has no body text between pairs (so lifting
// it into a title-only visual can't drop content) — a FormationTopics
// layout. Most drafting/by-city pages interleave a paragraph after each
// icon+heading instead, so extractLeadTopics correctly finds nothing there
// and they fall back to the plain (still icon-heading-merged) render —
// safe by construction, not a page-by-page judgment call. "guides" is
// reached only from the Ressources/Blog menus, not these two, and keeps
// its original treatment untouched.
const TOPIC_LAYOUT = {
  // Formations
  'formation-economique-elus-cse': 'explorer',
  'formation-cse-tresorier': 'journey',
  'formation-cssct-roles-missions': 'modules',
  'formation-droit-social-contrat-travail': 'journey',
  'formation-pro-communication': 'journey',
  'communication-cse': 'modules',
  'communication-asc': 'journey',
  'guide-du-comite': 'modules',
  // Procès-verbal — only the three tarifs-infos pages whose icon+heading
  // list has no interleaved body text (verified with extractLeadTopics);
  // every drafting/by-city page's own list has a paragraph after each
  // pair, so it renders through the normal path instead.
  'tarif-redaction-pv-cse': 'modules',
  'delai-redaction-pv-cse': 'journey',
  'pv-cse-code-travail': 'explorer',
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

  // Every category except "guides" (drafting/by-city/tarifs-infos —
  // Procès-verbal — and training/communication — Formations) uses the
  // shared editorial system: no grid background, compact stat strip,
  // H2-derived right rail, and (where safe) a FormationTopics layout.
  const usesEditorialSystem = !enhanced && category !== 'guides'
  // Formations only: the left nav and right rail's `sticky` was landing in
  // a grid column sized to its own short content (see ServiceCategoryContent's
  // `stickyColumns` doc) instead of the full row height, so it had almost no
  // room to actually stick and just scrolled with the page. Scoped to
  // training/communication only, per an explicit "Formations pages only,
  // nothing else" request — Procès-verbal pages have the same underlying
  // layout and would benefit from the same fix, but are left untouched here.
  const isFormationCategory = category === 'training' || category === 'communication'
  const faqResult = usesEditorialSystem ? extractFaq(page.body) : null
  const bodyBeforeFaq = faqResult ? faqResult.before : page.body
  const faqItems = faqResult?.items || []
  const faqAfterBody = faqResult?.after || ''

  const statResult = usesEditorialSystem ? extractStatStrip(bodyBeforeFaq) : null
  const introBody = statResult ? statResult.before : ''
  const stats = statResult?.stats || []
  const bodyAfterStats = statResult ? statResult.after : bodyBeforeFaq

  const topicsLayout = TOPIC_LAYOUT[slug]
  const topicsResult = usesEditorialSystem && topicsLayout ? extractLeadTopics(bodyAfterStats) : null
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

  // The right-side editorial rail — built from the page's own real `##`
  // headings (its actual section structure), the same machinery Ressources/
  // Blog articles already use, so it lists however many items that one page
  // genuinely has (2 through 5+ observed across Procès-verbal/Formations).
  // Fills the previously-empty right column with real, clickable navigation
  // instead of a background block.
  const editorialSections = usesEditorialSystem ? extractH2Sections(page.body) : []

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
      {slug === PV_KINETIC_INTRO_SLUG && <PvKineticIntro />}
      {FRAGMENTS_INTRO[slug] && <FragmentsToDocument {...FRAGMENTS_INTRO[slug]} />}

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
        {/* Procès-verbal (drafting/by-city/tarifs-infos) and Formations
            (training/communication) pages all want a fully clean,
            continuous page background — no grid, no tint wash, no blocks —
            per an explicit "zero block backgrounds" request. Only "guides"
            (reached from Ressources/Blog, not these menus) keeps the
            original grid+blocks. */}
        {!usesEditorialSystem && <EditorialGridBackground lines blocks={category === 'guides'} />}
        <ServiceCategoryContent
          navItems={CATEGORY_NAV[category]}
          navLabel={CATEGORY_NAV_LABEL[category]}
          stickyColumns={isFormationCategory}
          rail={
            railItems.length > 0 ? (
              <GuideModelRail items={railItems} />
            ) : editorialSections.length >= 2 ? (
              <EditorialSectionRail items={editorialSections} />
            ) : undefined
          }
        >
          {enhanced ? (
            <>
              <GuideModelInfoPanel headingBody={enhanced.headingBody} stats={enhanced.stats} contact={enhanced.contact} color={CATEGORY_COLOR[category]} />
              <GuideModelArticleBody segments={articleSegments} color={CATEGORY_COLOR[category]} resolveHref={resolveServiceHref} />
            </>
          ) : usesEditorialSystem ? (
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
