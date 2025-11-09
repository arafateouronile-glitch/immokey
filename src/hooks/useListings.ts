import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getListings, getListing, getUserListings, deleteListing } from '@/services/listingService'
import type { ListingFilters } from '@/services/listingService'
import toast from 'react-hot-toast'

/**
 * Hook pour récupérer les annonces avec filtres
 * Retourne les données et le total si options.pagination est true
 */
export function useListings(
  filters?: ListingFilters,
  options?: { limit?: number; offset?: number; pagination?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' }
) {
  return useQuery({
    queryKey: ['listings', filters, options],
    queryFn: async () => {
      const result = await getListings(filters, options)
      // Si options.pagination est true, retourner l'objet complet avec total
      if (options?.pagination && !Array.isArray(result)) {
        return result
      }
      // Sinon, retourner seulement le tableau pour compatibilité
      return Array.isArray(result) ? result : result.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook pour récupérer une annonce par ID
 */
export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => {
      if (!id) throw new Error('ID requis')
      return getListing(id)
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook pour récupérer les annonces de l'utilisateur
 */
export function useUserListings(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-listings', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID requis')
      return getUserListings(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook pour supprimer une annonce
 */
export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      // Invalider les caches des listings
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['user-listings'] })
      toast.success('Annonce supprimée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })
}
