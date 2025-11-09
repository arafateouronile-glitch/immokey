import { supabase } from '@/lib/supabase'

/**
 * Envoyer un email de rappel d'abonnement aux utilisateurs dont l'essai expire bientôt ou a expiré
 */
export async function sendSubscriptionReminderEmails() {
  try {
    // Récupérer les utilisateurs dont l'essai expire dans les 3 prochains jours ou a expiré
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, trial_ends_at, subscription_status')
      .eq('subscription_status', 'trial')
      .lte('trial_ends_at', threeDaysFromNow.toISOString())

    if (error) throw error

    // Pour chaque utilisateur, envoyer un email via Edge Function
    // Note: Cette fonction devrait être appelée par un cron job ou Edge Function
    for (const user of users || []) {
      await sendSubscriptionEmail(user.id, user.trial_ends_at)
    }

    return { success: true, count: users?.length || 0 }
  } catch (error: any) {
    console.error('Error sending subscription reminders:', error)
    throw error
  }
}

/**
 * Envoyer un email d'abonnement à un utilisateur spécifique
 */
async function sendSubscriptionEmail(userId: string, trialEndsAt: string | null) {
  try {
    // Appeler une Edge Function Supabase pour envoyer l'email
    const { error } = await supabase.functions.invoke('send-subscription-reminder', {
      body: {
        user_id: userId,
        trial_ends_at: trialEndsAt,
        subscription_url: `${window.location.origin}/hotellerie/abonnement`,
      },
    })

    if (error) throw error
  } catch (error: any) {
    console.error('Error sending subscription email:', error)
    // Ne pas throw pour ne pas bloquer le processus
  }
}

/**
 * Vérifier si un utilisateur doit être redirigé vers la page d'abonnement
 */
export async function checkTrialStatus(userId: string): Promise<{
  isExpired: boolean
  daysRemaining: number
  shouldRedirect: boolean
}> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('trial_ends_at, subscription_status')
      .eq('id', userId)
      .single()

    if (error) throw error

    if (!data || !data.trial_ends_at) {
      return { isExpired: false, daysRemaining: 0, shouldRedirect: false }
    }

    const trialEndsAt = new Date(data.trial_ends_at)
    const now = new Date()
    const isExpired = now > trialEndsAt
    const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    return {
      isExpired,
      daysRemaining,
      shouldRedirect: isExpired && data.subscription_status !== 'active',
    }
  } catch (error: any) {
    console.error('Error checking trial status:', error)
    return { isExpired: false, daysRemaining: 0, shouldRedirect: false }
  }
}

