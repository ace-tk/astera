import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Workflow, FileText, UploadCloud, BarChart3, Settings2, Search, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react'
import Wordmark from '@/components/common/Wordmark'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import SoundToggle from '@/components/common/SoundToggle'
import Notifications from '@/components/common/Notifications'
import UserMenu from '@/components/common/UserMenu'
import MeshBackground from '@/components/common/MeshBackground'
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

const NAV = [
  { to: '/app', label: 'Workspace', icon: Workflow, end: true, active: 'text-purple' },
  { to: '/app/demos', label: 'Demos', icon: Sparkles, active: 'text-coral' },
  { to: '/app/reports', label: 'Reports', icon: FileText, active: 'text-royal' },
  { to: '/app/upload', label: 'Upload Studio', icon: UploadCloud, active: 'text-coral' },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3, active: 'text-sky' },
  { to: '/app/settings', label: 'Settings', icon: Settings2, active: 'text-emerald' },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { isAuthed } = useAuth()

  // Immersive routes fill the viewport with no padding (canvas / reader).
  const immersive =
    location.pathname === '/app' ||
    location.pathname.startsWith('/app/replay') ||
    location.pathname.startsWith('/app/read')

  return (
    <div className="bg-canvas relative flex h-screen overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper">
        Skip to content
      </a>
      {!immersive && (
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
          <MeshBackground mood={ROUTE_MOOD[location.pathname] || 'reports'} dots={false} />
        </div>
      )}
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 264 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-ink/8 bg-card/60 p-4 backdrop-blur-xl lg:flex"
      >
        <div className="flex items-center justify-between px-2 py-2">
          <Link to="/">{collapsed ? <Wordmark mono /> : <Wordmark />}</Link>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                  isActive ? 'text-ink' : 'text-muted hover:text-ink hover:bg-ink/[0.03]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-2xl bg-ink/[0.05]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon className={cn('relative h-5 w-5 shrink-0 transition-transform group-hover:scale-110', isActive && item.active)} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="relative whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          {!collapsed && !isAuthed && (
            <div className="rounded-2xl border border-emerald/25 bg-emerald/[0.06] p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Demo mode
              </p>
              <p className="mt-1 text-xs text-muted">Exploring sample meetings — no account or backend needed.</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-muted transition-colors hover:bg-ink/[0.03] hover:text-ink"
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="z-30 flex shrink-0 items-center gap-3 border-b border-ink/8 bg-paper/70 px-4 py-3.5 backdrop-blur-xl sm:gap-4 sm:px-6 sm:py-4">
          {/* mobile logo (sidebar is desktop-only) */}
          <Link to="/app" className="lg:hidden" aria-label="ATOOPV home"><Wordmark mono /></Link>
          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={openCommandPalette}
              aria-label="Open command palette"
              className="flex h-10 w-full max-w-sm items-center gap-2 rounded-full border border-ink/8 bg-card px-4 text-sm text-muted transition-colors hover:border-ink/20"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search<span className="hidden sm:inline"> or jump to…</span></span>
              <kbd className="hidden rounded-md border border-ink/10 px-1.5 text-[0.65rem] text-muted sm:block">⌘K</kbd>
            </button>
          </div>
          <SoundToggle />
          <Notifications />
          <ThemeSwitcher />
          <Button as={Link} to="/app/upload" size="sm" variant="accent" aria-label="New report">
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
              'min-h-0 flex-1',
              immersive ? 'overflow-hidden' : 'overflow-y-auto px-4 pb-28 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10',
            )}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Mobile bottom navigation */}
      <MobileTabBar />

      {/* ASTRA — the always-present intelligence assistant */}
      <Astra />

      {/* First-run welcome + guided tour */}
      <Onboarding />
    </div>
  )
}

/** Native-feeling bottom tab bar for small screens (the sidebar is desktop-only). */
function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/8 bg-card/90 backdrop-blur-xl lg:hidden" aria-label="Primary">
      <div className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6rem] font-medium transition-colors', isActive ? 'text-ink' : 'text-muted')
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
