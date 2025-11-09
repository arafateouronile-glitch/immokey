import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  city: string | null
  country: string | null
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Version: 2024-01-08 - Profile page with fallback support

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    country: 'Togo',
  })

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/connexion')
      return
    }

    loadProfile()
  }, [authLoading, user, navigate])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Essayer de charger le profil depuis user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) {
        // Si le profil n'existe pas encore, créer un profil par défaut
        if (error.code === 'PGRST116') {
          const defaultProfile: UserProfile = {
            id: user!.id,
            email: user!.email || '',
            full_name: user!.user_metadata?.full_name || user!.user_metadata?.first_name + ' ' + user!.user_metadata?.last_name || null,
            phone: user!.user_metadata?.phone || null,
            avatar_url: null,
            city: null,
            country: 'Togo',
          }
          setProfile(defaultProfile)
          setFormData({
            full_name: defaultProfile.full_name || '',
            phone: defaultProfile.phone || '',
            city: '',
            country: 'Togo',
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
        })
      }
    } catch (error) {
      console.error('Profile load error:', error)
      toast.error('Impossible de charger votre profil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', user!.id)

      if (error) throw error

      toast.success('Profil mis à jour avec succès')
      setEditing(false)
      loadProfile()
    } catch (error) {
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <p className="text-center text-neutral-500">Profil non trouvé</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-20 w-20 rounded-full" />
              ) : (
                <User className="h-10 w-10 text-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profile.full_name || 'Utilisateur'}</h1>
              <p className="text-primary-100">{profile.email}</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-lg text-white hover:bg-white hover:text-primary-600 transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+228 90 00 00 00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
                  Ville
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Lomé"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-neutral-700 mb-2">
                  Pays
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
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
                    })
                  }}
                  className="inline-flex items-center px-6 py-2 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-neutral-500 mb-1">Email</dt>
                <dd className="flex items-center text-neutral-900">
                  <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                  {profile.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500 mb-1">Téléphone</dt>
                <dd className="flex items-center text-neutral-900">
                  <Phone className="h-4 w-4 mr-2 text-neutral-400" />
                  {profile.phone || 'Non renseigné'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500 mb-1">Ville</dt>
                <dd className="flex items-center text-neutral-900">
                  <MapPin className="h-4 w-4 mr-2 text-neutral-400" />
                  {profile.city || 'Non renseignée'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500 mb-1">Pays</dt>
                <dd className="text-neutral-900">{profile.country || 'Non renseigné'}</dd>
              </div>
            </dl>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
