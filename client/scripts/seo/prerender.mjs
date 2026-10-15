// Pre-renders every public URL of dist/ so the RAW HTML (what curl, Bing, AI crawlers and social
// previews see — no JavaScript) carries the page's own <title>, meta description, canonical,
// Open Graph tags, H1 and text. Then writes the release .htaccess that turns the pre-rendered
// files into the server's list of valid URLs (real HTTP 404 for everything else).
//
//   npm run build:release        (= vite build → this script)
//
// How: the built app is served from a throw-away local server, every URL of sitemap.xml is opened
// in headless Chromium, the finished DOM is saved as dist/_pre/<route>.html. API calls the app
// makes (published CMS content) go to the real, public, read-only API — GET only, each URL fetched
// once and cached for the run so a ~100 page build costs ~150 API requests, not thousands.
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { buildHtaccess } from './htaccess.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const clientRoot = path.resolve(here, '../..')
const DIST = path.join(clientRoot, 'dist')
const PRE = path.join(DIST, '_pre')
const SITE = 'https://atoopv.com'
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY || 3)
const NOT_FOUND_PROBE = '/__prerender-not-found__'
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml', '.mp4': 'video/mp4' }

if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error('dist/index.html not found — run `vite build` first.'); process.exit(1) }
fs.rmSync(PRE, { recursive: true, force: true })

/* ---- routes = the sitemap (the SAME source the brief asks for) ---- */
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8')
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
if (!routes.length) { console.error('sitemap.xml lists no URL'); process.exit(1) }

/* ---- throw-away static server (SPA fallback) ---- */
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = path.join(DIST, urlPath)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const ORIGIN = `http://127.0.0.1:${server.address().port}`

/* ---- API: public, read-only, cached ---- */
const apiCache = new Map()
async function apiGet(url) {
  if (!apiCache.has(url)) {
    apiCache.set(url, fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) }).then(async (r) => ({ status: r.status, type: r.headers.get('content-type') || 'application/json', body: Buffer.from(await r.arrayBuffer()) })))
  }
  return apiCache.get(url)
}

const browser = await chromium.launch()
const results = []
const problems = []

async function renderRoute(route, { probe = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.route('**/*', async (r) => {
    const req = r.request()
    const u = req.url()
    if (u.startsWith(ORIGIN) || u.startsWith('data:') || u.startsWith('blob:')) return r.continue()
    if (/^https:\/\/api\.atoopv\.com\//.test(u)) {
      if (req.method() !== 'GET' || u.includes('socket.io')) return r.abort()
      try {
        const a = await apiGet(u)
        return r.fulfill({ status: a.status, body: a.body, headers: { 'content-type': a.type, 'access-control-allow-origin': '*' } })
      } catch {
        return r.abort()
      }
    }
    // third parties (fonts, analytics…) are not needed to know what the page says
    return r.abort()
  })
  try {
    await page.goto(`${ORIGIN}${route}`, { waitUntil: 'load', timeout: 40000 })
    await page.waitForFunction(() => document.querySelector('h1') && document.querySelector('link[rel="canonical"]'), null, { timeout: 25000 })
    // let CMS content / lazy chunks / metadata effects land: wait for the DOM to stop changing
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          let t = setTimeout(done, 900)
          const cap = setTimeout(done, 10000)
          const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(done, 900) })
          mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true })
          function done() { mo.disconnect(); clearTimeout(t); clearTimeout(cap); resolve() }
        }),
    )
    const snap = await page.evaluate(() => {
      const meta = (sel) => document.querySelector(sel)?.getAttribute('content') || ''
      document.documentElement.removeAttribute('style')
      document.body.removeAttribute('style')
      return {
        html: `<!doctype html>\n${document.documentElement.outerHTML}`,
        title: document.title,
        description: meta('meta[name="description"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        ogUrl: meta('meta[property="og:url"]'),
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        textLength: (document.getElementById('root')?.innerText || '').length,
      }
    })
    return snap
  } finally {
    await ctx.close()
  }
}

const fileFor = (route) => (route === '/' ? path.join(PRE, 'index.html') : path.join(PRE, `${route.replace(/^\//, '')}.html`))

