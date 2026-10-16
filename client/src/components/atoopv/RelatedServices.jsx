import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { serviceLinksForResource } from '@/constants/resourceServiceLinks'

/** "Pour aller plus loin" block closing a Ressources article: plain links to the service pages that match its subject. */
export default function RelatedServices({ slug }) {
  const links = serviceLinksForResource(slug)
  return (
    <aside aria-labelledby="related-services-title" className="mt-12 rounded-[1.6rem] border border-ink/8 bg-card/95 p-6 shadow-soft sm:p-8">
      <h2 id="related-services-title" className="font-display text-lg font-medium tracking-tight">Pour aller plus loin : nos services</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="group inline-flex items-center gap-2 text-sm font-medium text-royal underline-offset-4 hover:underline">
              {l.label} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
        <li>
          <Link to="/contact" className="text-sm text-muted underline-offset-4 hover:text-royal hover:underline">Demander un devis gratuit</Link>
        </li>
      </ul>
    </aside>
  )
}
