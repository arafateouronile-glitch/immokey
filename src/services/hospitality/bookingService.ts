import { supabase } from '@/lib/supabase'
import type { HospitalityBooking } from '@/types/hospitality'

/**
 * Récupérer toutes les réservations d'un établissement
 */
export async function getEstablishmentBookings(establishmentId: string): Promise<HospitalityBooking[]> {
  const { data, error } = await supabase
    .from('hospitality_bookings')
    .select('*')
    .eq('establishment_id', establishmentId)
    .order('check_in', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    throw new Error('Impossible de récupérer les réservations')
  }

  return data || []
}

/**
 * Récupérer toutes les réservations de l'organisation
 */
export async function getBookings(organizationId?: string): Promise<HospitalityBooking[]> {
  let query = supabase
    .from('hospitality_bookings')
    .select('*')
    .order('check_in', { ascending: false })

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
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
export async function getBookingsStats(organizationId?: string) {
  const bookings = await getBookings(organizationId)

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
      const checkIn = new Date(b.check_in)
      return checkIn.toDateString() === today.toDateString() && b.status === 'confirmed'
    }).length,
    departing_today: bookings.filter(b => {
      const checkOut = new Date(b.check_out)
      return checkOut.toDateString() === today.toDateString() && b.status === 'checked_in'
    }).length,
  }

  return stats
}

/**
 * Créer une nouvelle réservation
 */
export async function createBooking(bookingData: Partial<HospitalityBooking>): Promise<HospitalityBooking> {
  const { data, error } = await supabase
    .from('hospitality_bookings')
    .insert(bookingData)
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
