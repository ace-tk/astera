import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Report } from '../src/models/Report.js'
import { ReportRequest } from '../src/models/ReportRequest.js'
import { saveAttachment } from '../src/services/attachments.js'

const app = createApp()

const SAMPLE_TRANSCRIPT = 'Maya: We decided to ship the billing rewrite. Sam: I will send metrics by Friday. There is a risk the vendor API changes.'

const adminToken = async () => {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: 'Admin', email: `admin+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role: 'admin' })
  return { token: jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' }), user: u }
}

const makeCustomer = async (overrides = {}) => {
  const passwordHash = await User.hashPassword('supersecret123')
  return User.create({
    name: 'Nina Weber',
    email: `customer+${new mongoose.Types.ObjectId()}@astera.dev`,
    passwordHash,
    ...overrides,
  })
}

const makeReport = async (ownerId, overrides = {}) =>
  Report.create({
    owner: ownerId,
    slug: `report-${new mongoose.Types.ObjectId()}`,
    title: 'Q3 Roadmap alignment',
    source: { fileName: 'roadmap.mp3', mimeType: 'audio/mpeg', sizeBytes: 4_200_000 },
    ...overrides,
  })

const makeAttachmentRequest = async (customerId, overrides = {}) => {
  const gridFsId = await saveAttachment(Buffer.from('fake audio bytes'), 'kickoff-call.mp3', 'audio/mpeg')
  return ReportRequest.create({
    customer: customerId,
    meetingName: 'Kickoff call',
    attachment: { fileName: 'kickoff-call.mp3', mimeType: 'audio/mpeg', sizeBytes: 17, gridFsId },
    ...overrides,
  })
}

describe('GET /api/admin/files — unified list', () => {
  it('merges Reports and Report Request attachments into one list', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    await makeReport(customer._id, { title: 'Merged report entry' })
    await makeAttachmentRequest(customer._id, { meetingName: 'Merged attachment entry' })

    const res = await request(app).get('/api/admin/files').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const kinds = res.body.files.map((f) => f.kind)
    expect(kinds).toEqual(expect.arrayContaining(['report', 'attachment']))
  })

  it('does not list a Report Request that has no attachment', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    await ReportRequest.create({ customer: customer._id, meetingName: 'Bare request, no upload' })

    const res = await request(app).get('/api/admin/files?q=Bare request').set('Authorization', `Bearer ${token}`)
    expect(res.body.files).toHaveLength(0)
  })

  it('searches across file name and customer name/email', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer({ name: 'Searchable Customer Co' })
    await makeReport(customer._id, { title: 'Unrelated title' })

    const res = await request(app).get('/api/admin/files?q=Searchable Customer').set('Authorization', `Bearer ${token}`)
    expect(res.body.files.length).toBeGreaterThan(0)
    expect(res.body.files.every((f) => f.customer?.name === 'Searchable Customer Co')).toBe(true)
  })

  it('filters by category (report vs audio attachment)', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    await makeReport(customer._id)
    await makeAttachmentRequest(customer._id)

    const reportsOnly = await request(app).get('/api/admin/files?category=report').set('Authorization', `Bearer ${token}`)
    expect(reportsOnly.body.files.every((f) => f.kind === 'report')).toBe(true)

    const audioOnly = await request(app).get('/api/admin/files?category=audio').set('Authorization', `Bearer ${token}`)
    expect(audioOnly.body.files.every((f) => f.kind === 'attachment' && f.category === 'audio')).toBe(true)

    const recordingsOnly = await request(app).get('/api/admin/files?category=recording').set('Authorization', `Bearer ${token}`)
    expect(recordingsOnly.body.files.every((f) => f.kind === 'attachment')).toBe(true)
  })

  it('filters by customer', async () => {
    const { token } = await adminToken()
    const customerA = await makeCustomer()
    const customerB = await makeCustomer()
    await makeReport(customerA._id, { title: 'Belongs to A' })
    await makeReport(customerB._id, { title: 'Belongs to B' })

    const res = await request(app).get(`/api/admin/files?customer=${customerA._id}`).set('Authorization', `Bearer ${token}`)
    expect(res.body.files.every((f) => f.customer?.id === String(customerA._id))).toBe(true)
    expect(res.body.files.some((f) => f.name === 'Belongs to A')).toBe(true)
  })

  it('sorts by name and by size', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    await makeReport(customer._id, { title: 'Zebra report', source: { sizeBytes: 100 } })
    await makeReport(customer._id, { title: 'Alpha report', source: { sizeBytes: 900 } })

    const byName = await request(app).get('/api/admin/files?category=report&sort=name').set('Authorization', `Bearer ${token}`)
    const names = byName.body.files.map((f) => f.name)
    expect(names.indexOf('Alpha report')).toBeLessThan(names.indexOf('Zebra report'))

    const bySize = await request(app).get('/api/admin/files?category=report&sort=size').set('Authorization', `Bearer ${token}`)
    expect(bySize.body.files[0].sizeBytes).toBeGreaterThanOrEqual(bySize.body.files[1].sizeBytes)
  })

  it('paginates results', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    for (let i = 0; i < 5; i++) await makeReport(customer._id, { title: `Page report ${i}` })

    const res = await request(app).get('/api/admin/files?category=report&pageSize=2&page=1').set('Authorization', `Bearer ${token}`)
    expect(res.body.files).toHaveLength(2)
    expect(res.body.total).toBeGreaterThanOrEqual(5)
    expect(res.body.page).toBe(1)
  })

  it('filters by report type', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    await makeReport(customer._id, { title: 'Essential one', reportType: 'Essential' })
    await makeReport(customer._id, { title: 'Compliance one', reportType: 'Compliance' })

    const res = await request(app).get('/api/admin/files?reportType=Compliance').set('Authorization', `Bearer ${token}`)
    expect(res.body.files.some((f) => f.name === 'Compliance one')).toBe(true)
    expect(res.body.files.some((f) => f.name === 'Essential one')).toBe(false)
  })

  it('rejects non-admins with 403', async () => {
    const customer = await makeCustomer()
    const token = jwt.sign({ sub: String(customer._id) }, env.jwtSecret, { expiresIn: '1h' })
    const res = await request(app).get('/api/admin/files').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })
})

describe('GET /api/admin/files/stats', () => {
  it('returns totalFiles/totalReports/archivedFiles/pendingProcessing/usedBytes/totalBytes', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    await makeReport(customer._id, { archived: true })
    await makeAttachmentRequest(customer._id)

    const res = await request(app).get('/api/admin/files/stats').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const { stats } = res.body
    expect(stats.totalFiles).toBeGreaterThanOrEqual(2)
    expect(stats.archivedFiles).toBeGreaterThanOrEqual(1)
    expect(stats.usedBytes).toBeGreaterThan(0)
    expect(stats.totalBytes).toBe(500 * 1024 * 1024 * 1024)
  })
})

describe('GET /api/admin/files/:id — detail', () => {
  it('returns a report-kind file with report payload, and transcript only when requested', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const report = await Report.create({
      owner: customer._id,
      slug: `report-${new mongoose.Types.ObjectId()}`,
      title: 'Detail report',
      transcript: 'the secret transcript text',
    })

    const plain = await request(app).get(`/api/admin/files/report:${report._id}`).set('Authorization', `Bearer ${token}`)
    expect(plain.status).toBe(200)
    expect(plain.body.file.kind).toBe('report')
    expect(plain.body.transcript).toBeUndefined()
    expect(JSON.stringify(plain.body.report)).not.toContain('secret transcript')

    const withTranscript = await request(app).get(`/api/admin/files/report:${report._id}?include=transcript`).set('Authorization', `Bearer ${token}`)
    expect(withTranscript.body.transcript).toBe('the secret transcript text')
  })

  it('returns an attachment-kind file with request payload', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const req_ = await makeAttachmentRequest(customer._id)

    const res = await request(app).get(`/api/admin/files/attachment:${req_._id}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.file.kind).toBe('attachment')
    expect(res.body.file.downloadable).toBe(true)
    expect(res.body.request.id).toBe(String(req_._id))
  })

  it('404s for an unknown or malformed id', async () => {
    const { token } = await adminToken()
    const res = await request(app).get(`/api/admin/files/report:${new mongoose.Types.ObjectId()}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
    const bad = await request(app).get('/api/admin/files/not-a-real-prefix:123').set('Authorization', `Bearer ${token}`)
    expect(bad.status).toBe(404)
  })
})

describe('rename / archive / delete', () => {
  it('renames a report (title) and an attachment (fileName)', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const report = await makeReport(customer._id)
    const req_ = await makeAttachmentRequest(customer._id)

    const r1 = await request(app).patch(`/api/admin/files/report:${report._id}/rename`).set('Authorization', `Bearer ${token}`).send({ name: 'Renamed report' })
    expect(r1.body.file.name).toBe('Renamed report')

    const r2 = await request(app).patch(`/api/admin/files/attachment:${req_._id}/rename`).set('Authorization', `Bearer ${token}`).send({ name: 'renamed-file.mp3' })
    expect(r2.body.file.name).toBe('renamed-file.mp3')
  })

  it('archives and unarchives a report; rejects archiving an attachment', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const report = await makeReport(customer._id)
    const req_ = await makeAttachmentRequest(customer._id)

    const archived = await request(app).patch(`/api/admin/files/report:${report._id}/archive`).set('Authorization', `Bearer ${token}`).send({ archived: true })
    expect(archived.body.file.archived).toBe(true)
    expect(archived.body.file.status).toBe('archived')

    const unarchived = await request(app).patch(`/api/admin/files/report:${report._id}/archive`).set('Authorization', `Bearer ${token}`).send({ archived: false })
    expect(unarchived.body.file.archived).toBe(false)

    const rejected = await request(app).patch(`/api/admin/files/attachment:${req_._id}/archive`).set('Authorization', `Bearer ${token}`).send({ archived: true })
    expect(rejected.status).toBe(400)
  })

  it('bulk-archives multiple reports', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const a = await makeReport(customer._id)
    const b = await makeReport(customer._id)

    const res = await request(app)
      .patch('/api/admin/files/bulk-archive')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [`report:${a._id}`, `report:${b._id}`], archived: true })
    expect(res.body.ok).toBe(true)
    expect(await Report.findById(a._id).then((r) => r.archived)).toBe(true)
    expect(await Report.findById(b._id).then((r) => r.archived)).toBe(true)
  })

  it('deletes a report outright', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const report = await makeReport(customer._id)

    const res = await request(app).delete(`/api/admin/files/report:${report._id}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(await Report.findById(report._id)).toBeNull()
  })

  it('deleting an attachment-kind file clears only the attachment, keeping the request', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const req_ = await makeAttachmentRequest(customer._id, { meetingName: 'Keep this request' })

    const res = await request(app).delete(`/api/admin/files/attachment:${req_._id}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)

    const stillThere = await ReportRequest.findById(req_._id)
    expect(stillThere).not.toBeNull()
    expect(stillThere.meetingName).toBe('Keep this request')
    expect(stillThere.attachment?.gridFsId).toBeUndefined()
  })

  it('404s deleting a file that does not exist', async () => {
    const { token } = await adminToken()
    const res = await request(app).delete(`/api/admin/files/report:${new mongoose.Types.ObjectId()}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('bulk-deletes a mix of report and attachment ids', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()
    const report = await makeReport(customer._id)
    const req_ = await makeAttachmentRequest(customer._id)

    const res = await request(app)
      .delete('/api/admin/files/bulk-delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [`report:${report._id}`, `attachment:${req_._id}`] })
    expect(res.body.deleted).toBe(2)
    expect(await Report.findById(report._id)).toBeNull()
    expect((await ReportRequest.findById(req_._id)).attachment?.gridFsId).toBeUndefined()
  })
})

describe('POST /api/admin/files/upload — admin uploads on behalf of a customer', () => {
  it('runs the same ingest pipeline as self-serve upload, owned by the chosen customer', async () => {
    const { token } = await adminToken()
    const customer = await makeCustomer()

    const res = await request(app)
      .post('/api/admin/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('customerId', String(customer._id))
      .field('title', 'Admin-uploaded meeting')
      .attach('media', Buffer.from(SAMPLE_TRANSCRIPT), { filename: 'meeting.txt', contentType: 'text/plain' })

    expect(res.status).toBe(201)
    expect(res.body.file.kind).toBe('report')
    expect(res.body.file.customer.id).toBe(String(customer._id))
    expect(res.body.file.name).toBe('Admin-uploaded meeting')

    const stored = await Report.findOne({ owner: customer._id })
    expect(stored).not.toBeNull()
    expect(stored.source.fileName).toBe('meeting.txt')

    // Shows up in the customer's own file list too — no duplicate storage.
    const list = await request(app).get(`/api/admin/files?customer=${customer._id}&category=report`).set('Authorization', `Bearer ${token}`)
    expect(list.body.files.some((f) => f.name === 'Admin-uploaded meeting')).toBe(true)
  })

  it('requires a valid customerId', async () => {
    const { token } = await adminToken()
    const res = await request(app)
      .post('/api/admin/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('customerId', 'not-an-id')
      .attach('media', Buffer.from(SAMPLE_TRANSCRIPT), { filename: 'meeting.txt', contentType: 'text/plain' })
    expect(res.status).toBe(422)
  })

  it('404s for a customer that does not exist', async () => {
    const { token } = await adminToken()
    const res = await request(app)
      .post('/api/admin/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('customerId', String(new mongoose.Types.ObjectId()))
      .attach('media', Buffer.from(SAMPLE_TRANSCRIPT), { filename: 'meeting.txt', contentType: 'text/plain' })
    expect(res.status).toBe(404)
  })
})
