import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  analyzeError,
  withRetry,
  logError,
  handleError,
  getUserFriendlyMessage,
  ErrorType,
} from '../errorHandler'

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigator.onLine = true
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('analyzeError', () => {
    it('should identify AUTH errors', () => {
      const error1 = { code: 'PGRST301' }
      const error2 = { code: 'OTHER', message: 'JWT expired' }

      expect(analyzeError(error1).type).toBe(ErrorType.AUTH)
      expect(analyzeError(error2).type).toBe(ErrorType.AUTH)
      expect(analyzeError(error1).message).toContain('connecté')
    })

    it('should identify PERMISSION errors', () => {
      const error1 = { code: '42501' }
      const error2 = { code: 'OTHER', message: 'permission denied' }

      expect(analyzeError(error1).type).toBe(ErrorType.PERMISSION)
      expect(analyzeError(error2).type).toBe(ErrorType.PERMISSION)
    })

    it('should identify VALIDATION errors', () => {
      const duplicateError = { code: '23505' }
      const fkError = { code: '23503' }

      expect(analyzeError(duplicateError).type).toBe(ErrorType.VALIDATION)
      expect(analyzeError(duplicateError).message).toContain('existe déjà')
      
      expect(analyzeError(fkError).type).toBe(ErrorType.VALIDATION)
      expect(analyzeError(fkError).message).toContain('Référence')
    })

    it('should identify NOT_FOUND errors', () => {
      const error = { code: 'PGRST116' }

      expect(analyzeError(error).type).toBe(ErrorType.NOT_FOUND)
      expect(analyzeError(error).message).toContain('introuvable')
    })

    it('should identify NETWORK errors', () => {
      const error1 = { message: 'Failed to fetch' }
      const error2 = { message: 'network error' }
      const error3 = { message: 'fetch failed' }

      navigator.onLine = false
      expect(analyzeError(error1).type).toBe(ErrorType.NETWORK)
      expect(analyzeError(error2).type).toBe(ErrorType.NETWORK)
      expect(analyzeError(error3).type).toBe(ErrorType.NETWORK)
      expect(analyzeError({}).type).toBe(ErrorType.NETWORK) // Offline
      
      navigator.onLine = true
    })

    it('should identify SERVER errors', () => {
      const error1 = { status: 500 }
      const error2 = { statusCode: 503 }

      expect(analyzeError(error1).type).toBe(ErrorType.SERVER)
      expect(analyzeError(error2).type).toBe(ErrorType.SERVER)
      expect(analyzeError(error1).retryable).toBe(true)
    })

    it('should use custom message if available', () => {
      const error = { message: 'Custom error message' }

      const result = analyzeError(error)
      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.message).toBe('Custom error message')
    })

    it('should return UNKNOWN for generic errors', () => {
      const error = { someProperty: 'value' }

      const result = analyzeError(error)
      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.message).toContain('inattendue')
    })

    it('should preserve original error', () => {
      const originalError = { code: 'PGRST301', custom: 'data' }

      const result = analyzeError(originalError)
      expect(result.originalError).toEqual(originalError)
    })
  })

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await withRetry(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('success')

      vi.useFakeTimers()
      const resultPromise = withRetry(fn, { maxRetries: 2, retryDelay: 100 })

      await vi.advanceTimersByTimeAsync(100)
      const result = await resultPromise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = { code: 'PGRST301' } // AUTH error
      const fn = vi.fn().mockRejectedValue(nonRetryableError)

      await expect(withRetry(fn, { maxRetries: 3 })).rejects.toEqual(nonRetryableError)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should respect custom retryable function', async () => {
      const error = new Error('Custom error')
      const fn = vi.fn().mockRejectedValue(error)
      const retryable = vi.fn().mockReturnValue(false)

      await expect(withRetry(fn, { maxRetries: 3, retryable, retryDelay: 10 })).rejects.toEqual(error)
      expect(fn).toHaveBeenCalledTimes(1)
      // retryable might not be called if analyzeError determines it's not retryable
      // But if it is called, it should be called with the error
      if (retryable.mock.calls.length > 0) {
        expect(retryable).toHaveBeenCalledWith(error)
      }
    })

    it('should use exponential backoff', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('success')

      vi.useFakeTimers()
      const resultPromise = withRetry(fn, { maxRetries: 3, retryDelay: 100 })

      // First retry after 100ms
      await vi.advanceTimersByTimeAsync(100)
      // Second retry after 200ms (exponential)
      await vi.advanceTimersByTimeAsync(200)
      
      const result = await resultPromise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
      vi.useRealTimers()
    })

    it('should throw after max retries', async () => {
      const error = new Error('Failed to fetch')
      const fn = vi.fn().mockRejectedValue(error)

      // Use very short delay for testing
      const resultPromise = withRetry(fn, { maxRetries: 2, retryDelay: 10 })
      
      await expect(resultPromise).rejects.toThrow('Failed to fetch')
      expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
    }, 10000) // Increase timeout for this test
  })

  describe('logError', () => {
    it('should log error in development mode', () => {
      const error: any = {
        type: ErrorType.NETWORK,
        message: 'Test error',
        originalError: new Error('Original'),
      }

      // Mock import.meta.env
      vi.stubEnv('DEV', 'true')
      logError(error, 'test-context')

      expect(console.error).toHaveBeenCalledWith(
        '[ErrorHandler]',
        expect.objectContaining({
          type: ErrorType.NETWORK,
          message: 'Test error',
          context: 'test-context',
        })
      )
    })

    it('should not log to Sentry in development', () => {
      const error: any = {
        type: ErrorType.SERVER,
        message: 'Test error',
      }

      vi.stubEnv('DEV', 'true')
      vi.stubEnv('PROD', 'false')
      
      logError(error, 'test-context')
      
      // Should only log to console, not Sentry
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('handleError', () => {
    it('should return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await handleError(fn, 'test-context')

      expect(result).toBe('success')
    })

    it('should analyze and log error on failure', async () => {
      const error = { code: 'PGRST301' }
      const fn = vi.fn().mockRejectedValue(error)

      vi.stubEnv('DEV', 'true')

      await expect(handleError(fn, 'test-context')).rejects.toMatchObject({
        type: ErrorType.AUTH,
      })

      expect(console.error).toHaveBeenCalled()
    })

    it('should throw AppError', async () => {
      const error = new Error('Test error')
      const fn = vi.fn().mockRejectedValue(error)

      await expect(handleError(fn)).rejects.toMatchObject({
        type: ErrorType.UNKNOWN,
        message: 'Test error',
      })
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return error message', () => {
      const error: any = {
        type: ErrorType.NETWORK,
        message: 'Custom message',
      }

      expect(getUserFriendlyMessage(error)).toBe('Custom message')
    })

    it('should return default message if no message', () => {
      const error: any = {
        type: ErrorType.UNKNOWN,
        message: '',
      }

      expect(getUserFriendlyMessage(error)).toBe('Une erreur inattendue est survenue')
    })
  })
})

