# ATOOPV on O2Switch — deployment guide

Status: **prepared, not deployed.** Nothing here touches DNS, the Vercel deployment, or any database.
The Vercel deployment stays as the reference/fallback until O2Switch is verified.

```
https://atoopv.com
  ├── /            → Apache serves ~/public_html   (React build + .htaccess SPA rules)
  └── /api/*       → Passenger → Node 24 app        (~/astera-api: Express + Socket.IO)
                        ├── MongoDB Atlas   (same cluster/database as today)
                        └── SMTP (cPanel mailbox)  → contact form, verification & invitation emails
```

## 1. Build the package (on your Mac / CI — not on O2Switch)

```bash
./scripts/package-o2switch.sh
```

That runs the exact frontend build and assembles the upload folders:

| Item | Exact command / result |
|---|---|
| **Frontend build** | `cd client && VITE_API_URL=/api VITE_DEMO_MODE=false npm run build` (the same values are also in `client/.env.production`) |
| **Backend start** | `npm start` = `node src/index.js`. Passenger starts it through the startup file **`app.cjs`** (a 3-line CommonJS shim that `import()`s the ESM server). |
| **Node version** | **24** (repo pins `24.x`; absolute floor is 22.3 because of `pdf-parse`) |
| Output | `deploy/o2switch/out/public_html/` and `deploy/o2switch/out/astera-api/` (+ `.zip` of each) |

The script refuses to finish if the bundle still contains `localhost:5050` (the dev API fallback), a `vercel.app`/`test1` hostname, or if the package contains a `.env`, `backups`, tests or `node_modules`.

## 2. Environment variables (cPanel → Setup Node.js App → Environment variables)

Copy from [`env.production.example`](env.production.example) (placeholders only — never commit real values).

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | yes | `production` (the app-mode toggle sets it) |
| `CLIENT_URL` | yes | `https://atoopv.com,https://www.atoopv.com`. **First entry = base of email links.** Also the CORS + Socket.IO allowlist. |
| `MONGODB_URI` | yes | Atlas SRV string. **For staging use a separate database name** (e.g. `…/astera_staging`) so tests never touch production data. |
| `JWT_SECRET` | yes | ≥ 32 random chars — the server refuses to start otherwise |
| `JWT_EXPIRES_IN` | no | default `7d` |
| `ADMIN_EMAILS` | recommended | emails granted the admin/director role (also `role: admin` in the DB) |
| `DEEPGRAM_API_KEY` | optional | audio/video transcription; TXT/DOCX/PDF work without it |
| `TRANSCRIPTION_TIMEOUT_MS` | no | `170000` |
| `MAIL_PROVIDER` | yes | `smtp` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | yes | host from cPanel → Email Accounts → *Connect Devices → Manual settings*; `465` / `true` |
| `SMTP_USER` / `SMTP_PASS` | yes | full mailbox address + its password |
| `MAIL_FROM` | yes | e.g. `ATOOPV <no-reply@atoopv.com>` — an address on atoopv.com that `SMTP_USER` may send as |
| `CONTACT_TO_EMAIL` | no | defaults to `contact@atoopv.com` |
| `CONTACT_RATE_LIMIT_MAX` | no | contact submissions per IP per 15 min (default `5`) |
| `TRUST_PROXY` | no | reverse-proxy hops in front of Node (default `1`); see §6 |
| `PORT` | **do not set** | Passenger binds its own socket |
| `REDIS_URL`, `RESEND_API_KEY`, `OPENAI_API_KEY` | leave unset | not needed on a single Node process with SMTP |

Client-side build variables (baked into public JS — **no secrets ever**): `VITE_API_URL=/api`, `VITE_DEMO_MODE=false`; leave `VITE_SOCKET_URL` unset.

## 3. One-time cPanel setup (do it on a staging subdomain first)

**Recommended: rehearse on `staging.atoopv.com`** — create the subdomain (own document root), point a Node app at `staging.atoopv.com/api`, set `CLIENT_URL=https://staging.atoopv.com,…` and a *separate* Atlas database name. Only when every check in §5 passes, repeat for `atoopv.com`.

