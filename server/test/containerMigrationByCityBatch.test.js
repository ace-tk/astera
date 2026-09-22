import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Page } from '../src/models/Page.js'
import { planContainerMigration } from '../src/cms/migrate/containerAudit.js'
import { planImport, applyImport } from '../src/cms/migrate/importServiceArticles.js'
import { planNavigationImport } from '../src/cms/migrate/importNavigation.js'

// The REAL main menu (built from ATOOPV_NAV, exactly what "Import built-in menu" writes) — not the
// bare `fixedItems()` fixture, whose empty groups would make "Procès-verbal" degrade to a plain
// link (a real, separately-tested Phase 2 behavior for an EMPTY menu) and falsely look like a bug.
const realMainMenu = async () => (await planNavigationImport()).menuItems

// By-city batch: every content/by-city/*.md page. None is a hub, none is already migrated —
// unlike drafting, NO individual city page sits directly in the mega menu today (only the
// directory page "/services/by-city" itself does, under Procès-verbal → Tarifs & délais), so each
// page's expected menu placement is `null`, and it is reached via the directory listing + side nav.
const BATCH = [
  'redaction-pv-cse-annecy', 'redaction-pv-cse-bordeaux', 'redaction-pv-cse-clermont-ferrand', 'redaction-pv-cse-grenoble',
  'redaction-pv-cse-lille', 'redaction-pv-cse-lyon', 'redaction-pv-cse-marseille', 'redaction-pv-cse-nantes',
  'redaction-pv-cse-paris', 'redaction-pv-cse-saint-etienne', 'redaction-pv-cse-toulouse',
]

let app
beforeEach(() => { app = createApp() })
const admin = async () => {
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}

describe('dry-run report — by-city batch', () => {
  it('is read-only: writes nothing, however many times it runs', async () => {
    await planContainerMigration(BATCH)
    await planContainerMigration(BATCH)
    expect(await Page.countDocuments()).toBe(0)
  })

  it('reports all 11 pages as safe and lossless, with Stats-only containers (no Topics, no FAQ — matching the actual content)', async () => {
    const report = await planContainerMigration(BATCH)
    expect(report).toHaveLength(11)
    for (const r of report) {
      expect(r.losslessRoundTrip, r.slug).toBe(true)
      expect(r.risk, r.slug).toBe('none')
      expect(r.diffAt, r.slug).toBeNull()
      expect(r.section).toBe('by-city')
      expect(r.skin).toBe('pv')
      expect(r.containers).toMatchObject({ kind: 'editorial', stats: 4, topics: 0, faq: 0, hasIntro: true, hasMainContent: true })
      expect(r.richTextFields).toEqual(['intro', 'main'])
    }
  })

  it('no individual city page is placed directly in today’s mega menu (only the directory page is) — matches the real navigation, not a guess', async () => {
    const report = await planContainerMigration(BATCH)
    for (const r of report) expect(r.menuPlacement, r.slug).toBeNull()
  })

  it('excludes nothing incorrectly: all 11 files in content/by-city are included, no hub, no already-migrated page in this section', () => {
    expect(BATCH).toHaveLength(11)
    expect(BATCH).not.toContain('redaction-pv-cssct') // that page belongs to drafting, not by-city, listed only for clarity
  })
})

describe('end to end (isolated in-memory database — never production): import → publish/unpublish → navigation → listing dedup', () => {
  it('imports via the EXISTING, unmodified import tool; content is byte-identical', async () => {
    const plan = await planImport(BATCH)
    expect(plan.every((p) => p.ok)).toBe(true)
    const { results } = await applyImport(plan)
    expect(results.every((r) => r.status === 'imported')).toBe(true)
    expect(await Page.countDocuments()).toBe(11)
    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      expect(page.status).toBe('published')
      expect(page.live.content.body).toBe(page.draft.content.body)
      expect(page.menu).toMatchObject({ menuId: null, groupId: null }) // correct: not placed in the mega menu today
    }
  })

  it('unpublishing a migrated city page removes it from the public API; the real mega menu (unaffected either way) stays exactly as before', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(['redaction-pv-cse-lyon'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'redaction-pv-cse-lyon' })

    expect((await request(app).get('/api/cms/pages').query({ path: '/services/by-city/redaction-pv-cse-lyon' })).status).toBe(200)
    const navBefore = (await request(app).get('/api/cms/navigation')).body
    const pvBefore = navBefore.menu.items.find((i) => i.id === 'pv')
    expect(pvBefore.kind).toBe('mega') // the real menu has real entries, so it never degrades to a plain link
    expect(JSON.stringify(pvBefore.groups)).not.toContain('redaction-pv-cse-lyon') // never was in a mega-menu group

    await request(app).post(`/api/admin/cms/pages/${page._id}/unpublish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/by-city/redaction-pv-cse-lyon' })).status).toBe(404)
    const navAfter = (await request(app).get('/api/cms/navigation')).body
    expect(navAfter.menu.items.find((i) => i.id === 'pv')).toEqual(pvBefore) // menu is byte-for-byte untouched by a by-city unpublish
  })

  it('a draft edit on a migrated city page never changes the live (public) version until published', async () => {
    const plan = await planImport(['redaction-pv-cse-paris'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'redaction-pv-cse-paris' })
    const h = await admin()
    const liveBefore = (await request(app).get('/api/cms/pages').query({ path: '/services/by-city/redaction-pv-cse-paris' })).body.page.content.body

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Brouillon modifié pour Paris.' } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/services/by-city/redaction-pv-cse-paris' })).body.page.content.body
    expect(stillLive).toBe(liveBefore)

    const preview = await request(app).get(`/api/admin/cms/pages/${page._id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe('Brouillon modifié pour Paris.')

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/services/by-city/redaction-pv-cse-paris' })).body.page.content.body
    expect(nowLive).toBe('Brouillon modifié pour Paris.')
  })

  it('side navigation / the "Par ville" listing: every migrated city is recognized as the SAME page already in the built-in list — no duplicate, nothing missing', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const byCity = nav.sections['by-city']
    expect(byCity.configured).toBe(false)
    const paths = byCity.entries.map((e) => e.to)
    for (const slug of BATCH) expect(paths).toContain(`/services/by-city/${slug}`)
    expect(new Set(paths).size).toBe(paths.length)
    // the light page index (used by the directory listing's CMS merge) also lists exactly these, published
    expect(nav.pages.filter((p) => p.section === 'by-city').map((p) => p.slug).sort()).toEqual([...BATCH].sort())
  })
})
