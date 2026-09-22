import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { ClientReport } from '../src/models/ClientReport.js'

// The API's global limiter (120 req/min) is per app instance: a fresh app per test.
let app
beforeEach(async () => {
  app = createApp()
  // The shared teardown clears model collections only; GridFS ones must start empty too.
  for (const c of ['clientReports.files', 'clientReports.chunks']) await mongoose.connection.db.collection(c).deleteMany({})
})

async function makeUser(role = 'Member', over = {}) {
  const u = await User.create({ name: `${role} user`, email: `${role}+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role, ...over })
  return { user: u, auth: { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` } }
}

const PDF_TEXT = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'
const PDF = Buffer.from(PDF_TEXT)
const A = '/api/admin/customers'

const upload = (auth, clientId, { buf = PDF, name = 'rapport.pdf', type = 'application/pdf', title } = {}) => {
  const r = request(app).post(`${A}/${clientId}/client-reports`).set(auth)
  if (title !== undefined) r.field('title', title)
  return buf === null ? r : r.attach('file', buf, { filename: name, contentType: type })
}

describe('Client Reports — admin upload', () => {
  it('uploads a PDF for a client and lists it; the storage id and path are never exposed', async () => {
    const { auth } = await makeUser('admin')
    const { user: client } = await makeUser()
    const res = await upload(auth, client._id, { title: 'Rapport mensuel — mars' })
    expect(res.status, JSON.stringify(res.body)).toBe(201)
    expect(res.body.report).toMatchObject({ title: 'Rapport mensuel — mars', originalName: 'rapport.pdf', mimeType: 'application/pdf', sizeBytes: PDF.length, client: String(client._id) })
    expect(JSON.stringify(res.body)).not.toMatch(/gridFsId|clientReports|path/i)

    const list = await request(app).get(`${A}/${client._id}/client-reports`).set(auth)
    expect(list.body.reports.map((r) => r.title)).toEqual(['Rapport mensuel — mars'])
    expect((await ClientReport.findOne().lean()).uploadedBy).toBeTruthy()
  })

  it('uses the file name as the title when none is given, and keeps accents in it', async () => {
    const { auth } = await makeUser('admin')
    const { user: client } = await makeUser()
    const res = await upload(auth, client._id, { name: 'Bilan été 2026.pdf' })
    expect(res.status).toBe(201)
    expect(res.body.report.title).toBe('Bilan été 2026')
    expect(res.body.report.originalName).toBe('Bilan été 2026.pdf')
  })

  it('needs an existing client: unknown, malformed and admin accounts are all "not found", and nothing is stored', async () => {
    const { auth, user: adminUser } = await makeUser('admin')
    for (const id of [new mongoose.Types.ObjectId(), 'not-an-id', adminUser._id]) {
      expect((await upload(auth, id)).status, String(id)).toBe(404)
    }
    expect(await ClientReport.countDocuments()).toBe(0)
  })

  it('rejects anything that is not a real PDF (415) — by content type, by name and by the file’s own bytes', async () => {
    const { auth } = await makeUser('admin')
    const { user: client } = await makeUser()
    const bad = [
      { name: 'notes.txt', type: 'text/plain', buf: Buffer.from('hello') },
      { name: 'photo.png', type: 'image/png', buf: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
      { name: 'malware.exe', type: 'application/octet-stream', buf: Buffer.from('MZ....') },
      { name: 'renamed.pdf', type: 'application/pdf', buf: Buffer.from('this is not a pdf') }, // right name and type, wrong bytes
      { name: 'report.txt', type: 'application/pdf', buf: PDF }, // real PDF bytes but not a .pdf file
      { name: 'report.pdf', type: 'text/html', buf: PDF }, // wrong declared type
      { name: 'page.html', type: 'text/html', buf: Buffer.from('<script>alert(1)</script>') },
    ]
    for (const b of bad) {
      const res = await upload(auth, client._id, b)
      expect(res.status, b.name).toBe(415)
      expect(res.body.code).toBe('INVALID_FILE_TYPE')
    }
    expect(await ClientReport.countDocuments()).toBe(0)
    expect(await mongoose.connection.db.collection('clientReports.files').countDocuments()).toBe(0)
  })

  it('rejects an oversized file (413) and stores nothing', async () => {
    const { auth } = await makeUser('admin')
    const { user: client } = await makeUser()
    const big = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(26 * 1024 * 1024)])
    const res = await upload(auth, client._id, { buf: big })
    expect(res.status).toBe(413)
    expect(res.body.code).toBe('FILE_TOO_LARGE')
    expect(await ClientReport.countDocuments()).toBe(0)
    expect(await mongoose.connection.db.collection('clientReports.files').countDocuments()).toBe(0)
  })

  it('rejects a missing file, an empty file and an over-long title', async () => {
    const { auth } = await makeUser('admin')
    const { user: client } = await makeUser()
    expect((await upload(auth, client._id, { buf: null, title: 'sans fichier' })).status).toBe(400)
    expect((await upload(auth, client._id, { buf: Buffer.alloc(0) })).status).toBe(422)
    expect((await upload(auth, client._id, { title: 'x'.repeat(201) })).status).toBe(422)
    expect(await ClientReport.countDocuments()).toBe(0)
  })

  it('only admins can upload, list or delete: members get 403, visitors 401', async () => {
    const { user: client, auth: clientAuth } = await makeUser()
    const { auth: adminAuth } = await makeUser('admin')
    const rep = (await upload(adminAuth, client._id)).body.report
    for (const [method, path] of [['post', `${A}/${client._id}/client-reports`], ['get', `${A}/${client._id}/client-reports`], ['get', `/api/admin/client-reports/${rep.id}/file`], ['delete', `/api/admin/client-reports/${rep.id}`]]) {
      expect((await request(app)[method](path).set(clientAuth)).status, `${method} ${path} as client`).toBe(403)
      expect((await request(app)[method](path)).status, `${method} ${path} anonymous`).toBe(401)
    }
    expect(await ClientReport.countDocuments()).toBe(1)
  })
})

