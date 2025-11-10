import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Building2, Plus, Bed, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { getEstablishments, getEstablishmentsStats } from '@/services/hospitality/establishmentService'
import { getRevenueData, type RevenuePeriod } from '@/services/hospitality/revenueService'
import type { HospitalityEstablishment } from '@/types/hospitality'
import RevenueChart from '@/components/hospitality/RevenueChart'

export default function HospitalityDashboardPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [establishments, setEstablishments] = useState<HospitalityEstablishment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('month')
  const [revenueData, setRevenueData] = useState<any>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const establishmentsList = Array.isArray(establishments) ? establishments : []
  const normalizedStats = {
    total: Number(stats.total) || 0,
    active: Number(stats.active) || 0,
    inactive: Number(stats.inactive) || 0,
  }

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/hospitality' } })
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
      const [establishmentsData, statsData] = await Promise.all([
        getEstablishments(),
        getEstablishmentsStats(),
      ])

      setEstablishments(Array.isArray(establishmentsData) ? establishmentsData : [])
      setStats({
        total: Number(statsData?.total) || 0,
        active: Number(statsData?.active) || 0,
        inactive: Number(statsData?.inactive) || 0,
      })
    } catch (err: any) {
      console.error('Error fetching hospitality data:', err)
      const errorMessage = err?.message || 'Erreur lors du chargement des données'
      
      if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setError('Les tables de gestion hôtelière ne sont pas installées. Veuillez exécuter le script SQL hospitality_management_schema.sql dans Supabase.')
      } else if (errorMessage.includes('JWT') || errorMessage.includes('auth')) {
        setError('Vous devez être connecté pour accéder à cette page.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenueData = async () => {
    if (!user) return

    setRevenueLoading(true)
    try {
      const data = await getRevenueData(revenuePeriod)
      const chartData = Array.isArray(data?.data)
        ? data.data.map((point: any) => ({
            month: point.date,
            revenue: Number(point.revenue) || 0,
            bookings: Number(point.bookings) || 0,
          }))
        : []

      setRevenueData({
        total: Number(data?.total) || 0,
        average: Number(data?.average) || 0,
        growth: Number(data?.growth) || 0,
        period: data?.period || revenuePeriod,
        data: chartData,
      })
    } catch (err: any) {
      console.error('Error fetching revenue data:', err)
    } finally {
      setRevenueLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRevenueData()
    }
  }, [user, revenuePeriod])

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <p className="text-neutral-600 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section avec gradient moderne - Version ultra compacte */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 border-b border-primary-500/20">
        <div className="relative container mx-auto container-padding py-4 md:py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 backdrop-blur-xl rounded-lg">
                <Building2 className="text-white" size={18} />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white tracking-tight mb-0.5">
                  Tableau de bord
                </h1>
                <p className="text-xs text-primary-100/80">
                  Gestion Hôtelière
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/hotellerie/etablissements/nouveau')}
              className="btn-primary group text-xs px-3 py-2 h-auto"
            >
              <Plus size={16} className="mr-1.5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Nouvel établissement</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto container-padding py-8 md:py-12">
        {/* Message d'erreur avec design premium */}
        {error && (
          <div className="card mb-8 bg-red-50 border border-red-100 animate-fade-in-down">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Erreur</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques avec design premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="stat-card gradient-primary animate-scale-in" style={{ animationDelay: '0s' }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                  <Building2 size={24} />
                </div>
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-primary-100 text-sm font-medium mb-1">Établissements</p>
              <p className="text-4xl font-bold mb-1">{normalizedStats.total}</p>
              <p className="text-primary-200 text-xs">Total</p>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                  <CheckCircle size={24} />
                </div>
                <Sparkles size={20} className="opacity-60" />
              </div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Actifs</p>
              <p className="text-4xl font-bold mb-1">{normalizedStats.active}</p>
              <p className="text-emerald-200 text-xs">En activité</p>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                  <AlertCircle size={24} />
                </div>
              </div>
              <p className="text-amber-100 text-sm font-medium mb-1">Inactifs</p>
              <p className="text-4xl font-bold mb-1">{normalizedStats.inactive}</p>
              <p className="text-amber-200 text-xs">En pause</p>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                  <TrendingUp size={24} />
                </div>
              </div>
              <p className="text-purple-100 text-sm font-medium mb-1">Taux d'activité</p>
              <p className="text-4xl font-bold mb-1">
                {normalizedStats.total > 0
                  ? Math.round((normalizedStats.active / normalizedStats.total) * 100)
                  : 0}%
              </p>
              <p className="text-purple-200 text-xs">Performance</p>
            </div>
          </div>
        </div>

        {/* Graphique de revenus */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-3">Évolution du chiffre d'affaires</h2>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-xl border border-neutral-200 p-1">
              <button
                onClick={() => setRevenuePeriod('day')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  revenuePeriod === 'day'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => setRevenuePeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  revenuePeriod === 'week'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setRevenuePeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  revenuePeriod === 'month'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Mois
              </button>
            </div>
          </div>
          {revenueLoading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200 p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
                <p className="text-neutral-600">Chargement des données...</p>
              </div>
            </div>
          ) : revenueData ? (
            <RevenueChart data={Array.isArray(revenueData.data) ? revenueData.data : []} period={revenuePeriod} />
          ) : null}
        </div>

        {/* Menu rapide avec design moderne */}
        <div className="mb-10">
          <h2 className="heading-3 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/hospitality/establishments')}
              className="card-hover group text-left p-6 animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="text-primary-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-neutral-900">Établissements</h3>
              <p className="text-neutral-500 text-sm mb-3">Gérer vos établissements</p>
              <div className="flex items-center text-primary-600 text-sm font-medium group-hover:gap-2 transition-all duration-300">
                <span>Voir</span>
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            <button
              onClick={() => navigate('/hospitality/rooms')}
              className="card-hover group text-left p-6 animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bed className="text-emerald-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-neutral-900">Chambres</h3>
              <p className="text-neutral-500 text-sm mb-3">Gérer les chambres</p>
              <div className="flex items-center text-emerald-600 text-sm font-medium group-hover:gap-2 transition-all duration-300">
                <span>Voir</span>
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            <button
              onClick={() => navigate('/hospitality/bookings')}
              className="card-hover group text-left p-6 animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="text-amber-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-neutral-900">Réservations</h3>
              <p className="text-neutral-500 text-sm mb-3">Gérer les réservations</p>
              <div className="flex items-center text-amber-600 text-sm font-medium group-hover:gap-2 transition-all duration-300">
                <span>Voir</span>
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            <button
              onClick={() => navigate('/hospitality')}
              className="card-hover group text-left p-6 animate-fade-in-up"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="text-purple-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-neutral-900">Statistiques</h3>
              <p className="text-neutral-500 text-sm mb-3">Revenus et analyses</p>
              <div className="flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all duration-300">
                <span>Voir</span>
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Liste des établissements avec design premium */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-3 mb-2">Mes établissements</h2>
              <p className="text-neutral-500">Vos établissements d'hébergement récents</p>
            </div>
            {establishmentsList.length > 0 && (
              <button
                onClick={() => navigate('/hospitality/establishments')}
                className="btn-ghost group"
              >
                <span>Voir tout</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </div>

          {establishmentsList.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl mb-6">
                <Building2 size={40} className="text-primary-400" />
              </div>
              <h3 className="heading-3 mb-3">Aucun établissement</h3>
              <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                Commencez par ajouter votre premier établissement d'hébergement pour gérer vos activités
              </p>
              <button
                onClick={() => navigate('/hospitality/establishments/new')}
                className="btn-primary group"
              >
                <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span>Ajouter un établissement</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {establishmentsList.slice(0, 6).map((establishment, index) => (
                <div
                  key={establishment.id}
                  onClick={() => navigate(`/hospitality/establishments/${establishment.id}`)}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 hover:shadow-large transition-all duration-300 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                >
                  {/* Gradient overlay au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2 text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {establishment.name}
                        </h3>
                        <p className="text-neutral-500 text-sm mb-3">{establishment.address}</p>
                      </div>
                      <span
                        className={`badge ${
                          establishment.status === 'active'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {establishment.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-neutral-400 text-xs mb-1">Type</p>
                        <p className="font-semibold text-neutral-900 capitalize">
                          {getEstablishmentTypeLabel(establishment.establishment_type)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-neutral-400 text-xs mb-1">Ville</p>
                        <p className="font-semibold text-neutral-900">{establishment.city}</p>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 bg-primary-50 rounded-xl">
                        <ArrowRight size={16} className="text-primary-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
