import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Blog } from '../src/models/Blog.js'

// A fresh app per test: the API's global rate limiter (120 req/min) is per instance.
let app
beforeEach(() => { app = createApp() })

const adminToken = async () => {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: 'Admin', email: `admin+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role: 'admin' })
  return jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })
}

const validPost = (overrides = {}) => ({
  title: 'How ATOOPV reads a meeting',
  excerpt: 'A short look at how the pipeline turns a transcript into a report.',
  imageUrl: 'https://images.example.com/meeting.jpg',
  ...overrides,
})

describe('GET /api/blog/featured (public)', () => {
  it('requires no authentication', async () => {
    const res = await request(app).get('/api/blog/featured')
    expect(res.status).toBe(200)
  })

  it('returns { blog: null } when there are no published posts', async () => {
    const res = await request(app).get('/api/blog/featured')
    expect(res.body.blog).toBeNull()
  })

  it('returns the latest published post when none is marked featured', async () => {
    await Blog.create({ ...validPost({ title: 'Older post' }), slug: 'older-post', publishedAt: new Date('2026-01-01') })
    await Blog.create({ ...validPost({ title: 'Newer post' }), slug: 'newer-post', publishedAt: new Date('2026-06-01') })

    const res = await request(app).get('/api/blog/featured')
    expect(res.body.blog.title).toBe('Newer post')
  })

  it('prefers a post explicitly marked featured over a more recent unfeatured one', async () => {
    await Blog.create({ ...validPost({ title: 'Very new but not featured' }), slug: 'very-new', publishedAt: new Date('2026-07-01') })
    await Blog.create({ ...validPost({ title: 'Older but featured' }), slug: 'older-featured', featured: true, publishedAt: new Date('2026-01-01') })

    const res = await request(app).get('/api/blog/featured')
    expect(res.body.blog.title).toBe('Older but featured')
  })

  it('never returns an unpublished (draft) post', async () => {
    await Blog.create({ ...validPost({ title: 'Draft post' }), slug: 'draft-post', published: false, featured: true })

    const res = await request(app).get('/api/blog/featured')
    expect(res.body.blog).toBeNull()
  })
})

describe('GET /api/blog/:slug (public)', () => {
  it('returns a published post by slug', async () => {
    await Blog.create({ ...validPost({ title: 'Direct link post' }), slug: 'direct-link-post' })
    const res = await request(app).get('/api/blog/direct-link-post')
    expect(res.status).toBe(200)
    expect(res.body.blog.title).toBe('Direct link post')
  })

  it('404s for a draft post (never leaks unpublished content)', async () => {
    await Blog.create({ ...validPost({ title: 'Secret draft' }), slug: 'secret-draft', published: false })
    const res = await request(app).get('/api/blog/secret-draft')
    expect(res.status).toBe(404)
  })

  it('404s for an unknown slug', async () => {
    const res = await request(app).get('/api/blog/does-not-exist')
    expect(res.status).toBe(404)
  })

  it('the literal "featured" path resolves to the featured endpoint, not a slug lookup', async () => {
    const res = await request(app).get('/api/blog/featured')
    expect(res.body).toHaveProperty('blog')
    expect(res.status).toBe(200)
  })
})

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

async function adminAuth() {
  return { Authorization: `Bearer ${await adminToken()}` }
}
const B = '/api/admin/blogs'
const create = async (h, over = {}) => {
  const res = await request(app).post(B).set(h).send(validPost(over))
  expect(res.status, JSON.stringify(res.body)).toBe(201)
  return res.body.blog
}
const publish = (h, id) => request(app).post(`${B}/${id}/publish`).set(h)
const patch = (h, id, body, headers = {}) => request(app).patch(`${B}/${id}`).set(h).set(headers).send(body)
const publicPost = (slug) => request(app).get(`/api/blog/${slug}`)

describe('Admin blog — access', () => {
  it('rejects non-admins (403) and visitors (401) on every admin blog route', async () => {
    const passwordHash = await User.hashPassword('supersecret123')
    const u = await User.create({ name: 'Guest', email: `guest+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash })
    const member = { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
    const h = await adminAuth()
    const post = await create(h)
    for (const [method, path] of [
      ['get', B], ['post', B], ['get', `${B}/${post.id}`], ['patch', `${B}/${post.id}`], ['post', `${B}/${post.id}/publish`],
      ['post', `${B}/${post.id}/unpublish`], ['post', `${B}/${post.id}/discard-draft`], ['get', `${B}/${post.id}/preview`], ['delete', `${B}/${post.id}`],
    ]) {
      expect((await request(app)[method](path).set(member).send({})).status, `${method} ${path} as member`).toBe(403)
      expect((await request(app)[method](path).send({})).status, `${method} ${path} anonymous`).toBe(401)
    }
  })
})

