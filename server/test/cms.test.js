import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Menu } from '../src/models/Menu.js'
import { Page } from '../src/models/Page.js'
import { fixedItems } from './fixedMenusFixture.js'

// A fresh app per test: the API's global rate limiter (120 req/min) is per instance,
// and this suite makes more requests than that in total.
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

const BASE = '/api/admin/cms'
const newPage = (over = {}) => ({
  templateKey: 'service-article',
  section: 'drafting',
  slug: 'ma-nouvelle-page',
  title: 'Ma nouvelle page',
  ...over,
})

async function create(h, over) {
  const res = await request(app).post(`${BASE}/pages`).set(h).send(newPage(over))
  expect(res.status, JSON.stringify(res.body)).toBe(201)
  return res.body.page
}
const patch = (h, id, body, rev) =>
  request(app).patch(`${BASE}/pages/${id}`).set(h).set(rev != null ? { 'If-Match': String(rev) } : {}).send(body)
const publish = (h, id) => request(app).post(`${BASE}/pages/${id}/publish`).set(h)
const publicPage = (path) => request(app).get('/api/cms/pages').query({ path })

// A 1x1 transparent PNG.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

describe('access control', () => {
  it('admin endpoints reject anonymous (401) and non-admin (403) users', async () => {
    expect((await request(app).get(`${BASE}/pages`)).status).toBe(401)
    const member = { Authorization: `Bearer ${await tokenFor('Member')}` }
    expect((await request(app).get(`${BASE}/pages`).set(member)).status).toBe(403)
    expect((await request(app).post(`${BASE}/pages`).set(member).send(newPage())).status).toBe(403)
    expect((await request(app).get(`${BASE}/menus/main`).set(member)).status).toBe(403)
    expect((await request(app).post(`${BASE}/media`).set(member)).status).toBe(403)
  })

  it('public content endpoints need no authentication', async () => {
    expect((await request(app).get('/api/cms/index')).status).toBe(200)
    expect((await request(app).get('/api/cms/menus/main')).status).toBe(200)
  })
})

describe('templates are code, not data', () => {
  it('lists only the approved templates, with their sections and fields', async () => {
    const res = await request(app).get(`${BASE}/templates`).set(await admin())
    expect(res.status).toBe(200)
    expect(res.body.templates.map((t) => t.key)).toEqual(['service-article', 'ressources-article'])
    const t = res.body.templates[0]
    expect(t.creatable).toBe(true)
    expect(t.sections.map((s) => s.key)).toEqual(['drafting', 'by-city', 'tarifs-infos', 'training', 'communication', 'guides'])
    expect(t.fields.map((f) => f.key)).toEqual(['badge', 'body'])
    expect(t.pathPattern).toBe('/services/:section/:slug')
  })

  it('exposes no way to create, edit or delete a template', async () => {
    const h = await admin()
    for (const method of ['post', 'put', 'patch', 'delete']) {
      const res = await request(app)[method](`${BASE}/templates`).set(h).send({ key: 'mine', name: 'Mine' })
      expect(res.status, method).toBe(404)
      const one = await request(app)[method](`${BASE}/templates/service-article`).set(h).send({ name: 'Hacked' })
      expect(one.status, method).toBe(404)
    }
  })

  it('a page cannot be created from an unknown template (including prototype keys)', async () => {
    const h = await admin()
    for (const templateKey of ['custom-layout', '__proto__', 'constructor', 'toString']) {
      const res = await request(app).post(`${BASE}/pages`).set(h).send(newPage({ templateKey }))
      expect(res.status, templateKey).toBe(422)
      expect(res.body.code).toBe('UNKNOWN_TEMPLATE')
    }
    expect(await Page.countDocuments()).toBe(0)
  })

  it('rejects a section that does not belong to the template', async () => {
    const res = await request(app).post(`${BASE}/pages`).set(await admin()).send(newPage({ section: 'landing' }))
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('INVALID_SECTION')
  })
})

