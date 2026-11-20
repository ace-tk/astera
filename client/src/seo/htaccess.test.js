import { describe, it, expect } from 'vitest'
import { buildHtaccess, CLIENT_RENDERED_AREAS } from '../../scripts/seo/htaccess.mjs'
import { REDIRECTS, PREFIX_REDIRECTS, GONE } from '../../scripts/seo/redirectMap.mjs'
import { seoMeta } from '@/cms/useSitePage'
import { cleanRedirects } from '../../scripts/seo/cmsRedirects.mjs'

const base = buildHtaccess({ mode: 'base' })
const release = buildHtaccess({ mode: 'release' })
const directives = (s) => s.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'))

describe('SEO redirect map → .htaccess', () => {
  it('has one rule per legacy path, none twice, none pointing at itself', () => {
    const all = REDIRECTS.flatMap((r) => r.from)
    expect(new Set(all).size).toBe(all.length)
    for (const r of REDIRECTS) for (const f of r.from) expect(`/${f}`).not.toBe(r.to)
  })

  it('every target is an absolute path without a trailing slash (one hop, final URL)', () => {
    for (const r of REDIRECTS) {
      expect(r.to.startsWith('/')).toBe(true)
      expect(r.to === '/' || !r.to.endsWith('/')).toBe(true)
    }
    for (const p of PREFIX_REDIRECTS) expect(p.to.endsWith('/') && p.to !== '/').toBe(false)
  })

  it('no target is itself a legacy path (that would be a redirect chain)', () => {
    const legacy = new Set(REDIRECTS.flatMap((r) => r.from.map((f) => `/${f}`)))
    for (const r of REDIRECTS) expect(legacy.has(r.to), `${r.to} is both a target and a legacy URL`).toBe(false)
  })

  it('emits a 301 rule for every row, and the 410 rules', () => {
    for (const r of REDIRECTS) expect(base).toContain(`${r.to} [R=301,L]`)
    expect(base).toMatch(/\[G,NC,L\]/)
    for (const e of GONE.exact) expect(base).toContain(e)
  })

  it('the specific category rule comes before the generic category prefix', () => {
    expect(base.indexOf('^category/veille-juridique-cse')).toBeGreaterThan(-1)
    expect(base.indexOf('^category/veille-juridique-cse')).toBeLessThan(base.indexOf('RewriteRule ^category/ '))
  })

  it('legacy rules run before the www/https canonicalisation (one hop even from http://www)', () => {
    expect(base.indexOf('^redaction-pv-cse/?$')).toBeLessThan(base.indexOf('RewriteCond %{HTTP_HOST} ^www'))
  })

  it('never puts a comment on a directive line (Apache would reject the file)', () => {
    for (const l of directives(release)) expect(l, l).not.toMatch(/\s#\s/)
    for (const l of directives(base)) expect(l, l).not.toMatch(/\s#\s/)
  })

  it('base mode keeps the SPA fallback and has no 404 rule; release mode has real 404s and pre-render routing', () => {
    expect(base).toContain('RewriteRule ^ /index.html [L]')
    expect(base).not.toContain('R=404')
    expect(base).not.toContain('_pre')
    expect(release).toContain('RewriteRule ^ - [R=404,L]')
    expect(release).toContain('ErrorDocument 404 /_pre/404.html')
    expect(release).toContain('ErrorDocument 410 /_pre/404.html')
    expect(release).toContain('%{DOCUMENT_ROOT}/_pre/$1.html')
    for (const a of CLIENT_RENDERED_AREAS) expect(release).toContain(a)
  })

  it('an origin of "" produces host-relative targets (for a staging build)', () => {
    const staging = buildHtaccess({ mode: 'base', origin: '' })
    expect(staging).toContain('/services/drafting/redaction-pv-cse [R=301,L]')
    expect(staging).not.toContain('https://atoopv.com/services')
  })
})

describe('seoMeta — "Search & sharing" fields of a site page', () => {
  const fallback = { title: 'Derived title', description: 'Derived description' }
  it('keeps the derived title/description when the SEO fields are empty or missing', () => {
    expect(seoMeta({ seo: { title: '', description: '' } }, fallback)).toEqual(fallback)
    expect(seoMeta({}, fallback)).toEqual(fallback)
    expect(seoMeta(undefined, fallback)).toEqual(fallback)
  })
  it('uses a non-empty SEO title and/or description', () => {
    expect(seoMeta({ seo: { title: 'SEO', description: '' } }, fallback)).toEqual({ title: 'SEO', description: 'Derived description' })
    expect(seoMeta({ seo: { title: '', description: 'D' } }, fallback)).toEqual({ title: 'Derived title', description: 'D' })
  })
})

describe('redirects managed in the CMS', () => {
  const cms = [{ from: '/services/guides/ancien-guide', to: '/services/guides/pv-cse-contenu-obligatoire' }, { from: '/old.page', to: '/new' }]
  const out = buildHtaccess({ mode: 'release', cmsRedirects: cms })

  it('become one-hop 301 rules with or without a trailing slash, special characters escaped', () => {
    expect(out).toContain('RewriteRule ^services/guides/ancien-guide/?$ https://atoopv.com/services/guides/pv-cse-contenu-obligatoire [R=301,L]')
    expect(out).toContain('RewriteRule ^old\\.page/?$ https://atoopv.com/new [R=301,L]')
  })
  it('sit before the www/https rules and the pre-rendered whitelist', () => {
    expect(out.indexOf('ancien-guide/?$')).toBeLessThan(out.indexOf('# 3. www'))
    expect(out.indexOf('ancien-guide/?$')).toBeLessThan(out.indexOf('_pre/$1.html'))
  })
  it('add nothing when there are none, and skip a source that the map already redirects', () => {
    expect(buildHtaccess({ mode: 'base' })).not.toContain('# 2a.')
    const legacy = `/${REDIRECTS[0].from[0]}`
    expect(buildHtaccess({ mode: 'base', cmsRedirects: [{ from: legacy, to: '/x' }] })).not.toContain('# 2a.')
  })
  it('cleanRedirects drops malformed rows, duplicates, self-redirects and the home page', () => {
    const list = cleanRedirects([{ from: '/a', to: '/b' }, { from: '/a', to: '/c' }, { from: '/s', to: '/s' }, { from: '/', to: '/x' }, { from: 'https://evil.example', to: '/x' }, { from: '/sp ace', to: '/x' }, { from: '/ok', to: 'nope' }, null])
    expect(list).toEqual([{ from: '/a', to: '/b' }])
  })
})

describe('merged pages — the client table of 19 Nov (one page = one address)', () => {
  const rule = (path) => {
    const row = REDIRECTS.find((r) => r.from.includes(path.replace(/^\//, '')))
    return row ? row.to : undefined
  }
  const TABLE = {
    '/services/guides/qui-redige-pv-cse': '/services/tarifs-infos/redacteur-pv-cse',
    '/qui-redige-pv-cse': '/services/tarifs-infos/redacteur-pv-cse',
    '/contenu-pv-cse': '/services/guides/pv-cse-contenu-obligatoire',
    '/services/guides/contenu-pv-cse': '/services/guides/pv-cse-contenu-obligatoire',
    '/ressources/mentions-obligatoires-pv': '/services/guides/pv-cse-contenu-obligatoire',
    '/ressources/proces-verbal': '/services/guides/proces-verbal-cse',
  }
  it('redirects every address of the table to its kept page, in one hop', () => {
    for (const [from, to] of Object.entries(TABLE)) expect(rule(from), from).toBe(to)
  })
  it('the old WordPress addresses of the two ressources go to the kept page too, not through the hidden one', () => {
    expect(rule('/mentions-obligatoires-pv')).toBe('/services/guides/pv-cse-contenu-obligatoire')
    expect(rule('/proces-verbal')).toBe('/services/guides/proces-verbal-cse')
  })
  it('the pre-rename /atoopv/ form of an app address is one hop as well (not rewritten and redirected again)', () => {
    for (const [from, to] of Object.entries(TABLE)) {
      if (!from.slice(1).includes('/')) continue
      expect(base).toMatch(new RegExp(`RewriteRule \\^\\([^)]*atoopv/${from.slice(1).replace(/[/.]/g, '\\$&')}[^)]*\\)/\\?\\$ https://atoopv\\.com${to.replace(/[/.]/g, '\\$&')} \\[R=301,L\\]`))
    }
  })
  it('every redirect of the site is a 301 (never a 302), and the kept pages are not redirected', () => {
    // every flag that redirects: R, R=30x (R=404 is the "not found" rule, not a redirect)
    const redirectLines = directives(release).filter((l) => /[[,]R(=30\d)?[,\]]/.test(l))
    expect(redirectLines.length).toBeGreaterThan(50)
    for (const l of redirectLines) expect(l, l).toMatch(/R=301/)
    for (const kept of new Set(Object.values(TABLE))) expect(rule(kept), kept).toBeUndefined()
  })
  it('a CMS redirect that points at a merged page is rewritten to the kept page (no chain)', () => {
    const out = buildHtaccess({ mode: 'release', cmsRedirects: [{ from: '/atoopv/x', to: '/ressources/proces-verbal' }] })
    expect(out).toContain('https://atoopv.com/services/guides/proces-verbal-cse [R=301,L]')
    expect(out).not.toContain('atoopv.com/ressources/proces-verbal [R')
  })
})
