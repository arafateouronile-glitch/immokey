import SEO from '@/components/seo/SEO'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

export default function LegalNoticePage() {
  return (
    <>
      <SEO
        title="Mentions Légales - ImmoKey"
        description="Mentions légales et informations sur l'éditeur de la plateforme ImmoKey."
      />
      <GoogleAnalytics />
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-8">Mentions Légales</h1>
          <p className="text-sm text-neutral-500 mb-8">Dernière mise à jour : Novembre 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Éditeur de la Plateforme</h2>
            <div className="text-neutral-700 leading-relaxed space-y-2">
              <p>
                <strong>Nom de l'entreprise :</strong> ImmoKey
              </p>
              <p>
                <strong>Forme juridique :</strong> [À compléter - SARL, SARLU, etc.]
              </p>
              <p>
                <strong>Capital social :</strong> [À compléter]
              </p>
              <p>
                <strong>Siège social :</strong> Lomé, Togo
              </p>
              <p>
                <strong>Numéro d'immatriculation :</strong> [À compléter - RCCM]
              </p>
              <p>
                <strong>Email :</strong>{' '}
                <a href="mailto:contact@immokey.io" className="text-primary-600 hover:underline">
                  contact@immokey.io
                </a>
              </p>
              <p>
                <strong>Téléphone :</strong> +228 90 00 00 00
              </p>
              <p>
                <strong>Directeur de la publication :</strong> [À compléter]
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Hébergement</h2>
            <div className="text-neutral-700 leading-relaxed space-y-2">
              <p>
                <strong>Hébergeur web :</strong> Vercel Inc.
              </p>
              <p>
                <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA
              </p>
              <p>
                <strong>Site web :</strong>{' '}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  https://vercel.com
                </a>
              </p>
            </div>
            <div className="text-neutral-700 leading-relaxed space-y-2 mt-4">
              <p>
                <strong>Hébergeur base de données :</strong> Supabase Inc.
              </p>
              <p>
                <strong>Adresse :</strong> 970 Toa Payoh North, #07-04, Singapore 318992
              </p>
              <p>
                <strong>Site web :</strong>{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  https://supabase.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Propriété Intellectuelle</h2>
            <p className="text-neutral-700 leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, mise en page, etc.) est la
              propriété exclusive d'ImmoKey ou de ses partenaires. Toute reproduction, distribution, modification
              ou utilisation, même partielle, sans autorisation préalable écrite est strictement interdite et peut
              faire l'objet de poursuites judiciaires.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-3">
              Les marques, logos et noms commerciaux affichés sur ce site sont des marques déposées par ImmoKey ou
              des tiers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Protection des Données Personnelles</h2>
            <p className="text-neutral-700 leading-relaxed">
              Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification, de
              suppression et d'opposition aux données personnelles vous concernant. Pour exercer ces droits,
              veuillez consulter notre{' '}
              <a href="/confidentialite" className="text-primary-600 hover:underline">
                Politique de Confidentialité
              </a>{' '}
              ou nous contacter à{' '}
              <a href="mailto:privacy@immokey.io" className="text-primary-600 hover:underline">
                privacy@immokey.io
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Responsabilité</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">
              ImmoKey s'efforce de fournir des informations exactes et à jour sur la plateforme. Cependant, nous ne
              pouvons garantir l'exactitude, la complétude ou la pertinence des informations diffusées.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              ImmoKey ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation
              de la plateforme, notamment en cas d'interruption de service, de virus, de perte de données ou de
              tout autre incident.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Liens Hypertextes</h2>
            <p className="text-neutral-700 leading-relaxed">
              La plateforme peut contenir des liens vers des sites externes. ImmoKey n'exerce aucun contrôle sur le
              contenu de ces sites et décline toute responsabilité quant aux informations qui y sont diffusées.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Cookies</h2>
            <p className="text-neutral-700 leading-relaxed">
              La plateforme utilise des cookies pour améliorer votre expérience. Pour plus d'informations,
              consultez notre{' '}
              <a href="/cookies" className="text-primary-600 hover:underline">
                Politique de Cookies
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Droit Applicable</h2>
            <p className="text-neutral-700 leading-relaxed">
              Les présentes mentions légales sont régies par le droit togolais. Tout litige relatif à
              l'interprétation ou à l'exécution de ces mentions sera soumis aux tribunaux compétents du Togo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Crédits</h2>
            <div className="text-neutral-700 leading-relaxed space-y-2">
              <p>
                <strong>Conception et développement :</strong> ImmoKey Team
              </p>
              <p>
                <strong>Icônes :</strong> Lucide Icons (
                <a
                  href="https://lucide.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  lucide.dev
                </a>
                )
              </p>
              <p>
                <strong>Framework CSS :</strong> Tailwind CSS (
                <a
                  href="https://tailwindcss.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  tailwindcss.com
                </a>
                )
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              Pour toute question relative aux mentions légales, vous pouvez nous contacter :{' '}
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2 mt-3">
              <li>
                <strong>Email :</strong>{' '}
                <a href="mailto:contact@immokey.io" className="text-primary-600 hover:underline">
                  contact@immokey.io
                </a>
              </li>
              <li>
                <strong>Téléphone :</strong> +228 90 00 00 00
              </li>
              <li>
                <strong>Adresse :</strong> Lomé, Togo
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}