describe('Client Reports — a client only ever sees their own', () => {
  async function setup() {
    const admin = await makeUser('admin')
    const a = await makeUser()
    const b = await makeUser()
    const repA = (await upload(admin.auth, a.user._id, { title: 'Rapport de A' })).body.report
    const repB = (await upload(admin.auth, b.user._id, { title: 'Rapport de B' })).body.report
    return { admin, a, b, repA, repB }
  }

  it('lists only the signed-in client’s reports, with no storage details', async () => {
    const { a, b } = await setup()
    const mine = await request(app).get('/api/client-reports').set(a.auth)
    expect(mine.status).toBe(200)
    expect(mine.body.reports.map((r) => r.title)).toEqual(['Rapport de A'])
    expect(Object.keys(mine.body.reports[0]).sort()).toEqual(['createdAt', 'id', 'sizeBytes', 'title'])
    expect((await request(app).get('/api/client-reports').set(b.auth)).body.reports.map((r) => r.title)).toEqual(['Rapport de B'])
  })

  it('serves the PDF to its owner, inline, as a real PDF, never cached', async () => {
    const { a, repA } = await setup()
    const res = await request(app).get(`/api/client-reports/${repA.id}/file`).set(a.auth).buffer(true).parse((r, cb) => { const c = []; r.on('data', (d) => c.push(d)); r.on('end', () => cb(null, Buffer.concat(c))) })
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('application/pdf')
    expect(res.headers['content-disposition']).toMatch(/^inline;/)
    expect(res.headers['cache-control']).toBe('private, no-store')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(Buffer.compare(res.body, PDF)).toBe(0)
  })

  it('SECURITY: another client cannot open a report by id — the backend answers 404, exactly as for a report that does not exist', async () => {
    const { a, b, repA } = await setup()
    const other = await request(app).get(`/api/client-reports/${repA.id}/file`).set(b.auth)
    const missing = await request(app).get(`/api/client-reports/${new mongoose.Types.ObjectId()}/file`).set(b.auth)
    expect(other.status).toBe(404)
    expect(other.body).toEqual(missing.body)
    expect(other.headers['content-type']).toMatch(/json/) // never a PDF
    // and B's list never mentions A's report
    expect(JSON.stringify((await request(app).get('/api/client-reports').set(b.auth)).body)).not.toContain(repA.id)
    void a
  })

  it('SECURITY: no access without a valid session, on any client route', async () => {
    const { repA } = await setup()
    expect((await request(app).get('/api/client-reports')).status).toBe(401)
    expect((await request(app).get(`/api/client-reports/${repA.id}/file`)).status).toBe(401)
    expect((await request(app).get('/api/client-reports').set({ Authorization: 'Bearer nonsense' })).status).toBe(401)
    expect((await request(app).get(`/api/client-reports/${repA.id}/file`).set({ Authorization: 'Bearer nonsense' })).status).toBe(401)
    // there is no public URL to the stored file either
    expect((await request(app).get('/api/media/anything/x.pdf')).status).toBe(404)
  })

  it('SECURITY: an admin account is not a way around ownership on the client routes (they only see their own)', async () => {
    const { admin, repA } = await setup()
    expect((await request(app).get('/api/client-reports').set(admin.auth)).body.reports).toEqual([])
    expect((await request(app).get(`/api/client-reports/${repA.id}/file`).set(admin.auth)).status).toBe(404)
    // …but the admin routes do let an admin open it
    expect((await request(app).get(`/api/admin/client-reports/${repA.id}/file`).set(admin.auth)).status).toBe(200)
  })

  it('SECURITY: a suspended or disabled client loses access at once, and a token for a deleted account is refused', async () => {
    const { a, repA } = await setup()
    for (const status of ['suspended', 'disabled']) {
      await User.updateOne({ _id: a.user._id }, { status })
      expect((await request(app).get('/api/client-reports').set(a.auth)).status, status).toBe(403)
      expect((await request(app).get(`/api/client-reports/${repA.id}/file`).set(a.auth)).status, status).toBe(403)
    }
    await User.updateOne({ _id: a.user._id }, { status: 'active' })
    expect((await request(app).get('/api/client-reports').set(a.auth)).status).toBe(200)
    await User.deleteOne({ _id: a.user._id })
    expect((await request(app).get('/api/client-reports').set(a.auth)).status).toBe(401)
  })

  it('malformed report ids are just "not found"', async () => {
    const { a } = await setup()
    for (const id of ['abc', '../../etc/passwd', '123']) expect((await request(app).get(`/api/client-reports/${id}/file`).set(a.auth)).status, id).toBe(404)
  })
})