const queue = [...routes]
let homeTitle = null
async function worker() {
  while (queue.length) {
    const route = queue.shift()
    try {
      const s = await renderRoute(route)
      const expected = `${SITE}${route === '/' ? '/' : route}`
      const issues = []
      if (!s.title) issues.push('empty <title>')
      if (!s.description) issues.push('empty meta description')
      if (s.canonical !== expected) issues.push(`canonical is ${s.canonical || '(none)'}, expected ${expected}`)
      if (s.ogUrl !== expected) issues.push(`og:url is ${s.ogUrl || '(none)'}`)
      if (!s.h1) issues.push('no <h1>')
      if (s.textLength < 300) issues.push(`only ${s.textLength} characters of text`)
      if (route === '/') homeTitle = s.title
      fs.mkdirSync(path.dirname(fileFor(route)), { recursive: true })
      fs.writeFileSync(fileFor(route), s.html)
      results.push({ route, title: s.title, issues })
      if (issues.length) problems.push({ route, issues })
      process.stdout.write(`${issues.length ? '✗' : '✓'} ${route}\n`)
    } catch (err) {
      problems.push({ route, issues: [`render failed: ${err.message.split('\n')[0]}`] })
      process.stdout.write(`✗ ${route} — ${err.message.split('\n')[0]}\n`)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

/* ---- the 404 screen (served with a real 404 status by .htaccess) ---- */
try {
  const nf = await renderRoute(NOT_FOUND_PROBE)
  // the probe URL must not leak into the file
  const cleaned = nf.html
    .replace(/<link[^>]*rel="canonical"[^>]*>\s*/g, '')
    .replace(/<meta[^>]*property="og:url"[^>]*>\s*/g, '')
    .replace(new RegExp(NOT_FOUND_PROBE, 'g'), '')
  fs.writeFileSync(path.join(PRE, '404.html'), cleaned)
  process.stdout.write('✓ 404 screen\n')
} catch (err) {
  problems.push({ route: '(404 screen)', issues: [`render failed: ${err.message.split('\n')[0]}`] })
}

await browser.close()
server.close()

/* ---- the shell (index.html) serves client-rendered areas only: it must not claim the homepage canonical ---- */
const shellFile = path.join(DIST, 'index.html')
fs.writeFileSync(
  shellFile,
  fs.readFileSync(shellFile, 'utf8').replace(/\s*<link rel="canonical"[^>]*>/g, '').replace(/\s*<meta property="og:url"[^>]*>/g, ''),
)

/* ---- every page published in the CMS must have been pre-rendered, otherwise the server answers 404 for it ---- */
try {
  const api = (process.env.VITE_API_URL || 'https://api.atoopv.com/api').replace(/\/$/, '')
  const res = await fetch(`${api}/cms/index`, { signal: AbortSignal.timeout(20000) })
  if (res.ok) {
    const { pages } = await res.json()
    const known = new Set(routes)
    const unknown = pages.filter((p) => !p.isHub && !known.has(p.path) && /^\/(services\/[a-z-]+|ressources)\/[a-z0-9-]+$/.test(p.path)).map((p) => p.path)
    if (unknown.length) problems.push({ route: '(CMS vs release)', issues: unknown.map((u) => `published in the CMS but not pre-rendered (would answer 404): ${u}`) })
  }
} catch { /* the sitemap step already required the CMS in strict mode */ }

/* ---- manifest + release .htaccess ---- */
const manifest = routes.slice().sort()
fs.writeFileSync(path.join(PRE, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
fs.writeFileSync(path.join(DIST, '.htaccess'), buildHtaccess({ mode: 'release', origin: process.env.SEO_ORIGIN ?? SITE }))

console.log(`\n${results.length - problems.filter((p) => results.find((r) => r.route === p.route)).length}/${routes.length} routes pre-rendered cleanly`)
if (problems.length) {
  console.log('\nPROBLEMS:')
  for (const p of problems) console.log(`  ${p.route}\n    - ${p.issues.join('\n    - ')}`)
  process.exit(1)
}
