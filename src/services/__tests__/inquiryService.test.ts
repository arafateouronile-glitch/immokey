import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createInquiry,
  getReceivedInquiries,
  getSentInquiries,
  markInquiryAsRead,
  getUnreadInquiriesCount,
} from '../inquiryService'

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

// Mock errorHandler
vi.mock('@/utils/errorHandler', () => ({
  handleError: (fn: Function, name: string) => fn(),
}))

import * as supabaseModule from '@/lib/supabase'

describe('inquiryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('createInquiry', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(createInquiry({ listing_id: 'listing-id', message: 'Test' })).rejects.toThrow('Supabase non configuré')
    })

    it('should throw error when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Not authenticated'),
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(createInquiry({ listing_id: 'listing-id', message: 'Test' })).rejects.toThrow('connecté')
    })

    it('should throw error when listing not found', async () => {
      const mockListingQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Not found') })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValueOnce(mockListingQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(createInquiry({ listing_id: 'listing-id', message: 'Test' })).rejects.toThrow('Annonce introuvable')
    })

    it('should throw error when user tries to contact themselves', async () => {
      const mockListingQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { user_id: 'test-user' },
              error: null 
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValueOnce(mockListingQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(createInquiry({ listing_id: 'listing-id', message: 'Test' })).rejects.toThrow('vous-même')
    })

    it('should create inquiry successfully', async () => {
      const mockInquiry = {
        id: 'inquiry-id',
        listing_id: 'listing-id',
        from_user_id: 'test-user',
        to_user_id: 'owner-id',
        message: 'Test message',
        read: false,
        created_at: new Date().toISOString(),
      }

      const mockListingQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { user_id: 'owner-id' },
              error: null 
            })),
          })),
        })),
      }

      const mockInsertQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockInquiry, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockListingQuery as any)
        .mockReturnValueOnce(mockInsertQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createInquiry({ listing_id: 'listing-id', message: 'Test message' })

      expect(result).toEqual(mockInquiry)
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('listings')
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('inquiries')
    })
  })

  describe('getReceivedInquiries', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getReceivedInquiries()
      expect(result).toEqual([])
    })

    it('should throw error when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Not authenticated'),
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getReceivedInquiries()).rejects.toThrow('connecté')
    })

    it('should return received inquiries with transformed data', async () => {
      const mockData = [
        {
          id: 'inquiry-1',
          message: 'Test message',
          listings: {
            id: 'listing-1',
            title: 'Test Listing',
            listing_images: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }],
          },
          from_user: {
            id: 'user-1',
            full_name: 'John Doe',
            phone: '123456789',
          },
        },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getReceivedInquiries()

      expect(result).toHaveLength(1)
      expect(result[0].listings?.images).toEqual(['image1.jpg'])
      expect(result[0].from_user).toBeDefined()
    })
  })

  describe('getSentInquiries', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getSentInquiries()
      expect(result).toEqual([])
    })

    it('should throw error when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Not authenticated'),
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(getSentInquiries()).rejects.toThrow('connecté')
    })

    it('should return sent inquiries with transformed data', async () => {
      const mockData = [
        {
          id: 'inquiry-1',
          message: 'Test message',
          listings: {
            id: 'listing-1',
            title: 'Test Listing',
            listing_images: [{ url: 'image1.jpg' }],
          },
          to_user: {
            id: 'user-1',
            full_name: 'Jane Doe',
            phone: '987654321',
          },
        },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getSentInquiries()

      expect(result).toHaveLength(1)
      expect(result[0].listings?.images).toEqual(['image1.jpg'])
      expect(result[0].to_user).toBeDefined()
    })
  })

  describe('markInquiryAsRead', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(markInquiryAsRead('inquiry-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should mark inquiry as read successfully', async () => {
      const mockQuery = {
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await markInquiryAsRead('inquiry-id')

      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('inquiries')
      expect(mockQuery.update).toHaveBeenCalledWith({ read: true })
    })
  })

  describe('getUnreadInquiriesCount', () => {
    it('should return 0 when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getUnreadInquiriesCount()
      expect(result).toBe(0)
    })

    it('should return 0 when user is not authenticated', async () => {
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getUnreadInquiriesCount()
      expect(result).toBe(0)
    })

    it('should return unread count', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ count: 5, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getUnreadInquiriesCount()

      expect(result).toBe(5)
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('inquiries')
    })

    it('should return 0 on error', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ count: null, error: new Error('DB error') })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getUnreadInquiriesCount()

      expect(result).toBe(0)
    })
  })
})






