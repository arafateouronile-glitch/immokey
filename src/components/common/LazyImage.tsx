import { useState, useEffect, useRef, memo } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * Composant d'image lazy loading avec Intersection Observer
 * Remplace les images standard pour un chargement optimisé
 */
function LazyImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Si pas de src, ne rien faire
    if (!src) {
      return
    }

    // Si le navigateur supporte Intersection Observer
    if ('IntersectionObserver' in window && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Quand l'image est visible
            if (entry.isIntersecting) {
              // Charger l'image
              const img = new Image()
              img.src = src
              
              img.onload = () => {
                setImageSrc(src)
                setIsLoaded(true)
                onLoad?.()
              }
              
              img.onerror = () => {
                onError?.()
              }
              
              // Arrêter d'observer
              observer.disconnect()
            }
          })
        },
        {
          // Charger l'image 100px avant qu'elle soit visible
          rootMargin: '100px',
        }
      )

      observer.observe(imgRef.current)

      return () => {
        observer.disconnect()
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas Intersection Observer
      setImageSrc(src)
    }
  }, [src, onLoad, onError])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      loading="lazy"
      onError={() => {
        onError?.()
      }}
    />
  )
}

export default memo(LazyImage)
