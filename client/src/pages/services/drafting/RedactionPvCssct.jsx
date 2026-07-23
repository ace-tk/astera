import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { DRAFTING_NAV, REDACTION_PV_CSSCT as C } from '@/constants/drafting'

export default function RedactionPvCssct() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={DRAFTING_NAV} navLabel="Drafting of Minutes pages">
        <RichTextSection blocks={C.intro.blocks} color="emerald" />

        <RichTextSection eyebrow={C.whyEssential.eyebrow} heading={C.whyEssential.heading} blocks={C.whyEssential.blocks} color="emerald" />
        <FeatureGrid items={C.whyEssentialGrid} color="emerald" columns={4} />
        <RichTextSection blocks={[{ type: 'callout', ...C.whyEssentialCallout }]} color="emerald" />

        <RichTextSection eyebrow={C.expertise.eyebrow} heading={C.expertise.heading} blocks={C.expertise.blocks} color="emerald" />
        <RichTextSection blocks={[{ type: 'steps', items: C.expertiseSteps }]} color="emerald" />
        <RichTextSection blocks={[{ type: 'callout', ...C.expertiseCallout }]} color="emerald" />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
