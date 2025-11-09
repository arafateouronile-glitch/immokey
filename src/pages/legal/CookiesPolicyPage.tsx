import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

export default function CookiesPolicyPage() {
  return (
    <>
      <SEO
        title="Politique de Cookies - ImmoKey"
        description="Découvrez comment ImmoKey utilise les cookies pour améliorer votre expérience."
      />
      <GoogleAnalytics />
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-8">Politique de Cookies</h1>
          <p className="text-sm text-neutral-500 mb-8">Dernière mise à jour : Novembre 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Qu'est-ce qu'un Cookie ?</h2>
            <p className="text-neutral-700 leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette)
              lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et
              préférences (connexion, langue, taille de police, etc.) pour améliorer votre expérience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Pourquoi Utilisons-nous des Cookies ?</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">
              ImmoKey utilise des cookies pour plusieurs raisons :
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>Assurer le bon fonctionnement de la plateforme</li>
              <li>Mémoriser vos préférences de connexion</li>
              <li>Analyser l'utilisation de notre site (statistiques)</li>
              <li>Améliorer votre expérience utilisateur</li>
              <li>Sécuriser votre compte et prévenir la fraude</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Types de Cookies Utilisés</h2>

            <h3 className="text-xl font-semibold text-neutral-800 mb-2">3.1 Cookies Strictement Nécessaires</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Ces cookies sont indispensables au fonctionnement de la plateforme. Ils permettent la navigation, la
              connexion à votre compte et l'accès aux zones sécurisées. Sans ces cookies, certains services ne
              peuvent pas être fournis.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>Exemples :</strong> session utilisateur, authentification, sécurité
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mb-2">3.2 Cookies de Performance</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Ces cookies collectent des informations sur la façon dont vous utilisez notre site (pages visitées,
              durée, erreurs rencontrées). Ils nous aident à améliorer les performances de la plateforme.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>Exemples :</strong> Google Analytics
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mb-2">3.3 Cookies de Fonctionnalité</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Ces cookies permettent de mémoriser vos choix (langue, région, favoris) pour vous offrir une
              expérience personnalisée.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>Exemples :</strong> préférences de langue, thème d'affichage
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mb-2">3.4 Cookies Publicitaires</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <em>
                Actuellement, ImmoKey n'utilise pas de cookies publicitaires. Si cela change à l'avenir, vous serez
                informé et pourrez donner votre consentement.
              </em>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Durée de Conservation</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">Les cookies ont des durées de vie variables :</p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>
                <strong>Cookies de session :</strong> supprimés à la fermeture du navigateur
              </li>
              <li>
                <strong>Cookies persistants :</strong> conservés jusqu'à leur date d'expiration (généralement 1 à
                12 mois)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Gestion des Cookies</h2>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">5.1 Via votre Navigateur</h3>
            <p className="text-neutral-700 leading-relaxed mb-3">
              Vous pouvez configurer votre navigateur pour accepter, refuser ou supprimer les cookies :
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>
                <strong>Google Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies
              </li>
              <li>
                <strong>Firefox :</strong> Paramètres &gt; Vie privée et sécurité &gt; Cookies et données de sites
              </li>
              <li>
                <strong>Safari :</strong> Préférences &gt; Confidentialité
              </li>
              <li>
                <strong>Edge :</strong> Paramètres &gt; Confidentialité, recherche et services
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mb-2 mt-6">5.2 Via notre Plateforme</h3>
            <p className="text-neutral-700 leading-relaxed">
              Lors de votre première visite, une bannière vous permet d'accepter ou de refuser les cookies non
              essentiels. Vous pouvez modifier vos préférences à tout moment dans les paramètres de votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Cookies Tiers</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">
              Certains de nos partenaires peuvent déposer des cookies sur votre appareil :
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>
                <strong>Google Analytics :</strong> analyse d'audience (anonymisée)
              </li>
              <li>
                <strong>Stripe :</strong> traitement sécurisé des paiements
              </li>
              <li>
                <strong>Supabase :</strong> authentification et stockage des données
              </li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-3">
              Ces partenaires ont leurs propres politiques de cookies. Nous vous invitons à les consulter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Conséquences du Refus des Cookies</h2>
            <p className="text-neutral-700 leading-relaxed">
              Si vous refusez les cookies, certaines fonctionnalités de la plateforme peuvent ne pas fonctionner
              correctement (connexion automatique, préférences enregistrées, etc.). Les cookies strictement
              nécessaires ne peuvent pas être désactivés.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Modifications</h2>
            <p className="text-neutral-700 leading-relaxed">
              Cette politique de cookies peut être modifiée à tout moment. La version en vigueur sera toujours
              disponible sur cette page avec la date de dernière mise à jour.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              Pour toute question sur notre utilisation des cookies, contactez-nous à :{' '}
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

