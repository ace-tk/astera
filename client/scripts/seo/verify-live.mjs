// Runs the SEO acceptance checks against a LIVE site (default https://atoopv.com) and writes a
// Markdown test report — the report the client asked for: for every URL of the redirect map, Annex A
// and 5 invented URLs, the HTTP status and the final URL, plus raw-HTML title/canonical samples.
//
//   node scripts/seo/verify-live.mjs [--site https://atoopv.com] [--report live-seo-report.md]
//
// Read-only: plain GET requests, redirects are NOT followed (the first hop is what is checked).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { REDIRECTS, PREFIX_REDIRECTS, GONE, INVENTED_404 } from './redirectMap.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const SITE = arg('site', 'https://atoopv.com').replace(/\/$/, '')
const REPORT = arg('report', 'live-seo-report.md')
const ANNEX_A = JSON.parse(fs.readFileSync(path.join(here, 'annexA.json'), 'utf8'))

const get = async (p) => {
  const res = await fetch(`${SITE}${p}`, { redirect: 'manual', headers: { 'User-Agent': 'atoopv-seo-verify/1.0' }, signal: AbortSignal.timeout(20000) })
  const body = res.status === 200 ? await res.text() : ''
  return { status: res.status, location: res.headers.get('location') || '', body, hostFirewall: Boolean(res.headers.get('tiger-protect-security')) }
}
const rows = []
const pool = async (items, n, fn) => { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()) })) }
const add = (group, url, expect, got, ok, note = '', warn = false) => rows.push({ group, url, expect, got, ok, note, warn })
const check = async (group, p, status, loc = null) => {
  try {
    const r = await get(p)
    const ok = r.status === status && (loc === null || r.location === loc)
    // O2Switch's TigerProtect answers a few well-known attack paths (wp-login.php, xmlrpc.php) with its
    // own 503/403 "security check" BEFORE Apache/.htaccess is reached — not something the site can change.
    const warn = !ok && r.hostFirewall
    add(group, p, `${status}${loc ? ` → ${loc}` : ''}`, `${r.status}${r.location ? ` → ${r.location}` : ''}`, ok, warn ? 'host firewall (TigerProtect) answers before .htaccess' : '', warn)
    return r
  } catch (e) {
    add(group, p, String(status), `ERROR ${e.message}`, false)
  }
}
const jobs = []
const G = (fn) => jobs.push(fn)

for (const r of REDIRECTS) for (const from of r.from) for (const s of ['', '/']) G(() => check('301 legacy → target', `/${from}${s}`, 301, `${SITE}${r.to}`))
for (const p of PREFIX_REDIRECTS) {
  const sample = p.exact ? `/${p.prefix}` : `/${p.prefix}exemple-xyz`
  G(() => check('301 prefix rules', sample, 301, `${SITE}${p.to}`))
}
for (const g of GONE.exact) { G(() => check('410 gone', `/${g}`, 410)); G(() => check('410 gone', `/${g}/`, 410)) }
for (const g of ['Plan-du-site/', 'author/loine-alami/', 'author/loine-alami/feed/', 'feed/', 'ressources/feed/', 'wp-login.php', 'wp-admin/admin-ajax.php', 'wp-content/uploads/a.jpg', 'wp-json/sureforms/v1/geo-country', 'wp-includes/x.js', 'xmlrpc.php']) G(() => check('410 gone', `/${g}`, 410))
for (const p of ['a-propos', 'contact', 'tarification', 'autodiagnostic', 'atoosavoir', 'atoosavoir/cgv', 'mentions-legales', 'politique-de-confidentialite']) G(() => check('301 trailing slash', `/${p}/`, 301, `${SITE}/${p}`))
G(() => check('query string kept', '/redaction-pv-cse/?utm_source=nl', 301, `${SITE}/services/drafting/redaction-pv-cse?utm_source=nl`))
for (const p of INVENTED_404) G(() => check('404 invented URLs', `/${p}`, 404))

