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

// Communication batch: content/communication/*.md minus the hub page (`communication-cse`, the
// section's own index route: App.jsx's index route passes slug="communication-cse" directly via a
// prop, which ServiceArticle.jsx turns into `hub: true` — forcing bundled content at that specific
// URL regardless of CMS migration/cutover, same mechanism as every other category's hub, e.g.
// training's `formations-elus-cse-agree`). `communication-cse` ALSO renders `FragmentsToDocument`
// (constants/fragmentsIntros.js COMMUNICATION_FRAGMENTS) above its hero — real editorial text (theme
// names, delivery format/timing, the closing statement) mixed with pure animation geometry, exactly
// like formation-economique-elus-cse. Unlike that page, communication-cse is a hub: even if its own
// body were imported and its FragmentsToDocument text made admin-editable via the SAME
// fragmentsIntroContainer.js mechanism (already pre-registered for this slug), the edit would only
// ever be visible at /services/communication/communication-cse — never at the bare
// /services/communication URL that `hub: true` structurally forces to bundled — because the hub
// route ignores the CMS by design, not because of anything migration-specific. Making the bare hub
// URL respect an edit would mean changing ServiceArticle.jsx's hub/slugProp routing itself, which is
// a new mechanism, not a reuse of the proven container/fragments-intro pattern — so, per instructions,
// this is flagged and left OUT of this batch rather than invented. The 3 leaf pages below have no
// such entanglement and migrate normally.
const BATCH = ['communication-asc', 'guide-du-comite', 'newsletter-actucse']
const EXPECTED = {
  'communication-asc': { menu: { menuId: 'formations', groupId: 'communication-du-cse' }, stats: 4, topics: 4, topicsLayout: 'journey', afterTopics: true, faq: 0 },
  'guide-du-comite': { menu: { menuId: 'ressources', groupId: 'guides-abonnements' }, stats: 4, topics: 4, topicsLayout: 'modules', afterTopics: true, faq: 0 },
  'newsletter-actucse': { menu: { menuId: 'ressources', groupId: 'guides-abonnements' }, stats: 4, topics: 0, topicsLayout: null, afterTopics: false, faq: 4 },
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

describe('dry-run report — communication batch', () => {
  it('is read-only: writes nothing, however many times it runs', async () => {
    await planContainerMigration(BATCH)
    await planContainerMigration(BATCH)
    expect(await Page.countDocuments()).toBe(0)
  })

  it('excludes the hub page (communication-cse) with a clear reason', async () => {
    const report = await planContainerMigration(['communication-cse', ...BATCH])
    const hub = report.find((r) => r.slug === 'communication-cse')
    expect(hub.ok).toBe(false)
    expect(hub.reason).toBe('Hub pages are not imported in Phase 1')
  })

  it('reports all 3 pages as safe and lossless, with the exact Stats/Topics/FAQ this section actually has', async () => {
    const report = await planContainerMigration(BATCH)
    expect(report).toHaveLength(3)
    for (const r of report) {
      const exp = EXPECTED[r.slug]
      expect(r.losslessRoundTrip, r.slug).toBe(true)
      expect(r.risk, r.slug).toBe('none')
      expect(r.diffAt, r.slug).toBeNull()
      expect(r.section).toBe('communication')
      expect(r.skin).toBe('formations')
      expect(r.menuPlacement, r.slug).toMatchObject(exp.menu)
      expect(r.containers).toMatchObject({ stats: exp.stats, topics: exp.topics, topicsLayout: exp.topicsLayout, faq: exp.faq, hasContentAfterTopics: exp.afterTopics })
    }
  })

  it('communication-asc and guide-du-comite have content after their topics; newsletter-actucse has none but has a FAQ instead — richTextFields reflects exactly that', async () => {
    const report = await planContainerMigration(BATCH)
    const byslug = Object.fromEntries(report.map((r) => [r.slug, r]))
    expect(byslug['communication-asc'].richTextFields).toEqual(['intro', 'main', 'afterTopics'])
    expect(byslug['guide-du-comite'].richTextFields).toEqual(['intro', 'main', 'afterTopics'])
    expect(byslug['newsletter-actucse'].richTextFields).toEqual(['intro', 'main']) // FAQ has its own after-slot, checked separately
  })

  it('every page IS linked from the mega menu as a hardcoded ROUTE (never a page reference) — per the tarifs-infos correction, page.menu must stay null for all 3, not just some — and two of them sit under the Ressources menu even though their section is "communication"', async () => {
    const report = await planContainerMigration(BATCH)
    for (const r of report) expect(r.menuPlacement, r.slug).not.toBeNull() // informational only — see the end-to-end tests: none of these get page.menu patched
    const byslug = Object.fromEntries(report.map((r) => [r.slug, r]))
    expect(byslug['communication-asc'].menuPlacement.menuLabel).toBe('Formations')
    expect(byslug['guide-du-comite'].menuPlacement.menuLabel).toBe('Ressources')
    expect(byslug['newsletter-actucse'].menuPlacement.menuLabel).toBe('Ressources')
  })

  it('flags communication-cse’s FragmentsToDocument intro as hardcoded content OUTSIDE the body — correctly NOT part of any container, and NOT silently dropped — even though the page itself is excluded as a hub', async () => {
    // communication-cse is a hub, so it is never planImport-safe; this only proves that if its body
    // were ever inspected on its own (e.g. a future decision to unhub it), the fragments-intro text
    // (theme names, delivery timing, the closing statement) is still not part of the body containers.
    const found = (await import('../src/cms/migrate/importServiceArticles.js')).CONTENT_ROOT
    const fs = await import('node:fs')
    const path = await import('node:path')
    const body = fs.readFileSync(path.join(found, 'communication', 'communication-cse.md'), 'utf8')
    expect(body).not.toMatch(/FICHE COMMUNICATION|L’un fait foi/)
  })
})

describe('end to end (isolated in-memory database — never production): import → menu (left null, per the correction) → publish/unpublish → preview', () => {
  it('imports via the EXISTING, unmodified import tool; content is byte-identical; page.menu is null for every page', async () => {
    const plan = await planImport(BATCH)
    expect(plan.every((p) => p.ok)).toBe(true)
    const { results } = await applyImport(plan)
    expect(results.every((r) => r.status === 'imported')).toBe(true)
    expect(await Page.countDocuments()).toBe(3)
    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      expect(page.status).toBe('published')
      expect(page.live.content.body).toBe(page.draft.content.body)
      expect(page.menu).toMatchObject({ menuId: null, groupId: null })
    }
  })

  it('the mega menu (built with the REAL navigation data) shows every one of the 3 pages exactly once — no duplicates, since page.menu was never patched', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(BATCH)
    await applyImport(plan)

    const nav = (await request(app).get('/api/cms/navigation')).body
    const formations = nav.menu.items.find((i) => i.id === 'formations')
    const ressources = nav.menu.items.find((i) => i.id === 'ressources')
    expect(formations.kind).toBe('mega')
    expect(ressources.kind).toBe('mega')
    const allHrefs = [...formations.groups, ...ressources.groups].flatMap((g) => g.entries.map((e) => e.href))
    for (const slug of BATCH) {
      const href = `/services/communication/${slug}`
      expect(allHrefs.filter((h2) => h2 === href), slug).toHaveLength(1) // exactly once, never duplicated
    }
    const commGroup = formations.groups.find((g) => g.id === 'communication-du-cse').entries.map((e) => e.label)
    expect(commGroup).toEqual(['Communiquer avec les salariés', 'Valoriser vos ASC']) // built-in labels, unchanged
    const guidesGroup = ressources.groups.find((g) => g.id === 'guides-abonnements').entries.map((e) => e.label)
    expect(guidesGroup).toEqual(['Guides & livres blancs', 'Le guide du comité', 'Newsletter ActuCSE', 'Questions fréquentes'])
  })

  it('unpublishing a menu-linked communication page takes its CONTENT offline; the built-in route link is unaffected (same as before migration)', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(['guide-du-comite'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'guide-du-comite' })

    const before = (await request(app).get('/api/cms/navigation')).body
    const groupBefore = before.menu.items.find((i) => i.id === 'ressources').groups.find((g) => g.id === 'guides-abonnements')
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/communication/guide-du-comite' })).status).toBe(200)

    await request(app).post(`/api/admin/cms/pages/${page._id}/unpublish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/communication/guide-du-comite' })).status).toBe(404)
    const after = (await request(app).get('/api/cms/navigation')).body
    const groupAfter = after.menu.items.find((i) => i.id === 'ressources').groups.find((g) => g.id === 'guides-abonnements')
    expect(groupAfter).toEqual(groupBefore) // the hardcoded route link is byte-for-byte unaffected

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/communication/guide-du-comite' })).status).toBe(200)
  })

  it('preview shows the draft (with Stats/Topics/FAQ intact) before publishing, and publishing makes it live', async () => {
    const plan = await planImport(['newsletter-actucse'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'newsletter-actucse' })
    const h = await admin()

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Brouillon avec un tout autre contenu.' } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/services/communication/newsletter-actucse' })).body.page.content.body
    expect(stillLive).not.toBe('Brouillon avec un tout autre contenu.')

    const preview = await request(app).get(`/api/admin/cms/pages/${page._id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe('Brouillon avec un tout autre contenu.')
    expect(preview.body.page.preview).toBe(true)
    expect((await request(app).get(`/api/admin/cms/pages/${page._id}/preview`)).status).toBe(401) // preview needs auth

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/services/communication/newsletter-actucse' })).body.page.content.body
    expect(nowLive).toBe('Brouillon avec un tout autre contenu.')
  })

  it('side navigation: every migrated page is recognized as the SAME page already in the built-in list — no duplicate, nothing missing', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const section = nav.sections.communication
    expect(section.configured).toBe(false)
    const paths = section.entries.map((e) => e.to)
    for (const slug of BATCH) expect(paths).toContain(`/services/communication/${slug}`)
    expect(new Set(paths).size).toBe(paths.length)
    expect(nav.pages.filter((p) => p.section === 'communication').map((p) => p.slug).sort()).toEqual([...BATCH].sort())
  })
})
