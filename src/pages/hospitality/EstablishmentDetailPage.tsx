import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Building2, MapPin, Phone, Mail, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEstablishment, deleteEstablishment } from '@/services/hospitality/establishmentService'
import type { HospitalityEstablishment } from '@/types/hospitality'

export default function EstablishmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [establishment, setEstablishment] = useState<HospitalityEstablishment | null>(null)
  const [loading, setLoading] = useState(true)

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
    } catch (error) {
      toast.error('Impossible de charger l\'établissement')
      navigate('/hotellerie/etablissements')
    } finally {
      setLoading(false)
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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Informations</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Type</dt>
                <dd className="mt-1 text-sm text-neutral-900 capitalize">{establishment.type}</dd>
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
            <p className="text-neutral-600 text-sm">
              Gérez les chambres de cet établissement dans la section{' '}
              <Link to="/hotellerie/chambres" className="text-primary-600 hover:text-primary-700">
                Chambres
              </Link>
            </p>
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
                <p className="text-2xl font-bold text-neutral-900">-</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Réservations actives</p>
                <p className="text-2xl font-bold text-neutral-900">-</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Taux d'occupation</p>
                <p className="text-2xl font-bold text-neutral-900">-%</p>
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
