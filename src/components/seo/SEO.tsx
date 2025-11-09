import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article'
}

export default function SEO({
  title = 'ImmoKey - Location & Vente Immobilière au Togo',
  description = 'Plateforme digitale immobilière pour trouver votre logement idéal au Togo. Location, vente, gestion hôtelière.',
  image = '/og-image.jpg',
  type = 'website'
}: SEOProps) {
  const location = useLocation()
  const url = `https://immokey.io${location.pathname}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  )
}

