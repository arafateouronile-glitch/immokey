import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
} from '@/types/saas'

/**
 * Vérifier si l'utilisateur est super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: userRole, error } = await supabase
      .from('user_system_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('module', 'all')
      .maybeSingle()

    // Si la table n'existe pas, retourner false silencieusement
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('Tables SaaS non installées. Exécutez migration_to_saas.sql')
      }
      return false
    }

    if (!userRole) return false

    // Vérifier que le rôle est super_admin
    const { data: role, error: roleError } = await supabase
      .from('system_roles')
      .select('name')
      .eq('id', userRole.role_id)
      .single()

    if (roleError || !role) return false

    return role.name === 'super_admin'
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

/**
 * Récupérer toutes les organisations (super admin uniquement)
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  if (!isSupabaseConfigured) return []

  try {
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) {
      throw new Error(
        'Accès refusé. Super administrateur requis.\n\n' +
        'Pour créer votre rôle super_admin, exécutez le script SQL :\n' +
        'database/create_super_admin.sql dans Supabase Dashboard.\n\n' +
        'Remplacez "votre@email.com" par votre email et exécutez le script.'
      )
    }

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching organizations:', error)
    throw error
  }
}

/**
 * Récupérer une organisation par ID
 */
export async function getOrganization(id: string): Promise<Organization> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Organisation non trouvée')
    return data
  } catch (error: any) {
    console.error('Error fetching organization:', error)
    throw error
  }
}

/**
 * Récupérer les organisations de l'utilisateur
 */
export async function getUserOrganizations(): Promise<Organization[]> {
  if (!isSupabaseConfigured) return []

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    // Essayer d'abord de récupérer via organization_members
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) throw error

      const orgs = (data || []).map((item: any) => item.organizations).filter(Boolean)
      if (orgs.length > 0) {
        return orgs
      }
    } catch (error) {
      // Si organization_members n'existe pas ou échoue, essayer directement organizations
      console.warn('Could not fetch via organization_members, trying organizations directly:', error)
    }

    // Fallback : récupérer les organisations dont l'utilisateur est propriétaire
    const { data: ownerOrgs, error: ownerError } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)

    if (ownerError) throw ownerError

    return ownerOrgs || []
  } catch (error: any) {
    console.error('Error fetching user organizations:', error)
    // Si les tables n'existent pas, retourner un tableau vide
    if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
      return []
    }
    throw error
  }
}

/**
 * Créer une nouvelle organisation
 */
export async function createOrganization(
  data: CreateOrganizationData
): Promise<Organization> {
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

    const organizationData = {
      ...data,
      owner_id: user.id,
      subscription_plan: data.subscription_plan || 'free',
      subscription_status: data.subscription_status || 'active',
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .insert(organizationData)
      .select()
      .single()

    if (error) throw error
    return organization
  } catch (error: any) {
    console.error('Error creating organization:', error)
    throw error
  }
}

/**
 * Mettre à jour une organisation
 */
export async function updateOrganization(
  id: string,
  updates: UpdateOrganizationData
): Promise<Organization> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const isAdmin = await isSuperAdmin()
    const organization = await getOrganization(id)

    // Vérifier les permissions
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Vous devez être connecté')

    if (!isAdmin && organization.owner_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier cette organisation')
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating organization:', error)
    throw error
  }
}

/**
 * Bloquer/Débloquer une organisation (super admin uniquement)
 */
export async function blockOrganization(
  id: string,
  blocked: boolean,
  reason?: string
): Promise<Organization> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) {
      throw new Error('Accès refusé. Super administrateur requis.')
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Vous devez être connecté')

    const updateData: any = {
      is_blocked: blocked,
      blocked_reason: reason || null,
    }

    if (blocked) {
      updateData.blocked_at = new Date().toISOString()
      updateData.blocked_by = user.id
    } else {
      updateData.blocked_at = null
      updateData.blocked_by = null
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error blocking/unblocking organization:', error)
    throw error
  }
}

/**
 * Supprimer une organisation (super admin uniquement)
 */
export async function deleteOrganization(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) {
      throw new Error('Accès refusé. Super administrateur requis.')
    }

    const { error } = await supabase.from('organizations').delete().eq('id', id)

    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting organization:', error)
    throw error
  }
}

