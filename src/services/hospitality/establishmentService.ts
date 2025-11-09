import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getUserOrganizations, createOrganization } from '@/services/saas/organizationService'
import type {
  HospitalityEstablishment,
  CreateEstablishmentData,
} from '@/types/hospitality'

/**
 * Récupérer tous les établissements de l'utilisateur
 */
export async function getEstablishments(): Promise<HospitalityEstablishment[]> {
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

    // RLS policies gèrent automatiquement l'accès basé sur l'organisation
    // Pas besoin de filtrer par user_id, les policies vérifient l'appartenance
    const { data, error } = await supabase
      .from('hospitality_establishments')
      .select('*')
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching establishments:', error)
    throw error
  }
}

/**
 * Récupérer un établissement par ID
 */
export async function getEstablishment(id: string): Promise<HospitalityEstablishment> {
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

    // RLS policies gèrent automatiquement l'accès basé sur l'organisation
    const { data, error } = await supabase
      .from('hospitality_establishments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Établissement non trouvé')
    
    return data
  } catch (error: any) {
    console.error('Error fetching establishment:', error)
    throw error
  }
}

/**
 * Obtenir ou créer l'organisation de l'utilisateur
 */
async function getOrCreateUserOrganization(): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // Essayer de récupérer les organisations de l'utilisateur
    try {
      const organizations = await getUserOrganizations()
      
      // Si l'utilisateur a déjà une organisation, utiliser la première
      if (organizations && organizations.length > 0) {
        return organizations[0].id
      }
    } catch (error) {
      // Si getUserOrganizations échoue (tables non installées), continuer pour créer une org
      console.warn('Could not fetch user organizations, will create one:', error)
    }

    // Sinon, créer une organisation par défaut
    // Récupérer le profil utilisateur pour le nom de l'organisation
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, company_name')
      .eq('id', user.id)
      .single()

    const orgName = profile?.company_name || profile?.full_name || `Organisation de ${user.email?.split('@')[0] || 'Utilisateur'}`

    try {
      const newOrganization = await createOrganization({
        name: orgName,
        slug: orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now(),
        subscription_plan: 'free',
        subscription_status: 'active',
      })

      return newOrganization.id
    } catch (createError: any) {
      // Si la création échoue, essayer de récupérer à nouveau (peut-être créée entre temps)
      try {
        const organizations = await getUserOrganizations()
        if (organizations && organizations.length > 0) {
          return organizations[0].id
        }
      } catch {
        // Ignorer
      }
      throw createError
    }
  } catch (error: any) {
    console.error('Error getting or creating organization:', error)
    // Si tout échoue, essayer de récupérer une organisation existante une dernière fois
    try {
      const organizations = await getUserOrganizations()
      if (organizations && organizations.length > 0) {
        return organizations[0].id
      }
    } catch {
      // Ignorer
    }
    throw new Error(`Impossible de créer ou récupérer une organisation. ${error.message || ''}`)
  }
}

/**
 * Créer un nouvel établissement
 */
export async function createEstablishment(
  data: CreateEstablishmentData
): Promise<HospitalityEstablishment> {
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

    // Obtenir ou créer l'organisation de l'utilisateur
    const organizationId = await getOrCreateUserOrganization()
    
    if (!organizationId) {
      throw new Error('Impossible de récupérer ou créer une organisation. Veuillez réessayer.')
    }

    console.log('Creating establishment with organization_id:', organizationId)

    const { data: establishment, error } = await supabase
      .from('hospitality_establishments')
      .insert({
        ...data,
        user_id: user.id,
        organization_id: organizationId,
        status: 'active',
        photo_urls: data.photo_urls || [],
        amenities: data.amenities || [],
      })
      .select()
      .single()

    if (error) throw error
    return establishment
  } catch (error: any) {
    console.error('Error creating establishment:', error)
    throw error
  }
}

/**
 * Mettre à jour un établissement
 */
export async function updateEstablishment(
  id: string,
  updates: Partial<CreateEstablishmentData>
): Promise<HospitalityEstablishment> {
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

    // Vérifier que l'établissement appartient à l'utilisateur
    const { data: existing, error: checkError } = await supabase
      .from('hospitality_establishments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError) throw checkError
    if (existing.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier cet établissement')
    }

    const { data, error } = await supabase
      .from('hospitality_establishments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating establishment:', error)
    throw error
  }
}

/**
 * Archiver un établissement
 */
export async function archiveEstablishment(id: string): Promise<void> {
  await updateEstablishment(id, { status: 'archived' } as any)
}

/**
 * Supprimer un établissement (alias pour archiver)
 */
export async function deleteEstablishment(id: string): Promise<void> {
  await archiveEstablishment(id)
}

/**
 * Récupérer les statistiques des établissements
 */
export async function getEstablishmentsStats() {
  if (!isSupabaseConfigured) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
    }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // RLS policies gèrent automatiquement l'accès basé sur l'organisation
    const { data, error } = await supabase
      .from('hospitality_establishments')
      .select('status')
      .neq('status', 'archived')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      active: data?.filter((e) => e.status === 'active').length || 0,
      inactive: data?.filter((e) => e.status === 'inactive').length || 0,
    }

    return stats
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
    }
  }
}
