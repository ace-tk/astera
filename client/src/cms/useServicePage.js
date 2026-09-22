import { useCmsArticle } from './useCmsArticle'
import { CMS_DRIVEN_SLUGS } from './config'

/** Service Article pages (Procès-verbal, Formations, Guides): /services/<section>/<slug>. */
export function useServicePage({ category, slug, bundled, hub }) {
  return useCmsArticle({ path: `/services/${category}/${slug}`, section: category, slug, bundled, hub, drivenSlugs: CMS_DRIVEN_SLUGS })
}
