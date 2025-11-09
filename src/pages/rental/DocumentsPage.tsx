import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Search, Filter, Download, Trash2, Eye, Share2, Home, User,
  File, FileCheck, FileClock, FileImage, FileCode, AlertCircle,
  Folder, Grid3x3, List, Calendar, HardDrive, Cloud, CheckCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getAllDocuments,
  deleteDocument,
  formatFileSize,
  getDocumentTypeLabel,
  getDocumentDownloadUrl,
} from '@/services/rental/rentalDocumentService'
import type { RentalDocument } from '@/types/rental'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const { user, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState<RentalDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<RentalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(filterParam || 'all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion/documents' } })
      return
    }

    if (user) {
      fetchDocuments()
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchQuery, typeFilter])

  const fetchDocuments = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const data = await getAllDocuments()
      setDocuments(data)
    } catch (err: any) {
      console.error('Error fetching documents:', err)
      setError('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = [...documents]

    if (typeFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.document_type === typeFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          getDocumentTypeLabel(doc.document_type).toLowerCase().includes(query)
      )
    }

    setFilteredDocuments(filtered)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.'
      )
    ) {
      return
    }

    const loadingToast = toast.loading('Suppression en cours...')
    try {
      await deleteDocument(id)
      toast.success('Document supprimé', { id: loadingToast })
      fetchDocuments()
    } catch (err: any) {
      console.error('Error deleting document:', err)
      toast.error('Erreur lors de la suppression', { id: loadingToast })
    }
  }

  const handleDownload = (document: RentalDocument) => {
    const url = getDocumentDownloadUrl(document)
    window.open(url, '_blank')
    toast.success('Téléchargement démarré')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getDocumentIcon = (type: string) => {
    const icons = {
      contract: FileCheck,
      entry_inventory: FileClock,
      exit_inventory: FileClock,
      tenant_id: User,
      receipt: FileText,
      invoice: FileText,
      correspondence: File,
      other: FileCode,
    }
    return icons[type as keyof typeof icons] || File
  }

  const getTotalSize = () => {
    return documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0)
  }

  const stats = {
    total: documents.length,
    contracts: documents.filter(d => d.document_type === 'contract').length,
    receipts: documents.filter(d => d.document_type === 'receipt').length,
    totalSize: getTotalSize(),
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Chargement des documents...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const documentTypes: RentalDocument['document_type'][] = [
    'contract',
    'entry_inventory',
    'exit_inventory',
    'tenant_id',
    'receipt',
    'invoice',
    'correspondence',
    'other',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Blobs animés en arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-indigo-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 23, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 27, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <Folder className="text-indigo-600" size={40} />
                Documents
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 text-lg"
              >
                Gérez tous vos documents de gestion locative
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/gestion/documents/nouveau')}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
            >
              <Upload size={24} />
              <span>Uploader un document</span>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card mb-6 bg-red-50 border-2 border-red-200 p-4"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-600" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Total documents', value: stats.total, icon: FileText, gradient: 'from-indigo-500 to-indigo-600' },
            { title: 'Contrats', value: stats.contracts, icon: FileCheck, gradient: 'from-blue-500 to-blue-600' },
            { title: 'Reçus', value: stats.receipts, icon: FileText, gradient: 'from-green-500 to-green-600' },
            { title: 'Stockage', value: formatFileSize(stats.totalSize), icon: HardDrive, gradient: 'from-purple-500 to-purple-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              className={`card bg-gradient-to-br ${stat.gradient} text-white overflow-hidden relative`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon size={40} className="opacity-20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 text-lg"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input-field pl-12 appearance-none"
                >
                  <option value="all">Tous les types</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid3x3 size={20} className={viewMode === 'grid' ? 'text-indigo-600' : 'text-gray-400'} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List size={20} className={viewMode === 'list' ? 'text-indigo-600' : 'text-gray-400'} />
                </motion.button>
              </div>
            </div>
          </div>
          {filteredDocuments.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredDocuments.length} document(s) trouvé(s)
            </div>
          )}
        </motion.div>

        {/* Liste des documents */}
        <AnimatePresence mode="wait">
          {filteredDocuments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Folder size={80} className="mx-auto text-gray-300 mb-4" />
              </motion.div>
              {documents.length === 0 ? (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucun document</p>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Commencez par uploader votre premier document
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/gestion/documents/nouveau')}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg"
                  >
                    <Upload size={24} />
                    <span>Uploader mon premier document</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <p className="text-2xl text-gray-700 font-bold mb-2">Aucun résultat</p>
                  <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
            >
              {filteredDocuments.map((document, index) => {
                const DocIcon = getDocumentIcon(document.document_type)
                
                return (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    className="card overflow-hidden group"
                  >
                    <div className={viewMode === 'grid' ? 'text-center' : 'flex items-start gap-4'}>
                      <div className={`${viewMode === 'grid' ? 'mx-auto mb-4' : 'flex-shrink-0'} w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg`}>
                        <DocIcon className="text-white" size={32} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg truncate group-hover:text-indigo-600 transition-colors">
                            {document.name}
                          </h3>
                          <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium whitespace-nowrap">
                            {getDocumentTypeLabel(document.document_type)}
                          </span>
                        </div>
                        
                        {document.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{document.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <HardDrive size={14} />
                            <span>{formatFileSize(document.file_size || 0)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(document.created_at)}</span>
                          </div>
                          {document.managed_property_id && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 text-blue-600">
                                <Home size={14} />
                                <span>Bien</span>
                              </div>
                            </>
                          )}
                          {document.tenant_id && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 text-green-600">
                                <User size={14} />
                                <span>Locataire</span>
                              </div>
                            </>
                          )}
                          {document.shared_with_tenant && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 text-purple-600">
                                <Share2 size={14} />
                                <span>Partagé</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownload(document)}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                          >
                            <Download size={18} />
                            <span>Télécharger</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDownload(document)}
                            className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="Voir"
                          >
                            <Eye size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(document.id)}
                            className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
