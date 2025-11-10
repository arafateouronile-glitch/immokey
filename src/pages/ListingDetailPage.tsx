import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Home,
  Bed,
  Bath,
  Maximize,
  Heart,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MessageSquare,
  Check,
  Wifi,
  Tv,
  Wind,
  Car,
  Shield,
  Zap,
  Camera,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/seo/SEO'
import { useListing } from '@/hooks/useListings'

const fallbackImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'

const amenityIconMap: Record<string, typeof Wifi> = {
  wifi: Wifi,
  internet: Wifi,
  fibre: Wifi,
  tv: Tv,
  television: Tv,
  climatiseur: Wind,
  climatisation: Wind,
  ventilation: Wind,
  parking: Car,
  garage: Car,
  securite: Shield,
  gardien: Shield,
  electricite: Zap,
  groupe: Zap,
}

interface DisplayListing {
  id: string
  title: string
  price: number
  city: string
  neighborhood?: string | null
  address?: string | null
  description: string
  property_type: string
  type: string
  rooms?: number | null
  bathrooms?: number | null
  surface_area?: number | null
  images: string[]
  amenities?: string[] | null
  created_at?: string
  user_profiles?: {
    full_name?: string | null
    phone?: string | null
    email?: string | null
    company_name?: string | null
    avatar_url?: string | null
  } | null
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
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

  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useListing(id)

  useEffect(() => {
    if (isError) {
      toast.error(error instanceof Error ? error.message : "Impossible de charger l'annonce")
    }
  }, [isError, error])

  const displayListing: DisplayListing | null = useMemo(() => {
    if (!listing) return null

    return {
      ...listing,
      images: listing.images && listing.images.length > 0 ? listing.images : [fallbackImage],
      description: listing.description || 'Aucune description fournie.',
      user_profiles: listing.user_profiles || null,
    }
  }, [listing])

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [displayListing?.id])

  const handlePrevImage = () => {
    if (!displayListing) return
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayListing.images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    if (!displayListing) return
    setCurrentImageIndex((prev) =>
      prev === displayListing.images.length - 1 ? 0 : prev + 1
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

  const formattedLocation = useMemo(() => {
    if (!displayListing) return 'Localisation non renseignée'
    const parts = [displayListing.city, displayListing.neighborhood].filter(Boolean)
    return parts.join(', ')
  }, [displayListing])

  const features = useMemo(() => {
    if (!displayListing) return []
    const items: string[] = []
    items.push(`Type de bien : ${displayListing.property_type}`)
    items.push(`Transaction : ${displayListing.type === 'vente' ? 'Vente' : 'Location'}`)
    if (displayListing.address) items.push(`Adresse : ${displayListing.address}`)
    if (displayListing.rooms) items.push(`${displayListing.rooms} chambre(s)`)
    if (displayListing.bathrooms) items.push(`${displayListing.bathrooms} salle(s) de bain`)
    if (displayListing.surface_area) items.push(`${displayListing.surface_area} m²`)
    return items
  }, [displayListing])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4" />
          <p className="text-xl font-medium text-neutral-700">Chargement de l'annonce...</p>
        </div>
      </div>
    )
  }

  if (!displayListing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-bold text-neutral-900">Annonce introuvable</h1>
          <p className="text-neutral-600">
            L'annonce que vous recherchez n'existe plus ou a été retirée. Retournez à la
            recherche pour découvrir d'autres opportunités.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/recherche')}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition"
            >
              Retour à la recherche
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-100 transition"
            >
              Page précédente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const amenities = (displayListing.amenities || []).map((amenity) => {
    const key = amenity.toLowerCase()
    const matched = Object.keys(amenityIconMap).find((candidate) => key.includes(candidate))
    const Icon = matched ? amenityIconMap[matched] : Check
    return { icon: Icon, label: amenity }
  })

  const owner = displayListing.user_profiles
  const ownerName = owner?.full_name?.trim() || 'Annonceur'
  const ownerCompany = owner?.company_name?.trim() || null
  const ownerPhone = owner?.phone?.trim() || null
  const ownerEmail = owner?.email?.trim() || null
  const ownerAvatar = owner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=0D8ABC&color=fff`

  return (
    <>
      <SEO
        title={`${displayListing.title} | ImmoKey`}
        description={displayListing.description.substring(0, 160)}
      />

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
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
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="relative h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${displayListing.id}-${currentImageIndex}`}
                      src={displayListing.images[currentImageIndex]}
                      alt={displayListing.title}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = fallbackImage
                      }}
                    />
                  </AnimatePresence>

                  {displayListing.images.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                      >
                        <ArrowLeft className="h-6 w-6" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                      >
                        <Share2 className="h-6 w-6 rotate-180" />
                      </motion.button>
                    </>
                  )}

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

                  <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                    <Camera className="inline h-4 w-4 mr-2" />
                    {currentImageIndex + 1} / {displayListing.images.length}
                  </div>
                </div>

                {displayListing.images.length > 1 && (
                  <div className="p-4 bg-neutral-50 flex gap-2 overflow-x-auto">
                    {displayListing.images.map((image, index) => (
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
                        <img
                          src={image}
                          alt={displayListing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = fallbackImage
                          }}
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

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
                        {displayListing.title}
                      </h1>
                      <div className="flex items-center text-neutral-600 mb-2">
                        <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                        <span className="text-lg">{formattedLocation}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          Ref: {displayListing.id.slice(0, 8).toUpperCase()}
                        </span>
                        {displayListing.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(displayListing.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-primary-600">
                        {displayListing.price.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">Prix demandé</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl">
                    <div className="text-center">
                      <Bed className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">
                        {displayListing.rooms ?? '—'}
                      </p>
                      <p className="text-sm text-neutral-600">Chambres</p>
                    </div>
                    <div className="text-center">
                      <Bath className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">
                        {displayListing.bathrooms ?? '—'}
                      </p>
                      <p className="text-sm text-neutral-600">Salles de bain</p>
                    </div>
                    <div className="text-center">
                      <Maximize className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                      <p className="text-2xl font-bold text-neutral-900">
                        {displayListing.surface_area ?? '—'}
                      </p>
                      <p className="text-sm text-neutral-600">m²</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Description</h2>
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                    {displayListing.description}
                  </p>
                </div>

                {!!amenities.length && (
                  <div className="border-t pt-6">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Équipements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {amenities.map((amenity, index) => {
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
                )}

                {!!features.length && (
                  <div className="border-t pt-6">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Caractéristiques</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {features.map((feature, index) => (
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
                )}
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
              >
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Contact</h3>
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={ownerAvatar}
                    alt={ownerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-neutral-900">{ownerName}</p>
                    <p className="text-sm text-neutral-600">{ownerCompany || 'Annonceur'}</p>
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
                    {ownerPhone ? (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`tel:${ownerPhone}`}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Phone className="h-5 w-5" />
                        Appeler {ownerPhone}
                      </motion.a>
                    ) : (
                      <div className="w-full px-6 py-3 bg-neutral-100 text-neutral-500 rounded-xl font-medium text-center">
                        Téléphone non renseigné
                      </div>
                    )}
                    {ownerEmail ? (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`mailto:${ownerEmail}`}
                        className="w-full px-6 py-3 bg-neutral-100 text-neutral-800 rounded-xl font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Mail className="h-5 w-5" />
                        {ownerEmail}
                      </motion.a>
                    ) : (
                      <div className="w-full px-6 py-3 bg-neutral-100 text-neutral-500 rounded-xl font-medium text-center">
                        Email non renseigné
                      </div>
                    )}
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
