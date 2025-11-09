// Types pour le module de gestion hôtelière (hôtels, auberges, apparthotels)

export type EstablishmentType = 'hotel' | 'auberge' | 'apparthotel' | 'residence' | 'gite' | 'autre'
export type RoomType = 'single' | 'double' | 'twin' | 'suite' | 'apartment' | 'family' | 'dormitory'
export type BedType = 'single' | 'double' | 'queen' | 'king'
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'
export type AvailabilityType = 'available' | 'booked' | 'maintenance' | 'blocked'
export type PriceModifierType = 'fixed' | 'percentage' | 'multiplier'
export type BookingSource = 'direct' | 'booking.com' | 'airbnb' | 'phone' | 'walk_in' | 'other'

export interface HospitalityEstablishment {
  id: string
  user_id: string
  organization_id?: string
  
  // Type d'établissement
  establishment_type: EstablishmentType
  
  // Informations générales
  name: string
  description?: string
  address: string
  city: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  
  // Contact
  phone: string
  email?: string
  website?: string
  
  // Équipements et services
  amenities: string[]
  
  // Informations administratives
  registration_number?: string
  license_number?: string
  tax_id?: string
  
  // Photos
  cover_image_url?: string
  photo_urls: string[]
  
  // Horaires
  check_in_time: string
  check_out_time: string
  
  // Statut
  status: 'active' | 'inactive' | 'archived'
  
  // Métadonnées
  notes?: string
  
  // Réservation publique
  slug?: string
  primary_color?: string
  secondary_color?: string
  logo_url?: string
  public_booking_enabled?: boolean
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  rooms_count?: number
  active_bookings_count?: number
}

export interface HospitalityRoom {
  id: string
  establishment_id: string
  
  // Informations de la chambre
  room_number: string
  room_type: RoomType
  name?: string
  description?: string
  
  // Capacité
  max_guests: number
  beds?: number
  bed_type?: BedType
  
  // Caractéristiques
  surface_area?: number
  floor?: number
  amenities: string[]
  
  // Photos
  photo_urls: string[]
  
  // Tarif de base
  base_price_per_night: number
  currency: string
  
  // Statut
  status: 'active' | 'maintenance' | 'inactive'
  
  // Métadonnées
  notes?: string
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  establishment?: HospitalityEstablishment
  current_bookings?: HospitalityBooking[]
}

export interface HospitalityBooking {
  id: string
  establishment_id: string
  room_id: string
  
  // Informations du client
  guest_name: string
  guest_email: string
  guest_phone: string
  guest_id_type?: string
  guest_id_number?: string
  guest_country?: string
  
  // Période de séjour
  check_in_date: string
  check_out_date: string
  nights: number
  
  // Tarification
  price_per_night: number
  subtotal: number
  taxes: number
  fees: number
  discount: number
  total_amount: number
  currency: string
  
  // Statut de la réservation
  status: BookingStatus
  
  // Paiement
  payment_status: PaymentStatus
  payment_method?: string
  deposit_amount: number
  deposit_paid_at?: string
  balance_paid_at?: string
  
  // Dates importantes
  confirmed_at?: string
  checked_in_at?: string
  checked_out_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  
  // Notes et remarques
  guest_requests?: string
  internal_notes?: string
  
  // Référence
  booking_reference: string
  
  // Source de réservation
  booking_source?: BookingSource
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  establishment?: HospitalityEstablishment
  room?: HospitalityRoom
}

export interface RoomAvailability {
  id: string
  room_id: string
  
  // Période
  date_from: string
  date_to: string
  
  // Type de blocage
  availability_type: AvailabilityType
  
  // Référence
  booking_id?: string
  
  // Raison
  reason?: string
  
  // Statut
  status: 'active' | 'cancelled'
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  room?: HospitalityRoom
  booking?: HospitalityBooking
}

export interface PricingRule {
  id: string
  establishment_id?: string
  room_id?: string
  
  // Nom de la règle
  name: string
  
  // Période d'application
  date_from?: string
  date_to?: string
  day_of_week?: number // 0 = Dimanche, 6 = Samedi
  
  // Modification du prix
  price_modifier_type: PriceModifierType
  price_modifier_value: number
  
  // Conditions
  min_nights?: number
  max_nights?: number
  advance_booking_days?: number
  
  // Priorité
  priority: number
  
  // Statut
  status: 'active' | 'inactive'
  
  created_at: string
  updated_at: string
}

// Types pour les formulaires
export interface CreateEstablishmentData {
  establishment_type: EstablishmentType
  name: string
  description?: string
  address: string
  city: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  phone: string
  email?: string
  website?: string
  amenities?: string[]
  registration_number?: string
  license_number?: string
  tax_id?: string
  cover_image_url?: string
  photo_urls?: string[]
  check_in_time?: string
  check_out_time?: string
  notes?: string
}

export interface CreateRoomData {
  establishment_id: string
  room_number: string
  room_type: RoomType
  name?: string
  description?: string
  max_guests: number
  beds?: number
  bed_type?: BedType
  surface_area?: number
  floor?: number
  amenities?: string[]
  photo_urls?: string[]
  base_price_per_night: number
  currency?: string
  notes?: string
}

export interface CreateBookingData {
  establishment_id: string
  room_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  guest_id_type?: string
  guest_id_number?: string
  guest_country?: string
  check_in_date: string
  check_out_date: string
  price_per_night: number
  taxes?: number
  fees?: number
  discount?: number
  payment_method?: string
  deposit_amount?: number
  guest_requests?: string
  internal_notes?: string
  booking_source?: BookingSource
}

export interface CreateAvailabilityData {
  room_id: string
  date_from: string
  date_to: string
  availability_type: AvailabilityType
  booking_id?: string
  reason?: string
}

export interface CreatePricingRuleData {
  establishment_id?: string
  room_id?: string
  name: string
  date_from?: string
  date_to?: string
  day_of_week?: number
  price_modifier_type: PriceModifierType
  price_modifier_value: number
  min_nights?: number
  max_nights?: number
  advance_booking_days?: number
  priority?: number
}

// Types pour les statistiques
export interface HospitalityDashboardStats {
  total_establishments: number
  active_establishments: number
  total_rooms: number
  occupied_rooms: number
  available_rooms: number
  bookings_today: number
  bookings_this_month: number
  revenue_this_month: number
  occupancy_rate: number
  average_booking_value: number
}

// Types pour les requêtes
export interface RoomAvailabilityCheck {
  room_id: string
  check_in_date: string
  check_out_date: string
}

export interface BookingSearchFilters {
  establishment_id?: string
  room_id?: string
  status?: BookingStatus
  payment_status?: PaymentStatus
  check_in_date_from?: string
  check_in_date_to?: string
  guest_email?: string
  booking_reference?: string
}
