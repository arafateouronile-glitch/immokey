import * as Sentry from '@sentry/react'

/**
 * Configuration Sentry pour le monitoring des erreurs
 * Activé uniquement en production si VITE_SENTRY_DSN est défini
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.MODE || 'development'

  // Ne pas initialiser Sentry en développement ou si DSN n'est pas configuré
  if (!dsn || environment === 'development') {
    console.log('[Sentry] Non configuré (mode développement ou DSN manquant)')
    return
  }

  Sentry.init({
    dsn,
    environment,
    // Performance monitoring - traces sample rate
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% en prod, 100% en staging
    // Session replay (optionnel)
    replaysSessionSampleRate: 0.1, // 10% des sessions
    replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreurs
    // Fonction pour filtrer les erreurs avant envoi
    beforeSend(event, hint) {
      // Ne pas envoyer les erreurs non critiques
      if (event.exception) {
        const error = hint.originalException
        if (error instanceof Error) {
          // Filtrer les erreurs connues non critiques
          if (error.message.includes('ResizeObserver loop limit exceeded')) {
            return null // Erreur connue des navigateurs, non critique
          }
        }
      }
      return event
    },
    // Tags par défaut
    initialScope: {
      tags: {
        component: 'frontend',
      },
    },
  })

  console.log('[Sentry] Initialisé pour', environment)
}
