import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import AtoopvHero from '@/components/atoopv/AtoopvHero'
import AProposStory from '@/components/atoopv/AProposStory'
import CTASection from '@/components/services/CTASection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { stripEmphasis } from '@/utils/richText'
import {
  A_PROPOS_HERO,
  A_PROPOS_MISSION,
  A_PROPOS_VALUES,
  A_PROPOS_APPROACH,
  A_PROPOS_FOUNDER,
  A_PROPOS_SIRUS,
  A_PROPOS_CTA,
} from '@/constants/aProposHome'

/**
 * Ported ATOOPV À propos page — content extracted verbatim in French from
 * content/about/a-propos.md (https://atoopv.com/a-propos/). Single
 * self-contained page (the source has no sibling pages), built entirely
 * from existing components: no new component was needed here.
 */
// The existing footer string is "04 12 10 06 06 · contact@atoopv.com · ALC
// SAS — SIREN 833 781 248" — split apart here only so the email segment can
// become a real <Link> to the existing /atoopv/contact route instead of
// plain text (CTASection's `footer` prop already just renders whatever it's
// given, string or node, so no change to that shared component is needed).
// Built in this .jsx page rather than the .js constants file since JSX
// isn't set up to compile there.
function CtaFooterWithContactLink({ footer }) {
  const [phone, email, company] = footer.split(' · ')
  return (
    <>
      {phone} ·{' '}
      <Link to="/atoopv/contact" className="link-underline text-ink/70 hover:text-ink">
        {email}
      </Link>{' '}
      · {company}
    </>
  )
}

export default function APropos() {
  usePageMeta({ title: stripEmphasis(A_PROPOS_HERO.title), description: A_PROPOS_HERO.lead })

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

      <AtoopvHero {...A_PROPOS_HERO} />

      <AProposStory mission={A_PROPOS_MISSION} values={A_PROPOS_VALUES} approach={A_PROPOS_APPROACH} founder={A_PROPOS_FOUNDER} sirus={A_PROPOS_SIRUS} />

      {/* Untouched per the brief: same component, same props, same content —
          only the footer's plain-text email becomes a real link. */}
      <CTASection {...A_PROPOS_CTA} footer={<CtaFooterWithContactLink footer={A_PROPOS_CTA.footer} />} />
      <Footer />
    </motion.main>
  )
}
