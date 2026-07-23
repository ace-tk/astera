import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { COMMUNICATION_NAV, COMMUNICATION_CSE as C } from '@/constants/communication'

export default function CommunicationCse() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={COMMUNICATION_NAV} navLabel="Communication pages">
        <RichTextSection eyebrow={C.practices.eyebrow} heading={C.practices.heading} blocks={C.practices.blocks} color="coral" />
        <FeatureGrid items={C.practicesGrid} color="coral" columns={4} />

        <RichTextSection eyebrow={C.whyUs.eyebrow} heading={C.whyUs.heading} blocks={C.whyUs.blocks} color="coral" />

        <FAQSection items={C.faq} />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
