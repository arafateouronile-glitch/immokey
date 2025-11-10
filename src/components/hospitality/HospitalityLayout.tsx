import { useState } from 'react'
import {
  Outlet,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  Hotel,
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarCheck,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import HospitalityFooter from './HospitalityFooter'

const navigation = [
  {
    to: '/hotellerie/dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
  },
  {
    to: '/hotellerie/etablissements',
    label: 'Établissements',
    icon: Building2,
  },
  {
    to: '/hotellerie/chambres',
    label: 'Chambres',
    icon: BedDouble,
  },
  {
    to: '/hotellerie/reservations',
    label: 'Réservations',
    icon: CalendarCheck,
  },
]

export default function HospitalityLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/hotellerie/connexion" replace state={{ from: location }} />
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/hotellerie/connexion', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hotel className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-lg font-semibold text-neutral-900">ImmoKey Hospitality</p>
              <p className="text-xs text-neutral-500">
                Gestion professionnelle de vos établissements
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-primary-600' : 'text-neutral-600 hover:text-primary-500'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-neutral-900">
                {user.email ?? 'Utilisateur'}
              </span>
              <span className="text-xs text-neutral-500">Espace Hôtellerie</span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-neutral-200 text-neutral-600 hover:text-primary-600 hover:border-primary-300 transition-colors"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <HospitalityFooter />
    </div>
  )
}

