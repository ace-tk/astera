import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { COMMUNICATION_NAV, NEWSLETTER as C } from '@/constants/communication'

export default function Newsletter() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={COMMUNICATION_NAV} navLabel="Communication pages">
        <RichTextSection eyebrow={C.howItWorks.eyebrow} heading={C.howItWorks.heading} blocks={C.howItWorks.blocks} color="coral" />

        <RichTextSection eyebrow={C.whyActuCse.eyebrow} heading={C.whyActuCse.heading} blocks={C.whyActuCse.blocks} color="coral" />
        <FeatureGrid items={C.whyActuCseGrid} color="coral" columns={4} />

        <FAQSection items={C.faq} />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