1. **Mailbox** — cPanel → Email Accounts → create `no-reply@atoopv.com` (or reuse `contact@atoopv.com`). Note the SMTP host shown under *Connect Devices*.
2. **Back up** the current `public_html` (it holds the page that is live today). Rollback = restore it.
3. **Backend** — upload `astera-api.zip` and extract to `~/astera-api` (**outside** `public_html`).
   cPanel → *Setup Node.js App* → **Create Application**:
   - Node.js version **24**, mode **Production**
   - Application root `astera-api`
   - Application URL `atoopv.com` + path `api`  (see §6 if a sub-path is refused)
   - Startup file `app.cjs`
   - Add every variable from §2, then **Run NPM Install** (installs from `package-lock.json`; use SSH `npm ci --omit=dev` if the cPanel Terminal hits memory limits — O2Switch documents that limitation).
4. **Frontend** — extract `public_html.zip` into the domain's document root, including the hidden `.htaccess` (and `assets/.htaccess`).
   cPanel may already have written its own `# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION` block into `.htaccess` — **keep it**; put ours above/below it, never inside.
5. **SSL** — confirm AutoSSL covers `atoopv.com` and `www`.
6. **Restart** the Node app from cPanel after any change.

## 4. What the `.htaccess` does (tested on a real Apache 2.4)

`/atoopv/tarification`, `/app/admin` … → React (`index.html`) · `/api/*` and `/api/socket.io` → **never** rewritten · HTTP → HTTPS · `www` → apex · `index.html` not cached · `/assets/*` cached 1 year (content-hashed).

## 5. Verify after deploying (staging, then production)

```bash
D=https://staging.atoopv.com        # or https://atoopv.com
curl -s  $D/api/health                                   # {"ok":true,"service":"astera-api",…}
curl -sI $D/atoopv/tarification | head -1                # HTTP 200  (SPA deep link)
curl -s -o /dev/null -w '%{http_code}\n' $D/api/nope     # 404 JSON, NOT the React page
curl -s -X POST $D/api/contact -H 'content-type: application/json' -d '{}'   # 400 + French fieldErrors
```
Browser checks: submit the Contact form → an email arrives at `contact@atoopv.com` with **Reply-To = the visitor**; register → verification email link starts with the first `CLIENT_URL`; log in as customer and as director; upload a TXT and watch the progress bar move; open `/app/admin` (director only) and the CMS.

## 6. Still to be tested ON O2Switch (cannot be proven locally)

| Risk | How to check | If it fails |
|---|---|---|
| **Atlas reachable** from the server (SRV DNS + port 27017) | `/api/health` works and login works; SSH: `nc -zv <shard-host> 27017` | ask O2Switch support; or allow-list the server IP in Atlas |
| **WebSocket through Passenger** | DevTools → Network → WS shows `/api/socket.io` `101`. If it shows only polling requests it still works (client falls back automatically) | acceptable — polling is safe on one Node process |
| **Sub-path app `atoopv.com/api`** | `/api/health` answers JSON | use a subdomain `api.atoopv.com` instead and build with `VITE_API_URL=https://api.atoopv.com/api VITE_SOCKET_URL=https://api.atoopv.com` (no code change; `CLIENT_URL` already covers CORS) |
| **`app.cjs` startup** | app shows *Started* in cPanel; Passenger log | try `src/index.js` as the startup file directly |
| **Client IP behind Passenger** (rate limits) | send 6 contact requests from ONE network → the 6th is `429`; from a second network it still works. Check the app log for `ERR_ERL_*` warnings | adjust `TRUST_PROXY`, or raise `CONTACT_RATE_LIMIT_MAX` — otherwise all visitors could share one limit |
| **SMTP** (real delivery, cert, sender rules) | contact form + verification email actually arrive | fix `SMTP_HOST` to the name on the certificate; last resort `SMTP_TLS_REJECT_UNAUTHORIZED=false` |
| **Limits**: 100 MB uploads held in memory, ~170 s pipeline, 90 s startup | upload a large audio/video file | ask O2Switch about memory/timeouts |
| **CMS-driven page** | the build treats `redaction-pv-cssct` as CMS-driven: the database must contain it, or that one page shows as unpublished. Import CMS content **before** switching the frontend | — |

Troubleshooting: add `PassengerAppLogFile "/home/<user>/logs/astera-api.log"` to `.htaccess`. Use SSH (not cPanel Terminal) for npm.

## 7. Rollback

Restore the backed-up `public_html`; stop the Node app. DNS is untouched by all of the above, and Vercel keeps running throughout.
