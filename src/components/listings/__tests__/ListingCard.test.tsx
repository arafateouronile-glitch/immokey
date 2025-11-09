import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ListingCard from '../ListingCard'
import type { Listing } from '@/types'

// Mock FavoriteButton
vi.mock('../FavoriteButton', () => ({
  default: () => <button data-testid="favorite-button">Favorite</button>,
}))

// Mock LazyImage
vi.mock('@/components/common/LazyImage', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="lazy-image" />
  ),
}))

// Mock getListingCardImageUrl
vi.mock('@/utils/imageOptimizer', () => ({
  getListingCardImageUrl: (url: string) => url,
}))

const mockListing: Listing = {
  id: '1',
  user_id: 'user-1',
  title: 'Appartement moderne à Lomé',
  description: 'Superbe appartement',
  type: 'location',
  property_type: 'appartement',
  city: 'Lomé',
  neighborhood: 'Centre',
  address: '123 Rue Test',
  price: 150000,
  rooms: 3,
  bathrooms: 2,
  surface_area: 80,
  available: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  images: [
    {
      id: 'img-1',
      listing_id: '1',
      url: 'https://example.com/image.jpg',
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
}

const renderListingCard = (listing: Listing) => {
  return render(
    <BrowserRouter>
      <ListingCard listing={listing} />
    </BrowserRouter>
  )
}

describe('ListingCard', () => {
  it('should render listing title', () => {
    renderListingCard(mockListing)
    
    expect(screen.getByText('Appartement moderne à Lomé')).toBeInTheDocument()
  })

  it('should render listing price', () => {
    renderListingCard(mockListing)
    
    expect(screen.getByText(/150\s*000.*FCFA/)).toBeInTheDocument()
  })

  it('should render location information', () => {
    renderListingCard(mockListing)
    
    expect(screen.getByText(/Centre.*Lomé/)).toBeInTheDocument()
  })

  it('should render property details', () => {
    renderListingCard(mockListing)
    
    expect(screen.getByText('3')).toBeInTheDocument() // rooms
    expect(screen.getByText('2')).toBeInTheDocument() // bathrooms
    expect(screen.getByText('80 m²')).toBeInTheDocument() // surface
  })

  it('should render favorite button', () => {
    renderListingCard(mockListing)
    
    expect(screen.getByTestId('favorite-button')).toBeInTheDocument()
  })

  it('should render listing image when available', () => {
    renderListingCard(mockListing)
    
    const image = screen.getByTestId('lazy-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'Appartement moderne à Lomé')
  })

  it('should render placeholder when no image', () => {
    const listingWithoutImage = {
      ...mockListing,
      images: [],
    }

    renderListingCard(listingWithoutImage)
    
    expect(screen.getByText('Aucune image')).toBeInTheDocument()
  })

  it('should render location badge for location type', () => {
    renderListingCard(mockListing)
    
    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('should render sale badge for sale type', () => {
    const saleListing = {
      ...mockListing,
      type: 'vente' as const,
    }

    renderListingCard(saleListing)
    
    expect(screen.getByText('Vente')).toBeInTheDocument()
  })

  it('should link to listing detail page', () => {
    renderListingCard(mockListing)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/annonce/1')
  })

  it('should format price with French locale', () => {
    const expensiveListing = {
      ...mockListing,
      price: 1500000,
    }

    renderListingCard(expensiveListing)
    
    // Should format as 1 500 000 FCFA
    expect(screen.getByText(/1\s*500\s*000.*FCFA/)).toBeInTheDocument()
  })

  it('should display monthly rent indicator for location', () => {
    renderListingCard(mockListing)
    
    expect(screen.getByText('/ mois')).toBeInTheDocument()
  })
})







