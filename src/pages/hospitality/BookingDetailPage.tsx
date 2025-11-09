import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, CheckCircle, XCircle, Calendar, DollarSign, User, Building2, Phone, Mail, FileText, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getBooking, updateBooking, checkInBooking, checkOutBooking, cancelBooking } from '@/services/hospitality/bookingService'
import type { HospitalityBooking } from '@/types/hospitality'

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [booking, setBooking] = useState<HospitalityBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editData, setEditData] = useState<Partial<HospitalityBooking>>({})

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: `/hotellerie/reservations/${id}` } })
      return
    }

    if (id && user) {
      fetchBooking()
    }
  }, [id, user, authLoading, navigate])

  const fetchBooking = async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const data = await getBooking(id)
      setBooking(data)
      setEditData(data)
    } catch (err: any) {
      console.error('Error fetching booking:', err)
      setError('Erreur lors du chargement de la réservation')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!id || !booking) return

    setSaving(true)
    setError(null)
    try {
      const updated = await updateBooking(id, editData)
      setBooking(updated)
      setShowEditForm(false)
    } catch (err: any) {
      console.error('Error updating booking:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleCheckIn = async () => {
    if (!id || !confirm('Confirmer le check-in pour cette réservation ?')) return

    setSaving(true)
    try {
      await checkInBooking(id)
      await fetchBooking()
    } catch (err: any) {
      console.error('Error checking in:', err)
      setError(err.message || 'Erreur lors du check-in')
    } finally {
      setSaving(false)
    }
  }

  const handleCheckOut = async () => {
    if (!id || !confirm('Confirmer le check-out pour cette réservation ?')) return

    setSaving(true)
    try {
      await checkOutBooking(id)
      await fetchBooking()
    } catch (err: any) {
      console.error('Error checking out:', err)
      setError(err.message || 'Erreur lors du check-out')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!id) return

    const reason = prompt('Raison de l\'annulation (optionnel) :')
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return

    setSaving(true)
    try {
      await cancelBooking(id, reason || undefined)
      await fetchBooking()
    } catch (err: any) {
      console.error('Error cancelling booking:', err)
      setError(err.message || 'Erreur lors de l\'annulation')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!id) return

    setSaving(true)
    try {
      await updateBooking(id, { status: status as any })
      await fetchBooking()
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err.message || 'Erreur lors de la mise à jour du statut')
    } finally {
      setSaving(false)
    }
  }

  const handlePaymentStatusChange = async (paymentStatus: string) => {
    if (!id) return

    setSaving(true)
    try {
      await updateBooking(id, { payment_status: paymentStatus as any })
      await fetchBooking()
    } catch (err: any) {
      console.error('Error updating payment status:', err)
      setError(err.message || 'Erreur lors de la mise à jour du statut de paiement')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number, currency: string = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      checked_in: 'En séjour',
      checked_out: 'Terminée',
      cancelled: 'Annulée',
      no_show: 'No-show',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      checked_in: 'bg-green-100 text-green-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      partial: 'Partiel',
      paid: 'Payé',
      refunded: 'Remboursé',
    }
    return labels[status] || status
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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

  if (!user || !booking) {
    return null
  }

  const canCheckIn = booking.status === 'confirmed' || booking.status === 'pending'
  const canCheckOut = booking.status === 'checked_in'
  const canCancel = booking.status !== 'checked_out' && booking.status !== 'cancelled'

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/hotellerie/reservations')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              Réservation {booking.booking_reference}
            </h1>
            <p className="text-gray-600 mt-2">
              Créée le {formatDate(booking.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
              {getPaymentStatusLabel(booking.payment_status)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle size={20} />
              <span>Check-in</span>
            </button>
          )}
          {canCheckOut && (
            <button
              onClick={handleCheckOut}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle size={20} />
              <span>Check-out</span>
            </button>
          )}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={saving}
              className="btn-secondary flex items-center space-x-2 text-red-600 hover:bg-red-50"
            >
              <XCircle size={20} />
              <span>Annuler</span>
            </button>
          )}
          <button
            onClick={() => {
              setShowEditForm(!showEditForm)
              if (!showEditForm) {
                setEditData(booking)
              }
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit size={20} />
            <span>{showEditForm ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de séjour */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Calendar className="text-primary-600 mr-2" size={24} />
              Dates de séjour
            </h2>
            {showEditForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={editData.check_in_date ? editData.check_in_date.split('T')[0] : ''}
                      onChange={(e) =>
                        setEditData({ ...editData, check_in_date: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={editData.check_out_date ? editData.check_out_date.split('T')[0] : ''}
                      onChange={(e) =>
                        setEditData({ ...editData, check_out_date: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save size={20} />
                    <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date d'arrivée</p>
                  <p className="font-bold text-lg">{formatDate(booking.check_in_date)}</p>
                  {booking.checked_in_at && (
                    <p className="text-sm text-green-600 mt-1">
                      Effectué le {formatDateTime(booking.checked_in_at)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date de départ</p>
                  <p className="font-bold text-lg">{formatDate(booking.check_out_date)}</p>
                  {booking.checked_out_at && (
                    <p className="text-sm text-green-600 mt-1">
                      Effectué le {formatDateTime(booking.checked_out_at)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Durée</p>
                  <p className="font-bold text-lg">{booking.nights} nuit(s)</p>
                </div>
              </div>
            )}
          </div>

          {/* Informations client */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <User className="text-primary-600 mr-2" size={24} />
              Informations client
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                <p className="font-semibold text-lg">{booking.guest_name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <Mail size={16} className="mr-1" />
                    Email
                  </p>
                  <p className="font-semibold">{booking.guest_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <Phone size={16} className="mr-1" />
                    Téléphone
                  </p>
                  <p className="font-semibold">{booking.guest_phone}</p>
                </div>
              </div>
              {booking.guest_country && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pays</p>
                  <p className="font-semibold">{booking.guest_country}</p>
                </div>
              )}
              {(booking.guest_id_type || booking.guest_id_number) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.guest_id_type && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Type de pièce</p>
                      <p className="font-semibold">{booking.guest_id_type}</p>
                    </div>
                  )}
                  {booking.guest_id_number && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Numéro</p>
                      <p className="font-semibold">{booking.guest_id_number}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chambre et établissement */}
          {booking.room && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Building2 className="text-primary-600 mr-2" size={24} />
                Chambre
              </h2>
              <div className="space-y-2">
                <p className="font-semibold">
                  {(booking.room as any).room_number} - {(booking.room as any).name || `Chambre ${(booking.room as any).room_number}`}
                </p>
                {(booking.room as any).room_type && (
                  <p className="text-gray-600">
                    Type: {(booking.room as any).room_type}
                  </p>
                )}
                {(booking.establishment as any) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Établissement</p>
                    <p className="font-semibold">{(booking.establishment as any).name}</p>
                    <p className="text-sm text-gray-600">
                      {(booking.establishment as any).address}, {(booking.establishment as any).city}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Demandes et notes */}
          {(booking.guest_requests || booking.internal_notes) && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FileText className="text-primary-600 mr-2" size={24} />
                Notes
              </h2>
              <div className="space-y-4">
                {booking.guest_requests && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Demandes spéciales du client</p>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded">{booking.guest_requests}</p>
                  </div>
                )}
                {booking.internal_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Notes internes</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{booking.internal_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {booking.cancelled_at && booking.cancellation_reason && (
            <div className="card bg-red-50 border border-red-200">
              <h2 className="text-2xl font-bold mb-4 text-red-900">Annulation</h2>
              <div>
                <p className="text-sm text-red-700 mb-1">
                  Annulée le {formatDateTime(booking.cancelled_at)}
                </p>
                <p className="text-red-900">{booking.cancellation_reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Tarification */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <DollarSign className="text-primary-600 mr-2" size={24} />
              Tarification
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Prix par nuit</span>
                <span className="font-semibold">
                  {formatPrice(booking.price_per_night, booking.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre de nuits</span>
                <span className="font-semibold">{booking.nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">
                  {formatPrice(booking.subtotal, booking.currency)}
                </span>
              </div>
              {booking.taxes > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-semibold">
                    {formatPrice(booking.taxes, booking.currency)}
                  </span>
                </div>
              )}
              {booking.fees > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais</span>
                  <span className="font-semibold">
                    {formatPrice(booking.fees, booking.currency)}
                  </span>
                </div>
              )}
              {booking.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Réduction</span>
                  <span className="font-semibold">
                    -{formatPrice(booking.discount, booking.currency)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-xl text-primary-600">
                    {formatPrice(booking.total_amount, booking.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Paiement</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de paiement
                </label>
                <select
                  value={booking.payment_status}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  disabled={saving}
                  className="input-field"
                >
                  <option value="pending">En attente</option>
                  <option value="partial">Partiel</option>
                  <option value="paid">Payé</option>
                  <option value="refunded">Remboursé</option>
                </select>
              </div>
              {booking.payment_method && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mode de paiement</p>
                  <p className="font-semibold capitalize">{booking.payment_method}</p>
                </div>
              )}
              {booking.deposit_amount > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Acompte</p>
                  <p className="font-semibold">
                    {formatPrice(booking.deposit_amount, booking.currency)}
                  </p>
                  {booking.deposit_paid_at && (
                    <p className="text-xs text-gray-500">
                      Payé le {formatDate(booking.deposit_paid_at)}
                    </p>
                  )}
                </div>
              )}
              {booking.balance_paid_at && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Solde payé</p>
                  <p className="text-xs text-gray-500">
                    Le {formatDate(booking.balance_paid_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Statut</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de réservation
              </label>
              <select
                value={booking.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={saving}
                className="input-field"
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="checked_in">En séjour</option>
                <option value="checked_out">Terminée</option>
                <option value="cancelled">Annulée</option>
                <option value="no_show">No-show</option>
              </select>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Informations</h2>
            <div className="space-y-3 text-sm">
              {booking.booking_source && (
                <div>
                  <p className="text-gray-600">Source</p>
                  <p className="font-semibold capitalize">{booking.booking_source}</p>
                </div>
              )}
              {booking.confirmed_at && (
                <div>
                  <p className="text-gray-600">Confirmée le</p>
                  <p className="font-semibold">{formatDateTime(booking.confirmed_at)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Créée le</p>
                <p className="font-semibold">{formatDateTime(booking.created_at)}</p>
              </div>
              {booking.updated_at !== booking.created_at && (
                <div>
                  <p className="text-gray-600">Modifiée le</p>
                  <p className="font-semibold">{formatDateTime(booking.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
