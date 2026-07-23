import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import FeatureGrid from '@/components/services/FeatureGrid'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { BY_CITY_NAV, BY_CITY_OVERVIEW } from '@/constants/byCity'

export default function ByCityOverview() {
  const { hero, stats, cities, cta } = BY_CITY_OVERVIEW
  usePageMeta({ title: stripEmphasis(hero.title), description: hero.lead })

  return (
    <>
      <ServiceHero {...hero} />
      <StatsSection stats={stats} />

      <ServiceCategoryContent navItems={BY_CITY_NAV} navLabel="By City pages">
        <FeatureGrid
          eyebrow="Coverage"
          heading="Every city we cover"
          lead="Pick your city for local coverage details, delivery times, and drafting formats."
          items={cities}
          color="sky"
          columns={3}
        />
      </ServiceCategoryContent>

      <CTASection {...cta} />
    </>
  )
}
