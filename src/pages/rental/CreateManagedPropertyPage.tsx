import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createManagedProperty } from '@/services/rental/managedPropertyService'
import { getListings } from '@/services/listingService'
import type { Listing } from '@/types'

const propertySchema = z.object({
  listing_id: z.string().optional(),
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  property_type: z.enum(['appartement', 'maison', 'terrain', 'bureau', 'commerce']),
  rooms: z.number().min(0).optional().or(z.literal('')),
  surface_area: z.number().min(0).optional().or(z.literal('')),
  monthly_rent: z.number().min(1, 'Le loyer doit être supérieur à 0'),
  charges: z.number().min(0).optional().or(z.literal('')),
  deposit: z.number().min(0).optional().or(z.literal('')),
  acquisition_date: z.string().optional(),
  notes: z.string().optional(),
})

type PropertyForm = z.infer<typeof propertySchema>

export default function CreateManagedPropertyPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [importFromListing, setImportFromListing] = useState(false)
  const [selectedListing, setSelectedListing] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion/biens/nouveau' } })
      return
    }

    if (user) {
      fetchListings()
    }
  }, [user, authLoading, navigate])

  const fetchListings = async () => {
    try {
      const result = await getListings({})
      const data = Array.isArray(result) ? result : result.data || []
      setListings(data)
    } catch (err) {
      console.error('Error fetching listings:', err)
    }
  }

  const handleImportListing = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId)
    if (listing) {
      setValue('name', listing.title)
      setValue('address', listing.address || '')
      setValue('property_type', listing.property_type)
      setValue('rooms', listing.rooms || undefined)
      setValue('surface_area', listing.surface_area || undefined)
      setValue('monthly_rent', listing.price)
      setValue('listing_id', listing.id)
    }
  }

  const onSubmit = async (data: PropertyForm) => {
    if (!user) {
      setError('Vous devez être connecté')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const propertyData = {
        ...data,
        listing_id: data.listing_id || undefined,
        rooms: data.rooms && typeof data.rooms === 'number' ? data.rooms : undefined,
        surface_area:
          data.surface_area && typeof data.surface_area === 'number' ? data.surface_area : undefined,
        charges: data.charges && typeof data.charges === 'number' ? data.charges : 0,
        deposit: data.deposit && typeof data.deposit === 'number' ? data.deposit : 0,
        acquisition_date: data.acquisition_date || undefined,
        notes: data.notes || undefined,
      }

      const property = await createManagedProperty(propertyData)
      navigate(`/gestion/biens/${property.id}`)
    } catch (err: any) {
      console.error('Error creating property:', err)
      setError(err.message || 'Erreur lors de la création du bien')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
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
          onClick={() => navigate('/gestion/biens')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <h1 className="text-3xl font-bold">Ajouter un bien en gestion</h1>
        <p className="text-gray-600 mt-2">
          Créez un nouveau bien ou importez depuis une annonce existante
        </p>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Option d'import */}
      {listings.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Importer depuis une annonce</h2>
              <p className="text-gray-600 text-sm">
                Sélectionnez une de vos annonces pour pré-remplir le formulaire
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setImportFromListing(!importFromListing)
                if (!importFromListing) {
                  setSelectedListing('')
                }
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {importFromListing ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {importFromListing && (
            <div>
              <select
                value={selectedListing}
                onChange={(e) => {
                  const listingId = e.target.value
                  setSelectedListing(listingId)
                  if (listingId) {
                    handleImportListing(listingId)
                  }
                }}
                className="input-field"
              >
                <option value="">Sélectionner une annonce...</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title} - {listing.address}, {listing.city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Informations générales</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du bien <span className="text-red-600">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="input-field"
                placeholder="Ex: Appartement Tokoin - 2ch"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse complète <span className="text-red-600">*</span>
              </label>
              <input
                {...register('address')}
                type="text"
                className="input-field"
                placeholder="Rue X, Quartier Y, Ville"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de bien <span className="text-red-600">*</span>
                </label>
                <select {...register('property_type')} className="input-field">
                  <option value="">Sélectionner...</option>
                  <option value="appartement">Appartement</option>
                  <option value="maison">Maison</option>
                  <option value="terrain">Terrain</option>
                  <option value="bureau">Bureau</option>
                  <option value="commerce">Commerce</option>
                </select>
                {errors.property_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de pièces
                </label>
                <input
                  {...register('rooms', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface (m²)
                </label>
                <input
                  {...register('surface_area', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="75.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations financières */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Informations financières</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loyer mensuel (FCFA) <span className="text-red-600">*</span>
              </label>
              <input
                {...register('monthly_rent', { valueAsNumber: true })}
                type="number"
                min="1"
                className="input-field"
                placeholder="100000"
              />
              {errors.monthly_rent && (
                <p className="mt-1 text-sm text-red-600">{errors.monthly_rent.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charges mensuelles (FCFA)
                </label>
                <input
                  {...register('charges', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caution demandée (FCFA)
                </label>
                <input
                  {...register('deposit', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="200000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'acquisition
              </label>
              <input
                {...register('acquisition_date')}
                type="date"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Notes</h2>
          <textarea
            {...register('notes')}
            rows={4}
            className="input-field"
            placeholder="Notes privées sur ce bien..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/gestion/biens')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={20} />
            <span>{loading ? 'Création...' : 'Créer le bien'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
