import { useParams, Navigate } from 'react-router-dom'
import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import FeatureGrid from '@/components/services/FeatureGrid'
import BenefitsSection from '@/components/services/BenefitsSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { BY_CITY_NAV, CITIES, INTERVENTION_MODES, FORMAT_TIERS } from '@/constants/byCity'

/**
 * One dynamic route backs every redaction-pv-cse-<city> page: the eleven
 * city pages share an identical template (hero, coverage zones, modes of
 * intervention, why-us, formats, CTA) and differ only in their data, so a
 * single component parameterized by :citySlug avoids eleven near-duplicate
 * files while still giving each city its own URL and rendered page.
 */
export default function CityPage() {
  const { citySlug } = useParams()
  const city = CITIES.find((c) => c.slug === citySlug)

  usePageMeta({
    title: city ? stripEmphasis(city.hero.title) : 'By City',
    description: city?.hero.lead,
  })

  if (!city) return <Navigate to="/services/by-city" replace />

  return (
    <>
      <ServiceHero {...city.hero} />
      <StatsSection stats={city.stats} />

      <ServiceCategoryContent navItems={BY_CITY_NAV} navLabel="By City pages">
        <FeatureGrid
          eyebrow="Coverage area"
          heading={city.zones.heading}
          lead={city.zones.lead}
          items={city.zones.items}
          color="sky"
          columns={3}
        />

        <FeatureGrid
          eyebrow="How we work"
          heading="On-site or video conference"
          lead="Whatever your setup, we work under the best conditions for your CSE."
          items={INTERVENTION_MODES}
          color="sky"
          columns={3}
        />

        <FeatureGrid eyebrow="Why choose us" heading={city.perks.heading} lead={city.perks.lead} items={city.perks.items} color="sky" columns={4} />

        <BenefitsSection
          eyebrow="Our minutes formats"
          heading="Three minutes formats to match your CSE"
          lead="Choose the level of detail that fits your stakes and your budget."
          tiers={FORMAT_TIERS}
          color="sky"
        />
      </ServiceCategoryContent>

      <CTASection {...city.cta} />
    </>
  )
}
