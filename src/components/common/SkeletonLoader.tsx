import { memo } from 'react'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

function SkeletonLoader({ className = '', variant = 'rectangular' }: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200'
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}

/**
 * Composant pour afficher un skeleton de carte d'annonce
 */
export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <SkeletonLoader className="w-full h-48 mb-4" variant="rectangular" />
      <div className="p-4 space-y-3">
        <SkeletonLoader className="h-6 w-3/4" variant="text" />
        <SkeletonLoader className="h-4 w-1/2" variant="text" />
        <div className="flex gap-4 mt-4">
          <SkeletonLoader className="h-4 w-20" variant="text" />
          <SkeletonLoader className="h-4 w-20" variant="text" />
          <SkeletonLoader className="h-4 w-20" variant="text" />
        </div>
        <SkeletonLoader className="h-6 w-24 mt-4" variant="text" />
      </div>
    </div>
  )
}

export default memo(SkeletonLoader)






