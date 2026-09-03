import { useEffect } from 'react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import DesignTestIntro from '@/components/design-test/DesignTestIntro'
import DesignTestOutro from '@/components/design-test/DesignTestOutro'
import ExperimentNavigator from '@/components/design-test/ExperimentNavigator'
import SectionSeam from '@/components/design-test/primitives/SectionSeam'
import StructuredIntelligence from '@/components/design-test/experiments/StructuredIntelligence'
import LivingBlueprint from '@/components/design-test/experiments/LivingBlueprint'
import EditorialProcess from '@/components/design-test/experiments/EditorialProcess'
import TypographySystem from '@/components/design-test/experiments/TypographySystem'
import OrchestratedCards from '@/components/design-test/experiments/OrchestratedCards'
import ConnectedDocument from '@/components/design-test/experiments/ConnectedDocument'
import '@/styles/design-test.css'

/**
 * Keeps this internal lab out of search results without touching the
 * shared `usePageMeta` contract (which only manages title/description).
 */
function useNoIndex() {
  useEffect(() => {
    const tag = document.createElement('meta')
    tag.setAttribute('name', 'robots')
    tag.setAttribute('content', 'noindex, nofollow')
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])
}

/**
 * /design-test — the ATOOPV Design & Motion Lab. An isolated client-facing
 * showcase of visual/motion directions, entirely separate from the
 * production site: no shared Navbar/Footer, its own scoped stylesheet, and
 * its own experiment navigator. See client/src/constants/designTest.js for
 * the content and components/design-test for the six experiments.
 */
export default function DesignTest() {
  usePageMeta({
    title: 'Design & Motion Lab',
    description: 'ATOOPV — laboratoire de design et de motion. Explorations visuelles internes, non destinées au site public.',
  })
  useNoIndex()
  useSmoothScroll()

  return (
    <main className="design-test relative bg-paper text-ink">
      <DesignTestIntro />
      <StructuredIntelligence />
      <SectionSeam from="01" to="02" variant="number" />
      <LivingBlueprint />
      <SectionSeam from="02" to="03" variant="grid" />
      <EditorialProcess />
      <SectionSeam from="03" to="04" variant="number" />
      <TypographySystem />
      <SectionSeam from="04" to="05" variant="grid" />
      <OrchestratedCards />
      <SectionSeam from="05" to="06" variant="number" />
      <ConnectedDocument />
      <DesignTestOutro />
      <ExperimentNavigator />
    </main>
  )
}
