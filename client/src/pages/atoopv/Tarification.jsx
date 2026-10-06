import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import RichTextSection from '@/components/services/RichTextSection'
import PVSimulator from '@/components/atoopv/PVSimulator'
import FAQSection from '@/components/services/FAQSection'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useSitePage } from '@/cms/useSitePage'
import { resolveMediaUrl } from '@/cms/media'

/**
 * Ported ATOOPV Tarification page — content extracted verbatim in French
 * from content/pricing/tarification.md (https://atoopv.com/tarification/).
 * Same composition as the English PricingPage (a single, self-contained
 * page — the source has no sidebar of sibling pages), swapping ServiceHero
 * for AtoopvHero to match the rest of the ported ATOOPV site.
 */
export default function Tarification() {
  // Hardcoded content is the default; whatever the admin published (Content → Menus → Site pages) is merged over it.
  const c = useSitePage('tarification')
  usePageMeta({ title: c.hero.title, description: c.intro.text })

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

      {/* Only the badge chip renders here — the lead paragraph and CTA
          button that used to sit below it were removed so the card starts
          higher on the page, and the page heading now lives inside the
          card itself (see PVSimulator's own `title`) instead of floating
          above it. */}
      <AtoopvHero badge={c.hero.badge} hideTitle />

      {/* The interactive simulator needs the full shell width for its
          three-column console + live preview, so it sits outside the
          narrower max-w-3xl column the rest of this page's prose uses. */}
      <div className="shell pt-2 pb-14 sm:pt-4 sm:pb-16">
        <PVSimulator
          title={c.hero.title}
          tiers={c.tiers}
          badge={c.hero.badge}
          intro={c.intro.text}
          {...c.calculator}
          color="royal"
        />
      </div>

      <div className="shell pb-14 sm:pb-16">
        <div className="mx-auto max-w-3xl space-y-14">
          <RichTextSection eyebrow={c.options.eyebrow} heading={c.options.heading} blocks={c.options.blocks} color="golden" />
          <RichTextSection eyebrow={c.why.eyebrow} heading={c.why.heading} blocks={c.why.blocks} color="golden" />
          <RichTextSection eyebrow={c.how.eyebrow} heading={c.how.heading} blocks={c.how.blocks} color="golden" />
          <FAQSection eyebrow={c.faqSection.eyebrow} heading={c.faqSection.heading} items={c.faq} />
        </div>
      </div>

      <CTASection
        {...c.cta}
        visual={
          <div className="aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-ink/8 sm:h-full sm:aspect-auto">
            <img
              src={resolveMediaUrl(c.ctaImage.src)}
              alt={c.ctaImage.alt}
              className="h-full w-full object-cover"
            />
          </div>
        }
      />

      {/* SEO audit: the English/SaaS-style "Pricing" section (Solo/Studio/Scale,
          $/seat/mo) previously relocated here from the homepage was removed —
          unrelated to ATOOPV's French CSE PV pricing, which is already covered
          above by PVSimulator/TARIFICATION_TIERS. The `Pricing` component
          itself is untouched (it's a shared component); only this page's use
          of it was removed. */}

      <AtoopvFooter />
    </motion.main>
  )
}
