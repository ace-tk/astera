import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'

let app
beforeEach(() => { app = createApp() })

async function adminHeader() {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: 'admin', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}
const B = '/api/admin/cms'
const add = (h, from, to) => request(app).post(`${B}/redirects`).set(h).send({ from, to })
const publicList = async () => (await request(app).get('/api/cms/redirects')).body.redirects

describe('301 redirect manager', () => {
  it('is admin-only for writing, public (from/to/status only) for reading', async () => {
    expect((await request(app).post(`${B}/redirects`).send({ from: '/a', to: '/b' })).status).toBe(401)
    expect((await request(app).get(`${B}/redirects`)).status).toBe(401)
    const h = await adminHeader()
    const res = await add(h, '/services/guides/contenu-pv-cse/', '/services/guides/pv-cse-contenu-obligatoire')
    expect(res.status).toBe(201)
    expect(res.body.redirect).toMatchObject({ from: '/services/guides/contenu-pv-cse', to: '/services/guides/pv-cse-contenu-obligatoire', status: 301, source: 'manual' })
    const pub = await publicList()
    expect(pub).toEqual([{ from: '/services/guides/contenu-pv-cse', to: '/services/guides/pv-cse-contenu-obligatoire', status: 301 }])
  })

  it('lists redirects, optionally only those that point at one page', async () => {
    const h = await adminHeader()
    await add(h, '/old-1', '/new-a')
    await add(h, '/old-2', '/new-a')
    await add(h, '/old-3', '/new-b')
    const all = (await request(app).get(`${B}/redirects`).set(h)).body.redirects
    expect(all.map((r) => r.from)).toEqual(['/old-1', '/old-2', '/old-3'])
    const forA = (await request(app).get(`${B}/redirects?to=/new-a/`).set(h)).body.redirects
    expect(forA.map((r) => r.from)).toEqual(['/old-1', '/old-2'])
  })

  it('never builds chains: older redirects follow the new target, and a target that is redirected is resolved', async () => {
    const h = await adminHeader()
    await add(h, '/a', '/b')
    await add(h, '/b', '/c')                       // /a -> /b must now go straight to /c
    expect((await publicList()).find((r) => r.from === '/a').to).toBe('/c')
    await add(h, '/x', '/a')                       // /a is itself redirected: /x goes to the final target
    expect((await publicList()).find((r) => r.from === '/x').to).toBe('/c')
  })

  it('refuses loops, self-redirects, bad and reserved addresses', async () => {
    const h = await adminHeader()
    await add(h, '/p', '/q')
    const loop = await add(h, '/q', '/p')
    expect(loop.status).toBe(409)
    expect(loop.body.code).toBe('REDIRECT_LOOP')
    expect((await add(h, '/same', '/same/')).status).toBe(422)
    expect((await add(h, 'https://evil.example/x', '/y')).status).toBe(422)
    expect((await add(h, '//evil.example/x', '/y')).status).toBe(422)
    expect((await add(h, '/has space', '/y')).status).toBe(422)
    expect((await add(h, '/api/cms/index', '/y')).body.code).toBe('RESERVED_PATH')
    expect((await add(h, '/app/dashboard', '/y')).status).toBe(422)
    expect((await add(h, '/', '/y')).status).toBe(422)
    expect((await add(h, '/z', '/login')).body.code).toBe('RESERVED_PATH')
  })

  it('refuses to redirect away from an address where a page is published', async () => {
    const h = await adminHeader()
    const created = await request(app).post(`${B}/pages`).set(h).send({ templateKey: 'service-article', section: 'guides', slug: 'page-live-x', title: 'Page live X' })
    expect(created.status).toBe(201)
    const id = created.body.page.id
    expect((await request(app).post(`${B}/pages/${id}/publish`).set(h)).status).toBe(200)
    const res = await add(h, '/services/guides/page-live-x', '/services/guides/other')
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('PAGE_EXISTS')
  })

  it('deletes a redirect', async () => {
    const h = await adminHeader()
    const id = (await add(h, '/gone', '/here')).body.redirect.id
    expect((await request(app).delete(`${B}/redirects/${id}`).set(h)).status).toBe(200)
    expect(await publicList()).toEqual([])
    expect((await request(app).delete(`${B}/redirects/${id}`).set(h)).status).toBe(404)
    expect((await request(app).delete(`${B}/redirects/not-an-id`).set(h)).status).toBe(404)
  })
})
