import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

export default function TermsOfServicePage() {
  return (
    <>
      <SEO
        title="Conditions Générales d'Utilisation - ImmoKey"
        description="Consultez les conditions générales d'utilisation de la plateforme ImmoKey."
      />
      <GoogleAnalytics />
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-8">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-sm text-neutral-500 mb-8">Dernière mise à jour : Novembre 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Objet</h2>
            <p className="text-neutral-700 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et
              conditions d'utilisation de la plateforme ImmoKey, accessible à l'adresse{' '}
              <a href="https://immokey.io" className="text-primary-600 hover:underline">
                immokey.io
              </a>
              , ainsi que les droits et obligations des utilisateurs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Définitions</h2>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>
                <strong>Plateforme :</strong> désigne le site web et l'application mobile ImmoKey.
              </li>
              <li>
                <strong>Utilisateur :</strong> toute personne physique ou morale utilisant la plateforme.
              </li>
              <li>
                <strong>Services :</strong> ensemble des fonctionnalités proposées par ImmoKey (annonces
                immobilières, gestion locative, gestion hôtelière).
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Acceptation des CGU</h2>
            <p className="text-neutral-700 leading-relaxed">
              L'utilisation de la plateforme ImmoKey implique l'acceptation pleine et entière des présentes CGU.
              En cas de désaccord avec l'une des clauses, l'utilisateur est invité à ne pas utiliser la plateforme.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Inscription et Compte Utilisateur</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">
              Pour accéder à certains services, l'utilisateur doit créer un compte en fournissant des informations
              exactes et à jour. L'utilisateur s'engage à :
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>Fournir des informations véridiques et complètes.</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion.</li>
              <li>Informer ImmoKey de toute utilisation non autorisée de son compte.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Services Proposés</h2>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">5.1 Annonces Immobilières</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              La publication et la consultation d'annonces immobilières sont gratuites. ImmoKey se réserve le droit
              de modérer ou supprimer toute annonce non conforme.
            </p>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">5.2 Services Payants</h3>
            <p className="text-neutral-700 leading-relaxed">
              Certains services (gestion locative, gestion hôtelière) sont soumis à un abonnement payant. Les
              tarifs sont indiqués sur la plateforme et peuvent être modifiés à tout moment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Obligations des Utilisateurs</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">L'utilisateur s'engage à :</p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2">
              <li>Utiliser la plateforme de manière loyale et conforme à sa destination.</li>
              <li>Ne pas diffuser de contenu illicite, diffamatoire ou portant atteinte aux droits de tiers.</li>
              <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Responsabilité</h2>
            <p className="text-neutral-700 leading-relaxed">
              ImmoKey s'efforce d'assurer la disponibilité et la sécurité de la plateforme. Toutefois, ImmoKey ne
              saurait être tenu responsable des dommages résultant d'une interruption de service, d'une perte de
              données ou de l'utilisation frauduleuse de la plateforme par un tiers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Propriété Intellectuelle</h2>
            <p className="text-neutral-700 leading-relaxed">
              Tous les éléments de la plateforme (textes, images, logos, code source) sont la propriété exclusive
              d'ImmoKey ou de ses partenaires. Toute reproduction ou utilisation non autorisée est interdite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Données Personnelles</h2>
            <p className="text-neutral-700 leading-relaxed">
              Les données personnelles des utilisateurs sont collectées et traitées conformément à notre{' '}
              <a href="/confidentialite" className="text-primary-600 hover:underline">
                Politique de Confidentialité
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Modification des CGU</h2>
            <p className="text-neutral-700 leading-relaxed">
              ImmoKey se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront
              informés des modifications majeures par email ou notification sur la plateforme.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">11. Droit Applicable et Juridiction</h2>
            <p className="text-neutral-700 leading-relaxed">
              Les présentes CGU sont régies par le droit togolais. En cas de litige, les tribunaux togolais seront
              seuls compétents.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">12. Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              Pour toute question relative aux présentes CGU, vous pouvez nous contacter à :{' '}
              <a href="mailto:contact@immokey.io" className="text-primary-600 hover:underline">
                contact@immokey.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </>
  )
}

