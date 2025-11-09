import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Check, Hotel, Calendar, Users, TrendingUp, Globe, Shield, Zap, 
  ArrowRight, Star, BarChart3, Bell, CreditCard, Smartphone, Lock,
  HeadphonesIcon, Sparkles, CheckCircle2
} from 'lucide-react'
import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import HospitalityFooter from '@/components/hospitality/HospitalityFooter'

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 transition-all"
  >
    <motion.div
      whileHover={{ rotate: 10, scale: 1.1 }}
      className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl mb-4 shadow-lg"
    >
      {icon}
    </motion.div>
    <h3 className="text-xl font-bold text-neutral-900 mb-3">{title}</h3>
    <p className="text-neutral-600 leading-relaxed">{description}</p>
  </motion.div>
)

export default function HospitalityLandingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '9 900',
      currency: 'FCFA',
      period: 'mois',
      features: [
        '1 établissement',
        'Jusqu\'à 10 chambres',
        'Réservations illimitées',
        'Gestion des clients',
        'Statistiques de base',
        'Support email',
      ],
      cta: 'Commencer l\'essai gratuit',
      highlighted: false,
      gradient: 'from-gray-500 to-gray-600',
    },
    {
      name: 'Professionnel',
      price: '20 000',
      currency: 'FCFA',
      period: 'mois',
      features: [
        '3 établissements',
        'Chambres illimitées',
        'Réservations illimitées',
        'Gestion avancée des clients',
        'Statistiques détaillées',
        'Multi-devises',
        'Support prioritaire',
        'WhatsApp & SMS',
      ],
      cta: 'Commencer l\'essai gratuit',
      highlighted: true,
      gradient: 'from-primary-500 to-blue-600',
    },
    {
      name: 'Entreprise',
      price: 'Sur devis',
      currency: '',
      period: '',
      features: [
        'Établissements illimités',
        'Chambres illimitées',
        'API personnalisée',
        'Intégrations sur mesure',
        'Gestionnaire de compte dédié',
        'Formation sur site',
        'Support 24/7',
        'Rapports personnalisés',
      ],
      cta: 'Nous contacter',
      highlighted: false,
      gradient: 'from-purple-500 to-indigo-600',
    },
  ]

  return (
    <>
      <SEO
        title="ImmoKey Hospitality - Gestion Hôtelière Digitale au Togo"
        description="Solution complète de gestion hôtelière pour le Togo. Gérez vos établissements, chambres, réservations et revenus. Essai gratuit de 14 jours."
      />
      <GoogleAnalytics />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
        {/* Blobs animés en arrière-plan */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 100, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 right-1/4 w-96 h-96 bg-green-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 30, repeat: Infinity }}
          />
        </div>

        {/* Header avec animation */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Hotel className="h-8 w-8 text-primary-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                ImmoKey Hospitality
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/hotellerie/connexion" className="text-neutral-700 hover:text-primary-600 font-medium">
                  Connexion
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/hotellerie/inscription"
                  className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-xl font-medium transition-all"
                >
                  Essai Gratuit 14 jours
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section avec animations */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg mb-6"
              >
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Nouveau : Intégration WhatsApp Business</span>
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 leading-tight mb-6">
                La Solution Hôtelière
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                  Pensée pour l'Afrique
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Gérez vos établissements, chambres et réservations en toute simplicité. Optimisé pour les hôtels, 
              auberges et résidences au Togo et en Afrique de l'Ouest.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/hotellerie/inscription"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl hover:shadow-2xl transition-all"
                >
                  Commencer Gratuitement <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/hotellerie/connexion"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white rounded-xl hover:bg-neutral-50 transition-all border-2 border-primary-600"
                >
                  Déjà client ? Se connecter
                </Link>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-sm text-neutral-500 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Essai gratuit de 14 jours
              <span>•</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Aucune carte bancaire requise
              <span>•</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Annulation à tout moment
            </motion.p>

            {/* Stats animées */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { value: '500+', label: 'Établissements' },
                { value: '10K+', label: 'Réservations/mois' },
                { value: '98%', label: 'Satisfaction' },
                { value: '24/7', label: 'Support' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section avec animations */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-xl text-neutral-600">
                Une plateforme complète pour optimiser votre gestion hôtelière
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Hotel className="h-8 w-8 text-white" />}
                title="Gestion Multi-Établissements"
                description="Gérez plusieurs hôtels, auberges ou résidences depuis une seule plateforme."
              />
              <FeatureCard
                icon={<Calendar className="h-8 w-8 text-white" />}
                title="Réservations en Temps Réel"
                description="Suivez vos réservations en direct avec un calendrier interactif et intuitif."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-white" />}
                title="Gestion des Clients"
                description="Centralisez toutes les informations de vos clients pour un service personnalisé."
              />
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8 text-white" />}
                title="Statistiques Avancées"
                description="Analysez vos performances avec des tableaux de bord détaillés et en temps réel."
              />
              <FeatureCard
                icon={<Globe className="h-8 w-8 text-white" />}
                title="Multi-Devises"
                description="Acceptez les paiements en FCFA, EUR, USD et autres devises principales."
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-white" />}
                title="Sécurité Renforcée"
                description="Vos données sont protégées avec un chiffrement de niveau bancaire."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-white" />}
                title="Automatisation Intelligente"
                description="Automatisez vos tâches répétitives et gagnez un temps précieux."
              />
              <FeatureCard
                icon={<Smartphone className="h-8 w-8 text-white" />}
                title="Application Mobile"
                description="Gérez votre établissement depuis votre smartphone iOS ou Android."
              />
              <FeatureCard
                icon={<HeadphonesIcon className="h-8 w-8 text-white" />}
                title="Support Expert"
                description="Notre équipe est disponible 7j/7 pour vous accompagner."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section avec animations */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-green-50 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
                Choisissez votre plan
              </h2>
              <p className="text-xl text-neutral-600">
                Des tarifs transparents adaptés à la taille de votre établissement
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: plan.highlighted ? -10 : -5, scale: plan.highlighted ? 1.02 : 1 }}
                  className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                    plan.highlighted ? 'ring-4 ring-primary-500 scale-105' : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-blue-600 text-white px-6 py-2 text-sm font-bold rounded-bl-xl">
                      ⭐ POPULAIRE
                    </div>
                  )}
                  
                  <div className={`bg-gradient-to-br ${plan.gradient} p-8 text-white`}>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      {plan.price === 'Sur devis' ? (
                        <span className="text-4xl font-bold">{plan.price}</span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold">{plan.price}</span>
                          <span className="text-lg opacity-90">{plan.currency}</span>
                          <span className="text-sm opacity-75">/ {plan.period}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-neutral-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={plan.name === 'Entreprise' ? '/contact' : '/hotellerie/inscription'}
                        className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                          plan.highlighted
                            ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final avec animation */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 via-blue-600 to-green-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à transformer votre gestion hôtelière ?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Rejoignez des centaines d'établissements qui ont choisi ImmoKey Hospitality
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/hotellerie/inscription"
                className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-primary-600 bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-all"
              >
                Démarrer l'essai gratuit maintenant
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>

      <HospitalityFooter />
    </>
  )
}
