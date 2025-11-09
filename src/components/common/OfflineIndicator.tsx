import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <WifiOff className="h-5 w-5" />
        <span className="text-sm font-medium">
          Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
        </span>
      </div>
    </div>
  )
}

