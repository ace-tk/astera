import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Bookmark, List, StickyNote } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Reading sidebar: search, a Sections/Bookmarks switch, and jump navigation. */
export default function ReaderSidebar({ sections, active, onJump, bookmarks, notes, query, setQuery }) {
  const [tab, setTab] = useState('sections')
  const list =
    tab === 'bookmarks' ? sections.filter((s) => bookmarks.includes(s.id)) : sections

  return (
    <div className="flex h-full flex-col">
      {/* search */}
      <div className="p-4">
        <div className="flex h-10 items-center gap-2 rounded-full border border-ink/8 bg-paper px-3.5 text-sm">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this report…"
            className="w-full bg-transparent outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* tabs */}
      <div className="mx-4 mb-2 flex rounded-full border border-ink/8 bg-paper p-1">
        {[
          { id: 'sections', label: 'Sections', icon: List },
          { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn('relative flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium', tab === t.id ? 'text-paper' : 'text-muted')}
          >
            {tab === t.id && <motion.span layoutId="reader-tab" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* list */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {list.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted">No bookmarks yet. Tap the ribbon on any section.</p>
        )}
        {list.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors', active === s.id ? 'bg-ink/[0.05] font-medium text-ink' : 'text-muted hover:bg-ink/[0.03] hover:text-ink')}
          >
            <span className="w-4 shrink-0 font-mono text-[0.7rem] text-muted">{String(i + 1).padStart(2, '0')}</span>
            <span className="flex-1">{s.title}</span>
            {bookmarks.includes(s.id) && <Bookmark className="h-3.5 w-3.5 fill-golden text-golden" />}
            {notes[s.id] && <StickyNote className="h-3.5 w-3.5 text-purple" />}
          </button>
        ))}
      </nav>
    </div>
  )
}
