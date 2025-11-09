import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDueDatesByTenant,
  getDueDatesByProperty,
  getAllDueDates,
  getDueDate,
  createDueDate,
  updateDueDateStatus,
  getPaymentsByTenant,
  getPaymentsByDueDate,
  getAllPayments,
  createPayment,
  getPayment,
  getPaymentStats,
} from '../paymentService'

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

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.from.mockClear()
  })

  describe('getDueDatesByTenant', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getDueDatesByTenant('tenant-id')
      expect(result).toEqual([])
    })

    it('should return due dates for tenant', async () => {
      const mockDueDates = [
        { id: 'due-1', tenant_id: 'tenant-1', period_month: 12, period_year: 2024 },
        { id: 'due-2', tenant_id: 'tenant-1', period_month: 11, period_year: 2024 },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
        }
        // Last order returns the promise
        chain.order.mockReturnValueOnce(chain).mockResolvedValueOnce({ data: mockDueDates, error: null })
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getDueDatesByTenant('tenant-1')

      expect(result).toEqual(mockDueDates)
    })
  })

  describe('getDueDatesByProperty', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getDueDatesByProperty('property-id')
      expect(result).toEqual([])
    })

    it('should return due dates for property', async () => {
      const mockDueDates = [
        { id: 'due-1', managed_property_id: 'prop-1' },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
        }
        // First order returns chain, second returns promise
        chain.order.mockReturnValueOnce(chain).mockResolvedValueOnce({ data: mockDueDates, error: null })
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getDueDatesByProperty('prop-1')

      expect(result).toEqual(mockDueDates)
    })
  })

  describe('getDueDate', () => {
    it('should throw error when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      await expect(getDueDate('due-id')).rejects.toThrow('Supabase non configuré')
    })

    it('should return due date by id', async () => {
      const mockDueDate = {
        id: 'due-1',
        tenant_id: 'tenant-1',
        total_amount: 50000,
        status: 'pending',
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockDueDate, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getDueDate('due-1')

      expect(result).toEqual(mockDueDate)
    })
  })

  describe('createDueDate', () => {
    it('should create due date with calculated total', async () => {
      const dueDateData = {
        tenant_id: 'tenant-1',
        managed_property_id: 'prop-1',
        period_month: 12,
        period_year: 2024,
        rent_amount: 40000,
        charges_amount: 10000,
        due_date: '2024-12-05',
      }

      const mockDueDate = {
        id: 'due-new',
        ...dueDateData,
        total_amount: 50000,
        status: 'pending',
      }

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockDueDate, error: null })),
          })),
        })),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createDueDate(dueDateData as any)

      expect(result).toEqual(mockDueDate)
      expect(result.total_amount).toBe(50000)
    })
  })

  describe('updateDueDateStatus', () => {
    it('should update due date status', async () => {
      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'due-1', status: 'paid' },
              error: null 
            })),
          })),
        }
        return chain
      }

      const mockQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await updateDueDateStatus('due-1', 'paid')

      expect(result.status).toBe('paid')
    })
  })

  describe('getPaymentsByTenant', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getPaymentsByTenant('tenant-id')
      expect(result).toEqual([])
    })

    it('should return payments for tenant', async () => {
      const mockPayments = [
        { id: 'payment-1', tenant_id: 'tenant-1', amount: 50000 },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockPayments, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getPaymentsByTenant('tenant-1')

      expect(result).toEqual(mockPayments)
    })
  })

  describe('getPaymentsByDueDate', () => {
    it('should return empty array when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getPaymentsByDueDate('due-id')
      expect(result).toEqual([])
    })

    it('should return payments for due date', async () => {
      const mockPayments = [
        { id: 'payment-1', due_date_id: 'due-1', amount: 50000 },
      ]

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockPayments, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getPaymentsByDueDate('due-1')

      expect(result).toEqual(mockPayments)
    })
  })

  describe('createPayment', () => {
    it('should create payment and update due date status if fully paid', async () => {
      const paymentData = {
        tenant_id: 'tenant-1',
        due_date_id: 'due-1',
        amount: 50000,
        payment_method: 'cash',
      }

      const mockDueDate = {
        id: 'due-1',
        total_amount: 50000,
        status: 'pending',
        due_date: '2024-12-05',
      }

      const mockPayment = {
        id: 'payment-new',
        ...paymentData,
        recorded_by: 'test-user',
      }

      const mockPayments = [mockPayment]

      // Mock getDueDate
      const createMockDueDateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockDueDate, error: null })),
        }
        return chain
      }

      const mockDueDateQuery = {
        select: vi.fn(() => createMockDueDateChain()),
      }

      // Mock insert payment
      const mockPaymentInsert = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockPayment, error: null })),
          })),
        })),
      }

      // Mock getPaymentsByDueDate
      const createMockPaymentsChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: mockPayments, error: null })),
        }
        return chain
      }

      const mockPaymentsQuery = {
        select: vi.fn(() => createMockPaymentsChain()),
      }

      // Mock updateDueDateStatus
      const createMockUpdateChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { ...mockDueDate, status: 'paid' }, error: null })),
          })),
        }
        return chain
      }

      const mockUpdateQuery = {
        update: vi.fn(() => createMockUpdateChain()),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockPaymentInsert as any) // Insert payment
        .mockReturnValueOnce(mockDueDateQuery as any) // Get due date
        .mockReturnValueOnce(mockPaymentsQuery as any) // Get payments
        .mockReturnValueOnce(mockUpdateQuery as any) // Update status

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await createPayment(paymentData as any)

      expect(result).toEqual(mockPayment)
    })
  })

  describe('getPayment', () => {
    it('should return payment by id', async () => {
      const mockPayment = {
        id: 'payment-1',
        amount: 50000,
        payment_method: 'cash',
      }

      const createMockChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: mockPayment, error: null })),
        }
        return chain
      }

      const mockQuery = {
        select: vi.fn(() => createMockChain()),
      }

      supabaseModule.supabase.from.mockReturnValue(mockQuery as any)
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getPayment('payment-1')

      expect(result).toEqual(mockPayment)
    })
  })

  describe('getPaymentStats', () => {
    it('should return empty stats when Supabase is not configured', async () => {
      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false)
      
      const result = await getPaymentStats()
      
      expect(result).toEqual({
        total_due: 0,
        total_paid: 0,
        pending_count: 0,
        overdue_count: 0,
        paid_count: 0,
      })
    })

    it('should calculate stats correctly', async () => {
      const mockDueDates = [
        { id: 'due-1', status: 'paid', total_amount: 50000 },
        { id: 'due-2', status: 'pending', total_amount: 40000 },
        { id: 'due-3', status: 'overdue', total_amount: 30000 },
      ]

      const createMockDueDatesChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
        }
        return chain
      }

      const mockDueDatesQuery = {
        select: vi.fn(() => Promise.resolve({ data: mockDueDates, error: null })),
      }

      // Mock getPaymentsByDueDate for overdue
      const createMockPaymentsChain = () => {
        const chain: any = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: [{ amount: 10000 }], error: null })),
        }
        return chain
      }

      const mockPaymentsQuery = {
        select: vi.fn(() => createMockPaymentsChain()),
      }

      supabaseModule.supabase.from
        .mockReturnValueOnce(mockDueDatesQuery as any) // Get due dates
        .mockReturnValueOnce(mockPaymentsQuery as any) // Get payments for overdue

      vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true)

      const result = await getPaymentStats()

      expect(result.total_due).toBe(120000)
      expect(result.paid_count).toBe(1)
      expect(result.pending_count).toBe(1)
      expect(result.overdue_count).toBe(1)
    })
  })
})

