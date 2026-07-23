import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { TRAINING_NAV, TRAINING_OVERVIEW as C } from '@/constants/training'

export default function TrainingOverview() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={TRAINING_NAV} navLabel="Training pages">
        <FeatureGrid eyebrow={C.included.eyebrow} heading={C.included.heading} items={C.included.items} color="mint" columns={2} />

        <RichTextSection eyebrow={C.programme.eyebrow} heading={C.programme.heading} blocks={C.programme.blocks} color="mint" />
        <FeatureGrid items={C.programmeGrid} color="mint" columns={4} />

        <FAQSection items={C.faq} />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
