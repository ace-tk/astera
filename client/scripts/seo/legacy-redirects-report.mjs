// The client's item 7 (fix list 16 Oct): `curl -I` on every legacy URL of the redirect map — status code and
// Location for each — and proof that every redirect is ONE hop to a page that answers 200 (no chain).
//
//   node scripts/seo/legacy-redirects-report.mjs [--site https://atoopv.com] [--report legacy-redirects-report.md]
//
// Read-only. Each URL is requested with the real `curl -sI` (no redirect following), both in the form the old
// WordPress site used (trailing slash) and without; then the Location is requested once more to check it is 200.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { REDIRECTS, PREFIX_REDIRECTS } from './redirectMap.mjs'

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const SITE = arg('site', 'https://atoopv.com').replace(/\/$/, '')
const REPORT = arg('report', 'legacy-redirects-report.md')
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
function head(url) {
  const out = execFileSync('curl', ['-sI', '--max-time', '25', '-A', UA, url], { encoding: 'utf8' })
  const lines = out.split(/\r?\n/)
  const status = Number((lines[0].match(/HTTP\/[\d.]+\s+(\d{3})/) || [])[1] || 0)
  const location = (lines.find((l) => /^location:/i.test(l)) || '').replace(/^location:\s*/i, '').trim()
  return { status, location, raw: lines.filter((l) => l.trim()).slice(0, 4).join('\n') }
}

const tests = []
for (const r of REDIRECTS) for (const from of r.from) tests.push({ from, to: `${SITE}${r.to === '/' ? '/' : r.to}` })
for (const p of PREFIX_REDIRECTS) tests.push({ from: p.exact ? p.prefix : `${p.prefix}exemple-de-page`, to: `${SITE}${p.to}` })

const rows = []
const targets = new Map()
const final = (loc) => {
  if (!targets.has(loc)) targets.set(loc, head(loc))
  return targets.get(loc)
}
for (const t of tests) {
  for (const form of [`/${t.from}/`, `/${t.from}`]) {
    const h = head(`${SITE}${form}`)
    await sleep(250)
    const hop = h.location ? final(h.location.startsWith('http') ? h.location : `${SITE}${h.location}`) : null
    if (hop) await sleep(120)
    const ok = h.status === 301 && h.location === t.to && hop?.status === 200
    rows.push({ url: form, status: h.status, location: h.location, targetStatus: hop?.status ?? '—', ok, expected: t.to, raw: h.raw })
  }
}

const bad = rows.filter((r) => !r.ok)
const md = [
  `# Legacy redirects — \`curl -I\` report`,
  '',
  `Site: ${SITE} · Run: ${new Date().toISOString()} · ${tests.length} legacy URLs, each requested with and without the trailing slash (${rows.length} requests)`,
  '',
  `**${rows.length - bad.length}/${rows.length} are a single 301 to the expected page, which answers 200 (no chain).**`,
  '',
  bad.length ? `## Not as expected (${bad.length})\n\n${bad.map((r) => `- \`${r.url}\` → ${r.status} ${r.location} (expected 301 → ${r.expected}, target ${r.targetStatus})`).join('\n')}\n` : '',
  '## Every URL',
  '',
  '| URL | Status | Location | Target status | OK |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| \`${r.url}\` | ${r.status} | ${r.location} | ${r.targetStatus} | ${r.ok ? '✓' : '✗'} |`),
  '',
  '## Raw `curl -sI` answers (first lines)',
  '',
  ...rows.map((r) => `\`\`\`\n$ curl -sI ${SITE}${r.url}\n${r.raw}\n\`\`\``),
].join('\n')
fs.writeFileSync(REPORT, md)
console.log(`${rows.length - bad.length}/${rows.length} ok — report: ${REPORT}`)
for (const r of bad.slice(0, 20)) console.log(`✗ ${r.url} → ${r.status} ${r.location} (target ${r.targetStatus})`)
