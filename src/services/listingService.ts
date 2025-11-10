import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { SearchFilters } from '@/types'

export interface ListingFilters extends SearchFilters {
  available?: boolean
  featured?: boolean
}

export interface CreateListingData {
  title: string
  description: string
  type: 'location' | 'vente'
  property_type: 'appartement' | 'maison' | 'terrain' | 'bureau' | 'commerce'
  city: string
  neighborhood: string
  address: string
  price: number
  rooms: number
  bathrooms: number
  surface_area: number
  latitude?: number
  longitude?: number
  amenities?: string[]
  images?: string[]
}

/**
 * Récupérer toutes les annonces avec filtres optionnels
 * Optimisé : sélectionne seulement les colonnes nécessaires
 * 
 * @returns { data, total } si options est fourni, sinon retourne directement le tableau (compatibilité)
 */
export async function getListings(
  filters?: ListingFilters,
  options?: {
    limit?: number
    offset?: number
    selectColumns?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
): Promise<any[] | { data: any[]; total?: number }> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase non configuré. Retour de données vides.')
    return options ? { data: [] } : []
  }

  try {
    // Sélection optimisée : seulement les colonnes nécessaires pour les cartes
    const selectColumns = options?.selectColumns || 
      'id, title, type, property_type, city, neighborhood, price, rooms, bathrooms, surface_area, created_at, listing_images(url, sort_order)'
    
    let query = supabase
      .from('listings')
      .select(selectColumns, { count: 'exact' })
      .eq('available', filters?.available ?? true)

    // Filtres
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.property_type) {
      query = query.eq('property_type', filters.property_type)
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters?.neighborhood) {
      query = query.ilike('neighborhood', `%${filters.neighborhood}%`)
    }
    if (filters?.min_price) {
      query = query.gte('price', filters.min_price)
    }
    if (filters?.max_price) {
      query = query.lte('price', filters.max_price)
    }
    if (filters?.min_rooms) {
      query = query.gte('rooms', filters.min_rooms)
    }
    if (filters?.min_surface) {
      query = query.gte('surface_area', filters.min_surface)
    }
    if (filters?.featured) {
      query = query.eq('featured', filters.featured)
    }

    // Tri côté serveur
    if (options?.sortBy) {
      const sortField = options.sortBy === 'date' ? 'created_at' : options.sortBy
      query = query.order(sortField, { ascending: options.sortOrder === 'asc' })
    } else {
      // Tri par défaut : plus récent en premier
      query = query.order('created_at', { ascending: false })
    }

    // Pagination si spécifiée (doit être après le tri)
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset !== undefined) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Transformer les données pour correspondre à l'interface Listing
    const transformedData =
      data?.map((item: any) => ({
        ...item,
        images:
          item.listing_images
            ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any) => img.url) || [],
      })) || []

    // Si options est fourni, retourner un objet avec data et total
    if (options) {
      return {
        data: transformedData,
        total: count || undefined,
      }
    }
    
    // Sinon, retourner directement le tableau (compatibilité avec le code existant)
    return transformedData
  } catch (error) {
    console.error('Error fetching listings:', error)
    throw error
  }
}

/**
 * Récupérer une annonce par son ID
 */
export async function getListing(id: string): Promise<any> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_images(*), user_profiles(full_name, phone, email, company_name, avatar_url)')
      .eq('id', id)
      .single()

    if (error) throw error

    // Transformer les données
    return {
      ...data,
      images:
        data.listing_images
          ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => img.url) || [],
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
    throw error
  }
}

/**
 * Créer une nouvelle annonce
 */
export async function createListing(listingData: CreateListingData): Promise<any> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    // Récupérer l'utilisateur actuel
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Vous devez être connecté pour publier une annonce')
    }

    // Créer l'annonce avec l'ID de l'utilisateur
    const { images = [], ...listingValues } = listingData

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingValues,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    if (images.length > 0) {
      const imageEntries = images
        .filter((url) => Boolean(url))
        .map((url, index) => ({
          listing_id: data.id,
          url,
          sort_order: index,
        }))

      if (imageEntries.length > 0) {
        const { error: imageError } = await supabase.from('listing_images').insert(imageEntries)
        if (imageError) {
          console.error('Error inserting listing images:', imageError)
          throw imageError
        }
      }
    }

    return {
      ...data,
      images,
    }
  } catch (error: any) {
    console.error('Error creating listing:', error)
    throw error
  }
}

/**
 * Mettre à jour une annonce existante
 */
export async function updateListing(
  listingId: string,
  listingData: Partial<CreateListingData>
): Promise<any> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Vous devez être connecté pour modifier une annonce')
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single()

    if (fetchError) throw fetchError

    if (existingListing.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier cette annonce')
    }

    // Mettre à jour l'annonce
    const { data, error } = await supabase
      .from('listings')
      .update(listingData)
      .eq('id', listingId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating listing:', error)
    throw error
  }
}

/**
 * Supprimer une annonce
 */
export async function deleteListing(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Vous devez être connecté pour supprimer une annonce')
    }

    // Vérifier que l'utilisateur est propriétaire
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (existingListing.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer cette annonce')
    }

    const { error } = await supabase.from('listings').delete().eq('id', id)

    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting listing:', error)
    throw error
  }
}

/**
 * Récupérer les annonces d'un utilisateur
 */
export async function getUserListings(userId?: string): Promise<any[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase non configuré. Retour de données vides.')
    return []
  }

  try {
    let targetUserId = userId

    // Si userId non fourni, utiliser l'utilisateur actuel
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Vous devez être connecté pour voir vos annonces')
      }
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transformer les données
    return (
      data?.map((item: any) => ({
        ...item,
        images:
          item.listing_images
            ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any) => img.url) || [],
      })) || []
    )
  } catch (error: any) {
    console.error('Error fetching user listings:', error)
    throw error
  }
}
