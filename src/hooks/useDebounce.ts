import { useEffect, useState } from 'react'

/**
 * Hook pour debounce une valeur
 * Utile pour les recherches et filtres en temps réel
 * 
 * @param value - La valeur à debounce
 * @param delay - Le délai en millisecondes (défaut: 500ms)
 * @returns La valeur debounced
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedSearch = useDebounce(searchQuery, 500)
 * 
 * useEffect(() => {
 *   // Cette fonction ne s'exécutera que 500ms après la dernière modification de searchQuery
 *   performSearch(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Mettre à jour la valeur debounced après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Nettoyer le timeout si la valeur change avant le délai
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}





