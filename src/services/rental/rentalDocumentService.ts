import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { RentalDocument } from '@/types/rental'

/**
 * Récupérer les documents d'un bien
 */
export async function getPropertyDocuments(propertyId: string): Promise<RentalDocument[]> {
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
      .from('rental_documents')
      .select('*')
      .eq('managed_property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching property documents:', error)
    throw error
  }
}

/**
 * Récupérer les documents d'un locataire
 */
export async function getTenantDocuments(tenantId: string): Promise<RentalDocument[]> {
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
      .from('rental_documents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching tenant documents:', error)
    throw error
  }
}

/**
 * Récupérer tous les documents de l'utilisateur
 */
export async function getAllDocuments(): Promise<RentalDocument[]> {
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

    // Récupérer via les biens gérés par l'utilisateur
    const { data, error } = await supabase
      .from('rental_documents')
      .select(`
        *,
        managed_properties!inner(user_id)
      `)
      .eq('managed_properties.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching all documents:', error)
    throw error
  }
}

/**
 * Récupérer un document par ID
 */
export async function getDocument(id: string): Promise<RentalDocument> {
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
      .from('rental_documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Document non trouvé')
    
    return data
  } catch (error: any) {
    console.error('Error fetching document:', error)
    throw error
  }
}

/**
 * Uploader un document
 */
export async function uploadDocument(
  file: File,
  documentData: {
    managed_property_id?: string
    tenant_id?: string
    name: string
    document_type: RentalDocument['document_type']
    description?: string
    shared_with_tenant?: boolean
  }
): Promise<RentalDocument> {
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

    // 1. Uploader le fichier dans Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const filePath = `rental-documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('rental-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // 2. Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from('rental-documents').getPublicUrl(filePath)

    // 3. Créer l'enregistrement dans la base de données
    const { data, error } = await supabase
      .from('rental_documents')
      .insert({
        ...documentData,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (error) {
      // Si erreur, supprimer le fichier uploadé
      await supabase.storage.from('rental-documents').remove([filePath])
      throw error
    }

    return data
  } catch (error: any) {
    console.error('Error uploading document:', error)
    throw error
  }
}

/**
 * Mettre à jour un document
 */
export async function updateDocument(
  id: string,
  updates: {
    name?: string
    description?: string
    shared_with_tenant?: boolean
  }
): Promise<RentalDocument> {
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
      .from('rental_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating document:', error)
    throw error
  }
}

/**
 * Supprimer un document
 */
export async function deleteDocument(id: string): Promise<void> {
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

    // 1. Récupérer le document pour obtenir le chemin du fichier
    const { data: document, error: fetchError } = await supabase
      .from('rental_documents')
      .select('file_url')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // 2. Supprimer le fichier du storage
    if (document?.file_url) {
      const filePath = document.file_url.split('/storage/v1/object/public/rental-documents/')[1]
      if (filePath) {
        await supabase.storage.from('rental-documents').remove([filePath])
      }
    }

    // 3. Supprimer l'enregistrement de la base de données
    const { error } = await supabase
      .from('rental_documents')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting document:', error)
    throw error
  }
}

/**
 * Obtenir l'URL de téléchargement d'un document
 */
export function getDocumentDownloadUrl(document: RentalDocument): string {
  return document.file_url
}

/**
 * Formater la taille du fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Obtenir le libellé du type de document
 */
export function getDocumentTypeLabel(type: RentalDocument['document_type']): string {
  const labels: Record<RentalDocument['document_type'], string> = {
    contract: 'Contrat de location',
    entry_inventory: 'État des lieux d\'entrée',
    exit_inventory: 'État des lieux de sortie',
    tenant_id: 'Pièce d\'identité',
    receipt: 'Quittance de loyer',
    invoice: 'Facture',
    correspondence: 'Correspondance',
    other: 'Autre',
  }
  
  return labels[type] || type
}






