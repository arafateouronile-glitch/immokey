/**
 * Configuration Stripe pour ImmoKey
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

// Clé publique Stripe (sécurisée pour le frontend)
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''

// Instance Stripe (lazy loading)
let stripePromise: Promise<Stripe | null> | null = null

/**
 * Récupère l'instance Stripe
 * Utilise le pattern singleton pour éviter de créer plusieurs instances
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePublicKey) {
    console.warn('Stripe public key not configured. Payments will not work.')
    return Promise.resolve(null)
  }

  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey)
  }

  return stripePromise
}

/**
 * Vérifie si Stripe est configuré
 */
export function isStripeConfigured(): boolean {
  return !!stripePublicKey
}

