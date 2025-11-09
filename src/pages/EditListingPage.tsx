import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          Modifier l'annonce #{id}
        </h1>
        <p className="text-neutral-600">
          Cette page est en cours de développement. La fonctionnalité de modification des annonces sera bientôt disponible.
        </p>
      </div>
    </div>
  )
}
