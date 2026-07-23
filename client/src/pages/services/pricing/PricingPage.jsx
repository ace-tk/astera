import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import ServiceHero from '@/components/services/ServiceHero'
import RichTextSection from '@/components/services/RichTextSection'
import PricingCalculator from '@/components/services/PricingCalculator'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import {
  PRICING_HERO,
  PRICING_INTRO,
  PRICING_TIERS,
  PRICING_CALCULATOR,
  PRICING_WHY,
  PRICING_HOW,
  PRICING_FAQ,
  PRICING_CTA,
} from '@/constants/pricing'

/**
 * Only one file exists in /content/pricing, so — unlike Drafting,
 * Communication, Training, and Guides — this category has no sidebar of
 * sibling pages. It's a single, self-contained page (same pattern as the
 * Services hub itself), still wearing Astera's Navbar/Footer/ambient chrome.
 */
export default function PricingPage() {
  usePageMeta({ title: stripEmphasis(PRICING_HERO.title), description: PRICING_INTRO.blocks[0]?.text })

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen bg-paper"
    >
      <AmbientBackground />
      <Navbar />

      <ServiceHero {...PRICING_HERO} />

      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-14">
          <RichTextSection blocks={PRICING_INTRO.blocks} color="golden" />
          <PricingCalculator tiers={PRICING_TIERS} {...PRICING_CALCULATOR} color="golden" />
          <RichTextSection eyebrow={PRICING_WHY.eyebrow} heading={PRICING_WHY.heading} blocks={PRICING_WHY.blocks} color="golden" />
          <RichTextSection eyebrow={PRICING_HOW.eyebrow} heading={PRICING_HOW.heading} blocks={PRICING_HOW.blocks} color="golden" />
          <FAQSection items={PRICING_FAQ} />
        </div>
      </div>

      <CTASection {...PRICING_CTA} />
      <Footer />
    </motion.main>
  )
}
