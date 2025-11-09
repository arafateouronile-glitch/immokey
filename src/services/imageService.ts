import { supabase } from '@/lib/supabase'

/**
 * Upload une image vers Supabase Storage
 */
export async function uploadImage(file: File, bucket: string = 'listings'): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    throw new Error('Impossible de télécharger l\'image')
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  
  return data.publicUrl
}

/**
 * Supprime une image de Supabase Storage
 */
export async function deleteImage(url: string, bucket: string = 'listings'): Promise<void> {
  try {
    const path = url.split('/').pop()
    if (!path) return

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Error deleting image:', error)
    }
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

/**
 * Upload plusieurs images
 */
export async function uploadImages(files: File[], bucket: string = 'listings'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, bucket))
  return Promise.all(uploadPromises)
}

/**
 * Alias pour uploadImages (compatibilité avec les anciens composants)
 */
export const uploadListingImages = uploadImages
