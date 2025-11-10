import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  Home, Plus, Users, FileText, TrendingUp,
  AlertCircle, CheckCircle, DollarSign, Building,
  Calendar, Bell, ArrowUpRight, ArrowDownRight,
  Percent, Clock, MapPin
} from 'lucide-react'
import { getManagedProperties, getManagedPropertiesStats } from '@/services/rental/managedPropertyService'
import { getAllPayments } from '@/services/rental/paymentService'
import type { ManagedProperty, Payment } from '@/types/rental'

export default function RentalDashboardPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    vacant: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity] = useState([
    { type: 'payment', tenant: 'Marie Dupont', property: 'Appt. Centre Ville', amount: 450000, time: '2h' },
    { type: 'document', tenant: 'Jean Martin', property: 'Maison Cocody', action: 'Bail signé', time: '5h' },
    { type: 'maintenance', property: 'Studio Plateau', issue: 'Réparation plomberie', time: '1j' },
  ])
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([])
  const [currentRevenue, setCurrentRevenue] = useState(0)
  const [revenueTrend, setRevenueTrend] = useState<number | null>(0)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion' } })
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, authLoading, navigate])

  const computeMonthlyRevenue = (payments: Payment[]) => {
    const now = new Date()
    const sumByMonth = new Map<string, number>()

    payments.forEach((payment) => {
      const paymentDate = payment.payment_date ? new Date(payment.payment_date) : new Date(payment.period_year, payment.period_month - 1, 1)
      if (Number.isNaN(paymentDate.getTime())) {
        return
      }
      const key = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`
      const currentSum = sumByMonth.get(key) || 0
      sumByMonth.set(key, currentSum + Number(payment.amount || 0))
    })

    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' })
    const results: { month: string; revenue: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const rawLabel = formatter.format(date)
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).replace('.', '')
      results.push({ month: label, revenue: sumByMonth.get(key) || 0 })
    }

    return results
  }

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const [propertiesData, statsData, paymentsData] = await Promise.all([
        getManagedProperties(),
        getManagedPropertiesStats(),
        getAllPayments(),
      ])
      setProperties(propertiesData)
      setStats(statsData)

      const revenueData = computeMonthlyRevenue(paymentsData)
      setMonthlyRevenue(revenueData)

      const current = revenueData.length ? revenueData[revenueData.length - 1].revenue : 0
      const previous = revenueData.length > 1 ? revenueData[revenueData.length - 2].revenue : 0

      setCurrentRevenue(current)

      if (previous > 0) {
        const trendValue = ((current - previous) / previous) * 100
        setRevenueTrend(trendValue)
      } else if (previous === 0 && current > 0) {
        setRevenueTrend(null)
      } else {
        setRevenueTrend(0)
      }
    } catch (err: any) {
      console.error('Error fetching rental data:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  const maxRevenue = monthlyRevenue.length ? Math.max(...monthlyRevenue.map((m) => m.revenue)) : 0

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement du tableau de bord...</p>
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
            x: [0, 30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 0.9, 1],
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
                <Building className="text-primary-600" size={40} />
                Gestion Locative
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 text-lg"
              >
                Gérez tous vos biens et locataires en toute simplicité
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/gestion-locative/biens/nouveau')}
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

        {/* Statistiques animées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Biens en gestion', 
              value: stats.total, 
              icon: Home, 
              gradient: 'from-blue-500 to-blue-600',
              iconColor: 'text-blue-100'
            },
            { 
              title: 'Biens occupés', 
              value: stats.occupied, 
              icon: CheckCircle, 
              gradient: 'from-green-500 to-green-600',
              iconColor: 'text-green-100',
              badge: '+3 ce mois'
            },
            { 
              title: 'Biens vacants', 
              value: stats.vacant, 
              icon: AlertCircle, 
              gradient: 'from-orange-500 to-orange-600',
              iconColor: 'text-orange-100'
            },
            { 
              title: "Taux d'occupation", 
              value: `${stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%`, 
              icon: TrendingUp, 
              gradient: 'from-purple-500 to-purple-600',
              iconColor: 'text-purple-100',
              trend: '+5%'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              className={`card bg-gradient-to-br ${stat.gradient} text-white overflow-hidden relative group cursor-pointer`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`${stat.iconColor} text-sm mb-1 font-medium`}>{stat.title}</p>
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-4xl font-bold"
                  >
                    {stat.value}
                  </motion.p>
                  {stat.badge && (
                    <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                      {stat.badge}
                    </span>
                  )}
                  {stat.trend && (
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight size={16} />
                      <span className="text-sm font-medium">{stat.trend}</span>
                    </div>
                  )}
                </div>
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <stat.icon size={56} className="opacity-20" />
                </motion.div>
              </div>
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Menu rapide avec animations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Home, title: 'Mes Biens', desc: 'Gérer mes biens', path: '/gestion-locative/biens', color: 'text-blue-600', bg: 'hover:bg-blue-50' },
            { icon: Users, title: 'Locataires', desc: 'Gérer les locataires', path: '/gestion-locative/locataires', color: 'text-green-600', bg: 'hover:bg-green-50' },
            { icon: DollarSign, title: 'Paiements', desc: 'Suivi paiements', path: '/gestion-locative/paiements', color: 'text-purple-600', bg: 'hover:bg-purple-50' },
            { icon: FileText, title: 'Documents', desc: 'Gérer documents', path: '/gestion-locative/documents', color: 'text-orange-600', bg: 'hover:bg-orange-50' },
          ].map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`card ${item.bg} transition-all text-left p-6 group`}
            >
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <item.icon className={`${item.color} mb-3 group-hover:scale-110 transition-transform`} size={36} />
              </motion.div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
              <motion.div
                className="mt-2 flex items-center gap-1 text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span>Accéder</span>
                <ArrowUpRight size={16} />
              </motion.div>
            </motion.button>
          ))}
        </motion.div>

        {/* Grid 2 colonnes : Graphique + Activité */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique des revenus */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2 card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Revenus Mensuels</h2>
                <p className="text-gray-600 text-sm mt-1">Évolution sur 6 mois</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total ce mois</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(currentRevenue)} FCFA</p>
                {revenueTrend === null ? (
                  <div className="text-xs text-gray-500 mt-2 italic">Nouveaux revenus ce mois</div>
                ) : (
                  <div
                    className={`flex items-center justify-end gap-1 text-sm mt-1 ${
                      (revenueTrend || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {(revenueTrend || 0) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>
                      {(revenueTrend || 0) >= 0 ? '+' : ''}{(revenueTrend || 0).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative h-64">
              {monthlyRevenue.map((month, index) => {
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                    className="absolute bottom-0 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg hover:from-primary-700 hover:to-primary-500 transition-colors cursor-pointer group"
                    style={{
                      left: `${(index / monthlyRevenue.length) * 100}%`,
                      width: `${80 / monthlyRevenue.length}%`,
                    }}
                  >
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatPrice(month.revenue)} FCFA
                    </div>
                  </motion.div>
                )
              })}
              <div className="absolute bottom-0 left-0 right-0 flex justify-around border-t pt-3">
                {monthlyRevenue.map((month, index) => (
                  <span key={index} className="text-sm text-gray-600 font-medium">
                    {month.month}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Activité récente */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Activité Récente</h2>
              <Bell className="text-gray-400" size={20} />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'payment' ? 'bg-green-100' :
                    activity.type === 'document' ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'payment' && <DollarSign className="text-green-600" size={20} />}
                    {activity.type === 'document' && <FileText className="text-blue-600" size={20} />}
                    {activity.type === 'maintenance' && <AlertCircle className="text-orange-600" size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.tenant || activity.property}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.type === 'payment' && `Paiement de ${formatPrice(activity.amount!)} FCFA`}
                      {activity.type === 'document' && activity.action}
                      {activity.type === 'maintenance' && activity.issue}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      Il y a {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Liste des biens récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Mes Biens</h2>
            <button
              onClick={() => navigate('/gestion-locative/biens')}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group"
            >
              <span>Voir tout</span>
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          {properties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Home size={80} className="mx-auto text-gray-300 mb-4" />
              </motion.div>
              <p className="text-2xl text-gray-700 font-bold mb-2">Aucun bien en gestion</p>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Commencez par ajouter votre premier bien à gérer et profitez de tous les outils de gestion
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/gestion-locative/biens/nouveau')}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
              >
                <Plus size={24} />
                <span>Ajouter mon premier bien</span>
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  onClick={() => navigate(`/gestion-locative/biens/${property.id}`)}
                  className="border-2 border-gray-100 rounded-xl p-6 hover:border-primary-300 transition-all cursor-pointer group bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary-600 transition-colors">
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                        <MapPin size={14} />
                        <p className="truncate">{property.address}</p>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.status === 'occupied'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {property.status === 'occupied' ? '✓ Occupé' : '○ Vacant'}
                    </motion.span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Loyer mensuel</p>
                        <p className="text-primary-600 font-bold text-xl">
                          {formatPrice(property.monthly_rent)} <span className="text-sm">FCFA</span>
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="bg-primary-100 p-3 rounded-full group-hover:bg-primary-600 transition-colors"
                      >
                        <ArrowUpRight className="text-primary-600 group-hover:text-white transition-colors" size={20} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
