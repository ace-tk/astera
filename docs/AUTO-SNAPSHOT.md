# Automatic refresh of the pre-rendered pages and the sitemap

Problem (client e-mail, 17 Nov 2026): the HTML that crawlers receive comes from `_pre/` and was built at the last release. Publishing in
the CMS changed what visitors see but not that HTML.

## How it works now

```
admin publishes / unpublishes / removes / changes a redirect
  → API (server/src/cms/snapshotHook.js) waits 90 s for more changes, then sends ONE GitHub event "cms-publish"
  → GitHub Actions "SEO snapshot" (.github/workflows/seo-snapshot.yml)
       release build from `main` (reads the published CMS) → real-Apache check → upload (assets, _pre, rest, .htaccess last)
  → ~3–5 minutes after the last change the raw HTML, sitemap.xml and 301 rules are current
```
A nightly run at 03:17 UTC is the safety net. The build stops (nothing is uploaded) if the CMS cannot be read or a check fails.

**What this changes in how we work:** the site on O2Switch is now built from GitHub `main`. Work that is only on a laptop is not in the
result. Merge to `main` first, then ship.

## One-time setup (about 20 minutes; nothing is sent until step 4 is done)

1. **SSH key for GitHub** (O2Switch cPanel → SSH Access → Manage SSH Keys → Generate a new key, name it `github-snapshot`, no passphrase →
   Authorize it. View the **private** key and copy it). Note the SSH host and port shown on that page.
2. **GitHub secrets** (repo → Settings → Environments → `production` → Secrets): `O2SWITCH_SSH_HOST`, `O2SWITCH_SSH_PORT`,
   `O2SWITCH_SSH_USER` (the cPanel user), `O2SWITCH_SSH_KEY` (the private key), `O2SWITCH_TARGET_DIR` (the website's document root, e.g.
   `/home/tenu7190/atoopv.com`).
3. **First run, build only**: Actions → *SEO snapshot* → Run workflow with "deploy" **unticked**. It must end green (≈10 minutes).
   Then run it once with "deploy" **ticked** and check the live site (client's checks at the end of `docs/CLIENT-ACTIONS-2026-11-17.md`).
4. **Let the API start it**: create a fine-grained personal access token (GitHub → Settings → Developer settings → Fine-grained tokens) limited
   to this repository, permission *Contents: Read and write* (that is what `repository_dispatch` requires), then add to the API's secrets file
   (`~/.astera-api.env`, see CLIENT-ACTIONS P0) and restart the Node app:
   ```
   SNAPSHOT_GITHUB_REPO=ace-tk/astera
   SNAPSHOT_GITHUB_TOKEN=github_pat_...
   ```
5. Turn the nightly safety net on: repo → Settings → Secrets and variables → Actions → **Variables** → new variable `SEO_SNAPSHOT_ENABLED` = `true`
   (until then the nightly run is skipped; CMS events and manual runs always work).
6. Publish a test change in the CMS; a run named "SEO snapshot" appears in Actions within two minutes.

If it ever misbehaves: disable the workflow in the Actions tab, or remove the two variables; the site keeps what was last uploaded.
