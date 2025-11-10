import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Calendar, Edit, Eye, Building2, User, Users, DollarSign,
  Clock, CheckCircle, XCircle, AlertCircle, MapPin, Phone, Mail,
  CreditCard, ArrowUpRight, Download, TrendingUp, Bed, Home
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getBookings, getBookingsStats } from '@/services/hospitality/bookingService'
import { getEstablishments } from '@/services/hospitality/establishmentService'
import type { HospitalityBooking, HospitalityEstablishment } from '@/types/hospitality'
import toast from 'react-hot-toast'

export default function BookingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<HospitalityBooking[]>([])
  const [establishments, setEstablishments] = useState<HospitalityEstablishment[]>([])
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    checked_in: 0,
    checked_out: 0,
    cancelled: 0,
    revenue: 0,
  })

  useEffect(() => {
    const stateEstablishmentId = (location.state as any)?.establishmentId
    if (stateEstablishmentId) {
      setEstablishmentId(stateEstablishmentId)
    }

    if (!authLoading && !user) {
      navigate('/hotellerie/connexion', { state: { from: '/hotellerie/reservations' } })
      return
    }

    if (user && !establishmentId) {
      fetchFirstEstablishment()
    }

    if (user && establishmentId) {
      fetchData()
    }
  }, [user, authLoading, navigate, location])

  useEffect(() => {
    if (user && establishmentId) {
      fetchData()
    }
  }, [establishmentId])

  const fetchFirstEstablishment = async () => {
    try {
      const establishments = await getEstablishments()
      if (establishments && establishments.length > 0) {
        setEstablishmentId(establishments[0].id)
      }
    } catch (err) {
      console.error('Error fetching establishments:', err)
    }
  }

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const [bookingsData, statsData, establishmentsData] = await Promise.all([
        getBookings({
          establishment_id: establishmentId || undefined,
        }),
        getBookingsStats(establishmentId || undefined),
        getEstablishments(),
      ])
      setBookings(bookingsData)
      setStats(statsData)
      setEstablishments(establishmentsData)
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'En attente', icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-800', gradient: 'from-yellow-500 to-yellow-600' },
      confirmed: { label: 'Confirmée', icon: CheckCircle, bg: 'bg-blue-100', text: 'text-blue-800', gradient: 'from-blue-500 to-blue-600' },
      checked_in: { label: 'En séjour', icon: Home, bg: 'bg-green-100', text: 'text-green-800', gradient: 'from-green-500 to-green-600' },
      checked_out: { label: 'Terminée', icon: CheckCircle, bg: 'bg-gray-100', text: 'text-gray-800', gradient: 'from-gray-500 to-gray-600' },
      cancelled: { label: 'Annulée', icon: XCircle, bg: 'bg-red-100', text: 'text-red-800', gradient: 'from-red-500 to-red-600' },
      no_show: { label: 'No-show', icon: AlertCircle, bg: 'bg-orange-100', text: 'text-orange-800', gradient: 'from-orange-500 to-orange-600' },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'En attente', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      partial: { label: 'Partiel', bg: 'bg-orange-100', text: 'text-orange-800' },
      paid: { label: '✓ Payé', bg: 'bg-green-100', text: 'text-green-800' },
      refunded: { label: 'Remboursé', bg: 'bg-red-100', text: 'text-red-800' },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number, currency: string = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.guest_phone && booking.guest_phone.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === 'all' || booking.payment_status === paymentStatusFilter

    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement des réservations...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Blobs animés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
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
                className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <Calendar className="text-cyan-600" size={40} />
                Réservations
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 text-lg"
              >
                Gérez toutes vos réservations en un seul endroit
              </motion.p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Export en cours...')}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={20} />
                <span>Exporter</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/hotellerie/reservations/nouvelle')}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
              >
                <Plus size={24} />
                <span>Nouvelle réservation</span>
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

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { title: 'Total', value: stats.total, icon: Calendar, gradient: 'from-cyan-500 to-cyan-600' },
            { title: 'En attente', value: stats.pending, icon: Clock, gradient: 'from-yellow-500 to-yellow-600' },
            { title: 'Confirmées', value: stats.confirmed, icon: CheckCircle, gradient: 'from-blue-500 to-blue-600' },
            { title: 'En séjour', value: stats.checked_in, icon: Home, gradient: 'from-green-500 to-green-600' },
            { title: 'Terminées', value: stats.checked_out, icon: CheckCircle, gradient: 'from-gray-500 to-gray-600' },
            { title: 'Revenus', value: `${new Intl.NumberFormat('fr-FR').format(stats.revenue)} FCFA`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              className={`card bg-gradient-to-br ${stat.gradient} text-white overflow-hidden relative`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-white/80 text-xs font-medium">{stat.title}</p>
                <stat.icon size={20} className="opacity-30" />
              </div>
              <p className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value : stat.value}</p>
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
                placeholder="Rechercher par client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 text-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-12 appearance-none"
              >
                <option value="all">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="checked_in">En séjour</option>
                <option value="checked_out">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="input-field pl-12 appearance-none"
              >
                <option value="all">Tous paiements</option>
                <option value="pending">En attente</option>
                <option value="partial">Partiel</option>
                <option value="paid">Payé</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
          </div>
          {filteredBookings.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredBookings.length} réservation(s) trouvée(s)
            </div>
          )}
        </motion.div>

        {/* Liste des réservations */}
        <AnimatePresence mode="wait">
          {filteredBookings.length === 0 ? (
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
                <Calendar size={80} className="mx-auto text-gray-300 mb-4" />
              </motion.div>
              {bookings.length === 0 ? (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucune réservation</p>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Commencez par créer votre première réservation
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/hotellerie/reservations/nouvelle')}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
                  >
                    <Plus size={24} />
                    <span>Créer ma première réservation</span>
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
              className="space-y-4"
            >
              {filteredBookings.map((booking, index) => {
                const statusConfig = getStatusConfig(booking.status)
                const paymentConfig = getPaymentStatusConfig(booking.payment_status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    className="card cursor-pointer group"
                    onClick={() => navigate(`/hotellerie/reservations/${booking.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Client info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-xl mb-2 group-hover:text-cyan-600 transition-colors flex items-center gap-2">
                              <User size={20} />
                              {booking.guest_name}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail size={14} />
                                {booking.guest_email}
                              </div>
                              {booking.guest_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone size={14} />
                                  {booking.guest_phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              <StatusIcon size={14} />
                              {statusConfig.label}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentConfig.bg} ${paymentConfig.text}`}>
                              {paymentConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-cyan-600" />
                            <div>
                              <p className="text-gray-500 text-xs">Arrivée</p>
                              <p className="font-medium">{formatDate(booking.check_in_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-cyan-600" />
                            <div>
                              <p className="text-gray-500 text-xs">Départ</p>
                              <p className="font-medium">{formatDate(booking.check_out_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-cyan-600" />
                            <div>
                              <p className="text-gray-500 text-xs">Personnes</p>
                              <p className="font-medium">{booking.number_of_guests}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bed size={16} className="text-cyan-600" />
                            <div>
                              <p className="text-gray-500 text-xs">Chambres</p>
                              <p className="font-medium">{(booking as any).rooms?.length || 1}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Montant et actions */}
                      <div className="flex flex-col items-end gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Montant total</p>
                          <p className="text-3xl font-bold text-cyan-600">
                            {formatPrice(booking.total_amount, booking.currency)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/hotellerie/reservations/${booking.id}`)
                            }}
                            className="btn-primary flex items-center gap-2"
                          >
                            <Eye size={18} />
                            <span>Détails</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/hotellerie/reservations/${booking.id}/modifier`)
                            }}
                            className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </motion.button>
                        </div>
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
