import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import FicheCard from '@/components/atoopv/FicheCard'
import RichTextSection from '@/components/services/RichTextSection'
import CTASection from '@/components/services/CTASection'
import Button from '@/components/ui/Button'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useSitePage } from '@/cms/useSitePage'

/**
 * Ported ATOOPV atoosavoir/exemple page — content extracted verbatim in
 * French from content/atoosavoir/atoosavoir-exemple.md
 * (https://atoopv.com/atoosavoir/exemple/). Reuses FicheCard (the same
 * labeled Q&A card as the teaser on the atoosavoir landing page) for the
 * full fictional example fiche, with a link out to the real PDF sample.
 */
export default function AtoosavoirExemple() {
  // Hardcoded content is the default; whatever the admin published (Content → Menus → Site pages) is merged over it.
  const c = useSitePage('atoosavoir-exemple')
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

      <AtoopvHero {...c.hero} />

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <RichTextSection {...c.intro} color="royal" />
          </div>
        </div>
      </section>

      <section className="relative pb-14 sm:pb-16">
        <div className="shell">
          <div className="mx-auto max-w-2xl">
            <FicheCard
              {...c.card}
              color="royal"
              footer={
                <div className="flex flex-col gap-3">
                  <Button
                    as="a"
                    href={c.card.downloadHref}
                    target="_blank"
                    rel="noreferrer"
                    variant="soft"
                    size="sm"
                    className="w-fit"
                  >
                    <Download className="h-4 w-4" /> {c.card.downloadLabel}
                  </Button>
                  <p className="text-xs text-muted">
                    {c.cardFooter.question}{' '}
                    <a href={c.contact.emailHref} className="link-underline">
                      {c.contact.email}
                    </a>{' '}
                    ·{' '}
                    <a href={c.contact.phoneHref} className="link-underline">
                      {c.contact.phone}
                    </a>
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <CTASection {...c.cta} />
      <AtoopvFooter />
    </motion.main>
  )
}
