import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addFavorite, removeFavorite, isFavorite, getUserFavorites } from '../favoritesService'

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user' } },
        error: null,
      })),
    },
  }
  
  return {
    supabase: mockSupabase,
    isSupabaseConfigured: true,
  }
})

import * as supabaseModule from '@/lib/supabase'

describe('favoritesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('addFavorite', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(addFavorite('listing-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should throw error when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Not authenticated'),
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(addFavorite('listing-id')).rejects.toThrow('Vous devez être connecté')
    })

    it('should throw error if listing is already in favorites', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'existing-id' }, error: null })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(addFavorite('listing-id')).rejects.toThrow('déjà dans vos favoris')
    })

    it('should add favorite successfully', async () => {
      const mockFavorite = {
        id: 'favorite-id',
        user_id: 'test-user',
        listing_id: 'listing-id',
        created_at: new Date().toISOString(),
      }

      // Mock pour vérifier l'existence
      const mockCheckQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      }

      // Mock pour l'insertion
      const mockInsertQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockFavorite, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockCheckQuery as any)
        .mockReturnValueOnce(mockInsertQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await addFavorite('listing-id')

      expect(result).toEqual(mockFavorite)
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('favorites')
    })
  })

  describe('removeFavorite', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(removeFavorite('listing-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should remove favorite successfully', async () => {
      const mockQuery = {
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await removeFavorite('listing-id')

      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('favorites')
      expect(mockQuery.delete).toHaveBeenCalled()
    })
  })

  describe('isFavorite', () => {
    it('should return false when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await isFavorite('listing-id')
      expect(result).toBe(false)
    })

    it('should return false when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await isFavorite('listing-id')
      expect(result).toBe(false)
    })

    it('should return true when listing is in favorites', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'favorite-id' }, error: null })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await isFavorite('listing-id')

      expect(result).toBe(true)
    })

    it('should return false when listing is not in favorites', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await isFavorite('listing-id')

      expect(result).toBe(false)
    })
  })

  describe('getUserFavorites', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getUserFavorites()
      expect(result).toEqual([])
    })

    it('should return user favorites', async () => {
      const mockListings = [
        {
          id: 'listing-1',
          title: 'Test Listing 1',
        },
        {
          id: 'listing-2',
          title: 'Test Listing 2',
        },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ 
              data: [
                { listings: mockListings[0] },
                { listings: mockListings[1] },
              ], 
              error: null 
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getUserFavorites()

      expect(result).toEqual(mockListings)
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('favorites')
    })

    it('should return empty array when no favorites', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getUserFavorites()

      expect(result).toEqual([])
    })
  })
})

