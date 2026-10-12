// Zips dist/ (including the hidden .htaccess) into atoopv-release.zip — what gets uploaded to the
// server's document root. Refuses to pack a build that is not a pre-rendered release build.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const dist = path.join(clientRoot, 'dist')
const need = ['index.html', '.htaccess', '_pre/manifest.json', '_pre/404.html', 'sitemap.xml']
const missing = need.filter((f) => !fs.existsSync(path.join(dist, f)))
if (missing.length) { console.error(`Not a release build — missing in dist/: ${missing.join(', ')}. Run \`npm run build:release\`.`); process.exit(1) }
if (!fs.readFileSync(path.join(dist, '.htaccess'), 'utf8').includes('mode: release')) { console.error('dist/.htaccess is not the release version.'); process.exit(1) }

const out = path.join(clientRoot, 'atoopv-release.zip')
fs.rmSync(out, { force: true })
const r = spawnSync('zip', ['-qr', out, '.', '-x', '.DS_Store'], { cwd: dist, stdio: 'inherit' })
if (r.status !== 0) process.exit(r.status ?? 1)
console.log(`✓ ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} MB) — extract it into the document root, .htaccess included.`)