describe('Admin blog — a new post is a draft', () => {
  it('is created unpublished with a unique slug, and is invisible to the public', async () => {
    const h = await adminAuth()
    const a = await create(h)
    const b = await create(h)
    expect(a.slug).toBe('how-atoopv-reads-a-meeting')
    expect(b.slug).toBe('how-atoopv-reads-a-meeting-2')
    expect(a).toMatchObject({ status: 'draft', hasUnpublishedChanges: false, live: null, working: { title: 'How ATOOPV reads a meeting', contentFormat: 'markdown', author: 'ATOOPV Team' } })
    expect((await publicPost(a.slug)).status).toBe(404)
    expect((await request(app).get('/api/blog/featured')).body.blog).toBeNull()
  })

  it('needs only a title to save; validates everything it is given', async () => {
    const h = await adminAuth()
    expect((await request(app).post(B).set(h).send({ title: 'Just a title' })).status).toBe(201)
    for (const bad of [{}, { title: '' }, { title: 'a\nb' }, { title: 'x'.repeat(201) }, { title: 'ok', excerpt: 'x'.repeat(401) }, { title: 'ok', author: 'a\nb' }, { title: 'ok', slug: 'hijack' }, { title: 'ok', published: true }, { title: 'ok', imageUrl: 'javascript:alert(1)' }, { title: 'ok', imageUrl: '/etc/passwd' }, { title: 'ok', imageUrl: `/api/media/${new mongoose.Types.ObjectId()}/missing.png` }]) {
      expect((await request(app).post(B).set(h).send(bad)).status, JSON.stringify(bad)).toBe(422)
    }
  })

  it('cannot be published until it has a summary and a cover image', async () => {
    const h = await adminAuth()
    const post = (await request(app).post(B).set(h).send({ title: 'Incomplete' })).body.blog
    const res = await publish(h, post.id)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('PUBLISH_INCOMPLETE')
    expect(res.body.issues.missing).toEqual(['a short summary', 'a cover image'])
    expect((await publicPost(post.slug)).status).toBe(404)
  })
})

