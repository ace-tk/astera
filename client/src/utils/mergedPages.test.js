import { describe, it, expect } from 'vitest'
import { finalPath, isMergedAway } from './mergedPages'
import { normalizeNavigation } from '@/cms/useNavigation'
import { REDIRECTS } from '../../scripts/seo/redirectMap.mjs'

const OLD = '/services/guides/delai-pv-cse'
const KEPT = '/services/tarifs-infos/delai-redaction-pv-cse'

describe('merged "délai" pages (SEO fix list, item 2)', () => {
  it('names the kept page for the merged one, with or without a trailing slash', () => {
    expect(finalPath(OLD)).toBe(KEPT)
    expect(finalPath(`${OLD}/`)).toBe(KEPT)
    expect(finalPath('/services/guides/proces-verbal-cse')).toBe('/services/guides/proces-verbal-cse')
    expect(isMergedAway(OLD)).toBe(true)
    expect(isMergedAway(KEPT)).toBe(false)
  })

  it('301s both the legacy WordPress address and the merged address straight to the kept page', () => {
    const row = REDIRECTS.find((r) => r.from.includes('delai-pv-cse'))
    expect(row.to).toBe(KEPT)
    expect(row.from).toContain('services/guides/delai-pv-cse')
  })

  it('drops the merged page from the CMS page index and rewrites links to it (no stale link, no duplicate)', () => {
    const out = normalizeNavigation({
      pages: [{ path: OLD, title: 'Délai' }, { path: KEPT, title: 'Délai rédaction' }],
      sections: { guides: { entries: [{ label: 'Délai', to: OLD }] } },
    })
    expect(out.pages.map((p) => p.path)).toEqual([KEPT])
    expect(out.sections.guides.entries[0].to).toBe(KEPT)
  })
})

describe('legacy "livre blanc" address (item 1)', () => {
  it('301s to the guides page in one hop', () => {
    const row = REDIRECTS.find((r) => r.from.includes('livre-blanc-reunion-du-cse'))
    expect(row.to).toBe('/ressources/guides-livres-blancs-cse')
  })
})
