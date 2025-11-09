import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import * as supabaseModule from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

describe('useAuth', () => {
  const mockUnsubscribe = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock
    vi.spyOn(supabaseModule.supabase.auth, 'onAuthStateChange').mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return loading true initially', () => {
    vi.spyOn(supabaseModule.supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  it('should return user when session exists', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    vi.spyOn(supabaseModule.supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('should return null user when no session', async () => {
    vi.spyOn(supabaseModule.supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBe(null)
  })

  it('should subscribe to auth state changes', () => {
    vi.spyOn(supabaseModule.supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    renderHook(() => useAuth())

    expect(supabaseModule.supabase.auth.onAuthStateChange).toHaveBeenCalled()
  })

  it('should unsubscribe on unmount', () => {
    vi.spyOn(supabaseModule.supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should update user on auth state change', async () => {
    const mockUser1 = { id: 'user-1', email: 'user1@example.com' }
    const mockUser2 = { id: 'user-2', email: 'user2@example.com' }

    let authStateChangeCallback: ((event: string, session: any) => void) | null = null

    vi.spyOn(supabaseModule.supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: mockUser1 } },
      error: null,
    } as any)

    vi.spyOn(supabaseModule.supabase.auth, 'onAuthStateChange').mockImplementation((callback) => {
      authStateChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      } as any
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser1)
    })

    // Simulate auth state change
    if (authStateChangeCallback) {
      authStateChangeCallback('SIGNED_IN', { user: mockUser2 })
    }

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser2)
    })
  })
})






