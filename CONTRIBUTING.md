# Contributing to Astera

Thanks for taking the time to contribute. Astera aims to feel like a product
someone spent months crafting — so polish, consistency, and taste matter as
much as correctness here.

## Getting started

```bash
git clone https://github.com/techcodie/astera.git
cd astera

# Frontend (runs fully in demo mode, no backend needed)
cd client && npm install && npm run dev      # http://localhost:5173

# Backend (optional)
cd ../server && cp .env.example .env && npm install && npm run dev
```

## Ground rules

- **Match the surrounding code.** Same naming, comment density, and idioms.
- **Every color is a token.** Never hard-code hex in components — use the theme
  CSS variables or the `accent()` map. Never build dynamic Tailwind class names
  (`bg-${x}`); the JIT can't see them. Use the static `ACCENT` map instead.
- **Motion has a budget.** Prefer entrance over pop-in, respect
  `prefers-reduced-motion`, and keep interactions at 60fps.
- **Accessibility is not optional.** Label icon-only buttons, keep focus rings,
  and test keyboard paths.
- **Commit small, commit often.** One feature per commit, imperative subject
  lines (`feat: …`, `fix: …`, `polish: …`, `docs: …`).

## Before you open a PR

1. `npm run build` passes in `client/`.
2. Drive the change in a browser — don't rely on the build alone.
3. Fill out the pull-request template.

## Project layout

See the [README](./README.md#-project-structure) for the folder map and the
[About page](https://github.com/techcodie/astera) inside the app for the
architecture story.

## Code of conduct

Be kind, be specific, assume good faith. That's it.
