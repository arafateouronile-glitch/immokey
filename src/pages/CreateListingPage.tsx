import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  FileText,
  Images,
  Navigation,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/seo/SEO'
import ImageUploader from '@/components/forms/ImageUploader'
import AmenitiesSelector from '@/components/forms/AmenitiesSelector'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

interface CreateListingFormData {
  title: string
  description: string
  property_type: string
  listing_type: string
  price: string
  bedrooms: string
  bathrooms: string
  surface_area: string
  address: string
  city: string
  neighborhood: string
  country: string
  latitude: number
  longitude: number
  amenities: string[]
  images: string[]
}

const DEFAULT_POSITION = {
  latitude: 6.1289,
  longitude: 1.2217,
}

const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  Lomé: [
    'Adidogomé',
    'Agoè',
    'Bè',
    'Tokoin',
    'Kégué',
    'Nyékonakpoè',
    'Hanoukopé',
    'Hédzranawoé',
    'Bocco',
  ],
  Cotonou: ['Cadjèhoun', 'Fidjrossè', 'Akpakpa', 'Ganhi', 'Zogbo', 'Agla'],
  Abidjan: ['Cocody', 'Marcory', 'Treichville', 'Plateau', 'Yopougon', 'Koumassi'],
}

const CITY_OPTIONS = ['Lomé', 'Cotonou', 'Abidjan', 'Accra', 'Dakar']

