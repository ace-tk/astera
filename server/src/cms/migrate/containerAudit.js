// DRY-RUN reporting only. Extends `importServiceArticles.js`'s plan with what an admin would see
// in the Option A "container" editor, and proves — before any import runs — that reassembling the
// containers back into Markdown reproduces the page's CURRENT body byte-for-byte. Writes nothing;
// `npm run cms:migration-report` (see the CLI block below) never touches the database.
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { planImport, CONTENT_ROOT } from './importServiceArticles.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../../../')
const clientSrc = path.join(repoRoot, 'client/src')
const load = (rel) => import(pathToFileURL(path.join(clientSrc, rel)))

// Display only — which existing visual skin the section uses. Purely descriptive; nothing here
// drives rendering (ServiceArticleView derives its own skin from `section`, unchanged).
const SKIN = { drafting: 'pv', 'by-city': 'pv', 'tarifs-infos': 'pv', training: 'formations', communication: 'formations', guides: 'guides' }

/** Where (if anywhere) `path` sits in today's built-in mega menu — computed from the SAME
 * conversion the "Import built-in menu" admin button and `cms:import-nav` already use, never
 * hand-transcribed, so it can't silently drift from the real navigation. */
async function menuPlacementFor(url) {
  const { ATOOPV_NAV } = await load('constants/content.js')
  const { toMenuItems } = await load('cms/navConvert.js')
  for (const item of toMenuItems(ATOOPV_NAV)) {
    if (item.kind !== 'mega') continue
    for (const group of item.groups) {
      if (group.entries.some((e) => e.link?.type === 'route' && e.link.route === url)) {
        return { menuId: item.id, groupId: group.id, groupHeading: group.heading, menuLabel: item.label }
      }
    }
  }
  return null
}

/** Full audit for one already-`planImport`-validated item: containers, editor mode, and proof that
 * reassembling the containers an admin would see reproduces the current body exactly. */
async function auditOne(item) {
  const { disassembleServiceArticle, assembleServiceArticle } = await load('cms/serviceArticleContainers.js')

  const body = item.page.version.content.body
  const containers = disassembleServiceArticle(item.section, item.slug, body)
  const reassembled = assembleServiceArticle(containers)
  const losslessRoundTrip = reassembled === body

  // Visual-editor-vs-Markdown-fallback needs a real DOM (TipTap), which this Node CLI script does not
  // have — checked separately, per rich-text sub-field, by client/src/cms/serviceArticleContainers.editorMode.test.js.

  return {
    slug: item.slug,
    section: item.section,
    skin: SKIN[item.section],
    path: item.path,
    title: item.title,
    menuPlacement: await menuPlacementFor(item.path),
    richTextFields: containers.kind === 'body' ? ['body'] : ['intro', 'main', 'afterTopics', 'afterFaq'].filter((k) => containers[k]),
    containers: containers.kind === 'body'
      ? { kind: 'body-only (no editorial extraction for this section)' }
      : {
          kind: 'editorial',
          hasIntro: Boolean(containers.intro),
          stats: containers.stats?.length || 0,
          hasMainContent: Boolean(containers.main),
          topics: containers.topics?.length || 0,
          topicsLayout: containers.topicsLayout,
          hasContentAfterTopics: Boolean(containers.afterTopics),
          faq: containers.faq?.length || 0,
          hasContentAfterFaq: Boolean(containers.afterFaq),
        },
    losslessRoundTrip,
    exactMarkdownChange: losslessRoundTrip ? '(none — reassembled body is byte-identical to the current page)' : 'DIFFERS — see diffAt',
    diffAt: losslessRoundTrip ? null : firstDiff(body, reassembled),
    risk: losslessRoundTrip ? 'none' : 'DO NOT MIGRATE — round trip is not lossless',
  }
}

function firstDiff(a, b) {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return { index: i, current: JSON.stringify(a.slice(Math.max(0, i - 30), i + 30)), reassembled: JSON.stringify(b.slice(Math.max(0, i - 30), i + 30)) }
}

/** Dry-run report for a batch of slugs. Never writes anything — same guarantee as `planImport`. */
export async function planContainerMigration(slugs, { contentRoot = CONTENT_ROOT } = {}) {
  const base = await planImport(slugs, { contentRoot })
  const report = []
  for (const item of base) {
    // eslint-disable-next-line no-await-in-loop
    report.push(item.ok ? await auditOne(item) : { slug: item.slug, ok: false, reason: item.reason })
  }
  return report
}

/* ----------------------------------- CLI ---------------------------------- */
const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
  const slugs = (arg('slugs') || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!slugs.length) {
    console.error('Usage: node containerAudit.js --slugs=slug-one,slug-two\n(Read-only report. Never writes to any database.)')
    process.exit(1)
  }
  const report = await planContainerMigration(slugs)
  console.log(JSON.stringify(report, null, 2))
  const bad = report.filter((r) => r.ok === false || r.losslessRoundTrip === false)
  if (bad.length) {
    console.error(`\n${bad.length} page(s) NOT safe to migrate: ${bad.map((b) => b.slug).join(', ')}`)
    process.exit(1)
  }
  console.log(`\nAll ${report.length} page(s) are safe to migrate (lossless round trip).`)
}
