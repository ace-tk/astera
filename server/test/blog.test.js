import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Blog } from '../src/models/Blog.js'

const app = createApp()

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

describe('Admin blog CRUD', () => {
  it('rejects non-admins with 403', async () => {
    const passwordHash = await User.hashPassword('supersecret123')
    const u = await User.create({ name: 'Guest', email: `guest+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash })
    const token = jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })
    const res = await request(app).get('/api/admin/blogs').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('creates a post with a generated, unique slug', async () => {
    const token = await adminToken()
    const res = await request(app).post('/api/admin/blogs').set('Authorization', `Bearer ${token}`).send(validPost())
    expect(res.status).toBe(201)
    expect(res.body.blog.slug).toBe('how-atoopv-reads-a-meeting')

    const dup = await request(app).post('/api/admin/blogs').set('Authorization', `Bearer ${token}`).send(validPost())
    expect(dup.status).toBe(201)
    expect(dup.body.blog.slug).toBe('how-atoopv-reads-a-meeting-2')
  })

  it('validates required fields', async () => {
    const token = await adminToken()
    const res = await request(app).post('/api/admin/blogs').set('Authorization', `Bearer ${token}`).send({ title: 'Missing everything else' })
    expect(res.status).toBe(422)
  })

  it('lists, fetches, updates, and deletes a post', async () => {
    const token = await adminToken()
    const create = await request(app).post('/api/admin/blogs').set('Authorization', `Bearer ${token}`).send(validPost({ title: 'Lifecycle post' }))
    const id = create.body.blog.id

    const list = await request(app).get('/api/admin/blogs').set('Authorization', `Bearer ${token}`)
    expect(list.body.blogs.some((b) => b.id === id)).toBe(true)

    const detail = await request(app).get(`/api/admin/blogs/${id}`).set('Authorization', `Bearer ${token}`)
    expect(detail.body.blog.title).toBe('Lifecycle post')

    const update = await request(app).patch(`/api/admin/blogs/${id}`).set('Authorization', `Bearer ${token}`).send({ title: 'Updated title', featured: true })
    expect(update.body.blog.title).toBe('Updated title')
    expect(update.body.blog.featured).toBe(true)

    const del = await request(app).delete(`/api/admin/blogs/${id}`).set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(200)
    const gone = await request(app).get(`/api/admin/blogs/${id}`).set('Authorization', `Bearer ${token}`)
    expect(gone.status).toBe(404)
  })

  it('an update immediately changes what the public featured endpoint returns', async () => {
    const token = await adminToken()
    const create = await request(app).post('/api/admin/blogs').set('Authorization', `Bearer ${token}`).send(validPost({ title: 'Before edit', featured: true }))
    const id = create.body.blog.id

    const before = await request(app).get('/api/blog/featured')
    expect(before.body.blog.title).toBe('Before edit')

    await request(app).patch(`/api/admin/blogs/${id}`).set('Authorization', `Bearer ${token}`).send({ title: 'After edit', excerpt: 'New excerpt.' })

    const after = await request(app).get('/api/blog/featured')
    expect(after.body.blog.title).toBe('After edit')
    expect(after.body.blog.excerpt).toBe('New excerpt.')
  })
})
