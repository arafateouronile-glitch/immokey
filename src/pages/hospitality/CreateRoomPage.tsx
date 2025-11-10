import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createRoom } from '@/services/hospitality/roomService'
import { getEstablishment } from '@/services/hospitality/establishmentService'
import AmenitiesSelector from '@/components/forms/AmenitiesSelector'
import ImageUploader from '@/components/forms/ImageUploader'

const roomSchema = z.object({
  room_number: z.string().min(1, 'Le numéro de chambre est requis'),
  room_type: z.enum(['single', 'double', 'twin', 'suite', 'apartment', 'family', 'dormitory']),
  name: z.string().optional(),
  description: z.string().optional(),
  max_guests: z.number().min(1, 'Au moins 1 personne requise'),
  beds: z.number().min(0).optional().or(z.literal('')),
  bed_type: z.enum(['single', 'double', 'queen', 'king']).optional(),
  surface_area: z.number().min(0).optional().or(z.literal('')),
  floor: z.number().min(0).optional().or(z.literal('')),
  base_price_per_night: z.number().min(1, 'Le prix par nuit doit être supérieur à 0'),
  currency: z.string().optional(),
  notes: z.string().optional(),
})

type RoomForm = z.infer<typeof roomSchema>

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [establishmentName, setEstablishmentName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      currency: 'FCFA',
      max_guests: 2,
      beds: 1,
    },
  })

  useEffect(() => {
    const stateEstablishmentId = (location.state as any)?.establishmentId
    if (stateEstablishmentId) {
      setEstablishmentId(stateEstablishmentId)
    }

    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/hotellerie/chambres/nouvelle' } })
      return
    }

    if (user && stateEstablishmentId) {
      fetchEstablishment()
    }
  }, [user, authLoading, navigate, location])

  const fetchEstablishment = async () => {
    const stateEstablishmentId = (location.state as any)?.establishmentId
    if (!stateEstablishmentId) return

    try {
      const data = await getEstablishment(stateEstablishmentId)
      setEstablishmentName(data.name)
    } catch (err: any) {
      console.error('Error fetching establishment:', err)
    }
  }

  const onSubmit = async (data: RoomForm) => {
    if (!user || !establishmentId) {
      setError('Vous devez être connecté et avoir sélectionné un établissement')
      return
    }

    setLoading(true)
    setError(null)
    setUploadProgress('')

    try {
      setUploadProgress('Création de la chambre...')

      // 1. Créer la chambre
      const room = await createRoom({
        establishment_id: establishmentId,
        room_number: data.room_number,
        room_type: data.room_type,
        name: data.name || undefined,
        description: data.description || undefined,
        max_guests: data.max_guests,
        beds: data.beds && typeof data.beds === 'number' ? data.beds : undefined,
        bed_type: data.bed_type || undefined,
        surface_area:
          data.surface_area && typeof data.surface_area === 'number'
            ? data.surface_area
            : undefined,
        floor: data.floor && typeof data.floor === 'number' ? data.floor : undefined,
        base_price_per_night: data.base_price_per_night,
        currency: data.currency || 'FCFA',
        amenities: selectedAmenities,
        notes: data.notes || undefined,
        photo_urls: selectedImages,
      })

      setUploadProgress('Terminé !')

      // Rediriger vers la liste des chambres
      navigate('/hotellerie/chambres', {
        state: { establishmentId },
      })
    } catch (err: any) {
      console.error('Error creating room:', err)
      setError(err.message || 'Erreur lors de la création de la chambre')
    } finally {
      setLoading(false)
      setUploadProgress('')
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

  if (!establishmentId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-700">
            Veuillez sélectionner un établissement pour créer une chambre.
          </p>
          <button
            onClick={() => navigate('/hotellerie/etablissements')}
            className="btn-primary mt-4"
          >
            Voir mes établissements
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/hotellerie/chambres', { state: { establishmentId } })}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </button>
        <h1 className="text-3xl font-bold">Créer une chambre</h1>
        {establishmentName && (
          <p className="text-gray-600 mt-2">
            Établissement : <span className="font-semibold">{establishmentName}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {uploadProgress && (
        <div className="card mb-6 bg-blue-50 border border-blue-200">
          <p className="text-blue-700">{uploadProgress}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Informations de base */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Informations de base</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de chambre <span className="text-red-600">*</span>
              </label>
              <input
                {...register('room_number')}
                type="text"
                className="input-field"
                placeholder="Ex: 101, A1, Suite Deluxe"
              />
              {errors.room_number && (
                <p className="mt-1 text-sm text-red-600">{errors.room_number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de chambre <span className="text-red-600">*</span>
              </label>
              <select {...register('room_type')} className="input-field">
                <option value="">Sélectionnez un type...</option>
                <option value="single">Simple</option>
                <option value="double">Double</option>
                <option value="twin">Jumelles</option>
                <option value="suite">Suite</option>
                <option value="apartment">Appartement</option>
                <option value="family">Familiale</option>
                <option value="dormitory">Dortoir</option>
              </select>
              {errors.room_type && (
                <p className="mt-1 text-sm text-red-600">{errors.room_type.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la chambre (optionnel)
            </label>
            <input
              {...register('name')}
              type="text"
              className="input-field"
              placeholder="Ex: Suite Deluxe, Chambre avec vue mer"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-field"
              placeholder="Décrivez la chambre..."
            />
          </div>
        </div>

        {/* Capacité et caractéristiques */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Capacité et caractéristiques</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité maximale <span className="text-red-600">*</span>
              </label>
              <input
                {...register('max_guests', { valueAsNumber: true })}
                type="number"
                min="1"
                className="input-field"
                placeholder="2"
              />
              {errors.max_guests && (
                <p className="mt-1 text-sm text-red-600">{errors.max_guests.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de lits
              </label>
              <input
                {...register('beds', { valueAsNumber: true })}
                type="number"
                min="0"
                className="input-field"
                placeholder="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de lit
              </label>
              <select {...register('bed_type')} className="input-field">
                <option value="">Sélectionnez...</option>
                <option value="single">Simple</option>
                <option value="double">Double</option>
                <option value="queen">Queen</option>
                <option value="king">King</option>
              </select>
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
                placeholder="20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Étage
            </label>
            <input
              {...register('floor', { valueAsNumber: true })}
              type="number"
              min="0"
              className="input-field"
              placeholder="1"
            />
          </div>
        </div>

        {/* Tarification */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Tarification</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix par nuit <span className="text-red-600">*</span>
              </label>
              <input
                {...register('base_price_per_night', { valueAsNumber: true })}
                type="number"
                min="1"
                step="0.01"
                className="input-field"
                placeholder="25000"
              />
              {errors.base_price_per_night && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.base_price_per_night.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Devise
              </label>
              <select {...register('currency')} className="input-field">
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Équipements</h2>
          <AmenitiesSelector
            selectedAmenities={selectedAmenities}
            onAmenitiesChange={setSelectedAmenities}
          />
        </div>

        {/* Photos */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Photos</h2>
          <ImageUploader
            images={selectedImages}
            onImagesChange={setSelectedImages}
            maxImages={10}
            bucket="listing-images"
          />
        </div>

        {/* Notes */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Notes</h2>
          <textarea
            {...register('notes')}
            rows={4}
            className="input-field"
            placeholder="Notes internes (non visibles par les clients)..."
          />
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/hotellerie/chambres', { state: { establishmentId } })}
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
            <span>{loading ? 'Création...' : 'Créer la chambre'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
