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

// Tarifs & Infos batch: content/tarifs-infos/*.md minus the hub page (`tarif-redaction-pv-cse`,
// the section's own index route). This section is the first batch where "content after topics" is
// non-empty on real pages (delai-redaction-pv-cse, pv-cse-code-travail), and where one page IS
// placed directly in the mega menu (delai-redaction-pv-cse, under Procès-verbal → Tarifs & délais).
const BATCH = ['delai-redaction-pv-cse', 'pv-cse-code-travail', 'redacteur-pv-cse']
const EXPECTED = {
  'delai-redaction-pv-cse': { menu: { menuId: 'pv', groupId: 'tarifs-delais' }, stats: 4, topics: 2, topicsLayout: 'journey', afterTopics: true, faq: 0 },
  'pv-cse-code-travail': { menu: null, stats: 4, topics: 4, topicsLayout: 'explorer', afterTopics: true, faq: 0 },
  'redacteur-pv-cse': { menu: null, stats: 4, topics: 0, topicsLayout: null, afterTopics: false, faq: 0 },
}

// The REAL main menu (built from ATOOPV_NAV) — not an empty test fixture, whose empty groups would
// make "Procès-verbal" degrade to a plain link (a separately-tested Phase 2 behavior for an EMPTY
// menu) and falsely look like a bug, as found during the by-city batch.
const realMainMenu = async () => (await planNavigationImport()).menuItems

let app
beforeEach(() => { app = createApp() })
const admin = async () => {
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}

describe('dry-run report — tarifs-infos batch', () => {
  it('is read-only: writes nothing, however many times it runs', async () => {
    await planContainerMigration(BATCH)
    await planContainerMigration(BATCH)
    expect(await Page.countDocuments()).toBe(0)
  })

  it('excludes the hub page (tarif-redaction-pv-cse) with a clear reason', async () => {
    const report = await planContainerMigration(['tarif-redaction-pv-cse', ...BATCH])
    const hub = report.find((r) => r.slug === 'tarif-redaction-pv-cse')
    expect(hub.ok).toBe(false)
    expect(hub.reason).toBe('Hub pages are not imported in Phase 1')
  })

  it('reports all 3 pages as safe and lossless, with the exact containers this section actually has', async () => {
    const report = await planContainerMigration(BATCH)
    expect(report).toHaveLength(3)
    for (const r of report) {
      const exp = EXPECTED[r.slug]
      expect(r.losslessRoundTrip, r.slug).toBe(true)
      expect(r.risk, r.slug).toBe('none')
      expect(r.diffAt, r.slug).toBeNull()
      expect(r.section).toBe('tarifs-infos')
      expect(r.skin).toBe('pv')
      expect(r.menuPlacement, r.slug).toMatchObject(exp.menu || {})
      if (exp.menu === null) expect(r.menuPlacement).toBeNull()
      expect(r.containers).toMatchObject({ stats: exp.stats, topics: exp.topics, topicsLayout: exp.topicsLayout, faq: exp.faq, hasContentAfterTopics: exp.afterTopics })
    }
  })

  it('the two pages with a Topics block also correctly expose "content after topics" as a rich-text container', async () => {
    const report = await planContainerMigration(BATCH)
    const withAfter = report.filter((r) => r.containers.hasContentAfterTopics)
    expect(withAfter.map((r) => r.slug).sort()).toEqual(['delai-redaction-pv-cse', 'pv-cse-code-travail'])
    for (const r of withAfter) expect(r.richTextFields).toEqual(['intro', 'main', 'afterTopics'])
    const noTopics = report.find((r) => r.slug === 'redacteur-pv-cse')
    expect(noTopics.richTextFields).toEqual(['intro', 'main']) // no Topics block at all → no afterTopics container either
  })

  it('no slug-specific hardcoded frontend component (kinetic intro / fragments intro / enhanced info panel / à-la-carte index) applies to any of these 3 pages', () => {
    const SPECIAL_SLUGS = ['redaction-pv-cse', 'formation-economique-elus-cse', 'communication-cse', 'modele-pv-cse-gratuit', 'formations-elus-cse-agree']
    for (const slug of BATCH) expect(SPECIAL_SLUGS).not.toContain(slug)
  })
})

