# Security

The security posture of Astera, what's enforced, and where the boundaries are.
Written to be honest — see [Known limitations](#known-limitations).

## Threat model (in brief)
Astera's shipped surface is a **static SPA in demo mode** — no user data, no
network calls, no secrets in the browser. The API is an optional service; its
threat model is a standard authenticated JSON API behind a proxy.

## What's enforced (API)

| Control | Implementation |
| --- | --- |
| **Secure headers** | `helmet` — strict CSP (`default-src 'none'`), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `frame-ancestors 'none'`. |
| **Environment validation** | `zod`-validated env at boot. In production a missing/weak/default `JWT_SECRET` (< 32 chars or the known dev default) **aborts startup**. |
| **AuthN** | JWT (HS256) signed with the validated secret; `bcrypt` (cost 10) password hashing; tokens verified in `requireAuth`. |
| **AuthZ on writes** | `POST /api/reports` requires a valid token — a report can never persist with an undefined owner. |
| **NoSQL injection** | `express-mongo-sanitize` strips `$`/`.` keys from request payloads. |
| **Input validation** | `zod` schemas on every write body → `422` with structured issues on bad input. |
| **Rate limiting** | 120 req/min per IP across `/api`, tightened to 30/min on `/api/reports`. |
| **Payload limits** | JSON capped at 1 MB; upload buffer capped at 100 MB (was 2 GB) to prevent memory exhaustion. |
| **CORS** | Pinned to `CLIENT_URL` on both HTTP and the Socket.io handshake; foreign origins are not reflected. |
| **Proxy awareness** | `trust proxy` so rate-limits and IPs are correct behind Render/Vercel. |

## What's enforced (client)
- **No XSS sinks.** There is no `dangerouslySetInnerHTML` / `innerHTML` / `eval`
  anywhere — React escapes all rendered output, including user-entered review
  notes and sticky notes.
- **No secrets in the bundle.** Demo mode needs no keys; `VITE_*` values are
  public config only (an API URL, never a secret).
- **CSP-friendly.** Self-contained; the only third-party origins are the font
  CDNs (preconnected), loaded non-render-blocking.

## Dependencies
- `npm audit` reports **0 vulnerabilities** on both client and server.
- CI fails the build on any **high/critical** advisory (`npm audit --audit-level=high`).

## Verifications (reproducible)
```bash
# write path is protected
curl -s -o /dev/null -w "%{http_code}\n" -X POST $API/api/reports \
  -H 'Content-Type: application/json' -d '{"title":"x","transcript":"hi"}'   # → 401

# production refuses a weak secret
NODE_ENV=production MONGODB_URI=mongodb://x/y node src/index.js               # → exits, config error

# secure headers present
curl -sD - -o /dev/null $API/api/health | grep -i 'content-security-policy'
```
These paths are covered by the server test suite (`server/test/api.test.js`).

## Secrets management
- `JWT_SECRET`, `MONGODB_URI`, and integration keys are set in the host
  dashboard, never committed. Render generates a strong `JWT_SECRET`
  (`generateValue: true`). Generate one manually with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Known limitations

Honesty over hype:

- **Reads are public.** `GET /reports` is unauthenticated; it only ever returns
  the caller's own data (scoped by `owner`) or demo data, so there's no
  cross-user leak — but a production build with real accounts should gate reads
  behind `requireAuth` too.
- **No refresh-token rotation / revocation.** Access tokens are stateless with a
  7-day expiry; a production system would add rotation and a revocation list.
- **No CSRF tokens.** The API is token-in-header (not cookie) auth, so classic
  CSRF doesn't apply; if cookie auth is ever added, add CSRF protection.
- **The analysis is heuristic, not an LLM.** No prompt-injection surface exists
  today because no model runs; wiring `llmExtract` would require input/output
  guarding.

## Reporting
Found something? Open a private security advisory on the GitHub repo rather than
a public issue.
