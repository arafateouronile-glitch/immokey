import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet par défaut
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapSelectorProps {
  latitude?: number
  longitude?: number
  onLocationSelect: (lat: number, lng: number) => void
  height?: string
}

// Composant interne pour gérer les clics sur la carte
function LocationMarker({
  position,
  onLocationSelect,
}: {
  position: [number, number] | null
  onLocationSelect: (lat: number, lng: number) => void
}) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
      map.setView([lat, lng], map.getZoom())
    },
  })

  return position ? <Marker position={position} /> : null
}

export default function MapSelector({
  latitude,
  longitude,
  onLocationSelect,
  height = '400px',
}: MapSelectorProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  )
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    // Charger les styles Leaflet
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Demander la géolocalisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: userLat, longitude: userLng } = pos.coords
          setUserLocation([userLat, userLng])
          
          // Si aucune position n'est définie, utiliser la position de l'utilisateur
          if (!position && !latitude && !longitude) {
            setPosition([userLat, userLng])
            onLocationSelect(userLat, userLng)
          }
        },
        (err) => {
          console.warn('Erreur géolocalisation:', err)
          // Position par défaut : Lomé, Togo
          if (!position && !latitude && !longitude) {
            const defaultPos: [number, number] = [6.1725, 1.2314]
            setPosition(defaultPos)
            onLocationSelect(defaultPos[0], defaultPos[1])
          }
        }
      )
    } else {
      // Position par défaut : Lomé, Togo
      if (!position && !latitude && !longitude) {
        const defaultPos: [number, number] = [6.1725, 1.2314]
        setPosition(defaultPos)
        onLocationSelect(defaultPos[0], defaultPos[1])
      }
    }

    return () => {
      const existingLink = document.querySelector(
        'link[href*="leaflet@1.9.4/dist/leaflet.css"]'
      )
      if (existingLink) {
        document.head.removeChild(existingLink)
      }
    }
  }, [])

  // Mettre à jour la position si latitude/longitude changent depuis l'extérieur
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }

  // Déterminer le centre initial de la carte
  const initialCenter: [number, number] =
    position || userLocation || [6.1725, 1.2314] // Lomé, Togo par défaut

  return (
    <div>
      <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
        <MapContainer
          center={initialCenter}
          zoom={position ? 15 : 13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Cliquez sur la carte pour sélectionner l'emplacement exact de votre bien
      </p>
      {position && (
        <p className="mt-1 text-xs text-gray-500">
          Coordonnées : {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}
    </div>
  )
}
