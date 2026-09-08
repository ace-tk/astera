import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { onUnauthorized } from '@/services/api'
import PageLoader from '@/components/common/PageLoader'
import ScrollToTop from '@/components/common/ScrollToTop'
import CommandPalette from '@/components/common/CommandPalette'
import ShortcutsOverlay from '@/components/common/ShortcutsOverlay'
import GlobalShortcuts from '@/components/common/GlobalShortcuts'
import EasterEggs from '@/components/eggs/EasterEggs'
import { GuestOnly, RequireAuth, RequireAdmin } from '@/components/auth/RouteGuards'
import { useAuth } from '@/context/AuthContext'
import { useA11y } from '@/context/A11yContext'

// Route-level code splitting keeps the landing bundle lean.
const Landing = lazy(() => import('@/pages/Landing'))
const BlogPost = lazy(() => import('@/pages/BlogPost'))
const Accueil = lazy(() => import('@/pages/atoopv/Accueil'))
const Boutique = lazy(() => import('@/pages/atoopv/Boutique'))
const Tarification = lazy(() => import('@/pages/atoopv/Tarification'))
const APropos = lazy(() => import('@/pages/atoopv/APropos'))
const Autodiagnostic = lazy(() => import('@/pages/atoopv/Autodiagnostic'))
const Atoosavoir = lazy(() => import('@/pages/atoopv/Atoosavoir'))
const AtoosavoirExemple = lazy(() => import('@/pages/atoopv/AtoosavoirExemple'))
const AtoosavoirCgv = lazy(() => import('@/pages/atoopv/AtoosavoirCgv'))
const RessourceArticle = lazy(() => import('@/pages/ressources/RessourceArticle'))
const VeilleJuridique = lazy(() => import('@/pages/ressources/VeilleJuridique'))
const DesignTest = lazy(() => import('@/pages/DesignTest'))
const Services = lazy(() => import('@/pages/Services'))
const ServiceCategoryLayout = lazy(() => import('@/components/services/ServiceCategoryLayout'))
const ServiceArticle = lazy(() => import('@/pages/services/ServiceArticle'))
const ServiceCategoryDirectory = lazy(() => import('@/pages/services/ServiceCategoryDirectory'))
const PricingPage = lazy(() => import('@/pages/services/pricing/PricingPage'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'))
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
const AdminWorkspace = lazy(() => import('@/pages/admin/AdminWorkspace'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'))
const AdminReportReview = lazy(() => import('@/pages/admin/AdminReportReview'))
const AdminReportRequests = lazy(() => import('@/pages/admin/AdminReportRequests'))
const AdminReportRequestDetail = lazy(() => import('@/pages/admin/AdminReportRequestDetail'))
const AdminFiles = lazy(() => import('@/pages/admin/AdminFiles'))
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'))
const AdminCustomerDetail = lazy(() => import('@/pages/admin/AdminCustomerDetail'))
const AdminCustomerCreate = lazy(() => import('@/pages/admin/AdminCustomerCreate'))
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))
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

/**
 * The sole entry point behind "Open app": by the time this renders, RequireAuth
 * has already guaranteed a signed-in user. Admins are sent straight to their
 * dashboard; everyone else lands on the customer Workspace. Nobody picks a
 * destination — the role does.
 */
function AppEntry() {
  const { user } = useAuth()
  if (user?.isAdmin) return <Navigate to="/app/admin" replace />
  return <Workspace />
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
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/atoopv" element={<Accueil />} />
            <Route path="/atoopv/boutique" element={<Boutique />} />
            <Route path="/atoopv/tarification" element={<Tarification />} />
            {/* /atoopv/simulateur was the page's originally-intended path (still
                referenced that way by servicesLinks.js/resourcesLinks.js's internal
                link maps) before it shipped as /atoopv/tarification — redirect
                rather than duplicate the page. /atoopv/contact has no dedicated
                page anywhere in the port yet (confirmed: no ContactForm/devis
                component exists); every "Demander un devis gratuit"-style CTA
                across the ATOOPV pages points here, so this mirrors the one
                already-working precedent for the identical action — the English
                PricingCalculator's own equivalent CTA (constants/pricing.js) —
                rather than inventing a new destination. */}
            <Route path="/atoopv/simulateur" element={<Navigate to="/atoopv/tarification" replace />} />
            <Route path="/atoopv/contact" element={<Navigate to="/app" replace />} />
            <Route path="/atoopv/a-propos" element={<APropos />} />
            <Route path="/atoopv/autodiagnostic" element={<Autodiagnostic />} />
            <Route path="/atoopv/atoosavoir" element={<Atoosavoir />} />
            <Route path="/atoopv/atoosavoir/exemple" element={<AtoosavoirExemple />} />
            <Route path="/atoopv/atoosavoir/cgv" element={<AtoosavoirCgv />} />
            <Route path="/atoopv/ressources" element={<ServiceCategoryLayout />}>
              <Route index element={<RessourceArticle slug="guides-livres-blancs-cse" />} />
              <Route path="veille-juridique-cse" element={<VeilleJuridique />} />
              <Route path=":slug" element={<RessourceArticle />} />
            </Route>
            <Route path="/design-test" element={<DesignTest />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/drafting" element={<ServiceCategoryLayout />}>
              <Route index element={<ServiceArticle category="drafting" slug="nos-services-pv" />} />
              <Route path=":slug" element={<ServiceArticle category="drafting" />} />
            </Route>
            <Route path="/services/by-city" element={<ServiceCategoryLayout />}>
              <Route index element={<ServiceCategoryDirectory category="by-city" />} />
              <Route path=":slug" element={<ServiceArticle category="by-city" />} />
            </Route>
            <Route path="/services/tarifs-infos" element={<ServiceCategoryLayout />}>
              <Route index element={<ServiceArticle category="tarifs-infos" slug="tarif-redaction-pv-cse" />} />
              <Route path=":slug" element={<ServiceArticle category="tarifs-infos" />} />
            </Route>
            <Route path="/services/guides" element={<ServiceCategoryLayout />}>
              <Route index element={<ServiceCategoryDirectory category="guides" />} />
              <Route path=":slug" element={<ServiceArticle category="guides" />} />
            </Route>
            <Route path="/services/communication" element={<ServiceCategoryLayout />}>
              <Route index element={<ServiceArticle category="communication" slug="communication-cse" />} />
              <Route path=":slug" element={<ServiceArticle category="communication" />} />
            </Route>
            <Route path="/services/training" element={<ServiceCategoryLayout />}>
              <Route index element={<ServiceArticle category="training" slug="formations-elus-cse-agree" />} />
              <Route path=":slug" element={<ServiceArticle category="training" />} />
            </Route>
            <Route path="/services/pricing" element={<PricingPage />} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/app" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route index element={<AppEntry />} />
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
                <Route path="workspace" element={<AdminWorkspace />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="reports/:id" element={<AdminReportReview />} />
                <Route path="report-requests" element={<AdminReportRequests />} />
                <Route path="report-requests/:id" element={<AdminReportRequestDetail />} />
                <Route path="files" element={<AdminFiles />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="customers/new" element={<AdminCustomerCreate />} />
                <Route path="customers/:id" element={<AdminCustomerDetail />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
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
