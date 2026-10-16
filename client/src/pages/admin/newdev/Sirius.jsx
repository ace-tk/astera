import { useState } from 'react'
import {
  Library, FolderKanban, Clock, Plug, Palette, ScanLine, Table2, Columns2, Repeat, FilePlus2, FileSearch, FileText,
  Presentation, Code, Image as ImageIcon, Share2, Send, Paperclip, Search, Lock, Download, Plus, Settings, Info,
  ChevronRight, FileType, Folder, FileSpreadsheet, Terminal, Users,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// Design port of the SIRIUS Engine workspace (three columns: tools & commands · document + prompt · output history),
// restyled with the ATOOPV tokens. Sample data only — nothing is generated, saved or sent.

const NAV = [
  { label: 'Library of docs', icon: Library },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Chat history', icon: Clock },
  { label: 'Connectors', icon: Plug },
]
const TOOLS = [
  { label: 'Brochure Designer', icon: Palette },
  { label: 'Document Extractors', icon: ScanLine },
]
const COMMANDS = [
  { title: 'Summarize document', slash: '/summarize', icon: FileText },
  { title: 'Extract tables', slash: '/extract-tables', icon: Table2 },
  { title: 'Compare two files', slash: '/compare-files', icon: Columns2 },
  { title: 'Convert file format', slash: '/convert-format', icon: Repeat },
  { title: 'Make a report', slash: '/make-reports', icon: FilePlus2 },
  { title: 'Read a page', slash: '/read-page', icon: FileSearch },
  { title: 'Select file & page range', slash: '/custom-page-file', icon: ScanLine },
]
const FORMATS = [
  { id: 'html', label: 'HTML', icon: Code },
  { id: 'ppt', label: 'PPT', icon: Presentation },
  { id: 'word', label: 'WORD', icon: FileText },
  { id: 'pdf', label: 'PDF', icon: FileType },
  { id: 'image', label: 'Create image', icon: ImageIcon },
  { id: 'social', label: 'Social media connector', icon: Share2 },
]
const FILE_TYPES = ['word', 'ppt', 'ppt', 'word', 'word', 'html', 'ppt', 'word', 'pdf', 'word', 'pdf']
const TYPE_ICON = { word: FileText, ppt: Presentation, html: Code, pdf: FileType, xls: FileSpreadsheet }

const OUTPUTS = [
  { id: 'o1', title: 'Select file & page range', type: 'WORD', time: '16:39', where: 'Company library / Reports' },
  { id: 'o2', title: 'Your company', type: 'PPT', time: '15:25', where: 'Company library / Brochures' },
  { id: 'o3', title: 'Your company', type: 'PPT', time: '12:38', where: 'Company library / Brochures' },
  { id: 'o4', title: 'Summarize document', type: 'WORD', time: '12:35', where: 'Company library / Reports' },
  { id: 'o5', title: 'CSE_SGCA_26-…', type: 'WORD', time: '12:35', where: 'Company library / Uploads' },
  { id: 'o6', title: 'Compliance overview', type: 'HTML', time: '12:34', tag: 'Sample', where: 'Company library / Compliance' },
]
const DOC = [
  ['Policies', 'Keep company policies together with a clear document owner and review date.'],
  ['Resources', 'Find reference documents, templates and working checklists.'],
  ['Guidelines', 'Record guidance that your team has reviewed and approved.'],
  ['Workplace compliance guide', 'Document responsibilities, review policies regularly, and retain a record of team acknowledgements.'],
  ['Annual audit checklist', 'Assign an owner. Gather source documents. Review gaps. Track actions through completion.'],
]

const TYPE_TONE = { WORD: 'bg-sky/15 text-sky', PPT: 'bg-coral/15 text-coral', HTML: 'bg-emerald/15 text-emerald', PDF: 'bg-rose/15 text-rose' }

export default function Sirius() {
  const [format, setFormat] = useState('html')
  const [active, setActive] = useState('o6')
  const [command, setCommand] = useState(null)
  const [prompt, setPrompt] = useState('')
  const current = OUTPUTS.find((o) => o.id === active)
  const isSample = active === 'o6'

  return (
    <>
      <p className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-card px-2.5 py-1 text-[11px] text-muted">
        <Info className="h-3 w-3" /> New Development · Sirius — design preview, sample data, nothing is generated or saved.
      </p>

      <div className="flex min-h-[40rem] flex-col overflow-hidden rounded-2xl border border-ink/8 bg-card shadow-soft lg:h-[calc(100vh-11rem)]">
        {/* Top bar */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-ink/8 px-4">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-[12px] font-semibold text-white">S</span>
          <span className="font-display text-sm font-semibold tracking-tight">SIRIUS Engine</span>
          <ChevronRight className="h-3.5 w-3.5 text-ink/30" aria-hidden="true" />
          <span className="text-[13px] text-muted">Company workspace</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-2.5 py-1 text-[11px] text-muted"><Lock className="h-3 w-3" /> Private workspace</span>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[15.5rem_minmax(0,1fr)_17rem]">
          {/* Left: new chat, navigation, tools, commands */}
          <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto border-r border-ink/8 bg-paper/50 p-3 lg:flex">
            <Button variant="accent" size="sm" magnetic={false} className="w-full justify-center"><Plus className="h-4 w-4" /> New chat</Button>
            <nav className="space-y-0.5" aria-label="Sirius navigation">
              {NAV.map((n) => (
                <button key={n.label} className="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink">
                  <n.icon className="h-4 w-4 text-muted" /> {n.label}
                </button>
              ))}
            </nav>
            <div>
              <p className="px-2.5 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Tools</p>
              {TOOLS.map((t) => (
                <button key={t.label} className="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink">
                  <t.icon className="h-4 w-4 text-muted" /> {t.label}
                </button>
              ))}
            </div>
            <div>
              <p className="px-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Run commands</p>
              <p className="px-2.5 pb-2 text-[11px] text-muted">Choose a tool for this document</p>
              <div className="space-y-1.5">
                {COMMANDS.map((c) => (
                  <button
                    key={c.slash}
                    onClick={() => { setCommand(c.slash); setPrompt(`${c.slash} `) }}
                    className={cn(
                      'group flex w-full items-center gap-2.5 rounded-xl border bg-card p-2.5 text-left transition-colors',
                      command === c.slash ? 'border-accent/50 bg-accent/[0.06]' : 'border-ink/8 hover:border-ink/20',
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent"><c.icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold leading-tight">{c.title}</span>
                      <span className="block truncate font-mono text-[10.5px] text-muted">{c.slash}</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink/30 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Centre: file strip, formats, document, prompt */}
          <section className="flex min-h-0 min-w-0 flex-col">
            <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-ink/8 px-3 py-2">
              <span className="flex shrink-0 items-center gap-1.5 pr-1 text-[11px] leading-tight text-muted"><Paperclip className="h-3.5 w-3.5" /> Company &amp;<br />meeting files</span>
              {FILE_TYPES.map((t, i) => {
                const I = TYPE_ICON[t]
                return (
                  <button key={i} aria-label={`File ${i + 1}`} className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-card text-muted transition-colors hover:text-ink', i === 5 ? 'border-accent text-accent' : 'border-ink/10')}>
                    <I className="h-4 w-4" />
                  </button>
                )
              })}
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <span className="hidden h-9 items-center gap-1.5 rounded-lg border border-ink/10 px-3 text-[12px] text-muted md:inline-flex"><Search className="h-3.5 w-3.5" /> Find file / meeting</span>
                <button aria-label="Add file" className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 text-muted hover:text-ink"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div role="tablist" className="flex shrink-0 gap-1 overflow-x-auto border-b border-ink/8 px-3">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={format === f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn('-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors', format === f.id ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink')}
                >
                  <f.icon className="h-3.5 w-3.5" /> {f.label}
                </button>
              ))}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
              <h2 className="font-display text-base font-semibold tracking-tight">{current.title}</h2>
              <ChevronRight className="h-3.5 w-3.5 text-ink/30" aria-hidden="true" />
              <span className="truncate text-[11.5px] text-muted">{current.where}{isSample ? ' · Sample document' : ''}</span>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="soft" magnetic={false}><Users className="h-3.5 w-3.5" /> Share to team</Button>
                <Button size="sm" variant="accent" magnetic={false}><Download className="h-3.5 w-3.5" /> Export</Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <article className="rounded-xl border border-ink/8 bg-paper px-6 py-7 sm:px-9">
                <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{current.title}</h1>
                {isSample ? (
                  <>
                    <p className="mt-6 text-[15px]">Compliance, made clear.</p>
                    <p className="text-[15px] text-ink/80">Your essential policies, resources and regulatory guidance in one place.</p>
                    {DOC.map(([h, p]) => (
                      <div key={h} className="mt-6">
                        <p className="text-[15px] font-medium">{h}</p>
                        <p className="text-[15px] text-ink/80">{p}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="mt-6 text-sm text-muted">Preview of “{current.title}” ({current.type}) generated at {current.time}. Select “Compliance overview” in the output history to see a full sample document.</p>
                )}
              </article>
            </div>

            <div className="shrink-0 border-t border-ink/8 p-3">
              <div className="rounded-xl border border-ink/10 bg-paper p-3 transition-colors focus-within:border-accent">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  placeholder="Ask SIRIUS to create or refine your output…"
                  className="w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button aria-label="Attach" className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-ink/[0.05] hover:text-ink"><Paperclip className="h-4 w-4" /></button>
                  <button className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/10 px-3 text-[12px] text-muted hover:text-ink"><FileText className="h-3.5 w-3.5" /> Files</button>
                  <button className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/10 px-3 text-[12px] text-muted hover:text-ink"><Terminal className="h-3.5 w-3.5" /> Commands</button>
                  <span className="hidden text-[12px] text-muted sm:inline">File tools ready</span>
                  <button aria-label="Send" className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-accent text-white transition-opacity disabled:opacity-40" disabled={!prompt.trim()}><Send className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </section>

          {/* Right: output history */}
          <aside className="hidden min-h-0 flex-col border-l border-ink/8 bg-paper/50 xl:flex">
            <div className="space-y-3 p-4">
              <h2 className="font-display text-lg font-semibold tracking-tight">Output history</h2>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-ink/10 bg-card px-3 text-[13px] text-muted"><Search className="h-3.5 w-3.5" /> Search outputs</div>
              <p className="flex items-center gap-1.5 text-[12px] text-muted"><Folder className="h-3.5 w-3.5" /> Default save: Company library</p>
            </div>
            <p className="px-4 pb-2 text-[12px] text-muted">Recent outputs · {OUTPUTS.length}</p>
            <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
              {OUTPUTS.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => setActive(o.id)}
                    className={cn('w-full rounded-xl border p-3 text-left transition-colors', active === o.id ? 'border-accent/50 bg-accent/[0.07]' : 'border-transparent hover:bg-ink/[0.04]')}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-medium">{o.title}</span>
                      <span className={cn('shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium', TYPE_TONE[o.type])}>{o.type}</span>
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-muted">{o.time}{o.tag ? ` · ${o.tag}` : ''}</span>
                    <span className="mt-1 flex items-center gap-1 text-[11px] text-muted"><Folder className="h-3 w-3" /> {o.where}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 border-t border-ink/8 p-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">T</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">Tisha Kharade</span><span className="block text-[11.5px] text-muted">Workspace settings</span></span>
              <Settings className="h-4 w-4 text-muted" />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
