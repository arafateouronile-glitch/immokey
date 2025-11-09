import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Inbox, Send, Eye, EyeOff, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getReceivedInquiries, getSentInquiries, markInquiryAsRead } from '@/services/inquiryService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getUserFriendlyMessage, analyzeError } from '@/utils/errorHandler'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const queryClient = useQueryClient()

  // Récupérer les messages reçus
  const {
    data: receivedInquiries = [],
    isLoading: loadingReceived,
    error: errorReceived,
  } = useQuery({
    queryKey: ['inquiries', 'received'],
    queryFn: () => getReceivedInquiries(),
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  })

  // Récupérer les messages envoyés
  const {
    data: sentInquiries = [],
    isLoading: loadingSent,
    error: errorSent,
  } = useQuery({
    queryKey: ['inquiries', 'sent'],
    queryFn: () => getSentInquiries(),
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  })

  // Mutation pour marquer comme lu
  const markAsReadMutation = useMutation({
    mutationFn: (inquiryId: string) => markInquiryAsRead(inquiryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      toast.success('Message marqué comme lu')
    },
    onError: (error) => {
      const appError = analyzeError(error)
      toast.error(getUserFriendlyMessage(appError))
    },
  })

  // Compter les messages non lus
  const unreadCount = receivedInquiries.filter((inq) => !inq.read).length

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    navigate('/connexion', { state: { from: '/messages' } })
    return null
  }

  const currentInquiries = activeTab === 'received' ? receivedInquiries : sentInquiries
  const isLoading = activeTab === 'received' ? loadingReceived : loadingSent
  const error = activeTab === 'received' ? errorReceived : errorSent

  const handleMarkAsRead = (inquiry: any) => {
    if (!inquiry.read) {
      markAsReadMutation.mutate(inquiry.id)
    }
  }

  const handleViewListing = (listingId: string) => {
    navigate(`/annonce/${listingId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mes messages</h1>
        <p className="text-gray-600">Gérez vos conversations avec les propriétaires et les intéressés</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'received'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Inbox size={18} />
              <span>Reçus</span>
              {unreadCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sent'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Send size={18} />
              <span>Envoyés</span>
            </div>
          </button>
        </div>
      </div>

      {/* Messages List */}
      {error ? (
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-700">
            Erreur lors du chargement des messages :{' '}
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : currentInquiries.length === 0 ? (
        <div className="card text-center py-12">
          <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-600 mb-2">Aucun message</p>
          <p className="text-gray-500">
            {activeTab === 'received'
              ? 'Vous n\'avez pas encore reçu de messages'
              : 'Vous n\'avez pas encore envoyé de messages'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentInquiries.map((inquiry: any) => (
            <div
              key={inquiry.id}
              className={`card cursor-pointer hover:shadow-lg transition-shadow ${
                !inquiry.read && activeTab === 'received' ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => {
                handleMarkAsRead(inquiry)
                handleViewListing(inquiry.listing_id)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {!inquiry.read && activeTab === 'received' && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    )}
                    <h3 className="font-semibold text-lg">
                      {inquiry.listings?.title || 'Annonce'}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>
                      {activeTab === 'received'
                        ? `De : ${inquiry.from_user?.full_name || 'Inconnu'}`
                        : `À : ${inquiry.to_user?.full_name || 'Inconnu'}`}
                    </span>
                    <span>•</span>
                    <span>
                      {format(new Date(inquiry.created_at), 'd MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{inquiry.message}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewListing(inquiry.listing_id)
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <LinkIcon size={16} />
                    <span>Voir l'annonce</span>
                  </button>
                </div>

                {activeTab === 'received' && (
                  <div className="ml-4">
                    {inquiry.read ? (
                      <EyeOff size={20} className="text-gray-400" />
                    ) : (
                      <Eye size={20} className="text-primary-600" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
