import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Footer } from '../src/models/Footer.js'
import { DEFAULT_FOOTER_CONTENT } from '../src/cms/footerDefaults.js'
import { footerContentSchema } from '../src/cms/schemas.js'

// What the API actually returns: DEFAULT_FOOTER_CONTENT normalised through the same
// zod schema the server validates every save with (adds e.g. `newTab: false` to links).
const NORMALIZED_DEFAULT = footerContentSchema.parse(DEFAULT_FOOTER_CONTENT)

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

const A = '/api/admin/cms/footer'
const PUB = '/api/cms/footer'
const getAdmin = (h) => request(app).get(A).set(h)
const save = (h, content, rev) => request(app).patch(A).set(h).send({ content, ...(rev != null ? { rev } : {}) })
const publishF = (h) => request(app).post(`${A}/publish`).set(h)
const discardF = (h) => request(app).post(`${A}/discard`).set(h)
const publicF = () => request(app).get(PUB)

describe('footer CMS — access control', () => {
  it('admin footer endpoints reject anonymous (401) and non-admin (403)', async () => {
    expect((await request(app).get(A)).status).toBe(401)
    const m = await member()
    expect((await getAdmin(m)).status).toBe(403)
    expect((await save(m, DEFAULT_FOOTER_CONTENT)).status).toBe(403)
    expect((await publishF(m)).status).toBe(403)
    expect((await discardF(m)).status).toBe(403)
  })

  it('the public footer endpoint needs no authentication', async () => {
    expect((await publicF()).status).toBe(200)
  })

  it('the public endpoint never exposes draft/rev/admin metadata — only the live content', async () => {
    const res = await publicF()
    expect(res.body).toHaveProperty('footer')
    expect(res.body.footer).not.toHaveProperty('draft')
    expect(res.body.footer).not.toHaveProperty('live')
    expect(res.body.footer).not.toHaveProperty('rev')
    expect(res.body.footer).not.toHaveProperty('publishedRev')
    // it IS the content object itself (brand/contact/columns/…), not a wrapper around it
    expect(res.body.footer).toHaveProperty('brand')
    expect(res.body.footer).toHaveProperty('columns')
  })
})

describe('footer CMS — auto-seed (no separate "import" step)', () => {
  it('is seeded from the real site content the very first time it is read, in both draft and live', async () => {
    expect(await Footer.countDocuments()).toBe(0)
    const h = await admin()
    const res = await getAdmin(h)
    expect(res.status).toBe(200)
    expect(res.body.footer.draft.content).toEqual(NORMALIZED_DEFAULT)
    expect(res.body.footer.live.content).toEqual(NORMALIZED_DEFAULT)
    expect(res.body.footer.hasUnpublishedChanges).toBe(false)
    expect(await Footer.countDocuments()).toBe(1)
  })

  it('the public footer matches the seed exactly before any admin edit — the site never changes during migration', async () => {
    const res = await publicF()
    expect(res.body.footer).toEqual(NORMALIZED_DEFAULT)
  })

  it('reading twice does not create a second document or reset an edit', async () => {
    const h = await admin()
    await getAdmin(h)
    await save(h, { ...DEFAULT_FOOTER_CONTENT, brand: { ...DEFAULT_FOOTER_CONTENT.brand, tagline: 'Edited' } })
    await getAdmin(h)
    expect(await Footer.countDocuments()).toBe(1)
    const after = await getAdmin(h)
    expect(after.body.footer.draft.content.brand.tagline).toBe('Edited')
  })
})

describe('footer CMS — draft / publish / discard', () => {
  it('editing the draft does not change the public (live) footer until published', async () => {
    const h = await admin()
    const edited = { ...DEFAULT_FOOTER_CONTENT, copyrightText: '© {year} New Co.' }
    const res = await save(h, edited)
    expect(res.status).toBe(200)
    expect(res.body.footer.draft.content.copyrightText).toBe('© {year} New Co.')
    expect(res.body.footer.hasUnpublishedChanges).toBe(true)

    const pub = await publicF()
    expect(pub.body.footer.copyrightText).toBe(DEFAULT_FOOTER_CONTENT.copyrightText)
  })

  it('publishing copies the draft to live, and the public endpoint reflects it', async () => {
    const h = await admin()
    const edited = { ...DEFAULT_FOOTER_CONTENT, copyrightText: '© {year} New Co.' }
    await save(h, edited)
    const res = await publishF(h)
    expect(res.status).toBe(200)
    expect(res.body.footer.hasUnpublishedChanges).toBe(false)
    expect(res.body.footer.live.content.copyrightText).toBe('© {year} New Co.')

    const pub = await publicF()
    expect(pub.body.footer.copyrightText).toBe('© {year} New Co.')
  })

  it('discarding reverts the draft back to the currently-live content', async () => {
    const h = await admin()
    await save(h, { ...DEFAULT_FOOTER_CONTENT, copyrightText: '© {year} New Co.' })
    await publishF(h) // live now has "New Co."
    await save(h, { ...DEFAULT_FOOTER_CONTENT, copyrightText: '© {year} Yet another edit' })
    const res = await discardF(h)
    expect(res.status).toBe(200)
    expect(res.body.footer.draft.content.copyrightText).toBe('© {year} New Co.')
    expect(res.body.footer.hasUnpublishedChanges).toBe(false)
  })

  it('rejects a stale save with REV_CONFLICT when the rev does not match', async () => {
    const h = await admin()
    const first = await getAdmin(h)
    const res = await save(h, DEFAULT_FOOTER_CONTENT, first.body.footer.rev + 5)
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('REV_CONFLICT')
  })
})

