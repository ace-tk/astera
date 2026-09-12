import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import ResourceLibrary from '@/components/design-test/experiments/ResourceLibrary'
import { usePageMeta } from '@/hooks/usePageMeta'
import '@/styles/design-test.css'

/**
 * ATOOPV Shop (/atoopv/boutique) — previously the "Compliance Books" shelf/
 * detail/reader flow (BookCover/BookReader + COMPLIANCE_BOOKS), now the
 * /design-test lab's Experiment 13 (ResourceLibrary) transplanted onto this
 * production route in its place, unmodified. `design-test.css` is scoped
 * under a `.design-test` root class, so that wrapper is kept here too —
 * without it, ResourceLibrary's `dt-no-scrollbar` rule wouldn't apply and
 * its horizontal book scroller would show a visible scrollbar it doesn't in
 * the lab.
 */
export default function Boutique() {
  usePageMeta({
    title: 'Boutique | ATOOPV',
    description: 'Des guides pratiques pour comprendre, agir et maîtriser les enjeux du CSE.',
  })

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="relative min-h-screen bg-paper">
      <AmbientBackground />
      <Navbar />

      <div className="design-test pt-24 sm:pt-28">
        <ResourceLibrary />
      </div>

      <Footer />
    </motion.main>
  )
}
