import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import AProposHero from '@/components/atoopv/AProposHero'
import AProposSections, { buildChapters } from '@/components/atoopv/AProposSections'
import { AProposNavSticky, AProposNavMobile } from '@/components/atoopv/AProposNav'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import { useSitePage } from '@/cms/useSitePage'

/**
 * Ported ATOOPV À propos page — content extracted verbatim in French from
 * content/about/a-propos.md (https://atoopv.com/a-propos/). Single
 * self-contained page (the source has no sibling pages), built entirely
 * from existing components: no new component was needed here.
 */
// The existing footer string is "04 12 10 06 06 · contact@atoopv.com · ALC
// SAS — SIREN 833 781 248" — split apart here only so the email segment can
// become a real <Link> to the existing /contact route instead of
// plain text (CTASection's `footer` prop already just renders whatever it's
// given, string or node, so no change to that shared component is needed).
// Built in this .jsx page rather than the .js constants file since JSX
// isn't set up to compile there.
function CtaFooterWithContactLink({ footer }) {
  const parts = footer.split(' · ')
  // The admin can reword this line; only the exact "phone · email · company" shape gets the email link.
  if (parts.length !== 3) return footer
  const [phone, email, company] = parts
  return (
    <>
      {phone} ·{' '}
      <Link to="/contact" className="link-underline text-ink/70 hover:text-ink">
        {email}
      </Link>{' '}
      · {company}
    </>
  )
}

export default function APropos() {
  // Hardcoded content is the default; whatever the admin published (Content → Menus → Site pages) is merged over it.
  const { hero, mission, values, approach, founder, sirus, cta } = useSitePage('a-propos')
  usePageMeta({ title: stripEmphasis(hero.title), description: hero.lead })

  const chapters = buildChapters({ mission, values, approach, founder, sirus })

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

      {/* One shared grid for the hero AND all five story sections, with the
          "Sur cette page" rail as its second column — that's what lets the
          rail stay sticky across the whole story instead of only the hero. */}
      <section className="relative pt-36 pb-16 sm:pt-40 sm:pb-20 lg:pt-44">
        <div className="shell">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_16rem] lg:gap-14 xl:grid-cols-[1fr_18rem]">
            <div>
              <AProposHero {...hero} />

              <div className="mt-8">
                <AProposNavMobile chapters={chapters} />
              </div>

              <div className="mt-16 sm:mt-20">
                <AProposSections mission={mission} values={values} approach={approach} founder={founder} sirus={sirus} />
              </div>
            </div>

            <AProposNavSticky chapters={chapters} />
          </div>
        </div>
      </section>

      {/* Untouched per the brief: same component, same props, same content —
          only the footer's plain-text email becomes a real link. */}
      <CTASection {...cta} footer={<CtaFooterWithContactLink footer={cta.footer} />} />
      <AtoopvFooter />
    </motion.main>
  )
}
