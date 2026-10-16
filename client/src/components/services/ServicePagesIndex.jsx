import { Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import { useSectionNav } from '@/cms/useNavigation'
import { CATEGORY_NAV, CATEGORY_LABEL } from '@/constants/servicesNav'

const ALL_SERVICE_CATEGORIES = ['drafting', 'by-city', 'tarifs-infos', 'guides', 'communication', 'training']

/**
 * A plain-link index of the service pages: one block per category (its hub, then every child page), each a real
 * `<a href>` in the page's HTML — so a crawler reaches every commercial page from /services and the homepage
 * without running a menu or a script (SEO fix list, item 8). Follows the same navigation data as the side
 * navigation, so a page published in the CMS shows up here by itself and an unpublished one disappears.
 */
function CategoryBlock({ category }) {
  const items = useSectionNav(category, CATEGORY_NAV[category])
  const hub = items.find((i) => i.end) || { to: `/services/${category}` }
  const children = items.filter((i) => i.to !== hub.to)

  return (
    <div>
      <h3 className="font-display text-base font-medium tracking-tight">
        <Link to={hub.to} className="transition-colors hover:text-royal">{CATEGORY_LABEL[category]}</Link>
      </h3>
      <ul className="mt-3 space-y-1.5 border-l border-ink/10 pl-4 text-sm">
        {children.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-muted underline-offset-4 transition-colors hover:text-royal hover:underline">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ServicePagesIndex({ categories = ALL_SERVICE_CATEGORIES, eyebrow, heading, lead, id }) {
  return (
    <section id={id} className="relative py-10 sm:py-14" aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="shell">
        <div className="mx-auto max-w-5xl">
          <Reveal className="max-w-2xl">
            {eyebrow && <span className="eyebrow"><span className="h-px w-8 bg-ink/30" /> {eyebrow}</span>}
            <h2 id={id ? `${id}-title` : undefined} className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>
            {lead && <p className="mt-3 text-base leading-relaxed text-muted text-pretty">{lead}</p>}
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => <CategoryBlock key={c} category={c} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
