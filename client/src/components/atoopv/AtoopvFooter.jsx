import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Wordmark from '@/components/common/Wordmark'

/**
 * ATOOPV homepage footer — reproduces the reference footer handoff (light
 * background, 5-column grid, ink/muted hierarchy) with this site's real
 * routes/contact data rather than the mockup's placeholder ones. Rendered
 * only on `/atoopv` (Accueil.jsx); every other page keeps the shared
 * `landing/sections/Footer`.
 */
const COLUMNS = [
  {
    title: 'Offres',
    links: [
      { label: 'Rédaction PV — ALC', to: '/services' },
      { label: 'SIRUS — IA', to: '/atoopv/a-propos' },
      { label: 'Formations', to: '/services/training' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Blog', to: '/atoopv/ressources' },
      { label: 'AtooSavoir', to: '/atoopv/atoosavoir' },
      { label: 'Boutique', to: '/atoopv/boutique' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', to: '/atoopv/a-propos' },
      { label: 'Contact', href: 'mailto:contact@atoopv.com' },
      { label: 'Mentions légales', href: '#' },
      { label: 'CGV', href: '#' },
      { label: 'Politique de confidentialité', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
]

function FooterLink({ label, to, href }) {
  const className = 'block text-[13.5px] text-muted transition-colors hover:text-ink'
  return to ? (
    <Link to={to} className={className}>{label}</Link>
  ) : (
    <a href={href} className={className}>{label}</a>
  )
}

export default function AtoopvFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ink/8 bg-card pt-[52px] pb-7">
      <div className="shell">
        <div className="grid grid-cols-2 gap-7 border-b border-ink/8 pb-8 min-[900px]:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-3 font-display text-[15px] italic text-muted">« Retranscrire sans trahir. »</p>
            <p className="mt-1 text-[13px] text-muted">Lyon · Annecy — ALC SAS</p>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink">Contact</h4>
            <div className="mt-3.5 flex flex-col items-start gap-2.5">
              <a href="tel:+33412100606" className="text-[13.5px] font-medium text-ink">04 12 10 06 06</a>
              <a href="mailto:contact@atoopv.com" className="text-[13.5px] font-medium text-ink">contact@atoopv.com</a>
              <Button as={Link} to="/atoopv/tarification" variant="primary" size="sm" className="mt-1">
                Demander un devis
              </Button>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink">{col.title}</h4>
              <div className="mt-3.5 space-y-2.5">
                {col.links.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-5 text-[12.5px] text-muted">
          <span>© {year} ALC SAS — Tous droits réservés.</span>
          <span>contact@atoopv.com · 04 12 10 06 06</span>
        </div>
      </div>
    </footer>
  )
}
