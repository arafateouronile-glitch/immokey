export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-neutral-600 font-medium">Chargement...</p>
      </div>
    </div>
  )
}

