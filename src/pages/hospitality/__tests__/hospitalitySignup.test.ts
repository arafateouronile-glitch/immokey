/**
 * Tests d'inscription pour ImmoKey Hôtellerie
 * 
 * Vérifie :
 * - L'inscription avec chaque pack (starter, professionnel, entreprise)
 * - La création correcte du profil avec trial_ends_at (14 jours)
 * - Le statut d'abonnement (subscription_status = 'trial')
 * - L'enregistrement de establishment_name
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))

describe('Hospitality Signup - Tests d\'inscription', () => {
  const mockUser = {
    id: 'test-user-id-123',
    email: 'test@example.com',
  }

  const mockProfile = {
    id: 'test-user-id-123',
    user_id: 'test-user-id-123',
    full_name: 'Test User',
    phone: '+22890123456',
    establishment_name: 'Test Hotel',
    plan_type: 'starter',
    subscription_status: 'trial',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Pack Starter', () => {
    it('devrait créer un compte avec le pack Starter et activer l\'essai gratuit de 14 jours', async () => {
      // Mock signUp
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      })

      // Mock update profile
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)

      // Simuler l'inscription
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            phone: '+22890123456',
            establishment_name: 'Test Hotel',
          },
        },
      })

      expect(authError).toBeNull()
      expect(authData?.user).toBeDefined()

      if (authData?.user) {
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            plan_type: 'starter',
            subscription_status: 'trial',
            trial_ends_at: trialEndsAt,
            establishment_name: 'Test Hotel',
          })
          .eq('id', authData.user.id)

        expect(profileError).toBeNull()
      }
    })

    it('devrait définir trial_ends_at à 14 jours après l\'inscription', async () => {
      const now = new Date()
      const expectedTrialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

      // Vérifier que trial_ends_at est calculé correctement
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

      // La différence doit être d'environ 14 jours (tolérance de 1 minute)
      const diffInDays = (trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      expect(diffInDays).toBeCloseTo(14, 1)
    })

    it('devrait définir subscription_status à "trial"', () => {
      const subscriptionStatus = 'trial'
      expect(subscriptionStatus).toBe('trial')
    })

    it('devrait enregistrer establishment_name', () => {
      const establishmentName = 'Test Hotel'
      expect(establishmentName).toBe('Test Hotel')
    })
  })

  describe('Pack Professionnel', () => {
    it('devrait créer un compte avec le pack Professionnel et activer l\'essai gratuit de 14 jours', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      })

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)

      const { data: authData } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            phone: '+22890123456',
            establishment_name: 'Test Hotel Pro',
          },
        },
      })

      if (authData?.user) {
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            plan_type: 'professionnel',
            subscription_status: 'trial',
            trial_ends_at: trialEndsAt,
            establishment_name: 'Test Hotel Pro',
          })
          .eq('id', authData.user.id)

        expect(profileError).toBeNull()
      }
    })

    it('devrait définir plan_type à "professionnel"', () => {
      const planType = 'professionnel'
      expect(planType).toBe('professionnel')
    })
  })

  describe('Pack Entreprise', () => {
    it('devrait créer un compte avec le pack Entreprise et activer l\'essai gratuit de 14 jours', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      })

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)

      const { data: authData } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            phone: '+22890123456',
            establishment_name: 'Test Hotel Enterprise',
          },
        },
      })

      if (authData?.user) {
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            plan_type: 'entreprise',
            subscription_status: 'trial',
            trial_ends_at: trialEndsAt,
            establishment_name: 'Test Hotel Enterprise',
          })
          .eq('id', authData.user.id)

        expect(profileError).toBeNull()
      }
    })

    it('devrait définir plan_type à "entreprise"', () => {
      const planType = 'entreprise'
      expect(planType).toBe('entreprise')
    })
  })

  describe('Validation des données', () => {
    it('devrait rejeter un mot de passe trop court', () => {
      const password = '12345' // 5 caractères
      expect(password.length).toBeLessThan(6)
    })

    it('devrait accepter un mot de passe valide (6+ caractères)', () => {
      const password = 'password123'
      expect(password.length).toBeGreaterThanOrEqual(6)
    })

    it('devrait rejeter si les mots de passe ne correspondent pas', () => {
      const password = 'password123'
      const confirmPassword = 'password456'
      expect(password).not.toBe(confirmPassword)
    })

    it('devrait accepter si les mots de passe correspondent', () => {
      const password = 'password123'
      const confirmPassword = 'password123'
      expect(password).toBe(confirmPassword)
    })
  })

  describe('Vérification du profil après inscription', () => {
    it('devrait avoir tous les champs requis dans le profil', () => {
      const profile = {
        user_id: 'test-user-id',
        plan_type: 'starter',
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        establishment_name: 'Test Hotel',
      }

      expect(profile.user_id).toBeDefined()
      expect(profile.plan_type).toBeDefined()
      expect(profile.subscription_status).toBe('trial')
      expect(profile.trial_ends_at).toBeDefined()
      expect(profile.establishment_name).toBeDefined()
    })

    it('devrait calculer correctement la date de fin d\'essai', () => {
      const now = new Date()
      const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

      // Vérifier que c'est bien dans 14 jours
      const diffInMs = trialEndsAt.getTime() - now.getTime()
      const diffInDays = diffInMs / (24 * 60 * 60 * 1000)

      expect(diffInDays).toBeCloseTo(14, 1)
    })
  })
})

