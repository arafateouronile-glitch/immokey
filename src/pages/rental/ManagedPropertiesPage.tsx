import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Home, Edit, Archive, 
  MapPin, DollarSign, TrendingUp, Grid3x3, List,
  ArrowUpRight, Eye, Trash2, Building2, BedDouble,
  Bath, Square, Calendar, CheckCircle, AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getManagedProperties, archiveManagedProperty } from '@/services/rental/managedPropertyService'
import type { ManagedProperty } from '@/types/rental'
import toast from 'react-hot-toast'

export default function ManagedPropertiesPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [filteredProperties, setFilteredProperties] = useState<ManagedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'vacant'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion/biens' } })
      return
    }

    if (user) {
      fetchProperties()
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    filterProperties()
  }, [properties, searchQuery, statusFilter])

  const fetchProperties = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const data = await getManagedProperties()
      setProperties(data)
    } catch (err: any) {
      console.error('Error fetching properties:', err)
      setError('Erreur lors du chargement des biens')
    } finally {
      setLoading(false)
    }
  }

  const filterProperties = () => {
    let filtered = [...properties]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.property_type.toLowerCase().includes(query)
      )
    }

    setFilteredProperties(filtered)
  }

  const handleArchive = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce bien ?')) {
      return
    }

    const loadingToast = toast.loading('Archivage en cours...')
    try {
      await archiveManagedProperty(id)
      toast.success('Bien archivé avec succès', { id: loadingToast })
      fetchProperties()
    } catch (err: any) {
      console.error('Error archiving property:', err)
      toast.error('Erreur lors de l\'archivage', { id: loadingToast })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  const stats = {
    total: properties.length,
    occupied: properties.filter(p => p.status === 'occupied').length,
    vacant: properties.filter(p => p.status === 'vacant').length,
    totalRevenue: properties.reduce((sum, p) => sum + p.monthly_rent, 0)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement de vos biens...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Blobs animés en arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête avec animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <Building2 className="text-primary-600" size={40} />
                Mes Biens en Gestion
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 text-lg"
              >
                Gérez tous vos biens immobiliers en un seul endroit
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/gestion/biens/nouveau')}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
            >
              <Plus size={24} />
              <span>Ajouter un bien</span>
            </motion.button>
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

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Total biens', value: stats.total, icon: Home, gradient: 'from-blue-500 to-blue-600' },
            { title: 'Occupés', value: stats.occupied, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
            { title: 'Vacants', value: stats.vacant, icon: AlertCircle, gradient: 'from-orange-500 to-orange-600' },
            { title: 'Revenus totaux', value: `${formatPrice(stats.totalRevenue)} FCFA`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              className={`card bg-gradient-to-br ${stat.gradient} text-white overflow-hidden relative`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value : stat.value}</p>
                </div>
                <stat.icon size={40} className="opacity-20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filtres et recherche */}
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
                placeholder="Rechercher par nom, adresse, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 text-lg"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="input-field pl-12 appearance-none"
                >
                  <option value="all">Tous</option>
                  <option value="occupied">Occupés</option>
                  <option value="vacant">Vacants</option>
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
          {filteredProperties.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredProperties.length} bien{filteredProperties.length > 1 ? 's' : ''} trouvé{filteredProperties.length > 1 ? 's' : ''}
            </div>
          )}
        </motion.div>

        {/* Liste des biens */}
        <AnimatePresence mode="wait">
          {filteredProperties.length === 0 ? (
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
              {properties.length === 0 ? (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucun bien en gestion</p>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Commencez par ajouter votre premier bien et profitez de tous les outils de gestion
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/gestion/biens/nouveau')}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
                  >
                    <Plus size={24} />
                    <span>Ajouter mon premier bien</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucun résultat</p>
                  <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
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
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className={`card overflow-hidden cursor-pointer group ${viewMode === 'list' ? 'flex flex-row' : ''}`}
                >
                  {/* Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full'}`}>
                    {property.photo_url ? (
                      <img
                        src={property.photo_url}
                        alt={property.name}
                        className={`${viewMode === 'list' ? 'h-full' : 'h-56'} w-full object-cover`}
                      />
                    ) : (
                      <div className={`${viewMode === 'list' ? 'h-full' : 'h-56'} w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
                        <Home size={64} className="text-gray-400" />
                      </div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        property.status === 'occupied'
                          ? 'bg-green-500/90 text-white'
                          : 'bg-orange-500/90 text-white'
                      }`}
                    >
                      {property.status === 'occupied' ? '✓ Occupé' : '○ Vacant'}
                    </motion.div>
                  </div>

                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin size={16} />
                          <p className="line-clamp-1">{property.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-primary-600" />
                        <span className="capitalize">{property.property_type}</span>
                      </div>
                      {property.rooms && (
                        <div className="flex items-center gap-2">
                          <BedDouble size={16} className="text-primary-600" />
                          <span>{property.rooms} pièces</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500 text-sm">Loyer mensuel:</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(property.monthly_rent)}
                        </span>
                        <span className="text-sm text-gray-500">FCFA</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/gestion/biens/${property.id}`)
                        }}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        <span>Voir détails</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/gestion/biens/${property.id}/modifier`)
                        }}
                        className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchive(property.id)
                        }}
                        className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Archiver"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
