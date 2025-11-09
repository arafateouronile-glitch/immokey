import { QueryClient } from '@tanstack/react-query'

/**
 * Configuration React Query avec cache optimisé
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes
      staleTime: 1000 * 60 * 5,
      // Garder en cache même après démontage
      gcTime: 1000 * 60 * 10, // 10 minutes (anciennement cacheTime)
      // Réessayer 3 fois en cas d'erreur
      retry: 3,
      // Réessayer après 1 seconde
      retryDelay: 1000,
      // Refetch sur reconnexion
      refetchOnReconnect: true,
      // Ne pas refetch automatiquement en arrière-plan
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Réessayer une fois en cas d'erreur
      retry: 1,
    },
  },
})





