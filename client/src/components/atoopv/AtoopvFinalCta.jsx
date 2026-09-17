import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { DEVIS_CTA_HREF } from '@/constants/content'

/**
 * Final conversion band immediately above the footer. Same visual tokens
 * as the existing mid-page CTASection (rounded-[2rem] card, border-ink/8,
 * shadow-soft, font-display heading, accent Button, Reveal entrance) so it
 * reads as a native AtoopV section — but built as its own component rather
 * than reusing/editing CTASection, since this brief's order (heading →
 * contact → button) differs from CTASection's own (heading → button →
 * footer line), and CTASection is still used twice elsewhere on this page
 * and must stay untouched.
 *
 * "Demander un devis" reuses the same route every other "Demander un
 * devis"/quote CTA on this page points to (DEVIS_CTA_HREF) rather than a
 * new destination. Heading/button copy is French, matching the reference
 * mockup's own final-CTA text verbatim.
 */
export default function AtoopvFinalCta() {
  return (
    <section className="relative py-14 sm:py-16">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-ink/8 bg-card px-8 py-14 text-center shadow-soft sm:px-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-40 bg-gradient-to-b from-accent/10 to-transparent blur-3xl"
            />

            <div className="relative">
              <h2 className="mx-auto max-w-xl font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">
                Donnez-nous votre prochain PV à rédiger, nous vous rendons un document que vos élus n&rsquo;auront pas à corriger.
              </h2>

              <p className="mt-4 text-sm text-muted">contact@atoopv.com · 04 12 10 06 06</p>

              <div className="mt-8 flex justify-center">
                <Button as={Link} to={DEVIS_CTA_HREF} size="lg" variant="accent">
                  Demander un devis
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
