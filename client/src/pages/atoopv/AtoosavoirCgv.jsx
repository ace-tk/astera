import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getAtoosavoirPage } from '@/services/atoosavoirContent'
import { useSitePage } from '@/cms/useSitePage'

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
  // The bundled terms are the default; whatever the admin published (Content → Menus → Site pages) is merged over them.
  const bundled = useMemo(() => (page ? { markdown: page.body } : undefined), [page])
  const c = useSitePage('atoosavoir-cgv', bundled)

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

      <AtoopvHero title={c.hero.title} lead={c.hero.lead} />

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <Link to="/atoosavoir" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted link-underline">
              <ArrowLeft className="h-3.5 w-3.5" /> {c.backLink.label}
            </Link>
            <div className="mt-8">{page && <MarkdownArticle body={c.markdown} color="royal" />}</div>
          </div>
        </div>
      </section>

      <AtoopvFooter />
    </motion.main>
  )
}
