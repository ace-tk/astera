# atoopv.com — client action list of 17 Nov 2026

Status of each item and what still has to be done by hand. Dates are for the confirmation e-mail to the client.

## P0 — Secrets (needs a person with access: Atlas, cPanel, Deepgram)

Nothing here can be done from the code. The code now lets the API read its secrets from a file OUTSIDE the web
root (`server/src/config/env.js`: `ENV_FILE`, then `~/.astera-api.env`, then `./.env`); it ships with the next backend update.

Order (rotate first, then move):
1. **MongoDB Atlas**: Database Access → the app user → Edit Password → *Autogenerate Secure Password* → copy it. Network Access →
   delete `0.0.0.0/0` and add the O2Switch server's outgoing IP only (see "Finding the IP" below).
2. **SMTP**: cPanel → Email Accounts → the sending address → change the password (use the generator).
3. **Deepgram**: console.deepgram.com → API Keys → create a new key, then revoke the old one.
4. **JWT secret**: any 64+ character random string — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   Rotating it logs every user out (accepted by the client).
5. Put the four new values in ONE file outside `public_html` and the API's document root, for example
   `/home/tenu7190/.astera-api.env` (cPanel File Manager → create the file, then set permissions to `600`):
   ```
   MONGODB_URI=...
   SMTP_PASS=...
   DEEPGRAM_API_KEY=...
   JWT_SECRET=...
   ```
   (keep every other, non-secret variable where it is).
6. cPanel → Setup Node.js App → the API → **delete the four variables from the environment list** (this is what writes them in
   plaintext into `.htaccess`), Save, Restart. Then open the document root's `.htaccess` and check that the
   `CLOUDLINUX ENV VARS` block no longer contains them.
7. Check: `https://api.atoopv.com/api/health` answers, log in to the admin, send a test contact form.

*Finding the IP* — O2Switch's outgoing IP is not always the one of the domain. Add the domain's IP first, then watch the app log;
if Atlas refuses the connection ("IP not whitelisted"), the log shows the address Atlas saw.

The backend update (needed for step 5/6 to work) is the usual one: git fetch + reset in `~/astera-api`, `npm ci`, restart.

## P0 — Prerender and sitemap (done in code; needs a release deploy)

* `client/scripts/generate-sitemap.mjs` now writes the same sitemap the client wrote by hand (88 URLs, identical list) with `<lastmod>`
  from the CMS `updatedAt`. Left out: the 6 legal pages, pages hidden from search engines in the CMS, pages whose canonical points elsewhere,
  redirected URLs. A second file, `scripts/seo/generated/prerender-routes.json`, lists every URL that must be pre-rendered (legal and noindex
  pages included — they stay reachable). `prerender.mjs` and the release `.htaccess` use that one, not the sitemap.
* The "Hide from search engines" box of the CMS was saved but never applied to the page. Fixed: the pages now carry
  `<meta name="robots" content="noindex, nofollow">`, and the release build **fails** if the CMS says noindex and the snapshot does not.
* Prerender now waits for the CMS answer of each page before taking the snapshot (migrated Ressources articles first ask the CMS for their
  legacy address; the snapshot used to be taken before the real content arrived).
* Check after the deploy (client's own checks):
  ```
  curl -s https://atoopv.com/services/by-city/redaction-pv-cse-paris | grep -c CRAMIF          # must be > 0
  for p in /services/guides/contenu-pv-cse /ressources/mentions-obligatoires-pv /ressources/proces-verbal /services/guides/qui-redige-pv-cse; do
    curl -s https://atoopv.com$p | grep -o '<meta name="robots"[^>]*>'; done                   # noindex, nofollow ×4
  ```

## P0 — Automatic refresh on every CMS publish/unpublish

See `docs/AUTO-SNAPSHOT.md`.

## P1 — api.atoopv.com answers 500 on unknown paths — DONE 18 Nov 2026

Cause: the API host's `.htaccess` held the website's single-page-app fallback (`RewriteRule ^ /index.html [L]`). There is no `index.html`
on `api.atoopv.com`, so every path outside `/api` rewrote to itself in a loop and Apache answered 500.
Fix (cPanel, 18 Nov): the two blocks "3b" (a website redirect) and "4" (the fallback) were removed from `~/api.atoopv.com/.htaccess`; the
CloudLinux Passenger block, the HTTPS rule and the `/api` rule were left as they were. Backup of the old file:
`/home/tenu7190/tmp/backup-api-docroot-htaccess-before-404-fix-20261118.txt`.
Checked after: `/zz-unknown` and `/index.html` → 404 (JSON), `/robots.txt` 200, `/api/health` 200, `/api/cms/*` 200, http → https 301, CORS preflight 204.

Note for the secrets item: that `.htaccess` contains NO secrets (checked). The variables (`MONGODB_URI`, `JWT_SECRET`, `SMTP_PASS`,
`DEEPGRAM_API_KEY`, …) live in cPanel → Setup Node.js App → the API's environment list. They are not reachable from the web
(`/.htaccess`, `/.env`, `/package.json` → 403/404, checked). Rotation and the move to `~/.astera-api.env` are still to be done.

## P1 — CMS: canonical URL + 301 redirects per page (done in code; needs backend + frontend deploy)

* Page editor → "Search & sharing" → **Canonical URL**: the page keeps working, search engines are told which address counts, and the page
  leaves the sitemap. Applied in the HTML head and in the pre-rendered snapshot.
* Page editor → **Redirects (301)**: old addresses that send visitors to this page. Server: `GET/POST/DELETE /api/admin/cms/redirects`, public
  `GET /api/cms/redirects`. No chains (every redirect points at the final page), loops, reserved addresses and addresses where a page is still
  published are refused. Visitors are redirected immediately by the site; real HTTP 301 for pages that are not CMS pages are written into the
  `.htaccess` at the next release (see `client/scripts/seo/generate-htaccess.mjs`).

## P2 — Caching

`/assets/*` already answers `Cache-Control: public, max-age=31536000, immutable` (checked 18 Nov, via `assets/.htaccess`).
What was missing: the self-hosted fonts and the images of `/public`. The generated `.htaccess` now gives fonts one year (immutable) and
images one week. Note that Googlebot caches rendering resources by its own rules, so the share of JS requests can stay high even with
correct headers.
