// Regenerates cms/sitePageDefaults.json: the DEFAULT content of every "site page" (Tarification,
// À propos, Contact, …), taken from the website's own hardcoded content
// (client/src/cms/sitePageRegistry.js). The server validates every admin save against this exact
// structure, so the admin can change values but never the shape of a page.
//
// Usage: npm run cms:site-pages   (run locally after the content/structure of a site page changes
// in the frontend; a test fails if this file is out of date)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const clientSrc = path.resolve(here, '../../../../client/src')
const repoRoot = path.resolve(here, '../../../..')

const ATOOSAVOIR_HEADER = /^# (.+)\n\n- Source URL: (.+)\n- Category: (.+)\n- Breadcrumb: (.+)\n\n([\s\S]*)$/
function parseAtoosavoir(raw, file) {
  const m = raw.match(ATOOSAVOIR_HEADER)
  const slug = path.basename(file, '.md')
  return m ? { slug, title: m[1], breadcrumb: m[4], body: m[5] } : { slug, title: slug, breadcrumb: 'atoosavoir', body: raw }
}

/** Plain-JSON copy of the registry: components (icons) are dropped — they are never editable content. */
export async function buildSitePageDefaults() {
  const { SITE_PAGES } = await import(pathToFileURL(path.join(clientSrc, 'cms/sitePageRegistry.js')))
  const { parseContentFile } = await import(pathToFileURL(path.join(clientSrc, 'utils/contentMarkdown.js')))
  const pages = JSON.parse(JSON.stringify(SITE_PAGES))
  // Pages whose text lives in a bundled markdown file (hub pages, CGV): the file's fields — parsed exactly
  // like the website's own loaders do — are part of the defaults, so what the admin sees is what is live.
  for (const [key, entry] of Object.entries(SITE_PAGES)) {
    if (!entry.fileSource) continue
    const file = path.join(repoRoot, entry.fileSource.file)
    const raw = fs.readFileSync(file, 'utf8')
    // atoosavoir pages are loaded by services/atoosavoirContent.js, which keeps the body as-is (no cleanup passes).
    const parsed = entry.fileSource.parser === 'atoosavoir' ? parseAtoosavoir(raw, file) : parseContentFile(raw, file, 'Page')
    for (const [field, from] of Object.entries(entry.fileSource.fields)) pages[key].defaults[field] = parsed[from]
    delete pages[key].fileSource
  }
  return pages
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  const pages = await buildSitePageDefaults()
  fs.writeFileSync(path.resolve(here, '../sitePageDefaults.json'), `${JSON.stringify(pages, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(pages).length} site pages: ${Object.keys(pages).join(', ')}`)
}
