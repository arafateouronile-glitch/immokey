import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Home,
  User,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getConversationMessages,
  sendMessage,
} from '@/services/rental/rentalMessageService'
import { getTenant } from '@/services/rental/tenantService'
import { getManagedProperty } from '@/services/rental/managedPropertyService'
import type { RentalMessage } from '@/types/rental'

export default function ConversationPage() {
  const { propertyId, tenantId } = useParams<{ propertyId: string; tenantId: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<RentalMessage[]>([])
  const [property, setProperty] = useState<any>(null)
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: `/gestion/messages/${propertyId}/${tenantId}` } })
      return
    }

    if (propertyId && tenantId && user) {
      fetchData()
      
      // Rafraîchir les messages toutes les 5 secondes
      const interval = setInterval(() => {
        fetchMessages()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [propertyId, tenantId, user, authLoading, navigate])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchData = async () => {
    if (!propertyId || !tenantId) return

    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchMessages(),
        fetchProperty(),
        fetchTenant(),
      ])
    } catch (err: any) {
      console.error('Error fetching conversation data:', err)
      setError('Erreur lors du chargement de la conversation')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!propertyId || !tenantId) return

    try {
      const data = await getConversationMessages(propertyId, tenantId)
      setMessages(data)
    } catch (err: any) {
      console.error('Error fetching messages:', err)
    }
  }

  const fetchProperty = async () => {
    if (!propertyId) return

    try {
      const data = await getManagedProperty(propertyId)
      setProperty(data)
    } catch (err: any) {
      console.error('Error fetching property:', err)
    }
  }

  const fetchTenant = async () => {
    if (!tenantId) return

    try {
      const data = await getTenant(tenantId)
      setTenant(data)
    } catch (err: any) {
      console.error('Error fetching tenant:', err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !propertyId || !tenantId || sending) return

    setSending(true)
    setError(null)

    try {
      await sendMessage(propertyId, tenantId, newMessage)
      setNewMessage('')
      await fetchMessages()
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message || 'Erreur lors de l\'envoi du message')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString()

    if (isToday) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    }
    if (isYesterday) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    }
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isOwnMessage = (message: RentalMessage) => {
    return message.sender_id === user?.id
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

  if (!user || !propertyId || !tenantId) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/gestion/messages')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <MessageCircle className="text-primary-600 mr-2" size={24} />
              Conversation
            </h1>
            {property && tenant && (
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <Home size={16} className="mr-1" />
                  {property.name}
                </span>
                <span className="flex items-center">
                  <User size={16} className="mr-1" />
                  {tenant.full_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-4 bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="card p-0 overflow-hidden">
        <div
          ref={messagesContainerRef}
          className="h-[calc(100vh-400px)] min-h-[500px] overflow-y-auto p-6 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Aucun message pour le moment</p>
                <p className="text-gray-500 text-sm mt-2">
                  Commencez la conversation en envoyant un message
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const own = isOwnMessage(message)
              const showDate =
                index === 0 ||
                new Date(message.created_at).toDateString() !==
                  new Date(messages[index - 1].created_at).toDateString()

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(message.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${own ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        own
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block text-xs underline ${
                                own ? 'text-primary-100' : 'text-primary-600'
                              }`}
                            >
                              Pièce jointe {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          own ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {formatDate(message.created_at)}
                        {message.read && own && (
                          <span className="ml-2">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulaire d'envoi */}
        <form onSubmit={handleSendMessage} className="border-t p-4 bg-gray-50">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Tapez votre message..."
                rows={1}
                className="input-field resize-none"
                disabled={sending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
              </p>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              <span>{sending ? 'Envoi...' : 'Envoyer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
