import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Users, Mail, Phone, Home, AlertCircle,
  Eye, UserX, Calendar, DollarSign, MapPin, FileText,
  CheckCircle, Clock, ArrowUpRight, Building2, User
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getTenants, terminateTenant } from '@/services/rental/tenantService'
import type { Tenant } from '@/types/rental'
import toast from 'react-hot-toast'

export default function TenantsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyFilter = searchParams.get('property')
  
  const { user, loading: authLoading } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'terminated'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion-locative/locataires' } })
      return
    }

    if (user) {
      fetchTenants()
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    filterTenants()
  }, [tenants, searchQuery, statusFilter])

  const fetchTenants = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const data = await getTenants()
      setTenants(data)
    } catch (err: any) {
      console.error('Error fetching tenants:', err)
      setError('Erreur lors du chargement des locataires')
    } finally {
      setLoading(false)
    }
  }

  const filterTenants = () => {
    let filtered = [...tenants]

    if (propertyFilter) {
      filtered = filtered.filter((t) => t.managed_property_id === propertyFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.full_name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.phone.toLowerCase().includes(query)
      )
    }

    setFilteredTenants(filtered)
  }

  const handleTerminate = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir terminer la location de ${name} ?`)) {
      return
    }

    const loadingToast = toast.loading('Terminaison en cours...')
    try {
      await terminateTenant(id)
      toast.success('Location terminée avec succès', { id: loadingToast })
      fetchTenants()
    } catch (err: any) {
      console.error('Error terminating tenant:', err)
      toast.error('Erreur lors de la terminaison', { id: loadingToast })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    terminated: tenants.filter(t => t.status === 'terminated').length,
    totalRevenue: tenants.filter(t => t.status === 'active').reduce((sum, t) => sum + t.monthly_rent, 0)
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
          <p className="text-xl font-medium text-gray-700">Chargement des locataires...</p>
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
          className="absolute top-20 right-10 w-72 h-72 bg-green-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 28, repeat: Infinity }}
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
                className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <Users className="text-primary-600" size={40} />
                Mes Locataires
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 text-lg"
              >
                Gérez vos locataires et suivez leurs paiements
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/gestion-locative/locataires/nouveau')}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
            >
              <Plus size={24} />
              <span>Ajouter un locataire</span>
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
            { title: 'Total locataires', value: stats.total, icon: Users, gradient: 'from-blue-500 to-blue-600' },
            { title: 'Actifs', value: stats.active, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
            { title: 'Terminés', value: stats.terminated, icon: Clock, gradient: 'from-gray-500 to-gray-600' },
            { title: 'Revenus actifs', value: `${formatPrice(stats.totalRevenue)} FCFA`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600' },
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
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
                <option value="terminated">Terminés</option>
              </select>
            </div>
          </div>
          {filteredTenants.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredTenants.length} locataire{filteredTenants.length > 1 ? 's' : ''} trouvé{filteredTenants.length > 1 ? 's' : ''}
            </div>
          )}
        </motion.div>

        {/* Liste des locataires */}
        <AnimatePresence mode="wait">
          {filteredTenants.length === 0 ? (
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
                <Users size={80} className="mx-auto text-gray-300 mb-4" />
              </motion.div>
              {tenants.length === 0 ? (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucun locataire</p>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Ajoutez votre premier locataire pour commencer la gestion
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/gestion-locative/locataires/nouveau')}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
                  >
                    <Plus size={24} />
                    <span>Ajouter mon premier locataire</span>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTenants.map((tenant, index) => {
                const property = (tenant as any).managed_properties
                
                return (
                  <motion.div
                    key={tenant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    className="card cursor-pointer group overflow-hidden"
                  >
                    {/* Avatar & Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg"
                        >
                          {tenant.full_name.charAt(0).toUpperCase()}
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">
                            {tenant.full_name}
                          </h3>
                          {property && (
                            <p className="text-gray-600 text-sm flex items-center gap-1">
                              <Home size={14} />
                              {property.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tenant.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tenant.status === 'active' ? '✓ Actif' : '○ Terminé'}
                      </motion.span>
                    </div>

                    {/* Coordonnées */}
                    <div className="space-y-3 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-primary-600 flex-shrink-0" />
                        <span className="truncate">{tenant.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-primary-600 flex-shrink-0" />
                        <span>{tenant.phone}</span>
                      </div>
                    </div>

                    {/* Loyer */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Loyer mensuel</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(tenant.monthly_rent)}
                        </span>
                        <span className="text-sm text-gray-500">FCFA</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/gestion-locative/locataires/${tenant.id}`)
                        }}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        <span>Détails</span>
                      </motion.button>
                      {tenant.status === 'active' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTerminate(tenant.id, tenant.full_name)
                          }}
                          className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Terminer la location"
                        >
                          <UserX size={18} />
                        </motion.button>
                      )}
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
