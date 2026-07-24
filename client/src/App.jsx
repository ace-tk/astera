import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { onUnauthorized } from '@/services/api'
import PageLoader from '@/components/common/PageLoader'
import ScrollToTop from '@/components/common/ScrollToTop'
import CommandPalette from '@/components/common/CommandPalette'
import ShortcutsOverlay from '@/components/common/ShortcutsOverlay'
import GlobalShortcuts from '@/components/common/GlobalShortcuts'
import EasterEggs from '@/components/eggs/EasterEggs'
import { GuestOnly, RequireAdmin } from '@/components/auth/RouteGuards'
import { useA11y } from '@/context/A11yContext'

// Route-level code splitting keeps the landing bundle lean.
const Landing = lazy(() => import('@/pages/Landing'))
const Accueil = lazy(() => import('@/pages/atoopv/Accueil'))
const RessourceArticle = lazy(() => import('@/pages/ressources/RessourceArticle'))
const VeilleJuridique = lazy(() => import('@/pages/ressources/VeilleJuridique'))
const Services = lazy(() => import('@/pages/Services'))
const ServiceCategory = lazy(() => import('@/pages/services/ServiceCategory'))
const ServiceCategoryLayout = lazy(() => import('@/components/services/ServiceCategoryLayout'))
const DraftingOverview = lazy(() => import('@/pages/services/drafting/DraftingOverview'))
const RedactionPvCse = lazy(() => import('@/pages/services/drafting/RedactionPvCse'))
const RedactionPvCssct = lazy(() => import('@/pages/services/drafting/RedactionPvCssct'))
const ByCityOverview = lazy(() => import('@/pages/services/by-city/ByCityOverview'))
const CityPage = lazy(() => import('@/pages/services/by-city/CityPage'))
const CommunicationOverview = lazy(() => import('@/pages/services/communication/CommunicationOverview'))
const CommunicationCse = lazy(() => import('@/pages/services/communication/CommunicationCse'))
const CommunicationAsc = lazy(() => import('@/pages/services/communication/CommunicationAsc'))
const Newsletter = lazy(() => import('@/pages/services/communication/Newsletter'))
const TrainingOverview = lazy(() => import('@/pages/services/training/TrainingOverview'))
const Formation = lazy(() => import('@/pages/services/training/Formation'))
const FormationCse = lazy(() => import('@/pages/services/training/FormationCse'))
const GuidesOverview = lazy(() => import('@/pages/services/guides/GuidesOverview'))
const GuideDuComite = lazy(() => import('@/pages/services/guides/GuideDuComite'))
const ModelePvCseGratuit = lazy(() => import('@/pages/services/guides/ModelePvCseGratuit'))
const PricingPage = lazy(() => import('@/pages/services/pricing/PricingPage'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))
const Workspace = lazy(() => import('@/pages/dashboard/Workspace'))
const DemoWorkspace = lazy(() => import('@/pages/dashboard/DemoWorkspace'))
const Overview = lazy(() => import('@/pages/dashboard/Overview'))
const UploadStudio = lazy(() => import('@/pages/dashboard/UploadStudio'))
const Report = lazy(() => import('@/pages/dashboard/Report'))
const Replay = lazy(() => import('@/pages/dashboard/Replay'))
const Reader = lazy(() => import('@/pages/dashboard/Reader'))
const Analytics = lazy(() => import('@/pages/dashboard/Analytics'))
const Settings = lazy(() => import('@/pages/dashboard/Settings'))
const Profile = lazy(() => import('@/pages/dashboard/Profile'))
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'))
const AdminReportReview = lazy(() => import('@/pages/admin/AdminReportReview'))
const Status = lazy(() => import('@/pages/dashboard/Status'))
const About = lazy(() => import('@/pages/dashboard/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/**
 * When an authenticated request 401s (an expired/invalid session), AuthContext
 * clears the session; here we send the user to sign in — but only if they were
 * inside the workspace, so a stale token never yanks a visitor off the landing
 * or demo. Graceful, and never a white screen.
 */
function SessionExpiryRedirect() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathRef = useRef(location.pathname)
  pathRef.current = location.pathname
  useEffect(
    () =>
      onUnauthorized(() => {
        if (pathRef.current.startsWith('/app')) navigate('/login', { replace: true })
      }),
    [navigate],
  )
  return null
}

export default function App() {
  const location = useLocation()
  const { reduceMotion } = useA11y()
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <ScrollToTop />
      <SessionExpiryRedirect />
      <GlobalShortcuts />
      <CommandPalette />
      <ShortcutsOverlay />
      <EasterEggs />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/atoopv" element={<Accueil />} />
            <Route path="/atoopv/ressources" element={<ServiceCategoryLayout />}>
              <Route index element={<RessourceArticle slug="guides-livres-blancs-cse" />} />
              <Route path="veille-juridique-cse" element={<VeilleJuridique />} />
              <Route path=":slug" element={<RessourceArticle />} />
            </Route>
            <Route path="/services" element={<Services />} />
            <Route path="/services/drafting" element={<ServiceCategoryLayout />}>
              <Route index element={<DraftingOverview />} />
              <Route path="redaction-pv-cse" element={<RedactionPvCse />} />
              <Route path="redaction-pv-cssct" element={<RedactionPvCssct />} />
            </Route>
            <Route path="/services/by-city" element={<ServiceCategoryLayout />}>
              <Route index element={<ByCityOverview />} />
              <Route path=":citySlug" element={<CityPage />} />
            </Route>
            <Route path="/services/communication" element={<ServiceCategoryLayout />}>
              <Route index element={<CommunicationOverview />} />
              <Route path="communication-cse" element={<CommunicationCse />} />
              <Route path="communication-asc" element={<CommunicationAsc />} />
              <Route path="newsletter" element={<Newsletter />} />
            </Route>
            <Route path="/services/training" element={<ServiceCategoryLayout />}>
              <Route index element={<TrainingOverview />} />
              <Route path="formation" element={<Formation />} />
              <Route path="formation-cse" element={<FormationCse />} />
            </Route>
            <Route path="/services/guides" element={<ServiceCategoryLayout />}>
              <Route index element={<GuidesOverview />} />
              <Route path="guide-du-comite" element={<GuideDuComite />} />
              <Route path="modele-pv-cse-gratuit" element={<ModelePvCseGratuit />} />
            </Route>
            <Route path="/services/pricing" element={<PricingPage />} />
            <Route path="/services/:slug" element={<ServiceCategory />} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<Workspace />} />
              <Route path="demos" element={<DemoWorkspace />} />
              <Route path="reports" element={<Overview />} />
              <Route path="upload" element={<UploadStudio />} />
              <Route path="report/:id" element={<Report />} />
              <Route path="read/:id" element={<Reader />} />
              <Route path="replay/:id" element={<Replay />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="reports/:id" element={<AdminReportReview />} />
              </Route>
              <Route path="status" element={<Status />} />
              <Route path="about" element={<About />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </MotionConfig>
  )
}
