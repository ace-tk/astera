import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import FeatureGrid from '@/components/services/FeatureGrid'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { GUIDES_NAV, GUIDES_OVERVIEW as C } from '@/constants/guides'

export default function GuidesOverview() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={GUIDES_NAV} navLabel="Practical Guides pages">
        <FeatureGrid eyebrow={C.included.eyebrow} heading={C.included.heading} items={C.included.items} color="purple" columns={2} />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
