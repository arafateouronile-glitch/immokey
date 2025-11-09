import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Home, Bed, Bath, Maximize, Heart, Share2,
  Calendar, User, Phone, Mail, MessageSquare, Check, X,
  Wifi, Tv, Wind, Car, Shield, Zap, ChevronLeft, ChevronRight,
  Star, MapPinned, Building2, DollarSign, FileText, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/seo/SEO'

// Mock data - à remplacer par des vraies données
const mockListing = {
  id: '1',
  title: 'Appartement Moderne avec Vue Panoramique',
  type: 'Appartement',
  price: 250000,
  location: 'Lomé, Tokoin',
  bedrooms: 3,
  bathrooms: 2,
  area: 120,
  description: `Magnifique appartement moderne situé dans le quartier prisé de Tokoin. Cet espace lumineux et spacieux offre une vue panoramique exceptionnelle sur la ville.

L'appartement dispose de finitions haut de gamme, d'une cuisine entièrement équipée et d'espaces de rangement généreux. Idéalement situé à proximité des commerces, écoles et transports en commun.

Parfait pour une famille ou des professionnels recherchant confort et praticité dans un environnement moderne et sécurisé.`,
  features: [
    'Climatisation centrale',
    'Cuisine équipée',
    'Parking sécurisé',
    'Ascenseur',
    'Balcon',
    'Connexion internet',
    'Gardien 24/7',
    'Espace vert',
  ],
  amenities: [
    { icon: Wifi, label: 'WiFi' },
    { icon: Tv, label: 'TV câble' },
    { icon: Wind, label: 'Climatisation' },
    { icon: Car, label: 'Parking' },
    { icon: Shield, label: 'Sécurité' },
    { icon: Zap, label: 'Générateur' },
  ],
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
  ],
  owner: {
    name: 'Jean Dupont',
    phone: '+228 90 00 00 00',
    email: 'contact@immokey.tg',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=0D8ABC&color=fff',
  },
  stats: {
    views: 1234,
    favorites: 45,
    inquiries: 12,
  },
  publishedDate: '2024-01-15',
  reference: 'IMK-2024-001'
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? mockListing.images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === mockListing.images.length - 1 ? 0 : prev + 1
    )
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Lien copié dans le presse-papier')
  }

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Votre message a été envoyé avec succès !')
    setShowContactForm(false)
    setContactForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <>
      <SEO
        title={`${mockListing.title} | ImmoKey`}
        description={mockListing.description.substring(0, 160)}
      />

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
        {/* Blobs animés */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-10 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-80 h-80 bg-green-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux annonces
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Galerie d'images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="relative h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={mockListing.images[currentImageIndex]}
                      alt={mockListing.title}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {/* Navigation images */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleFavorite}
                      className={`w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-colors ${
                        isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 text-neutral-700 hover:bg-white'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                    >
                      <Share2 className="h-5 w-5" />
                    </motion.button>
                  </div>

                  {/* Compteur d'images */}
                  <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                    <Camera className="inline h-4 w-4 mr-2" />
                    {currentImageIndex + 1} / {mockListing.images.length}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="p-4 bg-neutral-50 flex gap-2 overflow-x-auto">
                  {mockListing.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary-600 shadow-lg'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Détails */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        {mockListing.title}
                      </h1>
                      <div className="flex items-center text-neutral-600 mb-2">
                        <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                        <span className="text-lg">{mockListing.location}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Réf: {mockListing.reference}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(mockListing.publishedDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-primary-600">
                        {mockListing.price.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">Prix demandé</p>
                    </div>
                  </div>

                  {/* Caractéristiques */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl">
                    <div className="text-center">
                      <Bed className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">{mockListing.bedrooms}</p>
                      <p className="text-sm text-neutral-600">Chambres</p>
                    </div>
                    <div className="text-center">
                      <Bath className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">{mockListing.bathrooms}</p>
                      <p className="text-sm text-neutral-600">Salles de bain</p>
                    </div>
                    <div className="text-center">
                      <Maximize className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">{mockListing.area}</p>
                      <p className="text-sm text-neutral-600">m²</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t pt-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Description</h2>
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                    {mockListing.description}
                  </p>
                </div>

                {/* Équipements */}
                <div className="border-t pt-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Équipements</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mockListing.amenities.map((amenity, index) => {
                      const Icon = amenity.icon
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg"
                        >
                          <Icon className="h-5 w-5 text-primary-600" />
                          <span className="font-medium text-neutral-700">{amenity.label}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="border-t pt-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Caractéristiques</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mockListing.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-neutral-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact du propriétaire */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
              >
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Contact</h3>
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={mockListing.owner.avatar}
                    alt={mockListing.owner.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-bold text-neutral-900">{mockListing.owner.name}</p>
                    <p className="text-sm text-neutral-600">Propriétaire</p>
                  </div>
                </div>

                {!showContactForm ? (
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowContactForm(true)}
                      className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Envoyer un message
                    </motion.button>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`tel:${mockListing.owner.phone}`}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="h-5 w-5" />
                      Appeler
                    </motion.a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Votre email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Votre téléphone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Votre message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Envoyer
                      </button>
                    </div>
                  </form>
                )}

                {/* Stats */}
                <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{mockListing.stats.views}</p>
                    <p className="text-xs text-neutral-600">Vues</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{mockListing.stats.favorites}</p>
                    <p className="text-xs text-neutral-600">Favoris</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{mockListing.stats.inquiries}</p>
                    <p className="text-xs text-neutral-600">Demandes</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
