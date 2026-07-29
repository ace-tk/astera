import { useEffect, useState } from 'react'
import { Search, Grid3x3, List, UploadCloud, Download, Ban, Trash2, FolderOpen } from 'lucide-react'
import { REPORT_TYPES } from '@/constants/reportRequests'
import { fileCategoryIcon } from '@/utils/fileCategory'
import StatusChip from '@/components/admin/StatusChip'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')
const fmtSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const FILE_TYPES = [
  { value: '', label: 'All types' },
  { value: 'recording', label: 'Meeting Recordings' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'image', label: 'Images' },
  { value: 'report', label: 'Reports / Transcripts' },
]

const SORTS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
]

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
]

/**
 * Middle column — search/filter/sort, grid/list toggle, multi-select + bulk
 * actions, and the file cards themselves. Search/filter/table/bulk mechanics
 * mirror AdminCustomers.jsx exactly (debounced search, Set-based selection,
 * a bulk action bar gated on selection size).
 */
export default function FileBrowser({
  filters, setFilter, files, total, page, pageSize, setPage, isLoading,
  selected, toggleOne, toggleAllOnPage, clearSelection,
  selectedFileId, onSelectFile, customerOptions, onBulkArchive, onBulkDelete, onUpload, onDownload,
  placeholderView,
}) {
  const [qInput, setQInput] = useState(filters.q || '')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    const t = setTimeout(() => setFilter('q', qInput), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  useEffect(() => setQInput(filters.q || ''), [filters.q])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const allOnPageSelected = files.length > 0 && files.every((f) => selected.has(f.id))

  if (placeholderView) {
    return (
      <div className="grid min-h-[24rem] place-items-center rounded-3xl border border-ink/8 bg-card shadow-soft">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink/[0.05] text-muted">
            <FolderOpen className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-medium tracking-tight">{placeholderView} is coming soon</h3>
          <p className="mt-1 text-sm text-muted">This area is reserved for a future release.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search files, customers, reports…"
            aria-label="Search files"
            className="h-11 w-full rounded-full border border-ink/8 bg-card pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
        </label>

        <select
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
          aria-label="Filter by file type"
          className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          {FILE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select
          value={filters.reportType}
          onChange={(e) => setFilter('reportType', e.target.value)}
          aria-label="Filter by report type"
          className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          <option value="">All report types</option>
          {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          aria-label="Filter by status"
          className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <div className="w-48">
          <SearchableSelect
            value={customerOptions.find((c) => c.id === filters.customer)?.name || ''}
            onChange={(name) => setFilter('customer', customerOptions.find((c) => c.name === name)?.id || '')}
            options={customerOptions.map((c) => c.name)}
            placeholder="All customers"
            className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
        </div>

        <label className="flex items-center gap-1.5 text-xs text-muted">
          From
          <input
            type="date"
            value={filters.from || ''}
            onChange={(e) => setFilter('from', e.target.value)}
            aria-label="Uploaded from"
            className="h-11 rounded-full border border-ink/8 bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          To
          <input
            type="date"
            value={filters.to || ''}
            onChange={(e) => setFilter('to', e.target.value)}
            aria-label="Uploaded to"
            className="h-11 rounded-full border border-ink/8 bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
        </label>

        <select
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value)}
          aria-label="Sort files"
          className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <div className="flex items-center rounded-full border border-ink/8 bg-card p-1">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={cn('grid h-9 w-9 place-items-center rounded-full transition-colors', viewMode === 'grid' ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:text-ink')}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={cn('grid h-9 w-9 place-items-center rounded-full transition-colors', viewMode === 'list' ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:text-ink')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <Button variant="accent" size="sm" magnetic={false} onClick={onUpload}>
          <UploadCloud className="h-4 w-4" /> Upload
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button variant="soft" size="sm" magnetic={false} onClick={() => onBulkArchive(true)}>
              <Ban className="h-3.5 w-3.5" /> Archive
            </Button>
            <Button variant="soft" size="sm" magnetic={false} onClick={onBulkDelete}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button variant="ghost" size="sm" magnetic={false} onClick={clearSelection}>Clear</Button>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 px-1">
        <input
          type="checkbox"
          aria-label="Select all files on this page"
          checked={allOnPageSelected}
          onChange={toggleAllOnPage}
          className="h-4 w-4 rounded border-ink/20 accent-accent"
        />
        <span className="text-xs text-muted">Select all on this page</span>
      </div>

      {isLoading && <div className="mt-3 rounded-3xl border border-ink/8 bg-card p-8 text-center text-sm text-muted shadow-soft">Loading files…</div>}

      {!isLoading && files.length === 0 && (
        <div className="mt-3 rounded-3xl border border-ink/8 bg-card p-8 text-center text-sm text-muted shadow-soft">No files match.</div>
      )}

      {!isLoading && files.length > 0 && viewMode === 'grid' && (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((f) => (
            <FileCard
              key={f.id}
              file={f}
              checked={selected.has(f.id)}
              onToggle={() => toggleOne(f.id)}
              active={selectedFileId === f.id}
              onOpen={() => onSelectFile(f)}
              onDownload={() => onDownload(f)}
            />
          ))}
        </div>
      )}

      {!isLoading && files.length > 0 && viewMode === 'list' && (
        <div className="mt-3 overflow-x-auto rounded-3xl border border-ink/8 bg-card shadow-soft">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="w-10 px-4 py-3.5" />
                <th className="px-4 py-3.5 font-medium">Name</th>
                <th className="px-4 py-3.5 font-medium">Customer</th>
                <th className="px-4 py-3.5 font-medium">Type</th>
                <th className="px-4 py-3.5 font-medium">Uploaded</th>
                <th className="px-4 py-3.5 font-medium">Size</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => {
                const cat = fileCategoryIcon(f.category)
                return (
                  <tr
                    key={f.id}
                    onClick={() => onSelectFile(f)}
                    className={cn('cursor-pointer border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]', selectedFileId === f.id && 'bg-accent/[0.04]')}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggleOne(f.id)} className="h-4 w-4 rounded border-ink/20 accent-accent" />
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      <span className="inline-flex items-center gap-2"><cat.icon className="h-4 w-4 text-muted" /> {f.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{f.customer?.name || '—'}</td>
                    <td className="px-4 py-3.5 text-muted">{cat.label}</td>
                    <td className="px-4 py-3.5 text-muted">{fmtDate(f.createdAt)}</td>
                    <td className="px-4 py-3.5 text-muted">{fmtSize(f.sizeBytes)}</td>
                    <td className="px-4 py-3.5"><StatusChip status={f.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>Page {page} of {totalPages} · {total} file{total === 1 ? '' : 's'}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-40">‹</button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-40">›</button>
          </div>
        </div>
      )}
    </div>
  )
}

function FileCard({ file, checked, onToggle, active, onOpen, onDownload }) {
  const cat = fileCategoryIcon(file.category)
  return (
    <div
      onClick={onOpen}
      className={cn(
        'group cursor-pointer rounded-3xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift',
        active ? 'border-accent/40 ring-1 ring-accent/20' : 'border-ink/8',
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('grid h-11 w-11 place-items-center rounded-2xl bg-ink/[0.05] text-muted')}>
          <cat.icon className="h-5 w-5" />
        </span>
        <div className="flex items-center gap-2">
          {file.downloadable && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload() }}
              aria-label="Download"
              className="grid h-8 w-8 place-items-center rounded-full text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <input type="checkbox" checked={checked} onChange={(e) => { e.stopPropagation(); onToggle() }} onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded border-ink/20 accent-accent" />
        </div>
      </div>
      <h3 className="mt-3 truncate font-display text-base font-medium tracking-tight">{file.name}</h3>
      <p className="mt-1 truncate text-xs text-muted">{file.customer?.name || 'No customer'}</p>
      <div className="mt-4 flex items-center justify-between">
        <StatusChip status={file.status} />
        <span className="text-xs text-muted">{fmtSize(file.sizeBytes)}</span>
      </div>
      <p className="mt-2 text-xs text-muted">{fmtDate(file.createdAt)}</p>
    </div>
  )
}
