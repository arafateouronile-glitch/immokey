import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Uploader une image pour un établissement
 */
export async function uploadEstablishmentImage(
  file: File,
  establishmentId: string
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté pour uploader des images')
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image')
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('L\'image ne doit pas dépasser 5MB')
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${establishmentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    // Obtenir l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from('listing-images').getPublicUrl(data.path)

    return publicUrl
  } catch (error: any) {
    console.error('Error uploading establishment image:', error)
    throw error
  }
}

/**
 * Uploader plusieurs images pour un établissement
 */
export async function uploadEstablishmentImages(
  files: (File | null | undefined)[],
  establishmentId: string
): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const validFiles = files.filter(
      (file): file is File => file instanceof File
    )

    if (validFiles.length === 0) {
      return []
    }

    const uploadPromises = validFiles.map((file) =>
      uploadEstablishmentImage(file, establishmentId)
    )

    const urls = await Promise.all(uploadPromises)
    return urls.filter((url) => url !== null) as string[]
  } catch (error: any) {
    console.error('Error uploading establishment images:', error)
    throw error
  }
}







