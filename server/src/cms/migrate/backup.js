// CMS backup / restore. A backup is a plain JSON file with every CMS collection
// (pages, revisions, menus, redirects, media METADATA — image bytes live in
// GridFS and are not copied; use `mongodump` for those).
//
//   npm run cms:backup                          → writes server/backups/cms-backup-<time>.json
//   npm run cms:restore -- --file=<path>        → DRY RUN: shows what would be restored
//   npm run cms:restore -- --file=<path> --apply
//
// Restore only upserts documents from the file (by _id). It never deletes
// anything that isn't in the backup.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Page } from '../../models/Page.js'
import { PageRevision } from '../../models/PageRevision.js'
import { Menu } from '../../models/Menu.js'
import { Redirect } from '../../models/Redirect.js'
import { Media } from '../../models/Media.js'
import { SectionNav } from '../../models/SectionNav.js'

const here = path.dirname(fileURLToPath(import.meta.url))
export const DEFAULT_BACKUP_DIR = path.resolve(here, '../../../backups')

const COLLECTIONS = { pages: Page, revisions: PageRevision, menus: Menu, sectionNavs: SectionNav, redirects: Redirect, media: Media }

export async function exportBackup({ dir = DEFAULT_BACKUP_DIR, label = 'cms-backup' } = {}) {
  const data = { version: 1, createdAt: new Date().toISOString() }
  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    data[key] = (await Model.find().lean()).map((d) => JSON.parse(JSON.stringify(d)))
  }
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${label}-${data.createdAt.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  return { file, counts: Object.fromEntries(Object.keys(COLLECTIONS).map((k) => [k, data[k].length])) }
}

export async function restoreBackup(file, { apply = false } = {}) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (data.version !== 1) throw new Error(`Unsupported backup version: ${data.version}`)
  const counts = Object.fromEntries(Object.keys(COLLECTIONS).map((k) => [k, (data[k] || []).length]))
  if (!apply) return { applied: false, counts }
  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    for (const doc of data[key] || []) {
      // strict:false + overwrite keeps the stored shape exactly as it was backed up.
      await Model.replaceOne({ _id: doc._id }, doc, { upsert: true })
    }
  }
  return { applied: true, counts }
}

/* ----------------------------------- CLI ---------------------------------- */
const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  const { connectDB } = await import('../../config/db.js')
  const { env } = await import('../../config/env.js')
  const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
  const flag = (name) => process.argv.includes(`--${name}`)
  const mode = process.argv[2]
  const host = (() => { try { return new URL(env.mongoUri).host } catch { return 'unknown' } })()
  console.log(`Database: ${host}`)
  if (!(await connectDB())) { console.error('Cannot connect to MongoDB.'); process.exit(1) }
  if (mode === 'backup') {
    const r = await exportBackup()
    console.log('Backup written:', r.file, r.counts)
  } else if (mode === 'restore') {
    const file = arg('file')
    if (!file) { console.error('Usage: cms:restore -- --file=<path> [--apply]'); process.exit(1) }
    const r = await restoreBackup(path.resolve(file), { apply: flag('apply') })
    console.log(r.applied ? 'Restored:' : 'DRY RUN — nothing changed. Would restore:', r.counts)
    if (!r.applied) console.log('Add --apply to restore.')
  } else {
    console.error('Usage: backup.js backup | restore --file=<path> [--apply]')
    process.exit(1)
  }
  process.exit(0)
}
