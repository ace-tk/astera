import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Workflow, FileText, UploadCloud, BarChart3, Settings2, Search, PanelLeftClose, PanelLeft, Sparkles,
  LayoutDashboard, LayoutGrid, Building2, Users, ArrowLeftRight, Inbox, FolderOpen, ChevronRight,
} from 'lucide-react'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import SoundToggle from '@/components/common/SoundToggle'
import Notifications from '@/components/common/Notifications'
import UserMenu from '@/components/common/UserMenu'
import MeshBackground from '@/components/common/MeshBackground'
import Wordmark from '@/components/common/Wordmark'
import Astra from '@/components/assistant/Astra'
import Onboarding from '@/components/onboarding/Onboarding'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

// Each destination carries its own emotional tint (color psychology).
const ROUTE_MOOD = {
  '/app/reports': 'reports',
  '/app/upload': 'gold',
  '/app/analytics': 'timeline',
  '/app/settings': 'ai',
}

// The command palette (mounted app-wide) listens for this event.
const openCommandPalette = () => window.dispatchEvent(new CustomEvent('astera:command'))

// Navigation is grouped like a production tool's sidebar. Every destination
// that existed before is still here — grouping only decides where it sits.
const NAV_GROUPS = [
  {
    label: 'Studio',
    items: [
      { to: '/app', label: 'Workspace', icon: Workflow, end: true, active: 'text-purple' },
      { to: '/app/demos', label: 'Demos', icon: Sparkles, active: 'text-coral' },
      { to: '/app/upload', label: 'Upload Studio', icon: UploadCloud, active: 'text-coral' },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: '/app/reports', label: 'Reports', icon: FileText, active: 'text-royal' },
      { to: '/app/analytics', label: 'Analytics', icon: BarChart3, active: 'text-sky' },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/app/settings', label: 'Settings', icon: Settings2, active: 'text-emerald' }],
  },
]

