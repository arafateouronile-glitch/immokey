import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  PaymentDueDate,
  Payment,
  CreatePaymentDueDateData,
  CreatePaymentData,
} from '@/types/rental'

/**
 * Récupérer les échéances d'un locataire
 */
export async function getDueDatesByTenant(tenantId: string): Promise<PaymentDueDate[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('payment_due_dates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching due dates:', error)
    throw error
  }
}

/**
 * Récupérer les échéances d'un bien
 */
export async function getDueDatesByProperty(propertyId: string): Promise<PaymentDueDate[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('payment_due_dates')
      .select('*')
      .eq('managed_property_id', propertyId)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching due dates:', error)
    throw error
  }
}

/**
 * Récupérer toutes les échéances de l'utilisateur
 */
export async function getAllDueDates(): Promise<PaymentDueDate[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('payment_due_dates')
      .select(`
        *,
        tenants!inner(
          managed_property_id,
          managed_properties!inner(user_id)
        )
      `)
      .eq('tenants.managed_properties.user_id', user.id)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching due dates:', error)
    throw error
  }
}

/**
 * Récupérer une échéance par ID
 */
export async function getDueDate(id: string): Promise<PaymentDueDate> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('payment_due_dates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Échéance non trouvée')
    
    return data
  } catch (error: any) {
    console.error('Error fetching due date:', error)
    throw error
  }
}

/**
 * Créer une échéance
 */
export async function createDueDate(data: CreatePaymentDueDateData): Promise<PaymentDueDate> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const totalAmount = data.rent_amount + (data.charges_amount || 0)

    const { data: dueDate, error } = await supabase
      .from('payment_due_dates')
      .insert({
        ...data,
        charges_amount: data.charges_amount || 0,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return dueDate
  } catch (error: any) {
    console.error('Error creating due date:', error)
    throw error
  }
}

/**
 * Mettre à jour le statut d'une échéance
 */
export async function updateDueDateStatus(
  id: string,
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
): Promise<PaymentDueDate> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const { data, error } = await supabase
      .from('payment_due_dates')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating due date status:', error)
    throw error
  }
}

/**
 * Récupérer les paiements d'un locataire
 */
export async function getPaymentsByTenant(tenantId: string): Promise<Payment[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    throw error
  }
}

/**
 * Récupérer les paiements d'une échéance
 */
export async function getPaymentsByDueDate(dueDateId: string): Promise<Payment[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('due_date_id', dueDateId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    throw error
  }
}

/**
 * Récupérer tous les paiements de l'utilisateur
 */
