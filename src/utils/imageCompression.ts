/**
 * Compresse une image côté client avant upload
 * Réduit la taille du fichier tout en maintenant une qualité acceptable
 */

import { handleError } from './errorHandler'

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.1 à 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
}

/**
 * Compresse une image File
 * @param file - Fichier image à compresser
 * @param options - Options de compression
 * @returns Promise<File> - Fichier compressé
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    format = 'image/jpeg',
  } = options

  return handleError(async () => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          try {
            // Calculer les nouvelles dimensions
            let width = img.width
            let height = img.height

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                if (width > maxWidth) {
                  height = (height * maxWidth) / width
                  width = maxWidth
                }
              } else {
                if (height > maxHeight) {
                  width = (width * maxHeight) / height
                  height = maxHeight
                }
              }
            }

            // Créer un canvas pour redimensionner
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')

            if (!ctx) {
              reject(new Error('Impossible de créer le contexte canvas'))
              return
            }

            // Dessiner l'image redimensionnée
            ctx.drawImage(img, 0, 0, width, height)

            // Convertir en blob avec compression
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Échec de la compression'))
                  return
                }

                // Créer un nouveau File avec le nom original
                const compressedFile = new File([blob], file.name, {
                  type: format,
                  lastModified: Date.now(),
                })

                resolve(compressedFile)
              },
              format,
              quality
            )
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = () => {
          reject(new Error('Erreur lors du chargement de l\'image'))
        }

        img.src = e.target?.result as string
      }

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'))
      }

      reader.readAsDataURL(file)
    })
  }, 'compressImage')
}

/**
 * Compresse plusieurs images en parallèle avec gestion d'erreurs
 * Si une image échoue, on retourne le fichier original
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(
    files.map(async (file) => {
      try {
        return await compressImage(file, options)
      } catch (error) {
        console.warn(`[ImageCompression] Échec de compression pour ${file.name}, utilisation du fichier original`, error)
        // Retourner le fichier original en cas d'erreur
        return file
      }
    })
  )
}

/**
 * Vérifie si une image doit être compressée
 * (si sa taille dépasse un certain seuil)
 */
export function shouldCompress(file: File, maxSizeMB: number = 1): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size > maxSizeBytes
}

/**
 * Valide qu'un fichier est une image valide
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Vérifier le type MIME
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non supporté. Types acceptés: JPEG, PNG, WebP, GIF`,
    }
  }

  // Vérifier la taille (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `L'image est trop grande (max 10MB). Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  // Vérifier la taille minimale (au moins 1KB)
  if (file.size < 1024) {
    return {
      valid: false,
      error: 'Le fichier est trop petit pour être une image valide',
    }
  }

  return { valid: true }
}