describe('page creation stays inside the approved templates', () => {
  it('an existing page cannot be switched to another template or section, and no custom layout field is accepted', async () => {
    const h = await admin()
    const page = await create(h)
    const res = await patch(h, page.id, { templateKey: 'ressources-article', section: 'ressources', layout: 'wide', template: 'custom', content: { body: 'ok' } })
    expect(res.status).toBe(200)
    const after = (await request(app).get(`${BASE}/pages/${page.id}`).set(h)).body.page
    expect(after).toMatchObject({ templateKey: 'service-article', section: 'drafting', path: page.path })
    expect(after.layout).toBeUndefined()
    expect(after.draft.content.body).toBe('ok')
    expect(Object.keys(after.draft.content).sort()).toEqual(['badge', 'body'])
  })

  it('only the approved templates can be chosen when adding a page, whatever the request says', async () => {
    const h = await admin()
    const list = (await request(app).get(`${BASE}/templates`).set(h)).body.templates
    expect(list.map((t) => t.key).sort()).toEqual(['ressources-article', 'service-article'])
    for (const templateKey of ['custom', 'page-builder', '__proto__', 'constructor', '']) {
      const res = await request(app).post(`${BASE}/pages`).set(h).send(newPage({ templateKey }))
      expect([404, 422], templateKey).toContain(res.status)
    }
    expect((await request(app).post(`${BASE}/templates`).set(h).send({ key: 'mine' })).status).toBe(404)
  })
})

describe('creating pages', () => {
  it('creates a draft at the template path, unpublished and not publicly visible', async () => {
    const h = await admin()
    const page = await create(h)
    expect(page.status).toBe('draft')
    expect(page.path).toBe('/services/drafting/ma-nouvelle-page')
    expect(page.live).toBeNull()
    expect(page.draft.content).toEqual({ badge: 'Services', body: '' }) // the hero label every existing Service page shows
    expect((await publicPage(page.path)).status).toBe(404)
    expect((await request(app).get('/api/cms/index')).body.pages).toEqual([])
  })

  it('validates the address, title and reserved/duplicate slugs', async () => {
    const h = await admin()
    const cases = [
      [{ slug: 'Has Spaces' }, 422],
      [{ slug: 'UPPER' }, 422],
      [{ slug: 'a--b' }, 422],
      [{ slug: '' }, 422],
      [{ title: '   ' }, 422],
      [{ slug: 'redaction-pv-cssct' }, 409], // exists in the bundled content
      [{ slug: 'preview' }, 409],
    ]
    for (const [over, status] of cases) {
      const res = await request(app).post(`${BASE}/pages`).set(h).send(newPage(over))
      expect(res.status, JSON.stringify(over)).toBe(status)
    }
    await create(h)
    const dup = await request(app).post(`${BASE}/pages`).set(h).send(newPage())
    expect(dup.status).toBe(409)
    expect(dup.body.code).toBe('PATH_TAKEN')
    // same slug in a different section is a different URL
    expect((await request(app).post(`${BASE}/pages`).set(h).send(newPage({ section: 'guides' }))).status).toBe(201)
  })

  it('rejects unknown content fields — nothing can be smuggled in (no styles, layout, html)', async () => {
    const h = await admin()
    const page = await create(h)
    for (const content of [{ style: 'color:red' }, { className: 'x' }, { layout: 'wide' }, { html: '<b>x</b>' }, { sections: [] }]) {
      const res = await patch(h, page.id, { content })
      expect(res.status, JSON.stringify(content)).toBe(422)
    }
  })
})

