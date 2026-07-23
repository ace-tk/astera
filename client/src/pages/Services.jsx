import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import Reveal from '@/components/ui/Reveal'
import ServiceCard from '@/components/services/ServiceCard'
import { usePageMeta } from '@/hooks/usePageMeta'
import { SERVICE_CATEGORIES } from '@/constants/services'

export default function Services() {
  usePageMeta({
    title: 'Services',
    description: 'Minute drafting, training, communication, and more — the same care Astera brings to every report, now covering the full life of your council.',
  })

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

      <section className="relative pt-36 sm:pt-40 lg:pt-44">
        <div className="shell">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink/30" /> Services
            </span>
            <h1 className="mt-6 max-w-2xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
              Everything your works council needs, beyond the report.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted text-pretty">
              Minute drafting, training, communication, and more — the same care
              Astera brings to every report, now covering the full life of your
              council.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative py-section">
        <div className="shell">
          <div className="grid auto-rows-[minmax(19rem,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_CATEGORIES.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </motion.main>
  )
}
