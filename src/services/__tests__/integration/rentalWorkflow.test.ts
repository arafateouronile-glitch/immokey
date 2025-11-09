import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createManagedProperty,
  getManagedProperty,
  updateManagedProperty,
} from '../../rental/managedPropertyService'
import {
  createTenant,
  getTenant,
  updateTenant,
} from '../../rental/tenantService'
import {
  createDueDate,
  createPayment,
  getPaymentStats,
} from '../../rental/paymentService'

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'landlord-id' } },
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

describe('Integration: Rental Management Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('Complete rental management workflow', () => {
    it('should create property, add tenant, create due dates, and record payment', async () => {
      // 1. Créer un bien
      const propertyData = {
        name: 'Appartement T1',
        address: '123 Rue de la Paix',
        city: 'Lomé',
        property_type: 'appartement' as const,
        monthly_rent: 150000,
        charges: 10000,
        rooms: 2,
        bathrooms: 1,
        surface_area: 45,
      }

      const mockProperty = {
        id: 'property-1',
        ...propertyData,
        user_id: 'landlord-id',
        created_at: new Date().toISOString(),
      }

      // 2. Créer un locataire
      const tenantData = {
        managed_property_id: 'property-1',
        full_name: 'Jean Dupont',
        email: 'jean@example.com',
        phone: '+228 90 12 34 56',
        monthly_rent: 150000,
        due_day: 5,
        lease_start_date: '2024-01-01',
        lease_end_date: '2024-12-31',
      }

      const mockTenant = {
        id: 'tenant-1',
        ...tenantData,
        status: 'active',
        created_at: new Date().toISOString(),
      }

      // 3. Créer une échéance
      const dueDateData = {
        tenant_id: 'tenant-1',
        managed_property_id: 'property-1',
        period_month: 12,
        period_year: 2024,
        rent_amount: 150000,
        charges_amount: 10000,
        due_date: '2024-12-05',
      }

      const mockDueDate = {
        id: 'due-date-1',
        ...dueDateData,
        total_amount: 160000,
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      // 4. Enregistrer un paiement
      const paymentData = {
        tenant_id: 'tenant-1',
        due_date_id: 'due-date-1',
        amount: 160000,
        payment_method: 'cash',
        payment_date: '2024-12-05',
      }

      const mockPayment = {
        id: 'payment-1',
        ...paymentData,
        recorded_by: 'landlord-id',
        created_at: new Date().toISOString(),
      }

      // Mock: createManagedProperty
      const mockPropertyInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockProperty, error: null })),
          })),
        })),
      }

      // Mock: createTenant
      const mockTenantInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockTenant, error: null })),
          })),
        })),
      }

      // Mock: createDueDate
      const mockDueDateInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockDueDate, error: null })),
          })),
        })),
      }

      // Mock: createPayment
      const mockPaymentInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockPayment, error: null })),
          })),
        })),
      }

      // Mock: getDueDate (called in createPayment)
      const mockDueDateQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockDueDate, error: null })),
          })),
        })),
      }

      // Mock: getPaymentsByDueDate (called in createPayment)
      const mockPaymentsQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [mockPayment], error: null })),
          })),
        })),
      }

      // Mock: updateDueDateStatus (called in createPayment)
      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { ...mockDueDate, status: 'paid' },
              error: null 
            })),
          })),
        }
        return chain
      }

      const mockUpdateQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      // Mock: getPaymentStats
      const mockStatsQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ 
            data: [mockDueDate],
            error: null 
          })),
        })),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockPropertyInsert as any) // createManagedProperty
        .mockReturnValueOnce(mockPropertyCheck as any) // createTenant (check property)
        .mockReturnValueOnce(mockTenantInsert as any) // createTenant (insert)
        .mockReturnValueOnce(mockPropertyUpdateStatus as any) // createTenant (update property status)
        .mockReturnValueOnce(mockDueDateInsert as any) // createDueDate
        .mockReturnValueOnce(mockPaymentInsert as any) // createPayment (insert)
        .mockReturnValueOnce(mockDueDateQuery as any) // createPayment (getDueDate)
        .mockReturnValueOnce(mockPaymentsQuery as any) // createPayment (getPayments)
        .mockReturnValueOnce(mockUpdateQuery as any) // createPayment (updateStatus)
        .mockReturnValueOnce(mockStatsQuery as any) // getPaymentStats

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      // Workflow complet
      const property = await createManagedProperty(propertyData as any)
      expect(property.id).toBe('property-1')

      const tenant = await createTenant(tenantData as any)
      expect(tenant.id).toBe('tenant-1')
      expect(tenant.managed_property_id).toBe(property.id)

      const dueDate = await createDueDate(dueDateData as any)
      expect(dueDate.id).toBe('due-date-1')
      expect(dueDate.total_amount).toBe(160000)

      const payment = await createPayment(paymentData as any)
      expect(payment.id).toBe('payment-1')
      expect(payment.amount).toBe(160000)

      // Vérifier les statistiques
      const stats = await getPaymentStats(tenant.id, property.id)
      expect(stats.total_due).toBeGreaterThan(0)
    })

    it('should create property, add tenant, update tenant, and update property', async () => {
      const propertyData = {
        name: 'Maison familiale',
        address: '456 Avenue République',
        city: 'Lomé',
        property_type: 'maison' as const,
        monthly_rent: 200000,
        charges: 15000,
        rooms: 4,
        bathrooms: 2,
        surface_area: 120,
      }

      const mockProperty = {
        id: 'property-2',
        ...propertyData,
        user_id: 'landlord-id',
        created_at: new Date().toISOString(),
      }

      const updatedProperty = {
        ...mockProperty,
        monthly_rent: 220000, // Loyer augmenté
      }

      const tenantData = {
        managed_property_id: 'property-2',
        full_name: 'Marie Martin',
        email: 'marie@example.com',
        phone: '+228 91 23 45 67',
        monthly_rent: 200000,
        due_day: 10,
        lease_start_date: '2024-01-01',
        lease_end_date: '2024-12-31',
      }

      const mockTenant = {
        id: 'tenant-2',
        ...tenantData,
        status: 'active',
        created_at: new Date().toISOString(),
      }

      const updatedTenant = {
        ...mockTenant,
        monthly_rent: 220000, // Loyer mis à jour
      }

      // Mock: createManagedProperty
      const mockPropertyInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockProperty, error: null })),
          })),
        })),
      }

      // Mock: createTenant (check property ownership)
      const mockPropertyCheck = {
        select: vi.fn(() => {
          const chain: any = {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ 
              data: { user_id: 'landlord-id', status: 'active' },
              error: null 
            })),
          }
          return chain
        }),
      }

      // Mock: createTenant (insert)
      const mockTenantInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockTenant, error: null })),
          })),
        })),
      }

      // Mock: createTenant (update property status)
      const mockPropertyUpdateStatus = {
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }

      // Mock: getTenant (for updateTenant)
      const mockTenantGet = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockTenant, error: null })),
          })),
        })),
      }

      // Mock: updateTenant
      const createMockTenantUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updatedTenant, error: null })),
          })),
        }
        return chain
      }

      const mockTenantUpdate = {
        update: vi.fn(() => createMockTenantUpdateChain()),
      }

      // Mock: getManagedProperty (for updateManagedProperty)
      const mockPropertyGet = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockProperty, error: null })),
          })),
        })),
      }

      // Mock: updateManagedProperty
      const createMockPropertyUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updatedProperty, error: null })),
          })),
        }
        return chain
      }

      const mockPropertyUpdate = {
        update: vi.fn(() => createMockPropertyUpdateChain()),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockPropertyInsert as any) // createManagedProperty
        .mockReturnValueOnce(mockPropertyCheck as any) // createTenant (check property)
        .mockReturnValueOnce(mockTenantInsert as any) // createTenant (insert)
        .mockReturnValueOnce(mockPropertyUpdateStatus as any) // createTenant (update property status)
        .mockReturnValueOnce(mockTenantGet as any) // updateTenant (check)
        .mockReturnValueOnce(mockTenantUpdate as any) // updateTenant (update)
        .mockReturnValueOnce(mockPropertyGet as any) // updateManagedProperty (check)
        .mockReturnValueOnce(mockPropertyUpdate as any) // updateManagedProperty (update)

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      // Workflow
      const property = await createManagedProperty(propertyData as any)
      const tenant = await createTenant(tenantData as any)

      // Mettre à jour le loyer du locataire
      const updatedTenantResult = await updateTenant(tenant.id, { monthly_rent: 220000 })
      expect(updatedTenantResult.monthly_rent).toBe(220000)

      // Mettre à jour le loyer du bien
      const updatedPropertyResult = await updateManagedProperty(property.id, { monthly_rent: 220000 })
      expect(updatedPropertyResult.monthly_rent).toBe(220000)
    })
  })
})

