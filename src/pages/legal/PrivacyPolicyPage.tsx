import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO
        title="Politique de Confidentialité - ImmoKey"
        description="Découvrez comment ImmoKey collecte, utilise et protège vos données personnelles."
      />
      <GoogleAnalytics />
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-8">Politique de Confidentialité</h1>
          <p className="text-sm text-neutral-500 mb-8">Dernière mise à jour : Novembre 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Introduction</h2>
            <p className="text-neutral-700 leading-relaxed">
              ImmoKey s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité
              explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Données Collectées</h2>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">2.1 Données Fournies par l'Utilisateur</h3>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2 mb-4">
              <li>Nom, prénom, adresse email, numéro de téléphone</li>
              <li>Informations de connexion (identifiant, mot de passe)</li>
              <li>Informations sur les biens immobiliers publiés</li>
              <li>Données de paiement (traitées de manière sécurisée par Stripe)</li>
            </ul>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">2.2 Données Collectées Automatiquement</h3>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>Adresse IP, type de navigateur, système d'exploitation</li>
              <li>Pages consultées, durée de visite, actions effectuées</li>
              <li>Cookies et technologies similaires</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Utilisation des Données</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">Nous utilisons vos données pour :</p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Fournir nos services (publication d'annonces, gestion locative, etc.)</li>
              <li>Traiter vos paiements et transactions</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Vous envoyer des notifications et communications importantes</li>
              <li>Prévenir la fraude et garantir la sécurité de la plateforme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Partage des Données</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">
              Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>
                <strong>Prestataires de services :</strong> Stripe (paiements), Supabase (hébergement), Resend
                (emails), Twilio (SMS/WhatsApp)
              </li>
              <li>
                <strong>Autorités légales :</strong> si la loi l'exige ou pour protéger nos droits
              </li>
              <li>
                <strong>Autres utilisateurs :</strong> informations des annonces publiées (nom, contact)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Conservation des Données</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services ou
              conformément aux obligations légales. Vous pouvez demander la suppression de vos données à tout
              moment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Sécurité des Données</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre
              tout accès non autorisé, perte ou destruction. Cela inclut :
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2 mt-3">
              <li>Chiffrement des données sensibles (SSL/TLS)</li>
              <li>Authentification sécurisée (hashage des mots de passe)</li>
              <li>Sauvegardes régulières</li>
              <li>Contrôles d'accès stricts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Vos Droits</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">Vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>
                <strong>Droit d'accès :</strong> obtenir une copie de vos données
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger vos données inexactes
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> demander la suppression de vos données
              </li>
              <li>
                <strong>Droit d'opposition :</strong> refuser le traitement de vos données
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré
              </li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-3">
              Pour exercer ces droits, contactez-nous à{' '}
              <a href="mailto:privacy@immokey.io" className="text-primary-600 hover:underline">
                privacy@immokey.io
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Cookies</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. Consultez notre{' '}
              <a href="/cookies" className="text-primary-600 hover:underline">
                Politique de Cookies
              </a>{' '}
              pour plus d'informations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Modifications</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications seront
              publiées sur cette page avec une date de mise à jour.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              Pour toute question relative à cette politique, contactez-nous à :{' '}
              <a href="mailto:privacy@immokey.io" className="text-primary-600 hover:underline">
                privacy@immokey.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </>
  )
}

