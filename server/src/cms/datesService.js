import { SitePage } from '../models/SitePage.js'
import { HomeHero } from '../models/HomeHero.js'
import { Footer } from '../models/Footer.js'
import { LegalPages } from '../models/LegalPages.js'

const iso = (d) => (d ? new Date(d).toISOString() : null)

/**
 * When the editable non-article content was last PUBLISHED (the sitemap's <lastmod> for the home page, Tarification, Contact,
 * the hubs ...). Articles carry their own date in /cms/index. `null` = never edited in the admin: the site shows the text that is
 * built into the frontend, and the sitemap falls back to the date of that source file.
 */
export async function contentDates() {
  const [pages, hero, footer, legal] = await Promise.all([
    SitePage.find({}).select('key publishedAt').lean(),
    HomeHero.findOne({}).select('publishedAt').lean(),
    Footer.findOne({}).select('publishedAt').lean(),
    LegalPages.findOne({}).select('publishedAt').lean(),
  ])
  return {
    sitePages: Object.fromEntries(pages.filter((p) => p.publishedAt).map((p) => [p.key, iso(p.publishedAt)])),
    homeHero: iso(hero?.publishedAt),
    footer: iso(footer?.publishedAt),
    legalPages: iso(legal?.publishedAt),
  }
}
