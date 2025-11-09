// Types de base pour l'application

export type ListingType = 'location' | 'vente'
export type PropertyType = 'appartement' | 'maison' | 'terrain' | 'bureau' | 'commerce'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  user_type: 'particulier' | 'professionnel'
  verified: boolean
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  type: ListingType
  property_type: PropertyType
  city: string
  neighborhood: string
  address: string
  price: number
  rooms: number
  bathrooms: number
  surface_area: number
  latitude?: number
  longitude?: number
  available: boolean
  featured: boolean
  created_at: string
  updated_at: string
  images: string[]
  amenities?: string[]
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  sort_order: number
}

export interface Favorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
}

export interface Inquiry {
  id: string
  listing_id: string
  from_user_id: string
  to_user_id: string
  message: string
  created_at: string
}

export interface SearchFilters {
  type?: ListingType
  property_type?: PropertyType
  city?: string
  neighborhood?: string
  min_price?: number
  max_price?: number
  min_rooms?: number
  min_surface?: number
  amenities?: string[]
}

