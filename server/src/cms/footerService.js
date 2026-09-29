import { Footer } from '../models/Footer.js'
import { footerContentSchema } from './schemas.js'
import { CmsError } from './errors.js'
import { DEFAULT_FOOTER_CONTENT } from './footerDefaults.js'

function validateContent(content) {
  const parsed = footerContentSchema.safeParse(content)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'The footer is not valid', parsed.error.flatten())
  return parsed.data
}

/**
 * There is only ever one footer. The first time it's ever read, a document is
 * created and seeded with the site's real, current content (DEFAULT_FOOTER_CONTENT)
 * in both draft and live — so the public footer never goes blank while nothing has
 * been "set up" yet, and there's no separate import step for an admin to run.
 */
export async function getFooter() {
  const existing = await Footer.findOne()
  if (existing) return existing
  const seeded = validateContent(DEFAULT_FOOTER_CONTENT)
  const version = { content: seeded, savedAt: new Date() }
  return Footer.create({ draft: version, live: version, rev: 1, publishedRev: 1, publishedAt: new Date() })
}

export async function saveFooterDraft(content, { expectedRev, userId } = {}) {
  const clean = validateContent(content)
  const footer = await getFooter()
  if (expectedRev != null && Number(expectedRev) !== footer.rev) {
    throw new CmsError(409, 'REV_CONFLICT', 'The footer was changed by someone else. Reload to see the latest version.')
  }
  footer.draft = { content: clean, savedAt: new Date(), savedBy: userId }
  footer.markModified('draft')
  footer.rev += 1
  await footer.save()
  return footer
}

export async function publishFooter(userId) {
  const footer = await getFooter()
  const clean = validateContent(footer.draft.content)
  footer.live = { content: clean, savedAt: new Date(), savedBy: userId }
  footer.markModified('live')
  footer.publishedRev = footer.rev
  footer.publishedAt = new Date()
  await footer.save()
  return footer
}

export async function discardFooterDraft(userId) {
  const footer = await getFooter()
  footer.draft = { content: JSON.parse(JSON.stringify(footer.live.content)), savedAt: new Date(), savedBy: userId }
  footer.markModified('draft')
  footer.rev += 1
  await footer.save()
  return footer
}

/** Public: the live footer content, ready for the site. Never empty — see getFooter(). */
export async function resolveLiveFooter() {
  const footer = await getFooter()
  return footer.live.content
}
