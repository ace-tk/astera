import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useLegalPagesCms } from '@/cms/useLegalPages'

// Route slug ("/mentions-legales") -> CMS content key (legalPagesContentSchema's
// fixed object keys, server/src/cms/schemas.js). Kept as an explicit map rather
// than deriving one from the other so neither naming scheme constrains the other.
const SLUG_TO_KEY = {
  'mentions-legales': 'mentionsLegales',
  cgv: 'cgv',
  'politique-de-confidentialite': 'confidentialite',
  cookies: 'cookies',
}

/**
 * The 4 footer legal pages (Mentions légales, CGV, Politique de
 * confidentialité, Cookies) — one generic page shell, content now CMS-driven
 * (Content → Menus → Legal pages; useLegalPagesCms falls back to the site's
 * real current text if the CMS is unreachable, same rule as the footer/
 * homepage hero). Same composition (Navbar/AtoopvHero/MarkdownArticle/
 * AtoopvFooter) as the existing AtoosavoirCgv page, the established pattern
 * for long-form legal text on this site.
 */
export default function LegalPage({ slug }) {
  const content = useLegalPagesCms()
  const page = content[SLUG_TO_KEY[slug]]

  usePageMeta({ title: page?.title, description: page?.lead })

  if (!page) return null

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

      <AtoopvHero title={page.title} lead={page.lead} />

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted link-underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Retour à l'accueil
            </Link>
            <div className="mt-8">
              <MarkdownArticle body={page.body} color="royal" />
            </div>
          </div>
        </div>
      </section>

      <AtoopvFooter />
    </motion.main>
  )
}
