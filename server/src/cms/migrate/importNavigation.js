// Imports the website's BUILT-IN navigation (main mega menu + every section's side
// navigation) into the CMS, so it can be edited there. The site looks identical
// before and after: every label and address is copied verbatim.
//
//   • Dry run by default — nothing is written without --apply.
//   • A full backup of the CMS collections is written BEFORE any change.
//   • Never overwrites: anything already set up in the CMS is skipped.
//   • Read-only on the frontend constants (they stay in place as the fallback).
//
//   npm run cms:import-nav               (dry run)
//   npm run cms:import-nav -- --apply
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { initializeMenu, getMenu } from '../menuService.js'
import { initializeSectionNav, getSectionNav } from '../sectionNavService.js'
import { menuItemsSchema, sectionNavEntriesSchema } from '../schemas.js'
import { exportBackup } from './backup.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const clientSrc = path.resolve(here, '../../../../client/src')
const load = (rel) => import(pathToFileURL(path.join(clientSrc, rel)))

/** Builds (but does not write) the import plan. */
export async function planNavigationImport() {
  const { ATOOPV_NAV } = await load('constants/content.js')
  const servicesNav = await load('constants/servicesNav.js')
  const { RESSOURCES_NAV } = await load('constants/resourcesNav.js')
  const { toMenuItems, toSectionEntries } = await load('cms/navConvert.js')

  const menuItems = toMenuItems(ATOOPV_NAV)
  const sections = {
    ...Object.fromEntries(Object.entries(servicesNav.CATEGORY_NAV).map(([k, items]) => [k, toSectionEntries(items)])),
    ressources: toSectionEntries(RESSOURCES_NAV),
  }
  // Fail early, before any write, if the built-in data would not pass the CMS's own validation.
  const m = menuItemsSchema.safeParse(menuItems)
  if (!m.success) throw new Error(`Built-in menu is not valid for the CMS: ${JSON.stringify(m.error.flatten())}`)
  for (const [k, e] of Object.entries(sections)) {
    const r = sectionNavEntriesSchema.safeParse(e)
    if (!r.success) throw new Error(`Built-in navigation for "${k}" is not valid: ${JSON.stringify(r.error.flatten())}`)
  }
  return { menuItems: m.data, sections }
}

export async function applyNavigationImport(plan, { backupDir } = {}) {
  const backup = await exportBackup({ dir: backupDir, label: 'pre-nav-import-backup' })
  const results = []
  const menu = await getMenu('main')
  if (menu.draft.items.length || menu.live.items.length) results.push({ what: 'main menu', status: 'skipped', reason: 'Already set up in the CMS (not overwritten)' })
  else { await initializeMenu('main', plan.menuItems); results.push({ what: 'main menu', status: 'imported', items: plan.menuItems.length }) }

  for (const [section, entries] of Object.entries(plan.sections)) {
    const nav = await getSectionNav(section)
    if (nav.configured) results.push({ what: `side navigation: ${section}`, status: 'skipped', reason: 'Already set up in the CMS (not overwritten)' })
    else { await initializeSectionNav(section, entries); results.push({ what: `side navigation: ${section}`, status: 'imported', entries: entries.length }) }
  }
  return { backup, results }
}

/* ----------------------------------- CLI ---------------------------------- */
const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  const { connectDB } = await import('../../config/db.js')
  const { env } = await import('../../config/env.js')
  const apply = process.argv.includes('--apply')
  const host = (() => { try { return new URL(env.mongoUri).host } catch { return 'unknown' } })()
  console.log(`Database: ${host}   Mode: ${apply ? 'APPLY' : 'DRY RUN (nothing will be written)'}\n`)

  const plan = await planNavigationImport()
  console.log(`Main menu: ${plan.menuItems.length} menus`)
  for (const it of plan.menuItems) {
    console.log(`  • ${it.label} [${it.kind}]${it.groups?.length ? ` — ${it.groups.map((g) => `${g.heading} (${g.entries.length})`).join(' · ')}` : ''}`)
  }
  console.log('\nSide navigation:')
  for (const [s, e] of Object.entries(plan.sections)) console.log(`  • ${s}: ${e.length} pages`)
  if (!apply) { console.log('\nDry run only. Re-run with --apply to write (a backup is taken first).'); process.exit(0) }

  if (!(await connectDB())) { console.error('Cannot connect to MongoDB.'); process.exit(1) }
  const { backup, results } = await applyNavigationImport(plan)
  console.log('\nBackup written:', backup.file)
  results.forEach((r) => console.log(`  ${r.status.toUpperCase()}  ${r.what}${r.reason ? ` — ${r.reason}` : ''}`))
  process.exit(0)
}
