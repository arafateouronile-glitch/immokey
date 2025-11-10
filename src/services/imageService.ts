import { supabase } from '@/lib/supabase'

/**
 * Upload une image vers Supabase Storage
 */
export async function uploadImage(file: File, bucket: string = 'listings'): Promise<string> {
  if (!(file instanceof File)) {
    throw new Error('Fichier invalide')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Vous devez être connecté pour uploader des images')
  }

  const fileExt = file.name?.split('.').pop() || 'jpg'
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

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
    const parsed = new URL(url)
    const prefix = `/storage/v1/object/public/${bucket}/`
    let storagePath = parsed.pathname

    if (storagePath.startsWith(prefix)) {
      storagePath = storagePath.slice(prefix.length)
    } else {
      storagePath = storagePath.split(`${bucket}/`).pop() || ''
    }

    storagePath = storagePath.replace(/^\/+/, '')

    if (!storagePath) return

    const { error } = await supabase.storage
      .from(bucket)
      .remove([storagePath])

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
export async function uploadImages(files: (File | null | undefined)[], bucket: string = 'listings'): Promise<string[]> {
  const validFiles = files.filter((file): file is File => file instanceof File)

  if (validFiles.length === 0) {
    return []
  }

  const uploadPromises = validFiles.map(file => uploadImage(file, bucket))
  return Promise.all(uploadPromises)
}

/**
 * Alias pour uploadImages (compatibilité avec les anciens composants)
 */
export const uploadListingImages = uploadImages
