import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Home,
  Hotel,
  FileText,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6"
              variants={fadeInUp}
            >
              Trouvez votre logement idéal
              <span className="block text-primary-600 mt-2 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                au Togo
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              La plateforme digitale immobilière pour la location, la vente et
              la gestion hôtelière
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              variants={fadeInUp}
            >
              <Link
                to="/recherche"
                className="group inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Rechercher un logement
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/hotellerie"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                <Hotel className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Solution Hôtelière
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                  500+
                </div>
                <div className="text-sm text-neutral-600">Annonces</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                  50+
                </div>
                <div className="text-sm text-neutral-600">
                  Hôtels partenaires
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                  1000+
                </div>
                <div className="text-sm text-neutral-600">Utilisateurs</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 mb-4">
              Nos Services
            </h2>
            <p className="text-center text-neutral-600 mb-16 text-lg max-w-2xl mx-auto">
              Une plateforme complète pour tous vos besoins immobiliers et
              hôteliers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                title: 'Location & Vente',
                description:
                  "Trouvez votre appartement, maison ou terrain idéal parmi des centaines d'annonces vérifiées",
                features: [
                  'Annonces vérifiées',
                  'Visite virtuelle',
                  'Contact direct',
                ],
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: Hotel,
                title: 'Gestion Hôtelière',
                description:
                  'Solution complète pour gérer vos établissements, chambres et réservations',
                features: [
                  'Dashboard complet',
                  'Réservations en ligne',
                  'Statistiques',
                ],
                color: 'from-primary-500 to-primary-600',
              },
              {
                icon: FileText,
                title: 'Gestion Locative',
                description:
                  'Gérez vos biens, locataires et paiements en toute simplicité',
                features: ['Suivi des paiements', 'Documents', 'Rappels auto'],
                color: 'from-green-500 to-green-600',
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-sm text-neutral-700"
                    >
                      <CheckCircle className="h-4 w-4 text-primary-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Star className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui ont déjà trouvé leur
              bonheur avec ImmoKey
            </p>
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-neutral-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Créer un compte gratuit
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
