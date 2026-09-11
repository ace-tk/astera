import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import RichTextSection from '@/components/services/RichTextSection'
import PVSimulator from '@/components/atoopv/PVSimulator'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import Pricing from '@/components/landing/sections/Pricing'
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

      {/* Only the badge chip renders here — the lead paragraph and CTA
          button that used to sit below it were removed so the card starts
          higher on the page, and the page heading now lives inside the
          card itself (see PVSimulator's own `title`) instead of floating
          above it. */}
      <AtoopvHero badge={TARIFICATION_HERO.badge} hideTitle />

      {/* The interactive simulator needs the full shell width for its
          three-column console + live preview, so it sits outside the
          narrower max-w-3xl column the rest of this page's prose uses. */}
      <div className="shell pt-2 pb-14 sm:pt-4 sm:pb-16">
        <PVSimulator
          title={TARIFICATION_HERO.title}
          tiers={TARIFICATION_TIERS}
          badge={TARIFICATION_HERO.badge}
          intro={TARIFICATION_INTRO.blocks[0]?.text}
          {...TARIFICATION_CALCULATOR}
          color="royal"
        />
      </div>

      <div className="shell pb-14 sm:pb-16">
        <div className="mx-auto max-w-3xl space-y-14">
          <RichTextSection eyebrow={TARIFICATION_OPTIONS.eyebrow} heading={TARIFICATION_OPTIONS.heading} blocks={TARIFICATION_OPTIONS.blocks} color="golden" />
          <RichTextSection eyebrow={TARIFICATION_WHY.eyebrow} heading={TARIFICATION_WHY.heading} blocks={TARIFICATION_WHY.blocks} color="golden" />
          <RichTextSection eyebrow={TARIFICATION_HOW.eyebrow} heading={TARIFICATION_HOW.heading} blocks={TARIFICATION_HOW.blocks} color="golden" />
          <FAQSection eyebrow="Questions fréquentes" heading="Cliquez sur une question pour afficher la réponse" items={TARIFICATION_FAQ} />
        </div>
      </div>

      <CTASection {...TARIFICATION_CTA} />

      {/* Homepage Pricing section, relocated here per the Homepage/Tarification
          restructure — appended below the existing Tarification content, unchanged. */}
      <Pricing />

      <Footer />
    </motion.main>
  )
}
