import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Workflow, FileText, UploadCloud, BarChart3, Settings2, Search, Bell, PanelLeftClose, PanelLeft } from 'lucide-react'
import Wordmark from '@/components/common/Wordmark'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import SoundToggle from '@/components/common/SoundToggle'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// The command palette (mounted app-wide) listens for this event.
const openCommandPalette = () => window.dispatchEvent(new CustomEvent('astera:command'))

const NAV = [
  { to: '/app', label: 'Workspace', icon: Workflow, end: true, active: 'text-purple' },
  { to: '/app/reports', label: 'Reports', icon: FileText, active: 'text-royal' },
  { to: '/app/upload', label: 'Upload Studio', icon: UploadCloud, active: 'text-coral' },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3, active: 'text-sky' },
  { to: '/app/settings', label: 'Settings', icon: Settings2, active: 'text-emerald' },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // Immersive routes fill the viewport with no padding (canvas / reader).
  const immersive =
    location.pathname === '/app' || location.pathname.startsWith('/app/replay')

  return (
    <div className="bg-canvas flex h-screen overflow-hidden">
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
          {!collapsed && (
            <div className="rounded-2xl border border-ink/8 bg-paper p-4">
              <p className="text-xs font-medium">Studio plan</p>
              <p className="mt-1 text-xs text-muted">18 of ∞ reports this month</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/8">
                <div className="h-full w-2/3 rounded-full bg-accent" />
              </div>
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
        <header className="z-30 flex shrink-0 items-center gap-4 border-b border-ink/8 bg-paper/70 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={openCommandPalette}
              className="flex h-10 w-full max-w-sm items-center gap-2 rounded-full border border-ink/8 bg-card px-4 text-sm text-muted transition-colors hover:border-ink/20"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search or jump to…</span>
              <kbd className="hidden rounded-md border border-ink/10 px-1.5 text-[0.65rem] text-muted sm:block">⌘K</kbd>
            </button>
          </div>
          <SoundToggle />
          <button className="grid h-10 w-10 place-items-center rounded-full border border-ink/8 bg-card text-muted transition-colors hover:text-ink">
            <Bell className="h-4.5 w-4.5" />
          </button>
          <ThemeSwitcher />
          <Button as={Link} to="/app/upload" size="sm" variant="accent">
            <UploadCloud className="h-4 w-4" /> New report
          </Button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'min-h-0 flex-1',
              immersive ? 'overflow-hidden' : 'overflow-y-auto px-6 py-8 sm:px-8 lg:px-10',
            )}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
