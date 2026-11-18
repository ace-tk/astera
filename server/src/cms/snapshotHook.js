/**
 * Keeps the pre-rendered pages (the HTML crawlers receive) and sitemap.xml in step with the CMS.
 *
 * Shared hosting cannot run a browser, so the snapshots are rebuilt by a GitHub Actions workflow
 * (.github/workflows/seo-snapshot.yml). This module only tells GitHub to start it: a few seconds after any admin
 * change that alters what the public site shows (publish, unpublish, remove, restore, menus, footer, redirects ...) it sends
 * one `repository_dispatch` event (`cms-publish`). Several changes in a row become ONE run (debounce).
 *
 * Off unless both variables are set (nothing leaves the server otherwise):
 *   SNAPSHOT_GITHUB_REPO=owner/name       SNAPSHOT_GITHUB_TOKEN=<fine-grained token, "Contents: read and write"... see docs/AUTO-SNAPSHOT.md>
 *   SNAPSHOT_DEBOUNCE_SECONDS=90 (optional)
 */
const WRITE = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])
const PUBLIC_CHANGES = [
  /^\/admin\/cms\/pages\/[^/]+\/(publish|unpublish|restore)$/,
  /^\/admin\/cms\/pages\/[^/]+$/, // DELETE = remove the page
  /^\/admin\/cms\/menus\/[^/]+\/publish$/,
  /^\/admin\/cms\/footer\/publish$/,
  /^\/admin\/cms\/home-hero\/publish$/,
  /^\/admin\/cms\/legal-pages\/publish$/,
  /^\/admin\/cms\/site-pages\/[^/]+\/publish$/,
  /^\/admin\/cms\/section-navs\/[^/]+\/publish$/,
  /^\/admin\/cms\/redirects(\/[^/]+)?$/,
]

/** True when this admin request changes what visitors (and crawlers) see. */
export function affectsPublicSite(method, path) {
  if (!WRITE.has(String(method).toUpperCase())) return false
  const clean = String(path).split('?')[0].replace(/\/+$/, '')
  if (/^\/admin\/cms\/pages\/[^/]+$/.test(clean) && String(method).toUpperCase() === 'PATCH') return false // a draft save is not public
  return PUBLIC_CHANGES.some((re) => re.test(clean))
}

export function createSnapshotScheduler({ env = process.env, fetchImpl = (...a) => fetch(...a), log = console, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  const repo = env.SNAPSHOT_GITHUB_REPO
  const token = env.SNAPSHOT_GITHUB_TOKEN
  const delayMs = Math.max(0, Number(env.SNAPSHOT_DEBOUNCE_SECONDS ?? 90)) * 1000
  const enabled = Boolean(repo && token && /^[\w.-]+\/[\w.-]+$/.test(repo))
  let timer = null
  let first = 0
  let reasons = []
  const state = { enabled, lastDispatchAt: null, lastError: null, pending: false }

  async function fire() {
    timer = null
    state.pending = false
    const why = reasons.slice(-5).join(', ')
    reasons = []
    try {
      const res = await fetchImpl(`https://api.github.com/repos/${repo}/dispatches`, {
        method: 'POST',
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', 'User-Agent': 'atoopv-cms' },
        body: JSON.stringify({ event_type: 'cms-publish', client_payload: { reason: why } }),
      })
      if (res.status !== 204) throw new Error(`GitHub answered ${res.status}`)
      state.lastDispatchAt = new Date().toISOString()
      state.lastError = null
    } catch (err) {
      state.lastError = err.message
      log.error?.(`[snapshot] could not start the rebuild: ${err.message}`)
    }
  }

  return {
    state,
    /** Ask for a rebuild; many calls within the delay (max 5 minutes) cost one GitHub event. */
    request(reason = 'cms change') {
      if (!enabled) return false
      reasons.push(reason)
      state.pending = true
      const now = Date.now()
      if (!timer) first = now
      else clearTimer(timer)
      const wait = Math.min(delayMs, Math.max(0, first + 5 * 60_000 - now))
      timer = setTimer(fire, wait)
      timer.unref?.()
      return true
    },
    flush: fire,
  }
}

const shared = createSnapshotScheduler()
export const snapshotScheduler = shared

/** Express middleware: after a successful admin change that is public, schedule a rebuild. */
export const snapshotMiddleware = (scheduler = shared) => (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 300 && affectsPublicSite(req.method, req.path)) scheduler.request(`${req.method} ${req.path}`)
  })
  next()
}
