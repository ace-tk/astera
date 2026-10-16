import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import AmbientBackground from '@/components/landing/AmbientBackground'
import { usePageMeta } from '@/hooks/usePageMeta'

const LINKS = [
  { to: '/services', label: 'Nos services', hint: 'Rédaction de PV, tarifs, guides, formations' },
  { to: '/ressources', label: 'Nos ressources', hint: 'Guides, jurisprudence, veille juridique' },
  { to: '/contact', label: 'Nous contacter', hint: 'Une question ? Un devis gratuit ?' },
]

export default function NotFound() {
  usePageMeta({
    title: 'Page introuvable',
    description: 'La page que vous cherchez n’existe pas ou a été déplacée. Retrouvez nos services, nos ressources ou contactez-nous.',
    noindex: true,
  })

  return (
    <main className="relative grid min-h-screen place-items-center bg-paper px-6 py-16 text-center">
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-display text-[9rem] font-semibold leading-none tracking-tight text-ink/10">404</p>
        <h1 className="-mt-6 font-display text-4xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Cette adresse n’existe pas ou a été déplacée. Voici où poursuivre votre visite.
        </p>
        <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="block h-full rounded-2xl border border-ink/8 bg-card/95 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-royal/25"
              >
                <span className="font-display text-base font-medium text-ink">{l.label}</span>
                <span className="mt-1 block text-sm text-muted">{l.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <Button as={Link} to="/" variant="accent">Retour à l’accueil</Button>
        </div>
      </motion.div>
    </main>
  )
}
