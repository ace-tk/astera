import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import ResourceLibrary from '@/components/atoopv/boutique/ResourceLibrary'
import ReportPageFlip from '@/components/atoopv/boutique/ReportPageFlip'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useSitePage } from '@/cms/useSitePage'
import '@/styles/boutique.css'

/**
 * ATOOPV Shop (/boutique) — previously the "Compliance Books" shelf/
 * detail/reader flow (BookCover/BookReader + COMPLIANCE_BOOKS), now the
 * resource library shell (ResourceLibrary) followed by the procès-verbal
 * report preview (ReportPageFlip). `boutique.css` is scoped under a
 * `.boutique-shop` root class, so that wrapper is kept here too — without
 * it, ResourceLibrary's `dt-no-scrollbar` rule wouldn't apply and its
 * horizontal book scroller would show a visible scrollbar.
 *
 * `hideEyebrow` on both: this is a live shop page, so their internal
 * "EXPERIMENT / ..." labels are dropped here via an opt-in prop.
 */
export default function Boutique() {
  // usePageMeta already appends " — ATOOPV" to every title — passing it here too produced
  // a duplicated "Boutique | ATOOPV — ATOOPV" tab title.
  const c = useSitePage('boutique')
  usePageMeta({ title: c.meta.title, description: c.meta.description })

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="relative min-h-screen bg-paper">
      <AmbientBackground />
      <Navbar />

      <div className="boutique-shop pt-24 sm:pt-28">
        <ResourceLibrary hideEyebrow categories={c.categoryTabs} books={c.books} featured={c.featured} recommendations={c.recommendations} />
        <ReportPageFlip hideEyebrow meta={c.reportMeta} pages={c.reportPages} />
      </div>

      <AtoopvFooter />
    </motion.main>
  )
}
