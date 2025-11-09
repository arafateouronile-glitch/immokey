import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  ShieldCheck,
  Building2,
  PenSquare,
  Globe2,
  FileText,
  ArrowUpRight,
  Clock3,
  Award,
  Lock,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getUserStats } from '@/services/profileService'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  city: string | null
  country: string | null
  user_type?: 'particulier' | 'professionnel'
  verified?: boolean
  company_name?: string | null
  website?: string | null
  bio?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface ProfileStats {
  totalListings: number
  activeListings: number
  totalFavorites: number
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<ProfileStats>({
    totalListings: 0,
    activeListings: 0,
    totalFavorites: 0,
  })
  const [statsLoading, setStatsLoading] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    country: 'Togo',
    company_name: '',
    website: '',
    bio: '',
    user_type: 'particulier' as 'particulier' | 'professionnel',
  })

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      navigate('/connexion')
      return
    }

    loadAllData()
  }, [authLoading, user, navigate])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadProfile(), loadStats()])
    } catch (error) {
      console.error('Profile init error:', error)
      toast.error('Impossible de charger votre espace personnel')
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const metadata = user!.user_metadata || {}
          const defaultFullName =
            metadata.full_name && typeof metadata.full_name === 'string'
              ? metadata.full_name
              : metadata.first_name && metadata.last_name
              ? `${metadata.first_name} ${metadata.last_name}`
              : null
          const defaultProfile: UserProfile = {
            id: user!.id,
            email: user!.email || '',
            full_name: defaultFullName,
            phone:
              metadata.phone && typeof metadata.phone === 'string'
                ? metadata.phone
                : null,
            avatar_url: null,
            city: null,
            country: 'Togo',
            user_type: 'particulier',
            verified: false,
            company_name: null,
            website: null,
            bio: null,
            created_at: user?.created_at ?? null,
          }
          setProfile(defaultProfile)
          setFormData({
            full_name: defaultProfile.full_name || '',
            phone: defaultProfile.phone || '',
            city: '',
            country: 'Togo',
            company_name: '',
            website: '',
            bio: '',
            user_type: 'particulier',
          })
        } else {
          throw error
        }
      } else {
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          city: data.city || '',
          country: data.country || 'Togo',
          company_name: data.company_name || '',
          website: data.website || '',
          bio: data.bio || '',
          user_type: (data.user_type as 'particulier' | 'professionnel') || 'particulier',
        })
      }
    } catch (error) {
      console.error('Profile load error:', error)
      toast.error('Impossible de charger votre profil')
    }
  }

  const loadStats = async () => {
    if (!isSupabaseConfigured) return
    try {
      setStatsLoading(true)
      const userStats = await getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Profile stats error:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        id: user!.id,
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        city: formData.city || null,
        country: formData.country || null,
        company_name: formData.company_name || null,
        website: formData.website || null,
        bio: formData.bio || null,
        user_type: formData.user_type || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'id' })

      if (error) {
        throw error
      }

      toast.success('Profil mis à jour avec succès')
      setEditing(false)
      await loadProfile()
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Impossible de mettre à jour votre profil')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Déconnexion réussie')
      navigate('/')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const completion = useMemo(() => {
    if (!profile) {
      return 0
    }
    const fields = [
      profile.full_name,
      profile.phone,
      profile.city,
      profile.country,
      profile.company_name,
      profile.website,
      profile.bio,
    ]
    const filled = fields.filter((value) => Boolean(value && String(value).trim())).length
    return Math.max(20, Math.round((filled / fields.length) * 100))
  }, [profile])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4">
        <p className="text-center text-neutral-500">Profil non trouvé</p>
      </div>
    )
  }

  const userTypeLabel =
    profile.user_type === 'professionnel' ? 'Compte professionnel' : 'Compte particulier'

  const formattedCreatedAt = profile.created_at ? formatDate(profile.created_at) : null
  const formattedLastLogin = user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : null

  const activityItems = [
    {
      icon: Clock3,
      title: 'Dernière connexion',
      description: formattedLastLogin
        ? `Connecté(e) le ${formattedLastLogin}`
        : 'Connexion en attente',
    },
    {
      icon: ShieldCheck,
      title: 'Statut du compte',
      description: profile.verified ? 'Compte vérifié' : 'Vérification en cours',
    },
    {
      icon: Building2,
      title: 'Type de compte',
      description: userTypeLabel,
    },
    {
      icon: FileText,
      title: 'Annonces récentes',
      description:
        stats.totalListings > 0
          ? `${stats.totalListings} annonce(s) publiées`
          : 'Pas encore d’annonce publiée',
    },
  ]

  const metrics = [
    {
      title: 'Annonces totales',
      value: stats.totalListings,
      trend: '+12%',
      trendLabel: 'vs. mois dernier',
      icon: Building2,
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    },
    {
      title: 'Annonces actives',
      value: stats.activeListings,
      trend: '+4',
      trendLabel: 'nouvelles ce mois-ci',
      icon: CheckCircle2,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    },
    {
      title: 'Favoris enregistrés',
      value: stats.totalFavorites,
      trend: '+9%',
      trendLabel: 'engagement utilisateurs',
      icon: Award,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    },
  ]

  return (
    <div className="relative min-h-screen bg-neutral-900/5 pt-16 pb-20">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-500/30 blur-3xl" />
        <div className="absolute right-[-10%] top-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[140px]" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/85 shadow-xl shadow-primary-950/10 backdrop-blur"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 via-primary-600/90 to-primary-700/90" />
          <div className="relative flex flex-col gap-6 p-8 text-white lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-center">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-10 w-10 text-white/85" />
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-2 right-2 inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-primary-600 shadow-sm hover:bg-white"
                  onClick={() =>
                    toast('Module de téléversement disponible prochainement', { icon: '🪄' })
                  }
                >
                  <UploadCloud className="mr-1 h-3 w-3" />
                  Photo
                </button>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold sm:text-3xl">
                    {profile.full_name || 'Profil utilisateur'}
                  </h1>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {profile.verified ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Compte vérifié
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Vérification en attente
                      </>
                    )}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    {userTypeLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">
                  {profile.bio
                    ? profile.bio
                    : 'Complétez votre bio pour mettre en avant votre expertise et inspirer confiance.'}
                </p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/60" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-white/60" />
                      <span>{profile.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/60" />
                      <span>
                        {profile.city ? `${profile.city}, ` : ''}
                        {profile.country || 'Non renseigné'}
                      </span>
                    </div>
                  </dl>
                  <div className="w-full max-w-md">
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-white/70">
                      <span>Complétion du profil</span>
                      <span>{completion}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:max-w-xs">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary-600 shadow-lg shadow-primary-900/10 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <PenSquare className="h-4 w-4" />
                  Mettre à jour le profil
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/50 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                  Fermer l’édition
                </button>
              )}
              <Link
                to="/gestion-locative"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl"
              >
                <Building2 className="h-4 w-4" />
                Gestion Locative
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-xs font-medium text-white/80 transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {metrics.map((metric) => (
            <motion.div
              key={metric.title}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-lg shadow-neutral-900/5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient}`} />
              <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    {metric.title}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-primary-600 shadow-inner">
                    <metric.icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="text-3xl font-semibold text-neutral-900">
                  {statsLoading ? (
                    <span className="inline-flex h-6 w-16 animate-pulse rounded bg-white/70" />
                  ) : (
                    metric.value
                  )}
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-primary-600">
                  <ArrowUpRight className="h-4 w-4" />
                  {metric.trend}
                  <span className="ml-2 text-xs font-normal uppercase tracking-wide text-neutral-500">
                    {metric.trendLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <div className="grid gap-8 lg:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-lg shadow-neutral-900/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Informations personnelles
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Gardez vos coordonnées à jour pour simplifier vos échanges avec vos clients.
                  </p>
                </div>
                <button
                  onClick={() => setEditing((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <Edit2 className="h-4 w-4" />
                  {editing ? 'Fermer' : 'Modifier'}
                </button>
              </div>

              <div className="mt-6">
                {editing ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      handleSave()
                    }}
                    className="grid gap-6"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormInput
                        label="Nom complet"
                        id="full_name"
                        placeholder="Votre nom complet"
                        value={formData.full_name}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, full_name: value }))
                        }
                      />
                      <FormInput
                        label="Téléphone"
                        id="phone"
                        placeholder="+228 90 00 00 00"
                        value={formData.phone}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, phone: value }))
                        }
                        icon={Phone}
                      />
                      <FormInput
                        label="Ville"
                        id="city"
                        placeholder="Lomé"
                        value={formData.city}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, city: value }))
                        }
                        icon={MapPin}
                      />
                      <div>
                        <label
                          htmlFor="country"
                          className="mb-2 block text-sm font-medium text-neutral-700"
                        >
                          Pays
                        </label>
                        <select
                          id="country"
                          value={formData.country}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, country: event.target.value }))
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="Togo">Togo</option>
                          <option value="Bénin">Bénin</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                          <option value="Niger">Niger</option>
                          <option value="Sénégal">Sénégal</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormInput
                        label="Entreprise"
                        id="company_name"
                        placeholder="Nom de votre structure"
                        value={formData.company_name}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, company_name: value }))
                        }
                        icon={Building2}
                      />
                      <FormInput
                        label="Site web"
                        id="website"
                        placeholder="https://mon-site.com"
                        value={formData.website}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, website: value }))
                        }
                        icon={Globe2}
                      />
                      <div>
                        <label
                          htmlFor="user_type"
                          className="mb-2 block text-sm font-medium text-neutral-700"
                        >
                          Type de compte
                        </label>
                        <select
                          id="user_type"
                          value={formData.user_type}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              user_type: event.target.value as 'particulier' | 'professionnel',
                            }))
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="particulier">Particulier</option>
                          <option value="professionnel">Professionnel</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="bio"
                          className="mb-2 block text-sm font-medium text-neutral-700"
                        >
                          À propos
                        </label>
                        <textarea
                          id="bio"
                          rows={4}
                          value={formData.bio}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, bio: event.target.value }))
                          }
                          placeholder="Présentez votre activité, vos spécialités ou votre zone d’intervention."
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {saving ? (
                          <>
                            <svg
                              className="-ml-1 mr-2 h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les modifications
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false)
                          setFormData({
                            full_name: profile.full_name || '',
                            phone: profile.phone || '',
                            city: profile.city || '',
                            country: profile.country || 'Togo',
                            company_name: profile.company_name || '',
                            website: profile.website || '',
                            bio: profile.bio || '',
                            user_type: profile.user_type || 'particulier',
                          })
                        }}
                        className="inline-flex items-center rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <InfoCard
                      label="Nom complet"
                      value={profile.full_name || 'Non renseigné'}
                    />
                    <InfoCard
                      label="Téléphone"
                      value={profile.phone || 'Non renseigné'}
                      icon={Phone}
                    />
                    <InfoCard
                      label="Ville"
                      value={profile.city || 'Non renseignée'}
                      icon={MapPin}
                    />
                    <InfoCard
                      label="Pays"
                      value={profile.country || 'Non renseigné'}
                      icon={Globe2}
                    />
                    <InfoCard
                      label="Entreprise"
                      value={profile.company_name || 'Non renseignée'}
                      icon={Building2}
                    />
                    <InfoCard
                      label="Site web"
                      value={profile.website || 'Non renseigné'}
                      icon={Globe2}
                    />
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-neutral-600">À propos</h3>
                      <p className="mt-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-700">
                        {profile.bio
                          ? profile.bio
                          : 'Ajoutez une description pour présenter votre activité, vos points forts et vos zones d’intervention.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-lg shadow-neutral-900/5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Vos actions rapides
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Publiez une annonce, consultez vos messages et suivez vos favoris directement depuis votre espace.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <QuickActionCard
                  title="Créer une annonce"
                  description="Publiez un nouveau bien en quelques minutes pour toucher nos acheteurs."
                  actionLabel="Nouvelle annonce"
                  onClick={() => navigate('/annonces/creer')}
                />
                <QuickActionCard
                  title="Mes annonces"
                  description="Visualisez et gérez vos annonces en ligne (statut, disponibilité, statistiques)."
                  actionLabel="Voir mes annonces"
                  onClick={() => navigate('/mes-annonces')}
                />
                <QuickActionCard
                  title="Messagerie"
                  description="Échangez avec les acheteurs et propriétaires directement sur la plateforme."
                  actionLabel="Accéder à la messagerie"
                  onClick={() => navigate('/messages')}
                />
                <QuickActionCard
                  title="Favoris"
                  description="Retrouvez les biens que vous suivez pour rester informé des nouveautés."
                  actionLabel="Voir mes favoris"
                  onClick={() => navigate('/favoris')}
                />
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-lg shadow-neutral-900/5">
              <h2 className="text-lg font-semibold text-neutral-900">Statut du compte</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Un aperçu rapide des informations de sécurité et du statut de votre compte.
              </p>
              <dl className="mt-5 space-y-4 text-sm">
                <StatusRow
                  icon={ShieldCheck}
                  label="Vérification"
                  value={profile.verified ? 'Compte vérifié' : 'Vérification en attente'}
                  status={profile.verified ? 'success' : 'warning'}
                />
                <StatusRow
                  icon={Clock3}
                  label="Membre depuis"
                  value={
                    formattedCreatedAt ? formattedCreatedAt : "Date d'inscription non disponible"
                  }
                />
                <StatusRow
                  icon={RefreshCw}
                  label="Dernière connexion"
                  value={
                    formattedLastLogin ? formattedLastLogin : 'Pas de connexion enregistrée'
                  }
                />
                <StatusRow icon={Building2} label="Type de compte" value={userTypeLabel} />
              </dl>
            </div>

            <div className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-lg shadow-neutral-900/5">
              <h2 className="text-lg font-semibold text-neutral-900">Activité récente</h2>
              <ul className="mt-4 space-y-3">
                {activityItems.map((item) => (
                  <li key={item.title} className="flex gap-3 rounded-2xl bg-neutral-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-600 shadow-inner">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                      <p className="text-xs text-neutral-500">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-lg shadow-neutral-900/5">
              <h2 className="text-lg font-semibold text-neutral-900">Sécurité</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Renforcez la protection de votre compte et gardez la main sur vos accès.
              </p>
              <div className="mt-5 space-y-4">
                <button
                  onClick={() => navigate('/connexion')}
                  className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-left text-sm transition hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-primary-600" />
                    <div>
                      <p className="font-semibold text-neutral-900">Mettre à jour mon mot de passe</p>
                      <p className="text-xs text-neutral-500">
                        Accédez à la page de connexion pour lancer la procédure de réinitialisation.
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-primary-600" />
                </button>
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
                  <p className="font-medium text-neutral-700">Bientôt disponible :</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Authentification multi-facteurs (SMS / Email)</li>
                    <li>• Journal d’activité détaillé (actions et connexions)</li>
                    <li>• Gestion des accès équipe & délégations</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch (error) {
    return value
  }
}

interface FormInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
}

function FormInput({ id, label, value, onChange, placeholder, icon: Icon }: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        )}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
            Icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </div>
  )
}

interface InfoCardProps {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

function InfoCard({ label, value, icon: Icon }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-2 text-sm text-neutral-800">
        {Icon && <Icon className="h-4 w-4 text-neutral-400" />}
        <span>{value}</span>
      </div>
    </div>
  )
}

interface StatusRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  status?: 'success' | 'warning' | 'default'
}

function StatusRow({ icon: Icon, label, value, status = 'default' }: StatusRowProps) {
  const statusClasses =
    status === 'success'
      ? 'text-emerald-600'
      : status === 'warning'
      ? 'text-amber-600'
      : 'text-neutral-600'

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-inner">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
        <p className={`text-sm font-medium ${statusClasses}`}>{value}</p>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  actionLabel: string
  onClick: () => void
}

function QuickActionCard({ title, description, actionLabel, onClick }: QuickActionCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm transition hover:border-primary-100 hover:bg-white">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="mt-2 text-xs text-neutral-500">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-between rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
      >
        {actionLabel}
        <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
      </button>
    </div>
  )
}
