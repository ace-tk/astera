import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { GUIDES_NAV, GUIDE_DU_COMITE as C } from '@/constants/guides'

export default function GuideDuComite() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={GUIDES_NAV} navLabel="Practical Guides pages">
        <RichTextSection eyebrow={C.contents.eyebrow} heading={C.contents.heading} blocks={C.contents.blocks} color="purple" />
        <FeatureGrid items={C.contentsGrid} color="purple" columns={4} />

        <RichTextSection eyebrow={C.furtherReading.eyebrow} heading={C.furtherReading.heading} blocks={C.furtherReading.blocks} color="purple" />

        <RichTextSection eyebrow={C.whyUs.eyebrow} heading={C.whyUs.heading} color="purple" />
        <FeatureGrid items={C.whyUsGrid} color="purple" columns={4} />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
