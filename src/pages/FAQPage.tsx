import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'immobilier' | 'hospitality' | 'paiement'
}

const faqs: FAQItem[] = [
  // Général
  {
    category: 'general',
    question: "Qu'est-ce qu'ImmoKey ?",
    answer:
      "ImmoKey est une plateforme digitale complète pour l'immobilier et l'hôtellerie au Togo. Nous proposons des services de recherche d'annonces, de gestion locative et de gestion hôtelière, avec des outils modernes pour simplifier votre quotidien.",
  },
  {
    category: 'general',
    question: 'Comment créer un compte ?',
    answer:
      "Cliquez sur 'Inscription' en haut de la page, remplissez le formulaire avec vos informations et confirmez votre email. Vous pourrez ensuite accéder à tous nos services.",
  },
  {
    category: 'general',
    question: 'ImmoKey est-il gratuit ?',
    answer:
      "La recherche et publication d'annonces immobilières de base sont gratuites. Les services premium (gestion locative, gestion hôtelière) sont payants avec des essais gratuits disponibles.",
  },

  // Immobilier
  {
    category: 'immobilier',
    question: 'Comment publier une annonce ?',
    answer:
      "Connectez-vous à votre compte, cliquez sur 'Publier une annonce', remplissez les détails de votre bien (type, prix, localisation, photos) et validez. Votre annonce sera visible immédiatement.",
  },
  {
    category: 'immobilier',
    question: 'Quels types de biens puis-je publier ?',
    answer:
      "Vous pouvez publier des appartements, maisons, villas, terrains, bureaux, commerces, et plus encore. Chaque type de bien a des champs spécifiques adaptés.",
  },
  {
    category: 'immobilier',
    question: "Qu'est-ce que la gestion locative ?",
    answer:
      "Notre service de gestion locative vous permet de gérer vos biens, locataires, paiements et documents en un seul endroit. Idéal pour les propriétaires avec plusieurs biens à gérer.",
  },

  // Hôtellerie
  {
    category: 'hospitality',
    question: "C'est quoi ImmoKey Hospitality ?",
    answer:
      "ImmoKey Hospitality est notre solution complète de gestion hôtelière. Elle vous permet de gérer vos établissements, chambres, réservations, revenus et clients avec des outils modernes et intuitifs.",
  },
  {
    category: 'hospitality',
    question: "Y a-t-il un essai gratuit pour l'hôtellerie ?",
    answer:
      "Oui ! Nous offrons un essai gratuit de 14 jours pour tous nos plans hôteliers. Aucune carte bancaire requise pour commencer.",
  },
  {
    category: 'hospitality',
    question: 'Quels sont les tarifs pour ImmoKey Hospitality ?',
    answer:
      "Nous proposons 3 plans : Starter (9 900 FCFA/mois), Professionnel (20 000 FCFA/mois) et Entreprise (sur devis). Chaque plan inclut des fonctionnalités adaptées à la taille de votre établissement.",
  },

  // Paiement
  {
    category: 'paiement',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      "Nous acceptons les cartes bancaires (Visa, Mastercard) et le Mobile Money (TMoney, Flooz). Tous les paiements sont sécurisés via Stripe.",
  },
  {
    category: 'paiement',
    question: 'Mes paiements sont-ils sécurisés ?',
    answer:
      "Oui, absolument ! Nous utilisons Stripe, une plateforme de paiement reconnue mondialement, avec un cryptage de niveau bancaire pour toutes les transactions.",
  },
  {
    category: 'paiement',
    question: 'Puis-je annuler mon abonnement ?',
    answer:
      "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Vous continuerez à avoir accès aux services jusqu'à la fin de votre période de facturation.",
  },
]

const categories = {
  general: { label: 'Général', icon: '🌐' },
  immobilier: { label: 'Immobilier', icon: '🏠' },
  hospitality: { label: 'Hôtellerie', icon: '🏨' },
  paiement: { label: 'Paiement', icon: '💳' },
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filteredFAQs = faqs.filter((faq) => faq.category === selectedCategory)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <SEO
        title="FAQ - ImmoKey"
        description="Trouvez des réponses à vos questions sur ImmoKey : immobilier, gestion locative, hôtellerie, paiements et plus encore."
      />
      <GoogleAnalytics />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <HelpCircle className="h-16 w-16 text-primary-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-neutral-900 mb-4">Foire Aux Questions</h1>
            <p className="text-lg text-neutral-600">
              Trouvez rapidement des réponses à vos questions les plus fréquentes.
            </p>
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(categories).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === key
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Liste des FAQ */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
            {filteredFAQs.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                Aucune question trouvée dans cette catégorie.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="p-6">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-start justify-between text-left focus:outline-none"
                    >
                      <span className="text-lg font-semibold text-neutral-900 pr-4">{faq.question}</span>
                      {openIndex === index ? (
                        <ChevronUp className="h-6 w-6 text-primary-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-neutral-400 flex-shrink-0" />
                      )}
                    </button>
                    {openIndex === index && (
                      <div className="mt-4 text-neutral-600 leading-relaxed animate-fade-in">{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Contact */}
          <div className="mt-12 bg-primary-50 rounded-xl p-8 text-center border border-primary-100">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Vous n'avez pas trouvé de réponse ?
            </h2>
            <p className="text-neutral-600 mb-6">
              Notre équipe est là pour vous aider ! Contactez-nous et nous vous répondrons rapidement.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

