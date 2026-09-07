import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import Testimonials from '@/components/landing/sections/Testimonials'
import AtoopvHomeHero from '@/components/atoopv/AtoopvHomeHero'
import AtoopvTicker from '@/components/atoopv/AtoopvTicker'
import ProcessRecomposed from '@/components/atoopv/ProcessRecomposed'
import OrchestratedIntelligence from '@/components/atoopv/OrchestratedIntelligence'
import VideoSection from '@/components/atoopv/VideoSection'
import ArticleGrid from '@/components/atoopv/ArticleGrid'
import ChipCloud from '@/components/atoopv/ChipCloud'
import StatsSection from '@/components/services/StatsSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import RichTextSection from '@/components/services/RichTextSection'
import CTASection from '@/components/services/CTASection'
import Reveal from '@/components/ui/Reveal'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis, renderEmphasis } from '@/utils/richText'
import { ACCUEIL, ATOOPV_STATS } from '@/constants/atoopvHome'

/**
 * Ported ATOOPV Accueil (home) page — content extracted verbatim in French
 * from content/home/accueil.md (https://atoopv.com/). Built entirely from
 * the app's existing service-page component library (ServiceHero's sibling
 * AtoopvHero, StatsSection, FeatureGrid, RichTextSection, CTASection,
 * Testimonials) plus a handful of new reusable components — VideoSection,
 * ArticleGrid, ChipCloud — meant to carry the rest of the ported ATOOPV site
 * (Services, Ressources, Simulateur, À propos, Autodiagnostic, Atoosavoir,
 * Contact) in later phases.
 */
export default function Accueil() {
  const { hero, statsCaption, expertise, process, video, veille, devis, garanties, sectors, testimonials, cta, resources } = ACCUEIL

  usePageMeta({ title: stripEmphasis(hero.title), description: hero.lead })

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

      <AtoopvHomeHero hero={hero} />
      <AtoopvTicker />

      <div id="stats">
        <StatsSection stats={ATOOPV_STATS} />
      </div>
      <div className="shell">
        <Reveal className="mt-6 text-center text-sm leading-relaxed text-muted">
          <p>{renderEmphasis(statsCaption)}</p>
        </Reveal>
      </div>

      <section id="expertise" className="relative py-14 sm:py-16">
        <div className="shell">
          <FeatureGrid eyebrow={expertise.eyebrow} heading={expertise.heading} lead={expertise.lead} items={expertise.items} color="sky" columns={3} />
        </div>
      </section>

      {/* New editorial sections — placeholder content pending final copy
          (see constants/atoopvHome.js: HOMEPAGE_PROCESS / HOMEPAGE_ORCHESTRATED).
          Placed between the existing "expertise" intro and the existing
          "process" RichTextSection below, which is intentionally left
          untouched — consolidating the two process sections is a content
          decision for later, not made here. */}
      <ProcessRecomposed />
      <OrchestratedIntelligence />

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <RichTextSection
            eyebrow={process.eyebrow}
            heading={process.heading}
            lead={process.lead}
            color="sky"
            blocks={[{ type: 'steps', items: process.steps }]}
          />
        </div>
      </section>

      <VideoSection {...video} />

      <section id="veille" className="relative py-14 sm:py-16">
        <div className="shell">
          <ArticleGrid {...veille} color="sky" columns={3} />
        </div>
      </section>

      <CTASection eyebrow={devis.eyebrow} heading={devis.heading} body={devis.body} primaryCta={devis.primaryCta} />

      <section id="garanties" className="relative py-14 sm:py-16">
        <div className="shell">
          <FeatureGrid eyebrow={garanties.eyebrow} heading={garanties.heading} items={garanties.items} color="sky" columns={3} />
        </div>
      </section>

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <ChipCloud eyebrow={sectors.eyebrow} heading={sectors.heading} items={sectors.items} />
        </div>
      </section>

      <Testimonials eyebrow={testimonials.eyebrow} heading={testimonials.heading} items={testimonials.items} />

      <CTASection
        eyebrow={cta.eyebrow}
        heading={cta.heading}
        body={cta.body}
        primaryCta={cta.primaryCta}
        secondaryCta={cta.secondaryCta}
        footer={cta.legal}
      />

      <section className="relative py-14 sm:py-16">
        <div className="shell">
          <ArticleGrid eyebrow={resources.eyebrow} heading={resources.heading} lead={resources.lead} items={resources.items} color="golden" columns={2} />
        </div>
      </section>

      <Footer />
    </motion.main>
  )
}
