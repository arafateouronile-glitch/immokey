import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  ManagedProperty,
  CreateManagedPropertyData,
} from '@/types/rental'

/**
 * Récupérer tous les biens en gestion de l'utilisateur
 */
export async function getManagedProperties(): Promise<ManagedProperty[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('managed_properties')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'archived') // Exclure les archivés par défaut
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching managed properties:', error)
    throw error
  }
}

/**
 * Récupérer un bien en gestion par ID
 */
export async function getManagedProperty(id: string): Promise<ManagedProperty> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('managed_properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Bien non trouvé')
    
    return data
  } catch (error: any) {
    console.error('Error fetching managed property:', error)
    throw error
  }
}

/**
 * Créer un nouveau bien en gestion
 */
export async function createManagedProperty(
  data: CreateManagedPropertyData
): Promise<ManagedProperty> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data: property, error } = await supabase
      .from('managed_properties')
      .insert({
        ...data,
        user_id: user.id,
        status: 'vacant',
      })
      .select()
      .single()

    if (error) throw error
    return property
  } catch (error: any) {
    console.error('Error creating managed property:', error)
    throw error
  }
}

/**
 * Mettre à jour un bien en gestion
 */
export async function updateManagedProperty(
  id: string,
  updates: Partial<CreateManagedPropertyData>
): Promise<ManagedProperty> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // Vérifier que le bien appartient à l'utilisateur
    const { data: existing, error: checkError } = await supabase
      .from('managed_properties')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError) throw checkError
    if (existing.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce bien')
    }

    const { data, error } = await supabase
      .from('managed_properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating managed property:', error)
    throw error
  }
}

/**
 * Archiver un bien en gestion
 */
export async function archiveManagedProperty(id: string): Promise<void> {
  await updateManagedProperty(id, { status: 'archived' } as any)
}

/**
 * Récupérer les statistiques des biens en gestion
 */
export async function getManagedPropertiesStats() {
  if (!isSupabaseConfigured) {
    return {
      total: 0,
      occupied: 0,
      vacant: 0,
    }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('managed_properties')
      .select('status')
      .eq('user_id', user.id)
      .neq('status', 'archived')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      occupied: data?.filter((p) => p.status === 'occupied').length || 0,
      vacant: data?.filter((p) => p.status === 'vacant').length || 0,
    }

    return stats
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return {
      total: 0,
      occupied: 0,
      vacant: 0,
    }
  }
}
