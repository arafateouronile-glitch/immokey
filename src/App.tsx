import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/react-query'
import Layout from './components/common/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import PageLoader from './components/common/PageLoader'
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt'
import OfflineIndicator from './components/common/OfflineIndicator'
import SEO from './components/seo/SEO'
import GoogleAnalytics from './components/analytics/GoogleAnalytics'

// Pages principales
const HomePage = lazy(() => import('./pages/HomePage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'))
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'))
const EditListingPage = lazy(() => import('./pages/EditListingPage'))
const MyListingsPage = lazy(() => import('./pages/MyListingsPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))

// Pages SaaS / Admin
const SuperAdminDashboardPage = lazy(() => import('./pages/admin/SuperAdminDashboardPage'))

// Pages Immobilier (Rental Management)
const RentalDashboardPage = lazy(() => import('./pages/rental/RentalDashboardPage'))
const ManagedPropertiesPage = lazy(() => import('./pages/rental/ManagedPropertiesPage'))
const CreateManagedPropertyPage = lazy(() => import('./pages/rental/CreateManagedPropertyPage'))
const ManagedPropertyDetailPage = lazy(() => import('./pages/rental/ManagedPropertyDetailPage'))
const TenantsPage = lazy(() => import('./pages/rental/TenantsPage'))
const CreateTenantPage = lazy(() => import('./pages/rental/CreateTenantPage'))
const TenantDetailPage = lazy(() => import('./pages/rental/TenantDetailPage'))
const PaymentsPage = lazy(() => import('./pages/rental/PaymentsPage'))
const CreatePaymentPage = lazy(() => import('./pages/rental/CreatePaymentPage'))
const DocumentsPage = lazy(() => import('./pages/rental/DocumentsPage'))
const CreateDocumentPage = lazy(() => import('./pages/rental/CreateDocumentPage'))
const RentalMessagesPage = lazy(() => import('./pages/rental/MessagesPage'))
const ConversationPage = lazy(() => import('./pages/rental/ConversationPage'))
const ServicesActivationPage = lazy(() => import('./pages/realEstate/ServicesActivationPage'))

// Pages Hôtellerie (Hospitality Management)
const HospitalityLayout = lazy(() => import('./components/hospitality/HospitalityLayout'))
const HospitalityLandingPage = lazy(() => import('./pages/hospitality/HospitalityLandingPage'))
const HospitalityLoginPage = lazy(() => import('./pages/hospitality/HospitalityLoginPage'))
const HospitalitySignupPage = lazy(() => import('./pages/hospitality/HospitalitySignupPage'))
const HospitalitySubscriptionPage = lazy(() => import('./pages/hospitality/HospitalitySubscriptionPage'))
const HospitalityDashboardPage = lazy(() => import('./pages/hospitality/HospitalityDashboardPage'))
const EstablishmentsPage = lazy(() => import('./pages/hospitality/EstablishmentsPage'))
const CreateEstablishmentPage = lazy(() => import('./pages/hospitality/CreateEstablishmentPage'))
const EstablishmentDetailPage = lazy(() => import('./pages/hospitality/EstablishmentDetailPage'))
const RoomsPage = lazy(() => import('./pages/hospitality/RoomsPage'))
const CreateRoomPage = lazy(() => import('./pages/hospitality/CreateRoomPage'))
const RoomDetailPage = lazy(() => import('./pages/hospitality/RoomDetailPage'))
const BookingsPage = lazy(() => import('./pages/hospitality/BookingsPage'))
const CreateBookingPage = lazy(() => import('./pages/hospitality/CreateBookingPage'))
const BookingDetailPage = lazy(() => import('./pages/hospitality/BookingDetailPage'))
const PublicBookingPage = lazy(() => import('./pages/public/PublicBookingPage'))
const BookingConfirmationPage = lazy(() => import('./pages/public/BookingConfirmationPage'))

// Pages Légales
const TermsOfServicePage = lazy(() => import('./pages/legal/TermsOfServicePage'))
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'))
const CookiesPolicyPage = lazy(() => import('./pages/legal/CookiesPolicyPage'))
const LegalNoticePage = lazy(() => import('./pages/legal/LegalNoticePage'))

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <BrowserRouter>
            <PWAInstallPrompt />
            <OfflineIndicator />
            <SEO />
            <GoogleAnalytics />
            <Routes>
            {/* Routes principales avec layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
              <Route path="recherche" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
              <Route path="annonces/:id" element={<Suspense fallback={<PageLoader />}><ListingDetailPage /></Suspense>} />
              <Route path="annonces/creer" element={<Suspense fallback={<PageLoader />}><CreateListingPage /></Suspense>} />
              <Route path="publier" element={<Navigate to="/annonces/creer" replace />} />
              <Route path="annonces/modifier/:id" element={<Suspense fallback={<PageLoader />}><EditListingPage /></Suspense>} />
              <Route path="mes-annonces" element={<Suspense fallback={<PageLoader />}><MyListingsPage /></Suspense>} />
              <Route path="favoris" element={<Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense>} />
              <Route path="profil" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
              <Route path="messages" element={<Suspense fallback={<PageLoader />}><MessagesPage /></Suspense>} />
              <Route path="contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
              <Route path="faq" element={<Suspense fallback={<PageLoader />}><FAQPage /></Suspense>} />

              {/* Routes de gestion locative */}
              <Route path="gestion-locative" element={<Suspense fallback={<PageLoader />}><RentalDashboardPage /></Suspense>} />
              <Route path="gestion-locative/biens" element={<Suspense fallback={<PageLoader />}><ManagedPropertiesPage /></Suspense>} />
              <Route path="gestion-locative/biens/nouveau" element={<Suspense fallback={<PageLoader />}><CreateManagedPropertyPage /></Suspense>} />
              <Route path="gestion-locative/biens/:id" element={<Suspense fallback={<PageLoader />}><ManagedPropertyDetailPage /></Suspense>} />
              <Route path="gestion-locative/locataires" element={<Suspense fallback={<PageLoader />}><TenantsPage /></Suspense>} />
              <Route path="gestion-locative/locataires/nouveau" element={<Suspense fallback={<PageLoader />}><CreateTenantPage /></Suspense>} />
              <Route path="gestion-locative/locataires/:id" element={<Suspense fallback={<PageLoader />}><TenantDetailPage /></Suspense>} />
              <Route path="gestion-locative/paiements" element={<Suspense fallback={<PageLoader />}><PaymentsPage /></Suspense>} />
              <Route path="gestion-locative/paiements/nouveau" element={<Suspense fallback={<PageLoader />}><CreatePaymentPage /></Suspense>} />
              <Route path="gestion-locative/documents" element={<Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense>} />
              <Route path="gestion-locative/documents/nouveau" element={<Suspense fallback={<PageLoader />}><CreateDocumentPage /></Suspense>} />
              <Route path="gestion-locative/messages" element={<Suspense fallback={<PageLoader />}><RentalMessagesPage /></Suspense>} />
              <Route path="gestion-locative/messages/:id" element={<Suspense fallback={<PageLoader />}><ConversationPage /></Suspense>} />
              <Route path="gestion-locative/activer-services" element={<Suspense fallback={<PageLoader />}><ServicesActivationPage /></Suspense>} />
            </Route>

            {/* Routes d'authentification sans layout principal */}
            <Route path="connexion" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
            <Route path="inscription" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />

            {/* Routes Hospitality - Landing, connexion, inscription, abonnement (sans layout principal) */}
            <Route path="hotellerie" element={<Suspense fallback={<PageLoader />}><HospitalityLandingPage /></Suspense>} />
            <Route path="hotellerie/connexion" element={<Suspense fallback={<PageLoader />}><HospitalityLoginPage /></Suspense>} />
            <Route path="hotellerie/inscription" element={<Suspense fallback={<PageLoader />}><HospitalitySignupPage /></Suspense>} />
            <Route path="hotellerie/abonnement" element={<Suspense fallback={<PageLoader />}><HospitalitySubscriptionPage /></Suspense>} />

            {/* Routes publiques de réservation (sans layout) */}
            <Route path="reservation/:slugOrId" element={<Suspense fallback={<PageLoader />}><PublicBookingPage /></Suspense>} />
            <Route path="reservation/confirmation/:bookingId" element={<Suspense fallback={<PageLoader />}><BookingConfirmationPage /></Suspense>} />

            {/* Routes Hospitality - Management (avec layout isolé) */}
            <Route path="hotellerie/*" element={<Suspense fallback={<PageLoader />}><HospitalityLayout /></Suspense>}>
              <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><HospitalityDashboardPage /></Suspense>} />
              <Route path="etablissements" element={<Suspense fallback={<PageLoader />}><EstablishmentsPage /></Suspense>} />
              <Route path="etablissements/nouveau" element={<Suspense fallback={<PageLoader />}><CreateEstablishmentPage /></Suspense>} />
              <Route path="etablissements/:id" element={<Suspense fallback={<PageLoader />}><EstablishmentDetailPage /></Suspense>} />
              <Route path="chambres" element={<Suspense fallback={<PageLoader />}><RoomsPage /></Suspense>} />
              <Route path="chambres/nouvelle" element={<Suspense fallback={<PageLoader />}><CreateRoomPage /></Suspense>} />
              <Route path="chambres/:id" element={<Suspense fallback={<PageLoader />}><RoomDetailPage /></Suspense>} />
              <Route path="reservations" element={<Suspense fallback={<PageLoader />}><BookingsPage /></Suspense>} />
              <Route path="reservations/nouvelle" element={<Suspense fallback={<PageLoader />}><CreateBookingPage /></Suspense>} />
              <Route path="reservations/:id" element={<Suspense fallback={<PageLoader />}><BookingDetailPage /></Suspense>} />
            </Route>

            {/* Routes Super Admin */}
            <Route path="admin" element={<Suspense fallback={<PageLoader />}><SuperAdminDashboardPage /></Suspense>} />

            {/* Routes Légales */}
            <Route path="cgu" element={<Suspense fallback={<PageLoader />}><TermsOfServicePage /></Suspense>} />
            <Route path="confidentialite" element={<Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>} />
            <Route path="cookies" element={<Suspense fallback={<PageLoader />}><CookiesPolicyPage /></Suspense>} />
            <Route path="mentions-legales" element={<Suspense fallback={<PageLoader />}><LegalNoticePage /></Suspense>} />
          </Routes>
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
