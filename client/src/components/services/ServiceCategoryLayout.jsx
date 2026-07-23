import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'

/**
 * Shared chrome for a service category: Navbar, ambient background, Footer.
 * Deliberately thin — each page owns its full-bleed hero, then composes its
 * body inside <ServiceCategoryContent> for the sidebar + content grid. Kept
 * generic (no drafting-specific knowledge) so every category can reuse it.
 */
export default function ServiceCategoryLayout() {
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
      <Outlet />
      <Footer />
    </motion.main>
  )
}
