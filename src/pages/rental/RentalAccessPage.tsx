import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Shield,
  FileText,
  Users,
  CreditCard,
  Home,
  TrendingUp,
  Clock,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const RentalAccessPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hasAccepted, setHasAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    checkRentalAccess()
  }, [user])

  const checkRentalAccess = async () => {
    if (!user) {
      setCheckingAccess(false)
      return
    }

    try {
      // Vérifier si l'utilisateur a déjà accès à la gestion locative
      const { data, error } = await supabase
        .from('user_profiles')
        .select('rental_access, rental_accepted_at')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data?.rental_access) {
        setHasAccess(true)
        // Rediriger automatiquement vers le dashboard gestion locative
        setTimeout(() => navigate('/gestion-locative/dashboard'), 1000)
      }
    } catch (error) {
      console.error('Error checking rental access:', error)
    } finally {
      setCheckingAccess(false)
    }
  }

  const handleSubscribe = async () => {
    if (!hasAccepted) {
      return
    }

    setIsLoading(true)

    try {
      // Mettre à jour le profil utilisateur pour activer l'accès
      const { error } = await supabase
        .from('user_profiles')
        .update({
          rental_access: true,
          rental_accepted_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (error) throw error

      // Rediriger vers le dashboard gestion locative
      setTimeout(() => {
        navigate('/gestion-locative/dashboard')
      }, 500)
    } catch (error) {
      console.error('Error subscribing to rental management:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-green-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Building2 className="h-8 w-8 animate-pulse text-primary-600" />
          </div>
          <p className="text-lg font-medium text-gray-700">Vérification des accès...</p>
        </motion.div>
      </div>
    )
  }

  if (hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-green-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-lg font-medium text-gray-700">Redirection vers votre espace...</p>
        </motion.div>
      </div>
    )
  }

  const features = [
    {
      icon: Home,
      title: 'Gestion de Propriétés',
      description: 'Gérez tous vos biens locatifs depuis une seule interface',
    },
    {
      icon: Users,
      title: 'Suivi des Locataires',
      description: 'Gérez vos locataires, contrats et communications',
    },
    {
      icon: CreditCard,
      title: 'Gestion des Paiements',
      description: 'Suivez les loyers, quittances et rappels automatiques',
    },
    {
      icon: FileText,
      title: 'Documents Centralisés',
      description: 'Tous vos documents au même endroit',
    },
    {
      icon: TrendingUp,
      title: 'Statistiques & Rapports',
      description: 'Analyse de rentabilité et tableaux de bord détaillés',
    },
    {
      icon: Clock,
      title: 'Rappels Automatiques',
      description: 'Alertes pour les échéances et tâches importantes',
    },
  ]

  const conditions = [
    "Je confirme être propriétaire d'un ou plusieurs biens immobiliers destinés à la location",
    'Je comprends que la plateforme est conçue pour la gestion locative professionnelle',
    "J'accepte de fournir les documents nécessaires pour la vérification de propriété",
    "Je m'engage à respecter les conditions générales d'utilisation du service",
    'Je comprends que certaines fonctionnalités avancées peuvent nécessiter un abonnement',
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-white to-green-50">
      {/* Blobs animés */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-green-200/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12">
        {/* Bouton retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/profil')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au profil
          </button>
        </motion.div>

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-green-600 shadow-2xl">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent md:text-5xl">
            Gestion Locative Professionnelle
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Simplifiez la gestion de vos biens locatifs avec notre plateforme complète
          </p>
        </motion.div>

        {/* Fonctionnalités */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-green-100">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Conditions et Souscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-3xl"
        >
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-primary-600 to-green-600 p-8 text-white">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Conditions d'Accès</h2>
              </div>
              <p className="mt-2 text-primary-100">
                Veuillez lire attentivement et accepter les conditions suivantes
              </p>
            </div>

            <div className="p-8">
              <div className="mb-8 space-y-4">
                {conditions.map((condition, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex gap-3"
                  >
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                    <p className="text-gray-700">{condition}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6 rounded-2xl bg-amber-50 p-6 border border-amber-200"
              >
                <div className="flex gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Important</h4>
                    <p className="text-sm text-amber-800">
                      L'accès à la gestion locative est réservé aux propriétaires. Une vérification
                      de vos documents de propriété pourra être demandée ultérieurement pour garantir
                      la sécurité de la plateforme.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.label
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-6 flex cursor-pointer items-start gap-3 rounded-xl border-2 border-gray-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <input
                  type="checkbox"
                  checked={hasAccepted}
                  onChange={(e) => setHasAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="flex-1 font-medium text-gray-900">
                  J'ai lu et j'accepte toutes les conditions ci-dessus. Je confirme être propriétaire
                  et souhaite accéder à la gestion locative.
                </span>
              </motion.label>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={hasAccepted ? { scale: 1.02 } : {}}
                whileTap={hasAccepted ? { scale: 0.98 } : {}}
                onClick={handleSubscribe}
                disabled={!hasAccepted || isLoading}
                className={`w-full rounded-xl py-4 font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  hasAccepted
                    ? 'bg-gradient-to-r from-primary-600 to-green-600 hover:shadow-xl'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Activation en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Activer la Gestion Locative</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RentalAccessPage

