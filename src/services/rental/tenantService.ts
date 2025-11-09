import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Tenant, CreateTenantData } from '@/types/rental'

/**
 * Récupérer tous les locataires de l'utilisateur
 */
export async function getTenants(): Promise<Tenant[]> {
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
      .from('tenants')
      .select(`
        *,
        managed_properties (
          id,
          name,
          address,
          status
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching tenants:', error)
    throw error
  }
}

/**
 * Récupérer les locataires d'un bien spécifique
 */
export async function getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
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
      .from('tenants')
      .select('*')
      .eq('managed_property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching tenants by property:', error)
    throw error
  }
}

/**
 * Récupérer un locataire par ID
 */
export async function getTenant(id: string): Promise<Tenant> {
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
      .from('tenants')
      .select(`
        *,
        managed_properties (
          id,
          name,
          address,
          monthly_rent,
          charges,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Locataire non trouvé')
    
    return data
  } catch (error: any) {
    console.error('Error fetching tenant:', error)
    throw error
  }
}

/**
 * Créer un nouveau locataire
 */
export async function createTenant(data: CreateTenantData): Promise<Tenant> {
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
    const { data: property, error: propertyError } = await supabase
      .from('managed_properties')
      .select('user_id, status')
      .eq('id', data.managed_property_id)
      .single()

    if (propertyError) throw propertyError
    if (property.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à ajouter un locataire à ce bien')
    }

    // Créer le locataire
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        ...data,
        status: 'active',
      })
      .select()
      .single()

    if (tenantError) throw tenantError

    // Mettre à jour le statut du bien à "occupied"
    await supabase
      .from('managed_properties')
      .update({ status: 'occupied' })
      .eq('id', data.managed_property_id)

    // TODO: Si tenant_space_enabled, envoyer email d'invitation
    // if (data.tenant_space_enabled) {
    //   await sendTenantInvitationEmail(tenant)
    // }

    return tenant
  } catch (error: any) {
    console.error('Error creating tenant:', error)
    throw error
  }
}

/**
 * Mettre à jour un locataire
 */
export async function updateTenant(
  id: string,
  updates: Partial<CreateTenantData>
): Promise<Tenant> {
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

    // Vérifier que le locataire appartient à un bien de l'utilisateur
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        managed_property_id,
        managed_properties!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (tenantError) throw tenantError
    if ((tenant as any).managed_properties.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce locataire')
    }

    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating tenant:', error)
    throw error
  }
}

/**
 * Terminer la location d'un locataire
 */
export async function terminateTenant(id: string): Promise<void> {
  try {
    // Mettre le statut à "terminated"
    await updateTenant(id, { status: 'terminated' } as any)

    // Récupérer le locataire pour obtenir le bien
    const tenant = await getTenant(id)

    // Vérifier s'il y a d'autres locataires actifs sur ce bien
    const { data: activeTenants, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('managed_property_id', tenant.managed_property_id)
      .eq('status', 'active')

    if (error) throw error

    // Si aucun locataire actif, mettre le bien à "vacant"
    if (!activeTenants || activeTenants.length === 0) {
      await supabase
        .from('managed_properties')
        .update({ status: 'vacant' })
        .eq('id', tenant.managed_property_id)
    }
  } catch (error: any) {
    console.error('Error terminating tenant:', error)
    throw error
  }
}

/**
 * Récupérer le locataire actif d'un bien
 */
export async function getActiveTenantForProperty(propertyId: string): Promise<Tenant | null> {
  if (!isSupabaseConfigured) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('managed_property_id', propertyId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error
    }

    return data || null
  } catch (error: any) {
    console.error('Error fetching active tenant:', error)
    return null
  }
}






