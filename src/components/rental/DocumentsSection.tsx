import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Share2,
  Plus,
} from 'lucide-react'
import {
  getPropertyDocuments,
  getTenantDocuments,
  deleteDocument,
  formatFileSize,
  getDocumentTypeLabel,
  getDocumentDownloadUrl,
} from '@/services/rental/rentalDocumentService'
import type { RentalDocument } from '@/types/rental'

interface DocumentsSectionProps {
  propertyId?: string
  tenantId?: string
  showUploadButton?: boolean
}

export default function DocumentsSection({
  propertyId,
  tenantId,
  showUploadButton = true,
}: DocumentsSectionProps) {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<RentalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [propertyId, tenantId])

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      let data: RentalDocument[] = []
      if (propertyId) {
        data = await getPropertyDocuments(propertyId)
      } else if (tenantId) {
        data = await getTenantDocuments(tenantId)
      }
      setDocuments(data)
    } catch (err: any) {
      console.error('Error fetching documents:', err)
      setError('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.'
      )
    ) {
      return
    }

    try {
      await deleteDocument(documentId)
      fetchDocuments()
    } catch (err: any) {
      console.error('Error deleting document:', err)
      alert('Erreur lors de la suppression du document')
    }
  }

  const handleDownload = (document: RentalDocument) => {
    const url = getDocumentDownloadUrl(document)
    window.open(url, '_blank')
  }

  const handleUpload = () => {
    const params = new URLSearchParams()
    if (propertyId) params.append('property', propertyId)
    if (tenantId) params.append('tenant', tenantId)
    navigate(`/gestion/documents/nouveau?${params.toString()}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="text-primary-600 mr-2" size={24} />
            Documents
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="text-primary-600 mr-2" size={24} />
          Documents {documents.length > 0 && `(${documents.length})`}
        </h2>
        {showUploadButton && (
          <button
            onClick={handleUpload}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus size={18} />
            <span>Ajouter</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 mb-2">Aucun document</p>
          {showUploadButton && (
            <button
              onClick={handleUpload}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Uploader le premier document
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <FileText className="text-primary-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium truncate">{document.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium flex-shrink-0">
                        {getDocumentTypeLabel(document.document_type)}
                      </span>
                      {document.shared_with_tenant && (
                        <span className="flex items-center text-green-600 text-xs flex-shrink-0">
                          <Share2 size={12} className="mr-1" />
                          Partagé
                        </span>
                      )}
                    </div>
                    {document.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {document.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{formatFileSize(document.file_size || 0)}</span>
                      <span>•</span>
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(document)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Voir/Télécharger"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(document)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download size={18} />
                  </button>
                  {showUploadButton && (
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
