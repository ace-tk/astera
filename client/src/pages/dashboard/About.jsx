import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Workflow, Clapperboard, Fingerprint, Shield, Gauge, Layers } from 'lucide-react'
import MeshBackground from '@/components/common/MeshBackground'
import Reveal from '@/components/ui/Reveal'
import AstraOrb from '@/components/assistant/AstraOrb'
import Wordmark from '@/components/common/Wordmark'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const PRINCIPLES = [
  { icon: Layers, color: 'royal', title: 'Editorial, not admin', body: 'Meetings deserve a publication, not a dashboard. Big type, warm paper, generous whitespace.' },
  { icon: Fingerprint, color: 'purple', title: 'Signature, not generic', body: 'Meeting DNA, the living workspace, cinematic replay — moments you remember, not another CRUD app.' },
  { icon: Gauge, color: 'sky', title: 'Motion with purpose', body: 'Every animation earns its place; nothing appears, everything arrives. Reduced-motion is always honored.' },
  { icon: Shield, color: 'emerald', title: 'Calm by default', body: 'Sound is muted, tours are skippable, empty states are kind. Premium means respectful.' },
]

const PIPELINE = [
  { step: '01', title: 'Ingest', body: 'Audio, video, or a raw transcript is uploaded and buffered (Multer → Cloudinary in production).', color: 'coral' },
  { step: '02', title: 'Transcribe', body: 'Speech is diarized and timestamped (Deepgram), producing a speaker-attributed transcript.', color: 'orange' },
  { step: '03', title: 'Understand', body: 'An LLM pass (OpenAI) extracts decisions, owners, risks, commitments, and sentiment — with citations.', color: 'purple' },
  { step: '04', title: 'Compose', body: 'The intelligence is typeset into a report, a scrubbable timeline, Meeting DNA, and analytics.', color: 'royal' },
  { step: '05', title: 'Deliver', body: 'Socket.io streams live progress; the finished report lands before the room clears.', color: 'emerald' },
]

const ARCH = [
  { title: 'Client', tech: 'React 19 · Vite · Tailwind · Framer Motion · React Flow', color: 'royal' },
  { title: 'API', tech: 'Node · Express · JWT · Zod · Socket.io', color: 'purple' },
  { title: 'Data', tech: 'MongoDB · Mongoose', color: 'emerald' },
  { title: 'Analysis', tech: 'Deepgram (speech) · OpenAI (extraction) — in production', color: 'coral' },
]

function Section({ eyebrow, title, children, color = 'royal' }) {
  return (
    <Reveal className="mt-20">
      <span className={cn('eyebrow', accent(color).text)}>{eyebrow}</span>
      <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-[1.08] tracking-tight text-balance">{title}</h2>
      <div className="mt-6">{children}</div>
    </Reveal>
  )
}

export default function About() {
  return (
    <div className="relative">
      <MeshBackground mood="ai" />
      <div className="mx-auto max-w-3xl pb-16">
        <Link to="/app/settings" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Settings
        </Link>

        {/* Hero */}
        <Reveal className="mt-8">
          <div className="flex items-center gap-4">
            <AstraOrb size={56} state="completed" />
            <Wordmark />
          </div>
          <h1 className="mt-8 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
            Meetings deserve better stories.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted text-pretty">
            Every meeting holds a decision, a promise, a risk — and most of it evaporates the moment
            the call ends. Astera keeps it, and hands it back as a report your team actually reads.
            From conversations to clarity.
          </p>
        </Reveal>

        {/* Why */}
        <Section eyebrow="Why Astera exists" title="Notes die. Decisions get lost. Promises quietly disappear." color="coral">
          <p className="max-w-xl leading-relaxed text-muted">
            Note-takers capture words, not meaning. Transcripts are long and unread. Astera reads the
            <em> intent</em> of a conversation — what was decided, who owns it, what’s at risk — and
            composes it into something worth opening. The goal was never another AI dashboard; it was
            a product people remember.
          </p>
        </Section>

        {/* Design philosophy */}
        <Section eyebrow="Design philosophy" title="Four principles behind every screen." color="purple">
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
                <span className={cn('grid h-11 w-11 place-items-center rounded-2xl', accent(p.color).softBg, accent(p.color).text)}><p.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-display text-lg font-medium tracking-tight">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Architecture */}
        <Section eyebrow="Architecture" title="A clean split from pixels to persistence." color="royal">
          <div className="grid gap-3 sm:grid-cols-2">
            {ARCH.map((layer) => (
              <div key={layer.title} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-card p-5 shadow-soft">
                <span className={cn('h-10 w-1.5 shrink-0 rounded-full', accent(layer.color).bg)} />
                <div>
                  <p className="font-medium">{layer.title}</p>
                  <p className="text-xs text-muted">{layer.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* AI pipeline */}
        <Section eyebrow="Analysis pipeline" title="How a conversation becomes clarity." color="emerald">
          <div className="space-y-3">
            {PIPELINE.map((p) => (
              <div key={p.step} className="flex gap-4 rounded-2xl border border-ink/8 bg-card p-5 shadow-soft">
                <span className={cn('font-display text-2xl font-semibold', accent(p.color).text)}>{p.step}</span>
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald/25 bg-emerald/[0.06] p-5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald/12 text-emerald"><Sparkles className="h-4 w-4" /></span>
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-medium text-ink">Honest note.</span> This build runs in demo mode with
              sample meetings and a deterministic heuristic analyser — the transcription and LLM extraction
              steps above are the production path, not yet wired. Nothing here claims analysis it didn't perform.
            </p>
          </div>
        </Section>

        {/* How workspace / replay work */}
        <Section eyebrow="Signature experiences" title="Two ideas that make Astera unmistakable." color="sky">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple/10 text-purple"><Workflow className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight">The Intelligence Workspace</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Built on React Flow with fully custom nodes and edges. The meeting is a graph you can
                explore — click any stage to inspect what Astra understood, or re-run the pipeline and
                watch it light up.
              </p>
            </div>
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral/10 text-coral"><Clapperboard className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight">Cinematic Replay</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                The report composes itself — summary writing, metrics counting, timeline drawing — then
                becomes a scrubbable meeting you can move through moment by moment. Never a spinner.
              </p>
            </div>
          </div>
        </Section>

        <Reveal className="mt-20 flex items-center gap-2 border-t border-ink/8 pt-8 text-sm text-muted">
          <Sparkles className="h-4 w-4 text-accent" /> Crafted, not generated.
        </Reveal>
      </div>
    </div>
  )
}
