import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  getBookingsStats,
} from '../bookingService'

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

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('getBookings', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getBookings()
      expect(result).toEqual([])
    })

    it('should return bookings with filters', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          establishment_id: 'est-1',
          status: 'confirmed',
          hospitality_establishments: { user_id: 'test-user' },
        },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockBookings, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getBookings({ status: 'confirmed' })

      expect(result).toHaveLength(1)
      expect(result[0]).not.toHaveProperty('hospitality_establishments')
    })
  })

  describe('getBooking', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(getBooking('booking-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should throw error when user is not owner', async () => {
      const mockBooking = {
        id: 'booking-1',
        hospitality_establishments: { user_id: 'other-user' },
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockBooking, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getBooking('booking-1')).rejects.toThrow('autorisé')
    })

    it('should return booking by id', async () => {
      const mockBooking = {
        id: 'booking-1',
        hospitality_establishments: { user_id: 'test-user', name: 'Hotel' },
        hospitality_rooms: { id: 'room-1' },
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockBooking, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getBooking('booking-1')

      expect(result).toHaveProperty('establishment')
      expect(result).toHaveProperty('room')
    })
  })

  describe('createBooking', () => {
    it('should create booking with calculated amounts', async () => {
      const bookingData = {
        establishment_id: 'est-1',
        room_id: 'room-1',
        guest_name: 'Jean Dupont',
        guest_email: 'jean@example.com',
        check_in_date: '2024-12-01',
        check_out_date: '2024-12-05',
        price_per_night: 10000,
      }

      const mockEstablishment = { id: 'est-1' }
      const mockBooking = {
        id: 'booking-new',
        ...bookingData,
        nights: 4,
        subtotal: 40000,
        total_amount: 40000,
        status: 'pending',
        payment_status: 'pending',
      }

      const mockEstablishmentQuery = {
        select: vi.fn(() => {
          const chain: any = {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: mockEstablishment, error: null })),
          }
          return chain
        }),
      }

      const mockBookingInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockBooking, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockEstablishmentQuery as any)
        .mockReturnValueOnce(mockBookingInsert as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createBooking(bookingData as any)

      expect(result).toEqual(mockBooking)
      expect(result.nights).toBe(4)
    })
  })

  describe('updateBooking', () => {
    it('should update booking and recalculate amounts', async () => {
      const updates = { check_out_date: '2024-12-10' }
      const currentBooking = {
        id: 'booking-1',
        check_in_date: '2024-12-01',
        check_out_date: '2024-12-05',
        price_per_night: 10000,
        nights: 4,
        subtotal: 40000,
        total_amount: 40000,
        status: 'confirmed',
        taxes: 0,
        fees: 0,
        discount: 0,
        confirmed_at: null,
        checked_in_at: null,
        checked_out_at: null,
        cancelled_at: null,
        balance_paid_at: null,
      }

      const mockCheckQuery = {
        select: vi.fn(() => {
          const chain: any = {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                establishment_id: 'est-1',
                hospitality_establishments: { user_id: 'test-user' }
              },
              error: null 
            })),
          }
          return chain
        }),
      }

      // Mock getBooking call (called inside updateBooking)
      const mockGetBookingQuery = {
        select: vi.fn(() => {
          const chain: any = {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ 
              data: {
                ...currentBooking,
                hospitality_establishments: { user_id: 'test-user' },
                hospitality_rooms: null,
              },
              error: null 
            })),
          }
          return chain
        }),
      }

      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { ...currentBooking, nights: 9, subtotal: 90000, total_amount: 90000 },
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
        .mockReturnValueOnce(mockCheckQuery as any) // Check ownership
        .mockReturnValueOnce(mockGetBookingQuery as any) // Get current booking (via getBooking)
        .mockReturnValueOnce(mockUpdateQuery as any) // Update booking

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await updateBooking('booking-1', updates as any)

      expect(result.nights).toBe(9)
      expect(result.subtotal).toBe(90000)
    })
  })

  describe('deleteBooking', () => {
    it('should delete booking successfully', async () => {
      const mockCheckQuery = {
        select: vi.fn(() => {
          const chain: any = {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                establishment_id: 'est-1',
                hospitality_establishments: { user_id: 'test-user' }
              },
              error: null 
            })),
          }
          return chain
        }),
      }

      const mockDeleteQuery = {
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockCheckQuery as any) // Check ownership
        .mockReturnValueOnce(mockDeleteQuery as any) // Delete booking

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await deleteBooking('booking-1')

      expect(mockDeleteQuery.delete).toHaveBeenCalled()
    })
  })

  describe('checkInBooking', () => {
    it('should update booking status to checked_in', async () => {
      // Mock updateBooking call
      const mockCheckQuery = {
        select: vi.fn(() => {
          const chain: any = {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                establishment_id: 'est-1',
                hospitality_establishments: { user_id: 'test-user' }
              },
              error: null 
            })),
          }
          return chain
        }),
      }

      const mockGetBookingQuery = {
        select: vi.fn(() => {
          const chain: any = {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ 
              data: {
                id: 'booking-1',
                status: 'confirmed',
                check_in_date: '2024-12-01',
                check_out_date: '2024-12-05',
                price_per_night: 10000,
                nights: 4,
                subtotal: 40000,
                total_amount: 40000,
                taxes: 0,
                fees: 0,
                discount: 0,
                confirmed_at: null,
                checked_in_at: null,
                checked_out_at: null,
                cancelled_at: null,
                balance_paid_at: null,
                hospitality_establishments: { user_id: 'test-user' },
                hospitality_rooms: null,
              },
              error: null 
            })),
          }
          return chain
        }),
      }

      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'booking-1', status: 'checked_in', checked_in_at: new Date().toISOString() },
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
        .mockReturnValueOnce(mockCheckQuery as any) // Check ownership
        .mockReturnValueOnce(mockGetBookingQuery as any) // Get current booking
        .mockReturnValueOnce(mockUpdateQuery as any) // Update booking

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await checkInBooking('booking-1')

      expect(result.status).toBe('checked_in')
      expect(result).toHaveProperty('checked_in_at')
    })
  })

  describe('getBookingsStats', () => {
    it('should return empty stats when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getBookingsStats()
      
      expect(result).toEqual({
        total: 0,
        pending: 0,
        confirmed: 0,
        checked_in: 0,
        checked_out: 0,
        cancelled: 0,
        revenue: 0,
      })
    })

    it('should return stats correctly', async () => {
      const mockData = [
        { status: 'confirmed', payment_status: 'paid', total_amount: 50000 },
        { status: 'checked_in', payment_status: 'paid', total_amount: 30000 },
        { status: 'pending', payment_status: 'pending', total_amount: 20000 },
      ]

      // Create a thenable chain that can be awaited
      const mockQueryResult = Promise.resolve({ data: mockData, error: null })
      const mockChain = {
        eq: vi.fn(function() {
          // Return a thenable object that can be awaited
          return Object.assign(mockQueryResult, {
            eq: vi.fn().mockReturnThis(),
          })
        }),
      }
      
      // Make the chain itself awaitable
      Object.assign(mockChain, mockQueryResult)
      
      const mockQuery = {
        select: vi.fn(() => mockChain),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getBookingsStats()

      expect(result.total).toBe(3)
      expect(result.revenue).toBe(80000) // 50000 + 30000 (only paid)
    })
  })
})

