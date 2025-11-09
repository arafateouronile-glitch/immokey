import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { RentalMessage } from '@/types/rental'

/**
 * Récupérer les conversations d'un utilisateur (groupées par bien/locataire)
 */
export async function getConversations() {
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

    // Récupérer tous les messages où l'utilisateur est impliqué
    const { data: messages, error } = await supabase
      .from('rental_messages')
      .select(`
        *,
        managed_properties!inner(id, name, address),
        tenants!inner(id, full_name, email, phone)
      `)
      .or(`sender_id.eq.${user.id},managed_properties.user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Grouper par bien/locataire
    const conversationsMap = new Map()

    for (const message of messages || []) {
      const key = `${message.managed_property_id}-${message.tenant_id}`
      
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          managed_property_id: message.managed_property_id,
          tenant_id: message.tenant_id,
          property: message.managed_properties,
          tenant: message.tenants,
          last_message: message,
          unread_count: 0,
          messages: [],
        })
      }

      const conversation = conversationsMap.get(key)
      conversation.messages.push(message)
      
      // Compter les messages non lus
      if (!message.read && message.sender_id !== user.id) {
        conversation.unread_count++
      }

      // Garder le dernier message
      if (!conversation.last_message || 
          new Date(message.created_at) > new Date(conversation.last_message.created_at)) {
        conversation.last_message = message
      }
    }

    return Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.last_message.created_at).getTime() - 
      new Date(a.last_message.created_at).getTime()
    )
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    throw error
  }
}

/**
 * Récupérer les messages d'une conversation spécifique
 */
export async function getConversationMessages(
  propertyId: string,
  tenantId: string
): Promise<RentalMessage[]> {
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
      .from('rental_messages')
      .select('*')
      .eq('managed_property_id', propertyId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Marquer les messages comme lus
    await supabase
      .from('rental_messages')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('managed_property_id', propertyId)
      .eq('tenant_id', tenantId)
      .neq('sender_id', user.id)
      .eq('read', false)

    return data || []
  } catch (error: any) {
    console.error('Error fetching conversation messages:', error)
    throw error
  }
}

/**
 * Envoyer un message
 */
export async function sendMessage(
  propertyId: string,
  tenantId: string,
  message: string,
  attachments: string[] = []
): Promise<RentalMessage> {
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

    // Déterminer le type de sender (owner ou tenant)
    const { data: property } = await supabase
      .from('managed_properties')
      .select('user_id')
      .eq('id', propertyId)
      .single()

    const { data: tenant } = await supabase
      .from('tenants')
      .select('tenant_user_id')
      .eq('id', tenantId)
      .single()

    let senderType: 'owner' | 'tenant' = 'owner'
    if (tenant?.tenant_user_id === user.id) {
      senderType = 'tenant'
    } else if (property?.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à envoyer un message dans cette conversation')
    }

    const { data, error } = await supabase
      .from('rental_messages')
      .insert({
        managed_property_id: propertyId,
        tenant_id: tenantId,
        sender_type: senderType,
        sender_id: user.id,
        message: message.trim(),
        attachments: attachments || [],
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Marquer un message comme lu
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    await supabase
      .from('rental_messages')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', messageId)
      .neq('sender_id', user.id)
  } catch (error: any) {
    console.error('Error marking message as read:', error)
    throw error
  }
}

/**
 * Récupérer le nombre de messages non lus
 */
export async function getUnreadCount(): Promise<number> {
  if (!isSupabaseConfigured) {
    return 0
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return 0
    }

    // Filtrer pour ne compter que ceux où l'utilisateur est impliqué
    const { data: userPropertyMessages } = await supabase
      .from('rental_messages')
      .select(`
        id,
        managed_properties!inner(user_id),
        tenants!inner(tenant_user_id)
      `)
      .eq('read', false)
      .neq('sender_id', user.id)
      .or(`managed_properties.user_id.eq.${user.id},tenants.tenant_user_id.eq.${user.id}`)

    return userPropertyMessages?.length || 0
  } catch (error: any) {
    console.error('Error getting unread count:', error)
    return 0
  }
}
