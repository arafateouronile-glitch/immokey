import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getEstablishments,
  getEstablishment,
  createEstablishment,
  updateEstablishment,
  archiveEstablishment,
  getEstablishmentsStats,
} from '../establishmentService'

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

describe('establishmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('getEstablishments', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getEstablishments()
      expect(result).toEqual([])
    })

    it('should return establishments', async () => {
      const mockEstablishments = [
        {
          id: 'est-1',
          name: 'Hôtel du Lac',
          type: 'hotel',
          status: 'active',
          user_id: 'test-user',
        },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockEstablishments, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getEstablishments()

      expect(result).toEqual(mockEstablishments)
    })
  })

  describe('getEstablishment', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(getEstablishment('est-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should return establishment by id', async () => {
      const mockEstablishment = {
        id: 'est-1',
        name: 'Hôtel du Lac',
        type: 'hotel',
        status: 'active',
        user_id: 'test-user',
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockEstablishment, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getEstablishment('est-1')

      expect(result).toEqual(mockEstablishment)
    })
  })

  describe('createEstablishment', () => {
    it('should create establishment with default values', async () => {
      const establishmentData = {
        name: 'Nouvel Hôtel',
        type: 'hotel' as const,
        address: 'Lomé, Togo',
      }

      const mockEstablishment = {
        id: 'est-new',
        ...establishmentData,
        user_id: 'test-user',
        status: 'active',
        photo_urls: [],
        amenities: [],
      }

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockEstablishment, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createEstablishment(establishmentData as any)

      expect(result).toEqual(mockEstablishment)
      expect(result.status).toBe('active')
    })
  })

  describe('updateEstablishment', () => {
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

      await expect(updateEstablishment('est-id', { name: 'Updated' } as any)).rejects.toThrow('autorisé')
    })

    it('should update establishment successfully', async () => {
      const updates = { name: 'Updated Name' }
      const mockUpdatedEstablishment = {
        id: 'est-1',
        name: 'Updated Name',
        status: 'active',
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
            single: vi.fn(() => Promise.resolve({ data: mockUpdatedEstablishment, error: null })),
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

      const result = await updateEstablishment('est-1', updates as any)

      expect(result).toEqual(mockUpdatedEstablishment)
    })
  })

  describe('archiveEstablishment', () => {
    it('should archive establishment by updating status', async () => {
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
              data: { id: 'est-1', status: 'archived' },
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

      await archiveEstablishment('est-1')

      expect(mockUpdateQuery.update).toHaveBeenCalledWith({ status: 'archived' })
    })
  })

  describe('getEstablishmentsStats', () => {
    it('should return empty stats when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getEstablishmentsStats()
      
      expect(result).toEqual({ total: 0, active: 0, inactive: 0 })
    })

    it('should return stats correctly', async () => {
      const mockData = [
        { status: 'active' },
        { status: 'active' },
        { status: 'inactive' },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getEstablishmentsStats()

      expect(result).toEqual({ total: 3, active: 2, inactive: 1 })
    })

    it('should return empty stats on error', async () => {
      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn(() => Promise.resolve({ data: null, error: new Error('DB error') })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getEstablishmentsStats()

      expect(result).toEqual({ total: 0, active: 0, inactive: 0 })
    })
  })
})







