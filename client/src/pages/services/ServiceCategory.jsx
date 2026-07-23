import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/sections/Footer'
import Reveal from '@/components/ui/Reveal'
import Glyph from '@/components/ui/Glyph'
import Button from '@/components/ui/Button'
import { accent } from '@/utils/accent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { SERVICE_CATEGORIES } from '@/constants/services'
import { cn } from '@/utils/cn'

/**
 * Routing placeholder for a service category that has no dedicated page yet.
 * Every category currently in SERVICE_CATEGORIES has its own route, so this
 * only serves as a fallback for the generic /services/:slug wildcard.
 */
export default function ServiceCategory() {
  const { slug } = useParams()
  const service = SERVICE_CATEGORIES.find((s) => s.id === slug)
  const a = accent(service?.color)
  usePageMeta({ title: service?.title || 'Services', description: service?.description })

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

      <section className="relative flex min-h-screen items-center pt-32">
        <div className="shell">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className={cn('mx-auto grid h-16 w-16 place-items-center rounded-2xl', a.softBg, a.text)}>
              <Glyph name={service?.glyph || 'report'} size={34} />
            </span>
            <span className="eyebrow mt-6 justify-center">{service?.eyebrow || 'Services'}</span>
            <h1 className="mt-4 font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
              {service?.title || 'Service page'} is on its way.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted text-pretty">
              This category page hasn&rsquo;t been built yet — the Services
              landing page is live, and this route is reserved for what comes
              next.
            </p>
            <div className="mt-9 flex justify-center">
              <Button as={Link} to="/services" variant="soft">
                <ArrowLeft className="h-4 w-4" /> Back to Services
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </motion.main>
  )
}
