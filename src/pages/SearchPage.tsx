import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Grid3x3, List, Euro, Home, Building2, X, Check, Filter } from 'lucide-react'
import SEO from '@/components/seo/SEO'
import { useListings } from '@/hooks/useListings'
import ListingCard from '@/components/listings/ListingCard'
import { ListingCardSkeleton } from '@/components/common/SkeletonLoader'
import type { Listing } from '@/types'

// Types
type PropertyTypeFilter =
  | 'all'
  | 'appartement'
  | 'maison'
  | 'terrain'
  | 'bureau'
  | 'commerce'
type ViewMode = 'grid' | 'list'

interface Filters {
  search: string
  propertyType: PropertyTypeFilter
  listingType: 'all' | 'location' | 'vente'
  minPrice: string
  maxPrice: string
  location: string
  bedrooms: string
  bathrooms: string
  minArea: string
  maxArea: string
  amenities: string[]
  availability: 'all' | 'available' | 'unavailable'
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}

const QUICK_PROPERTY_FILTERS: Array<{ value: PropertyTypeFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'appartement', label: 'Appartements' },
  { value: 'maison', label: 'Maisons' },
  { value: 'terrain', label: 'Terrains' },
  { value: 'bureau', label: 'Bureaux' },
  { value: 'commerce', label: 'Commerces' },
]

const AMENITIES = [
  'Climatisation',
  'Balcon',
  'Parking',
  'Jardin',
  'Piscine',
  'Sécurité 24/7',
  'Meublé',
  'Internet haut débit',
]

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    propertyType: 'all',
    listingType: 'all',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    minArea: '',
    maxArea: '',
    amenities: [],
    availability: 'all',
  })
  const {
    data: listings = [],
    isLoading,
    error,
  } = useListings(
    undefined,
    {
      sortBy: 'date',
      sortOrder: 'desc',
    }
  )

  const filteredListings: Listing[] = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase()
    const locationTerm = filters.location.trim().toLowerCase()
    const minPrice = Number(filters.minPrice)
    const maxPrice = Number(filters.maxPrice)
    const minBedrooms = Number(filters.bedrooms)
    const minBathrooms = Number(filters.bathrooms)
    const minArea = Number(filters.minArea)
    const maxArea = Number(filters.maxArea)

    return (listings as Listing[]).filter((listing) => {
      const matchesSearch = searchTerm
        ? listing.title.toLowerCase().includes(searchTerm) ||
          listing.city.toLowerCase().includes(searchTerm) ||
          listing.neighborhood.toLowerCase().includes(searchTerm)
        : true

      const matchesLocation = locationTerm
        ? listing.city.toLowerCase().includes(locationTerm) ||
          listing.neighborhood.toLowerCase().includes(locationTerm)
        : true

      const matchesProperty =
        filters.propertyType === 'all' || listing.property_type === filters.propertyType

      const matchesListingType =
        filters.listingType === 'all' || listing.type === filters.listingType

      const matchesMinPrice =
        filters.minPrice && !Number.isNaN(minPrice) ? listing.price >= minPrice : true
      const matchesMaxPrice =
        filters.maxPrice && !Number.isNaN(maxPrice) ? listing.price <= maxPrice : true

      const matchesBedrooms =
        filters.bedrooms && !Number.isNaN(minBedrooms)
          ? listing.rooms >= minBedrooms
          : true

      const matchesBathrooms =
        filters.bathrooms && !Number.isNaN(minBathrooms)
          ? listing.bathrooms >= minBathrooms
          : true

      const matchesMinArea =
        filters.minArea && !Number.isNaN(minArea)
          ? listing.surface_area >= minArea
          : true

      const matchesMaxArea =
        filters.maxArea && !Number.isNaN(maxArea)
          ? listing.surface_area <= maxArea
          : true

      const listingAmenities = listing.amenities?.map((a) => a.toLowerCase()) ?? []

      const matchesAmenities =
        filters.amenities.length > 0
          ? filters.amenities.every((amenity) =>
              listingAmenities.includes(amenity.toLowerCase())
            )
          : true

      const matchesAvailability =
        filters.availability === 'all'
          ? true
          : filters.availability === 'available'
          ? listing.available
          : !listing.available

      return (
        matchesSearch &&
        matchesLocation &&
        matchesProperty &&
        matchesListingType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesMinArea &&
        matchesMaxArea &&
        matchesAmenities &&
        matchesAvailability
      )
    })
  }, [filters, listings])

  const handleFilterChange = (
    key: keyof Filters,
    value: string | Filters['listingType'] | Filters['availability']
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value as any }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      propertyType: 'all',
      listingType: 'all',
      minPrice: '',
      maxPrice: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
      amenities: [],
      availability: 'all',
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
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
                <div className="flex items-center gap-2">
                  {QUICK_PROPERTY_FILTERS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('propertyType', option.value)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                        filters.propertyType === option.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-neutral-300 text-neutral-700 hover:border-primary-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pl-4 border-l border-neutral-200">
                  <Filter className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm font-semibold text-neutral-600">Transaction :</span>
                  {['all', 'location', 'vente'].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        handleFilterChange('listingType', type as Filters['listingType'])
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.listingType === type
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-neutral-300 text-neutral-700 hover:border-emerald-500'
                      }`}
                    >
                      {type === 'all' ? 'Tout' : type === 'location' ? 'Location' : 'Vente'}
                    </button>
                  ))}
                </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Disponibilité
                    </label>
                    <div className="flex items-center gap-2">
                      {(['all', 'available', 'unavailable'] as Filters['availability'][]).map(
                        (value) => (
                          <button
                            key={value}
                            onClick={() => handleFilterChange('availability', value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              filters.availability === value
                                ? 'bg-primary-600 text-white'
                                : 'bg-white border border-neutral-300 text-neutral-700 hover:border-primary-600'
                            }`}
                          >
                            {value === 'all'
                              ? 'Tous'
                              : value === 'available'
                              ? 'Disponibles'
                              : 'Loués'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Commodités
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => {
                        const selected = filters.amenities.includes(amenity)
                        return (
                          <button
                            key={amenity}
                            onClick={() => handleAmenityToggle(amenity)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${
                              selected
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
                                : 'bg-white border-neutral-300 text-neutral-600 hover:border-emerald-400'
                            }`}
                          >
                            <Check className={selected ? 'h-4 w-4' : 'hidden'} />
                            <span>{amenity}</span>
                          </button>
                        )
                      })}
                    </div>
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
          <div className="flex items-center justify-between mb-6">
            <p className="text-neutral-600">
              <span className="font-semibold text-neutral-900">
                {isLoading ? 'Chargement...' : `${filteredListings.length}`}
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

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Impossible de charger les annonces :{' '}
              {error instanceof Error ? error.message : 'erreur inconnue'}
            </div>
          )}

          {isLoading ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {Array.from({ length: viewMode === 'grid' ? 6 : 3 }).map((_, index) => (
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-12 text-center">
              <Home className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Aucun bien ne correspond à vos critères
              </h3>
              <p className="text-neutral-500 mb-6">
                Ajustez vos filtres (prix, localisation, commodités) pour découvrir davantage
                d’opportunités.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <motion.div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
