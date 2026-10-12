import { describe, it, expect } from 'vitest'
import { buildHtaccess, CLIENT_RENDERED_AREAS } from '../../scripts/seo/htaccess.mjs'
import { REDIRECTS, PREFIX_REDIRECTS, GONE } from '../../scripts/seo/redirectMap.mjs'
import { seoMeta } from '@/cms/useSitePage'

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
