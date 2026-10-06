import AtoopvHero from '@/components/atoopv/AtoopvHero'
import ArticleGrid from '@/components/atoopv/ArticleGrid'
import EditorialGridBackground from '@/components/atoopv/EditorialGridBackground'
import EditorialDivider from '@/components/atoopv/EditorialDivider'
import ServiceCategoryContent from '@/components/services/ServiceCategoryContent'
import EditorialCategoryNav from '@/components/atoopv/EditorialCategoryNav'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useSitePage } from '@/cms/useSitePage'
import { useSectionNav, useCmsPages } from '@/cms/useNavigation'
import { getResource, excerpt, VEILLE_JURIDIQUE_SLUGS } from '@/services/resourcesContent'
import { RESSOURCES_NAV } from '@/constants/resourcesNav'

/**
 * "Veille juridique CSE" hub. The live atoopv.com nav points this entry at
 * /category/veille-juridique-cse/ -- a paginated WordPress archive, not a
 * real page (see extract_resources.py's docstring for why it wasn't
 * extracted). Its 11 constituent articles were all extracted individually,
 * so this page assembles the same hub experience from those, using the
 * same ArticleGrid card grammar the Accueil page already uses for its own
 * "veille juridique" preview.
 */
export default function VeilleJuridique() {
  const navItems = useSectionNav('ressources', RESSOURCES_NAV)
  // The page's own heading text follows its published CMS site page (defaults = the hardcoded text).
  const { hero } = useSitePage('veille-juridique')
  // Articles labelled "Veille juridique" in the CMS join this listing after the built-in ones.
  const cmsArticles = useCmsPages({ section: 'ressources', tag: 'veille-juridique' })

  // A built-in article that has been edited in the CMS shows its CMS title/summary here too.
  const cmsBySlug = new Map(useCmsPages({ section: 'ressources' }).map((p) => [p.slug, p]))

  const items = VEILLE_JURIDIQUE_SLUGS.map((slug) => {
    const r = getResource(slug)
    const edited = cmsBySlug.get(slug)
    return { title: edited?.title || r.title, body: edited?.excerpt || excerpt(r.body), to: `/ressources/${slug}`, cta: 'Lire →' }
  })
  const listed = new Set(items.map((i) => i.to))
  for (const p of cmsArticles) if (!listed.has(p.path)) items.push({ title: p.title, body: p.excerpt, to: p.path, cta: 'Lire →' })

  usePageMeta({ title: hero.title, description: hero.lead })

  return (
    <>
      <AtoopvHero badge={hero.badge} title={hero.title} lead={hero.lead} />

      <div className="relative">
        <EditorialGridBackground lines />

        <ServiceCategoryContent
          navItems={navItems}
          navLabel="Ressources pages"
          nav={<EditorialCategoryNav items={navItems} label="Ressources pages" />}
          stickyColumns
          compact
        >
          <div>
            <EditorialDivider className="mb-8" />
            <ArticleGrid items={items} color="royal" columns={3} featureFirst />
          </div>
        </ServiceCategoryContent>
      </div>
    </>
  )
}
