import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import FicheCard from '@/components/atoopv/FicheCard'
import RichTextSection from '@/components/services/RichTextSection'
import CTASection from '@/components/services/CTASection'
import Button from '@/components/ui/Button'
import { usePageMeta } from '@/hooks/usePageMeta'
import {
  ATOOSAVOIR_EXEMPLE_HERO,
  ATOOSAVOIR_EXEMPLE_INTRO,
  ATOOSAVOIR_EXEMPLE_CARD,
  ATOOSAVOIR_EXEMPLE_CTA,
  ATOOSAVOIR_CONTACT,
} from '@/constants/atoosavoirHome'

/**
 * Ported ATOOPV atoosavoir/exemple page — content extracted verbatim in
 * French from content/atoosavoir/atoosavoir-exemple.md
 * (https://atoopv.com/atoosavoir/exemple/). Reuses FicheCard (the same
 * labeled Q&A card as the teaser on the atoosavoir landing page) for the
 * full fictional example fiche, with a link out to the real PDF sample.
 */
export default function AtoosavoirExemple() {
  usePageMeta({ title: ATOOSAVOIR_EXEMPLE_HERO.title, description: ATOOSAVOIR_EXEMPLE_HERO.lead })

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

      <AtoopvHero {...ATOOSAVOIR_EXEMPLE_HERO} />

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <RichTextSection {...ATOOSAVOIR_EXEMPLE_INTRO} color="royal" />
          </div>
        </div>
      </section>

      <section className="relative pb-14 sm:pb-16">
        <div className="shell">
          <div className="mx-auto max-w-2xl">
            <FicheCard
              {...ATOOSAVOIR_EXEMPLE_CARD}
              color="royal"
              footer={
                <div className="flex flex-col gap-3">
                  <Button
                    as="a"
                    href={ATOOSAVOIR_EXEMPLE_CARD.downloadHref}
                    target="_blank"
                    rel="noreferrer"
                    variant="soft"
                    size="sm"
                    className="w-fit"
                  >
                    <Download className="h-4 w-4" /> {ATOOSAVOIR_EXEMPLE_CARD.downloadLabel}
                  </Button>
                  <p className="text-xs text-muted">
                    Une question à traiter ?{' '}
                    <a href={ATOOSAVOIR_CONTACT.emailHref} className="link-underline">
                      {ATOOSAVOIR_CONTACT.email}
                    </a>{' '}
                    ·{' '}
                    <a href={ATOOSAVOIR_CONTACT.phoneHref} className="link-underline">
                      {ATOOSAVOIR_CONTACT.phone}
                    </a>
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <CTASection {...ATOOSAVOIR_EXEMPLE_CTA} />
      <Footer />
    </motion.main>
  )
}
