// Regenerates cms/legacySlugs.json: the slugs of every page that still lives in
// the bundled markdown (content/**/*.md). New CMS pages may not reuse them —
// the public site's link resolution and its legacy loader look pages up by
// slug alone, so a duplicate would be ambiguous.
//
// Usage: npm run cms:legacy-slugs   (run locally; needs the repo's /content dir)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const contentRoot = path.resolve(here, '../../../../content')

const slugs = new Set()
for (const dir of fs.readdirSync(contentRoot, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  for (const f of fs.readdirSync(path.join(contentRoot, dir.name))) {
    if (f.endsWith('.md')) slugs.add(f.replace(/\.md$/, ''))
  }
}
const sorted = [...slugs].sort()
fs.writeFileSync(path.resolve(here, '../legacySlugs.json'), `${JSON.stringify(sorted, null, 2)}\n`)
console.log(`Wrote ${sorted.length} legacy slugs`)
