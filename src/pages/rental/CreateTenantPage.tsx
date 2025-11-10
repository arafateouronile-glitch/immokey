import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, UserPlus, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createTenant } from '@/services/rental/tenantService'
import { getManagedProperties } from '@/services/rental/managedPropertyService'
import type { ManagedProperty } from '@/types/rental'

export default function CreateTenantPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyIdFromUrl = searchParams.get('property')
  
  const { user, loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    managed_property_id: propertyIdFromUrl || '',
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
      navigate('/connexion', { state: { from: '/gestion-locative/locataires/nouveau' } })
      return
    }

    if (user) {
      fetchProperties()
    }
  }, [user, authLoading, navigate])

  const fetchProperties = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await getManagedProperties()
      setProperties(data.filter((p) => p.status === 'vacant'))
      
      // Si un bien est sélectionné depuis l'URL, pré-remplir les données
      if (propertyIdFromUrl) {
        const selectedProperty = data.find((p) => p.id === propertyIdFromUrl)
        if (selectedProperty) {
          setFormData((prev) => ({
            ...prev,
            monthly_rent: selectedProperty.monthly_rent,
          }))
        }
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err)
      setError('Erreur lors du chargement des biens')
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyChange = (propertyId: string) => {
    const selectedProperty = properties.find((p) => p.id === propertyId)
    setFormData({
      ...formData,
      managed_property_id: propertyId,
      monthly_rent: selectedProperty?.monthly_rent || 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validation
      if (!formData.managed_property_id) {
        throw new Error('Veuillez sélectionner un bien')
      }
      if (!formData.full_name.trim()) {
        throw new Error('Le nom complet est requis')
      }
      if (!formData.email.trim()) {
        throw new Error('L\'email est requis')
      }
      if (!formData.phone.trim()) {
        throw new Error('Le téléphone est requis')
      }
      if (!formData.lease_start_date) {
        throw new Error('La date de début de bail est requise')
      }
      if (formData.monthly_rent <= 0) {
        throw new Error('Le loyer mensuel doit être supérieur à 0')
      }
      if (formData.due_day < 1 || formData.due_day > 31) {
        throw new Error('Le jour d\'échéance doit être entre 1 et 31')
      }

      const tenant = await createTenant({
        managed_property_id: formData.managed_property_id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        id_type: formData.id_type || undefined,
        id_number: formData.id_number || undefined,
        lease_start_date: formData.lease_start_date,
        lease_end_date: formData.lease_end_date || undefined,
        monthly_rent: formData.monthly_rent,
        due_day: formData.due_day,
        deposit_paid: formData.deposit_paid || 0,
        first_rent_paid: formData.first_rent_paid,
        tenant_space_enabled: formData.tenant_space_enabled,
        notes: formData.notes || undefined,
      })

      navigate(`/gestion-locative/locataires/${tenant.id}`)
    } catch (err: any) {
      console.error('Error creating tenant:', err)
      setError(err.message || 'Erreur lors de la création du locataire')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
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

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/gestion-locative/locataires')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <h1 className="text-3xl font-bold flex items-center">
          <UserPlus className="text-primary-600 mr-3" size={32} />
          Ajouter un locataire
        </h1>
        <p className="text-gray-600 mt-2">
          Enregistrez un nouveau locataire et commencez la gestion de sa location
        </p>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection du bien */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Home className="text-primary-600 mr-2" size={24} />
            Bien concerné
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bien <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.managed_property_id}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Sélectionner un bien</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.address} ({formatPrice(property.monthly_rent)} FCFA/mois)
                </option>
              ))}
            </select>
            {properties.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Aucun bien vacant disponible. Ajoutez d'abord un bien vacant.
              </p>
            )}
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Informations de location */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Informations de location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début de bail <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.lease_start_date}
                onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin de bail (optionnel)
              </label>
              <input
                type="date"
                value={formData.lease_end_date}
                onChange={(e) => setFormData({ ...formData, lease_end_date: e.target.value })}
                className="input-field"
                min={formData.lease_start_date}
              />
              <p className="mt-1 text-xs text-gray-500">Laissez vide pour un bail à durée indéterminée</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyer mensuel (FCFA) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.monthly_rent || ''}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_rent: Number(e.target.value) })
                }
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                required
              />
              <p className="mt-1 text-xs text-gray-500">Jour du mois où le loyer est dû (1-31)</p>
            </div>
          </div>
        </div>

        {/* Paiements initiaux */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Paiements initiaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caution payée (FCFA)
              </label>
              <input
                type="number"
                value={formData.deposit_paid || ''}
                onChange={(e) =>
                  setFormData({ ...formData, deposit_paid: Number(e.target.value) })
                }
                className="input-field"
                min="0"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="first_rent_paid"
                checked={formData.first_rent_paid}
                onChange={(e) =>
                  setFormData({ ...formData, first_rent_paid: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="first_rent_paid" className="text-sm text-gray-700">
                Premier loyer payé
              </label>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Options</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tenant_space_enabled"
              checked={formData.tenant_space_enabled}
              onChange={(e) =>
                setFormData({ ...formData, tenant_space_enabled: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="tenant_space_enabled" className="text-sm text-gray-700">
              Activer l'espace locataire (le locataire pourra accéder à son compte)
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Si activé, une invitation par email sera envoyée au locataire pour créer son compte
          </p>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="input-field"
            placeholder="Notes privées sur le locataire..."
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/gestion-locative/locataires')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || properties.length === 0}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={18} />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer le locataire'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}






