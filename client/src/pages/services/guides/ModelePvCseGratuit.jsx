import { Link } from 'react-router-dom'
import ServiceHero from '@/components/services/ServiceHero'
import StatsSection from '@/components/services/StatsSection'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { GUIDES_NAV, MODELE_PV_CSE_GRATUIT as C } from '@/constants/guides'

export default function ModelePvCseGratuit() {
  usePageMeta({ title: stripEmphasis(C.hero.title), description: C.hero.lead })

  return (
    <>
      <ServiceHero {...C.hero} />
      <StatsSection stats={C.stats} />

      <ServiceCategoryContent navItems={GUIDES_NAV} navLabel="Practical Guides pages">
        <RichTextSection eyebrow={C.preview.eyebrow} heading={C.preview.heading} blocks={C.preview.blocks} color="rose" />
        <Reveal>
          <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
            <Button as={Link} to={C.preview.cta.to} variant="accent">
              {C.preview.cta.label}
            </Button>
          </div>
        </Reveal>

        <RichTextSection eyebrow={C.contents.eyebrow} heading={C.contents.heading} blocks={C.contents.blocks} color="rose" />
        <FeatureGrid items={C.contentsGrid} color="rose" columns={4} />

        <RichTextSection eyebrow={C.needExpert.eyebrow} heading={C.needExpert.heading} blocks={C.needExpert.blocks} color="rose" />
        <FeatureGrid items={C.needExpertGrid} color="rose" columns={4} />

        <FAQSection items={C.faq.slice(0, 3)} />
        <FAQSection eyebrow="More questions" heading="Other questions about the CSE minutes template" items={C.faq.slice(3)} />
      </ServiceCategoryContent>

      <CTASection {...C.cta} />
    </>
  )
}
