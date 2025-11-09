import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Heart,
  Euro,
  Home,
  Building2,
  X,
} from 'lucide-react'
import SEO from '@/components/seo/SEO'

// Types
type PropertyType = 'all' | 'apartment' | 'house' | 'land' | 'commercial'
type ViewMode = 'grid' | 'list'

interface Filters {
  search: string
  propertyType: PropertyType
  minPrice: string
  maxPrice: string
  location: string
  bedrooms: string
  bathrooms: string
  minArea: string
  maxArea: string
}

// Données de démonstration
const mockListings = [
  {
    id: '1',
    title: 'Appartement moderne à Lomé',
    type: 'apartment',
    price: 250000,
    location: 'Lomé, Tokoin',
    bedrooms: 3,
    bathrooms: 2,
    area: 85,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  },
  {
    id: '2',
    title: 'Villa avec piscine',
    type: 'house',
    price: 450000,
    location: 'Lomé, Bè',
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  },
  {
    id: '3',
    title: 'Terrain constructible',
    type: 'land',
    price: 80000,
    location: 'Kara',
    bedrooms: 0,
    bathrooms: 0,
    area: 500,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  },
  {
    id: '4',
    title: 'Bureau commercial centre-ville',
    type: 'commercial',
    price: 180000,
    location: 'Lomé, Centre',
    bedrooms: 0,
    bathrooms: 1,
    area: 120,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  },
  {
    id: '5',
    title: 'Duplex lumineux',
    type: 'apartment',
    price: 320000,
    location: 'Lomé, Hédzranawoé',
    bedrooms: 4,
    bathrooms: 3,
    area: 140,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  },
  {
    id: '6',
    title: 'Maison familiale',
    type: 'house',
    price: 380000,
    location: 'Sokodé',
    bedrooms: 5,
    bathrooms: 3,
    area: 180,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    minArea: '',
    maxArea: '',
  })

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      propertyType: 'all',
      minPrice: '',
      maxPrice: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
    })
  }

  return (
    <>
      <SEO
        title="Recherche de biens | ImmoKey"
        description="Trouvez votre bien idéal parmi des centaines d'annonces vérifiées au Togo."
      />

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 relative">
        {/* Blobs animés en arrière-plan */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-primary-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-orange-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-green-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 30, repeat: Infinity }}
          />
        </div>

        {/* Header avec recherche */}
        <div className="bg-white border-b border-neutral-200 sticky top-16 z-40 backdrop-blur-lg bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Barre de recherche principale */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par ville, quartier..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    showFilters
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Filtres</span>
                </motion.button>
              </div>

              {/* Filtres rapides */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {['all', 'apartment', 'house', 'land', 'commercial'].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() =>
                        handleFilterChange('propertyType', type as PropertyType)
                      }
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                        filters.propertyType === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-neutral-300 text-neutral-700 hover:border-primary-600'
                      }`}
                    >
                      {type === 'all' && 'Tous'}
                      {type === 'apartment' && 'Appartements'}
                      {type === 'house' && 'Maisons'}
                      {type === 'land' && 'Terrains'}
                      {type === 'commercial' && 'Commerces'}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Panneau de filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-b border-neutral-200 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Prix min/max */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Prix minimum (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="50 000"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange('minPrice', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Prix maximum (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="500 000"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange('maxPrice', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Chambres/Salles de bain */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Chambres min.
                    </label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) =>
                        handleFilterChange('bedrooms', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Toutes</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Salles de bain min.
                    </label>
                    <select
                      value={filters.bathrooms}
                      onChange={(e) =>
                        handleFilterChange('bathrooms', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Toutes</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium"
                  >
                    Réinitialiser
                  </button>
                  <motion.button
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Appliquer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Résultats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Barre d'outils */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-neutral-600">
              <span className="font-semibold text-neutral-900">
                {mockListings.length}
              </span>{' '}
              biens trouvés
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Grille de résultats */}
          <motion.div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
            layout
          >
            <AnimatePresence mode="popLayout">
              {mockListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="h-5 w-5 text-neutral-600" />
                    </button>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                        {listing.type === 'apartment' && 'Appartement'}
                        {listing.type === 'house' && 'Maison'}
                        {listing.type === 'land' && 'Terrain'}
                        {listing.type === 'commercial' && 'Commerce'}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center text-neutral-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{listing.location}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4 text-neutral-600 text-sm">
                      {listing.bedrooms > 0 && (
                        <div className="flex items-center">
                          <BedDouble className="h-4 w-4 mr-1" />
                          <span>{listing.bedrooms}</span>
                        </div>
                      )}
                      {listing.bathrooms > 0 && (
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{listing.bathrooms}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 mr-1" />
                        <span>{listing.area} m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <div className="flex items-center text-primary-600 font-bold text-2xl">
                        {listing.price.toLocaleString()} FCFA
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                        Voir détails →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  )
}
