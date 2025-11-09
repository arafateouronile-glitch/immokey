import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Edit,
  Bed,
  Save,
  X,
  Users,
  Square,
  DollarSign,
  Tag,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getRoom, updateRoom, deleteRoom } from '@/services/hospitality/roomService'
import { getGalleryImageUrl } from '@/utils/imageOptimizer'
import type { HospitalityRoom } from '@/types/hospitality'
import AmenitiesSelector from '@/components/forms/AmenitiesSelector'

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [room, setRoom] = useState<HospitalityRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: '',
    name: '',
    description: '',
    max_guests: 2,
    beds: 0 as number | '',
    bed_type: '',
    surface_area: 0 as number | '',
    floor: 0 as number | '',
    base_price_per_night: 0,
    currency: 'FCFA',
    notes: '',
  })
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  useEffect(() => {
    const stateEstablishmentId = (location.state as any)?.establishmentId
    if (stateEstablishmentId) {
      setEstablishmentId(stateEstablishmentId)
    }

    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: `/hotellerie/chambres/${id}` } })
      return
    }

    if (id && user) {
      fetchRoom()
    }
  }, [id, user, authLoading, navigate, location])

  const fetchRoom = async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const data = await getRoom(id)
      setRoom(data)
      setEstablishmentId(data.establishment_id)
      setFormData({
        room_number: data.room_number,
        room_type: data.room_type,
        name: data.name || '',
        description: data.description || '',
        max_guests: data.max_guests,
        beds: data.beds || '',
        bed_type: data.bed_type || '',
        surface_area: data.surface_area || '',
        floor: data.floor || '',
        base_price_per_night: data.base_price_per_night,
        currency: data.currency,
        notes: data.notes || '',
      })
      setSelectedAmenities(data.amenities || [])
    } catch (err: any) {
      console.error('Error fetching room:', err)
      setError('Erreur lors du chargement de la chambre')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id || !room) return

    setSaving(true)
    setError(null)

    try {
      const updates = {
        room_number: formData.room_number,
        room_type: formData.room_type as any,
        name: formData.name || undefined,
        description: formData.description || undefined,
        max_guests: formData.max_guests,
        beds: formData.beds && typeof formData.beds === 'number' ? formData.beds : undefined,
        bed_type: (formData.bed_type || undefined) as any,
        surface_area:
          formData.surface_area && typeof formData.surface_area === 'number'
            ? formData.surface_area
            : undefined,
        floor:
          formData.floor && typeof formData.floor === 'number' ? formData.floor : undefined,
        base_price_per_night: formData.base_price_per_night,
        currency: formData.currency,
        amenities: selectedAmenities,
        notes: formData.notes || undefined,
      }

      const updated = await updateRoom(id, updates)
      setRoom(updated)
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error updating room:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!room) return
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      name: room.name || '',
      description: room.description || '',
      max_guests: room.max_guests,
      beds: room.beds || '',
      bed_type: room.bed_type || '',
      surface_area: room.surface_area || '',
      floor: room.floor || '',
      base_price_per_night: room.base_price_per_night,
      currency: room.currency,
      notes: room.notes || '',
    })
    setSelectedAmenities(room.amenities || [])
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!id) return

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      return
    }

    try {
      await deleteRoom(id)
      navigate('/hotellerie/chambres', {
        state: { establishmentId },
      })
    } catch (err: any) {
      console.error('Error deleting room:', err)
      setError('Erreur lors de la suppression')
    }
  }

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: 'Simple',
      double: 'Double',
      twin: 'Jumelles',
      suite: 'Suite',
      apartment: 'Appartement',
      family: 'Familiale',
      dormitory: 'Dortoir',
    }
    return labels[type] || type
  }

  const getBedTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: 'Simple',
      double: 'Double',
      queen: 'Queen',
      king: 'King',
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Disponible',
      maintenance: 'Maintenance',
      inactive: 'Inactive',
    }
    return labels[status] || status
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

  if (error && !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/hotellerie/chambres', { state: { establishmentId } })}
            className="btn-secondary mt-4"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  if (!room) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/hotellerie/chambres', { state: { establishmentId } })}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">
                {isEditing
                  ? 'Modifier la chambre'
                  : room.name || `Chambre ${room.room_number}`}
              </h1>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  room.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : room.status === 'maintenance'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {getStatusLabel(room.status)}
              </span>
            </div>
            <p className="text-gray-600">#{room.room_number}</p>
          </div>

          {!isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="btn-secondary flex items-center space-x-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={20} />
                <span>Supprimer</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Edit size={20} />
                <span>Modifier</span>
              </button>
            </div>
          )}

          {isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="btn-secondary flex items-center space-x-2"
              >
                <X size={20} />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Photo principale */}
      {room.photo_urls && room.photo_urls.length > 0 && (
        <div className="card mb-6 p-0 overflow-hidden">
          <img
            src={getGalleryImageUrl(room.photo_urls[0], 'large')}
            alt={room.name || room.room_number}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de base */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Bed size={24} className="mr-2 text-primary-600" />
              Informations de base
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de chambre <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.room_number}
                      onChange={(e) =>
                        setFormData({ ...formData, room_number: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.room_type}
                      onChange={(e) =>
                        setFormData({ ...formData, room_type: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="single">Simple</option>
                      <option value="double">Double</option>
                      <option value="twin">Jumelles</option>
                      <option value="suite">Suite</option>
                      <option value="apartment">Appartement</option>
                      <option value="family">Familiale</option>
                      <option value="dormitory">Dortoir</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom (optionnel)
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
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={6}
                    className="input-field"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Type de chambre</p>
                  <p className="font-semibold">{getRoomTypeLabel(room.room_type)}</p>
                </div>

                {room.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{room.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Capacité et caractéristiques */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Users size={24} className="mr-2 text-primary-600" />
              Capacité et caractéristiques
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacité maximale <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_guests}
                      onChange={(e) =>
                        setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de lits
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.beds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          beds: e.target.value === '' ? '' : parseInt(e.target.value) || 0,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de lit
                    </label>
                    <select
                      value={formData.bed_type}
                      onChange={(e) =>
                        setFormData({ ...formData, bed_type: e.target.value })
                      }
                      className="input-field"
                    >
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
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.surface_area}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          surface_area:
                            e.target.value === ''
                              ? ''
                              : parseFloat(e.target.value) || 0,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        floor: e.target.value === '' ? '' : parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Capacité</p>
                  <p className="font-semibold text-lg flex items-center">
                    <Users size={20} className="mr-1" />
                    {room.max_guests} personne(s)
                  </p>
                </div>
                {room.beds && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lits</p>
                    <p className="font-semibold text-lg">{room.beds}</p>
                  </div>
                )}
                {room.bed_type && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type de lit</p>
                    <p className="font-semibold">{getBedTypeLabel(room.bed_type)}</p>
                  </div>
                )}
                {room.surface_area && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Surface</p>
                    <p className="font-semibold text-lg flex items-center">
                      <Square size={20} className="mr-1" />
                      {room.surface_area} m²
                    </p>
                  </div>
                )}
                {room.floor !== undefined && room.floor !== null && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Étage</p>
                    <p className="font-semibold text-lg">{room.floor}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tarification */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <DollarSign size={24} className="mr-2 text-primary-600" />
              Tarification
            </h2>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix par nuit <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.base_price_per_night}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_price_per_night: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-1">Prix par nuit</p>
                <p className="font-semibold text-2xl text-primary-600">
                  {new Intl.NumberFormat('fr-FR').format(room.base_price_per_night)}{' '}
                  {room.currency}
                </p>
              </div>
            )}
          </div>

          {/* Équipements */}
          {(!isEditing && room.amenities && room.amenities.length > 0) || isEditing ? (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Tag size={24} className="mr-2 text-primary-600" />
                Équipements
              </h2>

              {isEditing ? (
                <AmenitiesSelector
                  selectedAmenities={selectedAmenities}
                  onAmenitiesChange={setSelectedAmenities}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Notes */}
          {isEditing && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Notes internes</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={6}
                className="input-field"
                placeholder="Notes internes (non visibles par les clients)..."
              />
            </div>
          )}

          {!isEditing && room.notes && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Notes internes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{room.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statut */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Statut</h2>
            <span
              className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                room.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : room.status === 'maintenance'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {getStatusLabel(room.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Galerie de photos */}
      {room.photo_urls && room.photo_urls.length > 1 && (
        <div className="card mt-6">
          <h2 className="text-2xl font-bold mb-4">Galerie de photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {room.photo_urls.map((url, index) => (
              <img
                key={index}
                src={getGalleryImageUrl(url, 'medium')}
                alt={`${room.name || room.room_number} - Photo ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  // TODO: Ouvrir une lightbox
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}





