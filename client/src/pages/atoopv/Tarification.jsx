import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import RichTextSection from '@/components/services/RichTextSection'
import PricingCalculator from '@/components/services/PricingCalculator'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import {
  TARIFICATION_HERO,
  TARIFICATION_INTRO,
  TARIFICATION_OPTIONS,
  TARIFICATION_TIERS,
  TARIFICATION_CALCULATOR,
  TARIFICATION_WHY,
  TARIFICATION_HOW,
  TARIFICATION_FAQ,
  TARIFICATION_CTA,
} from '@/constants/tarificationHome'

/**
 * Ported ATOOPV Tarification page — content extracted verbatim in French
 * from content/pricing/tarification.md (https://atoopv.com/tarification/).
 * Same composition as the English PricingPage (a single, self-contained
 * page — the source has no sidebar of sibling pages), swapping ServiceHero
 * for AtoopvHero to match the rest of the ported ATOOPV site.
 */
export default function Tarification() {
  usePageMeta({ title: TARIFICATION_HERO.title, description: TARIFICATION_INTRO.blocks[0]?.text })

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

      <AtoopvHero {...TARIFICATION_HERO} />

      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-14">
          <RichTextSection blocks={TARIFICATION_INTRO.blocks} color="golden" />
          <PricingCalculator tiers={TARIFICATION_TIERS} {...TARIFICATION_CALCULATOR} color="golden" />
          <RichTextSection eyebrow={TARIFICATION_OPTIONS.eyebrow} heading={TARIFICATION_OPTIONS.heading} blocks={TARIFICATION_OPTIONS.blocks} color="golden" />
          <RichTextSection eyebrow={TARIFICATION_WHY.eyebrow} heading={TARIFICATION_WHY.heading} blocks={TARIFICATION_WHY.blocks} color="golden" />
          <RichTextSection eyebrow={TARIFICATION_HOW.eyebrow} heading={TARIFICATION_HOW.heading} blocks={TARIFICATION_HOW.blocks} color="golden" />
          <FAQSection eyebrow="Questions fréquentes" heading="Cliquez sur une question pour afficher la réponse" items={TARIFICATION_FAQ} />
        </div>
      </div>

      <CTASection {...TARIFICATION_CTA} />
      <Footer />
    </motion.main>
  )
}
