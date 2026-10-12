# SEO release — how to build, verify and deploy

Covers the 12 Oct 2026 *Fix Instructions* items 1–5 (redirects, real 404/410, per-route HTML, sitemap,
SEO fields). Item 6 (CookieYes) is a separate piece of work.

## What changed in how the site is built

| Before | Now |
|---|---|
| `.htaccess` hand-edited, two copies | **Generated** from `client/scripts/seo/redirectMap.mjs` by `client/scripts/seo/htaccess.mjs` |
| Unknown URL → 200 + client-side 404 screen | Unknown URL → **real HTTP 404** (page body = the 404 screen) |
| Every URL served the homepage `<title>`/canonical | Every public URL has its **own** title, description, canonical, og tags, H1 and text in the raw HTML (`dist/_pre/<route>.html`) |
| sitemap = every markdown file | sitemap = static pages + markdown pages **that are published in the CMS** |

## Build (on a Mac, NOT on the O2Switch server)

Pre-rendering needs headless Chromium, which the shared hosting cannot run. So the release is built on a
developer machine and the finished `dist/` is uploaded.

```bash
cd client
npm ci
SEO_STRICT=1 npm run release:pack
```

`release:pack` = `build:release` (sitemap → vite build → pre-render every sitemap URL → release `.htaccess`)
→ `seo:verify` (starts a real Apache, runs ~450 checks: every redirect, 410, trailing slash, 404, sitemap URL)
→ `atoopv-release.zip`. It refuses to produce a zip if the verification fails or the build is not a release build.

The pre-render reads the **published** CMS content from the public API (`GET` only, ~150 requests), so run it
right before deploying, after the last CMS edit.

## Deploy

1. Back up the current document root (keep the old `.htaccess`).
2. Upload `client/atoopv-release.zip` to the document root and extract it **including the hidden `.htaccess`**
   (and `_pre/`).
3. Do **not** run the server-side `npm run build` / `.cpanel.yml` deploy afterwards: a server build has no
   pre-rendered pages and would put the plain single-page-app `.htaccess` back (redirects/410 stay, real 404s
   and per-route HTML are lost).
4. Run the acceptance commands below against the live site.

Rollback = restore the backup of the document root.

## Acceptance (what the client will run)

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://atoopv.com/proces-verbal/        # 301 https://atoopv.com/ressources/proces-verbal
curl -s -o /dev/null -w "%{http_code}\n" https://atoopv.com/test-404-xyz                          # 404
curl -s -o /dev/null -w "%{http_code}\n" https://atoopv.com/podcast-videos/                       # 410
curl -s https://atoopv.com/ressources/proces-verbal | grep -E "<title>|canonical|<h1"             # its own values
```

The local report (`client/dist-seo-report.md`, written by `npm run seo:verify`) lists the same checks for every
row of Brief v2.1 §5 plus Annex A, ready to attach to the test report.

## Things to know

* **A page published in the CMS appears (sitemap, pre-rendered HTML, valid URL) only after the next release
  build + upload.** Until then its URL answers 404 at the server. This is the price of "a real 404 for anything
  that is not a page": the pre-rendered file *is* the list of valid URLs.
* Private/dynamic areas stay client-rendered and are not 404-checked by the server: `/app`, `/login`,
  `/register`, `/forgot`, `/verify-email` and `/blog/*` (database-backed posts cannot be listed at build time).
* Adding a redirect = one row in `client/scripts/seo/redirectMap.mjs`, then `npm run seo:htaccess` (also runs
  on every build). A unit test fails on duplicates, chains and trailing slashes in targets.
* A **staging** build uses host-relative targets: `SEO_ORIGIN= npm run build:release`.
