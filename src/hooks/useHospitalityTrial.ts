import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface TrialInfo {
  planType: string | null
  trialEndsAt: Date | null
  isExpired: boolean
  daysRemaining: number
  subscriptionStatus: string | null
}

export function useHospitalityTrial() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    planType: null,
    trialEndsAt: null,
    isExpired: false,
    daysRemaining: 0,
    subscriptionStatus: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrialInfo = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('plan_type, trial_ends_at, subscription_status')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data) {
          const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null
          const isExpired = trialEndsAt ? new Date() > trialEndsAt : false
          const daysRemaining = trialEndsAt
            ? Math.max(0, Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
            : 0

          setTrialInfo({
            planType: data.plan_type,
            trialEndsAt,
            isExpired,
            daysRemaining,
            subscriptionStatus: data.subscription_status,
          })

          // Si l'essai est expiré et pas d'abonnement actif, rediriger vers la page d'abonnement
          if (isExpired && data.subscription_status !== 'active') {
            // Envoyer une notification (email sera géré côté serveur)
            toast.error('Votre essai gratuit a expiré. Veuillez vous abonner pour continuer.')
            navigate('/hotellerie/abonnement')
          }
        }
      } catch (error: any) {
        console.error('Error fetching trial info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrialInfo()
  }, [user, navigate])

  return { trialInfo, loading }
}

