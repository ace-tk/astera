import { describe, it, expect, vi } from 'vitest'
import { affectsPublicSite, createSnapshotScheduler } from '../src/cms/snapshotHook.js'

describe('which admin requests change the public site', () => {
  it('publish / unpublish / restore / remove a page, menus, footer, hero, legal, site pages, section navs, redirects', () => {
    for (const [m, p] of [
      ['POST', '/admin/cms/pages/6ab/publish'], ['POST', '/admin/cms/pages/6ab/unpublish'], ['POST', '/admin/cms/pages/6ab/restore'], ['DELETE', '/admin/cms/pages/6ab'],
      ['POST', '/admin/cms/menus/main/publish'], ['POST', '/admin/cms/footer/publish'], ['POST', '/admin/cms/home-hero/publish'], ['POST', '/admin/cms/legal-pages/publish'],
      ['POST', '/admin/cms/site-pages/tarification/publish'], ['POST', '/admin/cms/section-navs/services/publish'], ['POST', '/admin/cms/redirects'], ['DELETE', '/admin/cms/redirects/6ab'],
    ]) expect(affectsPublicSite(m, p), `${m} ${p}`).toBe(true)
  })
  it('not drafts, reads, duplicates, revisions or media', () => {
    for (const [m, p] of [
      ['PATCH', '/admin/cms/pages/6ab'], ['GET', '/admin/cms/pages/6ab'], ['POST', '/admin/cms/pages/6ab/duplicate'], ['POST', '/admin/cms/pages/6ab/discard-draft'],
      ['POST', '/admin/cms/pages/6ab/revisions/3/restore'], ['POST', '/admin/cms/media'], ['PATCH', '/admin/cms/menus/main'], ['GET', '/admin/cms/redirects'],
    ]) expect(affectsPublicSite(m, p), `${m} ${p}`).toBe(false)
  })
})

describe('snapshot scheduler', () => {
  const timers = () => {
    const q = []
    return { q, setTimer: (fn, ms) => { const t = { fn, ms, unref() {} }; q.push(t); return t }, clearTimer: (t) => { t.cleared = true } }
  }

  it('does nothing unless the repository and the token are configured', () => {
    const fetchImpl = vi.fn()
    const s = createSnapshotScheduler({ env: {}, fetchImpl })
    expect(s.state.enabled).toBe(false)
    expect(s.request('x')).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(createSnapshotScheduler({ env: { SNAPSHOT_GITHUB_REPO: 'not a repo', SNAPSHOT_GITHUB_TOKEN: 't' } }).state.enabled).toBe(false)
  })

  it('turns a burst of changes into ONE repository_dispatch event', async () => {
    const t = timers()
    const fetchImpl = vi.fn().mockResolvedValue({ status: 204 })
    const s = createSnapshotScheduler({ env: { SNAPSHOT_GITHUB_REPO: 'ace-tk/astera', SNAPSHOT_GITHUB_TOKEN: 'tok', SNAPSHOT_DEBOUNCE_SECONDS: '90' }, fetchImpl, ...t })
    s.request('POST /a'); s.request('POST /b'); s.request('POST /c')
    expect(t.q.length).toBe(3)
    expect(t.q.slice(0, 2).every((x) => x.cleared)).toBe(true) // each new change pushes the run back
    expect(t.q[2].ms).toBeLessThanOrEqual(90_000)
    await t.q[2].fn()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.github.com/repos/ace-tk/astera/dispatches')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(JSON.parse(init.body)).toMatchObject({ event_type: 'cms-publish', client_payload: { reason: 'POST /a, POST /b, POST /c' } })
    expect(s.state.lastError).toBeNull()
  })

  it('never throws when GitHub refuses; the error is kept for diagnosis', async () => {
    const t = timers()
    const log = { error: vi.fn() }
    const s = createSnapshotScheduler({ env: { SNAPSHOT_GITHUB_REPO: 'o/r', SNAPSHOT_GITHUB_TOKEN: 'tok' }, fetchImpl: vi.fn().mockResolvedValue({ status: 401 }), log, ...t })
    s.request('x')
    await expect(t.q[0].fn()).resolves.toBeUndefined()
    expect(s.state.lastError).toMatch(/401/)
    expect(log.error).toHaveBeenCalled()
  })
})
