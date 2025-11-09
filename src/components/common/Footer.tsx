import { Link } from 'react-router-dom'
import {
  Home,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Home className="h-8 w-8 text-primary-500 group-hover:text-primary-400 transition-colors" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                ImmoKey
              </span>
            </Link>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              La plateforme digitale immobilière pour le Togo. Location, vente
              et gestion hôtelière simplifiées.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/recherche"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Recherche immobilière
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/hotellerie"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Solution Hôtelière
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/connexion"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Connexion
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/inscription"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Inscription
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              Informations légales
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/cgu"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Conditions d'utilisation
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/confidentialite"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Politique de confidentialité
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Politique des cookies
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/mentions-legales"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Mentions légales
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-neutral-400 hover:text-primary-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Contact
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              Contactez-nous
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start space-x-3 text-neutral-400">
                <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Lomé, Togo</span>
              </li>
              <li className="flex items-start space-x-3 text-neutral-400">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>+228 XX XX XX XX</span>
              </li>
              <li className="flex items-start space-x-3 text-neutral-400">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>contact@immokey.io</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-3">Newsletter</h4>
              <p className="text-neutral-400 text-sm mb-3">
                Restez informé de nos actualités
              </p>
              <form className="flex flex-col space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>S'abonner</span>
                  <Send className="h-4 w-4" />
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-neutral-500 text-sm text-center md:text-left">
              © {currentYear} ImmoKey. Tous droits réservés.
            </p>
            <p className="text-neutral-500 text-sm text-center md:text-right">
              Fait avec ❤️ au Togo
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
