import { motion } from 'framer-motion'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/sections/Hero'
import Story from '@/components/landing/sections/Story'
import HowItWorks from '@/components/landing/sections/HowItWorks'
import Features from '@/components/landing/sections/Features'
import Testimonials from '@/components/landing/sections/Testimonials'
import Pricing from '@/components/landing/sections/Pricing'
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
      <Story />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </motion.main>
  )
}
