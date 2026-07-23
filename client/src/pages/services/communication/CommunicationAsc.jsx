import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { COMMUNICATION_NAV, COMMUNICATION_ASC as C } from '@/constants/communication'

export default function CommunicationAsc() {
  usePageMeta({ title: `${stripEmphasis(C.hero.title)} (ASC page)`, description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={COMMUNICATION_NAV} navLabel="Communication pages">
        <RichTextSection eyebrow={C.legalFramework.eyebrow} heading={C.legalFramework.heading} blocks={C.legalFramework.blocks} color="coral" />
        <FeatureGrid items={C.legalFrameworkGrid} color="coral" columns={4} />

        <RichTextSection eyebrow={C.whyUs.eyebrow} heading={C.whyUs.heading} blocks={C.whyUs.blocks} color="coral" />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
