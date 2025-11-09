import { useParams } from 'react-router-dom'
import { Hotel, Calendar, Users } from 'lucide-react'

export default function PublicBookingPage() {
  const { slugOrId } = useParams()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white p-6">
            <div className="flex items-center space-x-3">
              <Hotel className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Réserver une chambre</h1>
                <p className="text-primary-100">Établissement: {slugOrId}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dates du séjour
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Arrivée"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Départ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre de personnes
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Cette page de réservation publique est en cours de développement. 
                  La fonctionnalité complète sera bientôt disponible.
                </p>
              </div>

              <button
                disabled
                className="w-full px-6 py-3 bg-neutral-400 text-white rounded-lg font-medium cursor-not-allowed"
              >
                Réserver (bientôt disponible)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
