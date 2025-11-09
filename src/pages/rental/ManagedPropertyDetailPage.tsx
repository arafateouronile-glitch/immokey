import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Edit,
  Home,
  UserPlus,
  DollarSign,
  MapPin,
  Building,
  Save,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getManagedProperty,
  updateManagedProperty,
} from '@/services/rental/managedPropertyService'
import DocumentsSection from '@/components/rental/DocumentsSection'
import type { ManagedProperty } from '@/types/rental'

export default function ManagedPropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [property, setProperty] = useState<ManagedProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    property_type: '',
    rooms: '' as number | '',
    surface_area: '' as number | '',
    monthly_rent: 0,
    charges: 0,
    deposit: 0,
    acquisition_date: '',
    notes: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: `/gestion/biens/${id}` } })
      return
    }

    if (id && user) {
      fetchProperty()
    }
  }, [id, user, authLoading, navigate])

  const fetchProperty = async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const data = await getManagedProperty(id)
      setProperty(data)
      setFormData({
        name: data.name,
        address: data.address,
        property_type: data.property_type,
        rooms: data.rooms || '',
        surface_area: data.surface_area || '',
        monthly_rent: data.monthly_rent,
        charges: data.charges || 0,
        deposit: data.deposit || 0,
        acquisition_date: data.acquisition_date || '',
        notes: data.notes || '',
      })
    } catch (err: any) {
      console.error('Error fetching property:', err)
      setError('Erreur lors du chargement du bien')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id || !property) return

    setSaving(true)
    setError(null)

    try {
      const updates = {
        name: formData.name,
        address: formData.address,
        property_type: formData.property_type as any,
        rooms: formData.rooms && typeof formData.rooms === 'number' ? formData.rooms : undefined,
        surface_area:
          formData.surface_area && typeof formData.surface_area === 'number'
            ? formData.surface_area
            : undefined,
        monthly_rent: formData.monthly_rent,
        charges: formData.charges,
        deposit: formData.deposit,
        acquisition_date: formData.acquisition_date || undefined,
        notes: formData.notes || undefined,
      }

      const updated = await updateManagedProperty(id, updates)
      setProperty(updated)
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error updating property:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!property) return
    setFormData({
      name: property.name,
      address: property.address,
      property_type: property.property_type,
      rooms: property.rooms || '',
      surface_area: property.surface_area || '',
      monthly_rent: property.monthly_rent,
      charges: property.charges || 0,
      deposit: property.deposit || 0,
      acquisition_date: property.acquisition_date || '',
      notes: property.notes || '',
    })
    setIsEditing(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseignée'
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

  if (error && !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/gestion/biens')}
            className="btn-secondary mt-4"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  if (!property) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/gestion/biens')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Home className="text-primary-600 mr-3" size={32} />
              {property.name}
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <MapPin size={16} className="mr-1" />
              {property.address}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                property.status === 'occupied'
                  ? 'bg-green-100 text-green-800'
                  : property.status === 'vacant'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {property.status === 'occupied'
                ? 'Occupé'
                : property.status === 'vacant'
                ? 'Vacant'
                : 'Archivé'}
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit size={18} />
                <span>Modifier</span>
              </button>
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
          {/* Informations générales */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <Building className="text-primary-600 mr-2" size={24} />
                Informations générales
              </h2>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du bien <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.property_type}
                      onChange={(e) =>
                        setFormData({ ...formData, property_type: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="appartement">Appartement</option>
                      <option value="maison">Maison</option>
                      <option value="terrain">Terrain</option>
                      <option value="bureau">Bureau</option>
                      <option value="commerce">Commerce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pièces
                    </label>
                    <input
                      type="number"
                      value={formData.rooms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rooms: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      value={formData.surface_area}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          surface_area: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="input-field"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'acquisition
                  </label>
                  <input
                    type="date"
                    value={formData.acquisition_date}
                    onChange={(e) =>
                      setFormData({ ...formData, acquisition_date: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="input-field"
                    placeholder="Notes privées..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type de bien</p>
                    <p className="font-medium capitalize">{property.property_type}</p>
                  </div>
                  {property.rooms && (
                    <div>
                      <p className="text-sm text-gray-600">Nombre de pièces</p>
                      <p className="font-medium">{property.rooms}</p>
                    </div>
                  )}
                  {property.surface_area && (
                    <div>
                      <p className="text-sm text-gray-600">Surface</p>
                      <p className="font-medium">{property.surface_area} m²</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Date d'acquisition</p>
                    <p className="font-medium">{formatDate(property.acquisition_date)}</p>
                  </div>
                </div>
                {property.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Notes</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{property.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Informations financières */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <DollarSign className="text-primary-600 mr-2" size={24} />
              Informations financières
            </h2>

            {isEditing ? (
              <div className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Charges (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.charges}
                      onChange={(e) =>
                        setFormData({ ...formData, charges: Number(e.target.value) })
                      }
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caution (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) =>
                        setFormData({ ...formData, deposit: Number(e.target.value) })
                      }
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Loyer mensuel</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(property.monthly_rent)} FCFA
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Charges mensuelles</p>
                    <p className="font-medium">{formatPrice(property.charges || 0)} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Caution demandée</p>
                    <p className="font-medium">{formatPrice(property.deposit || 0)} FCFA</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Locataire actuel */}
          {property.status === 'occupied' && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <UserPlus className="text-green-600 mr-2" size={20} />
                Locataire actuel
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ce bien est actuellement occupé. Cliquez pour voir les détails.
              </p>
              <button
                onClick={() => navigate(`/gestion/locataires?property=${property.id}`)}
                className="btn-primary w-full"
              >
                Voir le locataire
              </button>
            </div>
          )}

          {property.status === 'vacant' && (
            <div className="card bg-orange-50 border-orange-200">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <UserPlus className="text-orange-600 mr-2" size={20} />
                Bien vacant
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ce bien est actuellement disponible. Ajoutez un locataire pour commencer la
                gestion.
              </p>
              <button
                onClick={() => navigate(`/gestion/locataires/nouveau?property=${property.id}`)}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <UserPlus size={18} />
                <span>Ajouter un locataire</span>
              </button>
            </div>
          )}

          {/* Actions rapides */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/gestion/paiements?property=${property.id}`)}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <DollarSign size={18} />
                <span>Voir les paiements</span>
              </button>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Informations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Créé le</span>
                <span className="font-medium">
                  {new Date(property.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modifié le</span>
                <span className="font-medium">
                  {new Date(property.updated_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-6">
        <DocumentsSection propertyId={property.id} />
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
