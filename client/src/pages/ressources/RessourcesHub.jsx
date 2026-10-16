import AtoopvHero from '@/components/atoopv/AtoopvHero'
import ArticleGrid from '@/components/atoopv/ArticleGrid'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import EditorialDivider from '@/components/atoopv/EditorialDivider'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import EditorialCategoryNav from '@/components/atoopv/EditorialCategoryNav'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useSectionNav, useCmsPages } from '@/cms/useNavigation'
import { RESOURCES, excerpt } from '@/services/resourcesContent'
import { RESSOURCES_NAV, RESSOURCES_HUB_SLUGS } from '@/constants/resourcesNav'

const META = {
  title: 'Ressources CSE : guides, jurisprudence et veille juridique',
  description:
    'Tous les contenus ATOOPV pour les élus du CSE : guides et livres blancs, modèles de PV, cas pratiques, jurisprudence sociale et veille juridique.',
}

/**
 * The Ressources landing page (/ressources): an index of everything in the section — the thematic hubs first,
 * then every article — as plain links. It used to serve the same page as /ressources/guides-livres-blancs-cse
 * (same title, same text, SEO fix list item 3); that page now stays on its own address with its own subject.
 */
export default function RessourcesHub() {
  const navItems = useSectionNav('ressources', RESSOURCES_NAV)
  const cmsPages = useCmsPages({ section: 'ressources' })
  const cmsBySlug = new Map(cmsPages.map((p) => [p.slug, p]))

  const card = (r) => {
    const edited = cmsBySlug.get(r.slug)
    return { title: edited?.title || r.title, body: edited?.excerpt || excerpt(r.body), to: `/ressources/${r.slug}`, cta: 'Lire →' }
  }
  const hubs = RESOURCES.filter((r) => RESSOURCES_HUB_SLUGS.has(r.slug)).map(card)
  const articles = RESOURCES.filter((r) => !RESSOURCES_HUB_SLUGS.has(r.slug)).map(card)
  const listed = new Set(RESOURCES.map((r) => `/ressources/${r.slug}`))
  for (const p of cmsPages) if (!listed.has(p.path) && !p.isHub) articles.push({ title: p.title, body: p.excerpt, to: p.path, cta: 'Lire →' })
  articles.sort((a, b) => a.title.localeCompare(b.title, 'fr'))

  usePageMeta(META)

  return (
    <>
      <AtoopvHero
        badge="Ressources"
        title="Ressources pour les élus du CSE"
        lead="Guides, livres blancs, modèles de PV, jurisprudence et veille juridique : tout ce qu’il faut pour exercer son mandat en confiance."
      />

      <div className="relative">
        <EditorialGridBackground lines />
        <ServiceCategoryContent
          navItems={navItems}
          navLabel="Ressources pages"
          nav={<EditorialCategoryNav items={navItems} label="Ressources pages" />}
          stickyColumns
          compact
        >
          <div className="space-y-14">
            <section aria-labelledby="ressources-rubriques">
              <EditorialDivider className="mb-8" />
              <h2 id="ressources-rubriques" className="mb-6 font-display text-2xl font-medium tracking-tight">Nos rubriques</h2>
              <ArticleGrid items={hubs} color="royal" columns={3} />
            </section>
            <section aria-labelledby="ressources-articles">
              <h2 id="ressources-articles" className="mb-6 font-display text-2xl font-medium tracking-tight">Tous nos articles</h2>
              <ArticleGrid items={articles} color="royal" columns={3} />
            </section>
          </div>
        </ServiceCategoryContent>
      </div>
    </>
  )
}
