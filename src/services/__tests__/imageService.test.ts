import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadListingImage, uploadListingImages, deleteListingImage, checkStorageBucket } from '../imageService'

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
    storage: {
      from: vi.fn(),
      listBuckets: vi.fn(),
    },
  }
  
  return {
    supabase: mockSupabase,
    isSupabaseConfigured: true,
  }
})

import * as supabaseModule from '@/lib/supabase'

describe('imageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
    supabaseModule.supabase.storage.from.mockClear()
  })

  describe('uploadListingImage', () => {
    it('should throw error when Supabase is not configured', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(uploadListingImage(file, 'listing-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should throw error when user is not authenticated', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vi.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Not authenticated'),
      } as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(uploadListingImage(file, 'listing-id')).rejects.toThrow('Vous devez être connecté')
    })

    it('should throw error for non-image file', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(uploadListingImage(file, 'listing-id')).rejects.toThrow('Le fichier doit être une image')
    })

    it('should throw error for file too large', async () => {
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(uploadListingImage(largeFile, 'listing-id')).rejects.toThrow('5MB')
    })

    it('should upload image successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const publicUrl = 'https://example.com/image.jpg'
      
      const mockStorage = {
        upload: vi.fn(() => Promise.resolve({ data: { path: 'listing-id/123.jpg' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl } })),
      }

      const mockDbQuery = {
        insert: vi.fn(() => Promise.resolve({ error: null })),
      }

      supabaseModule.supabase.storage.from.mockReturnValue(mockStorage as any)
      supabaseModule.supabase.from.mockReturnValue(mockDbQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await uploadListingImage(file, 'listing-id')

      expect(result).toBe(publicUrl)
      expect(supabaseModule.supabase.storage.from).toHaveBeenCalledWith('listing-images')
      expect(mockStorage.upload).toHaveBeenCalled()
    })

    it('should delete uploaded file if database insert fails', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const filePath = 'listing-id/123.jpg'
      
      const mockStorage = {
        upload: vi.fn(() => Promise.resolve({ data: { path: filePath }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
      }

      const mockDbQuery = {
        insert: vi.fn(() => Promise.resolve({ error: new Error('DB error') })),
      }

      supabaseModule.supabase.storage.from.mockReturnValue(mockStorage as any)
      supabaseModule.supabase.from.mockReturnValue(mockDbQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(uploadListingImage(file, 'listing-id')).rejects.toThrow('DB error')
      expect(mockStorage.remove).toHaveBeenCalledWith([filePath])
    })
  })

  describe('uploadListingImages', () => {
    it('should throw error when Supabase is not configured', async () => {
      const files = [new File(['test'], 'test1.jpg', { type: 'image/jpeg' })]
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(uploadListingImages(files, 'listing-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should upload multiple images', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]

      const mockStorage = {
        upload: vi.fn(() => Promise.resolve({ data: { path: 'listing-id/123.jpg' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
      }

      const mockDbQuery = {
        insert: vi.fn(() => Promise.resolve({ error: null })),
      }

      supabaseModule.supabase.storage.from.mockReturnValue(mockStorage as any)
      supabaseModule.supabase.from.mockReturnValue(mockDbQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await uploadListingImages(files, 'listing-id')

      expect(result).toHaveLength(2)
      expect(mockStorage.upload).toHaveBeenCalledTimes(2)
    })
  })

  describe('deleteListingImage', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(deleteListingImage('image-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should throw error when image not found', async () => {
      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Not found') })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(deleteListingImage('image-id')).rejects.toThrow('Image non trouvée')
    })

    it('should throw error when user is not owner', async () => {
      const mockImageQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { url: 'https://example.com/storage/listing-images/path.jpg', listing_id: 'listing-id' },
              error: null 
            })),
          })),
        })),
      }

      const mockListingQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { user_id: 'other-user' },
              error: null 
            })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockImageQuery as any)
        .mockReturnValueOnce(mockListingQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(deleteListingImage('image-id')).rejects.toThrow('autorisé')
    })

    it('should delete image successfully', async () => {
      const mockImageQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { url: 'https://example.com/storage/v1/object/public/listing-images/path.jpg', listing_id: 'listing-id' },
              error: null 
            })),
          })),
        })),
      }

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

      const mockDeleteQuery = {
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }

      const mockStorage = {
        remove: vi.fn(() => Promise.resolve({ error: null })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockImageQuery as any)
        .mockReturnValueOnce(mockListingQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any)
      
      supabaseModule.supabase.storage.from.mockReturnValue(mockStorage as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await deleteListingImage('image-id')

      expect(supabaseModule.supabase.storage.from).toHaveBeenCalledWith('listing-images')
      expect(mockStorage.remove).toHaveBeenCalled()
      expect(mockDeleteQuery.delete).toHaveBeenCalled()
    })
  })

  describe('checkStorageBucket', () => {
    it('should return false when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await checkStorageBucket()
      expect(result).toBe(false)
    })

    it('should return true when bucket exists', async () => {
      supabaseModule.supabase.storage.listBuckets = vi.fn(() => Promise.resolve({
        data: [{ name: 'listing-images' }, { name: 'other-bucket' }],
        error: null,
      }))

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await checkStorageBucket()

      expect(result).toBe(true)
    })

    it('should return false when bucket does not exist', async () => {
      supabaseModule.supabase.storage.listBuckets = vi.fn(() => Promise.resolve({
        data: [{ name: 'other-bucket' }],
        error: null,
      }))

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await checkStorageBucket()

      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      supabaseModule.supabase.storage.listBuckets = vi.fn(() => Promise.resolve({
        data: null,
        error: new Error('Storage error'),
      }))

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await checkStorageBucket()

      expect(result).toBe(false)
    })
  })
})







