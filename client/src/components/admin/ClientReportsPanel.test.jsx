// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllProviders } from '@/test/providers'
import ClientReportsPanel from './ClientReportsPanel'
import ClientReports from '@/pages/dashboard/ClientReports'
import PdfViewer from '@/components/common/PdfViewer'
import * as svc from '@/services/clientReports'

vi.mock('@/services/clientReports', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchAdminClientReports: vi.fn(),
  uploadAdminClientReport: vi.fn(),
  deleteAdminClientReport: vi.fn(),
  fetchAdminClientReportFile: vi.fn(),
  fetchMyClientReports: vi.fn(),
  fetchMyClientReportFile: vi.fn(),
}))

const REPORT = { id: 'r1', title: 'Rapport de mars', sizeBytes: 2048, createdAt: '2026-03-12T10:00:00.000Z' }
const pdfFile = (name = 'rapport.pdf', type = 'application/pdf', size = 100) => new File([new Uint8Array(size)], name, { type })

beforeEach(() => {
  vi.clearAllMocks()
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
})

describe('checkReportFile (client-side pre-check; the server is the real gate)', () => {
  it('accepts a PDF and refuses other types and oversized files', () => {
    expect(svc.checkReportFile(pdfFile())).toBe('')
    expect(svc.checkReportFile(pdfFile('notes.txt', 'text/plain'))).toMatch(/Only PDF/)
    expect(svc.checkReportFile(pdfFile('fake.pdf', 'image/png'))).toMatch(/Only PDF/)
    expect(svc.checkReportFile(pdfFile('big.pdf', 'application/pdf', svc.MAX_REPORT_MB * 1024 * 1024 + 1))).toMatch(/too large/)
    expect(svc.checkReportFile(null)).toMatch(/Choose/)
  })
})

describe('PdfViewer', () => {
  it('shows the report in the page from the authenticated download, and releases it afterwards', async () => {
    const load = vi.fn(() => Promise.resolve(new Blob(['%PDF-1.4'], { type: 'application/pdf' })))
    const { unmount } = render(<PdfViewer load={load} title="Mon rapport" />)
    const frame = await screen.findByTitle('Mon rapport')
    expect(frame.getAttribute('src')).toBe('blob:mock-url')
    expect(screen.getByRole('link', { name: /Open it in a new tab/ }).getAttribute('href')).toBe('blob:mock-url')
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('says "not available" for a report the server refused (404) and shows no viewer', async () => {
    render(<PdfViewer load={() => Promise.reject(Object.assign(new Error('x'), { status: 404 }))} />)
    expect((await screen.findByRole('alert')).textContent).toBe('This report is not available.')
    expect(document.querySelector('iframe')).toBeNull()
  })
})

describe('Client Reports page (client)', () => {
  it('lists the reports the server returned, each with its title, upload date and a View link', async () => {
    svc.fetchMyClientReports.mockResolvedValue([REPORT])
    render(<AllProviders><ClientReports /></AllProviders>)
    expect(await screen.findByText('Rapport de mars')).toBeTruthy()
    expect(screen.getByText(/Uploaded .*2026 · 2 KB/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'View' }).getAttribute('href')).toBe('/app/client-reports/r1')
  })

  it('shows one short line, not a big empty state, when nothing has been shared', async () => {
    svc.fetchMyClientReports.mockResolvedValue([])
    render(<AllProviders><ClientReports /></AllProviders>)
    expect(await screen.findByText('No reports have been shared with you yet.')).toBeTruthy()
  })
})

describe('Client Reports panel (admin)', () => {
  it('lists the client’s reports with View and Remove', async () => {
    svc.fetchAdminClientReports.mockResolvedValue([REPORT])
    render(<AllProviders><ClientReportsPanel customerId="c1" /></AllProviders>)
    expect(await screen.findByText('Rapport de mars')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'View' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Remove Rapport de mars' })).toBeTruthy()
  })

  it('refuses a non-PDF in the form without calling the server; uploads a PDF with its name', async () => {
    svc.fetchAdminClientReports.mockResolvedValue([])
    svc.uploadAdminClientReport.mockResolvedValue(REPORT)
    render(<AllProviders><ClientReportsPanel customerId="c1" /></AllProviders>)
    await userEvent.click(await screen.findByRole('button', { name: 'Upload PDF' }))

    await userEvent.upload(screen.getByLabelText('PDF file'), pdfFile('notes.txt', 'text/plain'), { applyAccept: false })
    expect((await screen.findByRole('alert')).textContent).toMatch(/Only PDF/)
    expect(svc.uploadAdminClientReport).not.toHaveBeenCalled()

    const good = pdfFile()
    await userEvent.upload(screen.getByLabelText('PDF file'), good)
    await userEvent.type(screen.getByLabelText('Report name'), 'Rapport de mars')
    await userEvent.click(screen.getByRole('button', { name: 'Save report' }))
    await waitFor(() => expect(svc.uploadAdminClientReport).toHaveBeenCalledWith('c1', { file: good, title: 'Rapport de mars' }))
  })

  it('shows the server’s reason when an upload fails, and keeps the form open', async () => {
    svc.fetchAdminClientReports.mockResolvedValue([])
    svc.uploadAdminClientReport.mockRejectedValue(Object.assign(new Error('x'), { data: { error: 'The report could not be saved. Please try again.' } }))
    render(<AllProviders><ClientReportsPanel customerId="c1" /></AllProviders>)
    await userEvent.click(await screen.findByRole('button', { name: 'Upload PDF' }))
    await userEvent.upload(screen.getByLabelText('PDF file'), pdfFile())
    await userEvent.click(screen.getByRole('button', { name: 'Save report' }))
    expect((await screen.findByRole('alert')).textContent).toBe('The report could not be saved. Please try again.')
    expect(screen.getByLabelText('PDF file')).toBeTruthy()
  })

  it('asks before removing, and removes only after confirmation', async () => {
    svc.fetchAdminClientReports.mockResolvedValue([REPORT])
    svc.deleteAdminClientReport.mockResolvedValue({ ok: true })
    render(<AllProviders><ClientReportsPanel customerId="c1" /></AllProviders>)
    await userEvent.click(await screen.findByRole('button', { name: 'Remove Rapport de mars' }))
    expect(svc.deleteAdminClientReport).not.toHaveBeenCalled()
    await userEvent.click(await screen.findByRole('button', { name: 'Remove report' }))
    await waitFor(() => expect(svc.deleteAdminClientReport).toHaveBeenCalledWith('r1'))
  })
})
