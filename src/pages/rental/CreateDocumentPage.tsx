import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Upload, X, FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { uploadDocument, formatFileSize } from '@/services/rental/rentalDocumentService'
import { getManagedProperties } from '@/services/rental/managedPropertyService'
import { getTenants } from '@/services/rental/tenantService'
import type { ManagedProperty, Tenant } from '@/types/rental'

const documentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  document_type: z.enum([
    'contract',
    'entry_inventory',
    'exit_inventory',
    'tenant_id',
    'receipt',
    'invoice',
    'correspondence',
    'other',
  ]),
  managed_property_id: z.string().optional(),
  tenant_id: z.string().optional(),
  description: z.string().optional(),
  shared_with_tenant: z.boolean().default(false),
})

type DocumentForm = z.infer<typeof documentSchema>

export default function CreateDocumentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyParam = searchParams.get('property')
  const tenantParam = searchParams.get('tenant')

  const { user, loading: authLoading } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      managed_property_id: propertyParam || undefined,
      tenant_id: tenantParam || undefined,
      shared_with_tenant: false,
    },
  })

  const watchedPropertyId = watch('managed_property_id')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion-locative/documents/nouveau' } })
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (watchedPropertyId) {
      fetchTenantsForProperty(watchedPropertyId)
    } else {
      setTenants([])
      setValue('tenant_id', undefined)
    }
  }, [watchedPropertyId, setValue])

  const fetchData = async () => {
    if (!user) return

    try {
      const propertiesData = await getManagedProperties()
      setProperties(propertiesData)
    } catch (err: any) {
      console.error('Error fetching data:', err)
    }
  }

  const fetchTenantsForProperty = async (propertyId: string) => {
    try {
      const allTenants = await getTenants()
      const propertyTenants = allTenants.filter((t) => t.managed_property_id === propertyId)
      setTenants(propertyTenants)
      
      if (tenantParam) {
        setValue('tenant_id', tenantParam)
      }
    } catch (err: any) {
      console.error('Error fetching tenants:', err)
      setTenants([])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10MB')
        return
      }

      // Vérifier le type (PDF, images, etc.)
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      
      if (!allowedTypes.includes(file.type)) {
        setError('Type de fichier non supporté. Utilisez PDF, images ou documents Word.')
        return
      }

      setSelectedFile(file)
      setError(null)
      
      // Pré-remplir le nom si vide
      const nameInput = document.getElementById('name') as HTMLInputElement
      if (!nameInput?.value) {
        setValue('name', file.name.split('.')[0])
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    const fileInput = document.getElementById('file') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const onSubmit = async (data: DocumentForm) => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setUploading(true)
    setError(null)

    try {
      await uploadDocument(selectedFile, {
        name: data.name,
        document_type: data.document_type,
        managed_property_id: data.managed_property_id || undefined,
        tenant_id: data.tenant_id || undefined,
        description: data.description || undefined,
        shared_with_tenant: data.shared_with_tenant,
      })

      // Rediriger vers la liste des documents ou le bien/locataire
      if (data.managed_property_id) {
        navigate(`/gestion-locative/biens/${data.managed_property_id}`)
      } else if (data.tenant_id) {
        navigate(`/gestion-locative/locataires/${data.tenant_id}`)
      } else {
        navigate('/gestion-locative/documents')
      }
    } catch (err: any) {
      console.error('Error uploading document:', err)
      setError(err.message || 'Erreur lors de l\'upload du document')
    } finally {
      setUploading(false)
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

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/gestion-locative/documents')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <h1 className="text-3xl font-bold flex items-center">
          <Upload className="text-primary-600 mr-3" size={32} />
          Uploader un document
        </h1>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Fichier */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Fichier</h2>
          
          {selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="text-primary-600" size={32} />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-2">
                  Cliquez pour sélectionner un fichier ou glissez-le ici
                </p>
                <p className="text-sm text-gray-500">
                  PDF, images ou documents Word (max 10MB)
                </p>
              </div>
              <input
                id="file"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </label>
          )}
        </div>

        {/* Informations */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Informations</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du document *
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="input-field"
                placeholder="Ex: Contrat de location - Appartement Tokoin"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document *
              </label>
              <select {...register('document_type')} className="input-field">
                <option value="contract">Contrat de location</option>
                <option value="entry_inventory">État des lieux d'entrée</option>
                <option value="exit_inventory">État des lieux de sortie</option>
                <option value="tenant_id">Pièce d'identité</option>
                <option value="receipt">Quittance de loyer</option>
                <option value="invoice">Facture</option>
                <option value="correspondence">Correspondance</option>
                <option value="other">Autre</option>
              </select>
              {errors.document_type && (
                <p className="mt-1 text-sm text-red-600">{errors.document_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bien (optionnel)
              </label>
              <select {...register('managed_property_id')} className="input-field">
                <option value="">Aucun bien spécifique</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </option>
                ))}
              </select>
            </div>

            {watchedPropertyId && tenants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locataire (optionnel)
                </label>
                <select {...register('tenant_id')} className="input-field">
                  <option value="">Aucun locataire spécifique</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input-field"
                placeholder="Ajoutez une description ou des notes..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="shared_with_tenant"
                {...register('shared_with_tenant')}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="shared_with_tenant" className="ml-2 text-sm text-gray-700">
                Partager avec le locataire
              </label>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/gestion-locative/documents')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Upload en cours...' : 'Uploader le document'}
          </button>
        </div>
      </form>
    </div>
  )
}
