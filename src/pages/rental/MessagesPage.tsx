import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, Home, User, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getConversations, getUnreadCount } from '@/services/rental/rentalMessageService'

export default function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyParam = searchParams.get('property')
  const tenantParam = searchParams.get('tenant')

  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [filteredConversations, setFilteredConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion-locative/messages' } })
      return
    }

    if (user) {
      fetchConversations()
      
      // Si des paramètres sont passés, ouvrir directement la conversation
      if (propertyParam && tenantParam) {
        navigate(`/gestion-locative/messages/${propertyParam}/${tenantParam}`)
      }
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    filterConversations()
  }, [conversations, searchQuery])

  // Rafraîchir périodiquement les messages non lus
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      try {
        const count = await getUnreadCount()
        setUnreadCount(count)
      } catch (err) {
        // Ignorer les erreurs silencieusement
      }
    }, 30000) // Toutes les 30 secondes

    return () => clearInterval(interval)
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const [conversationsData, unreadCountData] = await Promise.all([
        getConversations(),
        getUnreadCount(),
      ])
      setConversations(conversationsData)
      setUnreadCount(unreadCountData)
    } catch (err: any) {
      console.error('Error fetching conversations:', err)
      setError('Erreur lors du chargement des conversations')
    } finally {
      setLoading(false)
    }
  }

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = conversations.filter((conv) => {
      return (
        conv.property?.name?.toLowerCase().includes(query) ||
        conv.property?.address?.toLowerCase().includes(query) ||
        conv.tenant?.full_name?.toLowerCase().includes(query) ||
        conv.tenant?.email?.toLowerCase().includes(query) ||
        conv.last_message?.message?.toLowerCase().includes(query)
      )
    })
    setFilteredConversations(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
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

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MessageCircle className="text-primary-600 mr-3" size={32} />
              Messagerie
            </h1>
            <p className="text-gray-600 mt-2">
              Communiquez avec vos locataires ou propriétaires
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des conversations */}
        <div className="lg:col-span-1">
          <div className="card">
            {/* Recherche */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            {/* Liste */}
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {conversations.length === 0 ? (
                    <>
                      <MessageCircle size={48} className="mx-auto text-gray-300 mb-2" />
                      <p>Aucune conversation</p>
                    </>
                  ) : (
                    <p>Aucun résultat</p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={`${conversation.managed_property_id}-${conversation.tenant_id}`}
                    onClick={() =>
                      navigate(
                        `/gestion-locative/messages/${conversation.managed_property_id}/${conversation.tenant_id}`
                      )
                    }
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate flex items-center">
                          <Home size={14} className="mr-1 text-gray-400 flex-shrink-0" />
                          {conversation.property?.name || 'Bien'}
                        </p>
                        <p className="text-xs text-gray-500 truncate flex items-center mt-0.5">
                          <User size={12} className="mr-1 text-gray-400 flex-shrink-0" />
                          {conversation.tenant?.full_name || 'Locataire'}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <>
                        <p className="text-xs text-gray-600 truncate mt-2">
                          {truncateMessage(conversation.last_message.message)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(conversation.last_message.created_at)}
                        </p>
                      </>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Zone de conversation (vide pour l'instant) */}
        <div className="lg:col-span-3">
          <div className="card h-full flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-600 mb-2">Sélectionnez une conversation</p>
              <p className="text-gray-500">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
