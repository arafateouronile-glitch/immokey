import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  OrganizationMember,
  CreateOrganizationMemberData,
  UpdateOrganizationMemberData,
} from '@/types/saas'

/**
 * Récupérer les membres d'une organisation
 */
export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  if (!isSupabaseConfigured) return []

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('organization_members')
      .select('*, organizations(*), user_profiles(id, email, full_name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transformer les données pour inclure les informations utilisateur
    return (data || []).map((member: any) => ({
      ...member,
      user: member.user_profiles
        ? {
            id: member.user_profiles.id,
            email: member.user_profiles.email,
            full_name: member.user_profiles.full_name,
          }
        : undefined,
    }))
  } catch (error: any) {
    console.error('Error fetching organization members:', error)
    throw error
  }
}

/**
 * Ajouter un membre à une organisation
 */
export async function addOrganizationMember(
  data: CreateOrganizationMemberData
): Promise<OrganizationMember> {
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

    // Vérifier que l'utilisateur a le droit d'ajouter des membres
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', data.organization_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new Error('Vous n\'êtes pas autorisé à ajouter des membres')
    }

    const memberData = {
      ...data,
      invited_by: user.id,
      joined_at: null, // L'utilisateur rejoindra plus tard
    }

    const { data: newMember, error } = await supabase
      .from('organization_members')
      .insert(memberData)
      .select()
      .single()

    if (error) throw error
    return newMember
  } catch (error: any) {
    console.error('Error adding organization member:', error)
    throw error
  }
}

/**
 * Mettre à jour un membre d'organisation
 */
export async function updateOrganizationMember(
  id: string,
  updates: UpdateOrganizationMemberData
): Promise<OrganizationMember> {
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

    // Récupérer le membre à mettre à jour
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('id', id)
      .single()

    if (memberError || !member) {
      throw new Error('Membre non trouvé')
    }

    // Vérifier les permissions
    const { data: currentMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', member.organization_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce membre')
    }

    const { data: updated, error } = await supabase
      .from('organization_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  } catch (error: any) {
    console.error('Error updating organization member:', error)
    throw error
  }
}

/**
 * Retirer un membre d'une organisation
 */
export async function removeOrganizationMember(id: string): Promise<void> {
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

    // Récupérer le membre à retirer
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, role, user_id')
      .eq('id', id)
      .single()

    if (memberError || !member) {
      throw new Error('Membre non trouvé')
    }

    // Ne pas permettre de retirer le propriétaire
    if (member.role === 'owner') {
      throw new Error('Impossible de retirer le propriétaire de l\'organisation')
    }

    // Vérifier les permissions
    const { data: currentMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', member.organization_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      throw new Error('Vous n\'êtes pas autorisé à retirer ce membre')
    }

    // Désactiver le membre au lieu de le supprimer
    const { error } = await supabase
      .from('organization_members')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  } catch (error: any) {
    console.error('Error removing organization member:', error)
    throw error
  }
}

/**
 * Accepter une invitation et rejoindre une organisation
 */
export async function acceptOrganizationInvitation(
  organizationId: string
): Promise<OrganizationMember> {
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

    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      throw new Error('Invitation non trouvée')
    }

    if (member.joined_at) {
      throw new Error('Vous avez déjà rejoint cette organisation')
    }

    const { data: updated, error } = await supabase
      .from('organization_members')
      .update({ joined_at: new Date().toISOString(), is_active: true })
      .eq('id', member.id)
      .select()
      .single()

    if (error) throw error
    return updated
  } catch (error: any) {
    console.error('Error accepting invitation:', error)
    throw error
  }
}






