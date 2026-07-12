# Astera — Live Deployment

Astera runs as three managed pieces. All are on free tiers.

```
Browser ──▶ Vercel (React SPA) ──REST + WebSocket──▶ Render (Express API) ──▶ MongoDB Atlas
```

## Live URLs

| Piece | URL |
| --- | --- |
| **Frontend** (Vercel) | https://astera-silk.vercel.app |
| **Backend** (Render) | https://astera-dsws.onrender.com |
| **Health check** | https://astera-dsws.onrender.com/api/health |
| **Database** | MongoDB Atlas — cluster `cluster0.a58mfdi`, database `astera` |
| **Repo** | github.com/techcodie/astera (auto-deploys on push to `main`) |

Verified end-to-end in production: landing, demo mode, register, login, logout,
profile edit, transcript upload, report generation, MongoDB persistence,
refresh, delete, admin dashboard + approve, Socket.io, health, and a clean
console.

---

## Environment variables

Secrets live **only in the Render/Vercel dashboards and Atlas** — never in git.

### Backend — Render → service `astera` → Environment
| Variable | Purpose | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | enables strict config + secure logging |
| `PORT` | — | **injected by Render**; do not set |
| `MONGODB_URI` | Atlas connection string | `mongodb+srv://astera:<pw>@cluster0.a58mfdi.mongodb.net/astera?...` |
| `JWT_SECRET` | signs auth tokens | 96-hex secret; rotating it logs everyone out |
| `CLIENT_URL` | `https://astera-silk.vercel.app` | **CORS + Socket.io pin to this** — no trailing slash |
| `ADMIN_EMAILS` | admin allowlist | comma-separated; accounts with these emails get the Admin panel |

### Frontend — Vercel → project → Settings → Environment Variables
| Variable | Value | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `https://astera-dsws.onrender.com/api` | baked in at **build time** — changing it needs a redeploy |
| `VITE_SOCKET_URL` | `https://astera-dsws.onrender.com` | no `/api` suffix |

---

## Admin access

A user is an admin if their email is in `ADMIN_EMAILS` (Render) **or** their DB
`role` is `admin`. The panel lives at `/app/admin` and is hidden from everyone
else (403 / redirect).

**To change who is admin:** Render → `astera` → Environment → edit `ADMIN_EMAILS`
→ Save (auto-redeploys). Then that person registers/logs in normally and the
Admin link appears in their user menu.

---

## Runbook

### Deploy a future update (the normal path)
```bash
git add -A && git commit -m "your change" && git push origin main
```
Render and Vercel each **auto-deploy on push to `main`**. Pull requests get
Vercel preview URLs. CI (`.github/workflows/ci.yml`) runs lint · test · build · e2e.

### Manually redeploy
- **Frontend:** Vercel → Deployments → ⋯ → Redeploy.
- **Backend:** Render → `astera` → Manual Deploy → Deploy latest commit.

### Rotate the JWT secret
Render → Environment → `JWT_SECRET` → replace with a new value:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Save. Note: this invalidates all existing sessions (everyone must log in again).

### Rotate the database password
Atlas → Database Access → edit user `astera` → set new password → update
`MONGODB_URI` in Render with the new password → Save.

### Add a new environment variable
- **Server var:** add it to `server/src/config/env.js` schema, read via `env.*`,
  then set it in Render → Environment.
- **Client var:** must be prefixed `VITE_`; add to Vercel env, read via
  `import.meta.env.VITE_*` (only `client/src/config/index.js` should do this).
  A client var only takes effect after a **rebuild** (redeploy).

### Roll back
- **Frontend:** Vercel → Deployments → promote a previous build (instant).
- **Backend:** Render → Events → roll back to a prior deploy.

---

## Notes

- **Cold start:** Render's free tier sleeps after ~15 min idle; the first request
  then takes ~50s to wake. Normal for free hosting; a paid tier removes it.
- **Atlas network access** is set to `0.0.0.0/0` (allow from anywhere) because
  Render's egress IP isn't fixed on the free plan.
- The API **soft-connects** to Mongo: if the DB is briefly unreachable the API
  still boots and serves demo data, so a transient blip never 500s the service.
