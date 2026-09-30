import { HomeHero } from '../models/HomeHero.js'
import { homeHeroContentSchema } from './schemas.js'
import { CmsError } from './errors.js'
import { DEFAULT_HOME_HERO_CONTENT } from './homeHeroDefaults.js'

function validateContent(content) {
  const parsed = homeHeroContentSchema.safeParse(content)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'The homepage hero is not valid', parsed.error.flatten())
  return parsed.data
}

/**
 * There is only ever one home hero document. The first time it's ever read, a
 * document is created and seeded with the site's real, current slide images
 * (DEFAULT_HOME_HERO_CONTENT) in both draft and live — so the public homepage
 * never goes blank while nothing has been "set up" yet.
 */
export async function getHomeHero() {
  const existing = await HomeHero.findOne()
  if (existing) return existing
  const seeded = validateContent(DEFAULT_HOME_HERO_CONTENT)
  const version = { content: seeded, savedAt: new Date() }
  return HomeHero.create({ draft: version, live: version, rev: 1, publishedRev: 1, publishedAt: new Date() })
}

export async function saveHomeHeroDraft(content, { expectedRev, userId } = {}) {
  const clean = validateContent(content)
  const hero = await getHomeHero()
  if (expectedRev != null && Number(expectedRev) !== hero.rev) {
    throw new CmsError(409, 'REV_CONFLICT', 'The homepage hero was changed by someone else. Reload to see the latest version.')
  }
  hero.draft = { content: clean, savedAt: new Date(), savedBy: userId }
  hero.markModified('draft')
  hero.rev += 1
  await hero.save()
  return hero
}

export async function publishHomeHero(userId) {
  const hero = await getHomeHero()
  const clean = validateContent(hero.draft.content)
  hero.live = { content: clean, savedAt: new Date(), savedBy: userId }
  hero.markModified('live')
  hero.publishedRev = hero.rev
  hero.publishedAt = new Date()
  await hero.save()
  return hero
}

export async function discardHomeHeroDraft(userId) {
  const hero = await getHomeHero()
  hero.draft = { content: JSON.parse(JSON.stringify(hero.live.content)), savedAt: new Date(), savedBy: userId }
  hero.markModified('draft')
  hero.rev += 1
  await hero.save()
  return hero
}

/** Public: the live slide images, ready for the homepage. Never empty — see getHomeHero(). */
export async function resolveLiveHomeHero() {
  const hero = await getHomeHero()
  return hero.live.content
}
