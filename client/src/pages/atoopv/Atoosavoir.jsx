import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
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
import { useSitePage } from '@/cms/useSitePage'
import { resolveMediaUrl } from '@/cms/media'

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
  // Hardcoded content is the default; whatever the admin published (Content → Menus → Site pages) is merged over it.
  const c = useSitePage('atoosavoir')
  usePageMeta({ title: stripEmphasis(c.hero.title), description: c.hero.lead })

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

      <AtoosavoirHero {...c.hero} image={{ ...c.hero.image, src: resolveMediaUrl(c.hero.image.src) }} trustBadges={c.trustBadges} />

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <EditorialGridBackground className="-z-10" />
        <div className="shell">
          <AtoosavoirConstat {...c.constat} />
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <EditorialGridBackground className="-z-10" />
        <div className="shell">
          <AtoosavoirExamples {...c.examples} />
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <RichTextSection {...c.whatIs} color="royal" />
          </div>
          <div className="mt-10">
            <ChipCloud heading={c.questions.heading} items={c.questions.items} />
          </div>
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <AtoosavoirProcessSteps eyebrow={c.steps.eyebrow} heading={c.steps.heading} items={c.steps.blocks[0].items} />
        </div>
      </section>

      <section id="fiche" className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <RichTextSection {...c.ficheIntro} color="royal" />
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                {c.ficheStats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-semibold tracking-tight">{s.value}</div>
                    <p className="text-xs text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <FicheCard
                {...c.ficheTeaser}
                color="royal"
                footer={
                  <Button as={Link} to="/atoosavoir/exemple" variant="soft" size="sm">
                    {c.ficheButton.label}
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
            <RichTextSection {...c.comparison} color="royal" />
          </div>
        </div>
      </section>

      <section id="tarifs" className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <PricingTiers {...c.pricing} color="royal" />
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <RichTextSection {...c.analysis} color="royal" />
          </div>
        </div>
      </section>

      <section className="relative border-t border-ink/8 py-10 sm:py-12">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <FAQSection eyebrow={c.faqSection.eyebrow} heading={c.faqSection.heading} items={c.faq} />
          </div>
        </div>
      </section>

      <section className="relative pb-10 sm:pb-12">
        <div className="shell">
          <Reveal className="mx-auto max-w-3xl rounded-3xl border border-ink/8 bg-card p-6 text-center shadow-soft transition-shadow duration-300 hover:shadow-lift sm:p-8">
            <p className="font-display text-base font-medium tracking-tight">{c.brochure.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.brochure.text}</p>
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow={c.cta.eyebrow}
        heading={c.cta.heading}
        body={c.cta.body}
        primaryCta={c.cta.primaryCta}
        secondaryCta={c.cta.secondaryCta}
        footer={
          <>
            <a href={c.contact.phoneHref} className="link-underline">
              {c.contact.phone}
            </a>{' '}
            ·{' '}
            <a href={c.contact.emailHref} className="link-underline">
              {c.contact.email}
            </a>
            <br />
            <span className="mt-3 block text-[0.7rem] leading-relaxed">
              {c.legal.text}{' '}
              <Link to="/atoosavoir/cgv" className="link-underline">
                {c.legal.cgvLabel}
              </Link>
            </span>
          </>
        }
      />

      <AtoopvFooter />
    </motion.main>
  )
}
