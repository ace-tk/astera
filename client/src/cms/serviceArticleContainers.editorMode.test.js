// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { parseContentFile } from '@/utils/contentMarkdown'
import { isRoundTripSafe } from './markdownRoundTrip'
import { disassembleServiceArticle } from './serviceArticleContainers'

const CONTENT = path.resolve(__dirname, '../../../content')
// The drafting batch (hub `nos-services-pv`/`services` and the already-migrated `redaction-pv-cssct` excluded).
const DRAFTING_BATCH = ['redaction-pv-cse', 'redaction-pv-cse-a-lacte', 'redaction-pv-csec', 'redaction-pv-irp', 'externaliser-pv-cse']

describe('drafting batch — each rich-text container opens in the same editor mode it would today', () => {
  for (const slug of DRAFTING_BATCH) {
    it(`${slug}: intro and main content are visual-editor-safe (no fallback needed)`, () => {
      const body = parseContentFile(fs.readFileSync(path.join(CONTENT, 'drafting', `${slug}.md`), 'utf8'), `${slug}.md`, 'S').body
      const c = disassembleServiceArticle('drafting', slug, body)
      expect(c.kind).toBe('editorial')
      expect(isRoundTripSafe(c.intro)).toBe(true)
      expect(isRoundTripSafe(c.main)).toBe(true)
      // Neither container is empty for these 5 pages — proves the check is meaningful, not vacuous.
      expect(c.intro.length).toBeGreaterThan(0)
      expect(c.main.length).toBeGreaterThan(0)
    })
  }

  it('the whole body is ALSO visual-editor-safe for all five (consistent with the earlier full-corpus audit)', () => {
    for (const slug of DRAFTING_BATCH) {
      const body = parseContentFile(fs.readFileSync(path.join(CONTENT, 'drafting', `${slug}.md`), 'utf8'), `${slug}.md`, 'S').body
      expect(isRoundTripSafe(body), slug).toBe(true)
    }
  })
})
