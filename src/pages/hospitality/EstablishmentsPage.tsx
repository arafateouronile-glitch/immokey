import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Building2, Edit, Archive, MapPin, 
  Eye, Star, TrendingUp, Users, Bed, AlertCircle, CheckCircle,
  Grid3x3, List, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getEstablishments, archiveEstablishment } from '@/services/hospitality/establishmentService'
import type { HospitalityEstablishment } from '@/types/hospitality'
import { getListingCardImageUrl } from '@/utils/imageOptimizer'
import toast from 'react-hot-toast'

export default function EstablishmentsPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [establishments, setEstablishments] = useState<HospitalityEstablishment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/hotellerie/etablissements' } })
      return
    }

    if (user) {
      fetchEstablishments()
    }
  }, [user, authLoading, navigate])

  const fetchEstablishments = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const data = await getEstablishments()
      setEstablishments(data)
    } catch (err: any) {
      console.error('Error fetching establishments:', err)
      setError('Erreur lors du chargement des établissements')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver cet établissement ? Il ne sera plus visible dans votre gestion active.')) {
      return
    }

    const loadingToast = toast.loading('Archivage en cours...')
    try {
      await archiveEstablishment(id)
      toast.success('Établissement archivé', { id: loadingToast })
      fetchEstablishments()
    } catch (err: any) {
      console.error('Error archiving establishment:', err)
      toast.error('Erreur lors de l\'archivage', { id: loadingToast })
    }
  }

  const getEstablishmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hotel: 'Hôtel',
      auberge: 'Auberge',
      apparthotel: 'Apparthôtel',
      residence: 'Résidence',
      gite: 'Gîte',
      autre: 'Autre',
    }
    return labels[type] || type
  }

  const filteredEstablishments = establishments.filter((establishment) => {
    const matchesSearch =
      establishment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      establishment.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      establishment.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      establishment.establishment_type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || establishment.status === statusFilter
    const matchesType = typeFilter === 'all' || establishment.establishment_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: establishments.length,
    active: establishments.filter(e => e.status === 'active').length,
    inactive: establishments.filter(e => e.status === 'inactive').length,
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement des établissements...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Blobs animés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête animé */}
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
                className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <Building2 className="text-primary-600" size={40} />
                Mes Établissements
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 text-lg"
              >
                Gérez tous vos établissements d'hébergement
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/hotellerie/etablissements/nouveau')}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
            >
              <Plus size={24} />
              <span>Ajouter un établissement</span>
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

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { title: 'Total établissements', value: stats.total, icon: Building2, gradient: 'from-blue-500 to-blue-600' },
            { title: 'Actifs', value: stats.active, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
            { title: 'Inactifs', value: stats.inactive, icon: AlertCircle, gradient: 'from-orange-500 to-orange-600' },
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
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon size={40} className="opacity-20" />
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un établissement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 text-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-field pl-12 appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
            <div className="flex gap-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field flex-1"
              >
                <option value="all">Tous types</option>
                <option value="hotel">Hôtel</option>
                <option value="auberge">Auberge</option>
                <option value="apparthotel">Apparthôtel</option>
                <option value="residence">Résidence</option>
                <option value="gite">Gîte</option>
                <option value="autre">Autre</option>
              </select>
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
          {filteredEstablishments.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredEstablishments.length} établissement(s) trouvé(s)
            </div>
          )}
        </motion.div>

        {/* Liste des établissements */}
        <AnimatePresence mode="wait">
          {filteredEstablishments.length === 0 ? (
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
                <Building2 size={80} className="mx-auto text-gray-300 mb-4" />
              </motion.div>
              {establishments.length === 0 ? (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucun établissement</p>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Commencez par ajouter votre premier établissement d'hébergement
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/hotellerie/etablissements/nouveau')}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
                  >
                    <Plus size={24} />
                    <span>Ajouter mon premier établissement</span>
                  </motion.button>
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
              {filteredEstablishments.map((establishment, index) => (
                <motion.div
                  key={establishment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="card overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/hotellerie/etablissements/${establishment.id}`)}
                >
                  {/* Image */}
                  <div className={`relative ${viewMode === 'list' ? 'flex' : ''}`}>
                    {establishment.cover_image_url ? (
                      <img
                        src={getListingCardImageUrl(establishment.cover_image_url)}
                        alt={establishment.name}
                        className={`${viewMode === 'list' ? 'w-64 h-48' : 'w-full h-56'} object-cover`}
                        loading="lazy"
                      />
                    ) : (
                      <div className={`${viewMode === 'list' ? 'w-64 h-48' : 'w-full h-56'} bg-gradient-to-br from-blue-200 to-teal-200 flex items-center justify-center`}>
                        <Building2 size={64} className="text-white" />
                      </div>
                    )}
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        establishment.status === 'active'
                          ? 'bg-green-500/90 text-white'
                          : 'bg-orange-500/90 text-white'
                      }`}
                    >
                      {establishment.status === 'active' ? '✓ Actif' : '○ Inactif'}
                    </motion.span>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                          {establishment.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin size={16} />
                          <span className="line-clamp-1">{establishment.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-primary-600" />
                        <span className="capitalize">{getEstablishmentTypeLabel(establishment.establishment_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary-600" />
                        <span>{establishment.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/hotellerie/etablissements/${establishment.id}`)
                        }}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        <span>Détails</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/hotellerie/etablissements/${establishment.id}/modifier`)
                        }}
                        className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </motion.button>
                      {establishment.status !== 'archived' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleArchive(establishment.id)
                          }}
                          className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Archiver"
                        >
                          <Archive size={18} />
                        </motion.button>
                      )}
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
