import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { HospitalityBooking } from '@/types/hospitality'

/**
 * Récupérer toutes les réservations d'un établissement
 */
export async function getEstablishmentBookings(establishmentId: string): Promise<HospitalityBooking[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  const { data, error } = await supabase
    .from('hospitality_bookings')
    .select('*')
    .eq('establishment_id', establishmentId)
    .order('check_in_date', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    throw new Error('Impossible de récupérer les réservations')
  }

  return data || []
}

/**
 * Récupérer toutes les réservations de l'organisation
 */
interface BookingFilters {
  establishment_id?: string
  status?: string
  payment_status?: string
  date_from?: string
  date_to?: string
  search?: string
}

export async function getBookings(filters: BookingFilters = {}): Promise<HospitalityBooking[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  let query = supabase
    .from('hospitality_bookings')
    .select('*')
    .order('check_in_date', { ascending: false })

  if (filters.establishment_id) {
    query = query.eq('establishment_id', filters.establishment_id)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.payment_status) {
    query = query.eq('payment_status', filters.payment_status)
  }
  if (filters.date_from) {
    query = query.gte('check_in_date', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('check_out_date', filters.date_to)
  }
  if (filters.search) {
    const searchValue = `%${filters.search}%`
    query = query.or(
      [
        `guest_name.ilike.${searchValue}`,
        `guest_email.ilike.${searchValue}`,
        `guest_phone.ilike.${searchValue}`,
        `booking_reference.ilike.${searchValue}`,
      ].join(',')
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching bookings:', error)
    throw new Error('Impossible de récupérer les réservations')
  }

  return data || []
}

/**
 * Récupérer une réservation par ID
 */
export async function getBooking(bookingId: string): Promise<HospitalityBooking> {
  const { data, error } = await supabase
    .from('hospitality_bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (error) {
    console.error('Error fetching booking:', error)
    throw new Error('Impossible de récupérer la réservation')
  }

  return data
}

/**
 * Récupérer les statistiques des réservations
 */
export async function getBookingsStats(establishmentId?: string) {
  if (!isSupabaseConfigured) {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      checked_in: 0,
      checked_out: 0,
      cancelled: 0,
      arriving_today: 0,
      departing_today: 0,
      revenue: 0,
    }
  }

  const bookings = await getBookings(
    establishmentId ? { establishment_id: establishmentId } : {}
  )

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    checked_in: bookings.filter(b => b.status === 'checked_in').length,
    checked_out: bookings.filter(b => b.status === 'checked_out').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    arriving_today: bookings.filter(b => {
      const checkIn = new Date(b.check_in_date)
      return checkIn.toDateString() === today.toDateString() && b.status === 'confirmed'
    }).length,
    departing_today: bookings.filter(b => {
      const checkOut = new Date(b.check_out_date)
      return checkOut.toDateString() === today.toDateString() && b.status === 'checked_in'
    }).length,
    revenue: bookings
      .filter(b => b.payment_status === 'paid' || b.payment_status === 'partial')
      .reduce((acc, booking) => acc + Number(booking.total_amount || 0), 0),
  }

  return stats
}

/**
 * Créer une nouvelle réservation
 */
const BOOKING_PREFIX = 'BK'

function generateBookingReference(date = new Date()) {
  const year = date.getFullYear()
  const stamp = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${BOOKING_PREFIX}-${year}-${stamp}`
}

export async function createBooking(bookingData: Partial<HospitalityBooking>): Promise<HospitalityBooking> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  const checkIn = bookingData.check_in_date ? new Date(bookingData.check_in_date) : null
  const checkOut = bookingData.check_out_date ? new Date(bookingData.check_out_date) : null

  if (!checkIn || !checkOut || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error('Dates de séjour invalides')
  }

  if (checkOut <= checkIn) {
    throw new Error('La date de départ doit être postérieure à la date d\'arrivée')
  }

  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
  const pricePerNight = Number(bookingData.price_per_night ?? 0)
  const taxes = Number(bookingData.taxes ?? 0)
  const fees = Number(bookingData.fees ?? 0)
  const discount = Number(bookingData.discount ?? 0)
  const depositAmount = Number(bookingData.deposit_amount ?? 0)

  if (pricePerNight <= 0) {
    throw new Error('Le prix par nuit doit être supérieur à zéro')
  }

  const subtotal = pricePerNight * nights
  const total = subtotal + taxes + fees - discount

  const payload: Partial<HospitalityBooking> = {
    ...bookingData,
    check_in_date: checkIn.toISOString().split('T')[0],
    check_out_date: checkOut.toISOString().split('T')[0],
    nights,
    price_per_night: pricePerNight,
    subtotal,
    taxes,
    fees,
    discount,
    total_amount: total,
    currency: bookingData.currency ?? 'FCFA',
    status: bookingData.status ?? 'pending',
    payment_status: bookingData.payment_status ?? 'pending',
    deposit_amount: depositAmount,
    booking_reference: bookingData.booking_reference || generateBookingReference(checkIn),
  }

  const { data, error } = await supabase
    .from('hospitality_bookings')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    throw new Error('Impossible de créer la réservation')
  }

  return data
}

/**
 * Mettre à jour une réservation
 */
export async function updateBooking(
  bookingId: string,
  updates: Partial<HospitalityBooking>
): Promise<HospitalityBooking> {
  const { data, error } = await supabase
    .from('hospitality_bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single()

  if (error) {
    console.error('Error updating booking:', error)
    throw new Error('Impossible de mettre à jour la réservation')
  }

  return data
}

/**
 * Annuler une réservation
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('hospitality_bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) {
    console.error('Error cancelling booking:', error)
    throw new Error('Impossible d\'annuler la réservation')
  }
}

/**
 * Check-in d'une réservation
 */
export async function checkInBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('hospitality_bookings')
    .update({ status: 'checked_in' })
    .eq('id', bookingId)

  if (error) {
    console.error('Error checking in:', error)
    throw new Error('Impossible de faire le check-in')
  }
}

/**
 * Check-out d'une réservation
 */
export async function checkOutBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('hospitality_bookings')
    .update({ status: 'checked_out' })
    .eq('id', bookingId)

  if (error) {
    console.error('Error checking out:', error)
    throw new Error('Impossible de faire le check-out')
  }
}
