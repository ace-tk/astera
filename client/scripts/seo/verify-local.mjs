// Verifies the generated .htaccess on a REAL Apache 2.4 (macOS ships one) against the redirect map —
// the same acceptance checks the client will run with curl, run before anything is deployed.
//
//   node scripts/seo/verify-local.mjs --root dist            # docroot to serve (default: dist)
//   node scripts/seo/verify-local.mjs --root dist --report /tmp/report.md
//
// It copies the docroot to a scratch dir, starts httpd on :8099, requests every URL with
// `Host: atoopv.com` + `X-Forwarded-Proto: https` (so the https rule is not what is being tested)
// and writes a Markdown report. Exit code 1 if any check fails.
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { REDIRECTS, PREFIX_REDIRECTS, GONE, INVENTED_404 } from './redirectMap.mjs'

const ANNEX_A = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'annexA.json'), 'utf8'))

const here = path.dirname(fileURLToPath(import.meta.url))
const clientRoot = path.resolve(here, '../..')
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const ROOT = path.resolve(clientRoot, arg('root', 'dist'))
const REPORT = arg('report', null)
const PORT = 8099
const ORIGIN = 'https://atoopv.com'

if (!fs.existsSync(path.join(ROOT, '.htaccess'))) { console.error(`No .htaccess in ${ROOT}`); process.exit(2) }
const manifestFile = path.join(ROOT, '_pre/manifest.json')
const release = fs.existsSync(manifestFile)
const manifest = release ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : null // list of valid route paths ('/', '/tarification', …)
const validRoutes = new Set(manifest ?? [])

/* ----------------------------- apache ----------------------------- */
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-verify-'))
const www = path.join(work, 'www')
fs.cpSync(ROOT, www, { recursive: true })
fs.mkdirSync(path.join(work, 'logs'))
const mods = ['mpm_prefork', 'authz_core', 'dir', 'mime', 'log_config', 'rewrite', 'headers', 'alias', 'unixd', 'filter', 'deflate', 'setenvif']
fs.writeFileSync(path.join(work, 'httpd.conf'), [
  'ServerRoot "/usr"', `Listen ${PORT}`, `PidFile "${work}/logs/httpd.pid"`,
  ...mods.map((m) => `LoadModule ${m}_module libexec/apache2/mod_${m}.so`),
  'ServerName localhost', `User ${os.userInfo().username}`, `ErrorLog "${work}/logs/error.log"`,
  `DocumentRoot "${www}"`, `<Directory "${www}">`, '  AllowOverride All', '  Require all granted', '</Directory>',
].join('\n'))
const httpd = (k) => spawnSync('/usr/sbin/httpd', ['-f', path.join(work, 'httpd.conf'), '-k', k], { encoding: 'utf8' })
const started = httpd('start')
if (started.status !== 0) { console.error(started.stderr || started.stdout); process.exit(2) }
const stop = () => { httpd('stop'); fs.rmSync(work, { recursive: true, force: true }) }
process.on('exit', stop)
await new Promise((r) => setTimeout(r, 1200))

const req = (p, { host = 'atoopv.com', proto = 'https' } = {}) =>
  new Promise((resolve, reject) => {
    const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'GET', headers: { Host: host, 'X-Forwarded-Proto': proto } }, (res) => {
      let body = ''
      res.on('data', (c) => { if (body.length < 4000) body += c })
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location ?? '', body }))
    })
    r.on('error', reject)
    r.end()
  })

/* ----------------------------- checks ----------------------------- */
const rows = []
const check = async (group, urlPath, expectStatus, expectLocation = null, opts = {}) => {
  const res = await req(urlPath, opts)
  const ok = res.status === expectStatus && (expectLocation === null || res.location === expectLocation)
  rows.push({ group, url: urlPath, expect: `${expectStatus}${expectLocation ? ` → ${expectLocation}` : ''}`, got: `${res.status}${res.location ? ` → ${res.location}` : ''}`, ok })
  return res
}

// the final target must exist: 200 in the SPA fallback build, in the pre-render manifest in a release build
const targetShouldBe200 = (to) => (release ? validRoutes.has(to) : true)

