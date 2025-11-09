import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { addFavorite, removeFavorite, isFavorite as checkIsFavorite } from '@/services/favoritesService'

interface FavoriteButtonProps {
  listingId: string
  className?: string
  size?: number
}

export default function FavoriteButton({ listingId, className = '', size = 20 }: FavoriteButtonProps) {
  const { user } = useAuth()
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) {
        setChecking(false)
        return
      }

      try {
        const favorite = await checkIsFavorite(listingId)
        setFavorited(favorite)
      } catch (error) {
        console.error('Error checking favorite:', error)
      } finally {
        setChecking(false)
      }
    }

    checkFavorite()
  }, [listingId, user])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert('Vous devez être connecté pour ajouter aux favoris')
      return
    }

    if (loading) return

    setLoading(true)
    try {
      if (favorited) {
        await removeFavorite(listingId)
        setFavorited(false)
      } else {
        await addFavorite(listingId)
        setFavorited(true)
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      alert(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <button
        className={`p-2 bg-white rounded-full shadow-md opacity-50 ${className}`}
        disabled
      >
        <Heart size={size} className="text-gray-400" />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors ${className} ${
        loading ? 'opacity-50 cursor-wait' : ''
      }`}
      aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        size={size}
        className={favorited ? 'text-red-600 fill-red-600' : 'text-gray-400'}
      />
    </button>
  )
}





