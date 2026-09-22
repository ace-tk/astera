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

// Training batch: content/training/*.md minus the hub page (`formations-elus-cse-agree`, the
// section's own index route, which also drives the "à la carte" FormationIndex — out of scope,
// same rule as every other hub). This is the richest batch so far: every page has Stats, Topics
// AND (except one) FAQ, all with non-empty "content after topics".
//
// `formation-economique-elus-cse` ALSO renders `FragmentsToDocument` (constants/fragmentsIntros.js
// FORMATION_ECONOMIQUE_FRAGMENTS) above its hero. That object mixes real editorial text (module
// names, duration, financing, the closing statement) with pure animation geometry (stacked/readable/
// readableMobile/organized/converge x/y/rotate coordinates, phase names) that IS the component's
// motion design — not text. It is a SEPARATE hardcoded JS constant, never read from `page.body`, so
// it is UNAFFECTED by migrating the page's body — but making its own text admin-editable without
// touching the geometry/animation would need a brand-new, page-specific editing mechanism outside
// the proven container pattern. Per instructions, this is flagged and left OUT of this batch rather
// than inventing a solution; the page's BODY (stats/topics/afterTopics/FAQ) migrates normally.
const BATCH = ['formation-economique-elus-cse', 'formation-cse-tresorier', 'formation-cssct-roles-missions', 'formation-droit-social-contrat-travail', 'formation-pro-communication']
const EXPECTED = {
  'formation-economique-elus-cse': { menu: { menuId: 'formations', groupId: 'formations-des-elus' }, stats: 4, topics: 4, topicsLayout: 'explorer', afterTopics: true, faq: 4 },
  'formation-cse-tresorier': { menu: { menuId: 'formations', groupId: 'formations-des-elus' }, stats: 4, topics: 4, topicsLayout: 'journey', afterTopics: true, faq: 3 },
  'formation-cssct-roles-missions': { menu: { menuId: 'formations', groupId: 'formations-des-elus' }, stats: 4, topics: 4, topicsLayout: 'modules', afterTopics: true, faq: 3 },
  'formation-droit-social-contrat-travail': { menu: { menuId: 'formations', groupId: 'droit-pratique' }, stats: 4, topics: 4, topicsLayout: 'journey', afterTopics: true, faq: 3 },
  'formation-pro-communication': { menu: { menuId: 'formations', groupId: 'droit-pratique' }, stats: 4, topics: 4, topicsLayout: 'journey', afterTopics: true, faq: 3 },
}

// The REAL main menu (built from ATOOPV_NAV) — required by the tarifs-infos correction: every
// column link there is a hardcoded ROUTE, never a page reference, so `page.menu` must stay null.
const realMainMenu = async () => (await planNavigationImport()).menuItems

let app
beforeEach(() => { app = createApp() })
const admin = async () => {
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}

describe('dry-run report — training batch', () => {
  it('is read-only: writes nothing, however many times it runs', async () => {
    await planContainerMigration(BATCH)
    await planContainerMigration(BATCH)
    expect(await Page.countDocuments()).toBe(0)
  })

  it('excludes the hub page (formations-elus-cse-agree) with a clear reason', async () => {
    const report = await planContainerMigration(['formations-elus-cse-agree', ...BATCH])
    const hub = report.find((r) => r.slug === 'formations-elus-cse-agree')
    expect(hub.ok).toBe(false)
    expect(hub.reason).toBe('Hub pages are not imported in Phase 1')
  })

  it('reports all 5 pages as safe and lossless, with the exact Stats/Topics/FAQ this section actually has', async () => {
    const report = await planContainerMigration(BATCH)
    expect(report).toHaveLength(5)
    for (const r of report) {
      const exp = EXPECTED[r.slug]
      expect(r.losslessRoundTrip, r.slug).toBe(true)
      expect(r.risk, r.slug).toBe('none')
      expect(r.diffAt, r.slug).toBeNull()
      expect(r.section).toBe('training')
      expect(r.skin).toBe('formations')
      expect(r.menuPlacement, r.slug).toMatchObject(exp.menu)
      expect(r.containers).toMatchObject({ stats: exp.stats, topics: exp.topics, topicsLayout: exp.topicsLayout, faq: exp.faq, hasContentAfterTopics: exp.afterTopics })
      expect(r.richTextFields).toEqual(['intro', 'main', 'afterTopics']) // FAQ has its own after-slot, checked separately; none of these 5 use it
    }
  })

  it('every page IS linked from the mega menu as a hardcoded ROUTE (never a page reference) — per the tarifs-infos correction, page.menu must stay null for all 5, not just some', async () => {
    const report = await planContainerMigration(BATCH)
    for (const r of report) expect(r.menuPlacement, r.slug).not.toBeNull() // informational only — see the end-to-end tests: none of these get page.menu patched
  })

  it('flags formation-economique-elus-cse’s FragmentsToDocument intro as hardcoded content OUTSIDE the body — correctly NOT part of any container, and NOT silently dropped', async () => {
    const report = await planContainerMigration(['formation-economique-elus-cse'])
    const r = report[0]
    // The body-derived containers are exactly what the extractors find in the .md file — the
    // fragments-intro text (module names, "5 jours", "NDA 84740456974", the closing statement) is
    // NOT read from this body at all, so it correctly does not appear as a duplicate anywhere here.
    expect(r.containers.hasIntro).toBe(true)
    expect(JSON.stringify(r.containers)).not.toMatch(/NDA 84740456974|PROGRAMME STRUCTURÉ/)
  })
})

