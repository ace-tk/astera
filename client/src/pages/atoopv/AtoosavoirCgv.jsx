import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getAtoosavoirPage } from '@/services/atoosavoirContent'
import { ATOOSAVOIR_CGV_HERO } from '@/constants/atoosavoirHome'

/**
 * Ported ATOOPV atoosavoir/cgv page — the section's terms of sale, rendered
 * straight from content/atoosavoir/atoosavoir-cgv.md
 * (https://atoopv.com/atoosavoir/cgv/) via MarkdownArticle rather than
 * hand-transcribed blocks: it's a long, numbered legal document whose
 * structure is exactly what MarkdownArticle already exists to typeset
 * (headings, articles, links) without re-authoring the whole text.
 */
export default function AtoosavoirCgv() {
  const page = getAtoosavoirPage('atoosavoir-cgv')

  usePageMeta({ title: ATOOSAVOIR_CGV_HERO.title, description: ATOOSAVOIR_CGV_HERO.lead })

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

      <AtoopvHero title={ATOOSAVOIR_CGV_HERO.title} lead={ATOOSAVOIR_CGV_HERO.lead} />

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <Link to="/atoopv/atoosavoir" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted link-underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Retour à atoosavoir
            </Link>
            <div className="mt-8">{page && <MarkdownArticle body={page.body} color="sky" />}</div>
          </div>
        </div>
      </section>

      <Footer />
    </motion.main>
  )
}
