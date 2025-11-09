import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getListings, getListing, createListing, updateListing, deleteListing } from '../listingService'

// Mock Supabase - doit être défini dans le factory
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

describe('listingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('getListings', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getListings()
      
      expect(result).toEqual([])
    })

    it('should fetch listings with default filters', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Listing',
          type: 'location',
          price: 100000,
        },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null, count: 1 })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getListings()

      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('listings')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should apply filters correctly', async () => {
      const filters = {
        type: 'location' as const,
        city: 'Lomé',
        min_price: 50000,
        max_price: 200000,
      }

      // Créer un mock qui supporte le chaînage multiple de .eq(), .gte(), .lte(), .ilike()
      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getListings(filters)

      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('listings')
      // Vérifier que les filtres sont appliqués
      expect(mockQuery.select).toHaveBeenCalled()
    })

    it('should handle pagination options', async () => {
      const options = {
        limit: 10,
        offset: 0,
        sortBy: 'price',
        sortOrder: 'asc' as const,
      }

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
              })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getListings(undefined, options)

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
    })

    it('should handle custom selectColumns option', async () => {
      const options = {
        selectColumns: 'id, title, price',
      }

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await getListings(undefined, options)

      expect(mockQuery.select).toHaveBeenCalledWith(options.selectColumns, { count: 'exact' })
    })

    it('should handle all filter types correctly', async () => {
      const filters = {
        type: 'vente' as const,
        property_type: 'appartement' as const,
        city: 'Lomé',
        neighborhood: 'Adidogomé',
        min_price: 100000,
        max_price: 500000,
        min_rooms: 2,
        min_surface: 50,
        available: true,
        featured: true,
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await getListings(filters)

      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('listings')
    })

    it('should return empty data object when options provided and Supabase not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getListings(undefined, { limit: 10 })
      
      expect(result).toEqual({ data: [] })
    })

    it('should handle sorting by different fields', async () => {
      const options = {
        sortBy: 'surface_area',
        sortOrder: 'desc' as const,
      }

      const mockOrder = vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: mockOrder,
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await getListings(undefined, options)

      expect(mockOrder).toHaveBeenCalledWith('surface_area', { ascending: false })
    })

    it('should throw error on fetch failure', async () => {
      const mockError = new Error('Database error')
      
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: mockError, count: 0 })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getListings()).rejects.toThrow()
    })
  })

  describe('getListing', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(getListing('test-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should fetch a single listing by id', async () => {
      const mockListing = {
        id: '1',
        title: 'Test Listing',
        type: 'location',
        price: 100000,
        listing_images: [], // Données brutes de Supabase
        user_profiles: null,
      }

      const expectedResult = {
        ...mockListing,
        images: [], // Résultat transformé
      }

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getListing('1')

      expect(result).toEqual(expectedResult)
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('listings')
    })

    it('should throw error when listing not found', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getListing('non-existent')).rejects.toEqual(mockError)
    })
  })

  describe('createListing', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const listingData = {
        title: 'Test',
        type: 'location' as const,
        property_type: 'appartement' as const,
        city: 'Lomé',
        neighborhood: 'Centre',
        address: 'Test Address',
        price: 100000,
        rooms: 2,
        bathrooms: 1,
        surface_area: 50,
      }

      await expect(createListing(listingData)).rejects.toThrow('Supabase non configuré')
    })

    it('should create a listing successfully', async () => {
      const listingData = {
        title: 'Test Listing',
        type: 'location' as const,
        property_type: 'appartement' as const,
        city: 'Lomé',
        neighborhood: 'Centre',
        address: 'Test Address',
        price: 100000,
        rooms: 2,
        bathrooms: 1,
        surface_area: 50,
      }

      const mockCreatedListing = {
        id: 'new-id',
        ...listingData,
        created_at: new Date().toISOString(),
      }

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockCreatedListing, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createListing(listingData)

      expect(result).toEqual(mockCreatedListing)
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('listings')
    })
  })

  describe('updateListing', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(updateListing('id', { title: 'Updated' })).rejects.toThrow('Supabase non configuré')
    })

    it('should update a listing successfully', async () => {
      const updates = { title: 'Updated Title' }
      const mockUpdatedListing = { id: '1', user_id: 'test-user', title: 'Updated Title' }
      const existingListing = { user_id: 'test-user' }

      // Mock pour la vérification de propriété (updateListing fait 2 appels)
      const mockSelectQuery1 = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: existingListing, error: null })),
          })),
        })),
      }

      // Mock pour la mise à jour
      const mockUpdateQuery = {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockUpdatedListing, error: null })),
            })),
          })),
        })),
      }

      // Première fois pour vérifier la propriété, deuxième fois pour update
      supabaseModule.supabase.from
        .mockReturnValueOnce(mockSelectQuery1 as any)
        .mockReturnValueOnce(mockUpdateQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await updateListing('1', updates)

      expect(result).toEqual(mockUpdatedListing)
      expect(mockUpdateQuery.update).toHaveBeenCalledWith(updates)
    })
  })

  describe('deleteListing', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(deleteListing('id')).rejects.toThrow('Supabase non configuré')
    })

    it('should delete a listing successfully', async () => {
      const existingListing = { user_id: 'test-user' }

      // Mock pour la vérification de propriété
      const mockSelectQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: existingListing, error: null })),
          })),
        })),
      }

      // Mock pour la suppression
      const mockDeleteQuery = {
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      }

      // Première fois pour vérifier la propriété, deuxième fois pour delete
      supabaseModule.supabase.from
        .mockReturnValueOnce(mockSelectQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await deleteListing('1')

      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('listings')
      expect(mockDeleteQuery.delete).toHaveBeenCalled()
    })
  })
})

