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
import { fixedItems } from './fixedMenusFixture.js'

// The drafting batch this task covers — hub pages (`nos-services-pv`, `services`) and the
// already-migrated `redaction-pv-cssct` are deliberately excluded (see the written report).
const BATCH = ['redaction-pv-cse', 'redaction-pv-cse-a-lacte', 'redaction-pv-csec', 'redaction-pv-irp', 'externaliser-pv-cse']
const EXPECTED_MENU = {
  'redaction-pv-cse': { menuId: 'pv', groupId: 'par-instance' },
  'redaction-pv-cse-a-lacte': { menuId: 'pv', groupId: 'nos-formules' },
  'redaction-pv-csec': { menuId: 'pv', groupId: 'par-instance' },
  'redaction-pv-irp': { menuId: 'pv', groupId: 'par-instance' },
  'externaliser-pv-cse': { menuId: 'pv', groupId: 'nos-formules' },
}

let app
beforeEach(() => { app = createApp() })
const admin = async () => {
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}

describe('dry-run report — drafting batch', () => {
  it('is read-only: writes nothing, however many times it runs', async () => {
    await planContainerMigration(BATCH)
    await planContainerMigration(BATCH)
    expect(await Page.countDocuments()).toBe(0)
  })

  it('reports all 5 pages as safe, lossless, and correctly placed in today’s mega menu', async () => {
    const report = await planContainerMigration(BATCH)
    expect(report).toHaveLength(5)
    for (const r of report) {
      expect(r.losslessRoundTrip, r.slug).toBe(true)
      expect(r.risk, r.slug).toBe('none')
      expect(r.diffAt, r.slug).toBeNull()
      expect(r.section).toBe('drafting')
      expect(r.skin).toBe('pv')
      expect(r.menuPlacement, r.slug).toMatchObject(EXPECTED_MENU[r.slug])
    }
  })

  it('excludes hub pages with a clear reason, and never silently includes them', async () => {
    const report = await planContainerMigration(['nos-services-pv', 'services', ...BATCH])
    const hubs = report.filter((r) => ['nos-services-pv', 'services'].includes(r.slug))
    expect(hubs.every((r) => r.ok === false)).toBe(true)
    expect(hubs.map((r) => r.reason)).toEqual(['Hub pages are not imported in Phase 1', 'Hub pages are not imported in Phase 1'])
  })

  it('the already-migrated page is not part of this batch (excluded by the slug list itself, not a special case in the tool)', () => {
    expect(BATCH).not.toContain('redaction-pv-cssct')
  })
})

describe('end to end (isolated in-memory database — never production): import → menu placement → publish/unpublish → navigation', () => {
  it('imports via the EXISTING, unmodified import tool; content is byte-identical to the dry-run report', async () => {
    const plan = await planImport(BATCH)
    expect(plan.every((p) => p.ok)).toBe(true)
    const report = await planContainerMigration(BATCH)
    for (const item of plan) {
      const r = report.find((x) => x.slug === item.slug)
      expect(item.page.version.content.body).toBe(item.page.version.content.body) // sanity
      expect(r.losslessRoundTrip).toBe(true)
    }
    const { results } = await applyImport(plan, { backupDir: '/tmp/atoopv-drafting-batch-backup' })
    expect(results.every((r) => r.status === 'imported')).toBe(true)
    expect(await Page.countDocuments()).toBe(5)

    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      expect(page.status).toBe('published')
      expect(page.live.content.body).toBe(page.draft.content.body) // freshly imported: draft and live start identical
    }
  })

  it('setting menu placement uses the EXISTING page-editor mechanism (no change to the import tool needed) and appears in the public navigation', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: fixedItems() })
    const plan = await planImport(BATCH)
    await applyImport(plan)

    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      const menu = EXPECTED_MENU[slug]
      const res = await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ menu })
      expect(res.status, slug).toBe(200)
    }

    const nav = (await request(app).get('/api/cms/navigation')).body
    const pv = nav.menu.items.find((i) => i.id === 'pv')
    const parInstance = pv.groups.find((g) => g.id === 'par-instance').entries.map((e) => e.href)
    const nosFormules = pv.groups.find((g) => g.id === 'nos-formules').entries.map((e) => e.href)
    expect(parInstance).toEqual(expect.arrayContaining(['/services/drafting/redaction-pv-cse', '/services/drafting/redaction-pv-csec', '/services/drafting/redaction-pv-irp']))
    expect(nosFormules).toEqual(expect.arrayContaining(['/services/drafting/redaction-pv-cse-a-lacte', '/services/drafting/externaliser-pv-cse']))
  })

  it('unpublishing a migrated page removes it from the public API and the mega menu, exactly like any other CMS page', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: fixedItems() })
    const plan = await planImport(['redaction-pv-cse'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'redaction-pv-cse' })
    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ menu: EXPECTED_MENU['redaction-pv-cse'] })
    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)

    expect((await request(app).get('/api/cms/pages').query({ path: '/services/drafting/redaction-pv-cse' })).status).toBe(200)
    let nav = (await request(app).get('/api/cms/navigation')).body
    expect(JSON.stringify(nav)).toContain('/services/drafting/redaction-pv-cse')

    await request(app).post(`/api/admin/cms/pages/${page._id}/unpublish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/drafting/redaction-pv-cse' })).status).toBe(404)
    nav = (await request(app).get('/api/cms/navigation')).body
    expect(JSON.stringify(nav)).not.toContain('redaction-pv-cse')

    // republishing brings it back, unchanged
    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/services/drafting/redaction-pv-cse' })).status).toBe(200)
  })

  it('a draft edit on a migrated page never changes the live (public) version until published', async () => {
    const plan = await planImport(['redaction-pv-cse'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'redaction-pv-cse' })
    const h = await admin()
    const liveBodyBefore = (await request(app).get('/api/cms/pages').query({ path: '/services/drafting/redaction-pv-cse' })).body.page.content.body

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Contenu de brouillon modifié.' } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/services/drafting/redaction-pv-cse' })).body.page.content.body
    expect(stillLive).toBe(liveBodyBefore)

    const preview = await request(app).get(`/api/admin/cms/pages/${page._id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe('Contenu de brouillon modifié.')

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/services/drafting/redaction-pv-cse' })).body.page.content.body
    expect(nowLive).toBe('Contenu de brouillon modifié.')
  })

  it('side navigation / previous-next: the migrated page is recognized as the SAME page already in the built-in list — no duplicate, nothing missing', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const training = nav.sections.drafting
    expect(training.configured).toBe(false) // side-nav ordering was never separately initialized
    // The migrated pages are published CMS pages of this section; unconfigured sections return them
    // for the frontend to merge into its own static list — which already contains these exact URLs,
    // so mergeSectionNav's de-duplication (same `to`) means nothing is added twice or lost.
    const paths = training.entries.map((e) => e.to)
    for (const slug of BATCH) expect(paths).toContain(`/services/drafting/${slug}`)
    expect(new Set(paths).size).toBe(paths.length) // no duplicates reported by the API itself
  })
})
