import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { HospitalityEstablishment, HospitalityRoom } from '@/types/hospitality'

export interface PublicEstablishmentInfo extends HospitalityEstablishment {
  primary_color: string
  secondary_color: string
  logo_url?: string
  public_booking_enabled: boolean
}

export interface RoomAvailability {
  room: HospitalityRoom
  available: boolean
  price_per_night: number
  total_price?: number
  nights?: number
}

/**
 * Récupérer les informations publiques d'un établissement par slug
 */
export async function getPublicEstablishmentBySlug(
  slug: string
): Promise<PublicEstablishmentInfo | null> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const { data, error } = await supabase
      .from('hospitality_establishments')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .eq('public_booking_enabled', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Établissement non trouvé
      }
      throw error
    }

    return data as PublicEstablishmentInfo
  } catch (error: any) {
    console.error('Error fetching public establishment:', error)
    throw error
  }
}

/**
 * Récupérer les informations publiques d'un établissement par ID
 */
export async function getPublicEstablishmentById(
  id: string
): Promise<PublicEstablishmentInfo | null> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const { data, error } = await supabase
      .from('hospitality_establishments')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .eq('public_booking_enabled', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data as PublicEstablishmentInfo
  } catch (error: any) {
    console.error('Error fetching public establishment:', error)
    throw error
  }
}

/**
 * Récupérer les chambres publiques d'un établissement
 */
export async function getPublicRooms(establishmentId: string): Promise<HospitalityRoom[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('hospitality_rooms')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('status', 'active')
      .order('base_price_per_night', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching public rooms:', error)
    throw error
  }
}

/**
 * Vérifier la disponibilité d'une chambre pour une période donnée
 */
export async function checkRoomAvailability(
  roomId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false
  }

  try {
    // Vérifier s'il y a des réservations qui chevauchent cette période
    // Une réservation chevauche si : check_in_date < checkOutDate ET check_out_date > checkInDate
    const { data, error } = await supabase
      .from('hospitality_bookings')
      .select('id')
      .eq('room_id', roomId)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .lt('check_in_date', checkOutDate)
      .gt('check_out_date', checkInDate)

    if (error) throw error

    // Si aucune réservation ne chevauche, la chambre est disponible
    return !data || data.length === 0
  } catch (error: any) {
    console.error('Error checking room availability:', error)
    return false
  }
}

/**
 * Vérifier la disponibilité de toutes les chambres d'un établissement pour une période
 */
export async function getAvailableRooms(
  establishmentId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<RoomAvailability[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    // Récupérer toutes les chambres actives
    const rooms = await getPublicRooms(establishmentId)

    // Vérifier la disponibilité de chaque chambre
    const availabilityPromises = rooms.map(async (room) => {
      const available = await checkRoomAvailability(room.id, checkInDate, checkOutDate)

      // Calculer le nombre de nuits
      const checkIn = new Date(checkInDate)
      const checkOut = new Date(checkOutDate)
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        room,
        available,
        price_per_night: room.base_price_per_night,
        total_price: available ? room.base_price_per_night * nights : undefined,
        nights,
      }
    })

    return await Promise.all(availabilityPromises)
  } catch (error: any) {
    console.error('Error getting available rooms:', error)
    throw error
  }
}

/**
 * Créer une réservation publique (sans authentification)
 */
export async function createPublicBooking(data: {
  establishment_id: string
  room_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  guest_country?: string
  guest_requests?: string
}): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    // Vérifier la disponibilité
    const isAvailable = await checkRoomAvailability(
      data.room_id,
      data.check_in_date,
      data.check_out_date
    )

    if (!isAvailable) {
      throw new Error('Cette chambre n\'est pas disponible pour les dates sélectionnées')
    }

    // Récupérer les informations de la chambre pour calculer le prix
    const { data: room, error: roomError } = await supabase
      .from('hospitality_rooms')
      .select('base_price_per_night, currency')
      .eq('id', data.room_id)
      .single()

    if (roomError) throw roomError

    // Calculer le nombre de nuits
    const checkIn = new Date(data.check_in_date)
    const checkOut = new Date(data.check_out_date)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Calculer le total
    const subtotal = room.base_price_per_night * nights
    const total_amount = subtotal // Pour l'instant, pas de taxes ni frais

    // Créer la réservation
    const { data: booking, error: bookingError } = await supabase
      .from('hospitality_bookings')
      .insert({
        ...data,
        nights,
        price_per_night: room.base_price_per_night,
        subtotal,
        total_amount,
        currency: room.currency,
        status: 'pending',
        payment_status: 'pending',
        booking_source: 'direct',
      })
      .select('id')
      .single()

    if (bookingError) throw bookingError

    return booking.id
  } catch (error: any) {
    console.error('Error creating public booking:', error)
    throw error
  }
}

/**
 * Générer l'URL publique de réservation d'un établissement
 */
export function getPublicBookingUrl(establishment: {
  slug?: string
  id: string
}): string {
  const baseUrl = window.location.origin
  if (establishment.slug) {
    return `${baseUrl}/reservation/${establishment.slug}`
  }
  return `${baseUrl}/reservation/${establishment.id}`
}

