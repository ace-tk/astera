<div align="center">

# ✦ Astera

### From Conversations to Clarity.

Astera turns long meetings into **beautiful intelligence reports** — decisions, owners,
risks, commitments, and a scrubbable timeline. Not a boring PDF. A publication your
team actually reads.

</div>

---

## Why it exists

Every meeting holds a decision, a promise, a risk. Most of it evaporates the moment the
call ends. Astera keeps it — and hands it back as a story. Drop in a recording or
transcript and, before the room clears, everyone has a report worth reading.

This is deliberately **not** another dark AI dashboard. It's an editorial, handcrafted
product: warm paper, oversized typography, six full color themes, and motion that feels
like Apple / Linear / Arc rather than a template.

## What's inside

Astera isn't a dashboard with an upload button. It's a creative workspace built
around understanding meetings, closer to Figma / Linear / Arc than an admin panel.

| Area | Highlights |
| --- | --- |
| **Intelligence Workspace** | The app's home — an infinite React Flow canvas of the meeting pipeline (recording → transcript → AI → timeline → speakers → decisions → risks → compliance → summary → report). Every node is fully custom with its own live mini-visual; edges animate with a traveling particle; clicking a node opens a rich floating panel; "Re-run intelligence" lights the graph up stage by stage. |
| **AI Replay** | The report **composes itself** on screen — Astra writes the summary word by word, metrics count up, the timeline draws, speaker bars fill, decisions and risks slide in. Cinematic, with a live progress rail. |
| **Meeting Replay** | A scrubbable vertical timeline that drives every panel at once — active speaker, transcript excerpt, what Astra logged, running tallies. Press play to auto-advance. |
| **ASTRA** | A living gradient orb (breathing, not a chat rectangle) that expands into an assistant grounded in the current report — talk-time, unresolved decisions, why a risk was flagged — with streaming answers. |
| **Reading Mode** | A Kindle-grade reader: editorial typography, paper texture, in-report search, a Sections/Bookmarks rail, a document minimap, zoom, focus mode, sticky notes, and hover-to-highlight — annotations persist per report. |
| **Keyboard-first** | ⌘K command palette (jump anywhere, search meetings, switch themes), a `?` shortcut guide, and `g`-chord navigation. |
| **Craft** | Synthesized (asset-free) UI sound engine — muted by default, mesh-gradient backgrounds that carry each section's emotion, magnetic buttons, cursor-tilt cards, and reduced-motion respected throughout. |
| **Landing** | Editorial hero with a mouse-parallax report stack, a scroll-lit story beat, an animated journey, a Pinterest-meets-Apple feature bento, testimonials, and pricing. |
| **Design system** | Every color is a CSS variable, so one `data-theme` swap re-skins the whole product across **6 themes** (Light, Aurora, Ocean, Sunset, Forest, Royal). |
| **Backend** | Express + MongoDB API with JWT auth, a transcript→report intelligence service, and Socket.io events driving the live pipeline. |

## Tech

**Frontend** — React 19 · Vite · TailwindCSS · Framer Motion · GSAP · Lenis ·
React Flow · React Router · React Query · Recharts · Lucide · Web Audio

**Backend** — Node · Express · MongoDB · Mongoose · JWT · Socket.io · Multer · Zod

**Deploy** — Vercel (client) · Render (API) · MongoDB Atlas

## Run it

The client renders the **entire product from seeded data in demo mode** — no backend
required.

```bash
# Frontend
cd client
npm install
npm run dev            # → http://localhost:5173

# Backend (optional — API + realtime pipeline)
cd server
cp .env.example .env   # add MONGODB_URI + JWT_SECRET, or leave blank for demo mode
npm install
npm run dev            # → http://localhost:5050
npm run seed           # optional: seed a demo account + reports
```

To use the live API instead of seeded data, set `VITE_DEMO_MODE=false` and
`VITE_API_URL` in `client/.env`.

## Architecture

```
astera/
├── client/                 # React 19 + Vite
│   └── src/
│       ├── components/      # common · landing · ui · dashboard · report
│       ├── pages/           # Landing + dashboard views
│       ├── layouts/         # DashboardLayout shell
│       ├── hooks/           # smooth scroll, magnetic hover, parallax, data
│       ├── services/        # api client · reports · demo data
│       ├── context/         # theme provider
│       ├── constants/       # themes + marketing/product content
│       └── styles/          # design tokens + 6 themes
└── server/                  # Express API
    └── src/
        ├── controllers/     # auth · reports
        ├── services/        # intelligence (transcript→report) · socket
        ├── models/          # User · Report
        ├── routes/ · middleware/ · config/
```

## Notes on craft

- **Motion respects you** — every animation honors `prefers-reduced-motion`.
- **Accessible focus** — a custom focus ring, semantic headings, keyboard-friendly controls.
- **No dynamic Tailwind classes** — feature colors resolve through a static token map so the JIT never misses a class.
- **Demo-first** — the API boots and serves data even with no database, so the whole system is explorable offline.

<div align="center">

*Crafted, not generated.*

</div>
