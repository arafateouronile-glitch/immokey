import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createBooking } from '@/services/hospitality/bookingService'
import { getEstablishments } from '@/services/hospitality/establishmentService'
import { getRooms } from '@/services/hospitality/roomService'
import type { HospitalityEstablishment, HospitalityRoom } from '@/types/hospitality'

const bookingSchema = z.object({
  establishment_id: z.string().min(1, 'Établissement requis'),
  room_id: z.string().min(1, 'Chambre requise'),
  guest_name: z.string().min(2, 'Nom du client requis'),
  guest_email: z.string().email('Email invalide'),
  guest_phone: z.string().min(8, 'Téléphone requis'),
  guest_id_type: z.string().optional(),
  guest_id_number: z.string().optional(),
  guest_country: z.string().optional(),
  check_in_date: z.string().min(1, 'Date de check-in requise'),
  check_out_date: z.string().min(1, 'Date de check-out requise'),
  price_per_night: z.number().min(1, 'Prix par nuit requis'),
  taxes: z.number().min(0).optional().or(z.literal('')),
  fees: z.number().min(0).optional().or(z.literal('')),
  discount: z.number().min(0).optional().or(z.literal('')),
  payment_method: z.string().optional(),
  deposit_amount: z.number().min(0).optional().or(z.literal('')),
  guest_requests: z.string().optional(),
  internal_notes: z.string().optional(),
  booking_source: z.enum(['direct', 'booking.com', 'airbnb', 'phone', 'walk_in', 'other']).optional(),
}).refine((data) => {
  const checkIn = new Date(data.check_in_date)
  const checkOut = new Date(data.check_out_date)
  return checkOut > checkIn
}, {
  message: 'La date de check-out doit être après la date de check-in',
  path: ['check_out_date'],
})

type BookingForm = z.infer<typeof bookingSchema>

