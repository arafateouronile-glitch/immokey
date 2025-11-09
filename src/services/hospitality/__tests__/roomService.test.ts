import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsStats,
} from '../roomService'

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

describe('roomService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('getRooms', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getRooms('est-id')
      expect(result).toEqual([])
    })

    it('should return rooms for establishment', async () => {
      const mockRooms = [
        { id: 'room-1', establishment_id: 'est-1', room_number: '101', status: 'active' },
        { id: 'room-2', establishment_id: 'est-1', room_number: '102', status: 'active' },
      ]

      // Mock establishment check
      const mockEstablishmentQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { id: 'est-1' }, error: null })),
            })),
          })),
        })),
      }

      // Mock rooms query
      const createMockRoomsChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockRooms, error: null })),
        }
        return chain
      }

      const mockRoomsQuery = {
        select: vi.fn(() => createMockRoomsChain()),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockEstablishmentQuery as any) // Check establishment
        .mockReturnValueOnce(mockRoomsQuery as any) // Get rooms

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getRooms('est-1')

      expect(result).toEqual(mockRooms)
    })

    it('should throw error when establishment not found', async () => {
      const mockEstablishmentQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockEstablishmentQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getRooms('est-1')).rejects.toThrow('autorisé')
    })
  })

  describe('getRoom', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(getRoom('room-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should return room by id', async () => {
      const mockRoom = {
        id: 'room-1',
        establishment_id: 'est-1',
        room_number: '101',
        hospitality_establishments: { user_id: 'test-user' },
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockRoom, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getRoom('room-1')

      expect(result).not.toHaveProperty('hospitality_establishments')
      expect(result.id).toBe('room-1')
    })

    it('should throw error when user is not owner', async () => {
      const mockRoom = {
        id: 'room-1',
        hospitality_establishments: { user_id: 'other-user' },
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockRoom, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getRoom('room-1')).rejects.toThrow('autorisé')
    })
  })

  describe('createRoom', () => {
    it('should create room successfully', async () => {
      const roomData = {
        establishment_id: 'est-1',
        room_number: '101',
        room_type: 'standard',
        max_occupancy: 2,
        base_price: 15000,
      }

      const mockEstablishment = { id: 'est-1' }
      const mockRoom = {
        id: 'room-new',
        ...roomData,
        status: 'active',
        photo_urls: [],
        amenities: [],
        currency: 'FCFA',
      }

      // Mock establishment check
      const mockEstablishmentQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEstablishment, error: null })),
            })),
          })),
        })),
      }

      // Mock room insert
      const mockRoomInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockRoom, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockEstablishmentQuery as any)
        .mockReturnValueOnce(mockRoomInsert as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createRoom(roomData as any)

      expect(result).toEqual(mockRoom)
      expect(result.status).toBe('active')
    })

    it('should throw error when establishment not authorized', async () => {
      const roomData = {
        establishment_id: 'est-1',
        room_number: '101',
      }

      const mockEstablishmentQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockEstablishmentQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(createRoom(roomData as any)).rejects.toThrow('autorisé')
    })
  })

  describe('updateRoom', () => {
    it('should update room successfully', async () => {
      const updates = { base_price: 20000 }

      // Mock ownership check
      const mockCheckQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                establishment_id: 'est-1',
                hospitality_establishments: { user_id: 'test-user' }
              },
              error: null 
            })),
          })),
        })),
      }

      // Mock update
      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'room-1', ...updates },
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

      const result = await updateRoom('room-1', updates)

      expect(result.base_price).toBe(20000)
    })

    it('should throw error when room not found', async () => {
      const mockCheckQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockCheckQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(updateRoom('room-1', {})).rejects.toThrow('trouvée')
    })
  })

  describe('deleteRoom', () => {
    it('should delete room by setting status to inactive', async () => {
      // Mock ownership check
      const mockCheckQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                establishment_id: 'est-1',
                hospitality_establishments: { user_id: 'test-user' }
              },
              error: null 
            })),
          })),
        })),
      }

      // Mock update to inactive
      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'room-1', status: 'inactive' },
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

      await deleteRoom('room-1')

      expect(mockUpdateQuery.update).toHaveBeenCalledWith({ status: 'inactive' })
    })
  })

  describe('getRoomsStats', () => {
    it('should return empty stats when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getRoomsStats('est-1')
      
      expect(result).toEqual({
        total: 0,
        active: 0,
        maintenance: 0,
        inactive: 0,
      })
    })

    it('should return stats correctly', async () => {
      const mockData = [
        { status: 'active' },
        { status: 'active' },
        { status: 'maintenance' },
        { status: 'inactive' },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getRoomsStats('est-1')

      expect(result.total).toBe(4)
      expect(result.active).toBe(2)
      expect(result.maintenance).toBe(1)
      expect(result.inactive).toBe(1)
    })
  })
})






