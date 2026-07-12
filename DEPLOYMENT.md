# Deployment

Astera deploys as two independent services: a **static client** on Vercel and an
**API** on Render, with MongoDB Atlas for persistence. The client ships in demo
mode, so **the frontend deploys and works with no backend at all** — wire the
API only when you want live persistence.

```
Vercel (client, static SPA)  ──REST/WS──▶  Render (Express API)  ──▶  MongoDB Atlas
```

## Prerequisites
- Node 20+
- A MongoDB Atlas cluster (only if running the live API)
- Vercel + Render accounts

---

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