describe('footer CMS — content CRUD (columns, links, legal links, social links)', () => {
  it('adds and removes a navigation column and its links', async () => {
    const h = await admin()
    const withNewColumn = {
      ...DEFAULT_FOOTER_CONTENT,
      columns: [
        ...DEFAULT_FOOTER_CONTENT.columns,
        { id: 'nouveau', title: 'Nouveau', links: [{ id: 'n1', label: 'Un lien', link: { type: 'external', url: 'https://example.com' } }] },
      ],
    }
    const res = await save(h, withNewColumn)
    expect(res.status).toBe(200)
    expect(res.body.footer.draft.content.columns).toHaveLength(4)
    await publishF(h)
    const pub = await publicF()
    expect(pub.body.footer.columns).toHaveLength(4)
    expect(pub.body.footer.columns[3].links[0].label).toBe('Un lien')

    // remove it again
    const removed = { ...withNewColumn, columns: DEFAULT_FOOTER_CONTENT.columns }
    await save(h, removed)
    await publishF(h)
    const pub2 = await publicF()
    expect(pub2.body.footer.columns).toHaveLength(3)
  })

  it('edits contact info, CTA, and legal link targets', async () => {
    const h = await admin()
    const edited = {
      ...DEFAULT_FOOTER_CONTENT,
      contact: { phoneDisplay: '01 02 03 04 05', phoneHref: 'tel:+33102030405', email: 'hello@atoopv.com' },
      cta: { label: 'Contactez-nous', link: { type: 'route', route: '/contact' } },
      legalLinks: DEFAULT_FOOTER_CONTENT.legalLinks.map((l) =>
        l.id === 'legal-mentions' ? { ...l, link: { type: 'route', route: '/legal/mentions' } } : l,
      ),
    }
    const res = await save(h, edited)
    expect(res.status).toBe(200)
    await publishF(h)
    const pub = await publicF()
    expect(pub.body.footer.contact.email).toBe('hello@atoopv.com')
    expect(pub.body.footer.cta.label).toBe('Contactez-nous')
    expect(pub.body.footer.legalLinks.find((l) => l.id === 'legal-mentions').link).toEqual({ type: 'route', route: '/legal/mentions', newTab: false })
    // the untouched legal links keep their '#' placeholder — nothing was silently invented
    expect(pub.body.footer.legalLinks.find((l) => l.id === 'legal-cgv').link.url).toBe('#')
  })

  it('adds a social link, and it is optional — an empty list is valid', async () => {
    const h = await admin()
    expect((await getAdmin(h)).body.footer.live.content.social).toEqual([])

    const withSocial = {
      ...DEFAULT_FOOTER_CONTENT,
      social: [{ id: 's1', platform: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/company/atoopv', enabled: true }],
    }
    await save(h, withSocial)
    await publishF(h)
    const pub = await publicF()
    expect(pub.body.footer.social).toHaveLength(1)
    expect(pub.body.footer.social[0].platform).toBe('LinkedIn')
  })
})

describe('footer CMS — validation', () => {
  it('rejects a link that references a CMS page (not resolvable on the public footer)', async () => {
    const h = await admin()
    const bad = { ...DEFAULT_FOOTER_CONTENT, cta: { label: 'X', link: { type: 'page', pageId: '507f1f77bcf86cd799439011' } } }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('VALIDATION_FAILED')
  })

  it('rejects duplicate ids within the footer content', async () => {
    const h = await admin()
    const bad = {
      ...DEFAULT_FOOTER_CONTENT,
      columns: [DEFAULT_FOOTER_CONTENT.columns[0], { ...DEFAULT_FOOTER_CONTENT.columns[1], id: DEFAULT_FOOTER_CONTENT.columns[0].id }],
    }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('VALIDATION_FAILED')
  })

  it('rejects more than the maximum number of columns', async () => {
    const h = await admin()
    const bad = {
      ...DEFAULT_FOOTER_CONTENT,
      columns: Array.from({ length: 7 }, (_, i) => ({ id: `c${i}`, title: `C${i}`, links: [] })),
    }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
  })

  it('rejects an external social URL that is not http(s)/mailto/tel', async () => {
    const h = await admin()
    const bad = { ...DEFAULT_FOOTER_CONTENT, social: [{ id: 's1', platform: 'X', icon: 'other', url: 'javascript:alert(1)', enabled: true }] }
    const res = await save(h, bad)
    expect(res.status).toBe(422)
  })

  it('publish re-validates the draft (it cannot publish something invalid)', async () => {
    // Force an invalid draft directly at the DB layer, bypassing the API's own validation,
    // to prove publishFooter() itself still refuses to promote bad content to live.
    const h = await admin()
    await getAdmin(h) // ensure seeded
    const doc = await Footer.findOne()
    doc.draft = { content: { ...DEFAULT_FOOTER_CONTENT, brand: { tagline: 'x'.repeat(300), location: '' } } }
    doc.markModified('draft')
    await doc.save()
    const res = await publishF(h)
    expect(res.status).toBe(422)
  })
})
