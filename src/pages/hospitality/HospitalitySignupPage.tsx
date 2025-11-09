import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, ArrowRight, Mail, Lock, User, Phone, Check, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import HospitalityFooter from '@/components/hospitality/HospitalityFooter'
import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

type PlanType = 'starter' | 'professionnel' | 'entreprise'

const plans = [
  {
    id: 'starter' as PlanType,
    name: 'Starter',
    price: 9900,
    originalPrice: 15000,
    description: 'Parfait pour les petits établissements',
    features: [
      'Jusqu\'à 1 établissement',
      'Jusqu\'à 50 chambres',
      'Réservations illimitées',
      'Gestion clients de base',
      'Rapports mensuels',
      'Support email',
    ],
  },
  {
    id: 'professionnel' as PlanType,
    name: 'Professionnel',
    price: 20000,
    description: 'Pour les établissements en croissance',
    features: [
      'Jusqu\'à 5 établissements',
      'Chambres illimitées',
      'Réservations illimitées',
      'Gestion clients avancée',
      'Analytics avancés',
      'Support prioritaire',
      'Intégrations API',
    ],
  },
  {
    id: 'entreprise' as PlanType,
    name: 'Entreprise',
    price: null,
    description: 'Pour les chaînes hôtelières',
    features: [
      'Établissements illimités',
      'Chambres illimitées',
      'Réservations illimitées',
      'Gestion clients complète',
      'Analytics premium',
      'Support dédié 24/7',
      'Intégrations personnalisées',
      'Formation sur site',
      'Gestionnaire de compte dédié',
    ],
  },
]

export default function HospitalitySignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'info' | 'plan'>('info')
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Informations utilisateur
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    establishmentName: '',
  })

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    setStep('plan')
  }

  const handleSignup = async () => {
    if (!selectedPlan) {
      toast.error('Veuillez sélectionner un pack')
      return
    }

    setLoading(true)

    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            establishment_name: formData.establishmentName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Mettre à jour le profil utilisateur avec les informations d'abonnement
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            plan_type: selectedPlan,
            subscription_status: 'trial',
            trial_ends_at: trialEndsAt,
            establishment_name: formData.establishmentName,
          })
          .eq('id', authData.user.id)

        if (profileError) throw profileError

        toast.success('Compte créé avec succès ! Essai gratuit de 14 jours activé.')
        navigate('/hotellerie/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'info') {
    return (
      <>
        <SEO />
        <GoogleAnalytics />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/hotellerie" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-neutral-900">ImmoKey</div>
                <div className="text-sm text-neutral-600">Hôtellerie</div>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Créer votre compte</h1>
            <p className="text-neutral-600">Commencez votre essai gratuit de 14 jours</p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200 p-8">
            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="+228 XX XX XX XX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="establishmentName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom de l'établissement
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="establishmentName"
                    type="text"
                    value={formData.establishmentName}
                    onChange={(e) => setFormData({ ...formData, establishmentName: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Hôtel Royal"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Continuer
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Déjà un compte ?{' '}
                <Link to="/hotellerie/connexion" className="text-primary-600 font-semibold hover:text-primary-700">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
            </div>
          </div>
          
          {/* Footer personnalisé Hospitality */}
          <div className="mt-auto">
            <HospitalityFooter />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO />
      <GoogleAnalytics />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex flex-col">
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/hotellerie" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-neutral-900">ImmoKey</div>
              <div className="text-sm text-neutral-600">Hôtellerie</div>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Choisissez votre pack</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">
              Essai gratuit de 14 jours - Aucune carte bancaire requise
            </span>
          </div>
          <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">
            Après 14 jours, vous devrez vous abonner pour continuer à bénéficier des services. 
            Vous n'aurez accès qu'aux fonctionnalités comprises dans le pack choisi.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                selectedPlan === plan.id
                  ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white border-primary-500 shadow-2xl shadow-primary-500/30 scale-105'
                  : 'bg-white/80 backdrop-blur-xl text-neutral-900 border-neutral-200 hover:border-primary-500/50 hover:shadow-xl'
              }`}
            >
              {selectedPlan === plan.id && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-primary-600 rounded-full text-sm font-semibold shadow-lg">
                  Sélectionné
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${selectedPlan === plan.id ? 'text-white' : 'text-neutral-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${selectedPlan === plan.id ? 'text-white/80' : 'text-neutral-600'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline flex-wrap gap-2">
                  {plan.price !== null ? (
                    <>
                      {plan.originalPrice && (
                        <span className={`text-xl line-through ${selectedPlan === plan.id ? 'text-white/60' : 'text-neutral-400'}`}>
                          {plan.originalPrice.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                      <span className={`text-5xl font-extrabold ${selectedPlan === plan.id ? 'text-white' : 'text-neutral-900'}`}>
                        {plan.price.toLocaleString('fr-FR')}
                      </span>
                      <span className={`ml-2 ${selectedPlan === plan.id ? 'text-white/80' : 'text-neutral-600'}`}>
                        FCFA / mois
                      </span>
                    </>
                  ) : (
                    <span className={`text-2xl font-bold ${selectedPlan === plan.id ? 'text-white' : 'text-neutral-900'}`}>
                      Sur devis
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        selectedPlan === plan.id ? 'text-white' : 'text-primary-600'
                      }`}
                    />
                    <span className={selectedPlan === plan.id ? 'text-white/90' : 'text-neutral-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Info essai gratuit */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Essai gratuit de 14 jours</h3>
              <p className="text-sm text-blue-700">
                Profitez de toutes les fonctionnalités de votre pack choisi pendant 14 jours, sans engagement. 
                À la fin de la période d'essai, vous recevrez un email avec un lien pour vous abonner et continuer 
                à utiliser ImmoKey Hôtellerie.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStep('info')}
            className="px-8 py-3 bg-white border-2 border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
          >
            Retour
          </button>
          <button
            onClick={handleSignup}
            disabled={!selectedPlan || loading}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
          </div>
        </div>
        
        {/* Footer personnalisé Hospitality */}
        <div className="mt-auto">
          <HospitalityFooter />
        </div>
      </div>
    </>
  )
}

