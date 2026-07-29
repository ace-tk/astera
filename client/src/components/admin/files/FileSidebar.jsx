import {
  Folder, FileText, FileAudio, FileType, Share2, Clock, Archive, Trash2, HardDrive,
} from 'lucide-react'
import { accent } from '@/utils/accent'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export const SIDEBAR_ITEMS = [
  { key: 'all', label: 'All Files', icon: Folder },
  { key: 'report', label: 'Reports', icon: FileText, category: 'report' },
  { key: 'recording', label: 'Meeting Recordings', icon: FileAudio, category: 'recording' },
  { key: 'transcript', label: 'Transcripts', icon: FileType, category: 'transcript' },
  { key: 'shared', label: 'Shared Files', icon: Share2, placeholder: true },
  { key: 'recent', label: 'Recently Uploaded', icon: Clock, recent: true },
  { key: 'archived', label: 'Archived', icon: Archive, status: 'archived' },
  { key: 'trash', label: 'Trash', icon: Trash2, placeholder: true },
]

const fmtGB = (bytes) => `${(bytes / (1024 * 1024 * 1024)).toFixed(0)} GB`

/** Left column — category navigation + the Storage Usage widget. Visual
 * language matches DashboardLayout's own sidebar (rounded-2xl nav pills with
 * a shared-element active background) and Overview.jsx's stat-tile progress
 * bar (thin rounded track + colored fill sized by inline width %). */
export default function FileSidebar({ active, onSelect, stats }) {
  const pct = stats?.totalBytes ? Math.min(100, Math.round((stats.usedBytes / stats.totalBytes) * 100)) : 0

  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item)}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                isActive ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:bg-ink/[0.03] hover:text-ink',
              )}
            >
              <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-accent')} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="rounded-3xl border border-ink/8 bg-card p-5 shadow-soft">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted">
          <HardDrive className="h-3.5 w-3.5" /> Storage
        </span>
        <p className="mt-3 text-sm font-medium">
          {stats ? `${fmtGB(stats.usedBytes)} of ${fmtGB(stats.totalBytes)} used` : '—'}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/8">
          <div className={cn('h-full rounded-full', accent('royal').bg)} style={{ width: `${pct}%` }} />
        </div>
        <Button variant="soft" size="sm" magnetic={false} className="mt-4 w-full" onClick={() => {}}>
          Upgrade Storage
        </Button>
      </div>
    </div>
  )
}
