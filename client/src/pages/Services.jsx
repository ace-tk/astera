import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import ServiceHero from '@/components/services/ServiceHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getServicePage, excerpt } from '@/services/servicesContent'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { stripEmphasis } from '@/utils/richText'

/**
 * The Services landing page — same source as atoopv.com/services/ (the
 * "Tous nos services" link in the live nav points straight at it), rendered
 * the same way every other Services page is: real extracted markdown
 * through MarkdownArticle, no hand-typed copy. Browsing into a specific
 * category (Rédaction PV, Par ville, Tarifs & Infos, Guides pratiques,
 * Communication, Formations) happens via the navbar's own "Services"
 * dropdown, which mirrors the live nav's nested flyouts.
 */
export default function Services() {
  const page = getServicePage('services')

  usePageMeta({ title: page ? stripEmphasis(page.title) : 'Services', description: page ? excerpt(page.body, 160) : undefined })

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

      {page && <ServiceHero badge={page.breadcrumb} title={page.title} />}

      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {page && <MarkdownArticle body={page.body} color="royal" resolveHref={resolveServiceHref} />}
        </div>
      </div>

      <Footer />
    </motion.main>
  )
}
