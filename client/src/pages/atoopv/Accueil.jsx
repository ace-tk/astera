import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvAnnouncementBar from '@/components/atoopv/AtoopvAnnouncementBar'
import AtoopvScrollControl from '@/components/atoopv/AtoopvScrollControl'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import AtoopvFinalCta from '@/components/atoopv/AtoopvFinalCta'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import Testimonials from '@/components/landing/sections/Testimonials'
import AtoopvHomeHero from '@/components/atoopv/AtoopvHomeHero'
import AtoopvTicker from '@/components/atoopv/AtoopvTicker'
import ProcessRecomposed from '@/components/atoopv/ProcessRecomposed'
import OrchestratedIntelligence from '@/components/atoopv/OrchestratedIntelligence'
import ComplianceBooksTeaser from '@/components/atoopv/ComplianceBooksTeaser'
import VideoSection from '@/components/atoopv/VideoSection'
import ArticleGrid from '@/components/atoopv/ArticleGrid'
import BlogArticlesGrid from '@/components/atoopv/BlogArticlesGrid'
import ChipCloud from '@/components/atoopv/ChipCloud'
import InfoCardSection from '@/components/atoopv/InfoCardSection'
import NotreConviction from '@/components/atoopv/NotreConviction'
import CommentCaMarche from '@/components/atoopv/CommentCaMarche'
import AtoopvOffersTimeline from '@/components/atoopv/AtoopvOffersTimeline'
import PVSimulator from '@/components/atoopv/PVSimulator'
import PVPreviewDocument from '@/components/atoopv/PVPreviewDocument'
import AtoopvFaqSection from '@/components/atoopv/AtoopvFaqSection'
import StatsSection from '@/components/services/StatsSection'
import FeatureGrid from '@/components/services/FeatureGrid'
import RichTextSection from '@/components/services/RichTextSection'
import CTASection from '@/components/services/CTASection'
import Reveal from '@/components/ui/Reveal'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis, renderEmphasis } from '@/utils/richText'
import { ACCUEIL, ATOOPV_STATS, NOS_INSTANCES, HOMEPAGE_GUARANTEES } from '@/constants/atoopvHome'
import { TARIFICATION_HERO, TARIFICATION_INTRO, TARIFICATION_TIERS, TARIFICATION_CALCULATOR } from '@/constants/tarificationHome'

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
      <AtoopvAnnouncementBar />
      <AmbientBackground />
      <Navbar />

      {/* The theme toggle used to live inside the shared Navbar (every
          page); it's since been scoped to just this page, so it's rendered
          here instead — a small fixed pill tucked under the nav so it never
          competes with the nav's own controls at any viewport width. Offset
          bumped +2rem (top-28/32) to clear the announcement bar above the
          now-lower navbar. */}
      <div className="fixed right-4 top-28 z-40 hidden sm:block sm:right-6 sm:top-32">
        <ThemeSwitcher />
      </div>

      {/* Replaces the old bottom "SCROLL DOWN / 01·06" hero strip — a
          persistent, page-level floating corner control rather than
          hero-internal chrome, so it can't affect hero height or the
          slide carousel. */}
      <AtoopvScrollControl />

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

      <section id="expertise" className="relative py-10 sm:py-12">
        <div className="shell">
          <FeatureGrid eyebrow={expertise.eyebrow} heading={expertise.heading} lead={expertise.lead} items={expertise.items} color="sky" columns={3} />
        </div>
      </section>

      <InfoCardSection eyebrow={NOS_INSTANCES.eyebrow} heading={NOS_INSTANCES.heading} lead={NOS_INSTANCES.lead} items={NOS_INSTANCES.items} columns={4} />

      {/* "Nos formats" (offers + the merged Design-Test-style timeline)
          moved here per request — between "Nos instances" and "Portail
          SIRUS" (OrchestratedIntelligence) rather than its previous spot
          near the bottom of the page. Component/content unchanged, only
          its position in this file moved. */}
      <AtoopvOffersTimeline />

      {/* Same interactive price simulator as the Tarification page (PVSimulator),
          reused here unmodified — just added to the homepage below the offers
          timeline, without removing it from Tarification. */}
      <div className="shell pt-2 pb-14 sm:pt-4 sm:pb-16">
        <PVSimulator
          title={TARIFICATION_HERO.title}
          tiers={TARIFICATION_TIERS}
          badge={TARIFICATION_HERO.badge}
          intro={TARIFICATION_INTRO.blocks[0]?.text}
          {...TARIFICATION_CALCULATOR}
          color="royal"
        />
      </div>

      {/* New editorial sections — placeholder content pending final copy
          (see constants/atoopvHome.js: HOMEPAGE_PROCESS / HOMEPAGE_ORCHESTRATED).
          Placed between the existing "expertise" intro and the existing
          "process" RichTextSection below, which is intentionally left
          untouched — consolidating the two process sections is a content
          decision for later, not made here. Orchestrated Intelligence
          renders first, Process second (reversed from original order). */}
      <OrchestratedIntelligence />
      <NotreConviction />
      <CommentCaMarche />
      {/* Same ProcessRecomposed component/animation, new data — "Ce que
          nous garantissons, sur les deux offres." replaces the original
          "Capturer la réunion → Livrer le PV" content at this position. */}
      <ProcessRecomposed data={HOMEPAGE_GUARANTEES} />

      <section className="relative py-10 sm:py-12">
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

      <section id="veille" className="relative py-10 sm:py-12">
        <div className="shell">
          <BlogArticlesGrid data={veille} />
        </div>
      </section>

      <CTASection
        eyebrow={devis.eyebrow}
        heading={devis.heading}
        body={devis.body}
        primaryCta={devis.primaryCta}
        visual={<PVPreviewDocument tier={TARIFICATION_TIERS[0]} instance="CSE" style="indirect" duration={2} color="royal" />}
      />

      <section id="garanties" className="relative py-10 sm:py-12">
        <div className="shell">
          <FeatureGrid eyebrow={garanties.eyebrow} heading={garanties.heading} items={garanties.items} color="sky" columns={3} />
        </div>
      </section>

      <section className="relative py-10 sm:py-12">
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

      <section className="relative py-10 sm:py-12">
        <div className="shell">
          <ArticleGrid eyebrow={resources.eyebrow} heading={resources.heading} lead={resources.lead} items={resources.items} color="golden" columns={2} />
        </div>
      </section>

      {/* Small teaser into the planned Compliance Books shop — placed next
          to the existing "ressources gratuites" block since both are about
          guides/knowledge for CSE elus. See constants/atoopvHome.js:
          COMPLIANCE_BOOKS_TEASER (shopHref is an interim target — no
          dedicated Shop route exists in production yet). */}
      <ComplianceBooksTeaser />

      <AtoopvFinalCta />
      <AtoopvFaqSection />
      <AtoopvFooter />
    </motion.main>
  )
}
