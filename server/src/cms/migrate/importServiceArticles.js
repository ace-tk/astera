// Imports SELECTED existing markdown pages into the CMS as Service Article pages.
//
// Design goals (this is the only place existing content is touched):
//   • Read-only on /content — the markdown files are never modified or deleted,
//     so the public site can always fall back to them.
//   • Dry run by default. Nothing is written without --apply.
//   • Explicit slugs only (no "import everything"), leaf pages only in Phase 1.
//   • Never overwrites: a page that already exists in the CMS is skipped.
//   • A full backup of the CMS collections is written BEFORE any change.
//   • The stored body is exactly what the public site renders today (the same
//     parse/clean-up function the frontend uses), so nothing is rewritten.
//
//   npm run cms:import -- --slugs=redaction-pv-cssct            (dry run)
//   npm run cms:import -- --slugs=redaction-pv-cssct --apply
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Page } from '../../models/Page.js'
import { PageRevision } from '../../models/PageRevision.js'
import { getTemplate } from '../templates/index.js'
import { exportBackup } from './backup.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../../../')
export const CONTENT_ROOT = path.join(repoRoot, 'content')

// Category "hub" pages live at /services/<category> (not /services/<category>/<slug>)
// and are handled in a later phase.
const HUB_SLUGS = new Set(['nos-services-pv', 'tarif-redaction-pv-cse', 'communication-cse', 'formations-elus-cse-agree', 'services'])

/** The frontend's own helpers, so the imported text is byte-identical to what the site renders. */
async function loadFrontendHelpers() {
  const clientSrc = path.join(repoRoot, 'client/src')
  const { parseContentFile } = await import(pathToFileURL(path.join(clientSrc, 'utils/contentMarkdown.js')))
  const { CATEGORY_NAV } = await import(pathToFileURL(path.join(clientSrc, 'constants/servicesNav.js')))
  return { parseContentFile, CATEGORY_NAV }
}

function findMarkdown(slug, contentRoot) {
  const template = getTemplate('service-article')
  for (const s of template.sections) {
    const file = path.join(contentRoot, s.key, `${slug}.md`)
    if (fs.existsSync(file)) return { file, section: s.key }
  }
  return null
}

/** Build (but do not write) the import plan for the given slugs. */
export async function planImport(slugs, { contentRoot = CONTENT_ROOT } = {}) {
  const { parseContentFile, CATEGORY_NAV } = await loadFrontendHelpers()
  const template = getTemplate('service-article')
  const plan = []

  for (const slug of slugs) {
    const item = { slug, ok: false, reason: null }
    plan.push(item)

    if (HUB_SLUGS.has(slug)) { item.reason = 'Hub pages are not imported in Phase 1'; continue }
    const found = findMarkdown(slug, contentRoot)
    if (!found) { item.reason = 'No markdown file found for this slug in a Service Article section'; continue }

    const raw = fs.readFileSync(found.file, 'utf8')
    const parsed = parseContentFile(raw, found.file, 'Services')
    if (!parsed.title || parsed.title === slug) { item.reason = 'Could not parse the markdown header'; continue }
    if (parsed.category && parsed.category !== found.section) { item.reason = `Header category "${parsed.category}" does not match folder "${found.section}"`; continue }

    const nav = CATEGORY_NAV[found.section] || []
    const navIndex = nav.findIndex((n) => n.to === template.pathFor(found.section, slug))
    const content = template.contentSchema.safeParse({ badge: parsed.breadcrumb || '', body: parsed.body })
    if (!content.success) { item.reason = `Content failed validation: ${JSON.stringify(content.error.flatten())}`; continue }

    Object.assign(item, {
      ok: true,
      section: found.section,
      path: template.pathFor(found.section, slug),
      file: path.relative(repoRoot, found.file),
      title: parsed.title,
      bodyChars: parsed.body.length,
      page: {
        templateKey: template.key,
        section: found.section,
        slug,
        path: template.pathFor(found.section, slug),
        navLabel: navIndex >= 0 ? nav[navIndex].label : '',
        order: navIndex >= 0 ? navIndex : 0,
        legacy: { source: 'markdown', file: path.relative(repoRoot, found.file), sourceUrl: parsed.sourceUrl || '' },
        version: { title: parsed.title, slug, content: content.data, seo: { title: '', description: '', canonicalPath: '', noindex: false } },
      },
    })
  }
  return plan
}

/** Write the plan. Skips anything that already exists. Backs up first. */
export async function applyImport(plan, { backupDir } = {}) {
  const toWrite = plan.filter((p) => p.ok)
  const results = []
  let backup = null
  if (toWrite.length) backup = await exportBackup({ dir: backupDir, label: 'pre-import-backup' })

  for (const item of plan) {
    if (!item.ok) { results.push({ slug: item.slug, status: 'skipped', reason: item.reason }); continue }
    const exists = await Page.findOne({ $or: [{ path: item.page.path }, { 'legacy.file': item.page.legacy.file }] }).select('_id status')
    if (exists) { results.push({ slug: item.slug, status: 'skipped', reason: 'Already exists in the CMS (not overwritten)', id: String(exists._id) }); continue }

    const now = new Date()
    const version = { ...item.page.version, savedAt: now }
    const page = await Page.create({
      templateKey: item.page.templateKey,
      section: item.page.section,
      slug: item.page.slug,
      path: item.page.path,
      navLabel: item.page.navLabel,
      order: item.page.order,
      status: 'published',
      draft: version,
      live: version,
      rev: 1,
      publishedRev: 1,
      publishedAt: now,
      firstPublishedAt: now,
      legacy: item.page.legacy,
    })
    await PageRevision.create({ page: page._id, seq: 1, kind: 'import', path: page.path, snapshot: JSON.parse(JSON.stringify(version)) })
    results.push({ slug: item.slug, status: 'imported', id: String(page._id), path: page.path })
  }
  return { backup, results }
}

/* ----------------------------------- CLI ---------------------------------- */
const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  const { connectDB } = await import('../../config/db.js')
  const { env } = await import('../../config/env.js')
  const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
  const slugs = (arg('slugs') || '').split(',').map((s) => s.trim()).filter(Boolean)
  const apply = process.argv.includes('--apply')
  if (!slugs.length) {
    console.error('Usage: cms:import -- --slugs=slug-one,slug-two [--apply]\n(Explicit slugs are required; there is no "import all".)')
    process.exit(1)
  }
  const host = (() => { try { return new URL(env.mongoUri).host } catch { return 'unknown' } })()
  console.log(`Database: ${host}   Mode: ${apply ? 'APPLY' : 'DRY RUN (nothing will be written)'}\n`)

  const plan = await planImport(slugs)
  for (const p of plan) {
    console.log(p.ok ? `  ✓ ${p.slug}\n      → ${p.path}  (${p.bodyChars} chars, from ${p.file})` : `  ✗ ${p.slug}: ${p.reason}`)
  }
  if (!apply) { console.log('\nDry run only. Re-run with --apply to write (a backup is taken first).'); process.exit(0) }

  if (!(await connectDB())) { console.error('Cannot connect to MongoDB.'); process.exit(1) }
  const { backup, results } = await applyImport(plan)
  if (backup) console.log('\nBackup written:', backup.file)
  results.forEach((r) => console.log(`  ${r.status.toUpperCase()}  ${r.slug}${r.reason ? ` — ${r.reason}` : ''}${r.path ? `  ${r.path}` : ''}`))
  process.exit(0)
}