describe('Admin blog — draft, preview, publish, unpublish', () => {
  it('publishes: the public route and the homepage card serve the live version, with no admin fields', async () => {
    const h = await adminAuth()
    const post = await create(h, { title: 'Live post', featured: true })
    const res = await publish(h, post.id)
    expect(res.status).toBe(200)
    expect(res.body.blog).toMatchObject({ status: 'published', hasUnpublishedChanges: false, everPublished: true })

    const pub = (await publicPost(post.slug)).body.blog
    expect(pub).toMatchObject({ title: 'Live post', excerpt: validPost().excerpt, imageUrl: validPost().imageUrl, contentFormat: 'markdown', featured: true })
    expect(Object.keys(pub).sort()).toEqual(['author', 'content', 'contentFormat', 'createdAt', 'excerpt', 'featured', 'id', 'imageUrl', 'published', 'publishedAt', 'slug', 'title', 'updatedAt'])
    expect((await request(app).get('/api/blog/featured')).body.blog.title).toBe('Live post')
  })

  it('a draft edit NEVER changes the live post; only Publish does; Discard goes back', async () => {
    const h = await adminAuth()
    const post = await create(h, { title: 'Original title', content: 'Original text.' })
    await publish(h, post.id)

    const edited = await patch(h, post.id, { title: 'Edited title', content: 'Edited text with **bold**.' })
    expect(edited.body.blog).toMatchObject({ status: 'published', hasUnpublishedChanges: true, working: { title: 'Edited title' }, live: { title: 'Original title' } })
    let pub = (await publicPost(post.slug)).body.blog
    expect(pub.title).toBe('Original title')
    expect(pub.content).toBe('Original text.')
    expect((await request(app).get('/api/blog/featured')).body.blog.title).toBe('Original title')

    // Discard: back to the published version
    const back = await request(app).post(`${B}/${post.id}/discard-draft`).set(h)
    expect(back.body.blog).toMatchObject({ hasUnpublishedChanges: false, working: { title: 'Original title' } })

    // Edit again and publish: now it is live
    await patch(h, post.id, { title: 'Edited title', content: 'Edited text.' })
    await publish(h, post.id)
    pub = (await publicPost(post.slug)).body.blog
    expect(pub).toMatchObject({ title: 'Edited title', content: 'Edited text.' })
    expect(pub.slug).toBe(post.slug) // the public address never changes when the title does
  })

  it('preview shows the working copy in the public shape, admin-only, uncached — and changes nothing public', async () => {
    const h = await adminAuth()
    const post = await create(h, { title: 'Draft title' })
    await patch(h, post.id, { content: 'Preview **body**.' })
    const prev = await request(app).get(`${B}/${post.id}/preview`).set(h)
    expect(prev.status).toBe(200)
    expect(prev.headers['cache-control']).toBe('no-store')
    expect(prev.body.blog).toMatchObject({ id: post.id, slug: post.slug, title: 'Draft title', content: 'Preview **body**.', contentFormat: 'markdown', preview: true })
    expect((await request(app).get(`${B}/${post.id}/preview`)).status).toBe(401)
    expect((await publicPost(post.slug)).status).toBe(404)
  })

  it('unpublish takes it offline everywhere but keeps the work; publish brings it back', async () => {
    const h = await adminAuth()
    const post = await create(h, { title: 'Going offline', featured: true })
    await publish(h, post.id)
    const off = await request(app).post(`${B}/${post.id}/unpublish`).set(h)
    expect(off.body.blog).toMatchObject({ status: 'unpublished', live: null, working: { title: 'Going offline' } })
    expect((await publicPost(post.slug)).status).toBe(404)
    expect((await request(app).get('/api/blog/featured')).body.blog).toBeNull()
    expect((await request(app).post(`${B}/${post.id}/unpublish`).set(h)).status).toBe(409) // already offline

    await patch(h, post.id, { title: 'Back online' })
    await publish(h, post.id)
    expect((await publicPost(post.slug)).body.blog.title).toBe('Back online')
  })

  it('“featured” only takes effect when published, like everything else', async () => {
    const h = await adminAuth()
    const a = await create(h, { title: 'Featured one', featured: true })
    await publish(h, a.id)
    const b = await create(h, { title: 'Newer post' })
    await publish(h, b.id)
    expect((await request(app).get('/api/blog/featured')).body.blog.title).toBe('Featured one')
    await patch(h, a.id, { featured: false })
    expect((await request(app).get('/api/blog/featured')).body.blog.title).toBe('Featured one') // still live until published
    await publish(h, a.id)
    expect((await request(app).get('/api/blog/featured')).body.blog.title).not.toBe('Featured one')
  })

  it('lets the admin set the date shown on the post', async () => {
    const h = await adminAuth()
    const post = await create(h)
    await patch(h, post.id, { publishedAt: '2026-03-15T09:00:00.000Z' })
    await publish(h, post.id)
    expect(new Date((await publicPost(post.slug)).body.blog.publishedAt).toISOString()).toBe('2026-03-15T09:00:00.000Z')
  })

  it('refuses a save based on a stale revision (409) and accepts the current one', async () => {
    const h = await adminAuth()
    const post = await create(h)
    const one = await patch(h, post.id, { title: 'One' }, { 'If-Match': String(post.rev) })
    expect(one.status).toBe(200)
    const stale = await patch(h, post.id, { title: 'Stale' }, { 'If-Match': String(post.rev) })
    expect(stale.status).toBe(409)
    expect(stale.body.code).toBe('REV_CONFLICT')
    expect((await request(app).get(`${B}/${post.id}`).set(h)).body.blog.working.title).toBe('One')
  })
})

