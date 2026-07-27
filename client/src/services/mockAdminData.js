/**
 * Frontend-only placeholder data for the Admin Portal UI build-out.
 * No backend integration yet — every admin page that isn't already wired to
 * a real endpoint (AdminReports/AdminUsers/AdminDashboard's original stats
 * query) reads from here instead, so numbers stay consistent across the
 * Dashboard, Workspace, Customers, and Analytics pages.
 */

export const ADMIN_STATS = {
  totalCustomers: 128,
  totalReports: 1042,
  draftReports: 37,
  publishedReports: 918,
  activeUsers: 64,
}

export const MOCK_CUSTOMERS = [
  { id: 'cus_01', company: 'Northwind Trading', contact: 'Maya Okafor', email: 'maya@northwind.co', plan: 'Studio', status: 'active', reportsCount: 42, joinedAt: '2025-02-11' },
  { id: 'cus_02', company: 'Ledgerly', contact: 'Daniel Reyes', email: 'daniel@ledgerly.io', plan: 'Studio', status: 'active', reportsCount: 31, joinedAt: '2025-03-04' },
  { id: 'cus_03', company: 'Aperture Labs', contact: 'Priya Nair', email: 'priya@aperture.dev', plan: 'Scale', status: 'active', reportsCount: 88, joinedAt: '2024-11-22' },
  { id: 'cus_04', company: 'Fernweh Studio', contact: 'Owen Clarke', email: 'owen@fernweh.studio', plan: 'Solo', status: 'active', reportsCount: 6, joinedAt: '2026-01-09' },
  { id: 'cus_05', company: 'Basalt & Co.', contact: 'Ines Duarte', email: 'ines@basaltco.com', plan: 'Studio', status: 'disabled', reportsCount: 19, joinedAt: '2025-06-30' },
  { id: 'cus_06', company: 'Harbor Systems', contact: 'Tomás Ferreira', email: 'tomas@harborsys.com', plan: 'Scale', status: 'active', reportsCount: 104, joinedAt: '2024-09-14' },
  { id: 'cus_07', company: 'Quietly', contact: 'Sana Malik', email: 'sana@quietly.app', plan: 'Solo', status: 'active', reportsCount: 3, joinedAt: '2026-03-18' },
  { id: 'cus_08', company: 'Redwood Civic', contact: 'Jules Bennett', email: 'jules@redwoodcivic.org', plan: 'Studio', status: 'disabled', reportsCount: 27, joinedAt: '2025-01-27' },
]

export const MOCK_ADMIN_USERS = [
  { id: 'usr_01', name: 'Priya Sharma', email: 'priya.sharma@astera.app', role: 'Admin', status: 'active', lastActive: '2026-07-27' },
  { id: 'usr_02', name: 'Marcus Webb', email: 'marcus.webb@astera.app', role: 'Admin', status: 'active', lastActive: '2026-07-26' },
  { id: 'usr_03', name: 'Lena Ostrovsky', email: 'lena.o@astera.app', role: 'Editor', status: 'active', lastActive: '2026-07-27' },
  { id: 'usr_04', name: 'Théo Vasseur', email: 'theo.vasseur@astera.app', role: 'Support', status: 'active', lastActive: '2026-07-24' },
  { id: 'usr_05', name: 'Amara Chukwu', email: 'amara.c@astera.app', role: 'Editor', status: 'disabled', lastActive: '2026-06-02' },
  { id: 'usr_06', name: 'Ravi Menon', email: 'ravi.menon@astera.app', role: 'Support', status: 'active', lastActive: '2026-07-25' },
]

export const RECENT_REPORTS = [
  { id: 'rep_01', title: 'Q3 Roadmap Alignment', owner: 'Northwind Trading', status: 'published', updatedAt: '2026-07-26' },
  { id: 'rep_02', title: 'Board Meeting — July Review', owner: 'Aperture Labs', status: 'draft', updatedAt: '2026-07-25' },
  { id: 'rep_03', title: 'Hiring Committee Sync', owner: 'Ledgerly', status: 'published', updatedAt: '2026-07-24' },
  { id: 'rep_04', title: 'Vendor Renewal Discussion', owner: 'Harbor Systems', status: 'archived', updatedAt: '2026-07-21' },
  { id: 'rep_05', title: 'Sales Pipeline Review', owner: 'Basalt & Co.', status: 'draft', updatedAt: '2026-07-19' },
]

export const CUSTOMER_ACTIVITY = [
  { id: 'act_01', company: 'Northwind Trading', action: 'Published a new report', time: '2h ago', color: 'emerald' },
  { id: 'act_02', company: 'Quietly', action: 'Upgraded to Solo plan', time: '5h ago', color: 'royal' },
  { id: 'act_03', company: 'Aperture Labs', action: 'Invited 2 new teammates', time: '1d ago', color: 'purple' },
  { id: 'act_04', company: 'Basalt & Co.', action: 'Account flagged for review', time: '1d ago', color: 'rose' },
  { id: 'act_05', company: 'Harbor Systems', action: 'Exported quarterly analytics', time: '2d ago', color: 'sky' },
]

export const LATEST_UPDATES = [
  { id: 'upd_01', title: 'Recharts-based analytics view shipped', description: 'Admins can now see report and customer trends at a glance.', time: 'Today' },
  { id: 'upd_02', title: 'Draft/Published states added to Reports', description: 'Reports now carry a lifecycle status across the portal.', time: 'Yesterday' },
  { id: 'upd_03', title: 'Customer plan tiers synced', description: 'Solo / Studio / Scale now shown consistently across Customers and Analytics.', time: '3 days ago' },
]

// 6-month trend, used by the Analytics area/bar charts.
export const REPORTS_TREND = [
  { month: 'Feb', reports: 118, customers: 84 },
  { month: 'Mar', reports: 142, customers: 91 },
  { month: 'Apr', reports: 165, customers: 99 },
  { month: 'May', reports: 171, customers: 108 },
  { month: 'Jun', reports: 189, customers: 118 },
  { month: 'Jul', reports: 214, customers: 128 },
]

export const REPORTS_BY_STATUS = [
  { name: 'Published', value: ADMIN_STATS.publishedReports, color: 'emerald' },
  { name: 'Draft', value: ADMIN_STATS.draftReports, color: 'golden' },
  { name: 'Archived', value: 87, color: 'ink' },
]

export const PLAN_DISTRIBUTION = [
  { name: 'Solo', value: 52, color: 'emerald' },
  { name: 'Studio', value: 61, color: 'royal' },
  { name: 'Scale', value: 15, color: 'purple' },
]
