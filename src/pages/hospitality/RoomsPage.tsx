import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Bed, Edit, Trash2, Eye, Users, DollarSign,
  Wifi, Tv, Coffee, Wind, CheckCircle, AlertCircle, XCircle, ArrowLeft,
  Grid3x3, List, Home, ArrowUpRight, Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getRooms, deleteRoom, getRoomsStats } from '@/services/hospitality/roomService'
import { getEstablishment } from '@/services/hospitality/establishmentService'
import type { HospitalityRoom } from '@/types/hospitality'
import { getListingCardImageUrl } from '@/utils/imageOptimizer'
import toast from 'react-hot-toast'

export default function RoomsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [rooms, setRooms] = useState<HospitalityRoom[]>([])
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [establishmentName, setEstablishmentName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
  })

  useEffect(() => {
    const stateEstablishmentId = (location.state as any)?.establishmentId
    const urlParams = new URLSearchParams(location.search)
    const urlEstablishmentId = urlParams.get('establishment_id')
    
    if (stateEstablishmentId || urlEstablishmentId) {
      setEstablishmentId(stateEstablishmentId || urlEstablishmentId)
    } else if (user && !establishmentId) {
      fetchFirstEstablishment()
    }

    if (!authLoading && !user) {
      navigate('/hotellerie/connexion', { state: { from: '/hotellerie/chambres' } })
      return
    }

    if (user && establishmentId) {
      fetchData()
    }
  }, [user, authLoading, navigate, establishmentId])

  const fetchFirstEstablishment = async () => {
    try {
      const { getEstablishments } = await import('@/services/hospitality/establishmentService')
      const establishments = await getEstablishments()
      if (establishments && establishments.length > 0) {
        setEstablishmentId(establishments[0].id)
      }
    } catch (err) {
      console.error('Error fetching establishments:', err)
    }
  }

  const fetchData = async () => {
    if (!establishmentId) return

    setLoading(true)
    setError(null)
    try {
      const [roomsData, statsData, establishmentData] = await Promise.all([
        getRooms(establishmentId),
        getRoomsStats(establishmentId),
        getEstablishment(establishmentId),
      ])
      setRooms(roomsData)
      setStats(statsData)
      setEstablishmentName(establishmentData.name)
    } catch (err: any) {
      console.error('Error fetching rooms:', err)
      setError('Erreur lors du chargement des chambres')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      return
    }

    const loadingToast = toast.loading('Suppression en cours...')
    try {
      await deleteRoom(id)
      toast.success('Chambre supprimée', { id: loadingToast })
      fetchData()
    } catch (err: any) {
      console.error('Error deleting room:', err)
      toast.error('Erreur lors de la suppression', { id: loadingToast })
    }
  }

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: 'Simple',
      double: 'Double',
      twin: 'Jumelles',
      suite: 'Suite',
      apartment: 'Appartement',
      family: 'Familiale',
      dormitory: 'Dortoir',
    }
    return labels[type] || type
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-800', label: 'Disponible' },
      maintenance: { icon: AlertCircle, bg: 'bg-orange-100', text: 'text-orange-800', label: 'Maintenance' },
      inactive: { icon: XCircle, bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
    }
    return configs[status as keyof typeof configs] || configs.active
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.name && room.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      room.room_type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement des chambres...</p>
        </motion.div>
      </div>
    )
  }

  if (!user || !establishmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md text-center bg-yellow-50 border-2 border-yellow-200"
        >
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-700 mb-6">
            Veuillez sélectionner un établissement pour gérer ses chambres.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/hotellerie/etablissements')}
            className="btn-primary"
          >
            Voir mes établissements
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Blobs animés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-indigo-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 0.9, 1],
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
                className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <Bed className="text-indigo-600" size={40} />
                Gestion des Chambres
              </motion.h1>
              {establishmentName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-600 mt-2 text-lg flex items-center gap-2"
                >
                  <Home size={18} />
                  <span className="font-semibold">{establishmentName}</span>
                </motion.p>
              )}
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/hotellerie/etablissements/${establishmentId}`)}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>Retour</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate('/hotellerie/chambres/nouvelle', {
                    state: { establishmentId },
                  })
                }
                className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
              >
                <Plus size={24} />
                <span>Ajouter une chambre</span>
              </motion.button>
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Total', value: stats.total, icon: Bed, gradient: 'from-indigo-500 to-indigo-600' },
            { title: 'Disponibles', value: stats.active, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
            { title: 'Maintenance', value: stats.maintenance, icon: AlertCircle, gradient: 'from-orange-500 to-orange-600' },
            { title: 'Inactives', value: stats.inactive, icon: XCircle, gradient: 'from-gray-500 to-gray-600' },
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
                  <p className="text-white/80 text-xs font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon size={36} className="opacity-20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une chambre..."
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
                <option value="all">Tous statuts</option>
                <option value="active">Disponibles</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex gap-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field flex-1"
              >
                <option value="all">Tous types</option>
                <option value="single">Simple</option>
                <option value="double">Double</option>
                <option value="twin">Jumelles</option>
                <option value="suite">Suite</option>
                <option value="apartment">Appartement</option>
                <option value="family">Familiale</option>
                <option value="dormitory">Dortoir</option>
              </select>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid3x3 size={20} className={viewMode === 'grid' ? 'text-indigo-600' : 'text-gray-400'} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List size={20} className={viewMode === 'list' ? 'text-indigo-600' : 'text-gray-400'} />
                </motion.button>
              </div>
            </div>
          </div>
          {filteredRooms.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredRooms.length} chambre(s) trouvée(s)
            </div>
          )}
        </motion.div>

        {/* Liste des chambres */}
        <AnimatePresence mode="wait">
          {filteredRooms.length === 0 ? (
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
                <Bed size={80} className="mx-auto text-gray-300 mb-4" />
              </motion.div>
              {rooms.length === 0 ? (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucune chambre</p>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Commencez par ajouter votre première chambre
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      navigate('/hotellerie/chambres/nouvelle', {
                        state: { establishmentId },
                      })
                    }
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
                  >
                    <Plus size={24} />
                    <span>Ajouter ma première chambre</span>
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
              {filteredRooms.map((room, index) => {
                const statusConfig = getStatusConfig(room.status)
                
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    className="card overflow-hidden cursor-pointer group"
                  >
                    {/* Image */}
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={getListingCardImageUrl(room.images[0])}
                        alt={room.name || room.room_number}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                        <Bed size={64} className="text-white" />
                      </div>
                    )}

                    {/* Contenu */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl group-hover:text-indigo-600 transition-colors">
                              {room.name || `Chambre ${room.room_number}`}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm">N° {room.room_number}</p>
                        </div>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <statusConfig.icon size={14} />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Bed size={16} className="text-indigo-600" />
                          <span className="capitalize">{getRoomTypeLabel(room.room_type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-indigo-600" />
                          <span>{room.capacity} pers.</span>
                        </div>
                      </div>

                      <div className="border-t pt-4 mb-4">
                        <p className="text-sm text-gray-500 mb-1">Prix par nuit</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {formatPrice(room.base_price)} <span className="text-sm">FCFA</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate(`/hotellerie/chambres/${room.id}`)}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          <Eye size={18} />
                          <span>Détails</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/hotellerie/chambres/${room.id}/modifier`)}
                          className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(room.id)}
                          className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
