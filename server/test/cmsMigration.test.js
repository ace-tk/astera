import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Page } from '../src/models/Page.js'
import { PageRevision } from '../src/models/PageRevision.js'
import { planImport, applyImport, CONTENT_ROOT } from '../src/cms/migrate/importServiceArticles.js'
import { exportBackup, restoreBackup } from '../src/cms/migrate/backup.js'

let app
beforeEach(() => { app = createApp() })
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'cms-test-'))

async function adminHeader() {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}

describe('import plan (read-only)', () => {
  it('plans a leaf page from markdown without writing anything', async () => {
    const [item] = await planImport(['redaction-pv-cssct'])
    expect(item.ok).toBe(true)
    expect(item.path).toBe('/services/drafting/redaction-pv-cssct')
    expect(item.page.version.title).toMatch(/CSSCT/)
    expect(item.page.version.content.badge).toBe('Services') // the hero chip, from the file's own Breadcrumb header
    expect(item.page.version.content.body.length).toBeGreaterThan(1000)
    expect(item.page.navLabel).toBe('Rédaction PV CSSCT')
    expect(item.page.legacy).toMatchObject({ source: 'markdown', file: 'content/drafting/redaction-pv-cssct.md' })
    expect(await Page.countDocuments()).toBe(0)
  })

  it('refuses hubs, unknown slugs and non-service content', async () => {
    const plan = await planImport(['nos-services-pv', 'no-such-page', 'a-propos'])
    expect(plan.map((p) => p.ok)).toEqual([false, false, false])
    expect(plan[0].reason).toMatch(/Hub/)
  })

  it('every existing service leaf page is importable — the template can hold all existing content', async () => {
    const slugs = []
    for (const section of ['drafting', 'by-city', 'tarifs-infos', 'training', 'communication', 'guides']) {
      for (const f of fs.readdirSync(path.join(CONTENT_ROOT, section))) if (f.endsWith('.md')) slugs.push(f.replace(/\.md$/, ''))
    }
    const plan = await planImport(slugs)
    const failed = plan.filter((p) => !p.ok && !/Hub/.test(p.reason))
    expect(failed, JSON.stringify(failed.map((f) => [f.slug, f.reason]))).toEqual([])
    expect(plan.filter((p) => p.ok).length).toBe(slugs.length - 5) // 4 category hubs + the /services home are deferred
  })
})

describe('applying an import', () => {
  it('imports as published, with identical draft/live, a revision, and a pre-import backup', async () => {
    const dir = tmp()
    const plan = await planImport(['redaction-pv-cssct'])
    const { backup, results } = await applyImport(plan, { backupDir: dir })
    expect(results[0].status).toBe('imported')
    expect(fs.existsSync(backup.file)).toBe(true)

    const page = await Page.findOne({ path: '/services/drafting/redaction-pv-cssct' })
    expect(page.status).toBe('published')
    expect(page.hasUnpublishedChanges()).toBe(false)
    expect(page.draft.content.body).toBe(page.live.content.body)
    expect(page.legacy.file).toBe('content/drafting/redaction-pv-cssct.md')
    const revs = await PageRevision.find({ page: page._id })
    expect(revs.map((r) => r.kind)).toEqual(['import'])

    // and the public API serves it, unchanged
    const res = await request(app).get('/api/cms/pages').query({ path: '/services/drafting/redaction-pv-cssct' })
    expect(res.status).toBe(200)
    expect(res.body.page.content.body).toBe(plan[0].page.version.content.body)
  })

  it('never overwrites: re-importing keeps every edit an admin made', async () => {
    const dir = tmp()
    const h = await adminHeader()
    await applyImport(await planImport(['redaction-pv-cssct']), { backupDir: dir })
    const page = await Page.findOne({ path: '/services/drafting/redaction-pv-cssct' })

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Edited by an admin' } })
    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)

    const again = await applyImport(await planImport(['redaction-pv-cssct']), { backupDir: dir })
    expect(again.results[0].status).toBe('skipped')
    expect(again.results[0].reason).toMatch(/Already exists/)
    expect(await Page.countDocuments()).toBe(1)
    const after = await Page.findById(page._id)
    expect(after.live.content.body).toBe('Edited by an admin')
  })

  it('a migrated page keeps its own original address when edited (legacy slug allowed), but others cannot take it', async () => {
    const h = await adminHeader()
    await applyImport(await planImport(['redaction-pv-cssct']), { backupDir: tmp() })
    const page = await Page.findOne({ path: '/services/drafting/redaction-pv-cssct' })
    // rename away and back again
    expect((await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ slug: 'cssct-nouveau' })).status).toBe(200)
    expect((await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ slug: 'redaction-pv-cssct' })).status).toBe(200)
    // a brand-new page may not reuse it
    const res = await request(app).post('/api/admin/cms/pages').set(h).send({ templateKey: 'service-article', section: 'guides', slug: 'redaction-pv-cssct', title: 'x' })
    expect(res.status).toBe(409)
  })

  it('writes nothing for items that failed planning', async () => {
    const { backup, results } = await applyImport(await planImport(['nos-services-pv']), { backupDir: tmp() })
    expect(backup).toBeNull()
    expect(results[0].status).toBe('skipped')
    expect(await Page.countDocuments()).toBe(0)
  })
})

describe('backup and restore', () => {
  it('round-trips CMS data, and a dry-run restore changes nothing', async () => {
    const dir = tmp()
    await applyImport(await planImport(['redaction-pv-cssct', 'delai-pv-cse']), { backupDir: dir })
    const { file, counts } = await exportBackup({ dir })
    expect(counts.pages).toBe(2)
    expect(counts.revisions).toBe(2)

    await Page.deleteMany({})
    await PageRevision.deleteMany({})
    const dry = await restoreBackup(file, { apply: false })
    expect(dry.applied).toBe(false)
    expect(await Page.countDocuments()).toBe(0)

    await restoreBackup(file, { apply: true })
    expect(await Page.countDocuments()).toBe(2)
    const restored = await Page.findOne({ path: '/services/guides/delai-pv-cse' })
    expect(restored.status).toBe('published')
    expect(restored.live.content.body.length).toBeGreaterThan(1000)
  })

  it('restore never deletes pages that are not in the backup', async () => {
    const dir = tmp()
    await applyImport(await planImport(['redaction-pv-cssct']), { backupDir: dir })
    const { file } = await exportBackup({ dir })
    await applyImport(await planImport(['delai-pv-cse']), { backupDir: dir })
    await restoreBackup(file, { apply: true })
    expect(await Page.countDocuments()).toBe(2)
  })
})
