import { motion } from 'framer-motion'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/sections/Hero'
import ReportPreviewCarousel from '@/components/landing/ReportPreviewCarousel'
import InteractiveDashboardPreview from '@/components/dashboard/InteractiveDashboardPreview'
import Story from '@/components/landing/sections/Story'
import HowItWorks from '@/components/landing/sections/HowItWorks'
import Features from '@/components/landing/sections/Features'
import Testimonials from '@/components/landing/sections/Testimonials'
import PlatformShowcase from '@/components/landing/sections/PlatformShowcase'
import Footer from '@/components/landing/sections/Footer'

export default function Landing() {
  useSmoothScroll()

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
      <Hero />
      <ReportPreviewCarousel />
      <section className="mx-auto max-w-shell px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-sky">Dashboard showcase</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            See the product the moment you land.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            ATOOPV turns conversations into a calm executive surface that feels polished, immediate, and action-ready.
          </p>
        </div>
        <div className="mt-10">
          <InteractiveDashboardPreview />
        </div>
      </section>
      <Story />
      <HowItWorks />
      <Features />
      <Testimonials />
      <PlatformShowcase />
      <Footer />
    </motion.main>
  )
}
