// fetch() for the public CMS API that survives its rate limit (120 requests per minute per IP, answered with 429):
// wait as long as the server asks (Retry-After / RateLimit-Reset, seconds) and try again.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function fetchRetry(url, init = {}, { tries = 6, fallbackWaitSeconds = 15 } = {}) {
  let res
  for (let i = 0; i < tries; i += 1) {
    res = await fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(20000) })
    if (res.status !== 429) return res
    const asked = Number(res.headers.get('retry-after')) || Number(res.headers.get('ratelimit-reset')) || fallbackWaitSeconds
    await sleep(Math.min(70, asked) * 1000 + 500)
  }
  return res
}
