import { memo } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Square } from 'lucide-react'
import { Listing } from '@/types'
import FavoriteButton from './FavoriteButton'
import { getListingCardImageUrl } from '@/utils/imageOptimizer'
import LazyImage from '@/components/common/LazyImage'

interface ListingCardProps {
  listing: Listing
}

function ListingCard({ listing }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  return (
    <Link to={`/annonce/${listing.id}`} className="card-hover overflow-hidden group">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            {listing.images && listing.images.length > 0 ? (
              <div className="relative h-48 sm:h-56 overflow-hidden rounded-xl sm:rounded-2xl">
                <LazyImage
                  src={getListingCardImageUrl(listing.images[0])}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ) : (
          <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-400 rounded-xl sm:rounded-2xl">
            Aucune image
          </div>
        )}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
          <FavoriteButton listingId={listing.id} />
        </div>
        {listing.type === 'location' && (
          <span className="absolute top-2 right-2 sm:top-4 sm:right-4 badge-primary backdrop-blur-md shadow-medium text-xs">
            Location
          </span>
        )}
        {listing.type === 'vente' && (
          <span className="absolute top-2 right-2 sm:top-4 sm:right-4 badge-success backdrop-blur-md shadow-medium text-xs">
            Vente
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300 leading-tight">
          {listing.title}
        </h3>
        <p className="text-neutral-500 text-xs sm:text-sm mb-3 sm:mb-4 flex items-center font-medium">
          <MapPin size={14} className="sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-primary-500 flex-shrink-0" />
          <span className="truncate">{listing.neighborhood}, {listing.city}</span>
        </p>
        <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-neutral-600 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-neutral-100">
          <span className="flex items-center font-medium">
            <Bed size={16} className="sm:w-[18px] sm:h-[18px] mr-1.5 sm:mr-2 text-primary-400 flex-shrink-0" />
            {listing.rooms}
          </span>
          <span className="flex items-center font-medium">
            <Bath size={16} className="sm:w-[18px] sm:h-[18px] mr-1.5 sm:mr-2 text-primary-400 flex-shrink-0" />
            {listing.bathrooms}
          </span>
          <span className="flex items-center font-medium">
            <Square size={16} className="sm:w-[18px] sm:h-[18px] mr-1.5 sm:mr-2 text-primary-400 flex-shrink-0" />
            {listing.surface_area} m²
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-primary-600 font-extrabold text-xl sm:text-2xl">
              {formatPrice(listing.price)} FCFA
            </div>
            {listing.type === 'location' && <span className="text-xs sm:text-sm text-neutral-500 font-medium">/ mois</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default memo(ListingCard)
