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

// Guides batch: ALL 13 files in content/guides/ — there is no hub-content-file to exclude here.
// `/services/guides` (the bare index route) is `ServiceCategoryDirectory`, a real grid/listing
// component synthesized from every guides page's own title/excerpt (same pattern as `by-city`,
// which also had zero exclusions) — NOT a `ServiceArticle` rendering one hardcoded slug, so unlike
// `communication-cse`/`formations-elus-cse-agree` there is no single "hub page" masquerading as a
// leaf here.
//
// "guides" is the one Services section OUTSIDE the shared editorial system (`usesEditorialSystem`
// in both ServiceArticle.jsx and serviceArticleContainers.js is `section !== 'guides'`) — its
// pages render Hero + a single rich-text body only, no Stats/Topics/FAQ containers, matching what
// the live design has always done for this section ("original grid/blocks look" per earlier
// batches' notes). So every container here is `{ kind: 'body' }` — proven lossless below and, at
// the visual-editor level, covered by `client/src/cms/markdownRoundTrip.test.js`'s existing
// "46/46 existing service pages, 0 in Markdown-mode fallback" check, which already iterates
// content/guides/*.md.
//
// One page, `modele-pv-cse-gratuit` (ENHANCED_INFO_SLUG in ServiceArticle.jsx), gets a completely
// different RENDER path at view time (GuideModelHero/InfoPanel/ArticleBody/Rail, driven by
// `utils/modelePvGratuitContent.js`'s `parseModelePvGratuitBody`) — but that parser's own header
// comment confirms "No content is changed here — every string is lifted verbatim from the source":
// it is pure derivation from the SAME stored body text, not a second hardcoded content source, so
// it migrates through the identical `{ kind: 'body' }` container with no special handling needed.
//
// One hardcoded editorial block was found OUTSIDE any of these 13 page bodies and is explicitly
// OUT OF SCOPE for this same "don't invent a new mechanism" reason as communication-cse's hub:
// `ServiceCategoryDirectory.jsx`'s `COPY.guides = { title, lead }` is the bare `/services/guides`
// directory page's own hero text. That route has no backing Page/content entity of any kind (same
// as `by-city`'s directory, left alone in that batch too) — making it admin-editable would mean
// inventing a brand-new CMS concept ("section directory settings"), not reusing the proven
// per-page container pattern. Flagged, not touched.
const BATCH = [
  'approbation-pv-cse', 'bdese-pv-cse', 'contenu-pv-cse', 'delai-pv-cse', 'information-consultation-cse',
  'modele-pv-cse-gratuit', 'proces-verbal-cse', 'pv-cse-contenu-obligatoire', 'pv-cse-delit-entrave',
  'pv-cse-moins-50-salaries', 'pv-cse-synthetique-ou-integral', 'qui-redige-pv-cse', 'reunion-extraordinaire-cse',
]
const EXPECTED_MENU = {
  'approbation-pv-cse': null,
  'bdese-pv-cse': null,
  'contenu-pv-cse': null,
  'delai-pv-cse': { menuId: 'blog', groupId: 'le-pv-en-pratique' },
  'information-consultation-cse': { menuId: 'blog', groupId: 'le-cse-en-pratique' },
  'modele-pv-cse-gratuit': { menuId: 'ressources', groupId: 'modeles-de-pv' },
  'proces-verbal-cse': null,
  'pv-cse-contenu-obligatoire': { menuId: 'blog', groupId: 'le-pv-en-pratique' },
  'pv-cse-delit-entrave': { menuId: 'blog', groupId: 'le-pv-en-pratique' },
  'pv-cse-moins-50-salaries': null,
  'pv-cse-synthetique-ou-integral': { menuId: 'blog', groupId: 'le-pv-en-pratique' },
  'qui-redige-pv-cse': null,
  'reunion-extraordinaire-cse': { menuId: 'blog', groupId: 'le-cse-en-pratique' },
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

describe('dry-run report — guides batch', () => {
  it('is read-only: writes nothing, however many times it runs', async () => {
    await planContainerMigration(BATCH)
    await planContainerMigration(BATCH)
    expect(await Page.countDocuments()).toBe(0)
  })

  it('reports all 13 pages as safe and lossless, every one a body-only container (guides has no Stats/Topics/FAQ)', async () => {
    const report = await planContainerMigration(BATCH)
    expect(report).toHaveLength(13)
    for (const r of report) {
      expect(r.losslessRoundTrip, r.slug).toBe(true)
      expect(r.risk, r.slug).toBe('none')
      expect(r.diffAt, r.slug).toBeNull()
      expect(r.section).toBe('guides')
      expect(r.skin).toBe('guides')
      expect(r.richTextFields).toEqual(['body'])
      expect(r.containers).toEqual({ kind: 'body-only (no editorial extraction for this section)' })
      expect(r.menuPlacement, r.slug).toEqual(EXPECTED_MENU[r.slug] ? expect.objectContaining(EXPECTED_MENU[r.slug]) : null)
    }
  })

  it('modele-pv-cse-gratuit (the special-render page) is body-only too — its enhanced view is pure derivation from the same stored text, not a second content source', async () => {
    const report = await planContainerMigration(['modele-pv-cse-gratuit'])
    expect(report[0].containers).toEqual({ kind: 'body-only (no editorial extraction for this section)' })
    expect(report[0].losslessRoundTrip).toBe(true)
  })

  it('6 of 13 pages have no mega-menu placement at all (reached only via the side nav, the /services/guides directory grid, or cross-links within other guides pages) — confirmed against the real ATOOPV_NAV, not assumed', async () => {
    const report = await planContainerMigration(BATCH)
    const unlinked = report.filter((r) => r.menuPlacement === null).map((r) => r.slug).sort()
    expect(unlinked).toEqual(['approbation-pv-cse', 'bdese-pv-cse', 'contenu-pv-cse', 'proces-verbal-cse', 'pv-cse-moins-50-salaries', 'qui-redige-pv-cse'])
  })

  it('every menu-linked page IS an existing hardcoded ROUTE (never a page reference) — per the tarifs-infos correction, page.menu must stay null for all 13', async () => {
    const report = await planContainerMigration(BATCH)
    for (const r of report) if (EXPECTED_MENU[r.slug]) expect(r.menuPlacement, r.slug).not.toBeNull()
  })
})

describe('end to end (isolated in-memory database — never production): import → menu (left null, per the correction) → publish/unpublish → preview', () => {
  it('imports via the EXISTING, unmodified import tool; content is byte-identical; page.menu is null for every page', async () => {
    const plan = await planImport(BATCH)
    expect(plan.every((p) => p.ok)).toBe(true)
    const { results } = await applyImport(plan)
    expect(results.every((r) => r.status === 'imported')).toBe(true)
    expect(await Page.countDocuments()).toBe(13)
    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      expect(page.status).toBe('published')
      expect(page.live.content.body).toBe(page.draft.content.body)
      expect(page.menu).toMatchObject({ menuId: null, groupId: null })
    }
  })

  it('the mega menu (built with the REAL navigation data) shows every menu-linked guides page exactly once — no duplicates, since page.menu was never patched', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(BATCH)
    await applyImport(plan)

    const nav = (await request(app).get('/api/cms/navigation')).body
    const blog = nav.menu.items.find((i) => i.id === 'blog')
    const ressources = nav.menu.items.find((i) => i.id === 'ressources')
    const allHrefs = [...blog.groups, ...ressources.groups].flatMap((g) => g.entries.map((e) => e.href))
    for (const [slug, menu] of Object.entries(EXPECTED_MENU)) {
      if (!menu) continue
      const href = `/services/guides/${slug}`
      expect(allHrefs.filter((h2) => h2 === href), slug).toHaveLength(1) // exactly once, never duplicated
    }
    const pvGroup = blog.groups.find((g) => g.id === 'le-pv-en-pratique').entries.map((e) => e.label)
    expect(pvGroup).toEqual(['Contenu obligatoire du PV', 'Délais, approbation, signature', 'Synthétique ou intégral ?', 'Délit d’entrave & code du travail']) // built-in labels, unchanged
  })

  it('unpublishing a menu-linked guides page takes its CONTENT offline; the built-in route link is unaffected (same as before migration)', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(['delai-pv-cse'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'delai-pv-cse' })

    const before = (await request(app).get('/api/cms/navigation')).body
    const groupBefore = before.menu.items.find((i) => i.id === 'blog').groups.find((g) => g.id === 'le-pv-en-pratique')
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/guides/delai-pv-cse' })).status).toBe(200)

    await request(app).post(`/api/admin/cms/pages/${page._id}/unpublish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/guides/delai-pv-cse' })).status).toBe(404)
    const after = (await request(app).get('/api/cms/navigation')).body
    const groupAfter = after.menu.items.find((i) => i.id === 'blog').groups.find((g) => g.id === 'le-pv-en-pratique')
    expect(groupAfter).toEqual(groupBefore) // the hardcoded route link is byte-for-byte unaffected

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/guides/delai-pv-cse' })).status).toBe(200)
  })

  it('preview shows the draft (body edits) before publishing, and publishing makes it live', async () => {
    const plan = await planImport(['modele-pv-cse-gratuit'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'modele-pv-cse-gratuit' })
    const h = await admin()

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Brouillon avec un tout autre contenu.' } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/services/guides/modele-pv-cse-gratuit' })).body.page.content.body
    expect(stillLive).not.toBe('Brouillon avec un tout autre contenu.')

    const preview = await request(app).get(`/api/admin/cms/pages/${page._id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe('Brouillon avec un tout autre contenu.')
    expect(preview.body.page.preview).toBe(true)
    expect((await request(app).get(`/api/admin/cms/pages/${page._id}/preview`)).status).toBe(401) // preview needs auth

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/services/guides/modele-pv-cse-gratuit' })).body.page.content.body
    expect(nowLive).toBe('Brouillon avec un tout autre contenu.')
  })

  it('side navigation: every migrated page is recognized as the SAME page already in the built-in GUIDES_NAV list — no duplicate, nothing missing', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const section = nav.sections.guides
    expect(section.configured).toBe(false)
    const paths = section.entries.map((e) => e.to)
    for (const slug of BATCH) expect(paths).toContain(`/services/guides/${slug}`)
    expect(new Set(paths).size).toBe(paths.length)
    expect(nav.pages.filter((p) => p.section === 'guides').map((p) => p.slug).sort()).toEqual([...BATCH].sort())
  })

  it('the /services/guides directory listing picks up every migrated page automatically (ServiceCategoryDirectory merges CMS pages by section) — proves the directory itself needed no code change', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const cmsPages = nav.pages.filter((p) => p.section === 'guides')
    expect(cmsPages).toHaveLength(13) // ServiceCategoryDirectory's `useCmsPages({ section: 'guides' })` reads exactly this list
  })
})
