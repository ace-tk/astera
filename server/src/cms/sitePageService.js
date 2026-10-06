import fs from 'node:fs'
import { SitePage } from '../models/SitePage.js'
import { CmsError } from './errors.js'
import { fillMissing, validateSitePageContent } from './sitePageShape.js'

// Generated from client/src/cms/sitePageRegistry.js by `npm run cms:site-pages`
// (a test fails when this file is out of date).
const REGISTRY = JSON.parse(fs.readFileSync(new URL('./sitePageDefaults.json', import.meta.url), 'utf8'))

export const SITE_PAGE_KEYS = Object.keys(REGISTRY)

function definition(key) {
  const def = Object.hasOwn(REGISTRY, key) ? REGISTRY[key] : null
  if (!def) throw new CmsError(404, 'NOT_FOUND', 'Unknown site page')
  return def
}

/**
 * What the admin sees. A page that was never saved has no document: show the default content (the
 * text that is live on the website right now) with nothing to publish. Missing fields of an older
 * document are filled from the defaults so the editor always gets the full, current structure.
 */
function toAdminJSON(key, doc) {
  const { label, path, defaults } = definition(key)
  if (!doc) {
    return { key, label, path, draft: { content: defaults }, live: { content: defaults }, rev: 0, hasUnpublishedChanges: false, edited: false, publishedAt: null }
  }
  return {
    key,
    label,
    path,
    draft: { content: fillMissing(defaults, doc.draft.content), savedAt: doc.draft.savedAt },
    live: { content: fillMissing(defaults, doc.live.content), savedAt: doc.live.savedAt },
    rev: doc.rev,
    hasUnpublishedChanges: doc.hasUnpublishedChanges(),
    edited: true,
    publishedAt: doc.publishedAt ?? null,
  }
}

function validate(key, content) {
  const { content: clean, issues } = validateSitePageContent(definition(key).defaults, content)
  if (issues.length) throw new CmsError(422, 'VALIDATION_FAILED', `${issues[0].path ? `${issues[0].path}: ` : ''}${issues[0].message}`, issues)
  return clean
}

/** Creates the document the first time an admin writes to a page: draft and live both start as the defaults. */
async function ensureDoc(key) {
  const { defaults } = definition(key)
  const version = { content: defaults, savedAt: new Date() }
  return SitePage.findOneAndUpdate(
    { key },
    { $setOnInsert: { key, draft: version, live: version, rev: 1, publishedRev: 1, publishedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
}

export async function getSitePage(key) {
  definition(key)
  return toAdminJSON(key, await SitePage.findOne({ key }))
}

export async function saveSitePageDraft(key, content, { expectedRev, userId } = {}) {
  const clean = validate(key, content)
  const doc = await ensureDoc(key)
  if (expectedRev != null && Number(expectedRev) !== doc.rev && !(expectedRev === 0 && doc.rev === 1)) {
    throw new CmsError(409, 'REV_CONFLICT', 'This page was changed by someone else. Reload to see the latest version.')
  }
  doc.draft = { content: clean, savedAt: new Date(), savedBy: userId }
  doc.markModified('draft')
  doc.rev += 1
  await doc.save()
  return toAdminJSON(key, doc)
}

export async function publishSitePage(key, userId) {
  const doc = await ensureDoc(key)
  const clean = validate(key, fillMissing(definition(key).defaults, doc.draft.content))
  doc.live = { content: clean, savedAt: new Date(), savedBy: userId }
  doc.markModified('live')
  doc.publishedRev = doc.rev
  doc.publishedAt = new Date()
  await doc.save()
  return toAdminJSON(key, doc)
}

export async function discardSitePageDraft(key, userId) {
  const doc = await ensureDoc(key)
  doc.draft = { content: JSON.parse(JSON.stringify(doc.live.content)), savedAt: new Date(), savedBy: userId }
  doc.markModified('draft')
  doc.rev += 1
  await doc.save()
  return toAdminJSON(key, doc)
}

/** Public: the LIVE content, or null when the page was never edited (the website then shows its built-in content). */
export async function resolveLiveSitePage(key) {
  definition(key)
  const doc = await SitePage.findOne({ key }).lean()
  return doc?.live?.content ?? null
}