export async function getAllPayments(): Promise<Payment[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenants!inner(
          managed_property_id,
          managed_properties!inner(user_id)
        )
      `)
      .eq('tenants.managed_properties.user_id', user.id)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    throw error
  }
}

/**
 * Créer un paiement
 */
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // Créer le paiement
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        ...data,
        recorded_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Si une échéance est liée, mettre à jour son statut
    if (data.due_date_id) {
      // Récupérer l'échéance pour vérifier le montant total
      const dueDate = await getDueDate(data.due_date_id)
      
      // Récupérer tous les paiements pour cette échéance
      const allPayments = await getPaymentsByDueDate(data.due_date_id)
      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0)

      // Mettre à jour le statut de l'échéance
      if (totalPaid >= Number(dueDate.total_amount)) {
        await updateDueDateStatus(data.due_date_id, 'paid')
      } else {
        // Vérifier si l'échéance est en retard
        const dueDateObj = new Date(dueDate.due_date)
        const today = new Date()
        if (today > dueDateObj) {
          await updateDueDateStatus(data.due_date_id, 'overdue')
        }
      }
    }

    // TODO: Générer une quittance si send_receipt est true
    // if (data.send_receipt) {
    //   await generateReceipt(payment.id)
    // }

    return payment
  } catch (error: any) {
    console.error('Error creating payment:', error)
    throw error
  }
}

/**
 * Récupérer un paiement par ID
 */
export async function getPayment(id: string): Promise<Payment> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Paiement non trouvé')
    
    return data
  } catch (error: any) {
    console.error('Error fetching payment:', error)
    throw error
  }
}

/**
 * Générer automatiquement les échéances pour un locataire
 */
export async function generateDueDatesForTenant(
  tenantId: string,
  startMonth: number,
  startYear: number,
  endMonth?: number,
  endYear?: number
): Promise<PaymentDueDate[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    // Récupérer les informations du locataire
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*, managed_properties(monthly_rent, charges)')
      .eq('id', tenantId)
      .single()

    if (tenantError) throw tenantError

    const property = (tenant as any).managed_properties
    const monthlyRent = Number(tenant.monthly_rent)
    const charges = Number(property.charges || 0)
    const dueDay = tenant.due_day

    const dueDates: PaymentDueDate[] = []
    let currentMonth = startMonth
    let currentYear = startYear

    // Générer jusqu'à la fin ou jusqu'à 12 mois
    const endMonthFinal = endMonth || (startMonth + 11) % 12 || 12
    const endYearFinal = endYear || (endMonth ? startYear : startYear + 1)

    while (
      currentYear < endYearFinal ||
      (currentYear === endYearFinal && currentMonth <= endMonthFinal)
    ) {
      // Calculer la date d'échéance (jour du mois spécifié)
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
      const actualDueDay = Math.min(dueDay, daysInMonth)
      const dueDate = new Date(currentYear, currentMonth - 1, actualDueDay)

      // Vérifier si l'échéance existe déjà
      const { data: existing } = await supabase
        .from('payment_due_dates')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('period_month', currentMonth)
        .eq('period_year', currentYear)
        .single()

      if (!existing) {
        const newDueDate = await createDueDate({
          tenant_id: tenantId,
          managed_property_id: tenant.managed_property_id,
          period_month: currentMonth,
          period_year: currentYear,
          rent_amount: monthlyRent,
          charges_amount: charges,
          due_date: dueDate.toISOString().split('T')[0],
        })

        dueDates.push(newDueDate)
      }

      // Passer au mois suivant
      currentMonth++
      if (currentMonth > 12) {
        currentMonth = 1
        currentYear++
      }

      // Limite de sécurité : max 24 mois
      if (dueDates.length >= 24) break
    }

    return dueDates
  } catch (error: any) {
    console.error('Error generating due dates:', error)
    throw error
  }
}

/**
 * Calculer les statistiques de paiement
 */
export async function getPaymentStats(tenantId?: string, propertyId?: string) {
  if (!isSupabaseConfigured) {
    return {
      total_due: 0,
      total_paid: 0,
      pending_count: 0,
      overdue_count: 0,
      paid_count: 0,
    }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    let dueDates
    let payments

    if (tenantId) {
      dueDates = await getDueDatesByTenant(tenantId)
      payments = (await getPaymentsByTenant(tenantId)) || []
    } else if (propertyId) {
      dueDates = await getDueDatesByProperty(propertyId)
      payments = (await getAllPayments()).filter((payment) => payment.managed_property_id === propertyId)
    } else {
      dueDates = await getAllDueDates()
      payments = await getAllPayments()
    }

    const stats = {
      total_due: 0,
      total_paid: 0,
      pending_count: 0,
      overdue_count: 0,
      paid_count: 0,
    }

    for (const dueDate of dueDates || []) {
      stats.total_due += Number(dueDate.total_amount || 0)

      if (dueDate.status === 'paid') {
        stats.paid_count++
      } else if (dueDate.status === 'pending') {
        stats.pending_count++
      } else if (dueDate.status === 'overdue') {
        stats.overdue_count++
      }
    }

    const relevantPayments = payments || []
    stats.total_paid = relevantPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    return stats
  } catch (error: any) {
    console.error('Error calculating payment stats:', error)
    return {
      total_due: 0,
      total_paid: 0,
      pending_count: 0,
      overdue_count: 0,
      paid_count: 0,
    }
  }
}
