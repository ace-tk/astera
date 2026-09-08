import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import RichTextSection from '@/components/services/RichTextSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import {
  A_PROPOS_HERO,
  A_PROPOS_MISSION,
  A_PROPOS_VALUES,
  A_PROPOS_APPROACH,
  A_PROPOS_FOUNDER,
  A_PROPOS_SIRUS,
  A_PROPOS_CTA,
} from '@/constants/aProposHome'

/**
 * Ported ATOOPV À propos page — content extracted verbatim in French from
 * content/about/a-propos.md (https://atoopv.com/a-propos/). Single
 * self-contained page (the source has no sibling pages), built entirely
 * from existing components: no new component was needed here.
 */
export default function APropos() {
  usePageMeta({ title: stripEmphasis(A_PROPOS_HERO.title), description: A_PROPOS_HERO.lead })

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

      <AtoopvHero {...A_PROPOS_HERO} />

      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <RichTextSection eyebrow={A_PROPOS_MISSION.eyebrow} heading={A_PROPOS_MISSION.heading} blocks={A_PROPOS_MISSION.blocks} color="royal" />
        </div>

        {/* Freed from the mx-auto max-w-3xl prose column above: that narrow
            reading width (768px) is right for long-form paragraphs, but it's
            what was squeezing this 4-column card grid down to ~170px cards
            with heavily-wrapped text. Accueil's own FeatureGrid usages (see
            pages/atoopv/Accueil.jsx) sit directly in a plain `.shell` with no
            extra max-width — matching that existing, correct precedent here
            instead of inventing a new width value. */}
        <div className="mt-14">
          <FeatureGrid eyebrow={A_PROPOS_VALUES.eyebrow} heading={A_PROPOS_VALUES.heading} items={A_PROPOS_VALUES.items} color="royal" columns={4} />
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-14">
          <RichTextSection eyebrow={A_PROPOS_APPROACH.eyebrow} heading={A_PROPOS_APPROACH.heading} blocks={A_PROPOS_APPROACH.blocks} color="royal" />
          <RichTextSection
            eyebrow={A_PROPOS_FOUNDER.eyebrow}
            heading={A_PROPOS_FOUNDER.heading}
            lead={A_PROPOS_FOUNDER.lead}
            blocks={A_PROPOS_FOUNDER.blocks}
            color="royal"
          />
          <RichTextSection eyebrow={A_PROPOS_SIRUS.eyebrow} heading={A_PROPOS_SIRUS.heading} blocks={A_PROPOS_SIRUS.blocks} color="royal" />
        </div>
      </div>

      <CTASection {...A_PROPOS_CTA} />
      <Footer />
    </motion.main>
  )
}
