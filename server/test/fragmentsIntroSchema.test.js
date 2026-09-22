import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'

let app
beforeEach(() => { app = createApp() })
const admin = async () => {
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}
const B = '/api/admin/cms/pages'

const validFragmentsIntro = (over = {}) => ({
  eyebrow: 'FORMATION 5 JOURS — DEPUIS 2017',
  titleLines: ['PROGRAMME', 'STRUCTURÉ.'],
  fragments: [
    { role: 'MODULE 01', text: 'Un', tag: 'A' }, { role: 'MODULE 02', text: 'Deux', tag: 'B' },
    { role: 'MODULE 03', text: 'Trois', tag: 'C' }, { role: 'MODULE 04', text: 'Quatre', tag: 'D' },
  ],
  groups: [{ label: 'CADRE JURIDIQUE' }, { label: 'MANDAT & PROTECTION' }],
  documentLabel: 'FICHE FORMATION',
  documentRows: [{ label: 'Durée', text: '5 jours' }, { label: 'Financement', text: 'CSE' }, { label: 'Agrément', text: 'NDA 84740456974' }, { label: 'Modules', text: '4' }],
  annotations: ['Une', 'Deux', 'Trois', 'Quatre'],
  documentMeta: 'AtooPV / Formation économique',
  statement: ['5 jours de formation.', 'Exercer pleinement leur mandat.'],
  ...over,
})

describe('service-article schema — fragmentsIntro (existing hardcoded intro text, admin-editable)', () => {
  it('is optional: a page without it still validates exactly as before', async () => {
    const h = await admin()
    const res = await request(app).post(B).set(h).send({ templateKey: 'service-article', section: 'training', slug: 'x1', title: 'X1', content: { badge: 'Services', body: 'Un texte.' } })
    expect(res.status, JSON.stringify(res.body)).toBe(201)
    expect(res.body.page.draft.content.fragmentsIntro).toBeUndefined()
  })

  it('accepts a fully-formed fragmentsIntro and stores it verbatim', async () => {
    const h = await admin()
    const res = await request(app).post(B).set(h).send({ templateKey: 'service-article', section: 'training', slug: 'x2', title: 'X2', content: { badge: 'Services', body: 'Un texte.', fragmentsIntro: validFragmentsIntro() } })
    expect(res.status, JSON.stringify(res.body)).toBe(201)
    expect(res.body.page.draft.content.fragmentsIntro).toEqual(validFragmentsIntro())
  })

  it('rejects the wrong number of fragments/groups/documentRows/annotations/statement/titleLines — the shape is FIXED, not admin-resizable', async () => {
    const h = await admin()
    const cases = {
      'one fragment too many': { fragments: [...validFragmentsIntro().fragments, { role: 'x', text: 'x', tag: 'x' }] },
      'one fragment too few': { fragments: validFragmentsIntro().fragments.slice(0, 3) },
      'one group too many': { groups: [...validFragmentsIntro().groups, { label: 'x' }] },
      'wrong titleLines length': { titleLines: ['only-one'] },
      'wrong statement length': { statement: ['only-one'] },
      'wrong documentRows length': { documentRows: validFragmentsIntro().documentRows.slice(0, 2) },
      'wrong annotations length': { annotations: ['only-one'] },
    }
    for (const [label, patch] of Object.entries(cases)) {
      const res = await request(app).post(B).set(h).send({ templateKey: 'service-article', section: 'training', slug: `bad-${label.replace(/\s+/g, '-')}`, title: 'Bad', content: { badge: 'Services', body: 'x', fragmentsIntro: validFragmentsIntro(patch) } })
      expect(res.status, label).toBe(422)
    }
  })

  it('rejects geometry/id/kind/group smuggled into a fragment — only role/text/tag are accepted (strict)', async () => {
    const h = await admin()
    const withGeometry = validFragmentsIntro()
    withGeometry.fragments[0] = { ...withGeometry.fragments[0], id: 'module1', stacked: { x: 1, y: 2, rotate: 3 } }
    const res = await request(app).post(B).set(h).send({ templateKey: 'service-article', section: 'training', slug: 'x3', title: 'X3', content: { badge: 'Services', body: 'x', fragmentsIntro: withGeometry } })
    expect(res.status).toBe(422)
  })

  it('draft → preview → publish: editing fragmentsIntro follows the exact same rules as body — never live until published', async () => {
    const h = await admin()
    const created = await request(app).post(B).set(h).send({ templateKey: 'service-article', section: 'training', slug: 'x4', title: 'X4', content: { badge: 'Services', body: 'x', fragmentsIntro: validFragmentsIntro() }, publish: true })
    const id = created.body.page.id

    const edited = validFragmentsIntro({ eyebrow: 'Nouvelle accroche' })
    await request(app).patch(`${B}/${id}`).set(h).send({ content: { fragmentsIntro: edited } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/services/training/x4' })).body.page.content.fragmentsIntro
    expect(stillLive.eyebrow).toBe(validFragmentsIntro().eyebrow) // unchanged until published

    const preview = await request(app).get(`${B}/${id}/preview`).set(h)
    expect(preview.body.page.content.fragmentsIntro.eyebrow).toBe('Nouvelle accroche')

    await request(app).post(`${B}/${id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/services/training/x4' })).body.page.content.fragmentsIntro
    expect(nowLive.eyebrow).toBe('Nouvelle accroche')
  })
})
