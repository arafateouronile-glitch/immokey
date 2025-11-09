import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, Plus, Calendar, CheckCircle, AlertCircle, Clock,
  Search, Filter, TrendingUp, Download, Eye, Users,
  Home, ArrowUpRight, ArrowDownRight, Receipt, CreditCard,
  Wallet, Building2, BarChart3, FileText, XCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getAllDueDates,
  getAllPayments,
  getPaymentStats,
} from '@/services/rental/paymentService'
import { getTenants } from '@/services/rental/tenantService'
import type { PaymentDueDate, Payment } from '@/types/rental'
import type { Tenant } from '@/types/rental'
import toast from 'react-hot-toast'

export default function PaymentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tenantFilter = searchParams.get('tenant')

  const { user, loading: authLoading } = useAuth()
  const [dueDates, setDueDates] = useState<PaymentDueDate[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'due_dates' | 'payments'>('due_dates')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total_due: 0,
    total_paid: 0,
    pending_count: 0,
    overdue_count: 0,
    paid_count: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion/paiements' } })
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, authLoading, navigate])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const [dueDatesData, paymentsData, tenantsData, statsData] = await Promise.all([
        getAllDueDates(),
        getAllPayments(),
        getTenants(),
        getPaymentStats(),
      ])

      let filteredDueDates = dueDatesData
      let filteredPayments = paymentsData

      if (tenantFilter) {
        filteredDueDates = filteredDueDates.filter((dd) => dd.tenant_id === tenantFilter)
        filteredPayments = filteredPayments.filter((p) => p.tenant_id === tenantFilter)
      }

      setDueDates(filteredDueDates)
      setPayments(filteredPayments)
      setTenants(tenantsData)
      setStats(statsData)
    } catch (err: any) {
      console.error('Error fetching payments data:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const filteredDueDates = dueDates.filter((dd) => {
    if (statusFilter !== 'all' && dd.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const tenant = tenants.find((t) => t.id === dd.tenant_id)
      const searchLower = searchQuery.toLowerCase()
      return (
        tenant?.full_name.toLowerCase().includes(searchLower) ||
        tenant?.email.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const filteredPayments = payments.filter((p) => {
    if (searchQuery.trim()) {
      const tenant = tenants.find((t) => t.id === p.tenant_id)
      const searchLower = searchQuery.toLowerCase()
      return (
        tenant?.full_name.toLowerCase().includes(searchLower) ||
        tenant?.email.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ]
    return months[month - 1]
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'En attente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Payé' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'En retard' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Annulé' },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const collectionRate = stats.total_due > 0 ? ((stats.total_paid / (stats.total_paid + stats.total_due)) * 100) : 0

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement des paiements...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Blobs animés en arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête */}
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
                className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <DollarSign className="text-emerald-600" size={40} />
                Paiements & Échéances
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 text-lg"
              >
                Suivi complet de vos revenus locatifs
              </motion.p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Export en cours...')}
                className="btn-secondary flex items-center gap-2 px-5 py-3"
              >
                <Download size={20} />
                <span>Exporter</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/gestion/paiements/nouveau')}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
              >
                <Plus size={24} />
                <span>Enregistrer un paiement</span>
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

        {/* Statistiques premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { title: 'Total dû', value: `${formatPrice(stats.total_due)} FCFA`, icon: AlertCircle, gradient: 'from-orange-500 to-orange-600', change: null },
            { title: 'Total perçu', value: `${formatPrice(stats.total_paid)} FCFA`, icon: CheckCircle, gradient: 'from-green-500 to-green-600', change: '+12%' },
            { title: 'En attente', value: stats.pending_count, icon: Clock, gradient: 'from-yellow-500 to-yellow-600', change: null },
            { title: 'En retard', value: stats.overdue_count, icon: AlertCircle, gradient: 'from-red-500 to-red-600', change: '-2' },
            { title: 'Taux encaissement', value: `${Math.round(collectionRate)}%`, icon: TrendingUp, gradient: 'from-blue-500 to-blue-600', change: '+3%' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              className={`card bg-gradient-to-br ${stat.gradient} text-white overflow-hidden relative`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-xs font-medium">{stat.title}</p>
                <stat.icon size={24} className="opacity-30" />
              </div>
              <p className="text-xl font-bold mb-1">{typeof stat.value === 'number' ? stat.value : stat.value}</p>
              {stat.change && (
                <div className="flex items-center gap-1 text-xs">
                  {stat.change.startsWith('+') ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  <span>{stat.change}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Onglets premium */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="card p-2 flex gap-2">
            {[
              { id: 'due_dates', label: 'Échéances', icon: Calendar, count: dueDates.length },
              { id: 'payments', label: 'Paiements', icon: DollarSign, count: payments.length },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="inline mr-2" size={18} />
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par locataire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 text-lg"
              />
            </div>
            {activeTab === 'due_dates' && (
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="input-field pl-12 appearance-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>
            )}
          </div>
          {(activeTab === 'due_dates' ? filteredDueDates.length : filteredPayments.length) > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {activeTab === 'due_dates' ? filteredDueDates.length : filteredPayments.length} résultat(s)
            </div>
          )}
        </motion.div>

        {/* Contenu */}
        <AnimatePresence mode="wait">
          {activeTab === 'due_dates' ? (
            <motion.div
              key="due-dates"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {filteredDueDates.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card text-center py-16"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar size={80} className="mx-auto text-gray-300 mb-4" />
                  </motion.div>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucune échéance</p>
                  <p className="text-gray-500">Il n'y a pas d'échéance pour le moment</p>
                </motion.div>
              ) : (
                filteredDueDates.map((dueDate, index) => {
                  const tenant = tenants.find((t) => t.id === dueDate.tenant_id)
                  const statusConfig = getStatusConfig(dueDate.status)
                  
                  return (
                    <motion.div
                      key={dueDate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                      onClick={() => navigate(`/gestion/paiements/echeances/${dueDate.id}`)}
                      className="card cursor-pointer overflow-hidden group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg">
                              {dueDate.period_month}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg group-hover:text-emerald-600 transition-colors">
                                {getMonthName(dueDate.period_month)} {dueDate.period_year}
                              </h3>
                              {tenant && (
                                <p className="text-gray-600 text-sm">
                                  {tenant.full_name}
                                </p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                              <statusConfig.icon size={14} />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={16} className="text-emerald-600" />
                              <span>{formatDate(dueDate.due_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Home size={16} className="text-emerald-600" />
                              <span>{formatPrice(dueDate.rent_amount)} FCFA</span>
                            </div>
                            {dueDate.charges_amount > 0 && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Receipt size={16} className="text-emerald-600" />
                                <span>{formatPrice(dueDate.charges_amount)} FCFA</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total</p>
                            <p className="text-3xl font-bold text-emerald-600">
                              {formatPrice(dueDate.total_amount)}
                            </p>
                            <p className="text-xs text-gray-500">FCFA</p>
                          </div>
                          {dueDate.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/gestion/paiements/nouveau?due_date=${dueDate.id}`)
                              }}
                              className="btn-primary flex items-center gap-2"
                            >
                              <CheckCircle size={16} />
                              <span>Enregistrer</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="payments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {filteredPayments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card text-center py-16"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <DollarSign size={80} className="mx-auto text-gray-300 mb-4" />
                  </motion.div>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucun paiement</p>
                  <p className="text-gray-500">Il n'y a pas de paiement enregistré</p>
                </motion.div>
              ) : (
                filteredPayments.map((payment, index) => {
                  const tenant = tenants.find((t) => t.id === payment.tenant_id)
                  
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                      onClick={() => navigate(`/gestion/paiements/${payment.id}`)}
                      className="card cursor-pointer overflow-hidden group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                              <CheckCircle size={24} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">
                                {getMonthName(payment.period_month)} {payment.period_year}
                              </h3>
                              {tenant && (
                                <p className="text-gray-600 text-sm">
                                  {tenant.full_name}
                                </p>
                              )}
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Payé
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={16} className="text-green-600" />
                              <span>{formatDate(payment.payment_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <CreditCard size={16} className="text-green-600" />
                              <span className="capitalize">{payment.payment_method}</span>
                            </div>
                            {payment.transaction_reference && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText size={16} className="text-green-600" />
                                <span className="truncate">{payment.transaction_reference}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Montant</p>
                            <p className="text-3xl font-bold text-green-600">
                              {formatPrice(payment.amount)}
                            </p>
                            <p className="text-xs text-gray-500">FCFA</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/gestion/paiements/${payment.id}`)
                            }}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <Eye size={16} />
                            <span>Détails</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
