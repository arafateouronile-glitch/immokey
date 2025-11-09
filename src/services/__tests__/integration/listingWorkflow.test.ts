import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createListing, getListing, updateListing, deleteListing } from '../../listingService'
import { uploadListingImages, deleteListingImage } from '../../imageService'
import { addFavorite, isFavorite, removeFavorite } from '../../favoritesService'
import { createInquiry } from '../../inquiryService'

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
    storage: {
      from: vi.fn(),
    },
  }
  
  return {
    supabase: mockSupabase,
    isSupabaseConfigured: true,
  }
})

import * as supabaseModule from '@/lib/supabase'

describe('Integration: Listing Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
    supabaseModule.supabase.storage.from.mockClear()
  })

  describe('Complete listing creation workflow', () => {
    it('should create listing, upload images, and verify listing exists', async () => {
      const listingData = {
        title: 'Appartement moderne 3 pièces',
        description: 'Bel appartement au centre-ville',
        type: 'location' as const,
        property_type: 'appartement' as const,
        city: 'Lomé',
        neighborhood: 'Adidogomé',
        address: '123 Rue de la Paix',
        price: 150000,
        rooms: 3,
        bathrooms: 2,
        surface_area: 85,
        latitude: 6.1375,
        longitude: 1.2123,
        amenities: ['wifi', 'climatisation'],
      }

      const mockListing = {
        id: 'listing-123',
        ...listingData,
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
      }

      // Mock: createListing
      const mockInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      // Mock: getListing
      const mockGetQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockInsert as any) // createListing
        .mockReturnValueOnce(mockGetQuery as any) // getListing

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      // 1. Créer l'annonce
      const createdListing = await createListing(listingData)

      expect(createdListing).toEqual(mockListing)
      expect(createdListing.id).toBe('listing-123')

      // 2. Vérifier que l'annonce existe
      const retrievedListing = await getListing('listing-123')

      expect(retrievedListing).toEqual(mockListing)
      expect(retrievedListing.title).toBe('Appartement moderne 3 pièces')
    })

    it('should create listing, upload images, and add to favorites', async () => {
      const listingData = {
        title: 'Maison avec jardin',
        description: 'Belle maison familiale',
        type: 'vente' as const,
        property_type: 'maison' as const,
        city: 'Lomé',
        neighborhood: 'Nyékonakpoé',
        address: '456 Avenue de la République',
        price: 25000000,
        rooms: 4,
        bathrooms: 3,
        surface_area: 150,
      }

      const mockListing = {
        id: 'listing-456',
        ...listingData,
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
      }

      const mockImageUrl = 'https://example.com/image.jpg'

      // Mock files
      const mockFile = new File(['image content'], 'image.jpg', { type: 'image/jpeg' })

      // Mock: createListing
      const mockInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      // Mock: uploadListingImages
      const mockStorage = {
        upload: vi.fn(() => Promise.resolve({ 
          data: { path: 'listing-456/image.jpg' },
          error: null 
        })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: mockImageUrl } })),
      }

      const mockStorageBucket = {
        from: vi.fn(() => mockStorage),
      }

      const mockImageInsert = {
        insert: vi.fn(() => Promise.resolve({ error: null })),
      }

      // Mock: addFavorite
      const mockFavoriteInsert = {
        insert: vi.fn(() => Promise.resolve({ data: { id: 'favorite-1' }, error: null })),
      }

      // Mock: isFavorite
      const mockFavoriteQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'favorite-1' }, error: null })),
            })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockInsert as any) // createListing
        .mockReturnValueOnce(mockImageInsert as any) // uploadListingImages (insert)
        .mockReturnValueOnce(mockFavoriteInsert as any) // addFavorite
        .mockReturnValueOnce(mockFavoriteQuery as any) // isFavorite

      supabaseModule.supabase.storage.from.mockReturnValue(mockStorageBucket as any)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      // 1. Créer l'annonce
      const createdListing = await createListing(listingData)

      // 2. Uploader des images
      const imageUrls = await uploadListingImages([mockFile], createdListing.id)

      expect(imageUrls).toHaveLength(1)
      expect(imageUrls[0]).toBe(mockImageUrl)

      // 3. Ajouter aux favoris
      await addFavorite(createdListing.id)

      // 4. Vérifier que c'est dans les favoris
      const isFav = await isFavorite(createdListing.id)

      expect(isFav).toBe(true)
    })

    it('should create listing, receive inquiry, and update listing', async () => {
      const listingData = {
        title: 'Studio étudiant',
        description: 'Studio meublé près de l\'université',
        type: 'location' as const,
        property_type: 'appartement' as const,
        city: 'Lomé',
        neighborhood: 'Bè',
        address: '789 Rue des Étudiants',
        price: 75000,
        rooms: 1,
        bathrooms: 1,
        surface_area: 25,
      }

      const mockListing = {
        id: 'listing-789',
        ...listingData,
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
      }

      const updatedListing = {
        ...mockListing,
        price: 70000, // Prix réduit
      }

      // Mock: createListing
      const mockInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      // Mock: getListing (for ownership check in updateListing)
      const mockGetQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      // Mock: updateListing
      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updatedListing, error: null })),
          })),
        }
        return chain
      }

      const mockUpdateQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      // Mock: createInquiry
      const mockInquiryInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                id: 'inquiry-1',
                listing_id: mockListing.id,
                sender_name: 'Jean Dupont',
                sender_email: 'jean@example.com',
                message: 'Bonjour, je suis intéressé par votre annonce',
              },
              error: null 
            })),
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockInsert as any) // createListing
        .mockReturnValueOnce(mockGetQuery as any) // updateListing (check ownership)
        .mockReturnValueOnce(mockUpdateQuery as any) // updateListing (update)
        .mockReturnValueOnce(mockInquiryInsert as any) // createInquiry

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      // 1. Créer l'annonce
      const createdListing = await createListing(listingData)

      // 2. Recevoir une demande d'information
      const inquiry = await createInquiry({
        listing_id: createdListing.id,
        sender_name: 'Jean Dupont',
        sender_email: 'jean@example.com',
        message: 'Bonjour, je suis intéressé par votre annonce',
      })

      expect(inquiry).toBeDefined()
      expect(inquiry.listing_id).toBe(createdListing.id)

      // 3. Mettre à jour le prix de l'annonce
      const updated = await updateListing(createdListing.id, { price: 70000 })

      expect(updated.price).toBe(70000)
    })

    it('should create listing, add to favorites, then remove and delete listing', async () => {
      const listingData = {
        title: 'Bureau commercial',
        description: 'Bureau dans quartier d\'affaires',
        type: 'location' as const,
        property_type: 'bureau' as const,
        city: 'Lomé',
        neighborhood: 'Tokoin',
        address: '321 Boulevard du Commerce',
        price: 200000,
        rooms: 2,
        bathrooms: 1,
        surface_area: 60,
      }

      const mockListing = {
        id: 'listing-999',
        ...listingData,
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
      }

      // Mock: createListing
      const mockInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      // Mock: addFavorite
      const mockFavoriteInsert = {
        insert: vi.fn(() => Promise.resolve({ data: { id: 'favorite-1' }, error: null })),
      }

      // Mock: removeFavorite
      const mockFavoriteDelete = {
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      }

      // Mock: deleteListing (check ownership)
      const mockGetQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockListing, error: null })),
          })),
        })),
      }

      // Mock: deleteListing (delete)
      const mockDeleteQuery = {
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockInsert as any) // createListing
        .mockReturnValueOnce(mockFavoriteInsert as any) // addFavorite
        .mockReturnValueOnce(mockFavoriteDelete as any) // removeFavorite
        .mockReturnValueOnce(mockGetQuery as any) // deleteListing (check)
        .mockReturnValueOnce(mockDeleteQuery as any) // deleteListing (delete)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      // 1. Créer l'annonce
      const createdListing = await createListing(listingData)

      // 2. Ajouter aux favoris
      await addFavorite(createdListing.id)

      // 3. Retirer des favoris
      await removeFavorite(createdListing.id)

      // 4. Supprimer l'annonce
      await deleteListing(createdListing.id)

      expect(mockDeleteQuery.delete).toHaveBeenCalled()
    })
  })
})







