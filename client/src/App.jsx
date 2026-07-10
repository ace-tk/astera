import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import PageLoader from '@/components/common/PageLoader'
import ScrollToTop from '@/components/common/ScrollToTop'
import CommandPalette from '@/components/common/CommandPalette'
import ShortcutsOverlay from '@/components/common/ShortcutsOverlay'
import GlobalShortcuts from '@/components/common/GlobalShortcuts'

// Route-level code splitting keeps the landing bundle lean.
const Landing = lazy(() => import('@/pages/Landing'))
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))
const Workspace = lazy(() => import('@/pages/dashboard/Workspace'))
const Overview = lazy(() => import('@/pages/dashboard/Overview'))
const UploadStudio = lazy(() => import('@/pages/dashboard/UploadStudio'))
const Report = lazy(() => import('@/pages/dashboard/Report'))
const Replay = lazy(() => import('@/pages/dashboard/Replay'))
const Reader = lazy(() => import('@/pages/dashboard/Reader'))
const Analytics = lazy(() => import('@/pages/dashboard/Analytics'))
const Settings = lazy(() => import('@/pages/dashboard/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  const location = useLocation()
  return (
    <>
      <ScrollToTop />
      <GlobalShortcuts />
      <CommandPalette />
      <ShortcutsOverlay />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<Workspace />} />
              <Route path="reports" element={<Overview />} />
              <Route path="upload" element={<UploadStudio />} />
              <Route path="report/:id" element={<Report />} />
              <Route path="read/:id" element={<Reader />} />
              <Route path="replay/:id" element={<Replay />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  )
}
