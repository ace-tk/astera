import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import ServiceHero from '@/components/services/ServiceHero'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import CTASection from '@/components/services/CTASection'
import ServicesHomeIntro from '@/components/services/ServicesHomeIntro'
import ServicesStatsStrip from '@/components/services/ServicesStatsStrip'
import ServicesGroupSection from '@/components/services/ServicesGroupSection'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getServicePage, excerpt } from '@/services/servicesContent'
import { resolveServiceHref } from '@/constants/servicesLinks'
import { stripEmphasis } from '@/utils/richText'
import { parseServicesHomeBody } from '@/utils/servicesHomeContent'

function closingCta(cta) {
  return cta && { label: cta.label, to: resolveServiceHref(cta.href).href }
}

/**
 * The Services landing page — same source as atoopv.com/services/ (the
 * "Tous nos services" link in the live nav points straight at it). Its
 * markdown body has the same "bare icon/label line, then heading" shape as
 * every other Services page, but this one is dense enough (an intro, four
 * stats, three service groups, a resources list, a closing CTA) that
 * running it wholesale through the generic MarkdownArticle renderer left
 * icons stranded above their headings and stats stacked into one long
 * column — see utils/servicesHomeContent.js for the scoped parser and
 * ServicesHomeIntro/ServicesGroupSection for the layout built from it.
 * MarkdownArticle itself is untouched, and still renders the resources
 * paragraph below plus the full body as a fallback if the source content
 * ever changes shape enough that the parser can't find its markers.
 */
export default function Services() {
  const page = getServicePage('services')
  const parsed = page ? parseServicesHomeBody(page.body) : null

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

      {page &&
        (parsed ? (
          <>
            <ServicesHomeIntro
              badge={page.breadcrumb}
              title={page.title}
              eyebrow={parsed.intro.eyebrow}
              paragraph={parsed.intro.paragraph}
              ctas={parsed.intro.ctas}
              image={{
                src: '/atoopv-media/services-hero.jpg',
                alt: 'Équipe au travail autour de comptes-rendus et de documents de réunion',
              }}
            />

            <ServicesStatsStrip stats={parsed.intro.stats} note={parsed.intro.note} />

            <div className="relative">
              <EditorialGridBackground lines />

              <div id="services" className="shell pb-16 sm:pb-20">
                <div className="mx-auto max-w-5xl space-y-14 sm:space-y-16">
                  {parsed.groups.map((g) => (
                    <ServicesGroupSection key={g.label} {...g} color="royal" />
                  ))}
                </div>
              </div>

              <div className="shell pb-14 sm:pb-16">
                <div className="mx-auto max-w-3xl">
                  <MarkdownArticle body={parsed.resourcesProse} color="royal" resolveHref={resolveServiceHref} />
                </div>
              </div>
            </div>

            <CTASection
              eyebrow={parsed.closing.eyebrow}
              heading={parsed.closing.heading}
              body={parsed.closing.body}
              primaryCta={closingCta(parsed.closing.ctas[0])}
              secondaryCta={closingCta(parsed.closing.ctas[1])}
              footer={parsed.closing.contact}
            />
          </>
        ) : (
          <>
            <ServiceHero badge={page.breadcrumb} title={page.title} />
            <div className="shell py-14 sm:py-16">
              <div className="mx-auto max-w-3xl">
                <MarkdownArticle body={page.body} color="royal" resolveHref={resolveServiceHref} />
              </div>
            </div>
          </>
        ))}

      <Footer />
    </motion.main>
  )
}