describe('end to end (isolated in-memory database — never production): import → menu placement → publish/unpublish → navigation', () => {
  it('imports via the EXISTING, unmodified import tool; content is byte-identical', async () => {
    const plan = await planImport(BATCH)
    expect(plan.every((p) => p.ok)).toBe(true)
    const { results } = await applyImport(plan)
    expect(results.every((r) => r.status === 'imported')).toBe(true)
    expect(await Page.countDocuments()).toBe(3)
    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      expect(page.status).toBe('published')
      expect(page.live.content.body).toBe(page.draft.content.body)
      expect(page.menu).toMatchObject({ menuId: null, groupId: null }) // correct and PERMANENT: menu links here are built-in routes, never page references
    }
  })

  it('CORRECTION vs the drafting batch: delai-redaction-pv-cse’s URL is ALREADY an explicit route entry in "Tarifs & délais" — patching page.menu to the same group would create a DUPLICATE, so migration must leave page.menu untouched (null) for it', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const delaiPage = await Page.findOne({ slug: 'delai-redaction-pv-cse' })

    // The WRONG action (what the drafting batch's report recommended for menu-placed pages):
    // patching page.menu when the group already has a route-type entry for the same URL.
    await request(app).patch(`/api/admin/cms/pages/${delaiPage._id}`).set(h).send({ menu: EXPECTED['delai-redaction-pv-cse'].menu })
    await request(app).post(`/api/admin/cms/pages/${delaiPage._id}/publish`).set(h)
    const withPatch = (await request(app).get('/api/cms/navigation')).body
    const groupWithPatch = withPatch.menu.items.find((i) => i.id === 'pv').groups.find((g) => g.id === 'tarifs-delais')
    const hrefsWithPatch = groupWithPatch.entries.map((e) => e.href)
    const dupeCount = hrefsWithPatch.filter((h2) => h2 === '/services/tarifs-infos/delai-redaction-pv-cse').length
    expect(dupeCount, 'patching page.menu on an already-route-linked page creates a duplicate entry — confirmed, do NOT do this').toBe(2)

    // The CORRECT action: undo the patch (menu: null) — the existing route entry already shows the
    // page exactly once, unaffected, exactly like every OTHER migrated page in this batch.
    await request(app).patch(`/api/admin/cms/pages/${delaiPage._id}`).set(h).send({ menu: null })
    await request(app).post(`/api/admin/cms/pages/${delaiPage._id}/publish`).set(h)

    const nav = (await request(app).get('/api/cms/navigation')).body
    const pv = nav.menu.items.find((i) => i.id === 'pv')
    expect(pv.kind).toBe('mega')
    const tarifsGroup = pv.groups.find((g) => g.id === 'tarifs-delais').entries
    expect(tarifsGroup.filter((e) => e.href === '/services/tarifs-infos/delai-redaction-pv-cse')).toHaveLength(1)
    expect(tarifsGroup.map((e) => e.label)).toEqual(['Tarifs & devis', 'Simulateur de budget', 'Délais de remise', 'PV par ville — 11 villes']) // exactly the built-in labels, unchanged
    expect(JSON.stringify(pv.groups)).not.toMatch(/pv-cse-code-travail|redacteur-pv-cse/)
  })

  it('unpublishing the menu-linked page removes its CONTENT from the public API; the menu link itself is a built-in route (independent of any CMS page) and is correctly unaffected — exactly like today, before migration', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(['delai-redaction-pv-cse'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'delai-redaction-pv-cse' })
    expect(page.menu).toMatchObject({ menuId: null, groupId: null })

    const before = (await request(app).get('/api/cms/navigation')).body
    const groupBefore = before.menu.items.find((i) => i.id === 'pv').groups.find((g) => g.id === 'tarifs-delais')
    expect(groupBefore.entries.filter((e) => e.href === '/services/tarifs-infos/delai-redaction-pv-cse')).toHaveLength(1)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/tarifs-infos/delai-redaction-pv-cse' })).status).toBe(200)

    await request(app).post(`/api/admin/cms/pages/${page._id}/unpublish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/tarifs-infos/delai-redaction-pv-cse' })).status).toBe(404)
    const after = (await request(app).get('/api/cms/navigation')).body
    const groupAfter = after.menu.items.find((i) => i.id === 'pv').groups.find((g) => g.id === 'tarifs-delais')
    // The menu is a route link, not a page reference — it is BYTE-FOR-BYTE identical before and
    // after unpublish. This is the same as today, where this link is hardcoded in ATOOPV_NAV and
    // does not know or care whether the page behind it exists.
    expect(groupAfter).toEqual(groupBefore)
  })

  it('a draft edit is never published on its own: content-after-topics can be edited without touching the live topics or stats', async () => {
    const plan = await planImport(['pv-cse-code-travail'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'pv-cse-code-travail' })
    const h = await admin()
    const liveBefore = (await request(app).get('/api/cms/pages').query({ path: '/services/tarifs-infos/pv-cse-code-travail' })).body.page.content.body

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Brouillon avec un contenu totalement différent.' } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/services/tarifs-infos/pv-cse-code-travail' })).body.page.content.body
    expect(stillLive).toBe(liveBefore)

    const preview = await request(app).get(`/api/admin/cms/pages/${page._id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe('Brouillon avec un contenu totalement différent.')

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/services/tarifs-infos/pv-cse-code-travail' })).body.page.content.body
    expect(nowLive).toBe('Brouillon avec un contenu totalement différent.')
  })

  it('side navigation: every migrated page is recognized as the SAME page already in the built-in list — no duplicate, nothing missing', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const section = nav.sections['tarifs-infos']
    expect(section.configured).toBe(false)
    const paths = section.entries.map((e) => e.to)
    for (const slug of BATCH) expect(paths).toContain(`/services/tarifs-infos/${slug}`)
    expect(new Set(paths).size).toBe(paths.length)
    expect(nav.pages.filter((p) => p.section === 'tarifs-infos').map((p) => p.slug).sort()).toEqual([...BATCH].sort())
  })
})
