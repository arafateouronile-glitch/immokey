import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createEstablishment, updateEstablishment, getEstablishment } from '@/services/hospitality/establishmentService'
import AmenitiesSelector from '@/components/forms/AmenitiesSelector'
import MapSelector from '@/components/maps/MapSelector'
import ImageUploader from '@/components/forms/ImageUploader'
import { uploadEstablishmentImages } from '@/services/hospitality/establishmentImageService'

const establishmentSchema = z.object({
  establishment_type: z.enum(['hotel', 'auberge', 'apparthotel', 'residence', 'gite', 'autre']),
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  city: z.string().min(1, 'La ville est requise'),
  neighborhood: z.string().optional(),
  phone: z.string().min(8, 'Le numéro de téléphone est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  registration_number: z.string().optional(),
  license_number: z.string().optional(),
  tax_id: z.string().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

type EstablishmentForm = z.infer<typeof establishmentSchema>

export default function CreateEstablishmentPage() {
  const navigate = useNavigate()
  const { id: establishmentId } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(Boolean(establishmentId))
  const [error, setError] = useState<string | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const isEditMode = Boolean(establishmentId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<EstablishmentForm>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: {
      check_in_time: '14:00:00',
      check_out_time: '12:00:00',
    },
  })

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      const redirectPath = isEditMode
        ? `/hotellerie/etablissements/modifier/${establishmentId}`
        : '/hotellerie/etablissements/nouveau'
      navigate('/connexion', { state: { from: redirectPath } })
      return
    }

    if (isEditMode && establishmentId) {
      loadEstablishment(establishmentId)
    } else {
      setInitialLoading(false)
    }
  }, [user, authLoading, navigate, isEditMode, establishmentId, loadEstablishment])

  const loadEstablishment = useCallback(async (id: string) => {
    try {
      setInitialLoading(true)
      const data = await getEstablishment(id)

      reset({
        establishment_type: data.establishment_type as any,
        name: data.name,
        description: data.description || '',
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood || '',
        phone: data.phone,
        email: data.email || '',
        website: data.website || '',
        registration_number: data.registration_number || '',
        license_number: data.license_number || '',
        tax_id: data.tax_id || '',
        check_in_time: data.check_in_time || '14:00:00',
        check_out_time: data.check_out_time || '12:00:00',
        notes: data.notes || '',
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      })

      setSelectedAmenities(Array.isArray(data.amenities) ? data.amenities : [])
      setLatitude(data.latitude || undefined)
      setLongitude(data.longitude || undefined)
      setSelectedImages(Array.isArray(data.photo_urls) ? data.photo_urls : [])
      setExistingCoverUrl(data.cover_image_url || null)
    } catch (error) {
      console.error('Error loading establishment:', error)
      setError('Impossible de charger l\'établissement')
      setInitialLoading(false)
      navigate('/hotellerie/etablissements')
      return
    }
    setInitialLoading(false)
  }, [reset, navigate])

  const onSubmit = async (data: EstablishmentForm) => {
    if (!user) {
      setError('Vous devez être connecté')
      return
    }

    setSubmitting(true)
    setError(null)
    setUploadProgress('')

    try {
      setUploadProgress(isEditMode ? 'Mise à jour de l\'établissement...' : 'Création de l\'établissement...')

      const payload = {
        ...data,
        latitude,
        longitude,
        amenities: selectedAmenities,
        email: data.email || undefined,
        website: data.website || undefined,
        registration_number: data.registration_number || undefined,
        license_number: data.license_number || undefined,
        tax_id: data.tax_id || undefined,
        check_in_time: data.check_in_time || '14:00:00',
        check_out_time: data.check_out_time || '12:00:00',
        neighborhood: data.neighborhood || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
      }

      let targetId = establishmentId || ''

      if (isEditMode && establishmentId) {
        await updateEstablishment(establishmentId, payload as any)
        targetId = establishmentId
      } else {
        const created = await createEstablishment(payload)
        targetId = created.id
      }

      let coverUrl = existingCoverUrl || undefined

      if (coverImageFile) {
        setUploadProgress('Upload de la photo de couverture...')
        const coverUpload = await uploadEstablishmentImages([coverImageFile], targetId)
        if (coverUpload.length > 0) {
          coverUrl = coverUpload[0]
        }
      }

      const galleryUrls = Array.from(new Set(selectedImages.filter(Boolean)))

      const photoUpdates: Record<string, any> = {
        photo_urls: galleryUrls,
      }

      if (coverUrl) {
        photoUpdates.cover_image_url = coverUrl
      }

      await updateEstablishment(targetId, photoUpdates)

      setUploadProgress('Terminé !')
      
      // Rediriger vers la page de détails
      navigate(`/hotellerie/etablissements/${targetId}`)
    } catch (err: any) {
      console.error('Error saving establishment:', err)
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'établissement')
    } finally {
      setSubmitting(false)
      setUploadProgress('')
    }
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  if (authLoading || initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/hotellerie/etablissements')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Modifier l\'établissement' : 'Créer un établissement'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode
            ? 'Mettez à jour les informations de votre établissement'
            : 'Ajoutez un nouvel établissement d\'hébergement à votre gestion'}
        </p>
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
        {/* Type d'établissement */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Type d'établissement</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-600">*</span>
            </label>
            <select {...register('establishment_type')} className="input-field">
              <option value="">Sélectionnez un type...</option>
              <option value="hotel">Hôtel</option>
              <option value="auberge">Auberge</option>
              <option value="apparthotel">Apparthôtel</option>
              <option value="residence">Résidence</option>
              <option value="gite">Gîte</option>
              <option value="autre">Autre</option>
            </select>
            {errors.establishment_type && (
              <p className="mt-1 text-sm text-red-600">{errors.establishment_type.message}</p>
            )}
          </div>
        </div>

        {/* Informations générales */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Informations générales</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'établissement <span className="text-red-600">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="input-field"
              placeholder="Ex: Hôtel du Lac"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-field"
              placeholder="Décrivez votre établissement..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville <span className="text-red-600">*</span>
              </label>
              <input
                {...register('city')}
                type="text"
                className="input-field"
                placeholder="Lomé"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quartier
              </label>
              <input
                {...register('neighborhood')}
                type="text"
                className="input-field"
                placeholder="Tokoin"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse complète <span className="text-red-600">*</span>
            </label>
            <input
              {...register('address')}
              type="text"
              className="input-field"
              placeholder="123 Avenue de la République"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Informations de contact</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone <span className="text-red-600">*</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="input-field"
              placeholder="+228 90 12 34 56"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="contact@hotel.tg"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                {...register('website')}
                type="url"
                className="input-field"
                placeholder="https://www.hotel.tg"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informations administratives */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Informations administratives</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro d'enregistrement
              </label>
              <input
                {...register('registration_number')}
                type="text"
                className="input-field"
                placeholder="RG-2025-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de licence
              </label>
              <input
                {...register('license_number')}
                type="text"
                className="input-field"
                placeholder="LIC-2025-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro fiscal
              </label>
              <input
                {...register('tax_id')}
                type="text"
                className="input-field"
                placeholder="NIF-2025-001"
              />
            </div>
          </div>
        </div>

        {/* Horaires */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Horaires</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in
              </label>
              <input
                {...register('check_in_time')}
                type="time"
                className="input-field"
                defaultValue="14:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out
              </label>
              <input
                {...register('check_out_time')}
                type="time"
                className="input-field"
                defaultValue="12:00"
              />
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Équipements et services</h2>
          <AmenitiesSelector
            selectedAmenities={selectedAmenities}
            onAmenitiesChange={setSelectedAmenities}
          />
        </div>

        {/* Localisation */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Localisation</h2>
          <MapSelector
            latitude={latitude}
            longitude={longitude}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Photos */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Photos</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo de couverture
            </label>
            {existingCoverUrl && !coverImageFile && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Photo actuelle</p>
                <img
                  src={existingCoverUrl}
                  alt="Photo de couverture actuelle"
                  className="h-40 w-full object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setCoverImageFile(file)
                } else {
                  setCoverImageFile(null)
                }
              }}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Galerie de photos
            </label>
            <ImageUploader
              images={selectedImages}
              onImagesChange={setSelectedImages}
              maxImages={20}
              bucket="listing-images"
            />
          </div>
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
            onClick={() => navigate('/hotellerie/etablissements')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={20} />
            <span>
              {submitting
                ? isEditMode
                  ? 'Mise à jour...'
                  : 'Création...'
                : isEditMode
                  ? 'Mettre à jour l\'établissement'
                  : 'Créer l\'établissement'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