// Annex A of the brief (36 URLs reported by Search Console)
for (const row of ANNEX_A) {
  const concrete = row.url === '/wp-*.php' ? '/wp-login.php' : row.url.startsWith('/*') ? '/page-generique-introuvable' : row.url
  const key = concrete.replace(/\/$/, '').replace(/^\//, '')
  const grp = 'Annex A (36 URLs from Search Console)'
  if (/410/.test(row.coveredBy)) G(() => check(grp, concrete, 410))
  else if (/must return 200/.test(row.coveredBy)) G(() => check(grp, concrete, 200))
  else if (/must return 404/.test(row.coveredBy)) G(() => check(grp, concrete, 404))
  else {
    const m = REDIRECTS.find((r) => r.from.includes(key))
    const pf = PREFIX_REDIRECTS.find((p) => (p.exact ? key === p.prefix : key.startsWith(p.prefix)))
    const target = m ? m.to : pf ? pf.to : /trailing slash/.test(row.coveredBy) ? `/${key}` : null
    G(() => check(grp, concrete, 301, `${SITE}${target}`))
  }
}
await pool(jobs, 6, (f) => f())

// redirect targets must answer 200
const targets = [...new Set([...REDIRECTS.map((r) => r.to), ...PREFIX_REDIRECTS.map((p) => p.to)])]
await pool(targets, 6, async (t) => { await check('redirect targets answer 200', t, 200) })

// sitemap: every URL answers 200; 5 samples show their own raw <title> / canonical
const sm = await (await fetch(`${SITE}/sitemap.xml`)).text()
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
await pool(urls, 6, async (u) => { await check('sitemap URL answers 200', u, 200) })
const samples = ['/', '/tarification', '/services/drafting/redaction-pv-cse', '/ressources/proces-verbal', '/services/by-city/redaction-pv-cse-lyon']
const rawRows = []
for (const s of samples) {
  const r = await get(s)
  const title = (r.body.match(/<title>([^<]*)<\/title>/) || [])[1] || ''
  const canonical = (r.body.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || ''
  const h1 = (r.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() || ''
  // The canonical always names the PRODUCTION host (a staging copy must not claim to be the original).
  const expected = `https://atoopv.com${s === '/' ? '/' : s}`
  const ok = Boolean(title) && canonical === expected && Boolean(h1) && !(s !== '/' && title.startsWith('Rédaction de PV de CSE et de CSSCT par des spécialistes'))
  rawRows.push({ s, title, canonical, h1, ok })
}

const warned = rows.filter((r) => !r.ok && r.warn)
const failed = rows.filter((r) => !r.ok && !r.warn)
const total = rows.length + rawRows.length
const out = [`# Live SEO test report — ${SITE}`, '', `Run: ${new Date().toISOString()}`, '', `**${total - failed.length - warned.length - rawRows.filter((r) => !r.ok).length}/${total} checks passed**${warned.length ? ` · ${warned.length} answered by the hosting firewall (see note)` : ''}${failed.length || rawRows.some((r) => !r.ok) ? ' — SEE FAILURES' : ''}`, '', '_Redirects are not followed: the status and Location of the FIRST response are reported (one hop)._', '']
for (const g of [...new Set(rows.map((r) => r.group))]) {
  const gr = rows.filter((r) => r.group === g)
  out.push(`## ${g} — ${gr.filter((r) => r.ok).length}/${gr.length}`, '', '| URL | expected | got | |', '|---|---|---|---|')
  for (const r of gr.sort((a, b) => a.url.localeCompare(b.url))) out.push(`| \`${r.url}\` | ${r.expect} | ${r.got} | ${r.ok ? '✓' : r.warn ? `⚠ ${r.note}` : '✗'} |`)
  out.push('')
}
out.push(`## Raw HTML of 5 sitemap URLs (what curl / Bing / social bots see, no JavaScript) — ${rawRows.filter((r) => r.ok).length}/${rawRows.length}`, '', '| URL | title | canonical | H1 | |', '|---|---|---|---|---|')
for (const r of rawRows) out.push(`| \`${r.s}\` | ${r.title} | ${r.canonical} | ${r.h1} | ${r.ok ? '✓' : '✗'} |`)
fs.writeFileSync(REPORT, `${out.join('\n')}\n`)
console.log(out.slice(0, 5).join('\n'))
for (const w of warned) console.log(`WARN [${w.group}] ${w.url} expected ${w.expect} got ${w.got} (host firewall)`)
for (const f of failed) console.log(`FAIL [${f.group}] ${f.url} expected ${f.expect} got ${f.got}`)
for (const r of rawRows.filter((x) => !x.ok)) console.log(`FAIL [raw html] ${r.s} title="${r.title}" canonical="${r.canonical}" h1="${r.h1}"`)
process.exit(failed.length || rawRows.some((r) => !r.ok) ? 1 : 0)