for (const r of REDIRECTS) {
  for (const from of r.from) {
    for (const suffix of ['', '/']) {
      await check('301 legacy → target', `/${from}${suffix}`, 301, `${ORIGIN}${r.to}`)
    }
  }
  const t = await req(r.to)
  const should = targetShouldBe200(r.to)
  rows.push({ group: 'target answers 200', url: r.to, expect: should ? '200' : '(not pre-rendered: target page is unpublished/missing)', got: String(t.status), ok: should ? t.status === 200 : true, note: should ? '' : 'known gap' })
}
for (const p of PREFIX_REDIRECTS) {
  const sample = p.exact ? `/${p.prefix}` : `/${p.prefix}exemple-xyz`
  await check('301 prefix', sample, 301, `${ORIGIN}${p.to}`)
  if (!p.exact) await check('301 prefix', `${sample}/`, 301, `${ORIGIN}${p.to}`)
}
for (const g of GONE.exact) { await check('410 gone', `/${g}`, 410); await check('410 gone', `/${g}/`, 410) }
for (const g of ['Plan-du-site', 'Plan-du-site/', 'author/loine-alami/', 'author/loine-alami/feed/', 'feed/', 'ressources/feed/', 'wp-login.php', 'wp-admin/admin-ajax.php', 'wp-content/uploads/a.jpg', 'wp-json/sureforms/v1/geo-country', 'wp-includes/x.js', 'xmlrpc.php', 'wp-cron.php']) {
  await check('410 gone', `/${g}`, 410)
}
// the global trailing-slash rule
for (const p of ['a-propos', 'contact', 'tarification', 'autodiagnostic', 'atoosavoir', 'atoosavoir/cgv', 'mentions-legales', 'politique-de-confidentialite']) {
  await check('301 trailing slash', `/${p}/`, 301, `${ORIGIN}/${p}`)
}
// query strings survive a redirect
await check('query string kept', '/redaction-pv-cse/?utm_source=nl&utm_campaign=x', 301, `${ORIGIN}/services/drafting/redaction-pv-cse?utm_source=nl&utm_campaign=x`)
// one hop even from http / www
await check('one hop from http/www', '/proces-verbal/', 301, `${ORIGIN}/ressources/proces-verbal`, { host: 'www.atoopv.com', proto: 'http' })
await check('one hop from http/www', '/redaction-pv-cse', 301, `${ORIGIN}/services/drafting/redaction-pv-cse`, { host: 'atoopv.com', proto: 'http' })
// existing pre-migration renames
await check('301 earlier renames', '/atoopv', 301, `${ORIGIN}/`)
await check('301 earlier renames', '/atoopv/tarification', 301, `${ORIGIN}/tarification`)
await check('301 earlier renames', '/atoopv/ressources/proces-verbal/', 301, `${ORIGIN}/ressources/proces-verbal`)
// real pages must NOT be touched
for (const p of ['/', '/tarification', '/contact', '/a-propos', '/services', '/ressources', '/atoosavoir/exemple', '/services/drafting/redaction-pv-cse', '/ressources/proces-verbal', '/sitemap.xml', '/robots.txt', '/login', '/register', '/app', '/app/admin/cms/pages', '/blog/un-article-de-blog']) {
  await check('valid pages stay 200', p, 200)
}
// invented URLs: 404 in a release build; (SPA fallback in a base build answers 200 — a known limitation)
for (const p of INVENTED_404) {
  const res = await req(`/${p}`)
  rows.push({ group: release ? '404 invented URLs' : '404 invented URLs (base build: SPA fallback)', url: `/${p}`, expect: release ? '404' : '(200 in base build)', got: String(res.status), ok: release ? res.status === 404 : true })
}
// Annex A of the SEO brief: the 36 URLs Google Search Console reports as "Not found (404)".
// Expected outcome per row = what the brief's "Covered by" column says.
for (const row of ANNEX_A) {
  const raw = row.url
  const concrete = raw === '/wp-*.php' ? '/wp-login.php' : raw.startsWith('/*') ? '/page-generique-introuvable' : raw
  const noSlash = concrete.replace(/\/$/, '')
  const key = noSlash.replace(/^\//, '')
  if (/410/.test(row.coveredBy)) await check('Annex A (36 URLs from Search Console)', concrete, 410)
  else if (/must return 200/.test(row.coveredBy)) await check('Annex A (36 URLs from Search Console)', concrete, 200)
  else if (/must return 404/.test(row.coveredBy)) {
    const res = await req(concrete)
    rows.push({ group: 'Annex A (36 URLs from Search Console)', url: concrete, expect: release ? '404' : '(200 in base build)', got: String(res.status), ok: release ? res.status === 404 : true })
  } else {
    const mapped = REDIRECTS.find((r) => r.from.includes(key))
    const prefixed = PREFIX_REDIRECTS.find((p) => (p.exact ? key === p.prefix : key.startsWith(p.prefix)))
    const target = mapped ? mapped.to : prefixed ? prefixed.to : /trailing slash/.test(row.coveredBy) ? `/${key}` : null
    if (!target) { rows.push({ group: 'Annex A (36 URLs from Search Console)', url: concrete, expect: 'a mapped target', got: 'NO RULE', ok: false }); continue }
    await check('Annex A (36 URLs from Search Console)', concrete, 301, `${ORIGIN}${target}`)
  }
}
// sitemap: every URL must answer 200 (release build: and be pre-rendered)
const sitemapFile = path.join(ROOT, 'sitemap.xml')
if (fs.existsSync(sitemapFile)) {
  const urls = [...fs.readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  for (const u of urls) await check('sitemap URL answers 200', u, 200)
}

/* ----------------------------- report ----------------------------- */
const failed = rows.filter((r) => !r.ok)
const groups = [...new Set(rows.map((r) => r.group))]
const out = []
out.push(`# .htaccess verification — ${release ? 'RELEASE build (pre-rendered, real 404)' : 'BASE build (SPA fallback)'}`, '', `Docroot: \`${path.relative(process.cwd(), ROOT) || ROOT}\` · Apache ${spawnSync('/usr/sbin/httpd', ['-v'], { encoding: 'utf8' }).stdout.split('\n')[0].replace('Server version: ', '')}`, '', `**${rows.length - failed.length}/${rows.length} checks passed**${failed.length ? ` — ${failed.length} FAILED` : ''}`, '')
for (const g of groups) {
  const gr = rows.filter((r) => r.group === g)
  out.push(`## ${g} — ${gr.filter((r) => r.ok).length}/${gr.length}`, '', '| URL | expected | got | |', '|---|---|---|---|')
  for (const r of gr) out.push(`| \`${r.url}\` | ${r.expect} | ${r.got} | ${r.ok ? '✓' : '✗'}${r.note ? ` ${r.note}` : ''} |`)
  out.push('')
}
const text = out.join('\n')
if (REPORT) fs.writeFileSync(REPORT, text)
console.log(text.split('\n').slice(0, 6).join('\n'))
for (const f of failed) console.log(`FAIL [${f.group}] ${f.url}  expected ${f.expect}  got ${f.got}`)
if (!failed.length) console.log('ALL CHECKS PASSED')
process.exit(failed.length ? 1 : 0)
