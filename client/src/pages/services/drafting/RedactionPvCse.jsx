import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import BenefitsSection from '@/components/services/BenefitsSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { DRAFTING_NAV, REDACTION_PV_CSE as C } from '@/constants/drafting'

export default function RedactionPvCse() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={DRAFTING_NAV} navLabel="Drafting of Minutes pages">
        <RichTextSection blocks={C.intro.blocks} color="royal" />

        <RichTextSection eyebrow={C.whyOutsource.eyebrow} heading={C.whyOutsource.heading} blocks={C.whyOutsource.blocks} color="royal" />
        <FeatureGrid items={C.whyOutsourceGrid} color="royal" columns={4} />
        <RichTextSection blocks={[{ type: 'callout', ...C.deadlineCallout }]} color="royal" />

        <RichTextSection
          eyebrow={C.process.eyebrow}
          heading={C.process.heading}
          lead={C.process.lead}
          color="royal"
          blocks={[{ type: 'callout', ...C.processCallout }, { type: 'steps', items: C.processSteps }]}
        />

        <RichTextSection eyebrow={C.formats.eyebrow} heading={C.formats.heading} lead={C.formats.lead} color="royal" blocks={[{ type: 'callout', ...C.formatsCallout }]} />
        <BenefitsSection tiers={C.formatTiers} color="royal" />

        <RichTextSection eyebrow={C.legalValue.eyebrow} heading={C.legalValue.heading} blocks={C.legalValue.blocks} color="royal" />
        <FeatureGrid items={C.legalValueGrid} color="royal" columns={4} />
        <RichTextSection blocks={[{ type: 'callout', ...C.legalValueCallout }]} color="royal" />

        <RichTextSection eyebrow={C.expertise.eyebrow} heading={C.expertise.heading} blocks={C.expertise.blocks} color="royal" />
        <FeatureGrid items={C.expertiseGrid} color="royal" columns={3} />
        <RichTextSection blocks={C.coverage.blocks} color="royal" />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
