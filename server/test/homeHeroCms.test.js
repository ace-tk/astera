import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { HomeHero } from '../src/models/HomeHero.js'
import { DEFAULT_HOME_HERO_CONTENT } from '../src/cms/homeHeroDefaults.js'

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

const A = '/api/admin/cms/home-hero'
const PUB = '/api/cms/home-hero'
const getAdmin = (h) => request(app).get(A).set(h)
const save = (h, content, rev) => request(app).patch(A).set(h).send({ content, ...(rev != null ? { rev } : {}) })
const publishH = (h) => request(app).post(`${A}/publish`).set(h)
const discardH = (h) => request(app).post(`${A}/discard`).set(h)
const publicH = () => request(app).get(PUB)

describe('home hero CMS — access control', () => {
  it('admin endpoints reject anonymous (401) and non-admin (403)', async () => {
    expect((await request(app).get(A)).status).toBe(401)
    const m = await member()
    expect((await getAdmin(m)).status).toBe(403)
    expect((await save(m, DEFAULT_HOME_HERO_CONTENT)).status).toBe(403)
    expect((await publishH(m)).status).toBe(403)
    expect((await discardH(m)).status).toBe(403)
  })

  it('the public endpoint needs no authentication and exposes only live content', async () => {
    const res = await publicH()
    expect(res.status).toBe(200)
    expect(res.body.homeHero).not.toHaveProperty('draft')
    expect(res.body.homeHero).not.toHaveProperty('rev')
    expect(res.body.homeHero).toHaveProperty('slides')
  })
})

describe('home hero CMS — auto-seed', () => {
  it('is seeded from the real site images the very first time it is read, in both draft and live', async () => {
    expect(await HomeHero.countDocuments()).toBe(0)
    const h = await admin()
    const res = await getAdmin(h)
    expect(res.status).toBe(200)
    expect(res.body.homeHero.draft.content).toEqual(DEFAULT_HOME_HERO_CONTENT)
    expect(res.body.homeHero.live.content).toEqual(DEFAULT_HOME_HERO_CONTENT)
    expect(res.body.homeHero.hasUnpublishedChanges).toBe(false)
    expect(await HomeHero.countDocuments()).toBe(1)
  })

  it('the public homepage matches the seed exactly before any admin edit', async () => {
    const res = await publicH()
    expect(res.body.homeHero).toEqual(DEFAULT_HOME_HERO_CONTENT)
  })
})

describe('home hero CMS — draft / publish / discard', () => {
  const withSlide1 = (path, alt = 'Nouvelle image') => ({
    slides: DEFAULT_HOME_HERO_CONTENT.slides.map((s, i) => (i === 0 ? { ...s, path, alt } : s)),
  })

  it('editing the draft does not change the public homepage until published', async () => {
    const h = await admin()
    const edited = withSlide1('/api/media/507f1f77bcf86cd799439011/new.webp')
    const res = await save(h, edited)
    expect(res.status).toBe(200)
    expect(res.body.homeHero.draft.content.slides[0].path).toBe('/api/media/507f1f77bcf86cd799439011/new.webp')
    expect(res.body.homeHero.hasUnpublishedChanges).toBe(true)

    const pub = await publicH()
    expect(pub.body.homeHero.slides[0].path).toBe(DEFAULT_HOME_HERO_CONTENT.slides[0].path)
  })

  it('publishing copies the draft to live, and the public endpoint reflects it', async () => {
    const h = await admin()
    await save(h, withSlide1('/api/media/507f1f77bcf86cd799439011/new.webp'))
    const res = await publishH(h)
    expect(res.status).toBe(200)
    expect(res.body.homeHero.hasUnpublishedChanges).toBe(false)

    const pub = await publicH()
    expect(pub.body.homeHero.slides[0].path).toBe('/api/media/507f1f77bcf86cd799439011/new.webp')
    expect(pub.body.homeHero.slides[0].alt).toBe('Nouvelle image')
    // untouched slides keep their default values
    expect(pub.body.homeHero.slides[1]).toEqual(DEFAULT_HOME_HERO_CONTENT.slides[1])
  })

  it('discarding reverts the draft back to the currently-live content', async () => {
    const h = await admin()
    await save(h, withSlide1('/api/media/507f1f77bcf86cd799439011/new.webp'))
    await publishH(h) // live now has the new image
    await save(h, withSlide1('/api/media/aaaaaaaaaaaaaaaaaaaaaaaa/another.webp'))
    const res = await discardH(h)
    expect(res.status).toBe(200)
    expect(res.body.homeHero.draft.content.slides[0].path).toBe('/api/media/507f1f77bcf86cd799439011/new.webp')
    expect(res.body.homeHero.hasUnpublishedChanges).toBe(false)
  })

  it('rejects a stale save with REV_CONFLICT', async () => {
    const h = await admin()
    const first = await getAdmin(h)
    const res = await save(h, DEFAULT_HOME_HERO_CONTENT, first.body.homeHero.rev + 5)
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('REV_CONFLICT')
  })
})

describe('home hero CMS — validation', () => {
  it('rejects fewer than 3 slides', async () => {
    const h = await admin()
    const res = await save(h, { slides: DEFAULT_HOME_HERO_CONTENT.slides.slice(0, 2) })
    expect(res.status).toBe(422)
  })

  it('rejects more than 3 slides', async () => {
    const h = await admin()
    const res = await save(h, { slides: [...DEFAULT_HOME_HERO_CONTENT.slides, { id: 'slide-4', path: '/x.webp', alt: '' }] })
    expect(res.status).toBe(422)
  })

  it('rejects a slide path that is not a site-relative path', async () => {
    const h = await admin()
    const bad = { slides: DEFAULT_HOME_HERO_CONTENT.slides.map((s, i) => (i === 0 ? { ...s, path: 'not-a-path.webp' } : s)) }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
  })

  it('rejects duplicate slide ids', async () => {
    const h = await admin()
    const bad = { slides: DEFAULT_HOME_HERO_CONTENT.slides.map((s) => ({ ...s, id: 'same-id' })) }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
  })

  it('publish re-validates the draft', async () => {
    const h = await admin()
    await getAdmin(h) // ensure seeded
    const doc = await HomeHero.findOne()
    doc.draft = { content: { slides: DEFAULT_HOME_HERO_CONTENT.slides.slice(0, 1) } }
    doc.markModified('draft')
    await doc.save()
    const res = await publishH(h)
    expect(res.status).toBe(422)
  })
})
