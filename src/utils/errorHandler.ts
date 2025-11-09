/**
 * Système centralisé de gestion d'erreurs
 * Gère les erreurs de manière uniforme avec retry automatique et logging
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: any
  retryable?: boolean
  statusCode?: number
}

/**
 * Analyse une erreur et retourne un AppError typé
 */
export function analyzeError(error: any): AppError {
  // Erreur Supabase
  if (error?.code) {
    // Erreurs d'authentification
    if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
      return {
        type: ErrorType.AUTH,
        message: 'Vous devez être connecté pour effectuer cette action',
        originalError: error,
        retryable: false,
      }
    }

    // Erreurs de permission
    if (error.code === '42501' || error.message?.includes('permission')) {
      return {
        type: ErrorType.PERMISSION,
        message: "Vous n'avez pas la permission d'effectuer cette action",
        originalError: error,
        retryable: false,
      }
    }

    // Erreurs de validation (contraintes DB)
    if (error.code === '23505') {
      // Duplicate key
      return {
        type: ErrorType.VALIDATION,
        message: 'Cette ressource existe déjà',
        originalError: error,
        retryable: false,
      }
    }

    if (error.code === '23503') {
      // Foreign key violation
      return {
        type: ErrorType.VALIDATION,
        message: 'Référence invalide',
        originalError: error,
        retryable: false,
      }
    }

    // Not found
    if (error.code === 'PGRST116') {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'Ressource introuvable',
        originalError: error,
        retryable: false,
      }
    }
  }

  // Erreur réseau
  if (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('Failed to fetch') ||
    !navigator.onLine
  ) {
    return {
      type: ErrorType.NETWORK,
      message: 'Erreur de connexion. Vérifiez votre connexion internet.',
      originalError: error,
      retryable: true,
    }
  }

  // Erreur serveur (5xx)
  if (error?.status >= 500 || error?.statusCode >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'Erreur serveur. Veuillez réessayer plus tard.',
      originalError: error,
      retryable: true,
      statusCode: error.status || error.statusCode,
    }
  }

  // Message d'erreur personnalisé
  if (error?.message && typeof error.message === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error,
      retryable: false,
    }
  }

  // Erreur générique
  return {
    type: ErrorType.UNKNOWN,
    message: 'Une erreur inattendue est survenue',
    originalError: error,
    retryable: false,
  }
}

/**
 * Retry automatique avec backoff exponentiel
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    retryable?: (error: any) => boolean
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, retryable } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Ne pas retry si c'est la dernière tentative
      if (attempt === maxRetries) {
        break
      }

      // Vérifier si l'erreur est retryable
      const appError = analyzeError(error)
      if (!appError.retryable) {
        break
      }

      if (retryable && !retryable(error)) {
        break
      }

      // Attendre avant de retry (backoff exponentiel)
      const delay = retryDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))

      console.log(`[ErrorHandler] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
    }
  }

  throw lastError
}

/**
 * Logger une erreur de manière structurée
 */
export function logError(error: AppError, context?: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: error.type,
    message: error.message,
    context,
    originalError: error.originalError,
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  // En développement, afficher dans la console
  if (import.meta.env.DEV) {
    console.error('[ErrorHandler]', logData)
  }

  // En production, envoyer à Sentry si configuré
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    try {
      // Import dynamique pour éviter les erreurs si Sentry n'est pas installé
      import('@sentry/react').then((Sentry) => {
        Sentry.captureException(error.originalError || new Error(error.message), {
          tags: {
            errorType: error.type,
            context: context || 'unknown',
          },
          extra: {
            errorMessage: error.message,
            statusCode: error.statusCode,
            retryable: error.retryable,
          },
          level: error.type === ErrorType.SERVER || error.type === ErrorType.NETWORK 
            ? 'error' 
            : 'warning',
        })
      }).catch(() => {
        // Sentry non disponible, ignorer silencieusement
      })
    } catch {
      // Erreur lors de l'import Sentry, ignorer
    }
  }
}

/**
 * Wrapper pour gérer les erreurs de manière uniforme
 */
export async function handleError<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const appError = analyzeError(error)
    logError(appError, context)
    throw appError
  }
}

/**
 * Créer un message d'erreur user-friendly
 */
export function getUserFriendlyMessage(error: AppError): string {
  return error.message || 'Une erreur inattendue est survenue'
}
