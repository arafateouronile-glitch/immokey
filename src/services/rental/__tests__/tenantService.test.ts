import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTenants,
  getTenantsByProperty,
  getTenant,
  createTenant,
  updateTenant,
  terminateTenant,
  getActiveTenantForProperty,
} from '../tenantService'

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

describe('tenantService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('getTenants', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getTenants()
      expect(result).toEqual([])
    })

    it('should return tenants', async () => {
      const mockTenants = [
        {
          id: 'tenant-1',
          full_name: 'Jean Dupont',
          status: 'active',
          managed_properties: { id: 'prop-1', name: 'Appartement' },
        },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockTenants, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getTenants()

      expect(result).toEqual(mockTenants)
    })
  })

  describe('getTenantsByProperty', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getTenantsByProperty('prop-id')
      expect(result).toEqual([])
    })

    it('should return tenants for a property', async () => {
      const mockTenants = [
        { id: 'tenant-1', managed_property_id: 'prop-1' },
        { id: 'tenant-2', managed_property_id: 'prop-1' },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockTenants, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getTenantsByProperty('prop-1')

      expect(result).toEqual(mockTenants)
    })
  })

  describe('getTenant', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(getTenant('tenant-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should return tenant by id', async () => {
      const mockTenant = {
        id: 'tenant-1',
        full_name: 'Jean Dupont',
        managed_property_id: 'prop-1',
        managed_properties: { id: 'prop-1', name: 'Appartement' },
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockTenant, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getTenant('tenant-1')

      expect(result).toEqual(mockTenant)
    })
  })

  describe('createTenant', () => {
    it('should throw error when property does not belong to user', async () => {
      const tenantData = {
        managed_property_id: 'prop-1',
        full_name: 'Jean Dupont',
        email: 'jean@example.com',
      }

      const mockPropertyQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { user_id: 'other-user', status: 'vacant' },
              error: null 
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockPropertyQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(createTenant(tenantData as any)).rejects.toThrow('autorisé')
    })

    it('should create tenant and update property status', async () => {
      const tenantData = {
        managed_property_id: 'prop-1',
        full_name: 'Jean Dupont',
        email: 'jean@example.com',
      }

      const mockTenant = {
        id: 'tenant-new',
        ...tenantData,
        status: 'active',
      }

      const mockPropertyQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { user_id: 'test-user', status: 'vacant' },
              error: null 
            })),
          })),
        })),
      }

      const mockTenantInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockTenant, error: null })),
          })),
        })),
      }

      const mockPropertyUpdate = {
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockPropertyQuery as any)
        .mockReturnValueOnce(mockTenantInsert as any)
        .mockReturnValueOnce(mockPropertyUpdate as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createTenant(tenantData as any)

      expect(result).toEqual(mockTenant)
      expect(mockPropertyUpdate.update).toHaveBeenCalledWith({ status: 'occupied' })
    })
  })

  describe('updateTenant', () => {
    it('should throw error when user is not owner', async () => {
      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                managed_property_id: 'prop-1',
                managed_properties: { user_id: 'other-user' }
              },
              error: null 
            })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockTenantQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await expect(updateTenant('tenant-id', { full_name: 'Updated' } as any)).rejects.toThrow('autorisé')
    })

    it('should update tenant successfully', async () => {
      const updates = { full_name: 'Updated Name' }
      const mockUpdatedTenant = {
        id: 'tenant-1',
        full_name: 'Updated Name',
        status: 'active',
      }

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                managed_property_id: 'prop-1',
                managed_properties: { user_id: 'test-user' }
              },
              error: null 
            })),
          })),
        })),
      }

      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockUpdatedTenant, error: null })),
          })),
        }
        return chain
      }

      const mockUpdateQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockTenantQuery as any)
        .mockReturnValueOnce(mockUpdateQuery as any)
      
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await updateTenant('tenant-1', updates as any)

      expect(result).toEqual(mockUpdatedTenant)
    })
  })

  describe('terminateTenant', () => {
    it('should terminate tenant and update property if no active tenants', async () => {
      // Mock pour updateTenant (première partie)
      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { 
                managed_property_id: 'prop-1',
                managed_properties: { user_id: 'test-user' }
              },
              error: null 
            })),
          })),
        })),
      }

      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'tenant-1', status: 'terminated' },
              error: null 
            })),
          })),
        }
        return chain
      }

      const mockUpdateQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      // Mock pour getTenant
      const createMockGetTenantChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'tenant-1', managed_property_id: 'prop-1' },
            error: null 
          })),
        }
        return chain
      }

      const mockGetTenantQuery = {
        select: vi.fn(() => createMockGetTenantChain()),
      }

      // Mock pour vérifier les locataires actifs
      const mockActiveTenantsQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      }

      // Mock pour mettre à jour le bien
      const mockPropertyUpdate = {
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockTenantQuery as any) // updateTenant check
        .mockReturnValueOnce(mockUpdateQuery as any) // updateTenant update
        .mockReturnValueOnce(mockGetTenantQuery as any) // getTenant
        .mockReturnValueOnce(mockActiveTenantsQuery as any) // check active tenants
        .mockReturnValueOnce(mockPropertyUpdate as any) // update property

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      await terminateTenant('tenant-1')

      expect(mockPropertyUpdate.update).toHaveBeenCalledWith({ status: 'vacant' })
    })
  })

  describe('getActiveTenantForProperty', () => {
    it('should return null when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getActiveTenantForProperty('prop-id')
      expect(result).toBeNull()
    })

    it('should return active tenant for property', async () => {
      const mockTenant = {
        id: 'tenant-1',
        managed_property_id: 'prop-1',
        status: 'active',
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockTenant, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getActiveTenantForProperty('prop-1')

      expect(result).toEqual(mockTenant)
    })

    it('should return null when no active tenant', async () => {
      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: { code: 'PGRST116' } 
          })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getActiveTenantForProperty('prop-1')

      expect(result).toBeNull()
    })
  })
})







