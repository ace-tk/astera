import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { TEMPLATES } from '../src/cms/templates/index.js'
import { fixedItems } from './fixedMenusFixture.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const APP_JSX = fs.readFileSync(path.resolve(here, '../../client/src/App.jsx'), 'utf8')
const CONTENT = path.resolve(here, '../../content')

let app
beforeEach(() => { app = createApp() })
const admin = async () => {
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}
const B = '/api/admin/cms'

const allSections = Object.values(TEMPLATES).flatMap((t) => t.sections.map((s) => ({ ...s, template: t })))

// The public route block of a section in the frontend's route table (App.jsx).
const routeBlock = (base) => {
  const start = APP_JSX.indexOf(`path="${base}"`)
  expect(start, `App.jsx has a route for ${base}`).toBeGreaterThan(-1)
  return APP_JSX.slice(start, APP_JSX.indexOf('</Route>', start))
}

describe('section → template → route → frontend component', () => {
  it('every section belongs to exactly one template, so choosing a section is enough (the template is found automatically)', () => {
    const keys = allSections.map((s) => s.key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys.sort()).toEqual(['by-city', 'communication', 'drafting', 'guides', 'ressources', 'tarifs-infos', 'training'])
  })

  it('each section’s address is served by the existing frontend route, and that route renders the matching existing component', () => {
    for (const s of allSections) {
      const address = s.template.pathFor(s.key, 'un-slug')
      if (s.template.key === 'service-article') {
        expect(address).toBe(`/services/${s.key}/un-slug`)
        // /services/<section>/:slug  →  <ServiceArticle category="<section>" />  (the design is chosen by `category`)
        expect(routeBlock(`/services/${s.key}`), s.key).toContain(`<Route path=":slug" element={<ServiceArticle category="${s.key}" />} />`)
      } else {
        expect(address).toBe('/atoopv/ressources/un-slug')
        expect(routeBlock('/atoopv/ressources'), s.key).toContain('<Route path=":slug" element={<RessourceArticle />} />')
      }
    }
  })

  it('the frontend has a design (colour, navigation label) for every Service section — nothing falls back to a generic look', () => {
    const nav = fs.readFileSync(path.resolve(here, '../../client/src/constants/servicesNav.js'), 'utf8')
    for (const s of allSections.filter((x) => x.template.key === 'service-article')) {
      for (const table of ['CATEGORY_NAV', 'CATEGORY_NAV_LABEL', 'CATEGORY_COLOR', 'CATEGORY_LABEL']) {
        const body = nav.slice(nav.indexOf(`export const ${table}`))
        expect(body.slice(0, body.indexOf('\n}')), `${table}.${s.key}`).toMatch(new RegExp(`(^|\\s)'?${s.key}'?:`))
      }
    }
  })

  it('a new page starts with the same hero label as every existing page of that design', () => {
    const labelsIn = (dir) =>
      new Set(fs.readdirSync(path.join(CONTENT, dir)).filter((f) => f.endsWith('.md')).map((f) => fs.readFileSync(path.join(CONTENT, dir, f), 'utf8').match(/^- Breadcrumb: (.*)$/m)?.[1]))
    for (const dir of ['drafting', 'by-city', 'tarifs-infos', 'training', 'communication', 'guides']) expect([...labelsIn(dir)], dir).toEqual([TEMPLATES['service-article'].defaults.badge])
    expect([...labelsIn('resources')]).toEqual([TEMPLATES['ressources-article'].defaults.badge])
  })
})

describe('new page flow — every section, end to end', () => {
  const publicPage = (p) => request(app).get('/api/cms/pages').query({ path: p })
  const nav = async () => (await request(app).get('/api/cms/navigation')).body

  it('the admin form data exposes defaults, and no other way to pick a design', async () => {
    const h = await admin()
    const t = (await request(app).get(`${B}/templates`).set(h)).body.templates
    expect(t.map((x) => [x.key, x.defaults.badge])).toEqual([['service-article', 'Services'], ['ressources-article', 'Ressources']])
    expect(Object.keys(t[0]).sort()).toEqual(['creatable', 'defaults', 'description', 'fields', 'key', 'name', 'pathPattern', 'sections', 'singleton', 'tagOptions'])
  })

  for (const s of allSections) {
    it(`${s.label} (${s.key}): create → draft (preview only) → publish → public URL → menu placement → unpublish`, async () => {
      const h = await admin()
      const init = await request(app).post(`${B}/menus/main/initialize`).set(h).send({ items: fixedItems() })
      expect(init.status).toBe(200)
      const menu = fixedItems().find((m) => m.label === s.menu)
      const group = menu.groups[0]

      const created = await request(app).post(`${B}/pages`).set(h).send({
        templateKey: s.template.key, section: s.key, slug: `page-de-test-${s.key}`, title: 'Page de test',
        content: { ...s.template.defaults, body: '## Une section\n\nDu **contenu** de test.' },
        menu: { menuId: menu.id, groupId: group.id },
      })
      expect(created.status, JSON.stringify(created.body)).toBe(201)
      const page = created.body.page
      expect(page.path).toBe(s.template.pathFor(s.key, `page-de-test-${s.key}`))
      expect(page.draft.content.badge).toBe(s.template.defaults.badge)

      // Draft: only the admin preview sees it — same content the public page will show.
      expect((await publicPage(page.path)).status).toBe(404)
      expect(JSON.stringify(await nav())).not.toContain('Page de test')
      const preview = await request(app).get(`${B}/pages/${page.id}/preview`).set(h)
      expect(preview.body.page).toMatchObject({ section: s.key, title: 'Page de test', content: { body: page.draft.content.body } })

      // Publish: the public URL resolves with the same content, and the page joins its menu group + section list.
      expect((await request(app).post(`${B}/pages/${page.id}/publish`).set(h)).status).toBe(200)
      const live = (await publicPage(page.path)).body.page
      expect(live).toMatchObject({ section: s.key, templateKey: s.template.key, content: preview.body.page.content })
      const n = await nav()
      const inMenu = n.menu.items.find((i) => i.id === menu.id).groups.find((g) => g.id === group.id)
      expect(inMenu.entries.map((e) => e.href)).toContain(page.path)
      expect(n.sections[s.key].entries.map((e) => e.to)).toContain(page.path)

      // Unpublish: gone from the public API and from every navigation list.
      expect((await request(app).post(`${B}/pages/${page.id}/unpublish`).set(h)).status).toBe(200)
      expect((await publicPage(page.path)).status).toBe(404)
      const after = JSON.stringify(await nav())
      expect(after).not.toContain(page.path)
      expect(after).not.toContain('Page de test')
    })
  }
})
