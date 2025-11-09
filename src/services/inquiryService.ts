import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Inquiry = Database['public']['Tables']['inquiries']['Row']
type InquiryInsert = Database['public']['Tables']['inquiries']['Insert']

export interface CreateInquiryData {
  listing_id: string
  name: string
  email: string
  phone?: string
  message: string
}

/**
 * Créer une nouvelle demande de contact pour une annonce
 */
export async function createInquiry(data: CreateInquiryData): Promise<Inquiry> {
  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .insert({
      listing_id: data.listing_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      status: 'new',
    } as InquiryInsert)
    .select()
    .single()

  if (error) {
    console.error('Error creating inquiry:', error)
    throw new Error('Impossible de créer la demande de contact')
  }

  return inquiry
}

/**
 * Récupérer les demandes reçues pour les annonces de l'utilisateur
 */
export async function getReceivedInquiries(userId: string): Promise<Inquiry[]> {
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        location
      )
    `)
    .eq('listings.user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inquiries:', error)
    throw new Error('Impossible de récupérer les demandes')
  }

  return inquiries || []
}

/**
 * Récupérer les demandes envoyées par l'utilisateur
 */
export async function getSentInquiries(userEmail: string): Promise<Inquiry[]> {
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        location
      )
    `)
    .eq('email', userEmail)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sent inquiries:', error)
    throw new Error('Impossible de récupérer les demandes envoyées')
  }

  return inquiries || []
}

/**
 * Marquer une demande comme lue
 */
export async function markInquiryAsRead(inquiryId: string): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({ status: 'read' })
    .eq('id', inquiryId)

  if (error) {
    console.error('Error marking inquiry as read:', error)
    throw new Error('Impossible de marquer la demande comme lue')
  }
}

/**
 * Supprimer une demande
 */
export async function deleteInquiry(inquiryId: string): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', inquiryId)

  if (error) {
    console.error('Error deleting inquiry:', error)
    throw new Error('Impossible de supprimer la demande')
  }
}