describe('rich text', () => {
  it('stores bold, italic, headings, lists, links and quotes verbatim', async () => {
    const h = await admin()
    const page = await create(h)
    const body = [
      '## Un titre',
      '',
      'Du **gras**, de l’*italique* et un [lien interne](/services/drafting/x) ou [externe](https://example.com).',
      '',
      '### Sous-titre',
      '',
      '- puce un',
      '- puce deux',
      '',
      '1. premier',
      '2. second',
      '',
      '> Une citation.',
    ].join('\n')
    const res = await patch(h, page.id, { content: { badge: 'Rédaction PV', body } })
    expect(res.status).toBe(200)
    expect(res.body.page.draft.content.body).toBe(body)
    expect(res.body.page.draft.content.badge).toBe('Rédaction PV')
  })

  it('rejects anything that could inject markup, styles or scripts', async () => {
    const h = await admin()
    const page = await create(h)
    const attacks = [
      '<script>alert(1)</script>',
      '<div style="color:red">x</div>',
      '<img src=x onerror=alert(1)>',
      '[click](javascript:alert(1))',
      '![x](data:text/html;base64,AAAA)',
      '```\ncode block\n```',
      '##### too deep',
      'text[^1]\n\n[^1]: footnote',
    ]
    for (const body of attacks) {
      const res = await patch(h, page.id, { content: { body } })
      expect(res.status, body).toBe(422)
    }
    // Nothing was saved by the failed attempts.
    expect((await request(app).get(`${BASE}/pages/${page.id}`).set(h)).body.page.draft.content.body).toBe('')
  })

  it('stores underline as <u>…</u>, publishes it, and keeps it out of excerpts', async () => {
    const h = await admin()
    const page = await create(h)
    const body = [
      'Un mot <u>souligné</u> et **du gras**, <u>**gras souligné**</u> et [<u>un lien</u>](/services/x).',
      '',
      '## Titre <u>souligné</u>',
      '',
      '- puce <u>soulignée</u>',
    ].join('\n')
    const res = await patch(h, page.id, { content: { body } })
    expect(res.status, JSON.stringify(res.body)).toBe(200)
    expect(res.body.page.draft.content.body).toBe(body)
    expect((await publish(h, page.id)).status).toBe(200)
    const live = (await publicPage(res.body.page.path)).body.page
    expect(live.content.body).toBe(body)
    // The teaser used in listings is plain text: no tags leak into it.
    expect((await request(app).get('/api/cms/index').set(h)).body.pages.find((p) => p.slug === page.slug).excerpt).toBe('Un mot souligné et du gras, gras souligné et un lien.')
  })

  it('keeps bold, italic and underline inside FAQ answers through draft → preview → publish → public, byte for byte', async () => {
    const h = await admin()
    const page = await create(h, { section: 'training', slug: 'formation-faq', title: 'Formation FAQ' })
    const body = [
      'Introduction.',
      '',
      'Cliquez sur une question pour afficher la réponse.',
      '',
      'Le PV est-il obligatoire ?',
      '',
      'Oui, il est **obligatoire** et <u>doit être approuvé</u> par *les élus*.',
      '',
      'Qui le rédige ?',
      '',
      '<u>**Un tiers**</u>, sans <u>enjeu</u> dans les débats.',
    ].join('\n')
    const saved = await patch(h, page.id, { content: { body } })
    expect(saved.status, JSON.stringify(saved.body)).toBe(200)
    expect(saved.body.page.draft.content.body).toBe(body)
    const preview = await request(app).get(`${BASE}/pages/${page.id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe(body)
    expect((await publicPage(saved.body.page.path)).status).toBe(404) // still a draft
    expect((await publish(h, page.id)).status).toBe(200)
    expect((await publicPage(saved.body.page.path)).body.page.content.body).toBe(body)
    // The same rules apply inside an answer: no attributes, no other tags, balanced only.
    for (const bad of ['Oui <u class="x">non</u>.', 'Oui <b>non</b>.', 'Oui <u>non.']) {
      const res = await patch(h, page.id, { content: { body: body.replace('Oui, il est **obligatoire** et <u>doit être approuvé</u> par *les élus*.', bad) } })
      expect(res.status, bad).toBe(422)
    }
  })

  it('accepts ONLY a balanced, attribute-free <u>…</u> as raw HTML', async () => {
    const h = await admin()
    const page = await create(h)
    const rejected = [
      'a <u class="x">b</u>',
      'a <u style="color:red">b</u>',
      'a <U>b</U>',
      'a <u >b</u>',
      'a <u>b',
      'a b</u>',
      '<u><u>a</u></u>',
      'a <u>b\n\nc</u>',
      '<u>\n\ntexte\n\n</u>',
      'a <b>b</b>',
      'a <span>b</span>',
      'a <a href="https://x.fr">b</a>',
      'a <u onclick="alert(1)">b</u>',
      'a <u><script>alert(1)</script></u>',
    ]
    for (const body of rejected) {
      expect((await patch(h, page.id, { content: { body } })).status, body).toBe(422)
    }
    expect((await request(app).get(`${BASE}/pages/${page.id}`).set(h)).body.page.draft.content.body).toBe('')
  })

  it('rejects multi-line values for single-line fields', async () => {
    const h = await admin()
    const page = await create(h)
    expect((await patch(h, page.id, { content: { badge: 'a\nb' } })).status).toBe(422)
    expect((await patch(h, page.id, { title: 'a\nb' })).status).toBe(422)
  })
})

describe('draft → preview → publish → unpublish', () => {
  it('keeps live content separate from the draft until Publish', async () => {
    const h = await admin()
    const page = await create(h)
    await patch(h, page.id, { content: { badge: 'V1', body: 'Version un' } })
    const pub = await publish(h, page.id)
    expect(pub.status).toBe(200)
    expect(pub.body.page.status).toBe('published')
    expect(pub.body.page.hasUnpublishedChanges).toBe(false)

    // Public now serves v1.
    let live = await publicPage(page.path)
    expect(live.status).toBe(200)
    expect(live.body.page.content).toEqual({ badge: 'V1', body: 'Version un' })
    expect(live.body.page.title).toBe('Ma nouvelle page')
    expect(live.body.page.draft).toBeUndefined() // the public shape never exposes the draft

    // Edit the draft: public is unchanged, admin sees unpublished changes.
    const edit = await patch(h, page.id, { title: 'Titre modifié', content: { body: 'Version deux' } })
    expect(edit.body.page.hasUnpublishedChanges).toBe(true)
    live = await publicPage(page.path)
    expect(live.body.page.title).toBe('Ma nouvelle page')
    expect(live.body.page.content.body).toBe('Version un')

    // Preview shows the draft (admin only, never cached).
    const prev = await request(app).get(`${BASE}/pages/${page.id}/preview`).set(h)
    expect(prev.status).toBe(200)
    expect(prev.body.page.title).toBe('Titre modifié')
    expect(prev.body.page.content.body).toBe('Version deux')
    expect(prev.headers['cache-control']).toBe('no-store')
    expect((await request(app).get(`${BASE}/pages/${page.id}/preview`)).status).toBe(401)

    // Publish v2.
    await publish(h, page.id)
    live = await publicPage(page.path)
    expect(live.body.page.title).toBe('Titre modifié')
    expect(live.body.page.content.body).toBe('Version deux')
  })

  it('unpublish takes the page offline but keeps the draft', async () => {
    const h = await admin()
    const page = await create(h)
    await patch(h, page.id, { content: { body: 'Contenu' } })
    await publish(h, page.id)
    expect((await publicPage(page.path)).status).toBe(200)

    const un = await request(app).post(`${BASE}/pages/${page.id}/unpublish`).set(h)
    expect(un.body.page.status).toBe('draft')
    expect((await publicPage(page.path)).status).toBe(404)
    expect((await request(app).get('/api/cms/index')).body.pages).toEqual([])
    expect(un.body.page.draft.content.body).toBe('Contenu')

    // Can go live again.
    await publish(h, page.id)
    expect((await publicPage(page.path)).status).toBe(200)
  })

  it('discard-draft returns to the published version', async () => {
    const h = await admin()
    const page = await create(h)
    await patch(h, page.id, { content: { body: 'Publié' } })
    await publish(h, page.id)
    await patch(h, page.id, { content: { body: 'Brouillon jamais publié' } })
    const res = await request(app).post(`${BASE}/pages/${page.id}/discard-draft`).set(h)
    expect(res.body.page.draft.content.body).toBe('Publié')
    expect(res.body.page.hasUnpublishedChanges).toBe(false)
    // and refuses when there is nothing published
    const fresh = await create(h, { slug: 'autre-page' })
    expect((await request(app).post(`${BASE}/pages/${fresh.id}/discard-draft`).set(h)).status).toBe(409)
  })

  it('the public index lists only published pages', async () => {
    const h = await admin()
    const a = await create(h, { slug: 'page-a' })
    await create(h, { slug: 'page-b' })
    await publish(h, a.id)
    const idx = await request(app).get('/api/cms/index')
    expect(idx.body.pages.map((p) => p.slug)).toEqual(['page-a'])
  })

  it('public pages always revalidate (a Publish is visible immediately) and support conditional requests', async () => {
    const h = await admin()
    const page = await create(h)
    await publish(h, page.id)
    const res = await publicPage(page.path)
    expect(res.headers['cache-control']).toBe('public, max-age=0, must-revalidate')
    expect(res.headers.etag).toBeTruthy()
    const again = await publicPage(page.path).set('If-None-Match', res.headers.etag)
    expect(again.status).toBe(304)
    // after a new publish the ETag changes, so caches cannot serve the old copy
    await patch(h, page.id, { content: { body: 'Nouveau' } })
    await publish(h, page.id)
    const changed = await publicPage(page.path).set('If-None-Match', res.headers.etag)
    expect(changed.status).toBe(200)
    expect(changed.body.page.content.body).toBe('Nouveau')
  })
})

describe('renaming', () => {
  it('a title rename goes live only on publish', async () => {
    const h = await admin()
    const page = await create(h)
    await publish(h, page.id)
    await patch(h, page.id, { title: 'Nouveau nom' })
    expect((await publicPage(page.path)).body.page.title).toBe('Ma nouvelle page')
    await publish(h, page.id)
    expect((await publicPage(page.path)).body.page.title).toBe('Nouveau nom')
  })

  it('changing the address of a published page redirects the old URL', async () => {
    const h = await admin()
    const page = await create(h)
    await publish(h, page.id)
    const edit = await patch(h, page.id, { slug: 'adresse-modifiee' })
    expect(edit.status).toBe(200)
    // Until published the public URL is unchanged.
    expect((await publicPage('/services/drafting/ma-nouvelle-page')).body.page).toBeDefined()

    const pub = await publish(h, page.id)
    expect(pub.body.page.path).toBe('/services/drafting/adresse-modifiee')
    expect((await publicPage('/services/drafting/adresse-modifiee')).status).toBe(200)
    const old = await publicPage('/services/drafting/ma-nouvelle-page')
    expect(old.status).toBe(200)
    expect(old.body.redirect).toEqual({ to: '/services/drafting/adresse-modifiee', status: 301 })
  })

  it('an unpublished page just moves; a taken address is refused', async () => {
    const h = await admin()
    const a = await create(h, { slug: 'page-a' })
    await create(h, { slug: 'page-b' })
    const moved = await patch(h, a.id, { slug: 'page-c' })
    expect(moved.body.page.path).toBe('/services/drafting/page-c')
    const clash = await patch(h, a.id, { slug: 'page-b' })
    expect(clash.status).toBe(409)
    expect(clash.body.code).toBe('PATH_TAKEN')
    expect((await patch(h, a.id, { slug: 'redaction-pv-cse' })).status).toBe(409)
  })
})

describe('concurrent editing', () => {
  it('refuses a save based on a stale revision (409) and accepts the current one', async () => {
    const h = await admin()
    const page = await create(h)
    const first = await patch(h, page.id, { title: 'Un' }, page.rev)
    expect(first.status).toBe(200)
    const stale = await patch(h, page.id, { title: 'Deux' }, page.rev)
    expect(stale.status).toBe(409)
    expect(stale.body.code).toBe('REV_CONFLICT')
    expect((await patch(h, page.id, { title: 'Deux' }, first.body.page.rev)).status).toBe(200)
  })
})

describe('removing pages', () => {
  it('DELETE archives (reversible), frees the address and takes the page offline', async () => {
    const h = await admin()
    const page = await create(h)
    await publish(h, page.id)
    const res = await request(app).delete(`${BASE}/pages/${page.id}`).set(h)
    expect(res.body.page.status).toBe('archived')
    expect((await publicPage(page.path)).status).toBe(404)
    expect((await request(app).get(`${BASE}/pages`).set(h)).body.pages).toHaveLength(0)
    expect((await request(app).get(`${BASE}/pages`).query({ status: 'archived' }).set(h)).body.pages).toHaveLength(1)

    // The address can be reused, and the archived page can no longer be edited.
    await create(h)
    expect((await patch(h, page.id, { title: 'x' })).status).toBe(409)
    // Restoring would collide now.
    expect((await request(app).post(`${BASE}/pages/${page.id}/restore`).set(h)).status).toBe(409)
  })

  it('archive can leave a redirect for visitors of the removed page', async () => {
    const h = await admin()
    const page = await create(h)
    await publish(h, page.id)
    await request(app).delete(`${BASE}/pages/${page.id}`).query({ redirectTo: '/services/drafting' }).set(h)
    const gone = await publicPage(page.path)
    expect(gone.body.redirect.to).toBe('/services/drafting')
  })

  it('an archived page can be restored as a draft', async () => {
    const h = await admin()
    const page = await create(h)
    await request(app).delete(`${BASE}/pages/${page.id}`).set(h)
    const res = await request(app).post(`${BASE}/pages/${page.id}/restore`).set(h)
    expect(res.body.page.status).toBe('draft')
  })

  it('only a never-published page can be permanently deleted', async () => {
    const h = await admin()
    const draftOnly = await create(h, { slug: 'jamais-publiee' })
    expect((await request(app).delete(`${BASE}/pages/${draftOnly.id}`).query({ permanent: '1' }).set(h)).status).toBe(200)
    expect(await Page.countDocuments()).toBe(0)

    const wasLive = await create(h, { slug: 'deja-publiee' })
    await publish(h, wasLive.id)
    await request(app).post(`${BASE}/pages/${wasLive.id}/unpublish`).set(h)
    const res = await request(app).delete(`${BASE}/pages/${wasLive.id}`).query({ permanent: '1' }).set(h)
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('WAS_PUBLISHED')
    expect(await Page.countDocuments()).toBe(1)
  })

  it('reports what links to a page', async () => {
    const h = await admin()
    const target = await create(h, { slug: 'cible' })
    await create(h, { slug: 'source' }).then((p) =>
      patch(h, p.id, { content: { body: `Voir [la cible](${target.path}).` } }),
    )
    const res = await request(app).get(`${BASE}/pages/${target.id}/usages`).set(h)
    expect(res.body.usages.pages).toHaveLength(1)
    expect(res.body.usages.pages[0].title).toBe('Ma nouvelle page')
  })
})

describe('duplicate and history', () => {
  it('duplicates a page as a new draft with a free address', async () => {
    const h = await admin()
    const page = await create(h)
    await patch(h, page.id, { content: { body: 'Original' } })
    const res = await request(app).post(`${BASE}/pages/${page.id}/duplicate`).set(h)
    expect(res.status).toBe(201)
    expect(res.body.page.status).toBe('draft')
    expect(res.body.page.slug).toBe('ma-nouvelle-page-copy')
    expect(res.body.page.draft.content.body).toBe('Original')
  })

  it('records a revision on publish and can restore an earlier one into the draft', async () => {
    const h = await admin()
    const page = await create(h)
    await patch(h, page.id, { content: { body: 'Premier' } })
    await publish(h, page.id)
    await patch(h, page.id, { content: { body: 'Second' } })
    await publish(h, page.id)

    const revs = await request(app).get(`${BASE}/pages/${page.id}/revisions`).set(h)
    expect(revs.body.revisions.map((r) => r.seq)).toEqual([2, 1])
    expect(revs.body.revisions[0].kind).toBe('publish')

    const restored = await request(app).post(`${BASE}/pages/${page.id}/revisions/1/restore`).set(h)
    expect(restored.body.page.draft.content.body).toBe('Premier')
    // Restoring changes the draft only; live is untouched until publish.
    expect((await publicPage(page.path)).body.page.content.body).toBe('Second')
    expect(restored.body.page.hasUnpublishedChanges).toBe(true)
  })
})

describe('main menu — fixed set, at most 7 items', () => {
  const route = (r) => ({ type: 'route', route: r })
  const item = (n, over = {}) => ({ id: `m${n}`, label: `Menu ${n}`, kind: 'link', link: route(`/atoopv/p${n}`), ...over })
  const save = (h, its, rev) => request(app).patch(`${BASE}/menus/main`).set(h).set(rev != null ? { 'If-Match': String(rev) } : {}).send({ items: its })
  const init = (h, its = fixedItems()) => request(app).post(`${BASE}/menus/main/initialize`).set(h).send({ items: its })
  const entryTo = (link, label = '') => ({ id: 'e1', label, link })
  const F = 'formations-des-elus'

  it('starts empty, and cannot be filled except by importing the built-in (fixed) menu', async () => {
    const h = await admin()
    const empty = await request(app).get(`${BASE}/menus/main`).set(h)
    expect(empty.body.menu.draft.items).toEqual([])
    expect(empty.body.menu.limit).toBe(7)
    expect((await save(h, fixedItems())).body.code).toBe('MENU_NOT_INITIALIZED')
    const res = await init(h)
    expect(res.status).toBe(200)
    expect(res.body.menu.draft.items).toHaveLength(6)
    expect((await save(h, fixedItems())).status).toBe(200)
  })

  it('rejects any item beyond 7 with MENU_LIMIT and keeps the saved menu unchanged', async () => {
    const h = await admin()
    await init(h)
    const res = await save(h, Array.from({ length: 8 }, (_, i) => item(i + 1)))
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('MENU_LIMIT')
    // a 7th menu is refused too — but because the set of menus is fixed
    const seventh = await save(h, [...fixedItems(), item(7)])
    expect(seventh.status).toBe(422)
    expect(seventh.body.code).toBe('MENU_STRUCTURE_LOCKED')
    const after = await request(app).get(`${BASE}/menus/main`).set(h)
    expect(after.body.menu.draft.items).toHaveLength(6)
  })

  it('cannot be bypassed at the database layer either', async () => {
    await expect(Menu.create({ key: 'main', draft: { items: Array.from({ length: 8 }, (_, i) => item(i + 1)) } })).rejects.toThrow(/maximum of 7/)
    await expect(Menu.create({ key: 'footer' })).rejects.toThrow() // only allowed keys exist
    const ok = await Menu.create({ key: 'main', draft: { items: Array.from({ length: 7 }, (_, i) => item(i + 1)) } })
    ok.draft.items.push(item(8))
    await expect(ok.save()).rejects.toThrow(/maximum of 7/)
  })

  it('only the "main" menu exists — there is no way to create another menu', async () => {
    const h = await admin()
    expect((await request(app).get(`${BASE}/menus/other`).set(h)).status).toBe(404)
    expect((await request(app).get('/api/cms/menus/other')).status).toBe(404)
    for (const method of ['patch', 'post']) {
      const path = method === 'patch' ? `${BASE}/menus/other` : `${BASE}/menus/other/initialize`
      expect((await request(app)[method](path).set(h).send({ items: fixedItems() })).status).toBe(404)
    }
    // no route creates or deletes a menu
    expect((await request(app).post(`${BASE}/menus`).set(h).send({ items: [] })).status).toBe(404)
    expect((await request(app).delete(`${BASE}/menus/main`).set(h)).status).toBe(404)
  })

  it('validates what is inside the menus (bad links, labels, oversized lists)', async () => {
    const h = await admin()
    await init(h)
    const inFormations = (part) => fixedItems({}, { formations: part })
    const groupsWith = (entries) => fixedItems({ [`formations/${F}`]: entries })
    expect((await save(h, groupsWith([entryTo(route('no-slash'), 'A')]))).status).toBe(422)
    expect((await save(h, groupsWith([entryTo({ type: 'external', url: 'https://example.com' }, 'A')]))).status).toBe(422) // menus link inside the site only
    expect((await save(h, groupsWith([entryTo(route('/a'), 'a\nb')]))).status).toBe(422)
    const many = Array.from({ length: 13 }, (_, i) => ({ id: `e${i}`, label: `L${i}`, link: route(`/x${i}`) }))
    expect((await save(h, groupsWith(many))).status).toBe(422) // at most 12 links per group
    expect((await save(h, inFormations({ mobile: Array.from({ length: 11 }, (_, i) => ({ id: `m${i}`, label: `L${i}`, link: route('/x') })) }))).status).toBe(422)
    expect((await save(h, groupsWith(many.slice(0, 12)))).status).toBe(200)
  })

  it('publishes, and the public menu resolves page links to live addresses', async () => {
    const h = await admin()
    const page = await create(h, { slug: 'offre' })
    await init(h)

    // A menu may reference a page that is not published yet — it just stays hidden until it is.
    await save(h, fixedItems({ [`formations/${F}`]: [entryTo({ type: 'page', pageId: page.id }), { id: 'e2', label: 'Statique', link: route('/atoopv/p1') }] }))
    expect((await request(app).post(`${BASE}/menus/main/publish`).set(h)).status).toBe(200)
    const labels = async () => (await request(app).get('/api/cms/menus/main')).body.menu.items.find((i) => i.id === 'formations')?.groups?.[0]?.entries
    expect((await labels()).map((e) => e.label)).toEqual(['Statique'])

    await publish(h, page.id)
    const entries = await labels()
    expect(entries).toHaveLength(2)
    expect(entries[0].href).toBe('/services/drafting/offre')
    expect(entries[1].href).toBe('/atoopv/p1')
  })

  it('a link to a page that does not exist is refused', async () => {
    const h = await admin()
    await init(h)
    const res = await save(h, fixedItems({ [`formations/${F}`]: [entryTo({ type: 'page', pageId: new mongoose.Types.ObjectId().toString() })] }))
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('MENU_LINK_INVALID')
  })

  it('draft edits do not change the public menu until published', async () => {
    const h = await admin()
    await init(h)
    await save(h, fixedItems({ [`formations/${F}`]: [entryTo(route('/atoopv/p1'), 'Un')] }))
    const publicLabels = async () => (await request(app).get('/api/cms/menus/main')).body.menu.items.find((i) => i.id === 'formations')?.groups?.[0]?.entries?.map((e) => e.label) ?? []
    expect(await publicLabels()).toEqual([])
    await request(app).post(`${BASE}/menus/main/publish`).set(h)
    expect(await publicLabels()).toEqual(['Un'])
    await save(h, fixedItems({ [`formations/${F}`]: [entryTo(route('/atoopv/p1'), 'Un'), { id: 'e2', label: 'Deux', link: route('/atoopv/p2') }] }))
    expect(await publicLabels()).toEqual(['Un'])
  })
})

describe('media', () => {
  const upload = (h, buf = PNG, name = 'logo.png') =>
    request(app).post(`${BASE}/media`).set(h).attach('file', buf, name)

  it('accepts real images, stores them, and serves them publicly with long cache headers', async () => {
    const h = await admin()
    const res = await upload(h)
    expect(res.status).toBe(201)
    expect(res.body.media.mimeType).toBe('image/png')
    expect(res.body.media.path).toMatch(/^\/api\/media\/[a-f0-9]{24}\/logo\.png$/)

    const file = await request(app).get(res.body.media.path).buffer(true).parse((r, cb) => {
      const chunks = []
      r.on('data', (c) => chunks.push(c))
      r.on('end', () => cb(null, Buffer.concat(chunks)))
    })
    expect(file.status).toBe(200)
    expect(file.headers['content-type']).toBe('image/png')
    expect(file.headers['cache-control']).toMatch(/immutable/)
    expect(file.headers['x-content-type-options']).toBe('nosniff')
    expect(Buffer.compare(file.body, PNG)).toBe(0)
  })

  it('identifies images by content, not by filename or declared type', async () => {
    const h = await admin()
    expect((await upload(h, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), 'x.svg')).status).toBe(415)
    expect((await upload(h, Buffer.from('%PDF-1.4 not an image at all........'), 'x.png')).status).toBe(415)
    expect((await upload(h, Buffer.from('<html><script>alert(1)</script></html>'), 'x.jpg')).status).toBe(415)
    // a genuine PNG is accepted even with a wrong extension
    expect((await upload(h, PNG, 'photo.txt')).status).toBe(201)
  })

  it('de-duplicates identical uploads', async () => {
    const h = await admin()
    const a = await upload(h)
    const b = await upload(h, PNG, 'other-name.png')
    expect(b.body.deduped).toBe(true)
    expect(b.body.media.id).toBe(a.body.media.id)
  })

  it('enforces the size limit', async () => {
    const h = await admin()
    const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024 + 10)])
    const res = await upload(h, big)
    expect(res.status).toBe(413)
    expect(res.body.code).toBe('FILE_TOO_LARGE')
  })

  it('edits alt text, and refuses to delete an image a page uses', async () => {
    const h = await admin()
    const { media } = (await upload(h)).body
    const upd = await request(app).patch(`${BASE}/media/${media.id}`).set(h).send({ alt: 'Un logo' })
    expect(upd.body.media.alt).toBe('Un logo')
    expect((await request(app).patch(`${BASE}/media/${media.id}`).set(h).send({ mimeType: 'text/html' })).status).toBe(422)

    const page = await create(h)
    await patch(h, page.id, { content: { body: `![Un logo](${media.path})` } })
    const blocked = await request(app).delete(`${BASE}/media/${media.id}`).set(h)
    expect(blocked.status).toBe(409)
    expect(blocked.body.code).toBe('MEDIA_IN_USE')

    await patch(h, page.id, { content: { body: '' } })
    expect((await request(app).delete(`${BASE}/media/${media.id}`).set(h)).status).toBe(200)
    expect((await request(app).get(media.path)).status).toBe(404)
  })

  it('returns 404 for unknown media ids', async () => {
    expect((await request(app).get(`/api/media/${new mongoose.Types.ObjectId()}/x.png`)).status).toBe(404)
    expect((await request(app).get('/api/media/not-an-id/x.png')).status).toBe(404)
  })
})
