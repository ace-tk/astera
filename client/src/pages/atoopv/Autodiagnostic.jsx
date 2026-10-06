import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import DiagnosticQuiz from '@/components/atoopv/DiagnosticQuiz'
import RichTextSection from '@/components/services/RichTextSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useSitePage } from '@/cms/useSitePage'

/**
 * Ported ATOOPV Autodiagnostic page — content extracted verbatim in French
 * from content/autodiagnostic/autodiagnostic.md (https://atoopv.com/autodiagnostic/).
 * The interactive 10-question quiz is DiagnosticQuiz, built specifically
 * for this page since nothing existing covers a scored multi-step flow;
 * everything else reuses AtoopvHero/RichTextSection/CTASection unmodified.
 */
export default function Autodiagnostic() {
  // Hardcoded content is the default; whatever the admin published (Content → Menus → Site pages) is merged over it.
  // Quiz scoring (scores, result thresholds) is part of the design and is never taken from the CMS.
  const c = useSitePage('autodiagnostic')
  usePageMeta({ title: c.hero.title, description: c.hero.lead })

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

      <AtoopvHero badge={c.hero.badge} title={c.hero.title} lead={c.hero.lead} />

      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-14">
          <RichTextSection eyebrow={c.intro.eyebrow} heading={c.intro.heading} blocks={c.intro.blocks} color="royal" />
          <RichTextSection eyebrow={c.why.eyebrow} heading={c.why.heading} blocks={c.why.blocks} color="royal" />
        </div>
      </div>

      <div className="shell pb-14 sm:pb-16">
        <div className="mx-auto max-w-2xl">
          <DiagnosticQuiz {...c.quiz} color="royal" />
        </div>
      </div>

      <CTASection {...c.cta} />
      <AtoopvFooter />
    </motion.main>
  )
}