export default function CreateBookingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [establishments, setEstablishments] = useState<HospitalityEstablishment[]>([])
  const [rooms, setRooms] = useState<HospitalityRoom[]>([])
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<HospitalityRoom | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculatedNights, setCalculatedNights] = useState<number>(0)
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      booking_source: 'direct',
    },
  })

  const watchedCheckIn = watch('check_in_date')
  const watchedCheckOut = watch('check_out_date')
  const watchedPricePerNight = watch('price_per_night')
  const watchedTaxes = watch('taxes')
  const watchedFees = watch('fees')
  const watchedDiscount = watch('discount')

  useEffect(() => {
    const stateEstablishmentId = (location.state as any)?.establishmentId
    if (stateEstablishmentId) {
      setSelectedEstablishmentId(stateEstablishmentId)
      setValue('establishment_id', stateEstablishmentId)
    }

    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/hotellerie/reservations/nouvelle' } })
      return
    }

    if (user) {
      fetchEstablishments()
    }
  }, [user, authLoading, navigate, location, setValue])

  useEffect(() => {
    if (selectedEstablishmentId) {
      fetchRooms(selectedEstablishmentId)
    } else {
      setRooms([])
    }
  }, [selectedEstablishmentId])

  useEffect(() => {
    // Calculer le nombre de nuits et le total
    if (watchedCheckIn && watchedCheckOut) {
      const checkIn = new Date(watchedCheckIn)
      const checkOut = new Date(watchedCheckOut)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      setCalculatedNights(nights)

      const pricePerNight = watchedPricePerNight || 0
      const taxes = typeof watchedTaxes === 'number' ? watchedTaxes : 0
      const fees = typeof watchedFees === 'number' ? watchedFees : 0
      const discount = typeof watchedDiscount === 'number' ? watchedDiscount : 0

      const subtotal = pricePerNight * nights
      const total = subtotal + taxes + fees - discount
      setCalculatedTotal(total)
    }
  }, [watchedCheckIn, watchedCheckOut, watchedPricePerNight, watchedTaxes, watchedFees, watchedDiscount])

  useEffect(() => {
    // Mettre à jour le prix par nuit quand une chambre est sélectionnée
    if (selectedRoom) {
      setValue('price_per_night', selectedRoom.base_price_per_night)
    }
  }, [selectedRoom, setValue])

  const fetchEstablishments = async () => {
    try {
      const data = await getEstablishments()
      setEstablishments(data)
    } catch (err: any) {
      console.error('Error fetching establishments:', err)
    }
  }

  const fetchRooms = async (estId: string) => {
    try {
      const data = await getRooms(estId)
      setRooms(data.filter((r) => r.status === 'active'))
    } catch (err: any) {
      console.error('Error fetching rooms:', err)
      setError('Erreur lors du chargement des chambres')
    }
  }

  const handleEstablishmentChange = (establishmentId: string) => {
    setSelectedEstablishmentId(establishmentId)
    setValue('establishment_id', establishmentId)
    setValue('room_id', '')
    setSelectedRoom(null)
    setRooms([])
  }

  const handleRoomChange = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    setSelectedRoom(room || null)
    setValue('room_id', roomId)
    if (room) {
      setValue('price_per_night', room.base_price_per_night)
    }
  }

  const onSubmit = async (data: BookingForm) => {
    if (!user) {
      setError('Vous devez être connecté')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const bookingData = {
        ...data,
        taxes: typeof data.taxes === 'number' ? data.taxes : 0,
        fees: typeof data.fees === 'number' ? data.fees : 0,
        discount: typeof data.discount === 'number' ? data.discount : 0,
        deposit_amount: typeof data.deposit_amount === 'number' ? data.deposit_amount : 0,
        guest_id_type: data.guest_id_type || undefined,
        guest_id_number: data.guest_id_number || undefined,
        guest_country: data.guest_country || undefined,
        payment_method: data.payment_method || undefined,
        guest_requests: data.guest_requests || undefined,
        internal_notes: data.internal_notes || undefined,
        booking_source: data.booking_source || 'direct',
      }

      await createBooking(bookingData)
      navigate('/hotellerie/reservations')
    } catch (err: any) {
      console.error('Error creating booking:', err)
      setError(err.message || 'Erreur lors de la création de la réservation')
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/hotellerie/reservations')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </button>
        <h1 className="text-3xl font-bold">Nouvelle réservation</h1>
        <p className="text-gray-600 mt-2">Créez une nouvelle réservation</p>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Sélection établissement et chambre */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Établissement et chambre</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Établissement <span className="text-red-600">*</span>
              </label>
              <select
                {...register('establishment_id')}
                value={selectedEstablishmentId || ''}
                onChange={(e) => handleEstablishmentChange(e.target.value)}
                className="input-field"
              >
                <option value="">Sélectionnez un établissement...</option>
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name}
                  </option>
                ))}
              </select>
              {errors.establishment_id && (
                <p className="mt-1 text-sm text-red-600">{errors.establishment_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chambre <span className="text-red-600">*</span>
              </label>
              <select
                {...register('room_id')}
                value={selectedRoom?.id || ''}
                onChange={(e) => handleRoomChange(e.target.value)}
                disabled={!selectedEstablishmentId}
                className="input-field"
              >
                <option value="">
                  {selectedEstablishmentId
                    ? 'Sélectionnez une chambre...'
                    : 'Sélectionnez d\'abord un établissement'}
                </option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_number} - {room.name || `Chambre ${room.room_number}`} (
                    {room.base_price_per_night.toLocaleString('fr-FR')} FCFA/nuit)
                  </option>
                ))}
              </select>
              {errors.room_id && (
                <p className="mt-1 text-sm text-red-600">{errors.room_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informations du client */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Informations du client</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet <span className="text-red-600">*</span>
              </label>
              <input {...register('guest_name')} type="text" className="input-field" />
              {errors.guest_name && (
                <p className="mt-1 text-sm text-red-600">{errors.guest_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input {...register('guest_email')} type="email" className="input-field" />
              {errors.guest_email && (
                <p className="mt-1 text-sm text-red-600">{errors.guest_email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-600">*</span>
              </label>
              <input {...register('guest_phone')} type="tel" className="input-field" />
              {errors.guest_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.guest_phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de pièce d'identité
              </label>
              <select {...register('guest_id_type')} className="input-field">
                <option value="">Sélectionnez...</option>
                <option value="passeport">Passeport</option>
                <option value="cni">CNI</option>
                <option value="permis">Permis de conduire</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de pièce d'identité
              </label>
              <input {...register('guest_id_number')} type="text" className="input-field" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <input {...register('guest_country')} type="text" className="input-field" />
          </div>
        </div>

        {/* Dates de séjour */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Dates de séjour</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de check-in <span className="text-red-600">*</span>
              </label>
              <input {...register('check_in_date')} type="date" className="input-field" />
              {errors.check_in_date && (
                <p className="mt-1 text-sm text-red-600">{errors.check_in_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de check-out <span className="text-red-600">*</span>
              </label>
              <input {...register('check_out_date')} type="date" className="input-field" />
              {errors.check_out_date && (
                <p className="mt-1 text-sm text-red-600">{errors.check_out_date.message}</p>
              )}
            </div>
          </div>

          {calculatedNights > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-900">
                Durée du séjour : <strong>{calculatedNights} nuit(s)</strong>
              </p>
            </div>
          )}
        </div>

        {/* Tarification */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Tarification</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix par nuit <span className="text-red-600">*</span>
              </label>
              <input
                {...register('price_per_night', { valueAsNumber: true })}
                type="number"
                min="1"
                step="0.01"
                className="input-field"
              />
              {errors.price_per_night && (
                <p className="mt-1 text-sm text-red-600">{errors.price_per_night.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxes
              </label>
              <input
                {...register('taxes', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais</label>
              <input
                {...register('fees', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Réduction</label>
              <input
                {...register('discount', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          {calculatedTotal > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-900 font-semibold">Total :</span>
                <span className="text-2xl font-bold text-green-900">
                  {calculatedTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Paiement */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Paiement</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode de paiement
              </label>
              <select {...register('payment_method')} className="input-field">
                <option value="">Sélectionnez...</option>
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="bank_transfer">Virement</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acompte</label>
              <input
                {...register('deposit_amount', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Autres informations */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Autres informations</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source de réservation
            </label>
            <select {...register('booking_source')} className="input-field">
              <option value="direct">Direct</option>
              <option value="booking.com">Booking.com</option>
              <option value="airbnb">Airbnb</option>
              <option value="phone">Téléphone</option>
              <option value="walk_in">Walk-in</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demandes spéciales du client
            </label>
            <textarea
              {...register('guest_requests')}
              rows={3}
              className="input-field"
              placeholder="Demandes ou remarques du client..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes internes
            </label>
            <textarea
              {...register('internal_notes')}
              rows={3}
              className="input-field"
              placeholder="Notes internes (non visibles par le client)..."
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/hotellerie/reservations')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
            <Save size={20} />
            <span>{loading ? 'Création...' : 'Créer la réservation'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}






