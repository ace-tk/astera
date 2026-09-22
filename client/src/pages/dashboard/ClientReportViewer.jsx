import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchMyClientReports, fetchMyClientReportFile } from '@/services/clientReports'
import PdfViewer from '@/components/common/PdfViewer'

/** One of the client's own reports, shown in the page. Someone else's id simply loads as "not available". */
export default function ClientReportViewer() {
  const { id } = useParams()
  const { data: reports = [] } = useQuery({ queryKey: ['client-reports', 'mine'], queryFn: fetchMyClientReports })
  const title = reports.find((r) => r.id === id)?.title
  const load = useCallback(() => fetchMyClientReportFile(id), [id])

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/app/client-reports" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All reports
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{title || 'Report'}</h1>
      <PdfViewer className="mt-5" load={load} title={title} />
    </div>
  )
}
