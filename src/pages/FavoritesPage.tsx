import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, ArrowLeft, Search, Grid3x3, List, Trash2, Eye,
  AlertCircle, Star, TrendingUp, MapPin, Home
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserFavorites } from '@/services/favoritesService'
import ListingCard from '@/components/listings/ListingCard'
import type { Listing } from '@/types'
import toast from 'react-hot-toast'
import SEO from '@/components/seo/SEO'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/favoris' } })
      return
    }

    if (user) {
      fetchFavorites()
    }
  }, [user, authLoading, navigate])

  const fetchFavorites = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const data = await getUserFavorites()
      const transformedListings: Listing[] = data.map((item: any) => ({
        ...item,
        images: item.listing_images
          ? item.listing_images
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((img: any) => img.url)
          : [],
      }))
      setListings(transformedListings)
    } catch (err: any) {
      console.error('Error fetching favorites:', err)
      setError('Erreur lors du chargement de vos favoris')
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = (id: string) => {
    toast.success('Retiré des favoris')
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement de vos favoris...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <SEO
        title="Mes favoris | ImmoKey"
        description="Retrouvez tous vos biens immobiliers favoris"
      />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
        {/* Blobs animés */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-10 w-96 h-96 bg-red-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-80 h-80 bg-pink-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 font-medium"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={20} className="mr-2" />
              Retour
            </motion.button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="text-red-600 fill-red-600" size={40} />
                  </motion.div>
                  <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Mes Favoris
                  </span>
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  {listings.length} annonce{listings.length > 1 ? 's' : ''} sauvegardée{listings.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card mb-6 bg-red-50 border-2 border-red-200 p-4"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-600" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats rapides */}
          {listings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: 'Total favoris', value: listings.length, icon: Heart, gradient: 'from-red-500 to-red-600' },
                { label: 'Appartements', value: listings.filter(l => l.property_type === 'apartment').length, icon: Home, gradient: 'from-blue-500 to-blue-600' },
                { label: 'Maisons', value: listings.filter(l => l.property_type === 'house').length, icon: Home, gradient: 'from-green-500 to-green-600' },
                { label: 'Prix moyen', value: `${Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length / 1000)}K`, icon: TrendingUp, gradient: 'from-orange-500 to-orange-600' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className={`bg-gradient-to-br ${stat.gradient} text-white rounded-2xl p-4 shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon size={28} className="opacity-80" />
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <p className="text-white/90 text-sm font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Filtres */}
          {listings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card mb-6"
            >
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher dans vos favoris..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12 text-lg"
                  />
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid3x3 size={20} className={viewMode === 'grid' ? 'text-red-600' : 'text-gray-400'} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List size={20} className={viewMode === 'list' ? 'text-red-600' : 'text-gray-400'} />
                  </motion.button>
                </div>
              </div>
              {filteredListings.length > 0 && filteredListings.length !== listings.length && (
                <div className="mt-4 text-sm text-gray-600">
                  {filteredListings.length} résultat(s) trouvé(s)
                </div>
              )}
            </motion.div>
          )}

          {/* Liste des favoris */}
          <AnimatePresence mode="wait">
            {filteredListings.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card text-center py-16"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart size={80} className="mx-auto text-gray-300 mb-4" />
                </motion.div>
                {listings.length === 0 ? (
                  <>
                    <p className="text-2xl text-gray-700 font-bold mb-2">Aucun favori pour le moment</p>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Ajoutez des annonces à vos favoris en cliquant sur le cœur
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/recherche" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg">
                        <Star size={24} />
                        <span>Découvrir des annonces</span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <p className="text-2xl text-gray-700 font-bold mb-2">Aucun résultat</p>
                    <p className="text-gray-500">Modifiez votre recherche</p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
              >
                {filteredListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    className="relative"
                  >
                    <ListingCard listing={listing} />
                    
                    {/* Actions overlay */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Link
                          to={`/annonce/${listing.id}`}
                          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                          title="Voir"
                        >
                          <Eye size={18} className="text-primary-600" />
                        </Link>
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(listing.id)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                        title="Retirer des favoris"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </motion.button>
                    </div>

                    {/* Favorite badge */}
                    <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                      <Heart size={14} className="fill-white" />
                      Favori
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
