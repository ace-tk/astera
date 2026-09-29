import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, Link2, Twitter, Youtube } from 'lucide-react'
import Button from '@/components/ui/Button'
import Wordmark from '@/components/common/Wordmark'
import { useFooterCms } from '@/cms/useFooter'
import { resolveFooterLink } from '@/cms/footerLink'

/**
 * Site-wide footer — reproduces the reference footer handoff (light
 * background, 5-column grid, ink/muted hierarchy). Originally the ATOOPV
 * homepage's own footer (Accueil.jsx); now used everywhere, replacing the old
 * placeholder-link `landing/sections/Footer`.
 *
 * Content (text, links, contact info, legal links, copyright, optional social
 * links) is CMS-driven — see useFooterCms.js. The visual structure below is
 * unchanged from the pre-CMS version; only where the strings/links come from
 * differs. `useFooterCms` always returns a full, valid footer object (the
 * site's real current content, if the CMS can't be reached), so this
 * component never has to guard against a missing field.
 */
const SOCIAL_ICONS = { linkedin: Linkedin, instagram: Instagram, facebook: Facebook, twitter: Twitter, youtube: Youtube, other: Link2 }

function FooterLink({ label, link }) {
  const className = 'block text-[13.5px] text-muted transition-colors hover:text-ink'
  const props = resolveFooterLink(link)
  return props.to ? (
    <Link to={props.to} className={className}>{label}</Link>
  ) : (
    <a href={props.href} className={className}>{label}</a>
  )
}

export default function AtoopvFooter() {
  const year = new Date().getFullYear()
  const { content } = useFooterCms()
  const { brand, contact, cta, columns, legalLinks, social, copyrightText, bottomLine } = content
  const ctaTarget = resolveFooterLink(cta.link)
  const activeSocial = social.filter((s) => s.enabled !== false)

  return (
    <footer className="border-t border-ink/8 bg-card pt-[52px] pb-7">
      <div className="shell">
        <div className="grid grid-cols-2 gap-7 border-b border-ink/8 pb-8 min-[900px]:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            {brand.tagline && <p className="mt-3 font-display text-[15px] italic text-muted">{brand.tagline}</p>}
            {brand.location && <p className="mt-1 text-[13px] text-muted">{brand.location}</p>}
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink">Contact</h4>
            <div className="mt-3.5 flex flex-col items-start gap-2.5">
              {contact.phoneDisplay && (
                <a href={contact.phoneHref || '#'} className="text-[13.5px] font-medium text-ink">{contact.phoneDisplay}</a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="text-[13.5px] font-medium text-ink">{contact.email}</a>
              )}
              {cta.label && (
                <Button as={ctaTarget.to ? Link : 'a'} {...(ctaTarget.to ? { to: ctaTarget.to } : { href: ctaTarget.href })} variant="primary" size="sm" className="mt-1">
                  {cta.label}
                </Button>
              )}
            </div>
          </div>

          {columns.map((col, i) => {
            const isLast = i === columns.length - 1
            const links = isLast ? [...col.links, ...legalLinks] : col.links
            return (
              <div key={col.id}>
                <h4 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink">{col.title}</h4>
                <div className="mt-3.5 space-y-2.5">
                  {links.map((link) => (
                    <FooterLink key={link.id} label={link.label} link={link.link} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-5 text-[12.5px] text-muted">
          <span>{copyrightText.replace('{year}', year)}</span>
          <span>{bottomLine}</span>
          {activeSocial.length > 0 && (
            <div className="flex items-center gap-3">
              {activeSocial.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon] || Link2
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer noopener" aria-label={s.platform} className="text-muted transition-colors hover:text-ink">
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