export default function CreateListingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateListingFormData>({
    title: '',
    description: '',
    property_type: 'apartment',
    listing_type: 'rent',
    price: '',
    bedrooms: '',
    bathrooms: '',
    surface_area: '',
    address: '',
    city: 'Lomé',
    neighborhood: '',
    country: 'Togo',
    latitude: DEFAULT_POSITION.latitude,
    longitude: DEFAULT_POSITION.longitude,
    amenities: [],
    images: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Vous devez être connecté pour publier une annonce')
      navigate('/connexion')
      return
    }

    setLoading(true)
    try {
      // TODO: Implement listing creation with Supabase
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Annonce créée avec succès !')
      navigate('/mes-annonces')
    } catch (error) {
      toast.error('Erreur lors de la création de l\'annonce')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAmenitiesChange = (amenities: string[]) => {
    setFormData((prev) => ({ ...prev, amenities }))
  }

  const handleImagesChange = (images: string[]) => {
    setFormData((prev) => ({ ...prev, images }))
  }

  const neighborhoodsOptions = useMemo(() => {
    const normalizedCity = formData.city.trim()
    if (!normalizedCity) return []
    return NEIGHBORHOODS_BY_CITY[normalizedCity] ?? []
  }, [formData.city])

  const selectedCityOption = useMemo(() => {
    return CITY_OPTIONS.includes(formData.city) ? formData.city : 'autre'
  }, [formData.city])

  return (
    <>
      <SEO
        title="Publier une annonce | ImmoKey"
        description="Créez votre annonce immobilière en quelques minutes"
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

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <motion.button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 font-medium"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </motion.button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent flex items-center gap-3">
              <Building2 className="text-primary-600" size={40} />
              Publier une annonce
            </h1>
            <p className="mt-2 text-neutral-600 text-lg">Remplissez les informations pour créer votre annonce</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 space-y-8"
          >
        {/* Section Type */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Home size={24} className="text-primary-600" />
            Type de bien
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="property_type" className="block text-sm font-medium text-neutral-700 mb-2">
              Type de bien *
            </label>
            <select
              id="property_type"
              name="property_type"
              required
              value={formData.property_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="apartment">Appartement</option>
              <option value="house">Maison</option>
              <option value="villa">Villa</option>
              <option value="land">Terrain</option>
              <option value="office">Bureau</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label htmlFor="listing_type" className="block text-sm font-medium text-neutral-700 mb-2">
              Type d'annonce *
            </label>
            <select
              id="listing_type"
              name="listing_type"
              required
              value={formData.listing_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="rent">Location</option>
              <option value="sale">Vente</option>
            </select>
          </div>
          </div>
        </div>

        {/* Section Détails */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <FileText size={24} className="text-primary-600" />
            Détails de l'annonce
          </h2>
          <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
            Titre de l'annonce *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ex: Appartement 3 pièces à Lomé"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Décrivez votre bien en détail..."
          />
          </div>
        </div>

        {/* Section Prix et Caractéristiques */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <DollarSign size={24} className="text-primary-600" />
            Prix et caractéristiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="50000"
            />
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-neutral-700 mb-2">
              Chambres
            </label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="2"
            />
          </div>

          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-neutral-700 mb-2">
              Salles de bain
            </label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
        </div>

        <div>
          <label htmlFor="surface_area" className="block text-sm font-medium text-neutral-700 mb-2">
            Surface (m²)
          </label>
          <input
            type="number"
            id="surface_area"
            name="surface_area"
            value={formData.surface_area}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="75"
          />
          </div>
        </div>

        {/* Section Équipements */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Maximize size={24} className="text-primary-600" />
            Commodités & services
          </h2>
          <AmenitiesSelector
            selectedAmenities={formData.amenities}
            onAmenitiesChange={handleAmenitiesChange}
          />
        </div>

        {/* Section Photos */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Images size={24} className="text-primary-600" />
            Photos du bien
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            Ajoutez jusqu’à 10 photos en haute résolution. Les deux premières seront mises en avant dans les résultats de recherche.
          </p>
          <ImageUploader
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={10}
            bucket="listings"
          />
        </div>

        {/* Section Localisation */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin size={24} className="text-primary-600" />
            Localisation
          </h2>
          <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Rue, quartier..."
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
                Ville *
              </label>
              <select
                id="city"
                name="city"
                value={selectedCityOption}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === 'autre') {
                    setFormData((prev) => ({
                      ...prev,
                      city: '',
                      neighborhood: '',
                    }))
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      city: value,
                      neighborhood: '',
                    }))
                  }
                }}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {CITY_OPTIONS.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
                <option value="autre">Autre ville</option>
              </select>
              {selectedCityOption === 'autre' && (
                <input
                  type="text"
                  name="custom_city"
                  value={formData.city}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      city: event.target.value,
                      neighborhood: '',
                    }))
                  }
                  className="mt-3 w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Saisissez la ville"
                  required
                />
              )}
            </div>

            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-neutral-700 mb-2">
                Quartier
              </label>
              {neighborhoodsOptions.length > 0 ? (
                <select
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un quartier</option>
                  {neighborhoodsOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nom du quartier"
                />
              )}
              <p className="mt-1 text-xs text-neutral-500">
                {neighborhoodsOptions.length > 0
                  ? 'Choisissez un quartier dans la liste ou laissez vide.'
                  : 'Saisissez le quartier si vous souhaitez le préciser.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <Navigation className="h-5 w-5 text-primary-600" />
              Cliquez sur la carte pour positionner précisément le bien. Les coordonnées seront enregistrées avec votre annonce.
            </div>
            <div className="h-72 w-full overflow-hidden rounded-2xl border border-neutral-200">
              <MapContainer
                center={[formData.latitude, formData.longitude]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  position={[formData.latitude, formData.longitude]}
                  onPositionChange={(lat, lng) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }))
                  }
                />
              </MapContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
              <div className="rounded-xl bg-neutral-100 px-4 py-2">
                <span className="font-medium text-neutral-800">Latitude :</span> {formData.latitude.toFixed(6)}
              </div>
              <div className="rounded-xl bg-neutral-100 px-4 py-2">
                <span className="font-medium text-neutral-800">Longitude :</span> {formData.longitude.toFixed(6)}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-8 border-t border-neutral-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-semibold"
          >
            Annuler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-600 to-green-600 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 transition-all font-semibold text-lg"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publication...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Publier l'annonce
              </>
            )}
          </motion.button>
        </div>
      </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg"
          >
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> Cette page est en cours de développement. Les annonces ne seront pas encore sauvegardées.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}

interface LocationMarkerProps {
  position: [number, number]
  onPositionChange: (lat: number, lng: number) => void
}

function LocationMarker({ position, onPositionChange }: LocationMarkerProps) {
  useMapEvents({
    click(event) {
      onPositionChange(event.latlng.lat, event.latlng.lng)
    },
  })

  return <Marker position={position} />
}
