import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  DollarSign,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getTenant, updateTenant, terminateTenant } from '@/services/rental/tenantService'
import DocumentsSection from '@/components/rental/DocumentsSection'
import type { Tenant } from '@/types/rental'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    id_type: '',
    id_number: '',
    lease_start_date: '',
    lease_end_date: '',
    monthly_rent: 0,
    due_day: 1,
    deposit_paid: 0,
    first_rent_paid: false,
    tenant_space_enabled: true,
    notes: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: `/gestion/locataires/${id}` } })
      return
    }

    if (id && user) {
      fetchTenant()
    }
  }, [id, user, authLoading, navigate])

  const fetchTenant = async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const data = await getTenant(id)
      setTenant(data)
      setFormData({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        id_type: data.id_type || '',
        id_number: data.id_number || '',
        lease_start_date: data.lease_start_date,
        lease_end_date: data.lease_end_date || '',
        monthly_rent: data.monthly_rent,
        due_day: data.due_day,
        deposit_paid: data.deposit_paid || 0,
        first_rent_paid: data.first_rent_paid || false,
        tenant_space_enabled: data.tenant_space_enabled,
        notes: data.notes || '',
      })
    } catch (err: any) {
      console.error('Error fetching tenant:', err)
      setError('Erreur lors du chargement du locataire')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id || !tenant) return

    setSaving(true)
    setError(null)

    try {
      const updates = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        id_type: formData.id_type || undefined,
        id_number: formData.id_number || undefined,
        lease_start_date: formData.lease_start_date,
        lease_end_date: formData.lease_end_date || undefined,
        monthly_rent: formData.monthly_rent,
        due_day: formData.due_day,
        deposit_paid: formData.deposit_paid,
        first_rent_paid: formData.first_rent_paid,
        tenant_space_enabled: formData.tenant_space_enabled,
        notes: formData.notes || undefined,
      }

      const updated = await updateTenant(id, updates)
      setTenant(updated)
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error updating tenant:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!tenant) return
    setFormData({
      full_name: tenant.full_name,
      email: tenant.email,
      phone: tenant.phone,
      id_type: tenant.id_type || '',
      id_number: tenant.id_number || '',
      lease_start_date: tenant.lease_start_date,
      lease_end_date: tenant.lease_end_date || '',
      monthly_rent: tenant.monthly_rent,
      due_day: tenant.due_day,
      deposit_paid: tenant.deposit_paid || 0,
      first_rent_paid: tenant.first_rent_paid || false,
      tenant_space_enabled: tenant.tenant_space_enabled,
      notes: tenant.notes || '',
    })
    setIsEditing(false)
  }

  const handleTerminate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir terminer la location de ce locataire ?')) {
      return
    }

    try {
      await terminateTenant(id!)
      navigate('/gestion/locataires')
    } catch (err: any) {
      console.error('Error terminating tenant:', err)
      setError(err.message || 'Erreur lors de la terminaison')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error && !tenant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
          <button onClick={() => navigate('/gestion/locataires')} className="btn-secondary mt-4">
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return null
  }

  const property = (tenant as any).managed_properties

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/gestion/locataires')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <User className="text-primary-600 mr-3" size={32} />
              {tenant.full_name}
            </h1>
            {property && (
              <p className="text-gray-600 mt-2 flex items-center">
                <Home size={16} className="mr-1" />
                {property.name} - {property.address}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                tenant.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {tenant.status === 'active' ? 'Actif' : 'Terminé'}
            </span>
            {!isEditing && tenant.status === 'active' && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit size={18} />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={handleTerminate}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <X size={18} />
                  <span>Terminer</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Informations personnelles</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de pièce d'identité
                    </label>
                    <select
                      value={formData.id_type}
                      onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Sélectionner</option>
                      <option value="CNI">CNI</option>
                      <option value="Passeport">Passeport</option>
                      <option value="Permis de conduire">Permis de conduire</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de pièce d'identité
                    </label>
                    <input
                      type="text"
                      value={formData.id_number}
                      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-700">
                    <Mail size={18} className="mr-2 text-gray-400" />
                    <span>{tenant.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone size={18} className="mr-2 text-gray-400" />
                    <span>{tenant.phone}</span>
                  </div>
                  {tenant.id_type && (
                    <div>
                      <p className="text-sm text-gray-600">Type de pièce d'identité</p>
                      <p className="font-medium">{tenant.id_type}</p>
                    </div>
                  )}
                  {tenant.id_number && (
                    <div>
                      <p className="text-sm text-gray-600">Numéro de pièce d'identité</p>
                      <p className="font-medium">{tenant.id_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Informations de location */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Calendar className="text-primary-600 mr-2" size={24} />
              Informations de location
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.lease_start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, lease_start_date: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      value={formData.lease_end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, lease_end_date: e.target.value })
                      }
                      className="input-field"
                      min={formData.lease_start_date}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loyer mensuel (FCFA) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.monthly_rent}
                      onChange={(e) =>
                        setFormData({ ...formData, monthly_rent: Number(e.target.value) })
                      }
                      className="input-field"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jour d'échéance <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.due_day}
                      onChange={(e) =>
                        setFormData({ ...formData, due_day: Number(e.target.value) })
                      }
                      className="input-field"
                      min="1"
                      max="31"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Loyer mensuel</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(tenant.monthly_rent)} FCFA
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium">{formatDate(tenant.lease_start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de fin</p>
                    <p className="font-medium">
                      {tenant.lease_end_date ? formatDate(tenant.lease_end_date) : 'Durée indéterminée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jour d'échéance</p>
                    <p className="font-medium">Le {tenant.due_day} de chaque mois</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Caution payée</p>
                    <p className="font-medium">{formatPrice(tenant.deposit_paid || 0)} FCFA</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {tenant.notes && !isEditing && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{tenant.notes}</p>
            </div>
          )}

          {isEditing && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Notes</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="input-field"
                placeholder="Notes privées..."
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Actions rapides */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/gestion/paiements?tenant=${tenant.id}`)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <DollarSign size={18} />
                <span>Voir les paiements</span>
              </button>

              <button
                onClick={() => navigate(`/gestion/messages?tenant=${tenant.id}`)}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <MessageCircle size={18} />
                <span>Messages</span>
              </button>
            </div>
          </div>

          {/* Informations du bien */}
          {property && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Bien concerné</h3>
              <div className="space-y-2">
                <p className="font-medium">{property.name}</p>
                <p className="text-sm text-gray-600">{property.address}</p>
                <button
                  onClick={() => navigate(`/gestion/biens/${property.id}`)}
                  className="w-full btn-secondary text-sm mt-4"
                >
                  Voir le bien
                </button>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Options</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Espace locataire</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    tenant.tenant_space_enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tenant.tenant_space_enabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Premier loyer payé</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    tenant.first_rent_paid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tenant.first_rent_paid ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-6">
        <DocumentsSection tenantId={tenant.id} />
      </div>

      {/* Boutons d'action en mode édition */}
      {isEditing && (
        <div className="mt-6 flex items-center justify-end space-x-4">
          <button onClick={handleCancel} className="btn-secondary flex items-center space-x-2">
            <X size={18} />
            <span>Annuler</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={18} />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
