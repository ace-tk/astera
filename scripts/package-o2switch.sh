#!/usr/bin/env bash
# Builds the two things that get uploaded to O2Switch and verifies them:
#
#   deploy/o2switch/out/public_html/   -> cPanel document root of the domain (React build + .htaccess)
#   deploy/o2switch/out/astera-api/    -> cPanel "Application root" of the Node.js app (API + Passenger shim)
#   deploy/o2switch/out/*.zip          -> the same two folders zipped, for cPanel File Manager upload
#
# Nothing is deployed, no network calls are made besides npm, and NO secrets are read or copied:
# server/.env, server/backups and tests are deliberately excluded.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/deploy/o2switch/out"
fail() { echo "✗ $*" >&2; exit 1; }

echo "==> Frontend build (VITE_API_URL=/api, VITE_DEMO_MODE=false)"
cd "$ROOT/client"
[ -d node_modules ] || npm ci
VITE_API_URL=/api VITE_DEMO_MODE=false npm run build

echo "==> Verifying the bundle is production-ready"
[ -f dist/index.html ] || fail "client/dist/index.html missing"
if grep -rlq "localhost:5050" dist; then fail "dist still contains the dev API fallback (http://localhost:5050) — VITE_API_URL was not applied"; fi
if grep -rlE "vercel\.app|test1\.atoopv\.com" dist >/dev/null 2>&1; then fail "dist references a Vercel/test1 hostname"; fi
grep -rlq '"/api"' dist/assets || echo "  (note: could not find the literal \"/api\" in the bundle — check VITE_API_URL manually)"
echo "  ok: no localhost:5050, no vercel.app / test1 hostnames in dist"

echo "==> Assembling $OUT"
rm -rf "$OUT"
mkdir -p "$OUT/public_html" "$OUT/astera-api"
cp -R "$ROOT/client/dist/." "$OUT/public_html/"
cp "$ROOT/deploy/o2switch/public_html/.htaccess" "$OUT/public_html/.htaccess"
mkdir -p "$OUT/public_html/assets"
cp "$ROOT/deploy/o2switch/public_html/assets/.htaccess" "$OUT/public_html/assets/.htaccess"

cp "$ROOT/server/package.json" "$ROOT/server/package-lock.json" "$ROOT/server/app.cjs" "$OUT/astera-api/"
cp -R "$ROOT/server/src" "$OUT/astera-api/src"

echo "==> Safety checks on the package"
if find "$OUT" \( -name ".env" -o -name ".env.*" -o -name "backups" -o -name "test" -o -name "node_modules" \) | grep -q .; then
  fail "package contains a .env / backups / test / node_modules path"
fi
echo "  ok: no .env files, backups, tests or node_modules"

echo "==> Zipping"
( cd "$OUT" && zip -qr public_html.zip public_html && zip -qr astera-api.zip astera-api )

echo
echo "✓ Done. Upload:"
echo "    $OUT/public_html.zip  -> extract into the domain's document root (public_html)"
echo "    $OUT/astera-api.zip   -> extract into ~/astera-api (the Node app's Application root, OUTSIDE public_html)"
echo "  Then follow deploy/o2switch/README.md (cPanel steps, env vars, tests)."
du -sh "$OUT/public_html" "$OUT/astera-api" | sed 's/^/  size: /'
