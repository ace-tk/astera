import { LegalPages } from '../models/LegalPages.js'
import { legalPagesContentSchema } from './schemas.js'
import { CmsError } from './errors.js'
import { DEFAULT_LEGAL_PAGES_CONTENT } from './legalPagesDefaults.js'

function validateContent(content) {
  const parsed = legalPagesContentSchema.safeParse(content)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'The legal pages are not valid', parsed.error.flatten())
  return parsed.data
}

/**
 * There is only ever one LegalPages document (it holds all 4 pages). The first
 * time it's ever read, a document is created and seeded with the real, current
 * (placeholder) content — DEFAULT_LEGAL_PAGES_CONTENT — in both draft and live,
 * same "no separate import step" rule as getFooter()/getHomeHero().
 */
export async function getLegalPages() {
  const existing = await LegalPages.findOne()
  if (existing) return existing
  const seeded = validateContent(DEFAULT_LEGAL_PAGES_CONTENT)
  const version = { content: seeded, savedAt: new Date() }
  return LegalPages.create({ draft: version, live: version, rev: 1, publishedRev: 1, publishedAt: new Date() })
}

export async function saveLegalPagesDraft(content, { expectedRev, userId } = {}) {
  const clean = validateContent(content)
  const doc = await getLegalPages()
  if (expectedRev != null && Number(expectedRev) !== doc.rev) {
    throw new CmsError(409, 'REV_CONFLICT', 'The legal pages were changed by someone else. Reload to see the latest version.')
  }
  doc.draft = { content: clean, savedAt: new Date(), savedBy: userId }
  doc.markModified('draft')
  doc.rev += 1
  await doc.save()
  return doc
}

export async function publishLegalPages(userId) {
  const doc = await getLegalPages()
  const clean = validateContent(doc.draft.content)
  doc.live = { content: clean, savedAt: new Date(), savedBy: userId }
  doc.markModified('live')
  doc.publishedRev = doc.rev
  doc.publishedAt = new Date()
  await doc.save()
  return doc
}

export async function discardLegalPagesDraft(userId) {
  const doc = await getLegalPages()
  doc.draft = { content: JSON.parse(JSON.stringify(doc.live.content)), savedAt: new Date(), savedBy: userId }
  doc.markModified('draft')
  doc.rev += 1
  await doc.save()
  return doc
}

/** Public: the live legal-pages content, ready for the site. Never empty — see getLegalPages(). */
export async function resolveLiveLegalPages() {
  const doc = await getLegalPages()
  return doc.live.content
}
