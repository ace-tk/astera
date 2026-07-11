# Changelog

All notable changes to Astera. This project loosely follows
[Keep a Changelog](https://keepachangelog.com/) and semantic versioning.

## [1.1.0] — 2026-07-11 · Launch hardening

The final-week pass a senior product engineer + QA lead would run: a
**Zero Dead UI** audit — every interactive element tested, then either made
production-ready or removed. See [Interaction Inventory](docs/INTERACTION_INVENTORY.md).

### ✨ Added — real interactions (no more placeholders)

- **AI Confidence Details** — the confidence ring is now a real modal with six
  animated radial gauges (overall, transcript, speaker, decisions, timeline,
  risks), each derived from the report's own data with a short explanation.
- **Executive-summary narration** — the summary reads aloud via the Web Speech
  API with play/pause/resume/restart, playback speed, mute, and word-by-word
  highlighting; hides gracefully where speech synthesis is unavailable.
- **Report feedback loop** — "Was this intelligence useful?" Yes celebrates +
  persists; "Not quite" opens a reasons modal. Stored per report, with Undo.
- **Review Mode** — a slide-in editor to correct the title, sharpen the summary,
  set a priority, edit/add/remove action items, and add notes — saved locally
  and reflected on the report immediately.
- **Notifications** — the topbar bell is a real recent-intelligence feed with an
  unread count that clears on open.
- **Share** copies a real link to the clipboard.
- **ASTRA memory** — recalls the report you were last in and your return visits,
  greeting you accordingly.

### 🎨 Changed

- **Three exceptional themes** — reduced six palettes to Light, Sunset, Royal;
  charts, Meeting DNA, and confidence gauges now re-skin per theme (not just the
  chrome). Retired themes fall back to Light.
- **Premium microcopy** — "Preparing your workspace…", "Gathering your
  intelligence…", "Create intelligence", "Understanding".
- All report modals close on Escape.

### 🗑️ Removed (dead UI)

- The static bell button, the placeholder feedback buttons, the report Export
  button, and three surplus themes — each replaced or retired.

### ✅ QA

- Every route renders with content and **zero console errors**; interactions
  exercised across all three themes, mobile, and reduced-motion.
- Codebase: no stray `console.*`, no TODO/placeholder text, no unused imports.

---

## [1.0.0] — 2026-07-11

The "launch-ready" release. Astera went from a polished SaaS to a product built
to be _remembered_ — a creative workspace for understanding meetings, not a CRUD
dashboard.

### ✨ Added — signature experiences

- **AI Intelligence Workspace** — the app's home is now an infinite React Flow
  canvas of the meeting pipeline. Fully custom nodes (each with a live
  mini-visual), animated edges with a traveling particle, click-to-inspect
  floating panels, and a "re-run intelligence" sweep that lights the graph up
  stage by stage.
- **Cinematic AI Replay** — the report composes itself on screen: the summary
  writes word by word, metrics count up, the timeline draws, and findings slide
  into place, over a live progress rail.
- **Interactive Meeting Replay** — a scrubbable vertical timeline that drives
  every synced panel at once (speaker, transcript, what Astra logged, running
  tallies); press play to auto-advance.
- **Meeting DNA** — a signature per-meeting fingerprint: six normalized traits
  rendered as an organic, animated radial "gene shape" (not bars), with a
  gradient fill, glow, and shimmer.
- **The Report Cover** — reports no longer open flat; paper assembles, the title
  rises word by word, an AI-confidence ring animates, and "Prepared by ASTRA"
  fades in before the reveal.
- **Demo Workspace** — six fully-authored demo meetings (Board, Fundraising,
  Finance, Hiring, Legal, Marketing) so anyone can experience everything in
  seconds with nothing to upload.
- **ASTRA assistant** — a living gradient orb (not a chat box) with moods
  (sleeping → listening → thinking → writing → completed) that expands into an
  assistant grounded in the current report, with streaming answers.
- **Premium Reader** — a Kindle-grade reading mode: in-report search, bookmarks,
  sticky notes, a document minimap, three zoom levels, focus mode, paper
  texture, and hover-to-highlight (annotations persist per report).

### ✨ Added — product polish

- **First-run experience + guided tour** — a magical welcome ("Let's replay one
  meeting together") and a skippable six-step walkthrough, re-launchable anytime.
- **Command palette (⌘K)** — fuzzy search, grouped actions, jump to any meeting,
  switch themes; plus a `?` shortcut guide and `g`-chord navigation.
- **Premium Settings** — six sectioned tabs (Appearance, Accessibility, Audio,
  Keyboard, Experimental, About) with animated switching.
- **Interview Mode** — pulsing ⓘ badges across the app explaining the
  engineering decisions (why React Flow, how DNA renders, theming approach).
- **System Status page** — animated service health with pulsing indicators,
  sparklines, latency, and uptime (green / yellow / red states).
- **About Astera** — an editorial story page (mission, philosophy, architecture,
  AI pipeline, signature experiences) built to help during interviews.
- **Toasts** with personality, illustrated **empty states**, a calm
  **error boundary**, and **skeleton** loaders.
- **Easter eggs** — the Konami code rains confetti, double-clicking the wordmark
  launches a paper airplane, and theme changes celebrate.
- **Synthesized sound engine** — asset-free Web Audio cues, muted by default.
- **Mesh-gradient backgrounds** that carry each section's emotion.

### ♿ Accessibility

- Reduce-motion honors the OS setting _and_ a manual toggle that drives Framer's
  global `MotionConfig` (JS animations settle instantly, not just CSS).
- Larger-text and always-show-focus preferences, persisted.
- `<main>` landmark, skip-to-content link, ARIA labels on icon-only controls.
- A native-feeling bottom tab bar on mobile (the sidebar is desktop-only).

### ⚡ Performance

- Route-level code splitting and manual vendor/motion/charts chunks.
- Stable React Flow `nodeTypes`/`edgeTypes` and memoized nodes/edges.
- Transform/opacity-only animations; lazy `AudioContext`.

### 🐛 Fixed

- **Critical:** `Button` rendered an invalid element when `as` was a component
  (e.g. `Link`) — `motion[as]` stringified to `[object Object]`, throwing at
  render and blanking every page that used a Button-as-Link (the entire nav).
  Now resolves string tags via `motion[tag]` and wraps components with a cached
  `motion.create`.
- Meeting DNA labels no longer overlap adjacent content in the report layout.
- Generated report copy no longer produces a doubled period on names.

### 📝 Docs & repo

- A best-in-class README (hero, screenshots, mermaid architecture + AI-pipeline
  diagrams, folder map, performance, accessibility, design decisions, roadmap).
- MIT `LICENSE`, `CONTRIBUTING.md`, issue templates, and a PR template.

---

## [0.2.0] — earlier

- The "unforgettable" pass: introduced the first versions of the Workspace,
  Replay, ASTRA, Reader, command palette, sound, and mesh backgrounds.

## [0.1.0] — initial

- Editorial landing page, six-theme design system, dashboard shell, Upload
  Studio, publication-style report, analytics, and the Express + MongoDB API.
