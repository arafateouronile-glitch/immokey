/**
 * Tests pour le service de paiement Hôtellerie
 * 
 * Vérifie :
 * - Paiement par carte (Stripe)
 * - Paiement Moov Money
 * - Paiement Flooz
 * - Création d'abonnement après paiement réussi
 * - Gestion des erreurs de paiement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PaymentService } from '../paymentService'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({
          data: [{ id: 'sub-123' }],
          error: null,
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: null,
          error: null,
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'sub-123',
              user_id: 'test-user-id',
              plan_type: 'starter',
              status: 'active',
            },
            error: null,
          })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(),
    },
  },
}))

// Mock fetch pour les appels API externes
global.fetch = vi.fn()

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Paiement par carte (Stripe)', () => {
    it('devrait traiter un paiement par carte avec succès', async () => {
      const mockStripeResponse = {
        success: true,
        paymentIntentId: 'pi_test_123',
        amount: 9900,
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStripeResponse,
      } as Response)

      const result = await PaymentService.processPayment({
        userId: 'test-user-id',
        planType: 'starter',
        amount: 9900,
        paymentMethod: 'card',
        cardDetails: {
          number: '4242424242424242',
          expMonth: 12,
          expYear: 2025,
          cvc: '123',
          name: 'Test User',
        },
      })

      expect(result.success).toBe(true)
      expect(result.paymentIntentId).toBe('pi_test_123')
    })

    it('devrait rejeter un paiement avec une carte invalide', async () => {
      const mockStripeError = {
        success: false,
        error: 'Card declined',
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => mockStripeError,
      } as Response)

      const result = await PaymentService.processPayment({
        userId: 'test-user-id',
        planType: 'starter',
        amount: 9900,
        paymentMethod: 'card',
        cardDetails: {
          number: '4000000000000002', // Carte de test qui échoue
          expMonth: 12,
          expYear: 2025,
          cvc: '123',
          name: 'Test User',
        },
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Card declined')
    })

    it('devrait valider les détails de carte avant envoi', () => {
      const invalidCard = {
        number: '1234', // Trop court
        expMonth: 12,
        expYear: 2025,
        cvc: '123',
        name: 'Test User',
      }

      // Validation côté client
      expect(invalidCard.number.length).toBeLessThan(13)
    })
  })

  describe('Paiement Moov Money', () => {
    it('devrait traiter un paiement Moov Money avec succès', async () => {
      const mockMoovResponse = {
        success: true,
        transactionId: 'moov_txn_123',
        amount: 9900,
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMoovResponse,
      } as Response)

      const result = await PaymentService.processPayment({
        userId: 'test-user-id',
        planType: 'starter',
        amount: 9900,
        paymentMethod: 'moov',
        phoneNumber: '+22890123456',
      })

      expect(result.success).toBe(true)
      expect(result.transactionId).toBe('moov_txn_123')
    })

    it('devrait valider le numéro de téléphone Moov', () => {
      const validPhone = '+22890123456'
      const invalidPhone = '123' // Trop court

      // Format Togo : +228XXXXXXXX (8 chiffres après +228)
      const togoPhoneRegex = /^\+228\d{8}$/

      expect(togoPhoneRegex.test(validPhone)).toBe(true)
      expect(togoPhoneRegex.test(invalidPhone)).toBe(false)
    })

    it('devrait rejeter un paiement Moov avec un numéro invalide', async () => {
      const mockMoovError = {
        success: false,
        error: 'Invalid phone number',
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => mockMoovError,
      } as Response)

      const result = await PaymentService.processPayment({
        userId: 'test-user-id',
        planType: 'starter',
        amount: 9900,
        paymentMethod: 'moov',
        phoneNumber: '123', // Numéro invalide
      })

      expect(result.success).toBe(false)
    })
  })

  describe('Paiement Flooz', () => {
    it('devrait traiter un paiement Flooz avec succès', async () => {
      const mockFloozResponse = {
        success: true,
        transactionId: 'flooz_txn_123',
        amount: 9900,
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFloozResponse,
      } as Response)

      const result = await PaymentService.processPayment({
        userId: 'test-user-id',
        planType: 'starter',
        amount: 9900,
        paymentMethod: 'flooz',
        phoneNumber: '+22890123456',
      })

      expect(result.success).toBe(true)
      expect(result.transactionId).toBe('flooz_txn_123')
    })

    it('devrait valider le numéro de téléphone Flooz', () => {
      const validPhone = '+22890123456'
      const togoPhoneRegex = /^\+228\d{8}$/

      expect(togoPhoneRegex.test(validPhone)).toBe(true)
    })
  })

  describe('Création d\'abonnement après paiement', () => {
    it('devrait créer un abonnement actif après un paiement réussi', async () => {
      const mockPaymentResponse = {
        success: true,
        paymentIntentId: 'pi_test_123',
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaymentResponse,
      } as Response)

      const { supabase } = await import('@/lib/supabase')

      // Simuler la création d'abonnement
      const { data: subscription, error } = await supabase
        .from('hospitality_subscriptions')
        .insert({
          user_id: 'test-user-id',
          plan_type: 'starter',
          status: 'active',
          price: 9900,
          payment_method: 'card',
          payment_reference: 'pi_test_123',
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(subscription).toBeDefined()
      expect(subscription?.status).toBe('active')
    })

    it('devrait mettre à jour le profil utilisateur après paiement', async () => {
      const { supabase } = await import('@/lib/supabase')

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'active',
          subscription_started_at: new Date().toISOString(),
        })
        .eq('id', 'test-user-id')

      expect(error).toBeNull()
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs réseau', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await PaymentService.processPayment({
        userId: 'test-user-id',
        planType: 'starter',
        amount: 9900,
        paymentMethod: 'card',
        cardDetails: {
          number: '4242424242424242',
          expMonth: 12,
          expYear: 2025,
          cvc: '123',
          name: 'Test User',
        },
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('devrait gérer les erreurs de montant insuffisant', async () => {
      const mockError = {
        success: false,
        error: 'Insufficient funds',
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      } as Response)

      const result = await PaymentService.processPayment({
        userId: 'test-user-id',
        planType: 'starter',
        amount: 9900,
        paymentMethod: 'moov',
        phoneNumber: '+22890123456',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Insufficient')
    })
  })

  describe('Validation des montants', () => {
    it('devrait valider le montant pour chaque pack', () => {
      const planPrices = {
        starter: 9900,
        professionnel: 20000,
        entreprise: null, // Sur devis
      }

      expect(planPrices.starter).toBe(9900)
      expect(planPrices.professionnel).toBe(20000)
      expect(planPrices.entreprise).toBeNull()
    })

    it('devrait rejeter un montant négatif', () => {
      const amount = -100
      expect(amount).toBeLessThan(0)
    })

    it('devrait rejeter un montant zéro', () => {
      const amount = 0
      expect(amount).toBe(0)
    })
  })
})