describe('Admin blog — content rules (same whitelist as the CMS)', () => {
  it('accepts bold, italic, underline, headings, lists, quotes and links in formatted posts', async () => {
    const h = await adminAuth()
    const post = await create(h)
    const content = '## Titre\n\nDu **gras**, de l’*italique*, un mot <u>souligné</u> et un [lien](/atoopv).\n\n- une\n- deux\n\n1. un\n2. deux\n\n> Une citation.'
    const res = await patch(h, post.id, { content })
    expect(res.status, JSON.stringify(res.body)).toBe(200)
    expect(res.body.blog.working.content).toBe(content)
  })

  it('rejects anything that could inject markup, styles or scripts', async () => {
    const h = await adminAuth()
    const post = await create(h)
    for (const content of ['<script>alert(1)</script>', '<div style="color:red">x</div>', 'a <u class="x">b</u>', 'a <b>b</b>', '[x](javascript:alert(1))', '```\ncode\n```', '##### too deep']) {
      expect((await patch(h, post.id, { content })).status, content).toBe(422)
    }
    expect((await request(app).get(`${B}/${post.id}`).set(h)).body.blog.working.content).toBe('')
  })

  it('existing plain-text posts stay plain text: their format is kept and their text is not interpreted', async () => {
    const h = await adminAuth()
    const legacy = await Blog.create({ ...validPost({ title: 'Legacy post' }), slug: 'legacy-post', content: 'Line one\nLine <two> & **three**' })
    const detail = (await request(app).get(`${B}/${legacy._id}`).set(h)).body.blog
    expect(detail).toMatchObject({ status: 'published', live: { contentFormat: 'text' }, working: { contentFormat: 'text', content: 'Line one\nLine <two> & **three**' } })

    await patch(h, legacy._id, { title: 'Legacy post (edited)', content: 'Edited <text> & more' })
    expect((await publicPost('legacy-post')).body.blog).toMatchObject({ title: 'Legacy post', contentFormat: 'text', content: 'Line one\nLine <two> & **three**' })
    await publish(h, legacy._id)
    expect((await publicPost('legacy-post')).body.blog).toMatchObject({ title: 'Legacy post (edited)', contentFormat: 'text', content: 'Edited <text> & more' })
  })

  it('switching a post to formatted text validates the text as formatted text', async () => {
    const h = await adminAuth()
    const legacy = await Blog.create({ ...validPost(), slug: 'to-format', content: 'Has <script>x</script>' })
    expect((await patch(h, legacy._id, { contentFormat: 'markdown' })).status).toBe(422)
    expect((await patch(h, legacy._id, { contentFormat: 'markdown', content: 'Clean **text**' })).status).toBe(200)
  })
})

describe('Admin blog — cover image from the media library', () => {
  const upload = (h) => request(app).post('/api/admin/cms/media').set(h).attach('file', PNG, 'cover.png')

  it('accepts a media-library image, serves it publicly, and blocks deleting it while a post uses it', async () => {
    const h = await adminAuth()
    const media = (await upload(h)).body.media
    const post = await create(h, { imageUrl: media.path })
    await publish(h, post.id)
    expect((await publicPost(post.slug)).body.blog.imageUrl).toBe(media.path)
    expect((await request(app).get(media.path)).status).toBe(200)

    // used by the live post → cannot be deleted
    const blocked = await request(app).delete(`/api/admin/cms/media/${media.id}`).set(h)
    expect(blocked.status).toBe(409)
    expect(blocked.body.code).toBe('MEDIA_IN_USE')
    expect(blocked.body.issues.blogs.map((b) => b.title)).toEqual(['How ATOOPV reads a meeting'])
  })

  it('also protects an image that is only in an unpublished draft', async () => {
    const h = await adminAuth()
    const media = (await upload(h)).body.media
    await create(h, { imageUrl: media.path })
    expect((await request(app).delete(`/api/admin/cms/media/${media.id}`).set(h)).status).toBe(409)
  })

  it('an unused image can still be deleted', async () => {
    const h = await adminAuth()
    const media = (await upload(h)).body.media
    expect((await request(app).delete(`/api/admin/cms/media/${media.id}`).set(h)).status).toBe(200)
  })
})

