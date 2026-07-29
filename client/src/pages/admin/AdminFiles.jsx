import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderOpen, Archive as ArchiveIcon, Trash2, UploadCloud } from 'lucide-react'
import {
  fetchAdminFiles, fetchAdminFileStats, renameAdminFile, archiveAdminFile,
  bulkArchiveAdminFiles, deleteAdminFile, bulkDeleteAdminFiles, uploadAdminFile,
} from '@/services/files'
import { fetchAdminCustomers, downloadRequestAttachment } from '@/services/admin'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import FileSidebar, { SIDEBAR_ITEMS } from '@/components/admin/files/FileSidebar'
import FileBrowser from '@/components/admin/files/FileBrowser'
import FilePreviewPanel from '@/components/admin/files/FilePreviewPanel'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'

const EMPTY_FILTERS = { q: '', category: '', customer: '', status: '', reportType: '', from: '', to: '', sort: 'latest' }
const sevenDaysAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export default function AdminFiles() {
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const qc = useQueryClient()
  const { toast } = useToast()

  const [sidebarKey, setSidebarKey] = useState('all')
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, customer: searchParams.get('customer') || '' }))
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [selected, setSelected] = useState(() => new Set())
  const [selectedFile, setSelectedFile] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'archive'|'delete'|'bulk-archive'|'bulk-delete', file? }
  const [uploadOpen, setUploadOpen] = useState(false)

  const setFilter = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1) }

  const sidebarItem = SIDEBAR_ITEMS.find((i) => i.key === sidebarKey) || SIDEBAR_ITEMS[0]
  const placeholderView = sidebarItem.placeholder ? sidebarItem.label : null

  const queryParams = useMemo(() => {
    const p = { ...filters, page, pageSize }
    if (sidebarItem.category) p.category = sidebarItem.category
    else if (!filters.category) p.category = ''
    if (sidebarItem.status) p.status = sidebarItem.status
    if (sidebarItem.recent) p.from = sevenDaysAgo()
    return p
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, pageSize, sidebarKey])

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'files', queryParams],
    queryFn: () => fetchAdminFiles(queryParams),
    enabled: !placeholderView,
  })

  const { data: stats } = useQuery({ queryKey: ['admin', 'files', 'stats'], queryFn: fetchAdminFileStats })
  const { data: customersData } = useQuery({ queryKey: ['admin', 'customers', 'picker'], queryFn: () => fetchAdminCustomers({ pageSize: 200 }) })
  const customerOptions = useMemo(() => (customersData?.customers || []).map((c) => ({ id: c.id, name: c.companyName || c.name })), [customersData])

  const files = data?.files || []
  const total = data?.total || 0

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'files'] })
  }

  const toggleOne = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAllOnPage = () => setSelected((s) => {
    const allSelected = files.length > 0 && files.every((f) => s.has(f.id))
    const n = new Set(s)
    files.forEach((f) => (allSelected ? n.delete(f.id) : n.add(f.id)))
    return n
  })
  const clearSelection = () => setSelected(new Set())

  const renameMutation = useMutation({
    mutationFn: ({ id, name }) => renameAdminFile(id, name),
    onSuccess: (file) => { refresh(); setSelectedFile((f) => (f && f.id === file.id ? file : f)); toast({ title: 'File renamed', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t rename file', variant: 'warn', color: 'rose' }),
  })

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }) => archiveAdminFile(id, archived),
    onSuccess: (file) => { refresh(); setSelectedFile((f) => (f && f.id === file.id ? file : f)); toast({ title: file.archived ? 'File archived' : 'File unarchived', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t update file', variant: 'warn', color: 'rose' }),
  })

  const bulkArchiveMutation = useMutation({
    mutationFn: (archived) => bulkArchiveAdminFiles(Array.from(selected), archived),
    onSuccess: () => { refresh(); clearSelection(); toast({ title: 'Selected files archived', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t archive selected files', variant: 'warn', color: 'rose' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdminFile(id),
    onSuccess: (_r, id) => { refresh(); setSelectedFile((f) => (f && f.id === id ? null : f)); toast({ title: 'File deleted', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t delete file', variant: 'warn', color: 'rose' }),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: () => bulkDeleteAdminFiles(Array.from(selected)),
    onSuccess: () => { refresh(); clearSelection(); setSelectedFile(null); toast({ title: 'Selected files deleted', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t delete selected files', variant: 'warn', color: 'rose' }),
  })

  const handleDownload = async (file) => {
    if (!file.downloadable) return
    try {
      await downloadRequestAttachment(file.requestId, file.name, token)
    } catch {
      toast({ title: 'Couldn’t download file', variant: 'warn', color: 'rose' })
    }
  }

  const runConfirmed = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'archive') archiveMutation.mutate({ id: confirmAction.file.id, archived: !confirmAction.file.archived })
    else if (confirmAction.type === 'delete') deleteMutation.mutate(confirmAction.file.id)
    else if (confirmAction.type === 'bulk-archive') bulkArchiveMutation.mutate(true)
    else if (confirmAction.type === 'bulk-delete') bulkDeleteMutation.mutate()
    setConfirmAction(null)
  }

  const CONFIRM_META = {
    archive: { title: confirmAction?.file?.archived ? 'Unarchive this file?' : 'Archive this file?', confirmLabel: confirmAction?.file?.archived ? 'Unarchive' : 'Archive', icon: ArchiveIcon, color: 'orange' },
    delete: { title: 'Delete this file?', description: 'This can’t be undone.', confirmLabel: 'Delete', icon: Trash2, color: 'rose', danger: true },
    'bulk-archive': { title: `Archive ${selected.size} file${selected.size === 1 ? '' : 's'}?`, confirmLabel: 'Archive', icon: ArchiveIcon, color: 'orange' },
    'bulk-delete': { title: `Delete ${selected.size} file${selected.size === 1 ? '' : 's'}?`, description: 'This can’t be undone.', confirmLabel: 'Delete', icon: Trash2, color: 'rose', danger: true },
  }
  const cm = confirmAction ? CONFIRM_META[confirmAction.type] : null
  const confirmBusy = archiveMutation.isPending || deleteMutation.isPending || bulkArchiveMutation.isPending || bulkDeleteMutation.isPending

  return (
    <>
      <Reveal>
        <p className="eyebrow text-accent"><FolderOpen className="h-3.5 w-3.5" /> Admin · All Files</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Every uploaded file, in one place.
        </h1>
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['totalFiles', 'Total Files'], ['usedGB', 'Storage Used'], ['totalReports', 'Reports'],
          ['pendingProcessing', 'Pending Processing'], ['archivedFiles', 'Archived Files'], ['sharing', 'Sharing'],
        ].map(([key, label]) => (
          <div key={key} className="rounded-3xl border border-ink/8 bg-card p-5 shadow-soft">
            <div className="font-display text-2xl font-semibold tracking-tight">
              {key === 'usedGB' && stats ? `${(stats.usedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB` : key === 'sharing' ? '—' : (stats?.[key] ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_22rem]">
        <div className="lg:col-span-1">
          <FileSidebar active={sidebarKey} onSelect={(item) => { setSidebarKey(item.key); setPage(1) }} stats={stats} />
        </div>

        <div className="min-w-0">
          <FileBrowser
            filters={filters}
            setFilter={setFilter}
            files={files}
            total={total}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            isLoading={isLoading}
            selected={selected}
            toggleOne={toggleOne}
            toggleAllOnPage={toggleAllOnPage}
            clearSelection={clearSelection}
            selectedFileId={selectedFile?.id}
            onSelectFile={setSelectedFile}
            customerOptions={customerOptions}
            onBulkArchive={() => setConfirmAction({ type: 'bulk-archive' })}
            onBulkDelete={() => setConfirmAction({ type: 'bulk-delete' })}
            onUpload={() => setUploadOpen(true)}
            onDownload={handleDownload}
            placeholderView={placeholderView}
          />
        </div>

        {selectedFile && (
          <div className="xl:col-span-1">
            <div className="rounded-3xl border border-ink/8 bg-card shadow-soft xl:sticky xl:top-6 xl:h-[calc(100vh-14rem)]">
              <FilePreviewPanel
                file={selectedFile}
                onClose={() => setSelectedFile(null)}
                onRename={(file, name) => renameMutation.mutate({ id: file.id, name })}
                onArchive={(file) => setConfirmAction({ type: 'archive', file })}
                onDelete={(file) => setConfirmAction({ type: 'delete', file })}
                onDownload={handleDownload}
                toast={toast}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runConfirmed}
        busy={confirmBusy}
        icon={cm?.icon}
        color={cm?.color}
        title={cm?.title}
        description={cm?.description}
        confirmLabel={cm?.confirmLabel}
        danger={cm?.danger}
      />

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        customerOptions={customerOptions}
        onUploaded={() => { refresh(); setUploadOpen(false) }}
        toast={toast}
      />
    </>
  )
}

function UploadDialog({ open, onClose, customerOptions, onUploaded, toast }) {
  const [customerId, setCustomerId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) { setCustomerId(''); setTitle(''); setFile(null) }
  }, [open])

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    if (!customerId || !file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('customerId', customerId)
      if (title.trim()) form.append('title', title.trim())
      form.append('media', file)
      await uploadAdminFile(form)
      toast({ title: 'File uploaded — report generation started', variant: 'success', color: 'emerald' })
      onUploaded()
    } catch (err) {
      toast({ title: 'Couldn’t upload file', description: err?.data?.error || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" onMouseDown={() => !uploading && onClose()}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[1.75rem] border border-ink/10 bg-card p-7 shadow-float"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <UploadCloud className="h-5 w-5" />
        </span>
        <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">Upload a file</h2>
        <p className="mt-1 text-sm text-muted">Runs the same AI pipeline as Upload Studio — owned by the customer you choose.</p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted">Customer</span>
            <SearchableSelect
              value={customerOptions.find((c) => c.id === customerId)?.name || ''}
              onChange={(name) => setCustomerId(customerOptions.find((c) => c.name === name)?.id || '')}
              options={customerOptions.map((c) => c.name)}
              placeholder="Select customer"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted">Title (optional)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Q4 Board Sync" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted">File</span>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input" accept="audio/*,video/*,.pdf,.docx,image/*,.txt" />
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" magnetic={false} onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button type="submit" variant="accent" size="sm" magnetic={false} disabled={!customerId || !file || uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </form>
    </div>
  )
}
