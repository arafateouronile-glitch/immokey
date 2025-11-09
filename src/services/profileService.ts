import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface UserProfile {
  id: string
  full_name: string
  phone: string
  user_type: 'particulier' | 'professionnel'
  verified: boolean
  company_name?: string
  website?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  full_name?: string
  phone?: string
  user_type?: 'particulier' | 'professionnel'
  company_name?: string
  website?: string
}

/**
 * Récupérer le profil de l'utilisateur actuel
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Vous devez être connecté pour voir votre profil')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Si le profil n'existe pas, le créer
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUserProfile(
  profileData: UpdateProfileData
): Promise<UserProfile> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Vous devez être connecté pour modifier votre profil')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Changer le mot de passe
 */
export async function updatePassword(newPassword: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré. Configurez vos clés dans .env')
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  } catch (error: any) {
    console.error('Error updating password:', error)
    throw error
  }
}

/**
 * Récupérer les statistiques de l'utilisateur
 */
export async function getUserStats(): Promise<{
  totalListings: number
  activeListings: number
  totalFavorites: number
}> {
  if (!isSupabaseConfigured) {
    return { totalListings: 0, activeListings: 0, totalFavorites: 0 }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { totalListings: 0, activeListings: 0, totalFavorites: 0 }
    }

    // Compter les annonces
    const { count: totalListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: activeListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('available', true)

    // Compter les favoris
    const { count: totalFavorites } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return {
      totalListings: totalListings || 0,
      activeListings: activeListings || 0,
      totalFavorites: totalFavorites || 0,
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return { totalListings: 0, activeListings: 0, totalFavorites: 0 }
  }
}






