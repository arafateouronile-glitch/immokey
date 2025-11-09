import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`User response to the install prompt: ${outcome}`)
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-xl border border-neutral-200 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Download className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">
              Installer ImmoKey
            </h3>
            <p className="text-xs text-neutral-600 mb-3">
              Installez l'application pour un accès rapide et une meilleure expérience
            </p>
            <button
              onClick={handleInstall}
              className="w-full bg-primary-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Installer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

