import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface Favorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
}

/**
 * Ajouter une annonce aux favoris
 */
export async function addFavorite(listingId: string): Promise<Favorite> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Vous devez être connecté pour ajouter aux favoris')
    }

    // Vérifier si déjà en favoris
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle()

    if (existing) {
      throw new Error('Cette annonce est déjà dans vos favoris')
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        listing_id: listingId,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error adding favorite:', error)
    throw error
  }
}

/**
 * Retirer une annonce des favoris
 */
export async function removeFavorite(listingId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Vous devez être connecté pour retirer des favoris')
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId)

    if (error) throw error
  } catch (error: any) {
    console.error('Error removing favorite:', error)
    throw error
  }
}

/**
 * Vérifier si une annonce est en favoris
 */
export async function isFavorite(listingId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return !!data
  } catch (error) {
    console.error('Error checking favorite:', error)
    return false
  }
}

/**
 * Récupérer toutes les annonces favorites de l'utilisateur
 */
export async function getUserFavorites(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase non configuré. Retour de données vides.')
    return []
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Vous devez être connecté pour voir vos favoris')
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        listings (
          *,
          listing_images (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map((fav: any) => fav.listings).filter(Boolean) || []
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    throw error
  }
}
