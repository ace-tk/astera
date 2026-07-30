import { z } from 'zod'
import { Report } from '../models/Report.js'
import { REPORT_TYPES, DELIVERY_MODES } from '../constants.js'

const slugify = (s) =>
  `${s || 'report'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'report'

// The ReportComposer form's payload shape — shared by "create report from a
// Report Request" and "admin uploads a report directly to a customer".
export const reportComposerSchema = z.object({
  title: z.string().min(1).max(160),
  reportType: z.enum(REPORT_TYPES),
  meetingType: z.string().max(160).optional(),
  clientOrg: z.string().max(160).optional(),
  meetingOwner: z.string().max(160).optional(),
  duration: z.string().optional(),
  language: z.string().max(60).optional(),
  headline: z.string().max(4000).optional(), // Summary
  decisions: z.array(z.object({ text: z.string(), owner: z.string().optional(), at: z.string().optional() })).optional(),
  commitments: z
    .array(z.object({ text: z.string(), owner: z.string().optional(), due: z.string().optional(), at: z.string().optional() }))
    .optional(),
  complianceNotes: z.string().max(4000).optional(),
  riskNotes: z.string().max(4000).optional(),
  tags: z.array(z.string()).optional(),
  reportContent: z.string().max(20000).optional(),
  deliveryMode: z.enum(DELIVERY_MODES).optional(),
})

/**
 * Build (and persist) a Report from a ReportComposer payload for a given
 * owner. Always starts as a draft — publishing is a separate, existing step
 * (`adminController.updateReport` with `publishStatus: 'published'`).
 */
export async function createReportForOwner(ownerId, payload, { date, request, source } = {}) {
  const p = payload
  const slug = `${slugify(p.title)}-${Date.now().toString(36).slice(-5)}`
  return Report.create({
    owner: ownerId,
    slug,
    title: p.title,
    subtitle: p.reportType, // shown as the report's category badge on the customer's card
    category: p.reportType,
    date: date || new Date().toISOString().slice(0, 10),
    duration: p.duration,
    headline: p.headline,
    decisions: p.decisions || [],
    commitments: p.commitments || [],
    metrics: { decisions: p.decisions?.length || 0, commitments: p.commitments?.length || 0, risks: 0, owners: 0, talkBalance: 0 },
    reportType: p.reportType,
    meetingType: p.meetingType,
    clientOrg: p.clientOrg,
    meetingOwner: p.meetingOwner,
    language: p.language,
    complianceNotes: p.complianceNotes,
    riskNotes: p.riskNotes,
    tags: p.tags || [],
    reportContent: p.reportContent,
    deliveryMode: p.deliveryMode,
    // Manually authored — never went through the AI-review pipeline.
    reviewStatus: 'approved',
    status: 'ready',
    publishStatus: 'draft',
    request: request || null,
    source,
  })
}
