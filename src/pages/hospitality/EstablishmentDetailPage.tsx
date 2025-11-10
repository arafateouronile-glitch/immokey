import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  BedDouble,
  Users,
  CalendarCheck,
  ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { getEstablishment, deleteEstablishment } from '@/services/hospitality/establishmentService'
import { getRooms } from '@/services/hospitality/roomService'
import { getBookings, getBookingsStats } from '@/services/hospitality/bookingService'
import { getGalleryImageUrl } from '@/utils/imageOptimizer'
import type { HospitalityEstablishment, HospitalityRoom, HospitalityBooking } from '@/types/hospitality'

export default function EstablishmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [establishment, setEstablishment] = useState<HospitalityEstablishment | null>(null)
  const [rooms, setRooms] = useState<HospitalityRoom[]>([])
  const [bookings, setBookings] = useState<HospitalityBooking[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    checked_in: 0,
    checked_out: 0,
    cancelled: 0,
    arriving_today: 0,
    departing_today: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/hotellerie/etablissements')
      return
    }

    loadEstablishment()
  }, [id])

  const loadEstablishment = async () => {
    try {
      setLoading(true)
      const data = await getEstablishment(id!)
      setEstablishment(data)
      loadComplementaryData(id!)
    } catch (error) {
      toast.error('Impossible de charger l\'établissement')
      navigate('/hotellerie/etablissements')
    } finally {
      setLoading(false)
    }
  }

  const loadComplementaryData = async (establishmentId: string) => {
    setLoadingRooms(true)
    setLoadingBookings(true)

    try {
      const [roomsData, bookingsData, statsData] = await Promise.allSettled([
        getRooms(establishmentId),
        getBookings({ establishment_id: establishmentId }),
        getBookingsStats(establishmentId),
      ])

      if (roomsData.status === 'fulfilled') {
        setRooms(roomsData.value)
      } else {
        console.warn('Rooms loading error', roomsData.reason)
      }

      if (bookingsData.status === 'fulfilled') {
        setBookings(bookingsData.value)
      } else {
        console.warn('Bookings loading error', bookingsData.reason)
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
      } else {
        console.warn('Stats loading error', statsData.reason)
      }
    } catch (error) {
      console.error('Error loading complementary data', error)
    } finally {
      setLoadingRooms(false)
      setLoadingBookings(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) return

    try {
      await deleteEstablishment(id!)
      toast.success('Établissement supprimé avec succès')
      navigate('/hotellerie/etablissements')
    } catch (error) {
      toast.error('Impossible de supprimer l\'établissement')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!establishment) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <p className="text-center text-neutral-500">Établissement non trouvé</p>
      </div>
    )
  }

  const galleryImages =
    Array.isArray(establishment.photo_urls) && establishment.photo_urls.length > 0
      ? establishment.photo_urls
      : establishment.cover_image_url
        ? [establishment.cover_image_url]
        : []

  const heroImage = galleryImages[0]
  const otherImages = galleryImages.slice(1, 5)

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/hotellerie/etablissements"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux établissements
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{establishment.name}</h1>
            <div className="flex items-center text-neutral-600 space-x-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{establishment.address}, {establishment.city}</span>
              </div>
              {establishment.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  <span className="text-sm">{establishment.phone}</span>
                </div>
              )}
              {establishment.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  <span className="text-sm">{establishment.email}</span>
                </div>
              )}
              {establishment.website && (
                <a
                  href={establishment.website.startsWith('http') ? establishment.website : `https://${establishment.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Site web
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/hotellerie/etablissements/modifier/${id}`}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      {heroImage ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          <motion.div
            className="relative overflow-hidden rounded-2xl lg:col-span-2 h-72 md:h-96"
            whileHover={{ scale: 1.01 }}
          >
            <img
              src={getGalleryImageUrl(heroImage, 'large')}
              alt={establishment.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs uppercase tracking-wide">
              Photo principale
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {otherImages.length === 0 && (
              <div className="col-span-2 h-full rounded-2xl bg-neutral-100 border border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-500">
                <ImageIcon className="h-10 w-10 mb-3" />
                <p className="text-sm text-center px-4">
                  Ajoutez d'autres photos pour enrichir la fiche de l'établissement
                </p>
              </div>
            )}
            {otherImages.map((img, index) => (
              <motion.div
                key={img + index}
                className="overflow-hidden rounded-2xl h-32 md:h-40"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={getGalleryImageUrl(img, 'medium')}
                  alt={`${establishment.name} - ${index + 2}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
            {galleryImages.length > 4 && (
              <div className="col-span-2 h-32 md:h-40 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex flex-col items-center justify-center">
                <p className="text-lg font-semibold">+{galleryImages.length - 4} photos</p>
                <p className="text-sm text-white/80">Ajoutez une galerie dédiée au public</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-100 p-8 text-center text-neutral-500">
          <ImageIcon className="h-10 w-10 mx-auto mb-3" />
          <p className="text-sm">Aucune photo n'est encore associée à cet établissement.</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
            <BedDouble className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Chambres</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {loadingRooms ? '...' : rooms.length}
            </p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Réservations actives</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {loadingBookings ? '...' : stats.confirmed + stats.checked_in}
            </p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Arrivées aujourd'hui</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {loadingBookings ? '...' : stats.arriving_today}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Informations</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Type</dt>
                <dd className="mt-1 text-sm text-neutral-900 capitalize">
                  {establishment.establishment_type?.replace('-', ' ') || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Email</dt>
                <dd className="mt-1 text-sm text-neutral-900">{establishment.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Site web</dt>
                <dd className="mt-1 text-sm text-neutral-900">
                  {establishment.website ? (
                    <a
                      href={establishment.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {establishment.website}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Actif</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      establishment.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {establishment.is_active ? 'Oui' : 'Non'}
                  </span>
                </dd>
              </div>
            </dl>

            {establishment.description && (
              <div className="mt-6">
                <dt className="text-sm font-medium text-neutral-500 mb-2">Description</dt>
                <dd className="text-sm text-neutral-900">{establishment.description}</dd>
              </div>
            )}

            {Array.isArray(establishment.amenities) && establishment.amenities.length > 0 && (
              <div className="mt-6">
                <dt className="text-sm font-medium text-neutral-500 mb-2">Équipements</dt>
                <dd className="flex flex-wrap gap-2">
                  {establishment.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </div>

          {/* Chambres Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Chambres</h2>
              <Link
                to="/hotellerie/chambres/nouvelle"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une chambre
              </Link>
            </div>
            {loadingRooms ? (
              <div className="py-10 text-center text-neutral-500 text-sm">Chargement des chambres...</div>
            ) : rooms.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500 text-sm">
                Aucune chambre n'est encore associée à cet établissement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.slice(0, 4).map((room) => (
                  <motion.div
                    key={room.id}
                    className="rounded-xl border border-neutral-200 p-4 hover:border-primary-200 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {room.name || `Chambre ${room.room_number}`}
                        </p>
                        <p className="text-xs text-neutral-500 capitalize">{room.room_type}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          room.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : room.status === 'maintenance'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {room.status === 'active' ? 'Disponible' : room.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>{room.max_guests} pers.</span>
                      <span>{new Intl.NumberFormat('fr-FR').format(room.base_price_per_night || 0)} FCFA / nuit</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {rooms.length > 4 && (
              <Link
                to={`/hotellerie/chambres?establishment=${id}`}
                className="block mt-4 text-sm text-primary-600 hover:text-primary-700"
              >
                Voir toutes les chambres →
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Chambres</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loadingRooms ? '...' : rooms.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Réservations actives</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loadingBookings ? '...' : stats.confirmed + stats.checked_in}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Taux d'occupation</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loadingBookings || loadingRooms || rooms.length === 0
                    ? '...'
                    : `${Math.round(((stats.confirmed + stats.checked_in) / rooms.length) * 100)}%`}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Revenus (30j)</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loadingBookings
                    ? '...'
                    : `${new Intl.NumberFormat('fr-FR').format(stats.revenue || 0)} FCFA`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <Link
                to={`/hotellerie/chambres?establishment=${id}`}
                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg"
              >
                Voir les chambres
              </Link>
              <Link
                to={`/hotellerie/reservations?establishment=${id}`}
                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg"
              >
                Voir les réservations
              </Link>
              <Link
                to={`/reservation/${establishment.slug || id}`}
                target="_blank"
                className="block w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                Page de réservation publique →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
