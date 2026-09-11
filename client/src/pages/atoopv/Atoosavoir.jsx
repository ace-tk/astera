import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoosavoirHero from '@/components/atoopv/AtoosavoirHero'
import AtoosavoirConstat from '@/components/atoopv/AtoosavoirConstat'
import AtoosavoirExamples from '@/components/atoopv/AtoosavoirExamples'
import AtoosavoirProcessSteps from '@/components/atoopv/AtoosavoirProcessSteps'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import ChipCloud from '@/components/atoopv/ChipCloud'
import FicheCard from '@/components/atoopv/FicheCard'
import RichTextSection from '@/components/services/RichTextSection'
import PricingTiers from '@/components/services/PricingTiers'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import {
  ATOOSAVOIR_HERO,
  ATOOSAVOIR_TRUST_BADGES,
  ATOOSAVOIR_CONSTAT,
  ATOOSAVOIR_EXAMPLES,
  ATOOSAVOIR_WHAT_IS,
  ATOOSAVOIR_QUESTIONS,
  ATOOSAVOIR_STEPS,
  ATOOSAVOIR_FICHE_INTRO,
  ATOOSAVOIR_FICHE_STATS,
  ATOOSAVOIR_FICHE_TEASER,
  ATOOSAVOIR_COMPARISON,
  ATOOSAVOIR_PRICING,
  ATOOSAVOIR_ANALYSIS,
  ATOOSAVOIR_FAQ,
  ATOOSAVOIR_BROCHURE,
  ATOOSAVOIR_CTA,
  ATOOSAVOIR_CONTACT,
  ATOOSAVOIR_LEGAL,
} from '@/constants/atoosavoirHome'

/**
 * Ported ATOOPV atoosavoir page — content extracted verbatim in French from
 * content/atoosavoir/atoosavoir.md (https://atoopv.com/atoosavoir/). Built
 * from the existing service-page component library plus two small new
 * reusable components: FicheCard (the section's labeled Q&A "what a fiche
 * looks like" card, also reused on the /exemple sub-page) and PricingTiers
 * (fixed segment-priced cards, distinct from the existing slider-based
 * PricingCalculator).
 */
export default function Atoosavoir() {
  usePageMeta({ title: stripEmphasis(ATOOSAVOIR_HERO.title), description: ATOOSAVOIR_HERO.lead })

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

      <AtoosavoirHero {...ATOOSAVOIR_HERO} trustBadges={ATOOSAVOIR_TRUST_BADGES} />

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <EditorialGridBackground className="-z-10" />
        <div className="shell">
          <AtoosavoirConstat {...ATOOSAVOIR_CONSTAT} />
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <EditorialGridBackground className="-z-10" />
        <div className="shell">
          <AtoosavoirExamples {...ATOOSAVOIR_EXAMPLES} />
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <RichTextSection {...ATOOSAVOIR_WHAT_IS} color="royal" />
          </div>
          <div className="mt-10">
            <ChipCloud heading={ATOOSAVOIR_QUESTIONS.heading} items={ATOOSAVOIR_QUESTIONS.items} />
          </div>
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <AtoosavoirProcessSteps eyebrow={ATOOSAVOIR_STEPS.eyebrow} heading={ATOOSAVOIR_STEPS.heading} items={ATOOSAVOIR_STEPS.blocks[0].items} />
        </div>
      </section>

      <section id="fiche" className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <RichTextSection {...ATOOSAVOIR_FICHE_INTRO} color="royal" />
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                {ATOOSAVOIR_FICHE_STATS.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-semibold tracking-tight">{s.value}</div>
                    <p className="text-xs text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <FicheCard
                {...ATOOSAVOIR_FICHE_TEASER}
                color="royal"
                footer={
                  <Button as={Link} to="/atoopv/atoosavoir/exemple" variant="soft" size="sm">
                    Voir un exemple complet
                  </Button>
                }
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <RichTextSection {...ATOOSAVOIR_COMPARISON} color="royal" />
          </div>
        </div>
      </section>

      <section id="tarifs" className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <PricingTiers {...ATOOSAVOIR_PRICING} color="royal" />
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <RichTextSection {...ATOOSAVOIR_ANALYSIS} color="royal" />
          </div>
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <FAQSection eyebrow="Questions fréquentes" heading="FAQ" items={ATOOSAVOIR_FAQ} />
          </div>
        </div>
      </section>

      <section className="relative pb-10 sm:pb-12">
        <div className="shell">
          <Reveal className="mx-auto max-w-3xl rounded-3xl border border-ink/8 bg-card p-6 text-center shadow-soft transition-shadow duration-300 hover:shadow-lift sm:p-8">
            <p className="font-display text-base font-medium tracking-tight">{ATOOSAVOIR_BROCHURE.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{ATOOSAVOIR_BROCHURE.text}</p>
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow={ATOOSAVOIR_CTA.eyebrow}
        heading={ATOOSAVOIR_CTA.heading}
        body={ATOOSAVOIR_CTA.body}
        primaryCta={ATOOSAVOIR_CTA.primaryCta}
        secondaryCta={ATOOSAVOIR_CTA.secondaryCta}
        footer={
          <>
            <a href={ATOOSAVOIR_CONTACT.phoneHref} className="link-underline">
              {ATOOSAVOIR_CONTACT.phone}
            </a>{' '}
            ·{' '}
            <a href={ATOOSAVOIR_CONTACT.emailHref} className="link-underline">
              {ATOOSAVOIR_CONTACT.email}
            </a>
            <br />
            <span className="mt-3 block text-[0.7rem] leading-relaxed">
              {ATOOSAVOIR_LEGAL}{' '}
              <Link to="/atoopv/atoosavoir/cgv" className="link-underline">
                Conditions générales de vente
              </Link>
            </span>
          </>
        }
      />

      <Footer />
    </motion.main>
  )
}
