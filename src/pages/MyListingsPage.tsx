import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, Home, Building2,
  TrendingUp, DollarSign, MapPin, Heart, MessageSquare, AlertCircle,
  CheckCircle, Clock, Grid3x3, List, BarChart3, Calendar, ArrowLeft, User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserListings, useDeleteListing } from '@/hooks/useListings'
import ListingCard from '@/components/listings/ListingCard'
import { ListingCardSkeleton } from '@/components/common/SkeletonLoader'
import toast from 'react-hot-toast'
import SEO from '@/components/seo/SEO'

export default function MyListingsPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { data: listings = [], isLoading, error } = useUserListings(user?.id)
  const deleteListingMutation = useDeleteListing()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/mes-annonces' } })
    }
  }, [user, authLoading, navigate])

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return
    }
    const loadingToast = toast.loading('Suppression en cours...')
    deleteListingMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Annonce supprimée', { id: loadingToast })
      },
      onError: () => {
        toast.error('Erreur lors de la suppression', { id: loadingToast })
      },
    })
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.address.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && listing.available) ||
      (statusFilter === 'archived' && !listing.available)
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.available).length,
    archived: listings.filter(l => !l.available).length,
    totalViews: listings.reduce((sum, l) => sum + ((l as any).views || 0), 0),
    totalFavorites: listings.reduce((sum, l) => sum + ((l as any).favorites || 0), 0),
  }

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement de vos annonces...</p>
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
        title="Mes annonces | ImmoKey"
        description="Gérez toutes vos annonces immobilières en un seul endroit"
      />

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
        {/* Blobs animés */}
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
            className="absolute bottom-20 right-10 w-80 h-80 bg-green-400/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Bouton retour profil */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/profil"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au profil
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
                Mes Annonces
              </h1>
              <p className="text-gray-600 mt-2">Gérez toutes vos annonces immobilières</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/publier" className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg">
                <Plus size={24} />
                <span>Nouvelle annonce</span>
              </Link>
            </motion.div>
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
                  <p className="text-red-700 font-medium">Erreur : {errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, icon: Home, gradient: 'from-primary-500 to-primary-600' },
              { label: 'Actives', value: stats.active, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
              { label: 'En attente', value: stats.pending, icon: Clock, gradient: 'from-yellow-500 to-yellow-600' },
              { label: 'Archivées', value: stats.archived, icon: Building2, gradient: 'from-gray-500 to-gray-600' },
              { label: 'Total vues', value: stats.totalViews, icon: Eye, gradient: 'from-blue-500 to-blue-600' },
              { label: 'Favoris', value: stats.totalFavorites, icon: Heart, gradient: 'from-pink-500 to-pink-600' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                className={`bg-gradient-to-br ${stat.gradient} text-white rounded-2xl p-4 shadow-lg`}
              >
                <div className="flex items-center justify-between mb-1">
                  <stat.icon size={24} className="opacity-80" />
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <p className="text-white/90 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une annonce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12 text-lg"
                />
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="input-field pl-12 appearance-none"
                  >
                    <option value="all">Tous statuts</option>
                    <option value="active">Actives</option>
                    <option value="pending">En attente</option>
                    <option value="archived">Archivées</option>
                  </select>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid3x3 size={20} className={viewMode === 'grid' ? 'text-primary-600' : 'text-gray-400'} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List size={20} className={viewMode === 'list' ? 'text-primary-600' : 'text-gray-400'} />
                  </motion.button>
                </div>
              </div>
            </div>
            {filteredListings.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                {filteredListings.length} annonce(s) trouvée(s)
              </div>
            )}
          </motion.div>

          {/* Liste des annonces */}
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
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Home size={80} className="mx-auto text-gray-300 mb-4" />
                </motion.div>
                {listings.length === 0 ? (
                  <>
                    <p className="text-2xl text-gray-700 font-bold mb-2">Aucune annonce</p>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Vous n'avez pas encore publié d'annonce
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/publier" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg">
                        <Plus size={24} />
                        <span>Publier ma première annonce</span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <p className="text-2xl text-gray-700 font-bold mb-2">Aucun résultat</p>
                    <p className="text-gray-500">Modifiez vos critères de recherche</p>
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
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Link
                          to={`/annonce/${listing.id}/edit`}
                          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                          title="Modifier"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </Link>
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(listing.id)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                        title="Supprimer"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </motion.button>
                    </div>

                    {/* Stats badge */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p className="font-bold text-primary-600">{(listing as any).views || 0}</p>
                          <p className="text-xs text-gray-600">Vues</p>
                        </div>
                        <div>
                          <p className="font-bold text-pink-600">{(listing as any).favorites || 0}</p>
                          <p className="text-xs text-gray-600">Favoris</p>
                        </div>
                        <div>
                          <p className="font-bold text-green-600">{(listing as any).inquiries || 0}</p>
                          <p className="text-xs text-gray-600">Messages</p>
                        </div>
                      </div>
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
