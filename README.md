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

| Area | Highlights |
| --- | --- |
| **Landing** | Editorial hero with a mouse-parallax report stack, a scroll-lit story beat, an animated "journey" of how it works, a Pinterest-meets-Apple bento of features, testimonials, and pricing. |
| **Design system** | Every color is a CSS variable, so one `data-theme` swap re-skins the whole product across **6 themes** (Light, Aurora, Ocean, Sunset, Forest, Royal). Each feature owns a semantic color. |
| **App shell** | Collapsible animated sidebar, command-style search bar, soft page transitions. |
| **Upload Studio** | Drag-and-drop with a live, staged processing pipeline (transcript → intelligence → timeline → report → compliance → delivery). |
| **Report** | The centerpiece — a meeting typeset as a publication: AI summary, metric strip, scrubbable timeline, decisions with confidence, risks, commitments, and talk-time. |
| **Analytics** | Decision velocity, capture distribution, and report volume — custom-styled Recharts. |
| **Backend** | Express + MongoDB API with JWT auth, a transcript→report intelligence service, and Socket.io events driving the live pipeline. |

## Tech

**Frontend** — React 19 · Vite · TailwindCSS · Framer Motion · GSAP · Lenis · React Router ·
React Query · Recharts · Lucide

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
