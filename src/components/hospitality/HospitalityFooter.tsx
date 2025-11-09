import { Link } from 'react-router-dom'
import { Hotel, Mail, Phone, MapPin } from 'lucide-react'

export default function HospitalityFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Hotel className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">ImmoKey Hospitality</span>
            </div>
            <p className="text-neutral-400 mb-4">
              Solution complète de gestion hôtelière pour les professionnels de l'hébergement au Togo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/hotellerie" className="hover:text-primary-400 transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link to="/hotellerie/inscription" className="hover:text-primary-400 transition-colors">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:hospitality@immokey.io" className="hover:text-primary-400 transition-colors">
                  hospitality@immokey.io
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+228 XX XX XX XX</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Lomé, Togo</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">
            © {currentYear} ImmoKey Hospitality. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/cgu" className="text-neutral-500 hover:text-primary-400 text-sm transition-colors">
              CGU
            </Link>
            <Link to="/confidentialite" className="text-neutral-500 hover:text-primary-400 text-sm transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

