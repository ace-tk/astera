// Regenerates the committed .htaccess files (base mode) from the redirect map.
//   npm run seo:htaccess      (also wired into `prebuild`, so a build can never ship a stale file)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHtaccess } from './htaccess.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const clientRoot = path.resolve(here, '../..')
const repoRoot = path.resolve(clientRoot, '..')
// A build that sets SEO_ORIGIN explicitly (a staging build: SEO_ORIGIN= → host-relative redirects) must never
// rewrite the two COMMITTED production files.
if (process.env.SEO_ORIGIN !== undefined) {
  console.log('✓ SEO_ORIGIN is set — committed .htaccess files left untouched (non-production build)')
  process.exit(0)
}
const content = buildHtaccess({ mode: 'base', origin: 'https://atoopv.com' })

for (const target of [path.join(clientRoot, 'public/.htaccess'), path.join(repoRoot, 'deploy/o2switch/public_html/.htaccess')]) {
  fs.writeFileSync(target, content)
}
console.log(`✓ .htaccess written (base mode) → client/public/.htaccess, deploy/o2switch/public_html/.htaccess`)
