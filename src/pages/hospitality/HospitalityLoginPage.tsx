import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Hotel, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import HospitalityFooter from '@/components/hospitality/HospitalityFooter'

export default function HospitalityLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Connexion réussie !')
      navigate('/hotellerie/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO
        title="Connexion - ImmoKey Hospitality"
        description="Connectez-vous à votre espace ImmoKey Hospitality pour gérer vos établissements, réservations et clients."
      />
      <GoogleAnalytics />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/hotellerie" className="flex items-center space-x-2">
              <Hotel className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-neutral-900">ImmoKey Hospitality</span>
            </Link>
            <Link
              to="/hotellerie/inscription"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-neutral-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-neutral-900">Bienvenue !</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Connectez-vous pour accéder à votre espace de gestion
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/mot-de-passe-oublie" className="font-medium text-primary-600 hover:text-primary-500">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">Nouveau sur ImmoKey Hospitality ?</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    to="/hotellerie/inscription"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Créer un compte gratuitement →
                  </Link>
                  <p className="mt-2 text-xs text-neutral-500">14 jours d'essai • Aucune carte requise</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/hotellerie" className="text-sm text-neutral-600 hover:text-neutral-900">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <HospitalityFooter />
      </div>
    </>
  )
}
