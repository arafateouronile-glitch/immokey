import { useParams } from 'react-router-dom'
import { CheckCircle, Calendar, Bed, MapPin, Phone, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitality_bookings')
        .select(
          `
          *,
          hospitality_establishments(name, address, city, phone, email),
          hospitality_rooms(room_number, name, room_type)
        `
        )
        .eq('id', bookingId)
        .single()

      if (error) throw error
      setBooking(data)
    } catch (err) {
      console.error('Error fetching booking:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Réservation non trouvée</h1>
          <p className="text-neutral-600">Cette réservation n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    )
  }

  const establishment = booking.hospitality_establishments
  const room = booking.hospitality_rooms

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Réservation confirmée !</h1>
          <p className="text-neutral-600">
            Votre réservation a été enregistrée avec succès. Un email de confirmation vous a été envoyé.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Détails de la réservation</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Dates</p>
                  <p className="font-semibold">
                    {new Date(booking.check_in_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    au{' '}
                    {new Date(booking.check_out_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-neutral-500">{booking.nights} nuit(s)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Bed className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Chambre</p>
                  <p className="font-semibold">
                    {room?.name || `Chambre ${room?.room_number}`}
                  </p>
                  <p className="text-sm text-neutral-500">#{room?.room_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Établissement</p>
                  <p className="font-semibold">{establishment?.name}</p>
                  <p className="text-sm text-neutral-500">
                    {establishment?.address}, {establishment?.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Informations client</h3>
            <div className="space-y-2">
              <p>
                <span className="text-neutral-600">Nom:</span>{' '}
                <span className="font-semibold">{booking.guest_name}</span>
              </p>
              {booking.guest_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>{booking.guest_email}</span>
                </div>
              )}
              {booking.guest_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>{booking.guest_phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total à payer</span>
              <span className="text-2xl font-bold text-primary-600">
                {new Intl.NumberFormat('fr-FR').format(booking.total_amount || 0)}{' '}
                {booking.currency}
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Statut: <span className="font-medium">{booking.status}</span>
            </p>
          </div>

          {establishment?.phone && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Besoin d'aide ?</strong> Contactez-nous au {establishment.phone}
                {establishment.email && ` ou par email à ${establishment.email}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}