// The Admin Portal reuses this exact sidebar/topbar shell — it just swaps in
// its own nav destinations while inside /app/admin/*.
const ADMIN_NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/app/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, active: 'text-royal' },
      { to: '/app/admin/workspace', label: 'Workspace', icon: LayoutGrid, active: 'text-purple' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/app/admin/reports', label: 'Reports', icon: FileText, active: 'text-sky' },
      { to: '/app/admin/report-requests', label: 'Report Requests', icon: Inbox, active: 'text-orange' },
      { to: '/app/admin/files', label: 'All Files', icon: FolderOpen, active: 'text-mint' },
    ],
  },
  {
    label: 'Accounts',
    items: [
      { to: '/app/admin/customers', label: 'Customers', icon: Building2, active: 'text-golden' },
      { to: '/app/admin/users', label: 'Users', icon: Users, active: 'text-coral' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/app/admin/analytics', label: 'Analytics', icon: BarChart3, active: 'text-emerald' },
      { to: '/app/admin/settings', label: 'Settings', icon: Settings2, active: 'text-rose' },
    ],
  },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { isAuthed } = useAuth()

  const isAdminArea = location.pathname.startsWith('/app/admin')
  const groups = isAdminArea ? ADMIN_NAV_GROUPS : NAV_GROUPS
  const nav = groups.flatMap((g) => g.items)

  // Which destination (and group) the current URL belongs to — drives the
  // top bar's context crumb. Longest match wins so /app/admin/reports isn't
  // claimed by /app/admin.
  const current = groups
    .flatMap((g) => g.items.map((item) => ({ ...item, group: g.label })))
    .filter((i) => (i.end ? location.pathname === i.to : location.pathname === i.to || location.pathname.startsWith(`${i.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0]

  // Immersive routes fill the viewport with no padding (canvas / reader).
  const immersive =
    location.pathname === '/app' ||
    location.pathname.startsWith('/app/replay') ||
    location.pathname.startsWith('/app/read')
  // The Upload Studio is a workspace: it lays out its own toolbar / stage /
  // control rail, so the shell hands it the full area instead of padding it.
  const studio = location.pathname === '/app/upload'

  return (
    <div className="bg-canvas relative flex h-screen overflow-hidden print:h-auto print:overflow-visible">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper">
        Skip to content
      </a>
      {!immersive && !studio && (
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-70 print:hidden">
          <MeshBackground mood={ROUTE_MOOD[location.pathname] || 'reports'} dots={false} />
        </div>
      )}

      {/* Sidebar — dark, fixed-colour so it reads the same in every theme.
          Icon rail from tablet width, full labelled sidebar from lg. */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#101217] text-white/60 transition-[width] duration-200 md:flex print:hidden',
          collapsed ? 'w-[60px]' : 'w-[60px] lg:w-[232px]',
        )}
      >
        <div className={cn('flex h-14 shrink-0 items-center border-b border-white/[0.06]', collapsed ? 'justify-center px-0' : 'justify-center px-0 lg:justify-start lg:px-4')}>
          <Link
            to="/"
            aria-label="ATOOPV"
            onDoubleClick={() => window.dispatchEvent(new CustomEvent('astera:plane'))}
          >
            <img src="/logo/icon-white.png" alt="ATOOPV" className={cn('h-7 w-7 object-contain', !collapsed && 'lg:hidden')} />
            {!collapsed && <img src="/logo/horizontal-white.png" alt="ATOOPV" className="hidden h-6 w-auto object-contain lg:block" />}
          </Link>
        </div>

        {isAdminArea && (
          <Link
            to="/app"
            title="Back to Workspace"
            className={cn(
              'mx-2 mt-3 flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white',
              collapsed ? 'justify-center' : 'justify-center lg:justify-between',
            )}
          >
            <span className={cn('font-mono uppercase tracking-[0.16em] text-white/40', collapsed ? 'hidden' : 'hidden lg:inline')}>Admin</span>
            <span className="inline-flex items-center gap-1">
              <ArrowLeftRight className="h-3 w-3" />
              <span className={collapsed ? 'hidden' : 'hidden lg:inline'}>Workspace</span>
            </span>
          </Link>
        )}

        <nav className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3" aria-label="Studio navigation">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5">
              <p className={cn('px-2.5 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30', collapsed ? 'hidden' : 'hidden lg:block')}>
                {group.label}
              </p>
              <div className={cn('mx-2 mb-1 h-px bg-white/[0.06]', collapsed ? 'block' : 'block lg:hidden')} />
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
                      collapsed ? 'justify-center' : 'justify-center lg:justify-start',
                      isActive ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:bg-white/[0.05] hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-accent" aria-hidden="true" />}
                      <item.icon className={cn('h-[17px] w-[17px] shrink-0', isActive ? item.active : 'text-white/45 group-hover:text-white/80')} />
                      <span className={cn('whitespace-nowrap', collapsed ? 'hidden' : 'hidden lg:inline')}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-white/[0.06] p-2">
          {!collapsed && !isAuthed && (
            <div className="hidden rounded-md border border-emerald/25 bg-emerald/[0.08] p-3 lg:block">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Demo mode
              </p>
              <p className="mt-1 text-[11px] leading-snug text-white/50">Exploring sample meetings — no account or backend needed.</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white',
              collapsed ? 'justify-center' : 'justify-center lg:justify-start',
            )}
          >
            {collapsed ? <PanelLeft className="h-[17px] w-[17px]" /> : <PanelLeftClose className="h-[17px] w-[17px]" />}
            <span className={collapsed ? 'hidden' : 'hidden lg:inline'}>Collapse</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — workspace context + global tools */}
        <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-ink/10 bg-paper/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-5 print:hidden">
          {/* mobile logo (the sidebar rail is tablet+) */}
          <Link to="/app" className="md:hidden" aria-label="ATOOPV home"><Wordmark mono /></Link>

          <nav aria-label="Breadcrumb" className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] md:flex">
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-muted lg:inline">{current?.group || (isAdminArea ? 'Admin' : 'Studio')}</span>
            {current && (
              <>
                <ChevronRight className="hidden h-3 w-3 shrink-0 text-ink/25 lg:block" aria-hidden="true" />
                <span className="truncate font-medium text-ink">{current.label}</span>
              </>
            )}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 md:justify-center">
            <button
              onClick={openCommandPalette}
              aria-label="Open command palette"
              className="flex h-9 w-full min-w-0 max-w-sm items-center gap-2 rounded-md border border-ink/10 bg-card px-3 text-[13px] text-muted transition-colors hover:border-ink/25"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="min-w-0 flex-1 truncate whitespace-nowrap text-left">Search<span className="hidden lg:inline"> or jump to…</span></span>
              <kbd className="hidden rounded border border-ink/10 px-1.5 text-[0.65rem] text-muted sm:block">⌘K</kbd>
            </button>
          </div>
          <SoundToggle />
          <Notifications />
          <ThemeSwitcher />
          <Button as={Link} to="/app/upload" size="sm" variant="accent" aria-label="New report" className="shrink-0 whitespace-nowrap rounded-md">
            <UploadCloud className="h-4 w-4" /> <span className="hidden sm:inline">New report</span>
          </Button>
          <UserMenu />
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            id="main-content"
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'min-h-0 flex-1 print:h-auto print:overflow-visible',
              immersive
                ? 'overflow-hidden'
                : studio
                  ? 'overflow-y-auto bg-paper pb-16 md:pb-0 lg:overflow-hidden'
                  : 'overflow-y-auto px-4 pb-28 pt-6 sm:px-8 sm:pt-8 md:pb-8 lg:px-10',
            )}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Mobile bottom navigation */}
      <MobileTabBar nav={nav} />

      {/* ASTRA — the always-present intelligence assistant */}
      <div className="print:hidden"><Astra /></div>

      {/* First-run welcome + guided tour */}
      <div className="print:hidden"><Onboarding /></div>
    </div>
  )
}

/** Native-feeling bottom tab bar for phones (tablet and up get the sidebar rail). */
function MobileTabBar({ nav }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-[#101217]/95 backdrop-blur-xl print:hidden md:hidden" aria-label="Primary">
      <div className="flex items-stretch justify-around overflow-x-auto px-1 pb-[env(safe-area-inset-bottom)]">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6rem] font-medium transition-colors', isActive ? 'text-white' : 'text-white/50')
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5 transition-transform', isActive && cn('scale-110', item.active))} />
                {item.label.split(' ')[0]}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
