import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getManagedProperties,
  getManagedProperty,
  createManagedProperty,
  updateManagedProperty,
  archiveManagedProperty,
  getManagedPropertiesStats,
} from '../managedPropertyService'

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

describe('managedPropertyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('getManagedProperties', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getManagedProperties()
      expect(result).toEqual([])
    })

    it('should throw error when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getManagedProperties()).rejects.toThrow('connecté')
    })

    it('should return managed properties', async () => {
      const mockProperties = [
        {
          id: 'prop-1',
          name: 'Appartement Lomé',
          status: 'occupied',
          user_id: 'test-user',
        },
        {
          id: 'prop-2',
          name: 'Maison Adidogomé',
          status: 'vacant',
          user_id: 'test-user',
        },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockProperties, error: null })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getManagedProperties()

      expect(result).toEqual(mockProperties)
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('managed_properties')
    })
  })

  describe('getManagedProperty', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(getManagedProperty('prop-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should throw error when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getManagedProperty('prop-id')).rejects.toThrow('connecté')
    })

    it('should return managed property by id', async () => {
      const mockProperty = {
        id: 'prop-1',
        name: 'Appartement Lomé',
        status: 'occupied',
        user_id: 'test-user',
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockProperty, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getManagedProperty('prop-1')

      expect(result).toEqual(mockProperty)
    })

    it('should throw error when property not found', async () => {
      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getManagedProperty('prop-id')).rejects.toThrow('Bien non trouvé')
    })
  })

  describe('createManagedProperty', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(createManagedProperty({ name: 'Test' } as any)).rejects.toThrow('Supabase non configuré')
    })

    it('should create managed property successfully', async () => {
      const propertyData = {
        name: 'Nouvel Appartement',
        address: 'Lomé, Togo',
        monthly_rent: 50000,
      }

      const mockProperty = {
        id: 'prop-new',
        ...propertyData,
        user_id: 'test-user',
        status: 'vacant',
      }

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockProperty, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createManagedProperty(propertyData as any)

      expect(result).toEqual(mockProperty)
      expect(result.status).toBe('vacant')
    })
  })

  describe('updateManagedProperty', () => {
    it('should throw error when user is not owner', async () => {
      const createMockCheckChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ 
            data: { user_id: 'other-user' },
            error: null 
          })),
        }
        return chain
      }

      const mockCheckQuery = {
        select: vi.fn(() => createMockCheckChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockCheckQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(updateManagedProperty('prop-id', { name: 'Updated' } as any)).rejects.toThrow('autorisé')
    })

    it('should update managed property successfully', async () => {
      const updates = { name: 'Updated Name' }
      const mockUpdatedProperty = {
        id: 'prop-1',
        name: 'Updated Name',
        status: 'occupied',
        user_id: 'test-user',
      }

      const createMockCheckChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ 
            data: { user_id: 'test-user' },
            error: null 
          })),
        }
        return chain
      }

      const mockCheckQuery = {
        select: vi.fn(() => createMockCheckChain()),
      }

      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockUpdatedProperty, error: null })),
          })),
        }
        return chain
      }

      const mockUpdateQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockCheckQuery as any)
        .mockReturnValueOnce(mockUpdateQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await updateManagedProperty('prop-1', updates as any)

      expect(result).toEqual(mockUpdatedProperty)
    })
  })

  describe('archiveManagedProperty', () => {
    it('should archive property by updating status', async () => {
      const createMockCheckChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ 
            data: { user_id: 'test-user' },
            error: null 
          })),
        }
        return chain
      }

      const mockCheckQuery = {
        select: vi.fn(() => createMockCheckChain()),
      }

      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'prop-1', status: 'archived' },
              error: null 
            })),
          })),
        }
        return chain
      }

      const mockUpdateQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockCheckQuery as any)
        .mockReturnValueOnce(mockUpdateQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await archiveManagedProperty('prop-1')

      expect(mockUpdateQuery.update).toHaveBeenCalledWith({ status: 'archived' })
    })
  })

  describe('getManagedPropertiesStats', () => {
    it('should return empty stats when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getManagedPropertiesStats()
      
      expect(result).toEqual({ total: 0, occupied: 0, vacant: 0 })
    })

    it('should return stats correctly', async () => {
      const mockData = [
        { status: 'occupied' },
        { status: 'occupied' },
        { status: 'vacant' },
        { status: 'vacant' },
        { status: 'vacant' },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getManagedPropertiesStats()

      expect(result).toEqual({ total: 5, occupied: 2, vacant: 3 })
    })

    it('should return empty stats on error', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => Promise.resolve({ data: null, error: new Error('DB error') })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getManagedPropertiesStats()

      expect(result).toEqual({ total: 0, occupied: 0, vacant: 0 })
    })
  })
})

