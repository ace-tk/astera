# Deployment

**Current architecture: everything on Vercel, one domain, with live realtime
progress.** The client (static Vite build), the REST API (Express), and the
realtime layer (Socket.IO over Vercel's native WebSocket support) deploy from
this one repo as a single Vercel project. MongoDB Atlas remains the sole
source of truth for application data and GridFS; Redis is used only as a
pub/sub transport for realtime fan-out — it holds no application data.

```
https://test1.atoopv.com
  ├── /            → client (static SPA, client/dist)
  └── /api/*       → server/src/app.js + Socket.IO, wrapped by api/[...path].js
                        ├── MongoDB Atlas — reports, users, GridFS attachments (source of truth)
                        └── Redis — Socket.IO cross-instance pub/sub only (Vercel Marketplace)
```

The client ships in demo mode, so **the frontend deploys and works with no
backend at all** — wire the API only when you want live persistence.

**Live progress over native Vercel WebSockets.** `api/[...path].js` exports an
`http.Server` with both the Express app and Socket.IO attached — Vercel's
documented pattern for WebSocket support on Functions
(vercel.com/docs/functions/websockets). Event names, payloads
(`report:stage`/`{stage}`, `report:ready`/`{id}`), and the `user:<id>` room
model are unchanged from the original implementation. Two transport-level
adaptations were required, both config-only:
- The Socket.IO path is namespaced under `/api/socket.io` (both server and
  client) — Vercel only forwards requests under `/api/*` to the function, so a
  bare `/socket.io/` path would never be reached.
- The client connects with `transports: ['websocket']` only (no long-polling
  fallback) — polling's multi-request handshake isn't reliable across
  serverless instances.

**Redis adapter — required, not optional.** On Vercel, the request that
processes an upload and the WebSocket holding that user's client are two
separate invocations with no guarantee of landing on the same function
instance; without a shared pub/sub layer, an emit from one instance silently
never reaches a socket held by another. `@socket.io/redis-adapter` against
Vercel Marketplace Redis closes that gap (setup steps below). If `REDIS_URL`
is unset or unreachable, the app still boots and works — it just falls back to
same-instance-only delivery, which is not safe for production but is exactly
right for a single local dev process.

**Progress survives a dropped WebSocket.** Each upload carries a client-
generated `jobId`; the server persists the current stage against it in
MongoDB (`ProcessingStatus`, a small TTL-expiring collection — auto-deletes
after 1 hour, holds nothing durable). If the socket reconnects mid-upload, the
client calls `GET /api/reports/progress/:jobId` to resync instead of losing
stages. This is the one additive schema change in this migration.

## Prerequisites
- Node 20+
- A MongoDB Atlas cluster (only if running the live API)
- A Vercel account on a plan with WebSocket support (public beta, all plans
  including Hobby, as of this writing) — Fluid Compute must be enabled
  (`vercel.json`'s `"fluid": true` forces this even on projects created before
  it became the 2025-04-23 default)
- A Redis instance — Vercel Marketplace Redis is the simplest option (setup below)
- A [console.deepgram.com](https://console.deepgram.com) key if audio/video upload transcription is used

---

## 0 · Project → Vercel (single project, repo root)

**Settings** (Vercel dashboard → Project → Settings → General)
- **Root directory:** repo root (not `client/`, not `server/`)
- **Framework preset:** Other — build/output/install come from `vercel.json`
- Vercel auto-detects `api/[...path].js` as a Node.js serverless function and
  serves everything else (the client build output) as static files; the
  `rewrites` rule in `vercel.json` is the SPA fallback and only applies to
  paths the filesystem (static files + `/api` function) didn't already match.

`vercel.json` (repo root) drives the build:
```json
{
  "installCommand": "npm install --prefix client && npm install --prefix server",
  "buildCommand": "npm run build --prefix client",
  "outputDirectory": "client/dist",
  "fluid": true,
  "functions": { "api/**/*.js": { "maxDuration": 300 } },
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

`maxDuration: 300` is **Vercel Hobby's actual default and hard maximum** (with
Fluid Compute) — not a conservative guess. `TRANSCRIPTION_TIMEOUT_MS=170000`
(server env, below) restores close to the original 180s Deepgram allowance
while leaving ~130s of headroom in the same invocation for receiving the
upload, running analysis, and writing the report. On Vercel Pro (configurable
up to 800s GA / 1800s beta), both can be raised further — keep them roughly in
step with each other.

### Redis setup (Vercel Marketplace)

1. Vercel dashboard → your project → **Storage** tab → **Create Database** →
   choose a Redis provider from the Marketplace (e.g. Upstash).
2. Follow the provider's setup — it provisions the instance and writes a
   connection-string env var to your project automatically (name varies by
   provider, e.g. `KV_URL`/`REDIS_URL`/`UPSTASH_REDIS_URL` — check what it
   actually named it under Settings → Environment Variables).
3. If the provider used a different name than `REDIS_URL`, either rename it
   or set `REDIS_URL` to the same value — `server/src/config/env.js` reads
   `REDIS_URL` specifically.
4. No other config needed — `server/src/services/socket.js` picks it up
   automatically and logs `✓ Socket.IO Redis adapter connected` on boot when
   it succeeds.

**Environment variables** (Vercel dashboard → Settings → Environment Variables
— set for Production, and Preview if you want PR previews to hit a live API):

| Var | Notes |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas SRV connection string — same cluster, unchanged |
| `JWT_SECRET` | ≥32 chars, not the dev default — server refuses to boot otherwise |
| `JWT_EXPIRES_IN` | e.g. `7d` (optional — defaults to `7d`) |
| `CLIENT_URL` | comma-separated allowlist, e.g. `https://test1.atoopv.com,https://astera-plum.vercel.app` — CORS pin (also scopes the Socket.IO handshake's CORS). Same-origin requests from `test1.atoopv.com` don't strictly need CORS, but keep both listed during the cutover and for local dev against the deployed API |
| `ADMIN_EMAILS` | comma-separated admin allowlist (optional) |
| `DEEPGRAM_API_KEY` | speech-to-text for audio/video uploads (optional — TXT/DOCX/PDF work without it) |
| `TRANSCRIPTION_TIMEOUT_MS` | `170000` (see above; raise on Pro) |
| `REDIS_URL` | Socket.IO cross-instance pub/sub only — see Redis setup above. Required for reliable live progress in production; the app still boots and serves REST traffic normally without it |
| `RESEND_API_KEY` | email delivery — verification/invitation/reset emails (optional; logs instead of sending if unset) |
| `MAIL_FROM` | e.g. `Astera <onboarding@resend.dev>` (optional) |
| `OPENAI_API_KEY` | present in the schema, currently unused by the shipped heuristic analysis — leave blank unless a future feature reads it |

**Client build-time vars** (same Vercel project, applied at build time since
Vite inlines them):

| Var | Value |
| --- | --- |
| `VITE_API_URL` | `/api` — same-origin, relative |
| `VITE_DEMO_MODE` | `false` |
| `VITE_SOCKET_URL` | leave unset — an unset value means "connect same-origin" (correct here). The socket path itself (`/api/socket.io`) is fixed in `client/src/config/index.js`, not env-driven |

Never commit `.env`/`.env.local` — both are already gitignored
(`.gitignore`, `server/.gitignore`). Set all of the above directly in the
Vercel dashboard.

### Post-deploy verification

```bash
DOMAIN=https://test1.atoopv.com

curl -s $DOMAIN/api/health                        # {"ok":true,...}
curl -sD - -o /dev/null $DOMAIN/api/health \
  | grep -i content-security-policy                # helmet headers present
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST $DOMAIN/api/reports \
  -H 'Content-Type: application/json' \
  -d '{"title":"x","transcript":"hi"}'             # 401 (writes require auth)
curl -s $DOMAIN/api/blog/featured                  # public blog route
```

Then, in the browser against the live domain:
- Sign up → verify email → log in (customer) and confirm the customer
  dashboard loads with owner-scoped reports.
- Log in as an admin (email in `ADMIN_EMAILS`, or `role: 'admin'`) and confirm
  the admin dashboard, stats, customer list, and All Files load.
- Upload a TXT/DOCX/PDF from the customer Upload Studio and watch the
  progress bar animate live, stage by stage, as the pipeline runs (open
  DevTools → Network → WS to confirm a `wss://test1.atoopv.com/api/socket.io/`
  connection is established). Check server logs for `✓ Socket.IO Redis
  adapter connected` — if it instead shows the `REDIS_URL not set` warning,
  progress will still work but only when the upload and the socket happen to
  land on the same instance; fix the Redis env var before relying on this in
  production.
- If `DEEPGRAM_API_KEY` is set, upload a short audio file and confirm
  transcription completes within the configured timeout.
- Submit a Report Request with an attachment (GridFS write), then as admin
  open the request and preview/download the attachment (GridFS read).
- Confirm the public blog page and homepage "featured" blog render.
- Optional: mid-upload, toggle network offline/online (or throttle) in
  DevTools to force a socket reconnect, and confirm the progress bar resyncs
  rather than resetting.

---

## Legacy: split-host deployment (Vercel client + Render API)

Kept for reference / rollback. Superseded by the single-Vercel-project setup
above, which is now the source of truth.

## 1 · Client → Vercel

The client is a static Vite build; `client/vercel.json` sets the SPA rewrite.

**Settings**
- **Root directory:** `client`
- **Framework preset:** Vite (auto) · Build: `npm run build` · Output: `dist`

**Environment variables**
| Var | Demo (default) | Live API |
| --- | --- | --- |
| `VITE_DEMO_MODE` | `true` | `false` |
| `VITE_API_URL` | — | `https://<api>.onrender.com/api` |
| `VITE_SOCKET_URL` | — | `https://<api>.onrender.com` |

Static files in `public/` (`robots.txt`, the favicon) are served directly; the
`/(.*) → /index.html` rewrite only catches client routes.

```bash
# or from the CLI, inside client/
npm i -g vercel && vercel --prod
```

---

## 2 · API → Render

`render.yaml` is a blueprint (Infrastructure-as-Code) — point Render at the repo
and it provisions the service.

**Config (from `render.yaml`)**
- Root: `server` · Build: `npm ci` · Start: `npm start`
- Health check: `/api/health`

**Environment variables** (set in the Render dashboard)
| Var | Notes |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | injected by Render automatically — the app binds `process.env.PORT` |
| `CLIENT_URL` | your Vercel URL — **CORS + Socket.io are pinned to it** |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Render generates a strong value; or set your own (≥32 chars) |
| `ADMIN_EMAILS` | comma-separated admin emails for the admin panel (optional) |
| `DEEPGRAM_API_KEY` | speech-to-text for audio/video uploads — free key at [console.deepgram.com](https://console.deepgram.com) (optional; TXT/DOCX/PDF work without it) |

> The server **refuses to boot** in production with a missing/weak/default
> `JWT_SECRET` — this is intentional. Generate one with
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

**Seed demo data (optional):** `npm run seed` in `server/` creates a demo user
(`maya@northwind.co` / `astera-demo`) and reports.

---

## 3 · Database → MongoDB Atlas
1. Create a free M0 cluster.
2. Add a database user; copy the SRV connection string into `MONGODB_URI`.
3. Network access: allow Render's egress (or `0.0.0.0/0` for a demo).

The API **soft-connects** — if Mongo is unreachable it still boots and serves
demo data, so a transient DB blip never takes the whole service down.

---

## Post-deploy verification

```bash
API=https://<api>.onrender.com

curl -s $API/api/health                      # {"ok":true,...}
curl -sD - -o /dev/null $API/api/health \
  | grep -i content-security-policy          # helmet headers present
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST $API/api/reports \
  -H 'Content-Type: application/json' \
  -d '{"title":"x","transcript":"hi"}'       # 401 (writes require auth)
```
Then open the Vercel URL, take the guided tour, and open a demo report — the
whole product runs from seeded data regardless of the API.

## CI/CD
Every push to `main` runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
(audit · lint · test · build · e2e). Vercel and Render each auto-deploy on push
to `main` once connected. Preview deployments are created for pull requests.

## Rollback
- **Client:** Vercel → Deployments → promote a previous build (instant).
- **API:** Render → Events → roll back to a prior deploy.

## Local production preview
```bash
cd client && npm run build && npm run preview   # serves the exact prod bundle
cd server && cp .env.example .env && npm start   # add MONGODB_URI + JWT_SECRET
```

## Notes & caveats (honest)
- `vite preview` (used locally and by Playwright) doesn't set long-cache headers;
  Vercel serves hashed assets `immutable` in production, so the Lighthouse
  "efficient cache policy" note is a preview-only artifact.
- Render's free tier cold-starts after inactivity; the health check keeps it warm
  on paid tiers.
