import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import DiagnosticQuiz from '@/components/atoopv/DiagnosticQuiz'
import RichTextSection from '@/components/services/RichTextSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { AUTODIAGNOSTIC_HERO, AUTODIAGNOSTIC_INTRO, AUTODIAGNOSTIC_WHY, AUTODIAGNOSTIC_QUIZ, AUTODIAGNOSTIC_CTA } from '@/constants/autodiagnosticHome'

/**
 * Ported ATOOPV Autodiagnostic page — content extracted verbatim in French
 * from content/autodiagnostic/autodiagnostic.md (https://atoopv.com/autodiagnostic/).
 * The interactive 10-question quiz is DiagnosticQuiz, built specifically
 * for this page since nothing existing covers a scored multi-step flow;
 * everything else reuses AtoopvHero/RichTextSection/CTASection unmodified.
 */
export default function Autodiagnostic() {
  usePageMeta({ title: AUTODIAGNOSTIC_HERO.title, description: AUTODIAGNOSTIC_HERO.lead })

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

      <AtoopvHero badge={AUTODIAGNOSTIC_HERO.badge} title={AUTODIAGNOSTIC_HERO.title} lead={AUTODIAGNOSTIC_HERO.lead} />

      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-14">
          <RichTextSection eyebrow={AUTODIAGNOSTIC_INTRO.eyebrow} heading={AUTODIAGNOSTIC_INTRO.heading} blocks={AUTODIAGNOSTIC_INTRO.blocks} color="royal" />
          <RichTextSection eyebrow={AUTODIAGNOSTIC_WHY.eyebrow} heading={AUTODIAGNOSTIC_WHY.heading} blocks={AUTODIAGNOSTIC_WHY.blocks} color="royal" />
        </div>
      </div>

      <div className="shell pb-14 sm:pb-16">
        <div className="mx-auto max-w-2xl">
          <DiagnosticQuiz {...AUTODIAGNOSTIC_QUIZ} color="royal" />
        </div>
      </div>

      <CTASection {...AUTODIAGNOSTIC_CTA} />
      <Footer />
    </motion.main>
  )
}