describe('Admin blog — deleting', () => {
  it('a never-published post can be deleted for good', async () => {
    const h = await adminAuth()
    const post = await create(h)
    expect((await request(app).delete(`${B}/${post.id}`).set(h)).status).toBe(200)
    expect((await request(app).get(`${B}/${post.id}`).set(h)).status).toBe(404)
  })

  it('a published — or once-published — post cannot be deleted; unpublishing is the safe way to take it offline', async () => {
    const h = await adminAuth()
    const post = await create(h)
    await publish(h, post.id)
    const live = await request(app).delete(`${B}/${post.id}`).set(h)
    expect(live.status).toBe(409)
    expect(live.body.code).toBe('POST_PUBLISHED')
    await request(app).post(`${B}/${post.id}/unpublish`).set(h)
    expect((await request(app).delete(`${B}/${post.id}`).set(h)).status).toBe(409)
    expect((await request(app).get(`${B}/${post.id}`).set(h)).status).toBe(200)
  })

  it('malformed or unknown ids are 404', async () => {
    const h = await adminAuth()
    for (const id of ['nope', String(new mongoose.Types.ObjectId())]) {
      expect((await request(app).get(`${B}/${id}`).set(h)).status, id).toBe(404)
      expect((await request(app).delete(`${B}/${id}`).set(h)).status, id).toBe(404)
    }
  })

  it('lists posts with their status', async () => {
    const h = await adminAuth()
    const a = await create(h, { title: 'Alpha' })
    const b = await create(h, { title: 'Beta' })
    await publish(h, b.id)
    const list = (await request(app).get(B).set(h)).body.blogs
    expect(Object.fromEntries(list.map((p) => [p.working.title, p.status]))).toEqual({ Alpha: 'draft', Beta: 'published' })
    void a
  })
})

describe('Existing posts stored before the draft workflow existed', () => {
  // Inserted straight into the collection, exactly as older documents are stored: none of the new fields exist.
  const rawLegacy = (over = {}) => Blog.collection.insertOne({
    title: 'Ancien billet', slug: 'ancien-billet', excerpt: 'Résumé.', content: 'Ligne 1\nLigne 2', imageUrl: 'https://images.example.com/old.jpg',
    author: 'ATOOPV Team', featured: true, published: true, publishedAt: new Date('2025-11-02T10:00:00Z'), createdAt: new Date('2025-11-02'), updatedAt: new Date('2025-11-02'), __v: 0, ...over,
  })

  it('are served publicly exactly as before, as plain text', async () => {
    await rawLegacy()
    const pub = (await publicPost('ancien-billet')).body.blog
    expect(pub).toMatchObject({ title: 'Ancien billet', content: 'Ligne 1\nLigne 2', contentFormat: 'text', imageUrl: 'https://images.example.com/old.jpg', featured: true })
    expect((await request(app).get('/api/blog/featured')).body.blog.title).toBe('Ancien billet')
  })

  it('appear in the Admin as published posts, editable through a draft, and cannot be deleted', async () => {
    const h = await adminAuth()
    const { insertedId } = await rawLegacy()
    const list = (await request(app).get(B).set(h)).body.blogs
    expect(list.find((b) => b.id === String(insertedId))).toMatchObject({ status: 'published', hasUnpublishedChanges: false, everPublished: true, working: { title: 'Ancien billet', contentFormat: 'text' } })
    expect((await patch(h, insertedId, { title: 'Ancien billet (édité)' })).status).toBe(200)
    expect((await publicPost('ancien-billet')).body.blog.title).toBe('Ancien billet')
    expect((await request(app).delete(`${B}/${insertedId}`).set(h)).status).toBe(409)
  })

  it('an old unpublished draft (from the previous admin API) can be deleted, and can be published once complete', async () => {
    const h = await adminAuth()
    const a = (await rawLegacy({ slug: 'old-draft', published: false })).insertedId
    const b = (await rawLegacy({ slug: 'old-draft-2', title: 'Second', published: false })).insertedId
    expect((await request(app).delete(`${B}/${a}`).set(h)).status).toBe(200)
    expect((await publish(h, b)).status).toBe(200)
    expect((await publicPost('old-draft-2')).status).toBe(200)
  })
})
