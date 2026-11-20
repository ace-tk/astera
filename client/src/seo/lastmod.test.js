import { describe, it, expect } from 'vitest'
import { resolveLastmods, KEY_BY_PATH, HUB_CHILDREN, ymd } from '../../scripts/seo/lastmod.mjs'
import { SITE_PAGES } from '@/cms/sitePageRegistry'

describe('sitemap <lastmod>', () => {
  it('KEY_BY_PATH matches the editable site pages of the app', () => {
    const real = Object.fromEntries(Object.entries(SITE_PAGES).map(([key, p]) => [p.path, key]))
    expect(KEY_BY_PATH).toEqual(real)
  })

  const urls = ['/', '/contact', '/services', '/services/by-city', '/services/by-city/paris', '/services/by-city/lyon', '/services/guides', '/services/guides/a', '/ressources', '/ressources/x']
  const cmsDates = new Map([
    ['/services/by-city/paris', '2026-11-17T13:58:53.212Z'],
    ['/services/by-city/lyon', '2026-11-05T10:00:00.000Z'],
    ['/services/guides/a', '2026-10-20T09:00:00.000Z'],
    ['/ressources/x', '2026-11-12T09:00:00.000Z'],
  ])
  const dates = { sitePages: { contact: '2026-09-01T08:00:00.000Z', accueil: '2026-10-01T08:00:00.000Z', 'hub-services': '2026-08-01T08:00:00.000Z' }, homeHero: '2026-10-15T08:00:00.000Z' }

  it('a CMS page uses its own updatedAt, a site page its publish date', () => {
    const m = resolveLastmods({ urls, cmsDates, dates })
    expect(m.get('/services/by-city/paris')).toBe('2026-11-17')
    expect(m.get('/contact')).toBe('2026-09-01')
  })

  it('the home page counts the home hero too', () => {
    expect(resolveLastmods({ urls, cmsDates, dates }).get('/')).toBe('2026-10-15')
  })

  it('a hub takes the most recent date among itself and its children', () => {
    const m = resolveLastmods({ urls, cmsDates, dates })
    expect(m.get('/services/by-city')).toBe('2026-11-17')   // no own date: newest child
    expect(m.get('/services/guides')).toBe('2026-10-20')
    expect(m.get('/services')).toBe('2026-11-17')           // own 2026-08-01 < newest of every child
    expect(m.get('/ressources')).toBe('2026-11-12')
  })

  it('a page never edited in the admin falls back to the date of its source file', () => {
    const m = resolveLastmods({ urls: ['/boutique'], cmsDates: new Map(), dates: { sitePages: {} }, fallback: (k) => (k === 'boutique' ? '2026-09-28T10:00:00+02:00' : null) })
    expect(m.get('/boutique')).toBe('2026-09-28')
  })

  it('an unknown URL without any source stays null (the generator reports it)', () => {
    expect(resolveLastmods({ urls: ['/mystery'], cmsDates: new Map(), dates: {} }).get('/mystery')).toBeNull()
    expect(ymd(null)).toBeNull()
  })

  it('every hub prefix list is a list of path prefixes', () => {
    for (const [hub, prefixes] of Object.entries(HUB_CHILDREN)) for (const p of prefixes) expect(p.startsWith('/') && p.endsWith('/'), hub).toBe(true)
  })
})
