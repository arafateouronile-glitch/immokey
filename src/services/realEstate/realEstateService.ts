import { supabase } from '@/lib/supabase'

export type ServiceType = 'secure_payment' | 'tenant_management'
export type ServiceStatus = 'active' | 'cancelled' | 'expired'

export interface RealEstateService {
  id: string
  user_id: string
  listing_id: string | null
  service_type: ServiceType
  status: ServiceStatus
  activated_at: string
  expires_at: string | null
  payment_method: string | null
  payment_reference: string | null
  created_at: string
  updated_at: string
}

export interface ActivateServiceRequest {
  listingId?: string // NULL pour service global, UUID pour service par annonce
  serviceType: ServiceType
  paymentMethod: 'card' | 'moov' | 'flooz'
  paymentReference: string
}

/**
 * Service pour gérer les services payants de la plateforme immobilière
 */
export class RealEstateServices {
  /**
   * Activer un service payant (paiement sécurisé ou gestion locative)
   */
  static async activateService(request: ActivateServiceRequest): Promise<RealEstateService> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non authentifié')

    // Utiliser la fonction SQL pour activer le service
    const { data, error } = await supabase.rpc('activate_paid_service', {
      p_user_id: user.id,
      p_listing_id: request.listingId || null,
      p_service_type: request.serviceType,
      p_payment_method: request.paymentMethod,
      p_payment_reference: request.paymentReference,
    })

    if (error) throw error

    // Récupérer le service créé
    const { data: service, error: fetchError } = await supabase
      .from('real_estate_services')
      .select('*')
      .eq('id', data)
      .single()

    if (fetchError) throw fetchError

    return service
  }

  /**
   * Obtenir tous les services actifs d'un utilisateur
   */
  static async getUserServices(listingId?: string): Promise<RealEstateService[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non authentifié')

    let query = supabase
      .from('real_estate_services')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('activated_at', { ascending: false })

    if (listingId) {
      query = query.or(`listing_id.eq.${listingId},listing_id.is.null`)
    } else {
      query = query.is('listing_id', null) // Services globaux uniquement
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Vérifier si un service est actif pour un utilisateur
   */
  static async hasService(serviceType: ServiceType, listingId?: string): Promise<boolean> {
    const services = await this.getUserServices(listingId)
    return services.some(
      (s) => s.service_type === serviceType && s.status === 'active'
    )
  }

  /**
   * Annuler un service
   */
  static async cancelService(serviceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non authentifié')

    const { error } = await supabase
      .from('real_estate_services')
      .update({ status: 'cancelled' })
      .eq('id', serviceId)
      .eq('user_id', user.id)

    if (error) throw error

    // Mettre à jour le profil utilisateur si c'est un service global
    const { data: service } = await supabase
      .from('real_estate_services')
      .select('service_type')
      .eq('id', serviceId)
      .single()

    if (service && !service.listing_id) {
      const updateField =
        service.service_type === 'secure_payment'
          ? { has_secure_payment: false }
          : { has_tenant_management: false }

      await supabase
        .from('user_profiles')
        .update(updateField)
        .eq('id', user.id)
    }
  }

  /**
   * Obtenir les services disponibles pour un type d'utilisateur
   */
  static async getAvailableServices(): Promise<{
    secure_payment: { available: boolean; description: string }
    tenant_management: { available: boolean; description: string }
  }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non authentifié')

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isProfessional = profile?.user_type === 'professionnel'

    return {
      secure_payment: {
        available: true, // Disponible pour tous
        description: isProfessional
          ? 'Paiement sécurisé avec commission automatique'
          : 'Paiement sécurisé (service payant optionnel)',
      },
      tenant_management: {
        available: true, // Disponible pour tous
        description: isProfessional
          ? 'Gestion locative avec commission automatique'
          : 'Gestion locative avec commission de 5% sur chaque loyer',
      },
    }
  }
}

