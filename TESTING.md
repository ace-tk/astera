# Testing

Astera ships with **55 tests** across three layers, run on every push in CI.
The goal is confidence: the critical paths — auth, report generation, workspace,
replay, command palette, theme switching, and the core hooks/utilities — are
covered by real assertions, not smoke.

## Layers

| Layer | Tooling | What it covers | Count |
| --- | --- | --- | --- |
| Client unit / component | Vitest + Testing Library (jsdom) | utilities, services, hooks, key components | 35 |
| Server / API | Vitest + supertest | auth surface, validation, security headers, analysis service | 14 |
| End-to-end | Playwright (chromium) | real user journeys against the production build | 6 |

## Running

```bash
# client (from client/)
npm run test            # unit + component (Vitest)
npm run test:coverage   # with V8 coverage
npm run test:e2e        # Playwright against a fresh production build
npm run lint            # ESLint — 0 errors, 0 warnings

# server (from server/)
npm run test            # supertest API + analysis service
```

## What's tested, and why it matters

### Client unit & component (`src/**/*.test.{js,jsx}`)
- **`utils/accent`** — the static-class token map (JIT-safe) and its fallback.
- **`utils/confidence`** — six grounded categories, clamped 40–99, derived from
  the report's own DNA/decisions.
- **`services/astra`** — the answer engine routes each intent (talk-time, risk,
  decisions, commitments, summary, fallback) and `greetWithMemory` recalls the
  previous report; resilient when `localStorage` is blocked.
- **`services/replay`** — moment builder attaches speaker/line/detail with stable ids.
- **`context/ThemeContext`** — switching persists + re-skins `<html>`; exactly
  three themes; a retired/unknown saved theme falls back to Light.
- **`hooks/useReportEdits`** — per-report persistence, empty-key pruning, reset.
- **`components/ui/Button`** — renders as a native button *and* as a router
  `Link` (a regression guard for the `motion[as]` fix that once blanked the app).
- **`components/common/CommandPalette`** — opens on event, fuzzy-filters, empty state.
- **`components/dna/MeetingDNA`** — renders the SVG fingerprint (6 vertices) + labels.

### Server (`test/api.test.js`, `test/intelligence.test.js`)
Driven with `supertest` against `createApp()` (no port, no DB — controllers take
their demo/guard paths):
- `GET /api/health` → 200; **helmet** headers present; unknown route → 404.
- `GET /api/reports` serves demo data without a database.
- **Write path is protected:** unauth → 401, bad token → 401, authed-but-invalid
  body → 422, valid authed request → 201 with a generated report.
- Auth validation: malformed login → 422; `GET /api/auth/me` requires a token.
- **Analysis service:** extracts decisions/risks/commitments from transcript
  cues, is honestly labelled `engine: 'heuristic'`, and emits each pipeline stage.

### End-to-end (`e2e/smoke.spec.js`)
Playwright builds the app and drives the **real production bundle**:
1. Landing renders and links into the app.
2. Workspace renders the intelligence graph (10 custom nodes).
3. A report reveals its cover, then shows the summary + Meeting DNA.
4. The command palette opens and navigates.
5. Theme switching re-skins and **persists across reload**.
6. **Zero console errors** across the core journey.

## Conventions
- Tests are colocated with source (`*.test.jsx`) or in `test/` for the server.
- `src/test/setup.js` stubs `matchMedia`, `scrollTo`, and `ResizeObserver` (jsdom
  gaps) and clears `localStorage` between tests.
- `src/test/providers.jsx` wraps components in the providers they need.
- Vitest only collects `src/**`; Playwright specs live in `e2e/` — no overlap.

## CI
`.github/workflows/ci.yml` runs three parallel jobs on every push/PR — client
(audit · lint · unit · build), server (audit · test), and e2e (Playwright,
uploading the HTML report) — and fails on any lint error, failing test, or
high/critical vulnerability.

## What's not covered (honest)
- No `mongodb-memory-server`, so DB-backed auth persistence (signup→login round
  trip) isn't integration-tested — the *guards* are, but not the happy-path
  against a real Mongo. That's the first thing to add for a production launch.
- Visual-regression is done manually via screenshots, not automated snapshots.
