import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import FeatureGrid from '@/components/services/FeatureGrid'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { DRAFTING_NAV, DRAFTING_OVERVIEW } from '@/constants/drafting'

export default function DraftingOverview() {
  const { hero, stats, included, whyUs, cta } = DRAFTING_OVERVIEW
  usePageMeta({ title: stripEmphasis(hero.title), description: hero.lead })

  return (
    <>
      <ServiceHero {...hero} />
      <StatsSection stats={stats} />

      <ServiceCategoryContent navItems={DRAFTING_NAV} navLabel="Drafting of Minutes pages">
        <FeatureGrid eyebrow={included.eyebrow} heading={included.heading} items={included.items} color="royal" columns={4} />
        <FeatureGrid eyebrow={whyUs.eyebrow} heading={whyUs.heading} lead={whyUs.lead} items={whyUs.items} color="royal" columns={4} />
      </ServiceCategoryContent>

      <CTASection {...cta} />
    </>
  )
}
