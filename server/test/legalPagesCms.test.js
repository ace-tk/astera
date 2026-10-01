import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { LegalPages } from '../src/models/LegalPages.js'
import { DEFAULT_LEGAL_PAGES_CONTENT } from '../src/cms/legalPagesDefaults.js'

let app
beforeEach(() => {
  app = createApp()
})

async function tokenFor(role) {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: role, email: `${role}+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role })
  return jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })
}
const admin = async () => ({ Authorization: `Bearer ${await tokenFor('admin')}` })
const member = async () => ({ Authorization: `Bearer ${await tokenFor('Member')}` })

const A = '/api/admin/cms/legal-pages'
const PUB = '/api/cms/legal-pages'
const getAdmin = (h) => request(app).get(A).set(h)
const save = (h, content, rev) => request(app).patch(A).set(h).send({ content, ...(rev != null ? { rev } : {}) })
const publishL = (h) => request(app).post(`${A}/publish`).set(h)
const discardL = (h) => request(app).post(`${A}/discard`).set(h)
const publicL = () => request(app).get(PUB)

describe('legal pages CMS — access control', () => {
  it('admin endpoints reject anonymous (401) and non-admin (403)', async () => {
    expect((await request(app).get(A)).status).toBe(401)
    const m = await member()
    expect((await getAdmin(m)).status).toBe(403)
    expect((await save(m, DEFAULT_LEGAL_PAGES_CONTENT)).status).toBe(403)
    expect((await publishL(m)).status).toBe(403)
    expect((await discardL(m)).status).toBe(403)
  })

  it('the public endpoint needs no authentication and exposes only live content', async () => {
    const res = await publicL()
    expect(res.status).toBe(200)
    expect(res.body.legalPages).not.toHaveProperty('draft')
    expect(res.body.legalPages).not.toHaveProperty('rev')
    expect(res.body.legalPages).toHaveProperty('mentionsLegales')
    expect(res.body.legalPages).toHaveProperty('cgv')
    expect(res.body.legalPages).toHaveProperty('confidentialite')
    expect(res.body.legalPages).toHaveProperty('cookies')
  })
})

describe('legal pages CMS — auto-seed', () => {
  it('is seeded from the real site text the very first time it is read, in both draft and live', async () => {
    expect(await LegalPages.countDocuments()).toBe(0)
    const h = await admin()
    const res = await getAdmin(h)
    expect(res.status).toBe(200)
    expect(res.body.legalPages.draft.content).toEqual(DEFAULT_LEGAL_PAGES_CONTENT)
    expect(res.body.legalPages.live.content).toEqual(DEFAULT_LEGAL_PAGES_CONTENT)
    expect(res.body.legalPages.hasUnpublishedChanges).toBe(false)
    expect(await LegalPages.countDocuments()).toBe(1)
  })

  it('the public pages match the seed exactly before any admin edit', async () => {
    const res = await publicL()
    expect(res.body.legalPages).toEqual(DEFAULT_LEGAL_PAGES_CONTENT)
  })
})

describe('legal pages CMS — draft / publish / discard', () => {
  const withMentionsTitle = (title) => ({
    ...DEFAULT_LEGAL_PAGES_CONTENT,
    mentionsLegales: { ...DEFAULT_LEGAL_PAGES_CONTENT.mentionsLegales, title },
  })

  it('editing the draft does not change the public pages until published', async () => {
    const h = await admin()
    const res = await save(h, withMentionsTitle('Mentions légales (brouillon modifié)'))
    expect(res.status).toBe(200)
    expect(res.body.legalPages.draft.content.mentionsLegales.title).toBe('Mentions légales (brouillon modifié)')
    expect(res.body.legalPages.hasUnpublishedChanges).toBe(true)

    const pub = await publicL()
    expect(pub.body.legalPages.mentionsLegales.title).toBe(DEFAULT_LEGAL_PAGES_CONTENT.mentionsLegales.title)
  })

  it('publishing copies the draft to live, and the public endpoint reflects it', async () => {
    const h = await admin()
    await save(h, withMentionsTitle('Mentions légales (nouveau titre)'))
    const res = await publishL(h)
    expect(res.status).toBe(200)
    expect(res.body.legalPages.hasUnpublishedChanges).toBe(false)

    const pub = await publicL()
    expect(pub.body.legalPages.mentionsLegales.title).toBe('Mentions légales (nouveau titre)')
    // untouched pages keep their default values
    expect(pub.body.legalPages.cgv).toEqual(DEFAULT_LEGAL_PAGES_CONTENT.cgv)
  })

  it('discarding reverts the draft back to the currently-live content', async () => {
    const h = await admin()
    await save(h, withMentionsTitle('Version A'))
    await publishL(h) // live now has "Version A"
    await save(h, withMentionsTitle('Version B'))
    const res = await discardL(h)
    expect(res.status).toBe(200)
    expect(res.body.legalPages.draft.content.mentionsLegales.title).toBe('Version A')
    expect(res.body.legalPages.hasUnpublishedChanges).toBe(false)
  })

  it('rejects a stale save with REV_CONFLICT', async () => {
    const h = await admin()
    const first = await getAdmin(h)
    const res = await save(h, DEFAULT_LEGAL_PAGES_CONTENT, first.body.legalPages.rev + 5)
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('REV_CONFLICT')
  })
})

describe('legal pages CMS — validation', () => {
  it('rejects a missing page (all 4 keys are required)', async () => {
    const h = await admin()
    const { cookies, ...rest } = DEFAULT_LEGAL_PAGES_CONTENT
    const res = await save(h, rest)
    expect(res.status).toBe(422)
  })

  it('rejects an empty title', async () => {
    const h = await admin()
    const bad = { ...DEFAULT_LEGAL_PAGES_CONTENT, cgv: { ...DEFAULT_LEGAL_PAGES_CONTENT.cgv, title: '' } }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
  })

  it('rejects disallowed Markdown in the body (e.g. a code block)', async () => {
    const h = await admin()
    const bad = { ...DEFAULT_LEGAL_PAGES_CONTENT, cookies: { ...DEFAULT_LEGAL_PAGES_CONTENT.cookies, body: '```js\nalert(1)\n```' } }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
  })

  it('publish re-validates the draft', async () => {
    const h = await admin()
    await getAdmin(h) // ensure seeded
    const doc = await LegalPages.findOne()
    doc.draft = { content: { ...DEFAULT_LEGAL_PAGES_CONTENT, cgv: { title: '', lead: '', body: '' } } }
    doc.markModified('draft')
    await doc.save()
    const res = await publishL(h)
    expect(res.status).toBe(422)
  })
})
