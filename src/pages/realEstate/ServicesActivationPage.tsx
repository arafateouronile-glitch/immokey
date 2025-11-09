import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Users,
  Check,
  X,
  CreditCard,
  Smartphone,
  AlertCircle,
  Info,
} from 'lucide-react'
import { RealEstateServices } from '@/services/realEstate/realEstateService'
import { PaymentService } from '@/services/hospitality/paymentService'
import toast from 'react-hot-toast'

type ServiceType = 'secure_payment' | 'tenant_management'
type PaymentMethod = 'card' | 'moov' | 'flooz'

const serviceInfo = {
  secure_payment: {
    name: 'Paiement sécurisé',
    icon: Shield,
    description: 'Sécurisez vos transactions avec un système de détention de fonds',
    benefits: [
      'Protection des deux parties',
      'Détention des fonds jusqu\'à confirmation',
      'Remboursement en cas de litige',
      'Commission de 5% sur les ventes (particuliers)',
    ],
  },
  tenant_management: {
    name: 'Gestion locative',
    icon: Users,
    description: 'Gérez vos locataires et recevez vos loyers automatiquement',
    benefits: [
      'Suivi des paiements de loyer',
      'Rappels automatiques',
      'Gestion des contrats',
      'Commission de 5% sur chaque loyer',
    ],
  },
}

export default function ServicesActivationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  })

  // Récupérer les services actifs
  const { data: activeServices } = useQuery({
    queryKey: ['real-estate-services'],
    queryFn: () => RealEstateServices.getUserServices(),
  })

  // Récupérer les services disponibles
  const { data: availableServices } = useQuery({
    queryKey: ['available-services'],
    queryFn: () => RealEstateServices.getAvailableServices(),
  })

  // Mutation pour activer un service
  const activateMutation = useMutation({
    mutationFn: async (data: {
      serviceType: ServiceType
      paymentMethod: PaymentMethod
      paymentReference: string
    }) => {
      // TODO: Intégrer avec le système de paiement réel
      // Pour l'instant, on simule
      const paymentReference = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return RealEstateServices.activateService({
        listingId: undefined, // Service global
        serviceType: data.serviceType,
        paymentMethod: data.paymentMethod,
        paymentReference,
      })
    },
    onSuccess: () => {
      toast.success('Service activé avec succès !')
      queryClient.invalidateQueries({ queryKey: ['real-estate-services'] })
      setSelectedService(null)
      setSelectedPaymentMethod(null)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'activation du service')
    },
  })

  const handleActivate = async () => {
    if (!selectedService || !selectedPaymentMethod) {
      toast.error('Veuillez sélectionner un service et un moyen de paiement')
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

    // TODO: Traiter le paiement réel
    // Pour l'instant, on simule
    activateMutation.mutate({
      serviceType: selectedService,
      paymentMethod: selectedPaymentMethod,
      paymentReference: `ref_${Date.now()}`,
    })
  }

  const isServiceActive = (serviceType: ServiceType) => {
    return activeServices?.some(
      (s) => s.service_type === serviceType && s.status === 'active'
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Services payants</h1>
          <p className="mt-2 text-neutral-600">
            Activez des services supplémentaires pour améliorer votre expérience
          </p>
        </div>

        {/* Info pour professionnels */}
        {availableServices && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Information importante
                </h3>
                <p className="text-sm text-blue-700">
                  Les professionnels bénéficient automatiquement de ces services avec commission.
                  Les particuliers peuvent les activer optionnellement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des services */}
        <div className="space-y-6 mb-8">
          {Object.entries(serviceInfo).map(([key, info]) => {
            const Icon = info.icon
            const serviceType = key as ServiceType
            const isActive = isServiceActive(serviceType)

            return (
              <div
                key={key}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                  isActive
                    ? 'border-green-500 bg-green-50/50'
                    : selectedService === serviceType
                    ? 'border-primary-500'
                    : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-green-100' : 'bg-primary-100'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isActive ? 'text-green-600' : 'text-primary-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-neutral-900">
                          {info.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-600">{info.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                    Avantages :
                  </h4>
                  <ul className="space-y-1">
                    {info.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!isActive && (
                  <button
                    onClick={() => setSelectedService(serviceType)}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedService === serviceType
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {selectedService === serviceType ? 'Sélectionné' : 'Activer ce service'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Formulaire de paiement */}
        {selectedService && !isServiceActive(selectedService) && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
              Choisissez votre moyen de paiement
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { id: 'card' as PaymentMethod, name: 'Carte bancaire', icon: CreditCard },
                { id: 'moov' as PaymentMethod, name: 'Moov Money', icon: Smartphone },
                { id: 'flooz' as PaymentMethod, name: 'Flooz', icon: Smartphone },
              ].map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mb-2 ${
                        selectedPaymentMethod === method.id
                          ? 'text-primary-600'
                          : 'text-neutral-400'
                      }`}
                    />
                    <p className="font-medium text-neutral-900">{method.name}</p>
                  </div>
                )
              })}
            </div>

            {/* Formulaire selon la méthode */}
            {selectedPaymentMethod === 'card' && (
              <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
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
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
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
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
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
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedPaymentMethod === 'moov' || selectedPaymentMethod === 'flooz') && (
              <div className="p-4 bg-neutral-50 rounded-lg">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Numéro de téléphone {selectedPaymentMethod === 'moov' ? 'Moov' : 'Flooz'}
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  placeholder="+228 XX XX XX XX"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Format: +228 suivi de 8 chiffres (ex: +22890123456)
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setSelectedService(null)
                  setSelectedPaymentMethod(null)
                }}
                className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleActivate}
                disabled={activateMutation.isPending}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activateMutation.isPending ? 'Activation...' : 'Activer le service'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

