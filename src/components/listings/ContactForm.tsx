import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createInquiry } from '@/services/inquiryService'
import { analyzeError, getUserFriendlyMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'

const messageSchema = z.object({
  message: z.string().min(20, 'Votre message doit contenir au moins 20 caractères'),
})

type MessageForm = z.infer<typeof messageSchema>

interface ContactFormProps {
  listingId: string
  listingTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ContactForm({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onSuccess,
}: ContactFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
  })

  const onSubmit = async (data: MessageForm) => {
    setLoading(true)
    setError(null)

    try {
      await createInquiry({
        listing_id: listingId,
        message: data.message,
      })

      toast.success('Message envoyé avec succès !')
      setSuccess(true)
      reset()

      // Fermer après 2 secondes
      setTimeout(() => {
        setSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err: any) {
      const appError = analyzeError(err)
      const errorMessage = getUserFriendlyMessage(appError)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Contacter le propriétaire</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600">
              Vous contactez le propriétaire de l'annonce :
            </p>
            <p className="font-semibold text-gray-900 mt-1">{listingTitle}</p>
          </div>

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p>Votre message a été envoyé avec succès !</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre message <span className="text-red-600">*</span>
              </label>
              <textarea
                {...register('message')}
                rows={6}
                className="input-field w-full"
                placeholder="Bonjour, je suis intéressé(e) par votre annonce. Pouvez-vous me donner plus d'informations ?"
                disabled={loading || success}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 20 caractères. Incluez vos questions ou votre demande de visite.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading || success}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Envoyer le message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
