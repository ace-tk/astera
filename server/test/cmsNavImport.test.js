import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import request from 'supertest'
import { pathToFileURL } from 'node:url'
import { createApp } from '../src/app.js'
import { planNavigationImport, applyNavigationImport } from '../src/cms/migrate/importNavigation.js'
import { Menu } from '../src/models/Menu.js'

let app
beforeEach(() => { app = createApp() })
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'cms-nav-'))
const clientSrc = path.resolve(import.meta.dirname, '../../client/src')
const load = (rel) => import(pathToFileURL(path.join(clientSrc, rel)))

describe('built-in navigation import', () => {
  it('plans exactly the 6 real menus', async () => {
    const plan = await planNavigationImport()
    expect(plan.menuItems.map((i) => i.id)).toEqual(['pv', 'formations', 'atoosavoir', 'ressources', 'blog', 'a-propos'])
    expect(plan.menuItems.length).toBeLessThanOrEqual(7)
    expect(Object.keys(plan.sections).sort()).toEqual(['by-city', 'communication', 'drafting', 'guides', 'ressources', 'tarifs-infos', 'training'])
    expect(await Menu.countDocuments()).toBe(0) // planning writes nothing
  })

  it('round-trips to EXACTLY the structure the navbar renders today (labels, groups, order, CTAs, mobile)', async () => {
    await applyNavigationImport(await planNavigationImport(), { backupDir: tmp() })
    const { ATOOPV_NAV } = await load('constants/content.js')
    const { fromResolvedMenu } = await load('cms/navConvert.js')

    const nav = (await request(app).get('/api/cms/navigation')).body
    const fromCms = fromResolvedMenu(nav.menu.items)
    expect(JSON.parse(JSON.stringify(fromCms))).toEqual(JSON.parse(JSON.stringify(ATOOPV_NAV)))
  })

  it('round-trips every section side navigation exactly (labels, addresses, order, exact-match flags)', async () => {
    await applyNavigationImport(await planNavigationImport(), { backupDir: tmp() })
    const servicesNav = await load('constants/servicesNav.js')
    const { RESSOURCES_NAV } = await load('constants/resourcesNav.js')
    const nav = (await request(app).get('/api/cms/navigation')).body
    for (const [section, items] of [...Object.entries(servicesNav.CATEGORY_NAV), ['ressources', RESSOURCES_NAV]]) {
      expect(nav.sections[section].configured, section).toBe(true)
      expect(nav.sections[section].entries, section).toEqual(items.map((i) => ({ label: i.label, to: i.to, ...(i.end ? { end: true } : {}) })))
    }
  })

  it('backs up first, and never overwrites anything already in the CMS', async () => {
    const dir = tmp()
    const first = await applyNavigationImport(await planNavigationImport(), { backupDir: dir })
    expect(fs.existsSync(first.backup.file)).toBe(true)
    expect(first.results.every((r) => r.status === 'imported')).toBe(true)

    // an admin edit
    await request(app) // (direct model edit is enough; the API path is covered elsewhere)
    const menu = await Menu.findOne({ key: 'main' })
    menu.live.items[0].label = 'Renamed by admin'
    menu.markModified('live')
    await menu.save()

    const again = await applyNavigationImport(await planNavigationImport(), { backupDir: dir })
    expect(again.results.every((r) => r.status === 'skipped')).toBe(true)
    expect((await Menu.findOne({ key: 'main' })).live.items[0].label).toBe('Renamed by admin')
  })
})
