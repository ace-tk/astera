// Turns the release build in dist/ into a STAGING package (atoopv-staging.zip) for staging.atoopv.com:
//   - redirects are host-relative (the build must have been made with SEO_ORIGIN= — checked here), so a
//     legacy URL on staging redirects inside staging, never to production;
//   - the whole site answers "X-Robots-Tag: noindex" and robots.txt disallows everything, the sitemap is
//     removed: Google must not index a second copy of the site (its canonical tags point to atoopv.com).
// Nothing in dist/ is modified: the package is assembled in dist-staging/.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const dist = path.join(clientRoot, 'dist')
const out = path.join(clientRoot, 'dist-staging')

const need = ['index.html', '.htaccess', '_pre/manifest.json']
const missing = need.filter((f) => !fs.existsSync(path.join(dist, f)))
if (missing.length) { console.error(`Not a release build — missing in dist/: ${missing.join(', ')}. Run \`npm run release:stage\`.`); process.exit(1) }
const htaccess = fs.readFileSync(path.join(dist, '.htaccess'), 'utf8')
if (/https:\/\/atoopv\.com\/(services|ressources|tarification)/.test(htaccess)) {
  console.error('dist/.htaccess redirects to https://atoopv.com — this build was made for production. Use `npm run release:stage` (SEO_ORIGIN=).')
  process.exit(1)
}

fs.rmSync(out, { recursive: true, force: true })
fs.cpSync(dist, out, { recursive: true })
fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
fs.rmSync(path.join(out, 'sitemap.xml'), { force: true })
fs.writeFileSync(
  path.join(out, '.htaccess'),
  `${htaccess.trimEnd()}\n\n# STAGING: never index this copy of the site.\n<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, nofollow, noarchive"\n</IfModule>\n`,
)

const zip = path.join(clientRoot, 'atoopv-staging.zip')
fs.rmSync(zip, { force: true })
const r = spawnSync('zip', ['-qr', zip, '.', '-x', '.DS_Store'], { cwd: out, stdio: 'inherit' })
if (r.status !== 0) process.exit(r.status ?? 1)
console.log(`✓ ${path.relative(process.cwd(), zip)} (${(fs.statSync(zip).size / 1024 / 1024).toFixed(1)} MB) — extract into the staging.atoopv.com document root, .htaccess included.`)
