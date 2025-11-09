import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CreditCard, Smartphone, Check, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { PaymentService } from '@/services/hospitality/paymentService'
import toast from 'react-hot-toast'
import HospitalityFooter from '@/components/hospitality/HospitalityFooter'
import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

type PaymentMethod = 'card' | 'moov' | 'flooz'

const paymentMethods = [
  {
    id: 'card' as PaymentMethod,
    name: 'Carte bancaire',
    icon: CreditCard,
    description: 'Visa, Mastercard',
  },
  {
    id: 'moov' as PaymentMethod,
    name: 'Moov Money',
    icon: Smartphone,
    description: 'Paiement mobile',
  },
  {
    id: 'flooz' as PaymentMethod,
    name: 'Flooz',
    icon: Smartphone,
    description: 'Paiement mobile',
  },
]

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9900,
    originalPrice: 15000,
  },
  {
    id: 'professionnel',
    name: 'Professionnel',
    price: 20000,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: null,
  },
]

export default function HospitalitySubscriptionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(false)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showCardForm, setShowCardForm] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/hotellerie/connexion')
      return
    }

    // Récupérer les informations du plan utilisateur
    const fetchUserPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('plan_type, trial_ends_at')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data) {
          setUserPlan(data.plan_type)
          setSelectedPlan(data.plan_type)
          if (data.trial_ends_at) {
            setTrialEndsAt(new Date(data.trial_ends_at))
          }
        }
      } catch (error: any) {
        console.error('Error fetching user plan:', error)
      }
    }

    fetchUserPlan()
  }, [user, navigate])

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Veuillez sélectionner un pack')
      return
    }

    if (!selectedPaymentMethod) {
      toast.error('Veuillez sélectionner un moyen de paiement')
      return
    }

    // Vérifier les prérequis selon la méthode de paiement
    if ((selectedPaymentMethod === 'moov' || selectedPaymentMethod === 'flooz') && !phoneNumber) {
      toast.error('Veuillez entrer votre numéro de téléphone')
      return
    }

    if (selectedPaymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) {
      toast.error('Veuillez remplir tous les champs de la carte')
      return
    }

    setLoading(true)

    try {
      const plan = plans.find(p => p.id === selectedPlan)
      if (!plan || !plan.price) {
        throw new Error('Plan invalide')
      }

      const response = await PaymentService.processPayment({
        userId: user!.id,
        planType: selectedPlan as 'starter' | 'professionnel' | 'entreprise',
        amount: plan.price,
        paymentMethod: selectedPaymentMethod,
        phoneNumber: selectedPaymentMethod !== 'card' ? phoneNumber : undefined,
        cardDetails: selectedPaymentMethod === 'card' ? cardDetails : undefined,
      })

      if (response.success) {
        toast.success(response.message || 'Abonnement activé avec succès !')
        navigate('/hotellerie/dashboard')
      } else {
        throw new Error(response.error || 'Erreur lors du paiement')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'abonnement')
    } finally {
      setLoading(false)
    }
  }

  const isTrialExpired = trialEndsAt && new Date() > trialEndsAt
  const daysRemaining = trialEndsAt 
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <>
      <SEO />
      <GoogleAnalytics />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex flex-col">
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-neutral-900">ImmoKey</div>
              <div className="text-sm text-neutral-600">Hôtellerie</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Abonnement</h1>
          
          {isTrialExpired ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border border-red-200 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold text-red-700">
                Votre essai gratuit a expiré
              </span>
            </div>
          ) : daysRemaining > 0 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-4">
              <span className="text-sm font-semibold text-blue-700">
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''} sur votre essai gratuit
              </span>
            </div>
          ) : null}
          
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Choisissez votre pack et votre moyen de paiement pour continuer à bénéficier de nos services
          </p>
        </div>

        {/* Sélection du pack */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Choisissez votre pack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white border-primary-500 shadow-lg'
                    : 'bg-white border-neutral-200 hover:border-primary-500/50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${selectedPlan === plan.id ? 'text-white' : 'text-neutral-900'}`}>
                  {plan.name}
                </h3>
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-2">
                    {plan.originalPrice && (
                      <span className={`text-lg line-through ${selectedPlan === plan.id ? 'text-white/60' : 'text-neutral-400'}`}>
                        {plan.originalPrice.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                    <span className={`text-3xl font-extrabold ${selectedPlan === plan.id ? 'text-white' : 'text-neutral-900'}`}>
                      {plan.price.toLocaleString('fr-FR')}
                    </span>
                    <span className={`text-sm ${selectedPlan === plan.id ? 'text-white/80' : 'text-neutral-600'}`}>
                      /mois
                    </span>
                  </div>
                ) : (
                  <span className={`text-xl font-bold ${selectedPlan === plan.id ? 'text-white' : 'text-neutral-900'}`}>
                    Sur devis
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sélection du moyen de paiement */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Moyen de paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id)
                    setShowCardForm(method.id === 'card')
                  }}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPaymentMethod === method.id
                      ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white border-primary-500 shadow-lg'
                      : 'bg-white border-neutral-200 hover:border-primary-500/50'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${selectedPaymentMethod === method.id ? 'text-white' : 'text-primary-600'}`} />
                  <h3 className={`font-bold mb-1 ${selectedPaymentMethod === method.id ? 'text-white' : 'text-neutral-900'}`}>
                    {method.name}
                  </h3>
                  <p className={`text-sm ${selectedPaymentMethod === method.id ? 'text-white/80' : 'text-neutral-600'}`}>
                    {method.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Formulaire selon la méthode de paiement */}
          {selectedPaymentMethod === 'card' && (
            <div className="mt-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-4">Informations de la carte</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\s/g, '') })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(selectedPaymentMethod === 'moov' || selectedPaymentMethod === 'flooz') && (
            <div className="mt-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-4">
                Numéro de téléphone {selectedPaymentMethod === 'moov' ? 'Moov' : 'Flooz'}
              </h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="+228 XX XX XX XX"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Format: +228 suivi de 8 chiffres (ex: +22890123456)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        {selectedPlan && selectedPaymentMethod && (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8 mb-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Récapitulatif</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-700">Pack sélectionné :</span>
                <span className="font-semibold text-neutral-900">
                  {plans.find(p => p.id === selectedPlan)?.name}
                </span>
              </div>
              {plans.find(p => p.id === selectedPlan)?.price && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-700">Prix :</span>
                  <span className="font-semibold text-neutral-900">
                    {plans.find(p => p.id === selectedPlan)?.price?.toLocaleString('fr-FR')} FCFA / mois
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-neutral-700">Moyen de paiement :</span>
                <span className="font-semibold text-neutral-900">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/hotellerie/dashboard')}
            className="px-8 py-3 bg-white border-2 border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
          >
            Retour au dashboard
          </button>
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || !selectedPaymentMethod || loading}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                S'abonner maintenant
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