describe('Client Reports — removal', () => {
  it('removing a report ends access for the client and admin, and deletes the stored file', async () => {
    const admin = await makeUser('admin')
    const a = await makeUser()
    const rep = (await upload(admin.auth, a.user._id, { title: 'À supprimer' })).body.report
    const files = () => mongoose.connection.db.collection('clientReports.files').countDocuments()
    expect(await files()).toBe(1)
    expect((await request(app).get(`/api/client-reports/${rep.id}/file`).set(a.auth)).status).toBe(200)

    expect((await request(app).delete(`/api/admin/client-reports/${rep.id}`).set(admin.auth)).status).toBe(200)

    expect((await request(app).get('/api/client-reports').set(a.auth)).body.reports).toEqual([])
    expect((await request(app).get(`/api/client-reports/${rep.id}/file`).set(a.auth)).status).toBe(404)
    expect((await request(app).get(`/api/admin/client-reports/${rep.id}/file`).set(admin.auth)).status).toBe(404)
    expect((await request(app).get(`${A}/${a.user._id}/client-reports`).set(admin.auth)).body.reports).toEqual([])
    expect(await files()).toBe(0)
    expect(await mongoose.connection.db.collection('clientReports.chunks').countDocuments()).toBe(0)
    // removing twice, or a made-up id, is a clean 404
    expect((await request(app).delete(`/api/admin/client-reports/${rep.id}`).set(admin.auth)).status).toBe(404)
    expect((await request(app).delete('/api/admin/client-reports/nope').set(admin.auth)).status).toBe(404)
  })

  it('removing one client’s report leaves everyone else’s untouched', async () => {
    const admin = await makeUser('admin')
    const a = await makeUser()
    const b = await makeUser()
    const repA = (await upload(admin.auth, a.user._id)).body.report
    const repB = (await upload(admin.auth, b.user._id)).body.report
    await request(app).delete(`/api/admin/client-reports/${repA.id}`).set(admin.auth)
    expect((await request(app).get(`/api/client-reports/${repB.id}/file`).set(b.auth)).status).toBe(200)
  })

  it('a stored file that has gone missing answers 404 instead of hanging or crashing', async () => {
    const admin = await makeUser('admin')
    const a = await makeUser()
    const rep = (await upload(admin.auth, a.user._id)).body.report
    await mongoose.connection.db.collection('clientReports.files').deleteMany({})
    await mongoose.connection.db.collection('clientReports.chunks').deleteMany({})
    const res = await request(app).get(`/api/client-reports/${rep.id}/file`).set(a.auth)
    expect(res.status).toBe(404)
    expect(res.body.code).toBe('FILE_MISSING')
  })
})
