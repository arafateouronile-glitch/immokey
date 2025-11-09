/**
 * Optimise les URLs d'images Supabase avec des transformations
 * Documentation: https://supabase.com/docs/guides/storage/image-transformations
 */

interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number // 1-100
  format?: 'webp' | 'jpeg' | 'png'
  resize?: 'cover' | 'contain' | 'fill'
}

/**
 * Optimise une URL d'image Supabase avec des transformations
 * Note: L'API de transformation d'images de Supabase nécessite une configuration spéciale
 * Pour l'instant, on retourne l'URL originale pour garantir l'affichage
 */
export function optimizeImageUrl(
  imageUrl: string,
  _options: ImageTransformOptions = {}
): string {
  // Si pas d'URL, retourner vide
  if (!imageUrl) {
    return ''
  }

  // Si ce n'est pas une URL Supabase Storage, retourner l'URL originale
  if (!imageUrl.includes('supabase.co/storage') && !imageUrl.includes('supabase')) {
    return imageUrl
  }

  // Pour l'instant, retourner l'URL originale
  // L'API de transformation d'images nécessite une configuration spécifique
  // TODO: Activer l'optimisation d'images quand l'API sera configurée
  return imageUrl

  /* Code pour l'optimisation (désactivé temporairement)
  try {
    const {
      width = 800,
      height,
      quality = 80,
      format = 'webp',
      resize = 'cover',
    } = options

    // Extraire la base URL et le chemin
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    
    // Format Supabase Image Transformation API
    // Format: /storage/v1/render/image/public/{bucket}/{path}?width=800&quality=80
    const bucketIndex = pathParts.findIndex((part) => part === 'storage')
    
    if (bucketIndex === -1) {
      return imageUrl
    }

    // Construire l'URL transformée
    const bucket = pathParts[bucketIndex + 3] // public
    const path = pathParts.slice(bucketIndex + 4).join('/')
    
    const transformUrl = new URL(`/storage/v1/render/image/public/${bucket}/${path}`, url.origin)
    
    // Ajouter les paramètres de transformation
    transformUrl.searchParams.set('width', width.toString())
    if (height) {
      transformUrl.searchParams.set('height', height.toString())
    }
    transformUrl.searchParams.set('quality', quality.toString())
    transformUrl.searchParams.set('format', format)
    transformUrl.searchParams.set('resize', resize)

    return transformUrl.toString()
  } catch (error) {
    // En cas d'erreur, retourner l'URL originale
    console.warn('Error optimizing image URL:', error)
    return imageUrl
  }
  */
}

/**
 * Optimise plusieurs URLs d'images
 */
export function optimizeImageUrls(
  imageUrls: string[],
  options?: ImageTransformOptions
): string[] {
  return imageUrls.map((url) => optimizeImageUrl(url, options))
}

/**
 * Génère une URL d'image optimisée pour les cartes d'annonces
 */
export function getListingCardImageUrl(imageUrl: string): string {
  return optimizeImageUrl(imageUrl, {
    width: 400,
    height: 300,
    quality: 75,
    format: 'webp',
    resize: 'cover',
  })
}

/**
 * Génère une URL d'image optimisée pour les galeries
 */
export function getGalleryImageUrl(imageUrl: string, size: 'thumb' | 'medium' | 'large' = 'medium'): string {
  const sizes = {
    thumb: { width: 200, height: 200 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
  }

  return optimizeImageUrl(imageUrl, {
    ...sizes[size],
    quality: size === 'thumb' ? 70 : 85,
    format: 'webp',
    resize: 'cover',
  })
}
