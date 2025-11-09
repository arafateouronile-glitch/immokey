import { supabase } from '@/lib/supabase'
import { getStripe, isStripeConfigured } from '@/lib/stripe'

export type PaymentMethod = 'card' | 'moov' | 'flooz'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface PaymentRequest {
  subscriptionId?: string
  userId: string
  planType: 'starter' | 'professionnel' | 'entreprise'
  amount: number
  paymentMethod: PaymentMethod
  phoneNumber?: string // Pour Moov/Flooz
  cardDetails?: {
    number: string
    expiry: string
    cvv: string
    name: string
  }
}

export interface PaymentResponse {
  success: boolean
  paymentId?: string
  transactionId?: string
  message?: string
  error?: string
}

/**
 * Service de paiement pour ImmoKey Hôtellerie
 * Gère les paiements via Carte, Moov Money et Flooz
 */
export class PaymentService {
  /**
   * Traiter un paiement
   */
  static async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      switch (request.paymentMethod) {
        case 'card':
          return await this.processCardPayment(request)
        case 'moov':
          return await this.processMoovPayment(request)
        case 'flooz':
          return await this.processFloozPayment(request)
        default:
          throw new Error('Méthode de paiement non supportée')
      }
    } catch (error: any) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error.message || 'Erreur lors du traitement du paiement',
      }
    }
  }

  /**
   * Paiement par carte bancaire via Stripe
   */
  private static async processCardPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe n\'est pas configuré. Veuillez configurer VITE_STRIPE_PUBLIC_KEY')
    }

    if (!request.cardDetails) {
      throw new Error('Détails de carte requis')
    }

    try {
      // Étape 1 : Créer un Payment Intent via l'Edge Function
      const { data: paymentIntentData, error: intentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            amount: request.amount,
            currency: 'xof', // XOF (Franc CFA)
            userId: request.userId,
            planType: request.planType,
            metadata: {
              planType: request.planType,
            },
          },
        }
      )

      if (intentError) {
        throw new Error(`Erreur lors de la création du Payment Intent: ${intentError.message}`)
      }

      const { clientSecret, paymentIntentId } = paymentIntentData

      if (!clientSecret) {
        throw new Error('Client secret non reçu de Stripe')
      }

      // Étape 2 : Confirmer le paiement avec Stripe
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Impossible d\'initialiser Stripe')
      }

      // TODO: Migrer vers Stripe Elements pour une meilleure sécurité PCI
      // Pour l'instant, cette approche est utilisée pour le développement
      // En production, utilisez Stripe Elements qui gère automatiquement la tokenisation
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: request.cardDetails.number.replace(/\s/g, ''),
          exp_month: parseInt(request.cardDetails.expiry.split('/')[0]),
          exp_year: parseInt('20' + request.cardDetails.expiry.split('/')[1]),
          cvc: request.cardDetails.cvv,
        } as any, // Type override nécessaire - à remplacer par Stripe Elements
        billing_details: {
          name: request.cardDetails.name,
        },
      } as any)

      if (paymentMethodError || !paymentMethod) {
        throw new Error(
          paymentMethodError?.message || 'Erreur lors de la création du PaymentMethod'
        )
      }

      // Confirmer le paiement
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      )

      if (confirmError) {
        throw new Error(confirmError.message || 'Erreur lors de la confirmation du paiement')
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error(`Paiement échoué. Statut: ${paymentIntent?.status}`)
      }

      // Étape 3 : Créer l'abonnement et enregistrer le paiement dans notre base de données
      const subscriptionId = await this.createSubscriptionAndPayment(
        request.userId,
        request.planType,
        request.amount,
        'card',
        paymentIntentId,
        {
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethod.id,
        }
      )

      return {
        success: true,
        paymentId: subscriptionId,
        transactionId: paymentIntentId,
        message: 'Paiement par carte traité avec succès',
      }
    } catch (error: any) {
      console.error('Erreur lors du paiement par carte:', error)
      throw error
    }
  }

  /**
   * Paiement via Moov Money
   * TODO: Intégrer avec l'API Moov Money
   */
  private static async processMoovPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.phoneNumber) {
      throw new Error('Numéro de téléphone requis pour Moov Money')
    }

    // Valider le format du numéro (Togo: +228)
    const phoneRegex = /^\+228[0-9]{8}$/
    if (!phoneRegex.test(request.phoneNumber)) {
      throw new Error('Format de numéro invalide. Utilisez le format +228XXXXXXXX')
    }

    // TODO: Appeler l'API Moov Money
    // const moovResponse = await moovMoneyAPI.initiatePayment({
    //   phone: request.phoneNumber,
    //   amount: request.amount,
    //   description: `Abonnement ImmoKey ${request.planType}`
    // })

    // Pour l'instant, on simule
    const transactionId = `moov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Créer l'abonnement et le paiement
    const subscriptionId = await this.createSubscriptionAndPayment(
      request.userId,
      request.planType,
      request.amount,
      'moov',
      transactionId,
      { phone_number: request.phoneNumber }
    )

    return {
      success: true,
      paymentId: subscriptionId,
      transactionId,
      message: 'Paiement Moov Money initié. Veuillez confirmer sur votre téléphone.',
    }
  }

  /**
   * Paiement via Flooz
   * TODO: Intégrer avec l'API Flooz
   */
  private static async processFloozPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.phoneNumber) {
      throw new Error('Numéro de téléphone requis pour Flooz')
    }

    // Valider le format du numéro
    const phoneRegex = /^\+228[0-9]{8}$/
    if (!phoneRegex.test(request.phoneNumber)) {
      throw new Error('Format de numéro invalide. Utilisez le format +228XXXXXXXX')
    }

    // TODO: Appeler l'API Flooz
    // const floozResponse = await floozAPI.initiatePayment({
    //   phone: request.phoneNumber,
    //   amount: request.amount,
    //   description: `Abonnement ImmoKey ${request.planType}`
    // })

    // Pour l'instant, on simule
    const transactionId = `flooz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Créer l'abonnement et le paiement
    const subscriptionId = await this.createSubscriptionAndPayment(
      request.userId,
      request.planType,
      request.amount,
      'flooz',
      transactionId,
      { phone_number: request.phoneNumber }
    )

    return {
      success: true,
      paymentId: subscriptionId,
      transactionId,
      message: 'Paiement Flooz initié. Veuillez confirmer sur votre téléphone.',
    }
  }

  /**
   * Créer un abonnement et enregistrer le paiement
   */
  private static async createSubscriptionAndPayment(
    userId: string,
    planType: string,
    amount: number,
    paymentMethod: PaymentMethod,
    transactionId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    // Utiliser la fonction SQL pour créer l'abonnement
    const { data, error } = await supabase.rpc('create_subscription', {
      p_user_id: userId,
      p_plan_type: planType,
      p_amount: amount,
      p_payment_method: paymentMethod,
      p_payment_reference: transactionId,
    })

    if (error) throw error

    // Mettre à jour le paiement avec les métadonnées si nécessaire
    if (metadata) {
      const { error: updateError } = await supabase
        .from('hospitality_payments')
        .update({ metadata })
        .eq('subscription_id', data)
        .order('created_at', { ascending: false })
        .limit(1)

      if (updateError) {
        console.error('Error updating payment metadata:', updateError)
      }
    }

    return data
  }

  /**
   * Vérifier le statut d'un paiement
   */
  static async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const { data, error } = await supabase
      .from('hospitality_payments')
      .select('status')
      .eq('id', paymentId)
      .single()

    if (error) throw error

    return data.status as PaymentStatus
  }

  /**
   * Obtenir l'historique des paiements d'un utilisateur
   */
  static async getPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from('hospitality_payments')
      .select('*, hospitality_subscriptions(plan_type, status)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  }
}