describe('end to end (isolated in-memory database — never production): import → menu (left null, per the correction) → publish/unpublish → preview', () => {
  it('imports via the EXISTING, unmodified import tool; content is byte-identical; page.menu is null for every page', async () => {
    const plan = await planImport(BATCH)
    expect(plan.every((p) => p.ok)).toBe(true)
    const { results } = await applyImport(plan)
    expect(results.every((r) => r.status === 'imported')).toBe(true)
    expect(await Page.countDocuments()).toBe(5)
    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      expect(page.status).toBe('published')
      expect(page.live.content.body).toBe(page.draft.content.body)
      expect(page.menu).toMatchObject({ menuId: null, groupId: null })
    }
  })

  it('the mega menu (built with the REAL navigation data) shows every one of the 5 pages exactly once — no duplicates, since page.menu was never patched', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(BATCH)
    await applyImport(plan)

    const nav = (await request(app).get('/api/cms/navigation')).body
    const formations = nav.menu.items.find((i) => i.id === 'formations')
    expect(formations.kind).toBe('mega')
    const allHrefs = formations.groups.flatMap((g) => g.entries.map((e) => e.href))
    for (const slug of BATCH) {
      const href = `/services/training/${slug}`
      expect(allHrefs.filter((h2) => h2 === href), slug).toHaveLength(1) // exactly once, never duplicated
    }
    const elus = formations.groups.find((g) => g.id === 'formations-des-elus').entries.map((e) => e.label)
    expect(elus).toEqual(['Formation économique', 'Trésorier du CSE', 'CSSCT — rôles et missions', 'Toutes nos formations agréées']) // built-in labels, unchanged
  })

  it('unpublishing a menu-linked training page takes its CONTENT offline; the built-in route link is unaffected (same as before migration)', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(['formation-cse-tresorier'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'formation-cse-tresorier' })

    const before = (await request(app).get('/api/cms/navigation')).body
    const groupBefore = before.menu.items.find((i) => i.id === 'formations').groups.find((g) => g.id === 'formations-des-elus')
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/training/formation-cse-tresorier' })).status).toBe(200)

    await request(app).post(`/api/admin/cms/pages/${page._id}/unpublish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/training/formation-cse-tresorier' })).status).toBe(404)
    const after = (await request(app).get('/api/cms/navigation')).body
    const groupAfter = after.menu.items.find((i) => i.id === 'formations').groups.find((g) => g.id === 'formations-des-elus')
    expect(groupAfter).toEqual(groupBefore) // the hardcoded route link is byte-for-byte unaffected

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/training/formation-cse-tresorier' })).status).toBe(200)
  })

  it('preview shows the draft (with Stats/Topics/FAQ intact) before publishing, and publishing makes it live', async () => {
    const plan = await planImport(['formation-cssct-roles-missions'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'formation-cssct-roles-missions' })
    const h = await admin()

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Brouillon avec un tout autre contenu.' } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/services/training/formation-cssct-roles-missions' })).body.page.content.body
    expect(stillLive).not.toBe('Brouillon avec un tout autre contenu.')

    const preview = await request(app).get(`/api/admin/cms/pages/${page._id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe('Brouillon avec un tout autre contenu.')
    expect(preview.body.page.preview).toBe(true)
    expect((await request(app).get(`/api/admin/cms/pages/${page._id}/preview`)).status).toBe(401) // preview needs auth

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/services/training/formation-cssct-roles-missions' })).body.page.content.body
    expect(nowLive).toBe('Brouillon avec un tout autre contenu.')
  })

  it('side navigation: every migrated page is recognized as the SAME page already in the built-in list — no duplicate, nothing missing', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const section = nav.sections.training
    expect(section.configured).toBe(false)
    const paths = section.entries.map((e) => e.to)
    for (const slug of BATCH) expect(paths).toContain(`/services/training/${slug}`)
    expect(new Set(paths).size).toBe(paths.length)
    expect(nav.pages.filter((p) => p.section === 'training').map((p) => p.slug).sort()).toEqual([...BATCH].sort())
  })
})
