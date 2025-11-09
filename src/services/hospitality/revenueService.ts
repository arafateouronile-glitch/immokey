import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export type RevenuePeriod = 'day' | 'week' | 'month'

export interface RevenueDataPoint {
  date: string
  revenue: number
  bookings: number
}

export interface RevenueStats {
  total: number
  average: number
  growth: number
  period: string
  data: RevenueDataPoint[]
}

/**
 * Récupérer les données de revenus pour une période donnée
 */
export async function getRevenueData(
  period: RevenuePeriod = 'month',
  startDate?: Date,
  endDate?: Date
): Promise<RevenueStats> {
  if (!isSupabaseConfigured) {
    return {
      total: 0,
      average: 0,
      growth: 0,
      period: period,
      data: [],
    }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // Définir les dates par défaut selon la période
    const now = new Date()
    let start: Date
    let end: Date = now

    if (startDate && endDate) {
      start = startDate
      end = endDate
    } else {
      switch (period) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
          break
        case 'week':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)
          break
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
          break
      }
    }

    // Récupérer toutes les réservations payées dans la période
    // RLS policies gèrent automatiquement l'accès basé sur l'organisation
    const { data: bookings, error } = await supabase
      .from('hospitality_bookings')
      .select(
        `
        total_amount,
        payment_status,
        check_in_date,
        created_at
      `
      )
      .eq('payment_status', 'paid')
      .gte('check_in_date', start.toISOString().split('T')[0])
      .lte('check_in_date', end.toISOString().split('T')[0])
      .order('check_in_date', { ascending: true })

    if (error) throw error

    if (!bookings || bookings.length === 0) {
      return {
        total: 0,
        average: 0,
        growth: 0,
        period: period,
        data: [],
      }
    }

    // Grouper par période
    const groupedData = new Map<string, { revenue: number; bookings: number }>()

    bookings.forEach((booking) => {
      const date = new Date(booking.check_in_date)
      let key: string

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0] // YYYY-MM-DD
          break
        case 'week':
          // Semaine commence le lundi
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay() + 1)
          key = `S${getWeekNumber(weekStart)}-${weekStart.getFullYear()}`
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      const current = groupedData.get(key) || { revenue: 0, bookings: 0 }
      groupedData.set(key, {
        revenue: current.revenue + (booking.total_amount || 0),
        bookings: current.bookings + 1,
      })
    })

    // Convertir en tableau et trier
    const data: RevenueDataPoint[] = Array.from(groupedData.entries())
      .map(([date, values]) => ({
        date,
        revenue: values.revenue,
        bookings: values.bookings,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculer les statistiques
    const total = data.reduce((sum, point) => sum + point.revenue, 0)
    const average = data.length > 0 ? total / data.length : 0

    // Calculer la croissance (comparaison des deux dernières périodes)
    let growth = 0
    if (data.length >= 2) {
      const lastPeriod = data[data.length - 1].revenue
      const previousPeriod = data[data.length - 2].revenue
      if (previousPeriod > 0) {
        growth = ((lastPeriod - previousPeriod) / previousPeriod) * 100
      }
    }

    return {
      total,
      average,
      growth,
      period: period,
      data,
    }
  } catch (error: any) {
    console.error('Error fetching revenue data:', error)
    throw error
  }
}

/**
 * Calculer le numéro de semaine
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

